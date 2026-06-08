import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../lib/auth';
import { supabase } from '../../../lib/db';

export const PUT: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: any = {};

    if (body.texto !== undefined) {
      if (!body.texto) return new Response(JSON.stringify({ error: 'Text required' }), { status: 400 });
      updates.texto = body.texto;
    }
    if (body.autor !== undefined) {
      if (!body.autor) return new Response(JSON.stringify({ error: 'Author required' }), { status: 400 });
      updates.autor = body.autor;
      
      // Update initials if the author name changes
      const initials = body.autor
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((namePart: string) => namePart.charAt(0).toUpperCase())
        .join('');
      updates.iniciales = initials || 'R';
    }
    if (body.rol !== undefined) {
      if (!body.rol) return new Response(JSON.stringify({ error: 'Role required' }), { status: 400 });
      updates.rol = body.rol;
    }
    if (body.image_url !== undefined) updates.image_url = body.image_url || null;
    if (body.orden !== undefined) updates.orden = Number(body.orden) || 0;
    if (body.published !== undefined) updates.published = body.published;

    const { error } = await supabase.from('testimonios').update(updates).eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error updating testimonial' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
  }

  const { error } = await supabase.from('testimonios').delete().eq('id', id);
  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error deleting testimonial' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
