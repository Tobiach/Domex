import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Loader2, ChevronRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analizarDebate } from '../services/debateService';
import type { DebateEntry } from '../types';

export default function Debate() {
  const { debateEntries, agregarDebate, actualizarReflexionDebate } = useApp();
  const [pregunta, setPregunta] = useState('');
  const [analizando, setAnalizando] = useState(false);
  const [selected, setSelected] = useState<DebateEntry | null>(null);
  const [reflexion, setReflexion] = useState('');
  const [decision, setDecision] = useState('');

  const analizar = async () => {
    if (!pregunta.trim()) return;
    setAnalizando(true);
    try {
      const result = await analizarDebate(pregunta);
      const entry: DebateEntry = { id: `debate_${Date.now()}`, ...result, creadoEn: new Date().toISOString() };
      agregarDebate(entry);
      setSelected(entry);
      setPregunta('');
    } catch {
      alert('Error al analizar. Intentá de nuevo.');
    }
    setAnalizando(false);
  };

  const guardarReflexion = () => {
    if (!selected || !reflexion.trim()) return;
    actualizarReflexionDebate(selected.id, reflexion, decision || undefined);
    setSelected(prev => prev ? { ...prev, reflexionUsuario: reflexion, decisionFinal: decision || undefined } : null);
    setReflexion('');
    setDecision('');
  };

  if (selected) {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setSelected(null)} className="sys-label" style={{ color: 'var(--color-accent)' }}>← DEBATES</button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="live-dot" style={{ '--dot-color': '#8B5CF6' } as any} />
            <span className="sys-label">DEBATE SOCRÁTICO</span>
          </div>
          <h2 className="text-xl font-black uppercase leading-tight">{selected.pregunta}</h2>
        </div>

        {/* Opciones A y B */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'OPCIÓN A', data: selected.opcionA, color: '#6366F1' },
            { label: 'OPCIÓN B', data: selected.opcionB, color: '#F97316' },
          ].map(({ label, data, color }) => (
            <div key={label} className="bm-card p-4 space-y-3 relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: color }} />
              <div>
                <span className="sys-label" style={{ color }}>{label}</span>
                <p className="font-black text-base mt-0.5">{data.titulo}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="sys-label block mb-1" style={{ color: '#10B981' }}>✓ PRO</span>
                  {data.pro.map((p, i) => <p key={i} className="text-[11px] text-white/70 leading-snug mb-0.5">· {p}</p>)}
                </div>
                <div>
                  <span className="sys-label block mb-1" style={{ color: '#EF4444' }}>✕ CONTRA</span>
                  {data.contra.map((c, i) => <p key={i} className="text-[11px] text-white/70 leading-snug mb-0.5">· {c}</p>)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/05">
                <div>
                  <span className="sys-label block mb-0.5" style={{ color: '#EF4444', fontSize: 8 }}>RIESGO</span>
                  <p className="text-[11px] text-white/60">{data.riesgo}</p>
                </div>
                <div>
                  <span className="sys-label block mb-0.5" style={{ color: '#10B981', fontSize: 8 }}>OPORTUNIDAD</span>
                  <p className="text-[11px] text-white/60">{data.oportunidad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="bm-card p-4" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
          <span className="sys-label block mb-1" style={{ color: '#8B5CF6' }}>LA PREGUNTA REAL</span>
          <p className="font-black text-sm leading-relaxed">{selected.insight}</p>
        </div>

        {/* Reflexión */}
        {selected.reflexionUsuario ? (
          <div className="bm-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} style={{ color: '#10B981' }} />
              <span className="sys-label" style={{ color: '#10B981' }}>TU REFLEXIÓN</span>
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed">{selected.reflexionUsuario}</p>
            {selected.decisionFinal && (
              <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <span className="sys-label block mb-0.5" style={{ color: '#10B981' }}>DECISIÓN</span>
                <p className="text-[12px] font-bold">{selected.decisionFinal}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bm-card p-4 space-y-3">
            <span className="sys-label block" style={{ color: '#8B5CF6' }}>TU REFLEXIÓN</span>
            <textarea
              value={reflexion}
              onChange={e => setReflexion(e.target.value)}
              placeholder="¿Qué te atrae más y por qué? ¿Cuál es el miedo real detrás de la pregunta?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-[13px] leading-relaxed resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
            />
            <div>
              <span className="sys-label block mb-1">DECISIÓN (OPCIONAL)</span>
              <input
                value={decision}
                onChange={e => setDecision(e.target.value)}
                placeholder="Decidí..."
                className="w-full px-4 py-3 rounded-xl text-[13px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
              />
            </div>
            <button
              onClick={guardarReflexion}
              disabled={!reflexion.trim()}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#8B5CF6' }}
            >
              GUARDAR REFLEXIÓN
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#8B5CF6' } as any} />
          <span className="sys-label">APRENDIZAJE AVANZADO</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Debate<br />Socrático</h1>
        <p className="text-[11px] text-white/30 mt-1">Presentá una decisión difícil. La IA muestra ambos lados sin juzgar.</p>
      </div>

      {/* Input nueva pregunta */}
      <div className="bm-card p-4 space-y-3">
        <span className="sys-label block" style={{ color: '#8B5CF6' }}>NUEVA PREGUNTA</span>
        <textarea
          value={pregunta}
          onChange={e => setPregunta(e.target.value)}
          placeholder="ej: ¿Debería dejar mi trabajo y apostar todo al negocio?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-[13px] leading-relaxed resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
        />
        <button
          onClick={analizar}
          disabled={!pregunta.trim() || analizando}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white' }}
        >
          {analizando ? <><Loader2 size={16} className="animate-spin" />ANALIZANDO...</> : <><Scale size={16} />DEBATIR</>}
        </button>
      </div>

      {/* Historial */}
      {debateEntries.length > 0 && (
        <div className="space-y-2">
          <span className="sys-label px-1">DEBATES ANTERIORES</span>
          {debateEntries.map((d, i) => (
            <motion.button
              key={d.id}
              onClick={() => setSelected(d)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bm-card p-4 text-left"
            >
              <p className="font-black text-sm leading-snug">{d.pregunta}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  <span className="sys-label" style={{ color: '#6366F1' }}>{d.opcionA.titulo.slice(0, 12)}</span>
                  <span className="sys-label text-white/20">vs</span>
                  <span className="sys-label" style={{ color: '#F97316' }}>{d.opcionB.titulo.slice(0, 12)}</span>
                </div>
                {d.reflexionUsuario && <CheckCircle size={12} style={{ color: '#10B981' }} />}
                <ChevronRight size={12} className="text-white/20" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
