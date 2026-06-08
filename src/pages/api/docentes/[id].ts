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

    if (body.name !== undefined) {
      if (!body.name) return new Response(JSON.stringify({ error: 'Name required' }), { status: 400 });
      updates.name = body.name;
    }
    if (body.role !== undefined) {
      if (!body.role) return new Response(JSON.stringify({ error: 'Role required' }), { status: 400 });
      updates.role = body.role;
    }
    if (body.category !== undefined) {
      const validCategories = ['inicial', 'primaria', 'media', 'coordinacion'];
      if (!validCategories.includes(body.category)) {
        return new Response(JSON.stringify({ error: 'Invalid category' }), { status: 400 });
      }
      updates.category = body.category;
    }
    if (body.grade !== undefined) {
      if (!body.grade) return new Response(JSON.stringify({ error: 'Grade / Subject required' }), { status: 400 });
      updates.grade = body.grade;
    }
    if (body.image_url !== undefined) updates.image_url = body.image_url || null;
    if (body.phrase !== undefined) updates.phrase = body.phrase || null;
    if (body.orden !== undefined) updates.orden = Number(body.orden) || 0;

    const { error } = await supabase.from('docentes').update(updates).eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error updating teacher record' }), { status: 500 });
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

  try {
    const { error } = await supabase.from('docentes').delete().eq('id', id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error deleting teacher record' }), { status: 500 });
  }
};
