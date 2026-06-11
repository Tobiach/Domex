import { useCallback, useEffect, useRef, useState } from 'react';
import { procesarVozInteligente, UserContext, VoiceIntelligenceResult } from '../services/voiceProcessor';

export type VoiceEstado = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceEngineState {
  estado: VoiceEstado;
  /** Partial/interim text shown in real time while user speaks */
  transcriptLive: string;
  /** Final confirmed transcript sent to AI */
  transcriptFinal: string;
  /** AI result after processing */
  resultado: VoiceIntelligenceResult | null;
  /** Human-readable error reason */
  errorMsg: string;
}

const INITIAL: VoiceEngineState = {
  estado: 'idle',
  transcriptLive: '',
  transcriptFinal: '',
  resultado: null,
  errorMsg: '',
};

// Maps Web Speech API error codes to Spanish user-friendly messages
const ERROR_MAP: Record<string, string> = {
  'no-speech':           'No detecté tu voz. Hablá más cerca del micrófono.',
  'not-allowed':         'Permiso denegado. Activá el micrófono en la configuración de tu navegador.',
  'network':             'Error de red al procesar la voz.',
  'audio-capture':       'No se encontró micrófono en este dispositivo.',
  'service-not-allowed': 'Servicio de reconocimiento no disponible.',
};

export interface VoiceEngineActions {
  iniciar: () => void;
  cancelar: () => void;
  reintentar: () => void;
  dismissarExito: () => void;
}

export function useVoiceEngine(
  getContext: () => UserContext
): VoiceEngineState & VoiceEngineActions {
  const [state, setState] = useState<VoiceEngineState>(INITIAL);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const getContextRef = useRef(getContext);

  // Keep context getter current without re-creating the hook
  getContextRef.current = getContext;

  const patch = (updates: Partial<VoiceEngineState>) =>
    setState(prev => ({ ...prev, ...updates }));

  const destroyRecognition = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    // Null out handlers before stopping to avoid ghost callbacks
    r.onresult = null;
    r.onerror = null;
    r.onend = null;
    try { r.stop(); } catch { /* ignore if already stopped */ }
    recognitionRef.current = null;
  }, []);

  const procesarComando = useCallback(async (transcript: string) => {
    patch({ estado: 'processing', transcriptFinal: transcript, transcriptLive: transcript });
    try {
      const result = await procesarVozInteligente(transcript, getContextRef.current());
      patch({ estado: 'success', resultado: result });
    } catch {
      patch({
        estado: 'error',
        errorMsg: 'Error de conexión. Verificá tu internet e intentá de nuevo.',
      });
    }
  }, []);

  const buildAndStartRecognition = useCallback(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      patch({
        estado: 'error',
        errorMsg: 'Tu navegador no soporta reconocimiento de voz. Usá Chrome en Android o Safari en iOS.',
      });
      return;
    }

    finalTranscriptRef.current = '';

    const recognition = new SpeechRec();
    recognition.lang = 'es-AR';
    recognition.continuous = false;
    // KEY IMPROVEMENT: interimResults shows partial text while user speaks
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscriptRef.current = text;
        }
        // Update live display on every interim or final result
        patch({ transcriptLive: finalTranscriptRef.current || text });
      }
    };

    recognition.onerror = (e: any) => {
      recognitionRef.current = null;
      // 'aborted' desde iOS puede ser una interrupción inesperada del sistema
      // (no nuestra llamada a stop(), porque esa nullea el handler antes).
      // Si estábamos escuchando activamente, mostramos error con opción de reintentar.
      if (e.error === 'aborted') {
        setState(prev =>
          prev.estado === 'listening'
            ? { ...prev, estado: 'error', errorMsg: 'El micrófono fue interrumpido. Tocá reintentar.' }
            : INITIAL
        );
        return;
      }
      patch({
        estado: 'error',
        errorMsg: ERROR_MAP[e.error as string] ?? `Error de micrófono: ${e.error}`,
      });
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      const transcript = finalTranscriptRef.current.trim();
      if (transcript) {
        procesarComando(transcript);
      } else {
        // Still in 'listening' means no speech was captured (no onerror fired)
        setState(prev =>
          prev.estado === 'listening'
            ? { ...prev, estado: 'error', errorMsg: 'No detecté nada. Hablá más fuerte e intentá de nuevo.' }
            : prev
        );
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      patch({ estado: 'error', errorMsg: 'No se pudo iniciar el micrófono.' });
    }
  }, [procesarComando]);

  const iniciar = useCallback(() => {
    destroyRecognition();
    setState({ ...INITIAL, estado: 'listening' });
    buildAndStartRecognition();
  }, [destroyRecognition, buildAndStartRecognition]);

  const cancelar = useCallback(() => {
    destroyRecognition();
    setState(INITIAL);
  }, [destroyRecognition]);

  const dismissarExito = useCallback(() => {
    setState(INITIAL);
  }, []);

  // Retry reuses the same start flow
  const reintentar = useCallback(() => {
    destroyRecognition();
    setState({ ...INITIAL, estado: 'listening' });
    buildAndStartRecognition();
  }, [destroyRecognition, buildAndStartRecognition]);

  return { ...state, iniciar, cancelar, reintentar, dismissarExito };
}
