import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Brain, Navigation, LayoutDashboard, X, ChevronRight, Check } from 'lucide-react';

export const TOUR_KEY = 'domex_tour_done';

const STEPS = [
  {
    icon: LayoutDashboard,
    color: 'var(--accent-main)',
    title: 'Tu centro de control',
    desc: 'El Dashboard muestra tus tareas prioritarias, balance de capital, hábitos activos y pipeline de CRM — todo en un vistazo.',
  },
  {
    icon: Mic,
    color: '#FF6D28',
    title: 'Dictá por voz',
    desc: 'Tocá el botón del micrófono y hablá en español natural. AIcolmena clasifica automáticamente tareas, gastos, reuniones e ideas.',
  },
  {
    icon: Brain,
    color: 'var(--accent-main)',
    title: 'AIcolmena AI — tu IA personal',
    desc: 'Tu asistente de inteligencia artificial con contexto de tu negocio. Pedile análisis, estrategias o respuestas directas.',
  },
  {
    icon: Navigation,
    color: '#FF6D28',
    title: 'Navegación por módulos',
    desc: 'Usá la barra inferior para moverte. Ideas · CRM · Capital · Hábitos · Optimización — todo conectado y personalizado.',
  },
];

interface AppTourProps {
  onComplete: () => void;
}

export default function AppTour({ onComplete }: AppTourProps) {
  const [step, setStep] = useState(0);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    onComplete();
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(6,6,14,0.8)', backdropFilter: 'blur(6px)' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="bm-card w-full max-w-sm p-7 space-y-6"
          style={{ borderColor: 'rgba(0,212,255,0.22)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="sys-label">GUÍA · PASO {step + 1} DE {STEPS.length}</span>
            <button
              onClick={dismiss}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{ boxShadow: [`0 0 16px ${current.color}22`, `0 0 32px ${current.color}44`, `0 0 16px ${current.color}22`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: `${current.color}12`,
                border: `1.5px solid ${current.color}30`,
              }}
            >
              <Icon size={34} style={{ color: current.color }} />
            </motion.div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2.5">
            <h2 className="text-xl font-black tracking-tight">{current.title}</h2>
            <p className="text-white/50 text-sm leading-relaxed">{current.desc}</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 22 : 6,
                  height: 6,
                  background: i === step ? 'var(--accent-main)' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest text-white/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              SALTAR
            </button>
            <button
              onClick={next}
              className="flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest text-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              style={{ background: 'var(--accent-main)' }}
            >
              {step === STEPS.length - 1 ? (
                <><Check size={13} /> LISTO</>
              ) : (
                <>SIGUIENTE <ChevronRight size={13} /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
