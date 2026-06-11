import { callGroqFast } from './groqService';
import { MemoryEntry } from '../types';

const TIPS = [
  'Dormí 7-8h para clarity máxima. El sueño consolida los recuerdos.',
  'Caminá 20 min después de comer para mantener glucosa estable.',
  'Meditá 10 min: reduce cortisol y mejora concentración hasta un 20%.',
  'Evitá azúcar 2h antes de tareas críticas. El pico-caída destruye el foco.',
  'Tomá una pausa de 5 min cada 90 min. El cerebro procesa mejor en intervalos.',
  'Hidratate: con 2% de deshidratación, la memoria baja hasta un 15%.',
  'Escribí 3 cosas que aprendiste hoy. Activa la consolidación de memoria.',
  'El ejercicio aumenta BDNF (factor de crecimiento neuronal). 30 min = +15% memoria.',
];

export function getTipDelDia(): string {
  const idx = new Date().getDate() % TIPS.length;
  return TIPS[idx];
}

export async function analizarPatronMemoria(
  entries: MemoryEntry[],
  azucarPromedio: number
): Promise<string> {
  if (entries.length < 3) {
    return 'Registrá al menos 3 días para ver patrones. Cada check-in suma.';
  }

  const datos = entries
    .slice(0, 7)
    .map(e => `${e.fecha}: ${e.score}/10${e.sintomas.length ? `, síntomas: ${e.sintomas.join(', ')}` : ''}${e.contexto ? `, contexto: ${e.contexto}` : ''}`)
    .join('\n');

  const prompt = `Datos de memoria del usuario (últimos días):
${datos}
Azúcar promedio diario: ${azucarPromedio}g

En 2-3 líneas cortas: identificá el principal factor que impacta su memoria y dá 2 recomendaciones específicas y accionables para hoy. Español rioplatense, directo, sin rodeos.`;

  return await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 200, temperature: 0.5 }
  );
}
