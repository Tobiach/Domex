import { callGroq } from './groqService';
import type { DebateEntry } from '../types';

type DebateAnalysis = Omit<DebateEntry, 'id' | 'reflexionUsuario' | 'decisionFinal' | 'creadoEn'>;

export async function analizarDebate(pregunta: string): Promise<DebateAnalysis> {
  const prompt = `Sos Sócrates como asistente de AIcolmena. Analizá esta pregunta existencial y devolvé solo JSON sin markdown:

"${pregunta}"

JSON exacto:
{
  "pregunta": "${pregunta}",
  "opcionA": {
    "titulo": "nombre de la opción A (3-5 palabras)",
    "pro": ["ventaja 1","ventaja 2","ventaja 3"],
    "contra": ["desventaja 1","desventaja 2"],
    "riesgo": "el riesgo principal en 1 frase",
    "oportunidad": "la oportunidad principal en 1 frase"
  },
  "opcionB": {
    "titulo": "nombre de la opción B (3-5 palabras)",
    "pro": ["ventaja 1","ventaja 2","ventaja 3"],
    "contra": ["desventaja 1","desventaja 2"],
    "riesgo": "el riesgo principal en 1 frase",
    "oportunidad": "la oportunidad principal en 1 frase"
  },
  "insight": "la pregunta real detrás de la pregunta (máx 20 palabras, en español rioplatense)"
}`;

  const text = await callGroq([{ role: 'user', content: prompt }], { maxTokens: 600, temperature: 0.4 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Debate no disponible.'); }
}
