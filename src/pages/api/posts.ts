import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../lib/auth';
import { supabase } from '../../lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

export const GET: APIRoute = async ({ request, url }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  const type = url.searchParams.get('type');
  const published = url.searchParams.get('published');

  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, image_url, type, category, published, created_at, updated_at,
      usuarios ( email, nombre )
    `)
    .order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);
  if (published === 'true') query = query.eq('published', true);
  if (!session) query = query.eq('published', true);

  const { data } = await query;
  return new Response(JSON.stringify(data || []), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, excerpt, image_url, type, category, published } = body;

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Título y contenido requeridos' }), { status: 400 });
    }

    let slug = slugify(title);
    if (!slug) slug = Date.now().toString();

    const { data, error } = await supabase.from('posts').insert({
      title,
      slug,
      content,
      excerpt: excerpt || '',
      image_url: image_url || '',
      type: type || 'blog',
      category: category || '',
      published: published || false,
      author_id: session.user_id,
    }).select(`
      id, title, slug, type, published, created_at
    `).single();

    if (error) {
      if (error.code === '23505') {
        slug = slug + '-' + Date.now();
        const retry = await supabase.from('posts').insert({
          title, slug, content,
          excerpt: excerpt || '',
          image_url: image_url || '',
          type: type || 'blog',
          category: category || '',
          published: published || false,
          author_id: session.user_id,
        }).select('id, title, slug, type, published, created_at').single();
        if (retry.error) throw retry.error;
        return new Response(JSON.stringify(retry.data), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }
      throw error;
    }

    return new Response(JSON.stringify(data), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al crear post' }), { status: 500 });
  }
};
