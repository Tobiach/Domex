import { callGroqFast } from './groqService';
import type { EnergyEntry } from '../types';

export interface EnergyAnalysis {
  analisisIA: string;
  recomendacion: string;
}

export async function analizarEnergia(
  entry: Omit<EnergyEntry, 'id' | 'analisisIA' | 'recomendacion' | 'creadoEn'>,
  historico: EnergyEntry[]
): Promise<EnergyAnalysis> {
  const promedioHistorico = historico.length > 0
    ? (historico.reduce((a, e) => a + e.score, 0) / historico.length).toFixed(1)
    : 'sin datos';

  const prompt = `Sos el sistema de análisis de bienestar de AIcolmena. Analizá este check-in de energía y devolvé solo JSON.

CHECK-IN HOY:
- Score energía: ${entry.score}/10
- Horas de sueño: ${entry.factores.sueno}h
- Tipo sueño: ${entry.factores.tipoDeSueno}
- Factores de estrés: ${entry.factores.estresTopics.length > 0 ? entry.factores.estresTopics.join(', ') : 'ninguno'}

HISTÓRICO: promedio ${promedioHistorico}/10 (últimas ${historico.length} entradas)

Devolvé exactamente este JSON sin markdown:
{"analisisIA":"texto de 2 líneas explicando el estado actual basado en los factores (en español rioplatense, directo)","recomendacion":"1 acción específica para hoy que mejore la energía"}`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 200, temperature: 0.3 }
  );

  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  try { return JSON.parse(cleaned) as EnergyAnalysis; } catch { throw new Error('Análisis de energía no disponible.'); }
}
