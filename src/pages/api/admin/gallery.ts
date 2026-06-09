import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../lib/auth';
import { supabase } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gallery GET error:', err);
    return new Response(JSON.stringify({ error: 'Error fetching gallery albums' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, images } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'El título es un campo obligatorio.' }), { status: 400 });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'Debe cargar al menos una imagen.' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({
        title,
        description: description || null,
        images,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, album: data }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Gallery POST error:', err);
    return new Response(JSON.stringify({ error: 'Error al registrar el álbum de fotos' }), { status: 500 });
  }
};
