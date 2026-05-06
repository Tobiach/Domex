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
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { hablarTexto } from '../services/voiceService';
import { useUserProfile } from '../hooks/useUserProfile';
import { callGroq } from '../services/groqService';

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
        setInput(event.results[0][0].transcript);
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
    const inputActual = input;
    setInput('');
    setEstaEscribiendo(true);

    try {
      const sistemPrompt = `Eres Domex AI, el asistente estratégico personal del sistema Domex.
Tu tono es profesional, directo y analítico. Usás negritas y listas para estructurar bien.
Respondés SIEMPRE en español. Sos conciso y útil, como un socio de negocios senior.

Contexto del usuario:
- Nombre: ${profile.identity.nombre || usuario.nombre}
- Balance: ${usuario.balance} ${profile.goals.moneda}
- Tareas pendientes: ${tareas.filter(t => !t.completada).map(t => t.titulo).join(', ')}
- Ideas activas: ${ideas.map(i => i.titulo).join(', ')}`;

      const historial = mensajes.slice(-10).map(m => ({
        role: m.rol === 'usuario' ? 'user' as const : 'assistant' as const,
        content: m.contenido
      }));

      const text = await callGroq([
        { role: 'system', content: sistemPrompt },
        ...historial,
        { role: 'user', content: inputActual }
      ]);

      agregarMensaje({
        id: (Date.now() + 1).toString(),
        rol: 'asistente' as const,
        contenido: text || 'Error procesando la respuesta. Intentá de nuevo.',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      agregarMensaje({
        id: (Date.now() + 1).toString(),
        rol: 'asistente' as const,
        contenido: 'Error de conexión con Groq. Verificá la API key en Vercel.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setEstaEscribiendo(false);
    }
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
                    onClick={() => hablarTexto(msg.contenido)}
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
            onClick={manejarEnvio}
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
