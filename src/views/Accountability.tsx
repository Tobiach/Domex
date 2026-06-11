import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle, XCircle, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AccountabilityGoal } from '../types';

const HOY = new Date().toISOString().split('T')[0];

function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function Accountability() {
  const { accountabilityGoals, agregarAccountabilityGoal, actualizarProgreso } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [meta, setMeta] = useState('');
  const [dias, setDias] = useState(7);
  const [showEval, setShowEval] = useState<string | null>(null);
  const [nuevoProgreso, setNuevoProgreso] = useState(50);
  const [leccion, setLeccion] = useState('');

  const activo = accountabilityGoals.find(g => !g.completada && g.fechaFin >= HOY);
  const historial = accountabilityGoals.filter(g => g.completada || g.fechaFin < HOY);

  const crear = () => {
    if (!meta.trim()) return;
    const goal: AccountabilityGoal = {
      id: `acc_${Date.now()}`,
      meta,
      fechaInicio: HOY,
      fechaFin: addDays(HOY, dias),
      progreso: 0,
      completada: false,
      creadoEn: new Date().toISOString(),
    };
    agregarAccountabilityGoal(goal);
    setMeta(''); setShowForm(false);
  };

  const evaluar = (id: string, completada: boolean) => {
    actualizarProgreso(id, nuevoProgreso, completada, leccion || undefined);
    setShowEval(null); setLeccion(''); setNuevoProgreso(50);
  };

  const diasRestantes = (fechaFin: string) => {
    const diff = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86400000);
    return Math.max(0, diff);
  };

  const pctColor = (p: number) => p >= 80 ? '#10B981' : p >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" />
          <span className="sys-label">OPTIMIZACIÓN EXISTENCIAL</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Accountability<br />Partner</h1>
      </div>

      {/* Meta activa */}
      {activo ? (
        <div className="bm-card p-4 space-y-3" style={{ borderColor: 'rgba(16,185,129,0.25)' }}>
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="sys-label" style={{ color: '#10B981' }}>META ACTIVA</span>
          </div>
          <p className="font-black text-lg leading-tight">{activo.meta}</p>
          <div className="flex gap-3 text-center">
            <div className="flex-1 bm-card p-2">
              <span className="sys-label block">PROGRESO</span>
              <span className="font-black sys-value text-xl" style={{ color: pctColor(activo.progreso) }}>{activo.progreso}%</span>
            </div>
            <div className="flex-1 bm-card p-2">
              <span className="sys-label block">RESTANTES</span>
              <span className="font-black sys-value text-xl">{diasRestantes(activo.fechaFin)}d</span>
            </div>
            <div className="flex-1 bm-card p-2">
              <span className="sys-label block">FIN</span>
              <span className="font-black sys-value text-xl" style={{ fontSize: 11 }}>{activo.fechaFin}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full" style={{ background: pctColor(activo.progreso) }}
              animate={{ width: `${activo.progreso}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setNuevoProgreso(activo.progreso); setShowEval(activo.id); }}
              className="flex-1 py-2 rounded-lg font-black uppercase text-center"
              style={{ fontSize: 9, letterSpacing: '0.1em', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>
              CHECK-IN
            </button>
            <button onClick={() => { setNuevoProgreso(activo.progreso); setShowEval(activo.id + '_done'); }}
              className="flex-1 py-2 rounded-lg font-black uppercase text-center"
              style={{ fontSize: 9, letterSpacing: '0.1em', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1' }}>
              CERRAR META
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full bm-card p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <div>
            <span className="sys-label block mb-1" style={{ color: '#10B981' }}>SIN META ACTIVA</span>
            <p className="font-black text-lg">¿Cuál es tu meta esta semana?</p>
          </div>
          <Target size={28} style={{ color: '#10B981' }} />
        </button>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div className="space-y-2">
          <span className="sys-label px-1">HISTORIAL</span>
          {historial.slice(0, 6).map(g => (
            <div key={g.id} className="bm-card p-3 flex items-center gap-3">
              {g.completada
                ? (g.progreso >= 80 ? <CheckCircle size={16} style={{ color: '#10B981', flexShrink: 0 }} /> : <XCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />)
                : <XCircle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate">{g.meta}</p>
                <div className="flex gap-2">
                  <span className="sys-label">{g.fechaInicio} → {g.fechaFin}</span>
                  <span className="sys-label" style={{ color: pctColor(g.progreso) }}>{g.progreso}%</span>
                </div>
                {g.leccion && <p className="text-[10px] text-white/30 italic mt-0.5">{g.leccion}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forms */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-4"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
              <span className="sys-label block" style={{ color: '#10B981' }}>NUEVA META</span>
              <div>
                <span className="sys-label block mb-1">¿QUÉ QUERÉS LOGRAR?</span>
                <input value={meta} onChange={e => setMeta(e.target.value)}
                  placeholder="Cerrar 2 clientes nuevos esta semana"
                  className="w-full px-4 py-3 rounded-xl text-[14px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="sys-label">PLAZO EN DÍAS</span>
                  <span className="font-black sys-value">{dias}d (hasta {addDays(HOY, dias)})</span>
                </div>
                <input type="range" min={3} max={30} value={dias} onChange={e => setDias(Number(e.target.value))}
                  className="w-full accent-emerald-500" />
              </div>
              <button onClick={crear} disabled={!meta.trim()}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white' }}>
                <Target size={16} />ACTIVAR META
              </button>
            </motion.div>
          </>
        )}

        {showEval && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEval(null)} />
            <motion.div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-4"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
              <span className="sys-label block" style={{ color: showEval.includes('_done') ? '#6366F1' : '#10B981' }}>
                {showEval.includes('_done') ? 'CERRAR META' : 'CHECK-IN'}
              </span>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="sys-label">PROGRESO ACTUAL</span>
                  <span className="font-black sys-value" style={{ color: pctColor(nuevoProgreso) }}>{nuevoProgreso}%</span>
                </div>
                <input type="range" min={0} max={100} value={nuevoProgreso} onChange={e => setNuevoProgreso(Number(e.target.value))}
                  className="w-full accent-emerald-500" />
              </div>
              <div>
                <span className="sys-label block mb-1">LECCIÓN / NOTA</span>
                <input value={leccion} onChange={e => setLeccion(e.target.value)}
                  placeholder="¿Qué aprendiste? ¿Qué bloqueo tuviste?"
                  className="w-full px-4 py-3 rounded-xl text-[13px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
              </div>
              {showEval.includes('_done') ? (
                <div className="flex gap-2">
                  <button onClick={() => evaluar(showEval.replace('_done', ''), true)}
                    className="flex-1 py-3 rounded-xl font-black uppercase text-sm"
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981' }}>
                    ✓ LOGRADA
                  </button>
                  <button onClick={() => evaluar(showEval.replace('_done', ''), false)}
                    className="flex-1 py-3 rounded-xl font-black uppercase text-sm"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                    ✕ NO LOGRADA
                  </button>
                </div>
              ) : (
                <button onClick={() => { if (activo) actualizarProgreso(activo.id, nuevoProgreso, false, leccion || undefined); setShowEval(null); }}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981' }}>
                  GUARDAR CHECK-IN
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
