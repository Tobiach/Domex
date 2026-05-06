import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  X, 
  Trash2,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { sintetizarVoz, reproducirAudio } from '../services/voiceService';
import { useUserProfile } from '../hooks/useUserProfile';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Speech Recognition Type Definition
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

export default function DomexAI() {
  const { mensajes, agregarMensaje, tareas, usuario, ideas } = useApp();
  const { profile } = useUserProfile();
  const [input, setInput] = useState('');
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const [estaHablando, setEstaHablando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionClass = SpeechRecognition || webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setEstaEscuchando(false);
      };

      recognition.onerror = () => setEstaEscuchando(false);
      recognition.onend = () => setEstaEscuchando(false);

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, estaEscribiendo]);

  const manejarEnvio = async () => {
    if (!input.trim() || estaEscribiendo) return;

    const mensajeUsuario = {
      id: Date.now().toString(),
      rol: 'usuario' as const,
      contenido: input,
      timestamp: new Date().toISOString()
    };

    agregarMensaje(mensajeUsuario);
    setInput('');
    setEstaEscribiendo(true);

    try {
      const contextoSistema = `
        Eres Domex AI, el "Cerebro" de un sistema de control total para emprendedores desarrollado por Domex.
        Tu tono es profesional, premium, directo y analítico, similar a ChatGPT pero especializado en gestión estratégica.
        Usa emojis de forma moderada y profesional para estructurar la información.
        Usa negritas (**texto**) y listas para que las respuestas sean fáciles de leer.
        Responde SIEMPRE en español.
        
        Contexto del usuario actual:
        - Nombre: ${profile.identity.nombre || usuario.nombre}
        - Balance: ${usuario.balance} ${profile.goals.moneda}
        - Tareas foco configuradas: ${profile.goals.tareasFocoDiarias}
        - Tareas actuales: ${tareas.filter(t => !t.completada).map(t => t.titulo).join(', ')}
        - Ideas en proyecto: ${ideas.map(i => i.titulo).join(', ')}
        
        Tu objetivo es ayudar al usuario a ordenar sus ideas, sugerir acciones y ser su compañero estratégico.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...mensajes.map(m => ({ role: m.rol === 'usuario' ? 'user' : 'model', parts: [{ text: m.contenido }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: contextoSistema
        }
      });

      const text = response.text;

      const mensajeAI = {
        id: (Date.now() + 1).toString(),
        rol: 'asistente' as const,
        contenido: text || "Lo siento, tuve un problema procesando eso. ¿Puedes repetirlo?",
        timestamp: new Date().toISOString()
      };

      agregarMensaje(mensajeAI);
      
      if (estaEscuchando || estaHablando) {
        hablarMensaje(mensajeAI.contenido);
      }
    } catch (error) {
      console.error(error);
      agregarMensaje({
        id: (Date.now() + 1).toString(),
        rol: 'asistente' as const,
        contenido: "Error de conexión con el cerebro central. Reintentando...",
        timestamp: new Date().toISOString()
      });
    } finally {
      setEstaEscribiendo(false);
    }
  };

  const hablarMensaje = async (texto: string) => {
    if (estaHablando) return;
    setEstaHablando(true);
    const audio64 = await sintetizarVoz(texto.replace(/[#*`]/g, ''));
    if (audio64) {
      reproducirAudio(audio64);
    }
    setEstaHablando(false);
  };

  const alternarEscucha = () => {
    if (estaEscuchando) {
      recognitionRef.current?.stop();
    } else {
      setEstaEscuchando(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4 -mt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">Domex AI</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Neuro-Link Activo</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="p-2 h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-white/40" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-6 scroll-smooth pr-1" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {mensajes.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3 w-full",
                msg.rol === 'usuario' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                msg.rol === 'asistente' ? "bg-primary text-white" : "bg-white/10 text-white/60"
              )}>
                {msg.rol === 'asistente' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm relative group",
                msg.rol === 'asistente' 
                  ? "bg-white/[0.03] border border-white/5 text-white/90" 
                  : "bg-primary text-white font-medium"
              )}>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.contenido}
                  </ReactMarkdown>
                </div>
                {msg.rol === 'asistente' && (
                  <button 
                    onClick={() => hablarMensaje(msg.contenido)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {estaEscribiendo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <Loader2 size={18} className="animate-spin" />
            </div>
            <div className="bg-white/5 border border-white/5 p-3 px-4 rounded-2xl italic text-[13px] text-white/40 font-medium tracking-tight">
              Domex procesando datos...
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative group pb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000" />
        <div className="relative flex items-center">
          <button
            onClick={alternarEscucha}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10",
              estaEscuchando ? "text-primary scale-125 animate-pulse" : "text-white/20 hover:text-white"
            )}
          >
            {estaEscuchando ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && manejarEnvio()}
            placeholder={estaEscuchando ? "Escuchando..." : "Analizar estrategia de hoy..."}
            className={cn(
              "w-full bg-surface-lighter border border-white/10 rounded-2xl py-4 px-12 pr-14 focus:outline-none focus:border-primary/50 transition-all font-medium text-[15px] placeholder:text-white/20 shadow-2xl",
              estaEscuchando && "border-primary/50 bg-primary/5"
            )}
          />
          <button
            onClick={() => manejarEnvio()}
            disabled={estaEscribiendo || !input.trim()}
            className={cn(
              "absolute right-2.5 w-10 h-10 flex items-center justify-center rounded-xl transition-all",
              input.trim() ? "premium-gradient text-white" : "text-white/20"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
