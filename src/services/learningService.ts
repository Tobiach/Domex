import { callGroqFast } from './groqService';
import { LearningLesson } from '../types';

interface GeneratedLesson {
  titulo: string;
  contenido: string;
}

export async function generarLecciones(
  categoriaNombre: string,
  categoriaId: string
): Promise<LearningLesson[]> {
  const prompt = `Sos un educador experto. El usuario quiere aprender sobre: "${categoriaNombre}"
Generá 5 lecciones introductorias de 2-3 min de lectura.

REQUISITOS:
- Lenguaje accesible, español rioplatense
- Estructura: intro → punto clave → aplicación práctica hoy
- Sin listas largas (máx 3 bullets si los usás)
- 200-300 palabras por lección
- Empezá con lo más fundamental, subí complejidad gradualmente

Respondé SOLO JSON válido:
[{"titulo":"...","contenido":"..."},{"titulo":"...","contenido":"..."},{"titulo":"...","contenido":"..."},{"titulo":"...","contenido":"..."},{"titulo":"...","contenido":"..."}]`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 2500, temperature: 0.7 }
  );

  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) cleaned = match[0];

  let lessons: GeneratedLesson[];
  try { lessons = JSON.parse(cleaned); } catch { throw new Error('Lecciones no disponibles.'); }
  const ahora = new Date().toISOString();

  return lessons.slice(0, 5).map((l, i) => ({
    id: `lesson_${Date.now()}_${i}`,
    categoriaId,
    titulo: l.titulo,
    contenido: l.contenido,
    tipoContenido: 'ai-generated' as const,
    duracionEstimada: 3,
    completado: false,
    creadoEn: ahora,
  }));
}

export async function resumirContenidoExterno(
  descripcion: string,
  categoriaId: string
): Promise<LearningLesson> {
  const prompt = `El usuario agregó este contenido a su aprendizaje: "${descripcion}"
Creá un resumen en 150 palabras con los 3 puntos clave más accionables.
Respondé SOLO JSON: {"titulo":"...","contenido":"..."}`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 400, temperature: 0.5 }
  );

  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  let result: GeneratedLesson;
  try { result = JSON.parse(cleaned); } catch { throw new Error('Resumen no disponible.'); }

  return {
    id: `lesson_ext_${Date.now()}`,
    categoriaId,
    titulo: result.titulo,
    contenido: result.contenido,
    tipoContenido: 'user-external' as const,
    duracionEstimada: 2,
    fuente: descripcion,
    completado: false,
    creadoEn: new Date().toISOString(),
  };
}
