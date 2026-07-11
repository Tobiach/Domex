import { callGroq, callGroqFast } from './groqService';
import { detectarSenalCrisis, RECURSO_CRISIS_ARGENTINA, type RecursoAyuda } from './crisisService';
import type { BlindSpot, LegacyProfile, Idea, Habito, ContactoCRM, Decision, PersonaImportante, EnergyEntry, HormoneEntry, MemoryEntry } from '../types';

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

// ─── Motor de correlación relacional/emocional ─────────────────────────────

export interface CorrelacionRelacional {
  persona: string;
  pregunta: string;
  evidencia: string[];
  confianza: number; // 0-100
}

export interface MotorCorrelacionResult {
  crisis: boolean;
  recurso?: RecursoAyuda;
  correlaciones: CorrelacionRelacional[];
}

const UMBRAL_TEMAS_RECURRENTES = 3;

export async function detectarPatronesRelacionales(data: {
  personas: PersonaImportante[];
  energyEntries: EnergyEntry[];
  hormoneEntries: HormoneEntry[];
  memoryEntries: MemoryEntry[];
}): Promise<MotorCorrelacionResult> {
  // Piso de seguridad: ningún texto libre entra al motor sin pasar por acá primero.
  const textosLibres = [
    ...data.personas.map(p => p.notas),
    ...data.memoryEntries.map(m => m.contexto),
  ].filter(t => t && t.trim().length > 0);

  for (const texto of textosLibres) {
    const chequeo = await detectarSenalCrisis(texto);
    if (chequeo.detectada) {
      return { crisis: true, recurso: RECURSO_CRISIS_ARGENTINA, correlaciones: [] };
    }
  }

  // Umbral conservador: solo personas con patrones repetidos entran al análisis.
  const personasConPatron = data.personas.filter(p => p.temasRecurrentes.length >= UMBRAL_TEMAS_RECURRENTES);
  if (personasConPatron.length === 0) return { crisis: false, correlaciones: [] };

  const resumenPersonas = personasConPatron.map(p =>
    `${p.nombre} (${p.tipoVinculo}): temas recurrentes [${p.temasRecurrentes.join(', ')}], última interacción ${p.ultimaInteraccion ?? 'sin registro'}, temperatura reciente ${p.temperaturaReciente ?? 'sin datos'}`
  ).join('\n');

  const resumenEnergia = data.energyEntries.slice(-7)
    .map(e => `${e.fecha}: energía ${e.score}/10, sueño ${e.factores.sueno}h (${e.factores.tipoDeSueno})`)
    .join('\n') || 'sin datos recientes';

  const resumenHormonas = data.hormoneEntries.slice(-7)
    .map(h => `${h.fecha}: mood ${h.inputs.mood}/10, estrés ${h.inputs.estres}/10`)
    .join('\n') || 'sin datos recientes';

  const prompt = `Sos el motor de correlación emocional/relacional de AIcolmena. Cruzá los patrones de personas importantes con los datos de ánimo/energía del usuario y detectá correlaciones POSIBLES.

REGLA NO NEGOCIABLE: nunca afirmes una causa. Cada salida tiene que estar formulada como pregunta abierta ("¿tiene que ver con...?", "¿notás que...?"). Prohibido usar afirmaciones tipo "X te baja la energía".

PERSONAS CON PATRONES (${UMBRAL_TEMAS_RECURRENTES}+ temas repetidos):
${resumenPersonas}

ENERGÍA RECIENTE:
${resumenEnergia}

HORMONAS/MOOD RECIENTE:
${resumenHormonas}

Devolvé solo JSON sin markdown, máximo 2 correlaciones (si no hay evidencia suficiente, array vacío):
[{"persona":"nombre","pregunta":"¿...?","evidencia":["dato 1","dato 2"],"confianza":número 0-100}]`;

  const text = await callGroq([{ role: 'user', content: prompt }], { maxTokens: 400, temperature: 0.3 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\[[\s\S]*\]/);
  let correlaciones: CorrelacionRelacional[];
  try { correlaciones = JSON.parse(match ? match[0] : cleaned); } catch { correlaciones = []; }

  return { crisis: false, correlaciones };
}

const CHECKIN_RELACIONAL_KEY_PREFIX = 'domex_checkin_relacional_';

function getCheckInKeyHoy(): string {
  return CHECKIN_RELACIONAL_KEY_PREFIX + new Date().toISOString().split('T')[0];
}

function getCheckInCacheadoHoy(): MotorCorrelacionResult | null {
  try {
    const raw = localStorage.getItem(getCheckInKeyHoy());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Máximo 1 check-in relacional proactivo por día (KICKOFF-PARALELO-CODIGO.md, punto 5):
// el resultado se cachea por fecha; si hay más de un patrón, se prioriza el de mayor
// confianza y el resto espera al día siguiente.
export async function obtenerCheckInRelacionalDelDia(data: {
  personas: PersonaImportante[];
  energyEntries: EnergyEntry[];
  hormoneEntries: HormoneEntry[];
  memoryEntries: MemoryEntry[];
}): Promise<MotorCorrelacionResult> {
  const cacheado = getCheckInCacheadoHoy();
  if (cacheado) return cacheado;

  const resultado = await detectarPatronesRelacionales(data);
  const delDia: MotorCorrelacionResult = resultado.crisis
    ? resultado
    : {
        ...resultado,
        correlaciones: resultado.correlaciones.length
          ? [[...resultado.correlaciones].sort((a, b) => b.confianza - a.confianza)[0]]
          : [],
      };

  localStorage.setItem(getCheckInKeyHoy(), JSON.stringify(delDia));
  return delDia;
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
