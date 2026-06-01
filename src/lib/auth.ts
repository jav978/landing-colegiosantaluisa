import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from './db';

const SESSION_DURATION_HOURS = 24;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export type Usuario = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
};

export async function findUserByEmail(email: string): Promise<Usuario | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('id, email, nombre, rol')
    .eq('email', email.toLowerCase().trim())
    .single();

  return data || null;
}

export async function findUserWithPassword(email: string) {
  const { data } = await supabase
    .from('usuarios')
    .select('id, email, password_hash, nombre, rol')
    .eq('email', email.toLowerCase().trim())
    .single();

  return data || null;
}

export async function createUser(
  email: string,
  password: string,
  nombre: string,
  rol: string = 'editor'
): Promise<Usuario> {
  const hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: hash,
      nombre,
      rol,
    })
    .select('id, email, nombre, rol')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('El email ya está registrado');
    throw error;
  }

  return data;
}

export async function createSession(
  userId: number,
  ipAddress: string,
  userAgent: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const { error } = await supabase.from('sesiones').insert({
    user_id: userId,
    token,
    ip_address: ipAddress,
    user_agent: userAgent,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;
  return token;
}

export async function validateSession(token: string): Promise<{
  id: number;
  user_id: number;
  email: string;
  nombre: string;
  rol: string;
} | null> {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('sesiones')
    .select(`
      id, user_id,
      usuarios!inner ( email, nombre, rol )
    `)
    .eq('token', token)
    .is('deleted_at', null)
    .gt('expires_at', now)
    .single();

  if (!data) return null;

  await supabase
    .from('sesiones')
    .update({ last_active: now })
    .eq('id', data.id);

  return {
    id: data.id,
    user_id: data.user_id,
    email: data.usuarios.email,
    nombre: data.usuarios.nombre,
    rol: data.usuarios.rol,
  };
}

export async function destroySession(token: string): Promise<void> {
  await supabase
    .from('sesiones')
    .update({ deleted_at: new Date().toISOString() })
    .eq('token', token);
}

export async function destroySessionById(sessionId: number): Promise<void> {
  await supabase
    .from('sesiones')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function getActiveSessions(userId?: number) {
  const now = new Date().toISOString();

  let query = supabase
    .from('sesiones')
    .select(`
      id, user_id, ip_address, user_agent, created_at, last_active, expires_at,
      usuarios ( email, nombre )
    `)
    .is('deleted_at', null)
    .gt('expires_at', now)
    .order('last_active', { ascending: false });

  if (userId !== undefined) {
    query = query.eq('user_id', userId);
  }

  const { data } = await query;
  return data || [];
}

export async function listUsers() {
  const { data } = await supabase
    .from('usuarios')
    .select('id, email, nombre, rol, created_at')
    .order('created_at', { ascending: false });

  return data || [];
}

export async function updateUser(id: number, updates: Partial<{ nombre: string; rol: string; password_hash: string }>) {
  const { error } = await supabase.from('usuarios').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteUser(id: number): Promise<void> {
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) throw error;
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;

  const match = cookie.match(/session_token=([^;]+)/);
  return match ? match[1] : null;
}
