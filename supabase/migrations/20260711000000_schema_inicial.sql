-- AIcolmena — schema inicial para el proyecto Supabase nuevo (aerclckcbrzihoefmeep)

-- ── Tablas de usuario (RLS por user_id, requieren Auth) ──────────────────

create table tareas (
  id text primary key, user_id uuid references auth.users not null,
  titulo text not null, completada boolean default false,
  prioridad text default 'media', fecha_vencimiento text,
  es_foco boolean default false, objetivo_id text
);
create table ideas (
  id text primary key, user_id uuid references auth.users not null,
  titulo text not null, descripcion text, estado text default 'idea',
  creado_en text, valor_estimado numeric, potencial_mensual numeric,
  contacto_relacionado_id text
);
create table transacciones (
  id text primary key, user_id uuid references auth.users not null,
  tipo text not null, monto numeric not null, categoria text,
  descripcion text, fecha text
);
create table habitos (
  id text primary key, user_id uuid references auth.users not null,
  titulo text not null, icono text default '⚡', racha integer default 0,
  completado_hoy boolean default false, ultima_vez text, creado_en text
);
alter table tareas enable row level security;
alter table ideas enable row level security;
alter table transacciones enable row level security;
alter table habitos enable row level security;
create policy "Users own their tareas" on tareas for all using (auth.uid() = user_id);
create policy "Users own their ideas" on ideas for all using (auth.uid() = user_id);
create policy "Users own their transacciones" on transacciones for all using (auth.uid() = user_id);
create policy "Users own their habitos" on habitos for all using (auth.uid() = user_id);

-- ── Cache pública (sin user_id) ───────────────────────────────────────────

create table news_cache (
  id bigint generated always as identity primary key,
  category text not null, articles jsonb not null, cached_at timestamptz not null default now()
);
create table books_cache (
  search_query text primary key, book_data jsonb not null, updated_at timestamptz not null default now()
);
create table exchange_rate_cache (
  id bigint generated always as identity primary key,
  base_currency text not null, rates jsonb not null, created_at timestamptz not null default now()
);
alter table news_cache enable row level security;
alter table books_cache enable row level security;
alter table exchange_rate_cache enable row level security;
create policy "Public read/write cache - news" on news_cache for all using (true) with check (true);
create policy "Public read/write cache - books" on books_cache for all using (true) with check (true);
create policy "Public read/write cache - exchange" on exchange_rate_cache for all using (true) with check (true);

-- ── early_access (signups pre-lanzamiento) ────────────────────────────────

create table early_access (
  id bigint generated always as identity primary key,
  email text not null, created_at timestamptz not null default now()
);
alter table early_access enable row level security;
create policy "Public insert only - early_access" on early_access for insert with check (true);
