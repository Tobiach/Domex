import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, Check, X, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { procesarVoz, iniciarReconocimientoVoz } from '../services/voiceProcessor';
import { VoiceProcessorResult } from '../types';
import { cn } from '../lib/utils';

type Estado = 'idle' | 'escuchando' | 'procesando' | 'confirmando' | 'guardado' | 'error';

const TIPO_LABELS: Record<string, string> = {
  tarea: 'Tarea',
  reunion: 'Reunión',
  gasto: 'Gasto',
  idea: 'Idea',
  nota: 'Nota',
};

const TIPO_COLORS: Record<string, string> = {
  tarea: 'bg-primary',
  reunion: 'bg-blue-500',
  gasto: 'bg-red-500',
  idea: 'bg-amber-500',
  nota: 'bg-emerald-500',
};

export default function FloatingMicButton() {
  const { agregarTarea, agregarAgenda, agregarTransaccion, agregarIdea } = useApp();
  const [estado, setEstado] = useState<Estado>('idle');
  const [resultado, setResultado] = useState<VoiceProcessorResult | null>(null);
  const [toast, setToast] = useState('');
  const stopRef = useRef<(() => void) | null>(null);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const iniciar = () => {
    setEstado('escuchando');
    const stop = iniciarReconocimientoVoz(
      async (transcript) => {
        setEstado('procesando');
        try {
          const res = await procesarVoz(transcript);
          if (res.confianza >= 85) {
            guardar(res);
          } else {
            setResultado(res);
            setEstado('confirmando');
          }
        } catch {
          setEstado('error');
          setTimeout(() => setEstado('idle'), 2000);
        }
      },
      () => {
        if (estado === 'escuchando') setEstado('idle');
      }
    );
    stopRef.current = stop;
  };

  const guardar = (res: VoiceProcessorResult) => {
    const hoy = new Date().toISOString().split('T')[0];

    switch (res.tipo) {
      case 'tarea':
        agregarTarea({
          titulo: res.titulo,
          prioridad: res.prioridad === 'alta' ? 'alta' : res.prioridad === 'baja' ? 'baja' : 'media',
          esFoco: res.prioridad === 'alta',
          fechaVencimiento: res.detalles.fecha || hoy,
        });
        break;
      case 'reunion':
        agregarAgenda({
          titulo: res.titulo,
          personas: res.detalles.personas || [],
          fecha: res.detalles.fecha || hoy,
          hora: res.detalles.hora || '09:00',
          contexto: res.detalles.contexto || undefined,
          tipo: 'reunion',
        });
        break;
      case 'gasto':
        agregarTransaccion({
          tipo: 'gasto',
          monto: res.detalles.monto || 0,
          categoria: res.detalles.categoria || 'Otros',
          descripcion: res.titulo,
        });
        break;
      case 'idea':
        agregarIdea({
          titulo: res.titulo,
          descripcion: res.detalles.contexto || res.titulo,
          estado: 'idea',
        });
        break;
    }

    setResultado(null);
    setEstado('guardado');
    mostrarToast(`${TIPO_LABELS[res.tipo] || 'Item'} guardado`);
    setTimeout(() => setEstado('idle'), 1500);
  };

  const cancelar = () => {
    stopRef.current?.();
    setResultado(null);
    setEstado('idle');
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Check size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {estado === 'confirmando' && resultado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm bg-[#0F0F17] border border-white/10 rounded-3xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-amber-400" />
                <p className="text-sm font-black text-white/60 uppercase tracking-widest">Confirmar</p>
              </div>

              <div className={cn('px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest w-fit', TIPO_COLORS[resultado.tipo] || 'bg-primary')}>
                {TIPO_LABELS[resultado.tipo]}
              </div>

              <p className="text-lg font-bold leading-snug">{resultado.titulo}</p>
              {resultado.detalles.contexto && (
                <p className="text-sm text-white/40">{resultado.detalles.contexto}</p>
              )}
              <p className="text-[10px] text-white/20 font-medium">Confianza: {resultado.confianza}%</p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelar}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <X size={14} />
                  Cancelar
                </button>
                <button
                  onClick={() => guardar(resultado)}
                  className="flex-2 flex-grow py-3 rounded-2xl bg-primary text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={estado === 'idle' ? iniciar : estado === 'escuchando' ? cancelar : undefined}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'fixed bottom-24 right-4 z-30 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all',
          estado === 'idle' && 'bg-white/10 border border-white/20 hover:bg-white/15',
          estado === 'escuchando' && 'bg-red-500 shadow-red-500/40',
          estado === 'procesando' && 'bg-primary',
          estado === 'guardado' && 'bg-emerald-500',
          estado === 'error' && 'bg-red-500/50',
          (estado === 'confirmando') && 'hidden',
        )}
      >
        {estado === 'escuchando' && (
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute inset-0 rounded-full bg-red-500/40"
          />
        )}
        {estado === 'idle' && <Mic size={22} className="text-white/60" />}
        {estado === 'escuchando' && <MicOff size={22} className="text-white" />}
        {estado === 'procesando' && <Loader2 size={22} className="text-white animate-spin" />}
        {estado === 'guardado' && <Check size={22} className="text-white" />}
        {estado === 'error' && <X size={22} className="text-white" />}
      </motion.button>
    </>
  );
}
