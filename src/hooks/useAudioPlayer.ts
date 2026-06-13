import { useState, useEffect } from 'react';
import { pausarVoz, reanudarVoz, detenerVoz } from '../services/voiceService';

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  title: string;
  pausar: () => void;
  reanudar: () => void;
  detener: () => void;
}

export function useAudioPlayer(): AudioPlayerState {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<{ title: string }>).detail;
      setIsPlaying(true);
      setIsPaused(false);
      setTitle(detail?.title ?? '');
    };
    const onEnd = () => { setIsPlaying(false); setIsPaused(false); setTitle(''); };
    const onPause = () => setIsPaused(true);
    const onResume = () => setIsPaused(false);

    document.addEventListener('aicolmena:audio:start', onStart);
    document.addEventListener('aicolmena:audio:end', onEnd);
    document.addEventListener('aicolmena:audio:pause', onPause);
    document.addEventListener('aicolmena:audio:resume', onResume);

    return () => {
      document.removeEventListener('aicolmena:audio:start', onStart);
      document.removeEventListener('aicolmena:audio:end', onEnd);
      document.removeEventListener('aicolmena:audio:pause', onPause);
      document.removeEventListener('aicolmena:audio:resume', onResume);
    };
  }, []);

  return { isPlaying, isPaused, title, pausar: pausarVoz, reanudar: reanudarVoz, detener: detenerVoz };
}
