import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = import.meta.env?.RESEND_API_KEY || process.env?.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_api_key_here') {
    return null;
  }
  return new Resend(apiKey);
}

function getAdminEmail(): string {
  return import.meta.env?.ADMIN_NOTIFICATION_EMAIL || process.env?.ADMIN_NOTIFICATION_EMAIL || 'jvasquez978@gmail.com';
}

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface PreRegEmailData {
  studentName: string;
  studentBirthDate: string;
  gradeRequested: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  notes?: string;
}

/**
 * Sends a notification email when a new contact message is received
 */
export async function sendContactEmail(data: ContactEmailData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend email service is not configured. Skipping email notification.');
    return false;
  }

  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #281470; border-bottom: 2px solid #f7c301; padding-bottom: 10px;">Nuevo Mensaje de Contacto</h2>
        <p>Se ha recibido un nuevo mensaje desde el formulario de contacto del sitio web.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Nombre:</td>
            <td style="padding: 8px 0; color: #222;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 8px 0; color: #222;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Teléfono:</td>
            <td style="padding: 8px 0; color: #222;">${data.phone || 'No provisto'}</td>
          </tr>
        </table>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #281470; border-radius: 4px; margin-top: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #281470;">Mensaje:</h4>
          <p style="margin: 0; white-space: pre-wrap; color: #333; line-height: 1.5;">${data.message}</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">
          Este correo fue enviado automáticamente por el sistema de administración del Colegio Santa Luisa.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'Colegio Santa Luisa <onboarding@resend.dev>',
      to: getAdminEmail(),
      subject: `Nuevo Mensaje de Contacto - ${data.name}`,
      html: htmlContent,
      replyTo: data.email,
    });

    if (response.error) {
      console.error('Error returned from Resend API:', response.error);
      return false;
    }

    console.log('Contact notification email sent successfully:', response.data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send contact notification email:', error);
    return false;
  }
}

/**
 * Sends a notification email when a new pre-registration is submitted
 */
export async function sendPreRegistrationEmail(data: PreRegEmailData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend email service is not configured. Skipping email notification.');
    return false;
  }

  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #281470; border-bottom: 2px solid #f7c301; padding-bottom: 10px;">Nueva Solicitud de Pre-inscripción</h2>
        <p>Se ha recibido una nueva postulación de alumno a través del sitio web.</p>
        
        <h3 style="color: #281470; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Datos del Estudiante</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555; width: 180px;">Nombre del Alumno:</td>
            <td style="padding: 6px 0; color: #222; font-weight: bold;">${data.studentName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Fecha de Nacimiento:</td>
            <td style="padding: 6px 0; color: #222;">${data.studentBirthDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Grado a Postular:</td>
            <td style="padding: 6px 0; color: #281470; font-weight: bold;">${data.gradeRequested}</td>
          </tr>
        </table>

        <h3 style="color: #281470; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Datos del Representante</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555; width: 180px;">Representante:</td>
            <td style="padding: 6px 0; color: #222;">${data.parentName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 6px 0; color: #222;"><a href="mailto:${data.parentEmail}">${data.parentEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #555;">Teléfono:</td>
            <td style="padding: 6px 0; color: #222;">${data.parentPhone}</td>
          </tr>
        </table>
        
        ${data.notes ? `
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f7c301; border-radius: 4px; margin-top: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #281470;">Observaciones adicionales:</h4>
            <p style="margin: 0; white-space: pre-wrap; color: #333; line-height: 1.5;">${data.notes}</p>
          </div>
        ` : ''}
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 11px; color: #888; text-align: center;">
          Este correo fue enviado automáticamente por el sistema de administración del Colegio Santa Luisa.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'Colegio Santa Luisa <onboarding@resend.dev>',
      to: getAdminEmail(),
      subject: `Nueva Pre-inscripción - ${data.studentName} (${data.gradeRequested})`,
      html: htmlContent,
      replyTo: data.parentEmail,
    });

    if (response.error) {
      console.error('Error returned from Resend API for pre-reg:', response.error);
      return false;
    }

    console.log('Pre-registration notification email sent successfully:', response.data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send pre-registration notification email:', error);
    return false;
  }
}
