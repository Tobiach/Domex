import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Plus, Check, Trash2, X, Trophy, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

const ICONOS = ['💪', '📚', '🧘', '💧', '🏃', '📞', '✍️', '🎯', '🌅', '🧠', '🥗', '😴'];

function SemanaCirculos({ racha, completadoHoy }: { racha: number; completadoHoy: boolean }) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      {Array.from({ length: 7 }, (_, i) => {
        const fromRight = 6 - i;
        const filled = fromRight === 0 ? completadoHoy : fromRight < racha;
        return (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: filled ? 'var(--honey-core)' : 'rgba(255,255,255,0.08)',
          }} />
        );
      })}
    </div>
  );
}

function RingProgress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? value / total : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct === 1 ? '#10B981' : pct >= 0.5 ? '#7C3AED' : 'rgba(255,255,255,0.15)';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 64 64)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums leading-none">{value}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">de {total}</span>
      </div>
    </div>
  );
}

export default function Habitos() {
  const { habitos, completarHabito, agregarHabito, eliminarHabito } = useApp();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoIcono, setNuevoIcono] = useState('💪');
  const [celebrando, setCelebrando] = useState<string | null>(null);
  const [showRecordBanner, setShowRecordBanner] = useState(false);

  useEffect(() => {
    if (!showRecordBanner) return;
    const t = setTimeout(() => setShowRecordBanner(false), 3000);
    return () => clearTimeout(t);
  }, [showRecordBanner]);

  const completadosHoy = habitos.filter(h => h.completadoHoy).length;
  const rachaMaxima = habitos.reduce((max, h) => Math.max(max, h.racha), 0);
  const rachaPromedio = habitos.length
    ? Math.round(habitos.reduce((sum, h) => sum + h.racha, 0) / habitos.length)
    : 0;

  const handleCompletar = (id: string) => {
    const habito = habitos.find(h => h.id === id);
    const isNewRecord = habito && !habito.completadoHoy && (habito.racha + 1 > rachaMaxima);
    completarHabito(id);
    setCelebrando(id);
    if (isNewRecord) setShowRecordBanner(true);
    setTimeout(() => setCelebrando(null), 800);
  };

  const handleAgregar = () => {
    if (!nuevoTitulo.trim()) return;
    agregarHabito(nuevoTitulo.trim(), nuevoIcono);
    setNuevoTitulo('');
    setNuevoIcono('💪');
    setMostrarForm(false);
  };

  const pendientes = habitos.filter(h => !h.completadoHoy);
  const completados = habitos.filter(h => h.completadoHoy);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {/* Record banner */}
      <AnimatePresence>
        {showRecordBanner && (
          <motion.div
            initial={{ opacity: 0, y: -48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -48 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-safe"
            style={{ paddingTop: 'env(safe-area-inset-top, 16px)' }}
          >
            <div className="flex items-center gap-2 px-6 py-3 rounded-b-2xl"
              style={{ background: 'var(--honey-core)', boxShadow: '0 4px 24px rgba(201,148,26,0.45)' }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-on-honey)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                ¡Nueva racha máxima!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Hábitos</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Consistencia diaria</p>
        </div>
        {rachaMaxima > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-2xl">
            <Trophy size={12} className="text-orange-400" />
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Récord {rachaMaxima}d</span>
          </div>
        )}
      </header>

      {/* Ring + Stats */}
      <div className="glass-card p-6 bg-white/[0.02] border-white/5 flex items-center gap-6">
        <RingProgress value={completadosHoy} total={habitos.length} />
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Hoy</p>
            <p className="text-xl font-black leading-none">
              {completadosHoy === habitos.length && habitos.length > 0
                ? <span className="text-emerald-400">¡Completo! 🔥</span>
                : `${habitos.length - completadosHoy} pendiente${habitos.length - completadosHoy !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Racha prom.</p>
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-orange-400" />
                <span className="text-sm font-black text-orange-400">{rachaPromedio}d</span>
              </div>
            </div>
            <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/25 mb-0.5">Activos</p>
              <div className="flex items-center gap-1">
                <Zap size={12} className="text-primary" />
                <span className="text-sm font-black text-primary">{habitos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <section className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 px-1">Pendientes</p>
          <div className="space-y-2">
            <AnimatePresence>
              {pendientes.map((habito) => (
                <motion.div
                  key={habito.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card bg-white/[0.02] border-white/5 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <motion.button
                      onClick={() => handleCompletar(habito.id)}
                      whileTap={{ scale: 0.88 }}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 transition-all flex items-center justify-center text-2xl shrink-0"
                    >
                      {habito.icono}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] tracking-tight leading-tight">{habito.titulo}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-full",
                          habito.racha >= 21 ? "bg-orange-500/20" :
                          habito.racha >= 7 ? "bg-amber-500/20" : "bg-white/5"
                        )}>
                          <Flame size={10} className={
                            habito.racha >= 21 ? "text-orange-400" :
                            habito.racha >= 7 ? "text-amber-400" : "text-white/30"
                          } />
                          <span className={cn(
                            "text-[10px] font-black",
                            habito.racha >= 21 ? "text-orange-400" :
                            habito.racha >= 7 ? "text-amber-400" : "text-white/30"
                          )}>
                            {habito.racha}d
                          </span>
                        </div>
                        {habito.horario && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(201,148,26,0.1)', color: 'var(--honey-core)', border: '1px solid rgba(201,148,26,0.2)' }}>
                            ⏰ {habito.horario}
                          </span>
                        )}
                        {habito.frecuencia && (
                          <span className="text-[9px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                            {habito.frecuencia}
                          </span>
                        )}
                      </div>
                      <SemanaCirculos racha={habito.racha} completadoHoy={habito.completadoHoy} />
                    </div>

                    <button
                      onClick={() => eliminarHabito(habito.id)}
                      className="p-2 text-white/15 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Completados */}
      {completados.length > 0 && (
        <section className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 px-1">Completados hoy</p>
          <div className="space-y-2">
            <AnimatePresence>
              {completados.map((habito) => (
                <motion.div
                  key={habito.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card bg-emerald-500/5 border-emerald-500/15 overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <motion.div
                      initial={celebrando === habito.id ? { scale: 0.5 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0"
                    >
                      <Check size={22} className="text-emerald-400" strokeWidth={3} />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] tracking-tight leading-tight text-white/50 line-through">
                        {habito.titulo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Flame size={10} className="text-orange-400" />
                        <span className="text-[10px] font-black text-orange-400">{habito.racha} días</span>
                      </div>
                    </div>

                    <button
                      onClick={() => eliminarHabito(habito.id)}
                      className="p-2 text-white/10 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Empty */}
      {habitos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
            🌱
          </div>
          <div className="text-center">
            <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Sin hábitos todavía</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Decí <span style={{ color: 'var(--honey-bright)' }}>"Hábito: tomar agua al levantarme"</span>
            </p>
          </div>
        </div>
      )}

      {/* Botón / Form */}
      <AnimatePresence mode="wait">
        {mostrarForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-5 bg-white/[0.03] border-white/10 space-y-5"
          >
            <div className="flex justify-between items-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Nuevo hábito</p>
              <button
                onClick={() => setMostrarForm(false)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selector iconos */}
            <div className="grid grid-cols-6 gap-2">
              {ICONOS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNuevoIcono(icon)}
                  className={cn(
                    "h-11 rounded-xl text-xl transition-all",
                    nuevoIcono === icon
                      ? "bg-primary/25 border-2 border-primary/60 scale-110 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">{nuevoIcono}</span>
              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAgregar()}
                placeholder="Nombre del hábito..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/50 placeholder:text-white/20 transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={handleAgregar}
              disabled={!nuevoTitulo.trim()}
              className="w-full py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              Agregar hábito
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setMostrarForm(true)}
            className="w-full py-4 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 hover:border-primary/40 hover:text-primary transition-all group"
          >
            <div className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plus size={13} />
            </div>
            Agregar hábito
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
