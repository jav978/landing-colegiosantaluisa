import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../lib/auth';
import { supabase } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, role, category, grade, image_url, phrase, orden } = body;

    if (!name || !role || !category || !grade) {
      return new Response(
        JSON.stringify({ error: 'Name, role, category and grade are required fields.' }),
        { status: 400 }
      );
    }

    const validCategories = ['inicial', 'primaria', 'media', 'coordinacion'];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category. Must be one of: inicial, primaria, media, coordinacion.' }),
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from('docentes').insert({
      name,
      role,
      category,
      grade,
      image_url: image_url || null,
      phrase: phrase || null,
      orden: Number(orden) || 0
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error creating teacher record' }), { status: 500 });
  }
};
