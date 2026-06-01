import type { APIRoute } from 'astro';
import { getSessionToken, destroySession } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const token = getSessionToken(request);
  if (token) {
    await destroySession(token);
  }

  cookies.delete('session_token', { path: '/' });

  const accept = request.headers.get('accept') || '';
  if (accept.includes('application/json')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return redirect('/admin/login', 302);
};
