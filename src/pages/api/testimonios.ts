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
    const { texto, autor, rol, image_url, orden, published } = body;

    if (!texto || !autor || !rol) {
      return new Response(JSON.stringify({ error: 'Text, author and role are required' }), { status: 400 });
    }

    // Generate initials based on the author's name
    const initials = autor
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((namePart: string) => namePart.charAt(0).toUpperCase())
      .join('');

    // Predefined background color classes for the initials circle fallback
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-emerald-600', 'bg-indigo-600', 'bg-purple-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await supabase.from('testimonios').insert({
      texto,
      autor,
      rol,
      iniciales: initials || 'R',
      color: randomColor,
      image_url: image_url || null,
      orden: Number(orden) || 0,
      published: published !== undefined ? published : true,
    }).select('id, autor, rol, created_at').single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error creating testimonial' }), { status: 500 });
  }
};
