import { getEvents } from './eventLog';
import { callGroqFast } from './groqService';

const KEY = 'aicolmena_patterns';
const TTL = 24 * 3_600_000;

export interface BehavioralPattern {
  generatedAt: number;
  diasSinAbrir: number;
  modulosFavoritos: string[];
  horasPico: string[];
  categoriaVozTop: string;
  insight: string;
}

export function getPatterns(): BehavioralPattern | null {
  try {
    const p: BehavioralPattern = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!p || Date.now() - p.generatedAt > TTL) return null;
    return p;
  } catch { return null; }
}

function calcDiasSinAbrir(): number {
  const opens = getEvents().filter(e => e.e === 'app_open').map(e => e.t);
  if (!opens.length) return 0;
  const last = opens.reduce((a, b) => (b > a ? b : a), 0);
  return Math.floor((Date.now() - last) / 86_400_000);
}

function buildStats() {
  const events = getEvents();
  const count = (arr: string[]) =>
    arr.reduce<Record<string, number>>((a, k) => ({ ...a, [k]: (a[k] || 0) + 1 }), {});

  const modulos = events.filter(e => e.e === 'modulo_visitado' && e.d).map(e => e.d!);
  const vozCats = events.filter(e => e.e === 'voz_usado' && e.d).map(e => e.d!);
  const horas = events.map(e => `${new Date(e.t).getHours()}:00`);

  const top = (obj: Record<string, number>, n = 3) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);

  return {
    total: events.length,
    modulosFavoritos: top(count(modulos)),
    horasPico: top(count(horas), 2),
    categoriaVozTop: top(count(vozCats), 1)[0] || '',
  };
}

const GENERATING_KEY = 'aicolmena_patterns_generating';

export async function generatePatterns(nombre: string): Promise<BehavioralPattern> {
  if (localStorage.getItem(GENERATING_KEY) === 'true') {
    return getPatterns() ?? { generatedAt: 0, diasSinAbrir: 0, modulosFavoritos: [], horasPico: [], categoriaVozTop: '', insight: '' };
  }
  localStorage.setItem(GENERATING_KEY, 'true');

  const diasSinAbrir = calcDiasSinAbrir();
  const stats = buildStats();

  let insight = '';

  if (stats.total >= 3) {
    try {
      const prompt = `Datos de comportamiento de ${nombre} en la app:
- Días sin abrir: ${diasSinAbrir}
- Módulos más usados: ${stats.modulosFavoritos.join(', ') || 'sin datos'}
- Hora pico de uso: ${stats.horasPico.join(', ') || 'sin datos'}
- Categoría de voz más usada: ${stats.categoriaVozTop || 'sin datos'}

Generá UNA oración de insight en español rioplatense, directo, sin emojis. Ejemplo: "Usás más la app los martes a la tarde — hoy es buen momento para dictar tus tareas."
Respondé solo la oración, sin comillas.`;

      insight = (await callGroqFast([{ role: 'user', content: prompt }])).trim();
    } catch { /* no insight si falla Groq */ }
  }

  const pattern: BehavioralPattern = {
    generatedAt: Date.now(),
    diasSinAbrir,
    ...stats,
    insight,
  };
  if (stats.total > 0) localStorage.setItem(KEY, JSON.stringify(pattern));
  localStorage.removeItem(GENERATING_KEY);
  return pattern;
}
