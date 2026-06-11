import { callGroqFast } from './groqService';
import type { WisdomQuote } from '../types';

export async function generarCitaDiaria(nombre: string): Promise<Omit<WisdomQuote, 'id' | 'reflexionUsuario' | 'guardado' | 'creadoEn'>> {
  const hoy = new Date().toISOString().split('T')[0];
  const prompt = `Generá una cita profunda y accionable para ${nombre || 'un emprendedor'} hoy ${hoy}. Devolvé solo JSON sin markdown:
{"fecha":"${hoy}","cita":"la cita (máx 120 chars, poderosa)","autor":"nombre del autor o pensador","tema":"liderazgo|estoicismo|negocios|mentalidad|acción"}`;

  const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 120, temperature: 0.7 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Cita no disponible.'); }
}
