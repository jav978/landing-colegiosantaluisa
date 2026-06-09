import type { APIRoute } from 'astro';
import { supabase } from '../../lib/db';
import { sendPreRegistrationEmail } from '../../lib/email';
import { isPreRegistrationActive } from '../../lib/settings';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!(await isPreRegistrationActive())) {
      return new Response(
        JSON.stringify({ error: 'El proceso de pre-inscripción online no se encuentra activo actualmente.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const {
      studentName,
      studentBirthDate,
      gradeRequested,
      parentName,
      parentEmail,
      parentPhone,
      notes,
    } = body;

    if (
      !studentName ||
      !studentBirthDate ||
      !gradeRequested ||
      !parentName ||
      !parentEmail ||
      !parentPhone
    ) {
      return new Response(
        JSON.stringify({ error: 'All fields except comments are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { data, error } = await supabase
      .from('pre_registrations')
      .insert({
        student_name: studentName,
        student_birth_date: studentBirthDate,
        grade_requested: gradeRequested,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error saving pre-registration:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit pre-registration. Please try again later.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email notification
    await sendPreRegistrationEmail({
      studentName,
      studentBirthDate,
      gradeRequested,
      parentName,
      parentEmail,
      parentPhone,
      notes: notes || undefined,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Pre-registration submitted successfully.', data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Pre-registration error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
