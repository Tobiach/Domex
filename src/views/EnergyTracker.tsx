import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Moon, AlertTriangle, ChevronLeft, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analizarEnergia } from '../services/energyService';
import { hablarTexto } from '../services/voiceService';
import type { EnergyEntry } from '../types';

const HOY = new Date().toISOString().split('T')[0];

const STRES_TOPICS = ['mercado', 'deudas', 'trabajo', 'relaciones', 'salud', 'tiempo', 'dinero'];

function ScoreBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function MiniChart({ entries }: { entries: EnergyEntry[] }) {
  const last7 = entries.slice(0, 7).reverse();
  const max = 10;
  return (
    <div className="flex items-end gap-1 h-12">
      {last7.map((e, i) => {
        const h = Math.max(4, (e.score / max) * 48);
        const color = e.score >= 7 ? '#10B981' : e.score >= 5 ? '#F59E0B' : '#EF4444';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <motion.div
              className="w-full rounded-sm"
              style={{ height: h, background: color, opacity: 0.85 }}
              initial={{ height: 0 }}
              animate={{ height: h }}
              transition={{ delay: i * 0.05 }}
            />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              {e.fecha.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EnergyTracker() {
  const { energyEntries, registrarEnergia } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [score, setScore] = useState(7);
  const [sueno, setSueno] = useState(7);
  const [tipoDeSueno, setTipoDeSueno] = useState<EnergyEntry['factores']['tipoDeSueno']>('profundo');
  const [estresTopics, setEstresTopics] = useState<string[]>([]);
  const [analizando, setAnalizando] = useState(false);

  const yaRegistroHoy = energyEntries.some(e => e.fecha === HOY);
  const entradaHoy = energyEntries.find(e => e.fecha === HOY);
  const promedio = energyEntries.length > 0
    ? (energyEntries.reduce((a, e) => a + e.score, 0) / energyEntries.length).toFixed(1)
    : '—';

  const tendencia = energyEntries.length >= 2
    ? energyEntries[0].score - energyEntries[1].score
    : 0;

  const TrendIcon = tendencia > 0 ? TrendingUp : tendencia < 0 ? TrendingDown : Minus;
  const trendColor = tendencia > 0 ? '#10B981' : tendencia < 0 ? '#EF4444' : 'rgba(255,255,255,0.4)';

  const toggleStres = (topic: string) => {
    setEstresTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const guardar = async () => {
    setAnalizando(true);
    const entry: EnergyEntry = {
      id: `energy_${Date.now()}`,
      fecha: HOY,
      score,
      factores: { sueno, tipoDeSueno, estresTopics },
      creadoEn: new Date().toISOString(),
    };

    try {
      const { analisisIA, recomendacion } = await analizarEnergia(entry, energyEntries);
      entry.analisisIA = analisisIA;
      entry.recomendacion = recomendacion;
    } catch {
      entry.analisisIA = 'Análisis no disponible.';
      entry.recomendacion = 'Mantené una rutina de sueño consistente.';
    }

    registrarEnergia(entry);
    setAnalizando(false);
    setShowForm(false);
  };

  const scoreColor = (s: number) => s >= 7 ? '#10B981' : s >= 5 ? '#F59E0B' : '#EF4444';
  const scoreLabel = (s: number) => s >= 8 ? 'ÓPTIMO' : s >= 6 ? 'NORMAL' : s >= 4 ? 'BAJO' : 'CRÍTICO';

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#10B981' } as any} />
          <span className="sys-label">MÓDULO SALUD</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Energy<br />Tracker</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bm-card p-3">
          <span className="sys-label block mb-1">HOY</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black sys-value" style={{ color: entradaHoy ? scoreColor(entradaHoy.score) : 'rgba(255,255,255,0.3)' }}>
              {entradaHoy ? entradaHoy.score : '—'}
            </span>
            {entradaHoy && <span className="sys-label mb-0.5">/10</span>}
          </div>
          {entradaHoy && <span className="sys-label" style={{ color: scoreColor(entradaHoy.score) }}>{scoreLabel(entradaHoy.score)}</span>}
        </div>
        <div className="bm-card p-3">
          <span className="sys-label block mb-1">PROM. 7D</span>
          <span className="text-2xl font-black sys-value">{promedio}</span>
        </div>
        <div className="bm-card p-3">
          <span className="sys-label block mb-1">TENDENCIA</span>
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon size={20} style={{ color: trendColor }} />
            {tendencia !== 0 && (
              <span className="font-black sys-value" style={{ color: trendColor }}>
                {tendencia > 0 ? '+' : ''}{tendencia}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico 7 días */}
      {energyEntries.length > 0 && (
        <div className="bm-card p-4">
          <span className="sys-label block mb-3">ÚLTIMOS 7 DÍAS</span>
          <MiniChart entries={energyEntries} />
        </div>
      )}

      {/* Check-in hoy */}
      {!yaRegistroHoy ? (
        <motion.button
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.97 }}
          className="w-full bm-card p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(16,185,129,0.3)' }}
        >
          <div>
            <span className="sys-label block mb-1" style={{ color: '#10B981' }}>CHECK-IN PENDIENTE</span>
            <p className="font-black text-lg">¿Cómo está tu energía hoy?</p>
          </div>
          <Zap size={28} style={{ color: '#10B981' }} />
        </motion.button>
      ) : entradaHoy && (
        <div className="bm-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="live-dot" />
            <span className="sys-label" style={{ color: '#10B981' }}>REGISTRADO HOY</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-5xl font-black sys-value" style={{ color: scoreColor(entradaHoy.score) }}>
              {entradaHoy.score}
            </span>
            <div className="flex-1">
              <ScoreBar value={entradaHoy.score} color={scoreColor(entradaHoy.score)} />
              <div className="flex justify-between mt-1">
                <span className="sys-label">{scoreLabel(entradaHoy.score)}</span>
                <span className="sys-label">{entradaHoy.factores.sueno}h sueño</span>
              </div>
            </div>
          </div>

          {entradaHoy.analisisIA && (
            <div className="space-y-2">
              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {entradaHoy.analisisIA}
              </p>
              {entradaHoy.recomendacion && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Zap size={14} style={{ color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                  <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {entradaHoy.recomendacion}
                  </p>
                </div>
              )}
            </div>
          )}

          {entradaHoy.recomendacion && (
            <button
              onClick={() => hablarTexto(entradaHoy.recomendacion!)}
              className="sys-label"
              style={{ color: 'var(--color-accent)', opacity: 0.7 }}
            >
              ▶ ESCUCHAR RECOMENDACIÓN
            </button>
          )}
        </div>
      )}

      {/* Historial */}
      {energyEntries.filter(e => e.fecha !== HOY).length > 0 && (
        <div className="space-y-2">
          <span className="sys-label px-1">HISTORIAL</span>
          {energyEntries.filter(e => e.fecha !== HOY).slice(0, 5).map(entry => (
            <div key={entry.id} className="bm-card p-3 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm sys-value"
                style={{ background: `${scoreColor(entry.score)}18`, color: scoreColor(entry.score) }}
              >
                {entry.score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold">{entry.fecha}</p>
                <div className="flex gap-3">
                  <span className="sys-label">{scoreLabel(entry.score)}</span>
                  <span className="sys-label">🌙 {entry.factores.sueno}h</span>
                </div>
              </div>
              <ScoreBar value={entry.score} color={scoreColor(entry.score)} />
            </div>
          ))}
        </div>
      )}

      {/* Form bottom sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !analizando && setShowForm(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-5"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />

              <div>
                <span className="sys-label block mb-1" style={{ color: '#10B981' }}>CHECK-IN ENERGÍA</span>
                <p className="font-black text-xl">¿Cómo estás hoy?</p>
              </div>

              {/* Score slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="sys-label">ENERGÍA</span>
                  <span className="font-black text-2xl sys-value" style={{ color: scoreColor(score) }}>{score}/10</span>
                </div>
                <input
                  type="range" min={1} max={10} value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between">
                  <span className="sys-label">AGOTADO</span>
                  <span className="sys-label">IMPARABLE</span>
                </div>
              </div>

              {/* Sueño */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="sys-label flex items-center gap-1"><Moon size={10} /> HORAS DE SUEÑO</span>
                  <span className="font-black sys-value">{sueno}h</span>
                </div>
                <input
                  type="range" min={3} max={12} step={0.5} value={sueno}
                  onChange={e => setSueno(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              {/* Tipo sueño */}
              <div>
                <span className="sys-label block mb-2">CALIDAD DE SUEÑO</span>
                <div className="flex gap-2">
                  {(['profundo', 'interrumpido', 'ligero'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTipoDeSueno(t)}
                      className="flex-1 py-2 rounded-lg text-center font-black uppercase transition-all"
                      style={{
                        fontSize: 9,
                        letterSpacing: '0.08em',
                        background: tipoDeSueno === t ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${tipoDeSueno === t ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                        color: tipoDeSueno === t ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estrés topics */}
              <div>
                <span className="sys-label block mb-2 flex items-center gap-1"><AlertTriangle size={10} /> FACTORES DE ESTRÉS (OPCIONAL)</span>
                <div className="flex flex-wrap gap-2">
                  {STRES_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleStres(topic)}
                      className="px-3 py-1 rounded-full font-black transition-all"
                      style={{
                        fontSize: 9,
                        letterSpacing: '0.1em',
                        background: estresTopics.includes(topic) ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${estresTopics.includes(topic) ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: estresTopics.includes(topic) ? '#EF4444' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {topic.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={guardar}
                disabled={analizando}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}
              >
                {analizando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    ANALIZANDO...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    REGISTRAR ENERGÍA
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
