import type { APIRoute } from 'astro';
import { supabase } from '../../lib/db';
import { sendContactEmail } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required fields.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        message,
        status: 'unread',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error saving contact message:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save message. Please try again later.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email notification asynchronously
    sendContactEmail({ name, email, phone, message }).catch((mailErr) => {
      console.error('Asynchronous contact email notification failed:', mailErr);
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Message saved successfully.', data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Contact submission error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
