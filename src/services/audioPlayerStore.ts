export function dispatchAudioStart(title: string): void {
  document.dispatchEvent(new CustomEvent('aicolmena:audio:start', { detail: { title } }));
}

export function dispatchAudioEnd(): void {
  document.dispatchEvent(new CustomEvent('aicolmena:audio:end'));
}

export function dispatchAudioPause(): void {
  document.dispatchEvent(new CustomEvent('aicolmena:audio:pause'));
}

export function dispatchAudioResume(): void {
  document.dispatchEvent(new CustomEvent('aicolmena:audio:resume'));
}
