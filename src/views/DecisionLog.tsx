import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Decision } from '../types';

const SENTIMIENTOS: Decision['sentimiento'][] = ['confianza', 'duda', 'urgencia', 'miedo'];
const SENTIMIENTO_COLOR: Record<Decision['sentimiento'], string> = {
  confianza: '#10B981', duda: '#F59E0B', urgencia: '#F97316', miedo: '#EF4444',
};

const HOY = new Date().toISOString().split('T')[0];

export default function DecisionLog() {
  const { decisions, agregarDecision, actualizarResultadoDecision, tareas } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Decision | null>(null);
  const [resultado, setResultado] = useState('');
  const [leccion, setLeccion] = useState('');
  const [aprobada, setAprobada] = useState<boolean | null>(null);

  // Form state
  const [desc, setDesc] = useState('');
  const [contexto, setContexto] = useState('');
  const [alternativas, setAlternativas] = useState('');
  const [sentimiento, setSentimiento] = useState<Decision['sentimiento']>('confianza');
  const [clarity, setClarity] = useState(7);

  const guardar = () => {
    if (!desc.trim()) return;
    const entry: Decision = {
      id: `dec_${Date.now()}`,
      descripcion: desc,
      fecha: HOY,
      contexto,
      alternativas: alternativas.split('\n').filter(Boolean),
      sentimiento,
      clarityAlMomento: clarity,
      creadoEn: new Date().toISOString(),
    };
    agregarDecision(entry);
    setDesc(''); setContexto(''); setAlternativas(''); setClarity(7);
    setShowForm(false);
  };

  const guardarResultado = () => {
    if (!selected || !resultado.trim() || aprobada === null) return;
    actualizarResultadoDecision(selected.id, resultado, aprobada, leccion || undefined);
    setSelected(prev => prev ? { ...prev, resultado, aprobada: aprobada ?? undefined, leccion } : null);
    setResultado(''); setLeccion(''); setAprobada(null);
  };

  // Días desde decisión
  const diasDesde = (fecha: string) => Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);

  if (selected) {
    const dias = diasDesde(selected.fecha);
    const color = SENTIMIENTO_COLOR[selected.sentimiento];
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setSelected(null)} className="sys-label" style={{ color: 'var(--color-accent)' }}>← DECISIONES</button>
        <div>
          <span className="sys-label block mb-1" style={{ color }}>{selected.sentimiento.toUpperCase()} · {selected.fecha}</span>
          <h2 className="text-xl font-black uppercase leading-tight">{selected.descripcion}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bm-card p-3">
            <span className="sys-label block mb-1">CLARITY</span>
            <span className="font-black sys-value text-2xl" style={{ color }}>{selected.clarityAlMomento}/10</span>
          </div>
          <div className="bm-card p-3">
            <span className="sys-label block mb-1">HACE</span>
            <span className="font-black sys-value text-2xl">{dias}d</span>
          </div>
        </div>
        {selected.contexto && (
          <div className="bm-card p-3">
            <span className="sys-label block mb-1">CONTEXTO</span>
            <p className="text-[13px] text-white/70">{selected.contexto}</p>
          </div>
        )}
        {selected.alternativas.length > 0 && (
          <div className="bm-card p-3">
            <span className="sys-label block mb-2">ALTERNATIVAS CONSIDERADAS</span>
            {selected.alternativas.map((a, i) => (
              <div key={i} className="flex gap-2 items-start mb-1">
                <span className="sys-value text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>0{i + 1}</span>
                <p className="text-[12px] text-white/60">{a}</p>
              </div>
            ))}
          </div>
        )}
        {selected.resultado ? (
          <div className="bm-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              {selected.aprobada ? <CheckCircle size={14} style={{ color: '#10B981' }} /> : <XCircle size={14} style={{ color: '#EF4444' }} />}
              <span className="sys-label" style={{ color: selected.aprobada ? '#10B981' : '#EF4444' }}>
                {selected.aprobada ? 'BUENA DECISIÓN' : 'NO FUE LO ESPERADO'}
              </span>
            </div>
            <p className="text-[13px] text-white/80">{selected.resultado}</p>
            {selected.leccion && <p className="text-[11px] text-white/40 italic">Lección: {selected.leccion}</p>}
          </div>
        ) : dias >= 7 ? (
          <div className="bm-card p-4 space-y-3">
            <span className="sys-label block" style={{ color: '#F59E0B' }}>EVALUACIÓN (HACE {dias} DÍAS)</span>
            <p className="text-[11px] text-white/40">¿Cómo resultó la decisión?</p>
            <textarea value={resultado} onChange={e => setResultado(e.target.value)}
              placeholder="¿Qué pasó? ¿Valió la pena?"
              rows={3} className="w-full px-4 py-3 rounded-xl text-[13px] resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
            <div className="flex gap-2">
              {[true, false].map(v => (
                <button key={String(v)} onClick={() => setAprobada(v)}
                  className="flex-1 py-2 rounded-lg font-black transition-all"
                  style={{
                    fontSize: 10, letterSpacing: '0.08em',
                    background: aprobada === v ? (v ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${aprobada === v ? (v ? '#10B981' : '#EF4444') : 'rgba(255,255,255,0.06)'}`,
                    color: aprobada === v ? (v ? '#10B981' : '#EF4444') : 'rgba(255,255,255,0.3)',
                  }}>
                  {v ? '✓ BUENA' : '✕ NO TANTO'}
                </button>
              ))}
            </div>
            <input value={leccion} onChange={e => setLeccion(e.target.value)}
              placeholder="Lección aprendida (opcional)" className="w-full px-4 py-3 rounded-xl text-[13px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
            <button onClick={guardarResultado} disabled={!resultado.trim() || aprobada === null}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B' }}>
              GUARDAR EVALUACIÓN
            </button>
          </div>
        ) : (
          <div className="bm-card p-3 flex items-center gap-2">
            <Clock size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p className="text-[11px] text-white/30">La evaluación se activa a los 7 días ({7 - dias}d restantes)</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" />
          <span className="sys-label">OPTIMIZACIÓN EXISTENCIAL</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Decision<br />Log</h1>
      </div>
      <button onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest"
        style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316' }}>
        + REGISTRAR DECISIÓN
      </button>
      {decisions.length === 0 && (
        <div className="bm-card p-6 text-center space-y-2">
          <GitBranch size={24} style={{ color: '#F97316', margin: '0 auto' }} />
          <p className="text-[11px] text-white/30">Registrá tus decisiones importantes. A los 7 días se activa la evaluación de resultado.</p>
        </div>
      )}
      <div className="space-y-2">
        {decisions.map((d, i) => {
          const color = SENTIMIENTO_COLOR[d.sentimiento];
          const dias = diasDesde(d.fecha);
          return (
            <motion.button key={d.id} onClick={() => setSelected(d)}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }} className="w-full bm-card p-4 text-left relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: color }} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="sys-label block mb-0.5" style={{ color }}>{d.sentimiento.toUpperCase()} · {d.fecha}</span>
                  <p className="font-black text-sm leading-snug">{d.descripcion}</p>
                </div>
                <div className="shrink-0 text-right">
                  {d.resultado
                    ? (d.aprobada ? <CheckCircle size={14} style={{ color: '#10B981' }} /> : <XCircle size={14} style={{ color: '#EF4444' }} />)
                    : dias >= 7 ? <span className="sys-label" style={{ color: '#F59E0B' }}>EVAL.</span>
                    : <Clock size={12} className="text-white/20" />
                  }
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl pb-10"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
              <div className="p-5 space-y-4">
                <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
                <span className="sys-label block" style={{ color: '#F97316' }}>NUEVA DECISIÓN</span>
                <div>
                  <span className="sys-label block mb-1">¿QUÉ DECIDISTE?</span>
                  <input value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Decidí contratar a Juan como socio"
                    className="w-full px-4 py-3 rounded-xl text-[14px]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                </div>
                <div>
                  <span className="sys-label block mb-1">CONTEXTO / POR QUÉ</span>
                  <textarea value={contexto} onChange={e => setContexto(e.target.value)}
                    placeholder="Necesitaba alguien técnico y Juan tiene experiencia en..." rows={2}
                    className="w-full px-4 py-3 rounded-xl text-[13px] resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                </div>
                <div>
                  <span className="sys-label block mb-1">ALTERNATIVAS (una por línea)</span>
                  <textarea value={alternativas} onChange={e => setAlternativas(e.target.value)}
                    placeholder="Contratar freelance&#10;Hacerlo solo&#10;Esperar" rows={3}
                    className="w-full px-4 py-3 rounded-xl text-[13px] resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                </div>
                <div>
                  <span className="sys-label block mb-2">SENTIMIENTO AL DECIDIR</span>
                  <div className="flex gap-2 flex-wrap">
                    {SENTIMIENTOS.map(s => (
                      <button key={s} onClick={() => setSentimiento(s)}
                        className="px-3 py-1 rounded-full font-black transition-all"
                        style={{
                          fontSize: 9, letterSpacing: '0.1em',
                          background: sentimiento === s ? `${SENTIMIENTO_COLOR[s]}20` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${sentimiento === s ? SENTIMIENTO_COLOR[s] : 'rgba(255,255,255,0.06)'}`,
                          color: sentimiento === s ? SENTIMIENTO_COLOR[s] : 'rgba(255,255,255,0.3)',
                        }}>
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="sys-label">CLARITY AL MOMENTO</span>
                    <span className="font-black sys-value">{clarity}/10</span>
                  </div>
                  <input type="range" min={1} max={10} value={clarity} onChange={e => setClarity(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                </div>
                <button onClick={guardar} disabled={!desc.trim()}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white' }}>
                  <GitBranch size={16} />REGISTRAR DECISIÓN
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
