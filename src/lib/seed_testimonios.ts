import 'dotenv/config';
import { supabase } from './db';

const testimonios = [
  {
    texto: 'El Colegio Santa Luisa ha sido una segunda casa para mis hijos. La formación en valores y la excelencia académica son incomparables.',
    autor: 'María Fernández',
    rol: 'Madre representante',
    iniciales: 'MF',
    color: 'bg-primary',
    image_url: '/images/testimonials/maria_fernandez.png',
    orden: 1,
    published: true,
  },
  {
    texto: 'Estudiar aquí me dio las herramientas no solo para destacar académicamente, sino para ser una persona de bien. ¡Orgullosamente exalumna!',
    autor: 'Carmen Rivas',
    rol: 'Exalumna · Promoción 2015',
    iniciales: 'CR',
    color: 'bg-secondary',
    image_url: '/images/testimonials/carmen_rivas.png',
    orden: 2,
    published: true,
  },
  {
    texto: 'Como docente, valoro el compromiso del colegio con la educación integral. Es un privilegio formar parte de esta gran familia vicenciana.',
    autor: 'Prof. José Martínez',
    rol: 'Docente de Matemáticas',
    iniciales: 'JM',
    color: 'bg-accent',
    image_url: '/images/testimonials/jose_martinez.png',
    orden: 3,
    published: true,
  },
  {
    texto: 'Increíble la atención al representante y la dedicación personalizada que le dan a cada niño. La pedagogía vicenciana realmente se siente en las aulas.',
    autor: 'Alejandro Blanco',
    rol: 'Representante de 5to Grado',
    iniciales: 'AB',
    color: 'bg-emerald-600',
    image_url: null,
    orden: 4,
    published: true,
  },
  {
    texto: 'El ambiente del colegio es súper fraterno. No solo aprendemos materias académicas, sino que nos motivan a participar en proyectos sociales y comunitarios que nos abren la mente.',
    autor: 'Sofía Guerrero',
    rol: 'Estudiante de 5to Año',
    iniciales: 'SG',
    color: 'bg-purple-600',
    image_url: null,
    orden: 5,
    published: true,
  }
];

async function run() {
  console.log('Insertando 5 testimonios en Supabase...');
  
  // Limpiar testimonios existentes para evitar duplicación
  const { error: deleteError } = await supabase.from('testimonios').delete().neq('id', 0);
  if (deleteError) {
    console.warn('Advertencia al limpiar testimonios:', deleteError.message);
  }

  const { data, error } = await supabase.from('testimonios').insert(testimonios).select();
  if (error) {
    throw error;
  }

  console.log('¡Testimonios insertados con éxito!', data?.length);
  process.exit(0);
}

run().catch(err => {
  console.error('Error al insertar testimonios:', err);
  process.exit(1);
});
