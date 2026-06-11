import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Loader2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calcScores, analizarHormonas } from '../services/hormoneService';
import type { HormoneEntry } from '../types';

const HOY = new Date().toISOString().split('T')[0];

// SVG radar para 3 ejes: T, C, D
function RadarChart({ T, C, D }: { T: number; C: number; D: number }) {
  const size = 140;
  const center = size / 2;
  const r = 54;

  // 3 ejes: T (arriba), D (derecha-abajo), C (izquierda-abajo)
  const angles = [-90, 30, 150]; // grados
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const axes = angles.map(a => ({
    x: center + r * Math.cos(toRad(a)),
    y: center + r * Math.sin(toRad(a)),
  }));

  const vals = [T / 100, D / 100, C / 100];
  const points = vals.map((v, i) => ({
    x: center + r * v * Math.cos(toRad(angles[i])),
    y: center + r * v * Math.sin(toRad(angles[i])),
  }));
  const poly = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map(lv => {
        const gpts = angles.map(a => {
          const x = center + r * lv * Math.cos(toRad(a));
          const y = center + r * lv * Math.sin(toRad(a));
          return `${x},${y}`;
        }).join(' ');
        return <polygon key={lv} points={gpts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
      })}
      {/* Axis lines */}
      {axes.map((ax, i) => (
        <line key={i} x1={center} y1={center} x2={ax.x} y2={ax.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      {/* Data */}
      <motion.polygon
        points={poly}
        fill="rgba(0,212,255,0.08)"
        stroke="rgba(0,212,255,0.55)"
        strokeWidth={1.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Dots */}
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-accent)"
          initial={{ r: 0 }} animate={{ r: 3 }} transition={{ delay: i * 0.1 }} />
      ))}
      {/* Labels */}
      <text x={center} y={8} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.5)" fontFamily="monospace">T</text>
      <text x={size - 2} y={center + r * 0.7} textAnchor="end" fontSize={7} fill="rgba(255,255,255,0.5)" fontFamily="monospace">D</text>
      <text x={2} y={center + r * 0.7} textAnchor="start" fontSize={7} fill="rgba(255,255,255,0.5)" fontFamily="monospace">C</text>
    </svg>
  );
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  const cat = value >= 70 ? 'ALTO' : value >= 45 ? 'NORMAL' : 'BAJO';
  return (
    <div className="bm-card p-3 text-center">
      <span className="sys-label block mb-1">{label}</span>
      <span className="text-2xl font-black sys-value" style={{ color }}>{value}</span>
      <span className="sys-label block mt-0.5" style={{ color, opacity: 0.8 }}>{cat}</span>
    </div>
  );
}

const SLIDER_FIELDS: { key: keyof HormoneEntry['inputs']; label: string; inv?: boolean }[] = [
  { key: 'energia',    label: 'ENERGÍA' },
  { key: 'libido',     label: 'LIBIDO' },
  { key: 'vigor',      label: 'VIGOR / FUERZA' },
  { key: 'mood',       label: 'ESTADO DE ÁNIMO' },
  { key: 'focus',      label: 'FOCO' },
  { key: 'motivation', label: 'MOTIVACIÓN' },
  { key: 'placer',     label: 'PLACER / DISFRUTE' },
  { key: 'estres',     label: 'ESTRÉS ↑ = peor', inv: true },
  { key: 'brainFog',   label: 'NIEBLA MENTAL ↑ = peor', inv: true },
];

const DEFAULT_INPUTS: HormoneEntry['inputs'] = {
  energia: 6, libido: 6, vigor: 6, mood: 6,
  focus: 6, motivation: 6, placer: 6, estres: 4, brainFog: 3,
};

export default function HormoneBalance() {
  const { hormoneEntries, registrarHormona } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [inputs, setInputs] = useState<HormoneEntry['inputs']>(DEFAULT_INPUTS);
  const [analizando, setAnalizando] = useState(false);

  const yaRegistroHoy = hormoneEntries.some(e => e.fecha === HOY);
  const entradaHoy = hormoneEntries.find(e => e.fecha === HOY);

  const preview = calcScores(inputs);

  const guardar = async () => {
    setAnalizando(true);
    const scores = calcScores(inputs);
    let analisisIA = '';
    try {
      analisisIA = await analizarHormonas(scores);
    } catch {
      analisisIA = 'Análisis no disponible. Revisá tu conexión.';
    }
    const entry: HormoneEntry = {
      id: `hormone_${Date.now()}`,
      fecha: HOY,
      inputs,
      scores,
      analisisIA,
      creadoEn: new Date().toISOString(),
    };
    registrarHormona(entry);
    setAnalizando(false);
    setShowForm(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#8B5CF6' } as any} />
          <span className="sys-label">MÓDULO SALUD</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Hormone<br />Balance</h1>
        <p className="text-[11px] text-white/30 mt-1">Basado en proxies comportamentales. No reemplaza análisis médico.</p>
      </div>

      {/* Radar + scores hoy */}
      {entradaHoy ? (
        <div className="bm-card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="sys-label" style={{ color: '#8B5CF6' }}>BALANCE HOY</span>
          </div>

          <div className="flex items-center gap-4">
            <RadarChart T={entradaHoy.scores.T} C={entradaHoy.scores.C} D={entradaHoy.scores.D} />
            <div className="flex-1 space-y-2 min-w-0">
              <ScorePill label="TESTOSTERONA" value={entradaHoy.scores.T} color="#F59E0B" />
              <ScorePill label="CORTISOL ↓" value={entradaHoy.scores.C} color="#10B981" />
              <ScorePill label="DOPAMINA" value={entradaHoy.scores.D} color="#6366F1" />
            </div>
          </div>

          {entradaHoy.analisisIA && (
            <div className="p-3 rounded-lg text-[12px] leading-relaxed" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
              {entradaHoy.analisisIA}
            </div>
          )}
        </div>
      ) : (
        <motion.button
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.97 }}
          className="w-full bm-card p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(139,92,246,0.3)' }}
        >
          <div>
            <span className="sys-label block mb-1" style={{ color: '#8B5CF6' }}>CHECK-IN PENDIENTE</span>
            <p className="font-black text-lg">Medí tu balance hormonal hoy</p>
          </div>
          <Activity size={28} style={{ color: '#8B5CF6' }} />
        </motion.button>
      )}

      {/* Historial */}
      {hormoneEntries.filter(e => e.fecha !== HOY).length > 0 && (
        <div className="space-y-2">
          <span className="sys-label px-1">HISTORIAL</span>
          {hormoneEntries.filter(e => e.fecha !== HOY).slice(0, 5).map(entry => (
            <div key={entry.id} className="bm-card p-3 flex items-center gap-3">
              <RadarChart T={entry.scores.T} C={entry.scores.C} D={entry.scores.D} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold mb-1">{entry.fecha}</p>
                <div className="flex gap-2">
                  <span className="sys-label">T:{entry.scores.T}</span>
                  <span className="sys-label">C:{entry.scores.C}</span>
                  <span className="sys-label">D:{entry.scores.D}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !analizando && setShowForm(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl pb-10"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '88vh', overflowY: 'auto' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="sticky top-0 p-5 pb-2" style={{ background: '#0D0D1A' }}>
                <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-3" />
                <span className="sys-label block mb-1" style={{ color: '#8B5CF6' }}>CHECK-IN HORMONAL</span>
                <p className="font-black text-lg">¿Cómo está tu cuerpo hoy?</p>

                {/* Preview radar */}
                <div className="flex items-center gap-4 mt-3">
                  <RadarChart T={preview.T} C={preview.C} D={preview.D} />
                  <div className="flex gap-2">
                    <div className="text-center">
                      <span className="sys-label block">T</span>
                      <span className="font-black sys-value text-lg" style={{ color: '#F59E0B' }}>{preview.T}</span>
                    </div>
                    <div className="text-center">
                      <span className="sys-label block">C</span>
                      <span className="font-black sys-value text-lg" style={{ color: '#10B981' }}>{preview.C}</span>
                    </div>
                    <div className="text-center">
                      <span className="sys-label block">D</span>
                      <span className="font-black sys-value text-lg" style={{ color: '#6366F1' }}>{preview.D}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-2 space-y-4">
                {SLIDER_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="sys-label">{label}</span>
                      <span className="font-black sys-value text-sm">{inputs[key]}/10</span>
                    </div>
                    <input
                      type="range" min={1} max={10} value={inputs[key]}
                      onChange={e => setInputs(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className="w-full accent-violet-500"
                    />
                  </div>
                ))}

                <button
                  onClick={guardar}
                  disabled={analizando}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white' }}
                >
                  {analizando ? (
                    <><Loader2 size={16} className="animate-spin" />ANALIZANDO...</>
                  ) : (
                    <><Activity size={16} />GUARDAR BALANCE</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
