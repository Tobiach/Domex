import { callGroqFast } from './groqService';
import type { HormoneEntry } from '../types';

export function calcScores(inputs: HormoneEntry['inputs']): HormoneEntry['scores'] {
  const T = Math.round(((inputs.energia + inputs.libido + inputs.vigor) / 3) * 10);
  const C = Math.round(100 - ((inputs.estres + inputs.brainFog) / 2) * 10);
  const D = Math.round(((inputs.motivation + inputs.focus + inputs.placer) / 3) * 10);
  return {
    T: Math.min(100, Math.max(0, T)),
    C: Math.min(100, Math.max(0, C)),
    D: Math.min(100, Math.max(0, D)),
  };
}

export async function analizarHormonas(scores: HormoneEntry['scores']): Promise<string> {
  const estadoT = scores.T >= 70 ? 'alta' : scores.T >= 45 ? 'normal' : 'baja';
  const estadoC = scores.C >= 70 ? 'controlado' : scores.C >= 45 ? 'elevado' : 'alto';
  const estadoD = scores.D >= 70 ? 'alta' : scores.D >= 45 ? 'normal' : 'baja';

  const prompt = `Sos el sistema de análisis hormonal de AIcolmena. Devolvé solo JSON.

SCORES:
- Testosterona: ${scores.T}/100 (${estadoT})
- Cortisol: ${scores.C}/100 (${estadoC})
- Dopamina: ${scores.D}/100 (${estadoD})

JSON exacto sin markdown:
{"analisis":"2 líneas: estado actual + por qué (español rioplatense, directo)","accion":"1 intervención específica para hoy (ej: ejercicio intenso 20min, pausa activa, tarea grande)"}`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 150, temperature: 0.2 }
  );

  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  let parsed: { analisis: string; accion: string };
  try { parsed = JSON.parse(cleaned); } catch { throw new Error('Análisis hormonal no disponible.'); }
  return `${parsed.analisis} → ${parsed.accion}`;
}
