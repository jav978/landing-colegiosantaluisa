import type { APIRoute } from 'astro';
import { getSessionToken, validateSession, updateUser, deleteUser, hashPassword } from '../../../lib/auth';

export const PUT: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const session = await validateSession(token);
  if (!session || session.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: any = {};

    if (body.nombre) updates.nombre = body.nombre;
    if (body.rol) updates.rol = body.rol;
    if (body.password) {
      updates.password_hash = await hashPassword(body.password);
    }

    await updateUser(id, updates);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const session = await validateSession(token);
  if (!session || session.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  if (id === session.user_id) {
    return new Response(JSON.stringify({ error: 'No puedes eliminarte a ti mismo' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await deleteUser(id);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
