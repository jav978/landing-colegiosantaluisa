import type { APIRoute } from 'astro';
import { getSessionToken, validateSession, destroySessionById } from '../../../lib/auth';

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

  await destroySessionById(id);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
