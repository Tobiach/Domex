import { callGroqFast } from './groqService';
import { VoiceProcessorResult } from '../types';

export async function procesarVoz(transcript: string): Promise<VoiceProcessorResult> {
  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  const prompt = `Sos un asistente de productividad personal. Analizá este texto hablado y categorizalo.
Hoy es ${hoy}.

Texto: "${transcript}"

Respondé SOLO con JSON válido, sin markdown:
{
  "tipo": "tarea" | "reunion" | "gasto" | "idea" | "nota",
  "titulo": "título corto y claro (máx 60 chars)",
  "detalles": {
    "fecha": "ISO date o null",
    "hora": "HH:MM o null",
    "monto": número o null,
    "personas": ["nombre"] o [],
    "contexto": "descripción adicional o null",
    "categoria": "categoría si es gasto o null"
  },
  "prioridad": "alta" | "normal" | "baja",
  "confianza": número entre 0 y 100
}

Reglas de clasificación:
- reunion: menciona hora, persona, o palabras como "reunión", "llamada", "meet"
- gasto: menciona monto, "invertí", "gasté", "compré", "pagué"
- idea: empieza con "idea:", "qué tal si", "podríamos"
- tarea: acción a hacer, verbo en infinitivo o imperativo
- nota: todo lo demás`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 256, temperature: 0.1 }
  );

  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as VoiceProcessorResult;
}

export function iniciarReconocimientoVoz(
  onResult: (transcript: string) => void,
  onEnd: () => void
): (() => void) | null {
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const recognition = new SpeechRec();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e: any) => onResult(e.results[0][0].transcript);
  recognition.onerror = onEnd;
  recognition.onend = onEnd;
  recognition.start();

  return () => recognition.stop();
}
