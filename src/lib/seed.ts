import 'dotenv/config';
import { supabase } from './db';
import { hashPassword } from './auth';

async function seed() {
  console.log('Tablas ya creadas via SQL Editor de Supabase.');
  console.log('Insertando admin inicial...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@colegiosantaluisa.edu.ve';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Administrador';

  const { data: existing } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', adminEmail.toLowerCase().trim())
    .single();

  if (!existing) {
    const hash = await hashPassword(adminPassword);
    const { error } = await supabase.from('usuarios').insert({
      email: adminEmail.toLowerCase().trim(),
      password_hash: hash,
      nombre: adminName,
      rol: 'admin',
    });
    if (error) throw error;
    console.log(`Admin creado: ${adminEmail}`);
  } else {
    console.log(`Admin ya existe: ${adminEmail}`);
  }

  console.log('Seed completado.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
