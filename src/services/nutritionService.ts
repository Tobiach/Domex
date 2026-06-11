import { callGroqFast } from './groqService';

export interface NutritionAnalysis {
  calorias: number;
  azucar: number;
  proteina: number;
  procesada: 'natural' | 'semi-procesada' | 'ultraprocesada';
  analisisIA: string;
}

export async function analizarComida(descripcion: string): Promise<NutritionAnalysis> {
  const prompt = `Analizá nutricionalmente: "${descripcion}"

Estimá:
- Calorías totales (número)
- Azúcar en gramos (número)
- Proteína en gramos (número)
- Categoría: "natural", "semi-procesada" o "ultraprocesada"
- Veredicto en 1 línea corta en español rioplatense

Respondé SOLO JSON válido:
{"calorias":450,"azucar":15,"proteina":30,"procesada":"natural","analisisIA":"Buen balance, proteína excelente."}`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 200, temperature: 0.1 }
  );

  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];

  try { return JSON.parse(cleaned) as NutritionAnalysis; } catch { throw new Error('Análisis nutricional no disponible.'); }
}
