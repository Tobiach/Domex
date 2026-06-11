import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Loader2, ChevronRight, CheckCircle, Circle, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generarRoadmap } from '../services/learningPathService';
import type { LearningPath } from '../types';
import ReactMarkdown from 'react-markdown';

const DIFICULTADES: LearningPath['dificultad'][] = ['principiante', 'intermedio', 'avanzado'];
const DIFICULTAD_COLOR: Record<LearningPath['dificultad'], string> = {
  principiante: '#10B981',
  intermedio: '#F59E0B',
  avanzado: '#EF4444',
};

export default function LearningPaths() {
  const { learningPaths, agregarPath, avanzarSemanaPath } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [goal, setGoal] = useState('');
  const [duracion, setDuracion] = useState(4);
  const [dificultad, setDificultad] = useState<LearningPath['dificultad']>('principiante');
  const [generando, setGenerando] = useState(false);

  const selectedPath = learningPaths.find(p => p.id === selectedId);

  const crear = async () => {
    if (!titulo.trim() || !goal.trim()) return;
    setGenerando(true);
    let roadmap = '';
    try {
      roadmap = await generarRoadmap(titulo, goal, duracion, dificultad);
    } catch {
      roadmap = `## Semana 1 — Fundamentos\n- Investigá los conceptos base\n- Buscá recursos online\n- Tomá notas clave`;
    }
    const path: LearningPath = {
      id: `path_${Date.now()}`,
      titulo, goal, duracion, dificultad, roadmap,
      semanasCompletadas: 0, racha: 0, ultimaSemana: null,
      creadoEn: new Date().toISOString(),
    };
    agregarPath(path);
    setGenerando(false);
    setShowForm(false);
    setTitulo(''); setGoal('');
    setSelectedId(path.id);
  };

  if (selectedPath) {
    const pct = Math.round((selectedPath.semanasCompletadas / selectedPath.duracion) * 100);
    const color = DIFICULTAD_COLOR[selectedPath.dificultad];
    const hoy = new Date().toISOString().split('T')[0];
    const yaAvanzóHoy = selectedPath.ultimaSemana === hoy;

    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 sys-label" style={{ color: 'var(--color-accent)' }}>
          ← TODOS LOS PATHS
        </button>

        <div className="bm-card p-4 space-y-3" style={{ borderColor: `${color}30` }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="sys-label block mb-1" style={{ color }}>{selectedPath.dificultad.toUpperCase()} · {selectedPath.duracion} SEMANAS</span>
              <h2 className="text-xl font-black uppercase">{selectedPath.titulo}</h2>
              <p className="text-[11px] text-white/40 mt-1">{selectedPath.goal}</p>
            </div>
            {selectedPath.racha > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Flame size={14} style={{ color: '#F59E0B' }} />
                <span className="font-black sys-value text-sm" style={{ color: '#F59E0B' }}>{selectedPath.racha}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="sys-label">PROGRESO</span>
              <span className="sys-label">{selectedPath.semanasCompletadas}/{selectedPath.duracion} semanas</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: color }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
            </div>
            <span className="sys-label mt-0.5 block">{pct}% COMPLETADO</span>
          </div>

          {selectedPath.semanasCompletadas < selectedPath.duracion && (
            <button
              onClick={() => avanzarSemanaPath(selectedPath.id)}
              disabled={yaAvanzóHoy}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
              style={{ background: yaAvanzóHoy ? 'rgba(255,255,255,0.06)' : `${color}20`, border: `1px solid ${yaAvanzóHoy ? 'rgba(255,255,255,0.08)' : `${color}40`}`, color: yaAvanzóHoy ? 'rgba(255,255,255,0.3)' : color }}
            >
              {yaAvanzóHoy ? (
                <><CheckCircle size={14} />SEMANA COMPLETADA HOY</>
              ) : (
                <><Circle size={14} />MARCAR SEMANA COMPLETADA</>
              )}
            </button>
          )}
        </div>

        {/* Roadmap */}
        <div className="bm-card p-4">
          <span className="sys-label block mb-3">ROADMAP COMPLETO</span>
          <div className="markdown-content text-[13px] leading-relaxed space-y-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <ReactMarkdown>{selectedPath.roadmap}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" />
          <span className="sys-label">APRENDIZAJE AVANZADO</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Learning<br />Paths</h1>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest"
        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1' }}
      >
        + CREAR NUEVO PATH
      </button>

      {learningPaths.length === 0 && (
        <div className="bm-card p-6 text-center space-y-2">
          <Map size={28} style={{ color: '#6366F1', margin: '0 auto' }} />
          <p className="font-black text-base">Sin paths creados</p>
          <p className="text-[11px] text-white/30">Definí un objetivo de aprendizaje y Groq te arma el roadmap.</p>
        </div>
      )}

      <div className="space-y-3">
        {learningPaths.map((path, i) => {
          const color = DIFICULTAD_COLOR[path.dificultad];
          const pct = Math.round((path.semanasCompletadas / path.duracion) * 100);
          return (
            <motion.button
              key={path.id}
              onClick={() => setSelectedId(path.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bm-card p-4 text-left relative overflow-hidden"
            >
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: color }} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="sys-label block mb-0.5" style={{ color }}>{path.dificultad.toUpperCase()} · {path.duracion}W</span>
                  <p className="font-black text-base">{path.titulo}</p>
                  <p className="text-[10px] text-white/30 mt-0.5 truncate">{path.goal}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black sys-value" style={{ color }}>{pct}%</span>
                  <ChevronRight size={14} className="text-white/20 mt-1 ml-auto" />
                </div>
              </div>
              <div className="mt-2 w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !generando && setShowForm(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-4"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
              <span className="sys-label block" style={{ color: '#6366F1' }}>NUEVO LEARNING PATH</span>

              <div>
                <span className="sys-label block mb-1">¿QUÉ QUERÉS APRENDER?</span>
                <input
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="ej: Blockchain para negocios"
                  className="w-full px-4 py-3 rounded-xl text-[14px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                />
              </div>

              <div>
                <span className="sys-label block mb-1">OBJETIVO FINAL</span>
                <input
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="ej: Puedo explicar smart contracts y evaluar proyectos"
                  className="w-full px-4 py-3 rounded-xl text-[14px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="sys-label block mb-1">SEMANAS</span>
                  <input
                    type="number" min={1} max={12} value={duracion}
                    onChange={e => setDuracion(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl text-[14px] font-black sys-value text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  />
                </div>
                <div className="flex-1">
                  <span className="sys-label block mb-1">NIVEL</span>
                  <div className="flex flex-col gap-1">
                    {DIFICULTADES.map(d => (
                      <button key={d} onClick={() => setDificultad(d)}
                        className="px-2 py-1 rounded-lg text-center font-black transition-all"
                        style={{
                          fontSize: 9, letterSpacing: '0.08em',
                          background: dificultad === d ? `${DIFICULTAD_COLOR[d]}20` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${dificultad === d ? DIFICULTAD_COLOR[d] : 'rgba(255,255,255,0.06)'}`,
                          color: dificultad === d ? DIFICULTAD_COLOR[d] : 'rgba(255,255,255,0.3)',
                        }}>
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={crear}
                disabled={!titulo.trim() || !goal.trim() || generando}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white' }}
              >
                {generando ? <><Loader2 size={16} className="animate-spin" />GENERANDO ROADMAP...</> : <><Map size={16} />CREAR PATH</>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
