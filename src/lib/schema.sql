-- Tabla de usuarios (registro con email propio)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (rol IN ('admin', 'editor')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sesiones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_active TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP DEFAULT NULL
);

-- Tabla de posts (blog + anuncios)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'anuncio')),
  category VARCHAR(50),
  published BOOLEAN DEFAULT false,
  author_id INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Desactivar RLS (Row Level Security) para que el backend de Astro pueda consultar/insertar usando la anon key
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Table for contact form messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'in_progress', 'resolved')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table for student pre-registrations
CREATE TABLE IF NOT EXISTS pre_registrations (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  student_birth_date DATE NOT NULL,
  grade_requested VARCHAR(50) NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled_interview', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE pre_registrations DISABLE ROW LEVEL SECURITY;

-- Table for school and parent testimonials
CREATE TABLE IF NOT EXISTS testimonios (
  id SERIAL PRIMARY KEY,
  texto TEXT NOT NULL,
  autor VARCHAR(100) NOT NULL,
  rol VARCHAR(100) NOT NULL,
  iniciales VARCHAR(5) NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'bg-primary',
  image_url TEXT DEFAULT NULL,
  orden INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE testimonios DISABLE ROW LEVEL SECURITY;


