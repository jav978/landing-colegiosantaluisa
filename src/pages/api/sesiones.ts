import type { APIRoute } from 'astro';
import { getSessionToken, validateSession, getActiveSessions } from '../../lib/auth';

export const GET: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const session = await validateSession(token);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Sesión inválida' }), { status: 401 });
  }

  if (session.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'No tienes permisos' }), { status: 403 });
  }

  const sesiones = await getActiveSessions();
  return new Response(JSON.stringify(sesiones), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
