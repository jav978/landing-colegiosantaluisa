import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../../lib/auth';
import { supabase } from '../../../../lib/db';

export const PUT: APIRoute = async ({ request, params }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) {
      if (!body.title) {
        return new Response(JSON.stringify({ error: 'El título es un campo obligatorio.' }), { status: 400 });
      }
      updates.title = body.title;
    }
    if (body.description !== undefined) {
      updates.description = body.description || null;
    }
    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return new Response(JSON.stringify({ error: 'Debe cargar al menos una imagen.' }), { status: 400 });
      }
      updates.images = body.images;
    }

    const { error } = await supabase
      .from('gallery_albums')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gallery PUT error:', err);
    return new Response(JSON.stringify({ error: 'Error al actualizar el álbum' }), { status: 500 });
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
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gallery DELETE error:', err);
    return new Response(JSON.stringify({ error: 'Error al eliminar el álbum' }), { status: 500 });
  }
};
