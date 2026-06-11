import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RefreshCw, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { generateDailyPriorities, getPrioritiesCache } from '../services/prioritizationService';

const IMPACT_COLOR = {
  ALTO:  { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#f87171' },
  MEDIO: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fbbf24' },
  BAJO:  { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.3)' },
};

export default function DailyPriorities() {
  const { tareas, agenda, balanceCalculado } = useApp();
  const { profile } = useUserProfile();
  const today = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => getPrioritiesCache(today));

  const generate = useCallback(async (force = false) => {
    if (loading) return;
    if (!force && result) return;
    setLoading(true);
    try {
      const r = await generateDailyPriorities(tareas, agenda, balanceCalculado, profile.identity.nombre || 'Operador');
      setResult(r);
    } finally {
      setLoading(false);
    }
  }, [tareas, agenda, balanceCalculado, profile.identity.nombre, loading, result]);

  useEffect(() => {
    if (!result) generate();
  }, []);

  if (!result && !loading) return null;

  return (
    <section className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Zap size={10} style={{ color: 'var(--accent-secondary)' }} />
          <span className="sys-label" style={{ color: 'var(--accent-secondary)', letterSpacing: '0.15em' }}>PROTOCOLO DEL DÍA</span>
        </div>
        <button
          onClick={() => generate(true)}
          disabled={loading}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-70 disabled:opacity-30"
        >
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span className="sys-label text-[8px]">{loading ? 'ANALIZANDO...' : 'ACTUALIZAR IA'}</span>
        </button>
      </div>

      {/* Card */}
      <div className="bm-card overflow-hidden" style={{ borderColor: 'rgba(255,109,40,0.12)' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 flex items-center gap-3"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#FF6D28' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="sys-label">IA CALCULANDO PRIORIDADES...</span>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Resumen */}
              <div className="px-4 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] text-white/40 italic">{result.resumen}</span>
              </div>

              {/* Prioridades */}
              {result.prioridades.map((p, i) => {
                const cfg = IMPACT_COLOR[p.impacto] ?? IMPACT_COLOR.BAJO;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                  >
                    {/* Rank */}
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center shrink-0 font-black text-[10px]"
                      style={{ background: 'rgba(255,109,40,0.12)', color: '#FF6D28', border: '1px solid rgba(255,109,40,0.2)' }}
                    >
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold leading-tight truncate text-white/90">{p.titulo}</p>
                      <span className="sys-label text-[9px] leading-none" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.razon}</span>
                    </div>

                    {/* Impact badge */}
                    <div
                      className="px-2 py-0.5 rounded shrink-0"
                      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                    >
                      <span className="sys-label text-[8px]" style={{ color: cfg.text }}>{p.impacto}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
