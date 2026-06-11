export type EventType = 'app_open' | 'voz_usado' | 'tarea_completada' | 'modulo_visitado';

interface UserEvent { t: number; e: EventType; d?: string; }

const KEY = 'aicolmena_events';
const MAX = 500;
const TTL_MS = 90 * 86_400_000;

export function logEvent(tipo: EventType, dato?: string): void {
  try {
    const cutoff = Date.now() - TTL_MS;
    const prev: UserEvent[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    const next = prev.filter(e => e.t > cutoff).slice(-(MAX - 1));
    next.push({ t: Date.now(), e: tipo, ...(dato ? { d: dato } : {}) });
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* silencioso */ }
}

export function getEvents(): UserEvent[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
