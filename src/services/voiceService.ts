// iOS requiere que speechSynthesis sea "desbloqueada" desde un gesto del usuario.
// Llamamos esto en el primer tap del botón de micrófono.
let audioUnlocked = false;
export function unlockAudio(): void {
  if (audioUnlocked || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  audioUnlocked = true;
}

function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const timeout = setTimeout(() => resolve([]), 2000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

async function getBestSpanishVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await getVoicesAsync();
  // Preferencia: voz sintética Argentina, México, España — en ese orden.
  // Las voces "sintéticas" (no "Enhanced"/"Premium") suenan más robóticas.
  const prefs = ['es-AR', 'Paulina', 'Monica', 'es-MX', 'es-ES', 'es'];
  for (const pref of prefs) {
    const voz = voices.find(v => v.lang.startsWith(pref) || v.name.includes(pref));
    if (voz) return voz;
  }
  return voices[0] ?? null;
}

export async function hablarTexto(texto: string, rate = 1.1): Promise<void> {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  // iOS necesita micro-delay tras cancel() para liberar el audio
  await new Promise(r => setTimeout(r, 120));

  const utterance = new SpeechSynthesisUtterance(texto.replace(/[#*`[\]]/g, ''));
  utterance.lang = 'es-AR';
  utterance.rate = rate;       // 1.1 → cadencia IA, más ágil
  utterance.pitch = 0.85;      // < 1.0 → tono más grave, feel robótico
  utterance.volume = 1.0;

  const voz = await getBestSpanishVoice();
  if (voz) utterance.voice = voz;

  // iOS keepAlive: el sistema pausa speechSynthesis tras pérdida de foco
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  utterance.onstart = () => {
    keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive!);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);
  };
  const cleanup = () => { if (keepAlive) clearInterval(keepAlive); };
  utterance.onend = cleanup;
  utterance.onerror = cleanup;

  setTimeout(() => window.speechSynthesis.speak(utterance), 50);
}

export function detenerVoz(): void {
  window.speechSynthesis.cancel();
}

export function hablarConCallback(
  texto: string,
  onStart: () => void,
  onEnd: () => void,
  rate = 1.1
): void {
  if (!('speechSynthesis' in window)) { onEnd(); return; }

  window.speechSynthesis.cancel();

  getBestSpanishVoice().then(voz => {
    const utterance = new SpeechSynthesisUtterance(texto.replace(/[#*`[\]]/g, ''));
    utterance.lang = 'es-AR';
    utterance.rate = rate;
    utterance.pitch = 0.85;
    utterance.volume = 1.0;
    if (voz) utterance.voice = voz;

    let keepAlive: ReturnType<typeof setInterval> | null = null;
    utterance.onstart = () => {
      onStart();
      keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(keepAlive!); return; }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
    };
    const cleanup = () => { if (keepAlive) clearInterval(keepAlive); };
    utterance.onend = () => { cleanup(); onEnd(); };
    utterance.onerror = () => { cleanup(); onEnd(); };

    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  });
}
