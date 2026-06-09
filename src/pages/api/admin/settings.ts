import type { APIRoute } from 'astro';
import { getSessionToken, validateSession } from '../../../lib/auth';
import { supabase } from '../../../lib/db';
import { DEFAULT_CONFIG } from '../../../lib/settings';

export const GET: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const session = await validateSession(token);
  if (!session || session.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'pre_registration_config')
      .single();

    if (error || !data) {
      return new Response(JSON.stringify(DEFAULT_CONFIG), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ...DEFAULT_CONFIG, ...data.value }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('API Settings GET error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const token = getSessionToken(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const session = await validateSession(token);
  if (!session || session.rol !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    const body = await request.json();

    const config = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : true,
      type: ['always', 'schedule', 'manual'].includes(body.type) ? body.type : 'always',
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      days_of_week: Array.isArray(body.days_of_week) ? body.days_of_week.map(Number) : [1, 2, 3, 4, 5],
      start_time: body.start_time || '',
      end_time: body.end_time || '',
    };

    // Server-side validation
    if (config.enabled && config.type !== 'always') {
      if (!config.start_date || !config.end_date) {
        return new Response(JSON.stringify({ error: 'Debe seleccionar una fecha de inicio y una fecha de fin.' }), { status: 400 });
      }
      if (config.end_date < config.start_date) {
        return new Response(JSON.stringify({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio.' }), { status: 400 });
      }
    }

    if (config.enabled && config.type === 'schedule') {
      if (!config.days_of_week || config.days_of_week.length === 0) {
        return new Response(JSON.stringify({ error: 'Debe seleccionar al menos un día de la semana.' }), { status: 400 });
      }
      if (!config.start_time || !config.end_time) {
        return new Response(JSON.stringify({ error: 'La hora de apertura y de cierre son obligatorias.' }), { status: 400 });
      }
      if (config.end_time <= config.start_time) {
        return new Response(JSON.stringify({ error: 'La hora de cierre debe ser posterior a la hora de apertura.' }), { status: 400 });
      }
    }

    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'pre_registration_config',
        value: config,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Database save settings error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, config }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('API Settings POST error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
