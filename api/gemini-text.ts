export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });

  const { messages, max_tokens = 450, temperature = 0.1 } = req.body;

  // Convert OpenAI-style messages to Gemini format (use only user messages as prompt)
  const parts = (messages as Array<{ role: string; content: string }>)
    .filter(m => m.role === 'user')
    .map(m => ({ text: m.content }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: max_tokens, temperature },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Return in OpenAI-compatible format so groqService.ts can parse without changes
    return res.status(200).json({ choices: [{ message: { content: text } }] });
  } catch {
    return res.status(500).json({ error: 'Error calling Gemini API' });
  }
}
