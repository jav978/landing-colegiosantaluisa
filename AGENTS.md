# AGENTS.md

Landing page + panel admin del **Colegio Santa Luisa**. Astro 6 SSR sobre Netlify, Supabase para datos.

## Comandos

- `npm run dev` — dev server en `localhost:4321`
- `npm run build` — build SSR a `dist/` (requerido por Netlify)
- `npm run preview` — preview del build
- `npm run seed` — inserta admin inicial en Supabase (usa `tsx`, lee `.env` con `dotenv/config`)

No hay `lint`, `typecheck` ni `test` definidos en `package.json`. Si necesitas validar tipos: `npx astro check`.

## Variables de entorno

Copia `.env.example` → `.env`. Requeridas:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — leídas en `src/lib/db.ts`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — solo para `npm run seed`

`SESSION_SECRET` está en `.env.example` pero **no se usa en el código**; seguro ignorarlo o eliminarlo.

## Arquitectura

- **SSR server-side**: `astro.config.mjs` usa `output: 'server'` con adaptador Netlify. No es estático.
- **Routing**:
  - `src/pages/index.astro` — landing pública (secciones en `src/components/`)
  - `src/pages/blog/` — blog público
  - `src/pages/admin/` — dashboard protegido (`dashboard`, `login`, `posts/`, `sesiones`, `usuarios/`)
  - `src/pages/api/` — endpoints JSON (`login`, `logout`, `register`, `posts`, `sesiones`, `usuarios`)
- **Layouts**: `src/layouts/Layout.astro` (público) y `src/components/admin/AdminLayout.astro` (admin)
- **DB access**: todo pasa por el cliente Supabase de `src/lib/db.ts`. `auth: { persistSession: false }` — Supabase **no** maneja la sesión, la maneja la app.

## Auth y sesiones (importante)

No usa Supabase Auth. Implementación propia:

- Contraseñas con `bcryptjs` (salt rounds 10) en `src/lib/auth.ts`
- Token de sesión = `crypto.randomBytes(32).toString('hex')` (64 hex)
- Cookie: `session_token`, `httpOnly`, `secure`, `sameSite: 'lax'`, 24h
- Tabla `sesiones` con soft-delete (`deleted_at`) y `last_active` actualizado en cada `validateSession`
- Roles: `admin` y `editor` (CHECK constraint en DB)
- Cada página admin debe llamar `getSessionToken(request)` + `validateSession(token)` — **no hay middleware centralizado**; revisa el patrón existente antes de añadir rutas admin nuevas

## Base de datos

- Schema en `src/lib/schema.sql` (3 tablas: `usuarios`, `sesiones`, `posts`)
- **Las tablas se crean manualmente en el SQL Editor de Supabase** — no hay migraciones automatizadas. Si modificas el schema, actualiza el archivo y aplícalo a mano
- `posts.type` ∈ {`blog`, `anuncio`}; `posts.published` controla visibilidad
- Slug único en posts

## Estilos

- Tailwind CSS 4 vía plugin de Vite (`@tailwindcss/vite`). Sin `tailwind.config.js` — config por defecto v4
- Sin preprocessor, sin convenciones especiales

## Gotchas

- `src/lib/db.ts` lee env con fallback: primero `import.meta.env` (Astro), luego `process.env` (Node). El script `seed` solo funciona por la rama `process.env` + `dotenv/config`
- `pg` está en dependencias pero **no se usa** en el código actual — todo va por Supabase. Considera eliminarlo si no hay planes de SQL directo
- `opencode.json` contiene un `X-Goog-Api-Key` en texto plano. Si esto es un repo público, **rota la key y mueve el secret a env**
- No hay CI. No hay tests. No hay linter. Cambios se validan solo con `astro build` + revisión manual
- `package.json` requiere Node `>=22.12.0` (también fijado en `netlify.toml`)
