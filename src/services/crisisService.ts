import { callGroqFast } from './groqService';

// Piso de seguridad: se ejecuta ANTES de que cualquier texto libre del usuario
// entre al motor de correlación emocional/relacional. No es opcional (KICKOFF-PARALELO-CODIGO.md, punto 3).

export type MotivoCrisis = 'ideacion_suicida' | 'violencia' | 'abuso';

export interface CrisisCheckResult {
  detectada: boolean;
  motivo?: MotivoCrisis | null;
}

export interface RecursoAyuda {
  pais: 'AR';
  nombre: string;
  telefono: string;
  detalle: string;
}

// Centro de Asistencia al Suicida (CAS) — línea nacional oficial Argentina.
// Verificado 2026-07-11: argentina.gob.ar/salud/mental-y-adicciones/suicidio
export const RECURSO_CRISIS_ARGENTINA: RecursoAyuda = {
  pais: 'AR',
  nombre: 'Centro de Asistencia al Suicida (CAS)',
  telefono: '135 (CABA, gratuita) / 0800-345-1435 (todo el país)',
  detalle: 'Escucha activa, anónima y gratuita, las 24 horas.',
};

const CRISIS_KEYWORDS: Record<MotivoCrisis, string[]> = {
  ideacion_suicida: [
    'quiero morir', 'no quiero vivir', 'me quiero matar', 'suicidarme', 'suicidio',
    'terminar con todo', 'no vale la pena vivir', 'no aguanto más vivir', 'quiero desaparecer',
  ],
  violencia: [
    'me pega', 'me golpea', 'me amenaza', 'me quiere matar', 'tengo miedo de él',
    'tengo miedo de ella', 'me tiene amenazado', 'me tiene amenazada',
  ],
  abuso: [
    'me abusó', 'me abuso', 'abuso sexual', 'me toca sin permiso', 'me obliga a',
  ],
};

function heuristicaCrisis(texto: string): CrisisCheckResult {
  const t = texto.toLowerCase();
  for (const motivo of Object.keys(CRISIS_KEYWORDS) as MotivoCrisis[]) {
    if (CRISIS_KEYWORDS[motivo].some(k => t.includes(k))) return { detectada: true, motivo };
  }
  return { detectada: false };
}

export async function detectarSenalCrisis(texto: string): Promise<CrisisCheckResult> {
  if (!texto || texto.trim().length < 3) return { detectada: false };

  const porHeuristica = heuristicaCrisis(texto);
  if (porHeuristica.detectada) return porHeuristica;

  const prompt = `Analizá el siguiente texto y determiná si contiene señales de riesgo real y concreto: ideación suicida, violencia física, o abuso (propio o de terceros). NO marques tristeza normal, quejas cotidianas ni conflictos comunes de pareja/familia. Solo señales de riesgo genuino. Devolvé solo JSON sin markdown.

TEXTO: "${texto.slice(0, 500)}"

JSON exacto:
{"detectada":true|false,"motivo":"ideacion_suicida"|"violencia"|"abuso"|null}`;

  try {
    const respuesta = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 60, temperature: 0 });
    const cleaned = respuesta.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    const match = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : cleaned);
    return { detectada: !!parsed.detectada, motivo: parsed.motivo ?? null };
  } catch {
    // Fail-safe: si la clasificación falla, no bloquea el flujo (la heurística ya no detectó nada).
    return { detectada: false };
  }
}
