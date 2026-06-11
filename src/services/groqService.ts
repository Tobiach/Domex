const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callGroq(
  messages: GroqMessage[],
  options?: GroqOptions
): Promise<string> {
  const response = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options?.model ?? DEFAULT_MODEL,
      messages,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq proxy error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function callGroqFast(
  messages: GroqMessage[],
  options?: Omit<GroqOptions, 'model'>
): Promise<string> {
  return callGroq(messages, { ...options, model: FAST_MODEL });
}
