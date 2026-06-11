import { callGroq, callGroqFast } from './groqService';

interface PodcastAnalysis {
  titulo: string;
  tema: string;
  ideas: string[];
  aplicables: string[];
  aprendizajeKey: string;
}

interface BookAnalysis {
  resumen: string;
  ideasClave: string[];
  aplicaciones: string[];
}

export async function resumirPodcast(descripcion: string): Promise<PodcastAnalysis> {
  const prompt = `Analizá este podcast/contenido y devolvé solo JSON sin markdown:

"${descripcion}"

JSON exacto:
{"titulo":"nombre del podcast o tema","tema":"área de conocimiento","ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"],"aplicables":["qué hacer hoy 1","qué hacer hoy 2","qué hacer hoy 3"],"aprendizajeKey":"la 1 idea más importante de todo (máx 15 palabras)"}`;

  const text = await callGroq([{ role: 'user', content: prompt }], { maxTokens: 400, temperature: 0.2 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Resumen no disponible.'); }
}

export async function resumirLibro(titulo: string, autor: string): Promise<BookAnalysis> {
  const prompt = `Sos un lector experto. Resumí el libro "${titulo}" de ${autor} para un emprendedor argentino. Devolvé solo JSON sin markdown:

{"resumen":"resumen ejecutivo de 3-4 oraciones en español rioplatense","ideasClave":["idea 1","idea 2","idea 3","idea 4","idea 5"],"aplicaciones":["cómo aplicarlo 1","cómo aplicarlo 2","cómo aplicarlo 3"]}`;

  const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 500, temperature: 0.3 });
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  try { return JSON.parse(match ? match[0] : cleaned); } catch { throw new Error('Resumen de libro no disponible.'); }
}
