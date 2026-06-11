import { callGroqFast } from './groqService';
import type { Tarea, Agenda } from '../types';

interface Priority {
  titulo: string;
  razon: string;
  impacto: 'ALTO' | 'MEDIO' | 'BAJO';
}

interface PriorityResult {
  prioridades: Priority[];
  resumen: string;
  fecha: string;
}

const CACHE_KEY_PREFIX = 'domex_priorities_';

export function getPrioritiesCache(date: string): PriorityResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + date);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(date: string, result: PriorityResult) {
  localStorage.setItem(CACHE_KEY_PREFIX + date, JSON.stringify(result));
}

export async function generateDailyPriorities(
  tareas: Tarea[],
  agenda: Agenda[],
  balance: number,
  nombre: string
): Promise<PriorityResult> {
  const today = new Date().toISOString().split('T')[0];

  const pendientes = tareas.filter(t => !t.completada).slice(0, 10);
  const tareasFoco = tareas.filter(t => t.esFoco && !t.completada).slice(0, 3);
  const reunionesHoy = agenda
    .filter(a => a.fecha === today)
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .slice(0, 3);

  const contexto = `
Emprendedor: ${nombre}. Balance actual: $${balance}.
Tareas en foco: ${tareasFoco.map(t => `"${t.titulo}" (${t.prioridad})`).join(', ') || 'ninguna'}.
Otras pendientes: ${pendientes.slice(3).map(t => `"${t.titulo}" (${t.prioridad})`).join(', ') || 'ninguna'}.
Reuniones hoy: ${reunionesHoy.map(r => `"${r.titulo}" a las ${r.hora}`).join(', ') || 'ninguna'}.
`.trim();

  const prompt = `Eres el asistente personal de un emprendedor LATAM. Basado en este contexto:
${contexto}

Identifica las TOP 3 acciones más importantes para hoy. Responde SOLO con JSON válido, sin texto extra:
{
  "prioridades": [
    {"titulo": "acción concreta", "razon": "por qué es urgente hoy (max 10 palabras)", "impacto": "ALTO|MEDIO|BAJO"},
    {"titulo": "...", "razon": "...", "impacto": "..."},
    {"titulo": "...", "razon": "...", "impacto": "..."}
  ],
  "resumen": "una frase de contexto del día (max 12 palabras)"
}`;

  try {
    const raw = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 300, temperature: 0.3 });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    const parsed = JSON.parse(match[0]) as Omit<PriorityResult, 'fecha'>;
    const result: PriorityResult = { ...parsed, fecha: today };
    saveCache(today, result);
    return result;
  } catch {
    const fallback: PriorityResult = {
      prioridades: tareasFoco.slice(0, 3).map(t => ({
        titulo: t.titulo,
        razon: 'marcada como foco',
        impacto: t.prioridad === 'alta' ? 'ALTO' : t.prioridad === 'media' ? 'MEDIO' : 'BAJO',
      })),
      resumen: 'Basado en tus tareas de foco activas',
      fecha: today,
    };
    saveCache(today, fallback);
    return fallback;
  }
}
