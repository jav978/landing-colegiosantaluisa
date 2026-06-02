import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../lib/auth';
import { supabase } from '../../../lib/db';

export const PUT: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) {
      if (!body.title) return new Response(JSON.stringify({ error: 'Título requerido' }), { status: 400 });
      updates.title = body.title;
    }
    if (body.content !== undefined) {
      if (!body.content) return new Response(JSON.stringify({ error: 'Contenido requerido' }), { status: 400 });
      updates.content = body.content;
    }
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
    if (body.image_url !== undefined) {
      if (!body.image_url) return new Response(JSON.stringify({ error: 'La imagen destacada es requerida' }), { status: 400 });
      updates.image_url = body.image_url;
    }
    if (body.type !== undefined) updates.type = body.type;
    if (body.category !== undefined) updates.category = body.category;
    if (body.published !== undefined) updates.published = body.published;

    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al actualizar' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al eliminar' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
