import { callGroq } from './groqService';

export async function generarRoadmap(titulo: string, goal: string, duracion: number, dificultad: string): Promise<string> {
  const prompt = `Sos un coach de aprendizaje experto. Generá un roadmap de ${duracion} semanas para: "${titulo}".

Objetivo final: ${goal}
Nivel: ${dificultad}

Devolvé markdown limpio con esta estructura exacta:
## Semana 1 — [Tema]
- Concepto clave 1
- Concepto clave 2
- Recurso o práctica

## Semana 2 — [Tema]
...

Máximo ${duracion} semanas. Español rioplatense, directo, sin paja.`;

  return callGroq(
    [{ role: 'user', content: prompt }],
    { maxTokens: 800, temperature: 0.5 }
  );
}
