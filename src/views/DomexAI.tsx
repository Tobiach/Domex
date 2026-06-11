import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Volume2, RotateCcw, X } from 'lucide-react';
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

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0,1,2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--color-accent)' }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      <span className="sys-label ml-2">PROCESANDO QUERY</span>
    </div>
  );
}

export default function DomexAI() {
  const { mensajes, agregarMensaje, limpiarMensajes, tareas, usuario, ideas } = useApp();
  const { profile } = useUserProfile();
  const [input, setInput] = useState('');
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SR = SpeechRecognition || webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = false;
      r.interimResults = false;
      r.lang = 'es-AR';
      r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setEstaEscuchando(false); };
      r.onerror = () => setEstaEscuchando(false);
      r.onend = () => setEstaEscuchando(false);
      recognitionRef.current = r;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes, estaEscribiendo]);

  const manejarEnvio = async () => {
    if (!input.trim() || estaEscribiendo) return;
    const msg = { id: Date.now().toString(), rol: 'usuario' as const, contenido: input, timestamp: new Date().toISOString() };
    agregarMensaje(msg);
    const inputActual = input;
    setInput('');
    setEstaEscribiendo(true);

    try {
      const sistemPrompt = `Eres AIcolmena AI, el asistente estratégico personal del sistema AIcolmena.
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
        id: (Date.now() + 1).toString(), rol: 'asistente' as const,
        contenido: text || 'Error procesando la respuesta. Intentá de nuevo.',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
      agregarMensaje({
        id: (Date.now() + 1).toString(), rol: 'asistente' as const,
        contenido: 'ERROR_502: Falla en conexión neural. Verificá la API key en Vercel.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setEstaEscribiendo(false);
    }
  };

  const alternarEscucha = () => {
    if (estaEscuchando) recognitionRef.current?.stop();
    else { setEstaEscuchando(true); recognitionRef.current?.start(); }
  };

  const nombre = profile.identity.nombre || 'OPERADOR';

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-4 -mt-4">

      {/* ── HEADER ── */}
      <header className="bm-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.28)' }}>
            <span className="text-[15px]">⬡</span>
            <div className="absolute -top-0.5 -right-0.5 live-dot" style={{ width: 5, height: 5 }} />
          </div>
          <div>
            <p className="text-[13px] font-black tracking-tight leading-none">COLMENA</p>
            <p className="sys-label mt-0.5" style={{ color: '#10B981', opacity: 1 }}>NEURAL LINK · ACTIVO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={limpiarMensajes}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            title="Nueva sesión"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {mensajes.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex items-end gap-2', msg.rol === 'usuario' ? 'flex-row-reverse' : '')}
            >
              {/* Avatar */}
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 mb-0.5',
                msg.rol === 'asistente'
                  ? 'text-primary'
                  : 'text-white/50'
              )} style={{
                background: msg.rol === 'asistente' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${msg.rol === 'asistente' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                {msg.rol === 'asistente' ? '⬡' : nombre.charAt(0).toUpperCase()}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[82%] min-w-0 relative group', msg.rol === 'usuario' ? 'items-end' : 'items-start')}>
                {msg.rol === 'asistente' && (
                  <span className="sys-label block mb-1 ml-1">COLMENA</span>
                )}
                <div
                  className={cn('px-4 py-3 text-[14px] leading-relaxed relative', msg.rol === 'usuario' ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm')}
                  style={msg.rol === 'asistente' ? {
                    background: 'rgba(12,12,22,0.95)',
                    border: '1px solid rgba(0,212,255,0.12)',
                    color: 'rgba(255,255,255,0.85)',
                  } : {
                    background: 'var(--accent-main)',
                    color: 'white',
                    fontWeight: 500,
                  }}
                >
                  {msg.rol === 'asistente' ? (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.contenido}</ReactMarkdown>
                    </div>
                  ) : msg.contenido}

                  {msg.rol === 'asistente' && (
                    <button
                      onClick={() => hablarTexto(msg.contenido)}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/60 p-1.5"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {estaEscribiendo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] text-primary shrink-0"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              ⬡
            </div>
            <div className="bm-card" style={{ background: 'rgba(12,12,22,0.95)' }}>
              <TypingDots />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── INPUT TERMINAL ── */}
      <div className="pb-4 relative">
        <div className="bm-card flex items-center gap-0 overflow-hidden" style={{ border: estaEscuchando ? '1px solid rgba(0,212,255,0.35)' : undefined }}>
          {/* Terminal prefix */}
          <span className="sys-value text-primary/60 text-[12px] pl-4 pr-1 shrink-0 select-none">&gt;_</span>

          {/* Mic */}
          <button
            onClick={alternarEscucha}
            className={cn('p-3 transition-all', estaEscuchando ? 'text-primary' : 'text-white/20 hover:text-white/50')}
          >
            {estaEscuchando
              ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><MicOff size={17} /></motion.div>
              : <Mic size={17} />
            }
          </button>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && manejarEnvio()}
            placeholder={estaEscuchando ? 'ESCUCHANDO...' : 'Ingresá tu consulta...'}
            className="flex-1 bg-transparent py-4 pr-2 text-[14px] font-medium focus:outline-none placeholder:text-white/15"
            style={{ fontFamily: 'inherit' }}
          />

          {/* Send */}
          <button
            onClick={manejarEnvio}
            disabled={estaEscribiendo || !input.trim()}
            className={cn(
              'w-10 h-10 mr-1.5 my-1.5 rounded-xl flex items-center justify-center transition-all shrink-0',
              input.trim() && !estaEscribiendo
                ? 'text-white shadow-lg'
                : 'text-white/20 cursor-not-allowed'
            )}
            style={input.trim() && !estaEscribiendo ? { background: 'var(--accent-main)', boxShadow: '0 0 12px rgba(0,212,255,0.28)' } : { background: 'rgba(255,255,255,0.04)' }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
