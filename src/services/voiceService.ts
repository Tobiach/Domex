import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sintetizarVoz(texto: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: texto }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error en síntesis de voz:", error);
    return null;
  }
}

export function reproducirAudio(base64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // El modelo TTS de Gemini devuelve audio PCM lineal de 16 bits a 24000Hz (mono)
      const sampleRate = 24000;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const dataView = new DataView(bytes.buffer);
      const numSamples = len / 2;
      const float32Data = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const sample = dataView.getInt16(i * 2, true);
        float32Data[i] = sample / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        audioContext.close();
        resolve();
      };

      source.start(0);
    } catch (error) {
      console.error("Error al reproducir el audio:", error);
      reject(error);
    }
  });
}
