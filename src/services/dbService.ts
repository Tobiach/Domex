import { supabase } from './supabaseClient';
import type { Tarea, Idea, Transaccion, Habito } from '../types';

// ---- AUTH ----

export async function signInWithEmail(email: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ---- SYNC ----

export async function syncToSupabase(
  userId: string,
  data: { tareas: Tarea[]; ideas: Idea[]; transacciones: Transaccion[]; habitos: Habito[] }
) {
  if (!supabase) return;

  await Promise.allSettled([
    supabase.from('tareas').upsert(
      data.tareas.map(t => ({ ...t, user_id: userId })),
      { onConflict: 'id' }
    ),
    supabase.from('ideas').upsert(
      data.ideas.map(i => ({ ...i, creado_en: i.creadoEn, user_id: userId })),
      { onConflict: 'id' }
    ),
    supabase.from('transacciones').upsert(
      data.transacciones.map(t => ({ ...t, user_id: userId })),
      { onConflict: 'id' }
    ),
    supabase.from('habitos').upsert(
      data.habitos.map(h => ({ ...h, ultima_vez: h.ultimaVez, creado_en: h.creadoEn, user_id: userId })),
      { onConflict: 'id' }
    ),
  ]);
}

export async function fetchFromSupabase(userId: string) {
  if (!supabase) return null;

  const [tareasRes, ideasRes, transaccionesRes, habitosRes] = await Promise.all([
    supabase.from('tareas').select('*').eq('user_id', userId),
    supabase.from('ideas').select('*').eq('user_id', userId),
    supabase.from('transacciones').select('*').eq('user_id', userId),
    supabase.from('habitos').select('*').eq('user_id', userId),
  ]);

  if (tareasRes.error || ideasRes.error || transaccionesRes.error || habitosRes.error) {
    return null;
  }

  return {
    tareas: tareasRes.data as Tarea[],
    ideas: ideasRes.data as Idea[],
    transacciones: transaccionesRes.data as Transaccion[],
    habitos: habitosRes.data as Habito[],
  };
}

/*
  SQL SCHEMA — run this in your Supabase dashboard > SQL Editor:

  create table tareas (
    id text primary key,
    user_id uuid references auth.users not null,
    titulo text not null,
    completada boolean default false,
    prioridad text default 'media',
    fecha_vencimiento text,
    es_foco boolean default false,
    objetivo_id text
  );

  create table ideas (
    id text primary key,
    user_id uuid references auth.users not null,
    titulo text not null,
    descripcion text,
    estado text default 'idea',
    creado_en text,
    valor_estimado numeric,
    potencial_mensual numeric,
    contacto_relacionado_id text
  );

  create table transacciones (
    id text primary key,
    user_id uuid references auth.users not null,
    tipo text not null,
    monto numeric not null,
    categoria text,
    descripcion text,
    fecha text
  );

  create table habitos (
    id text primary key,
    user_id uuid references auth.users not null,
    titulo text not null,
    icono text default '⚡',
    racha integer default 0,
    completado_hoy boolean default false,
    ultima_vez text,
    creado_en text
  );

  -- RLS (Row Level Security)
  alter table tareas enable row level security;
  alter table ideas enable row level security;
  alter table transacciones enable row level security;
  alter table habitos enable row level security;

  create policy "Users own their tareas" on tareas for all using (auth.uid() = user_id);
  create policy "Users own their ideas" on ideas for all using (auth.uid() = user_id);
  create policy "Users own their transacciones" on transacciones for all using (auth.uid() = user_id);
  create policy "Users own their habitos" on habitos for all using (auth.uid() = user_id);
*/
