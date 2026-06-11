import { callGroq, callGroqFast } from './groqService';
import type { BlindSpot, LegacyProfile, Idea, Habito, ContactoCRM, Decision } from '../types';

interface OpportunityRadarResult {
  oportunidades: { titulo: string; razon: string; accion: string }[];
  insight: string;
}

export async function detectarBlindSpots(data: {
  ideas: Idea[];
  habitos: Habito[];
  contactos: ContactoCRM[];
  decisions: Decision[];
  tareasCompletadasSemana: number;
}): Promise<BlindSpot[]> {
  const ideasEnEjecucion = data.ideas.filter(i => i.estado === 'ejecucion').length;
  const ideasTotales = data.ideas.length;
  const habitosConRachaBaja = data.habitos.filter(h => h.racha < 3).length;
  const contactosSinFollowUp = data.contactos.filter(c => c.estado === 'prospecto').length;
  const decisionesConResultado = data.decisions.filter(d => d.resultado).length;

  const prompt = `Sos un coach ejecutivo de AIcolmena. Analizá estos datos del emprendedor y detectá 3 blind spots reales. Devolvé solo JSON sin markdown.

DATOS:
- Ideas totales: ${ideasTotales} (en ejecución: ${ideasEnEjecucion})
- Hábitos con racha < 3 días: ${habitosConRachaBaja}/${data.habitos.length}
- Prospectos sin follow-up: ${contactosSinFollowUp}
- Decisiones revisadas: ${decisionesConResultado}/${data.decisions.length}
- Tareas completadas esta semana: ${data.tareasCompletadasSemana}

JSON exacto (array de 3):
[
  {"descripcion":"qué patrón negativo no ve","evidencia":["dato 1","dato 2"],"impacto":"qué cuesta en 1 frase","intervencion":"1 acción específica y concreta para esta semana"},
  {"descripcion":"...","evidencia":["..."],"impacto":"...","intervencion":"..."},
  {"descripcion":"...","evidencia":["..."],"impacto":"...","intervencion":"..."}
]`;

  const text = await callGroq([{ role: 'user', content: prompt }], { maxTokens: 500, temperature: 0.3 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\[[\s\S]*\]/);
  let spots: Omit<BlindSpot, 'id' | 'completado' | 'creadoEn'>[];
  try { spots = JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Análisis no disponible.'); }
  return spots.map(s => ({ ...s, id: `bs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, completado: false, creadoEn: new Date().toISOString() }));
}

export async function generarOportunidades(data: {
  ideas: Idea[];
  contactos: ContactoCRM[];
  btcChange: number;
}): Promise<OpportunityRadarResult> {
  const ideasActivas = data.ideas.filter(i => i.estado !== 'idea').slice(0, 3).map(i => i.titulo).join(', ') || 'ninguna';
  const contactosKey = data.contactos.slice(0, 5).map(c => `${c.nombre}(${c.empresa || c.estado})`).join(', ') || 'ninguno';

  const prompt = `Sos el radar de oportunidades de AIcolmena. Analizá y devolvé solo JSON sin markdown.

IDEAS ACTIVAS: ${ideasActivas}
CONTACTOS CLAVE: ${contactosKey}
MERCADO: BTC ${data.btcChange >= 0 ? '+' : ''}${data.btcChange}%

JSON exacto:
{"oportunidades":[{"titulo":"oportunidad 1","razon":"por qué ahora","accion":"qué hacer esta semana"},{"titulo":"oportunidad 2","razon":"...","accion":"..."}],"insight":"conexión no obvia entre los datos en 1 frase (español rioplatense)"}`;

  const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 350, temperature: 0.4 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Radar no disponible.'); }
}

export async function calcularAlineacion(legacy: LegacyProfile, data: {
  ideas: Idea[];
  tareasHoy: string[];
}): Promise<{ score: number; reflexion: string }> {
  const ideasRelacionadas = data.ideas.filter(i =>
    legacy.vision.toLowerCase().split(' ').some(w => w.length > 4 && i.titulo.toLowerCase().includes(w))
  ).length;

  const prompt = `Calculá alineación entre legado y acciones actuales. Devolvé solo JSON sin markdown.

LEGADO:
- Visión: ${legacy.vision}
- Para quién: ${legacy.paraQuien}
- Valores: ${legacy.valores.join(', ')}

ACCIONES ACTUALES:
- Ideas relacionadas: ${ideasRelacionadas}/${data.ideas.length}
- Tareas hoy: ${data.tareasHoy.slice(0, 3).join(', ') || 'ninguna'}

JSON exacto:
{"score":número entre 0 y 100,"reflexion":"1-2 frases en español rioplatense: qué está alineado y qué no"}`;

  const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 120, temperature: 0.2 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Alineación no disponible.'); }
}
