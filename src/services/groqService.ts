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

// Silent error logging to Supabase error_logs table
export async function logError(service: string, message: string): Promise<void> {
  try {
    const { supabase } = await import('./supabaseClient');
    if (!supabase) return;
    await supabase.from('error_logs').insert({ service, error_message: message });
  } catch { /* intentionally silent */ }
}

async function callGeminiFallback(
  messages: GroqMessage[],
  options?: GroqOptions
): Promise<string> {
  const response = await fetch('/api/gemini-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      max_tokens: options?.maxTokens ?? 450,
      temperature: options?.temperature ?? 0.1,
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

// Tries Groq first; on failure logs the error and falls back to Gemini Flash.
// If both fail, throws a user-friendly message.
export async function callGroqWithFallback(
  messages: GroqMessage[],
  options?: GroqOptions
): Promise<string> {
  try {
    return await callGroq(messages, options);
  } catch (err) {
    await logError('groq', err instanceof Error ? err.message : String(err));
    console.error('[GROQ_DOWN] Switching to Gemini fallback');
    try {
      return await callGeminiFallback(messages, options);
    } catch (gemErr) {
      await logError('gemini', gemErr instanceof Error ? gemErr.message : String(gemErr));
      throw new Error('El servicio está ocupado, intentá en unos segundos.');
    }
  }
}
