export function hablarTexto(texto: string, rate = 1): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(texto.replace(/[#*`[\]]/g, ''));
  utterance.lang = 'es-ES';
  utterance.rate = rate;
  synth.speak(utterance);
}

export function detenerVoz(): void {
  window.speechSynthesis.cancel();
}

export function hablarConCallback(
  texto: string,
  onStart: () => void,
  onEnd: () => void,
  rate = 1
): void {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(texto.replace(/[#*`[\]]/g, ''));
  utterance.lang = 'es-ES';
  utterance.rate = rate;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.speak(utterance);
}
