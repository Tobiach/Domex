import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calcularAlineacion } from '../services/optimizacionService';
import type { LegacyProfile } from '../types';

const HOY = new Date().toISOString().split('T')[0];

export default function LegacyBuilder() {
  const { legacy, setLegacy, ideas, tareas } = useApp();
  const [editando, setEditando] = useState(!legacy);
  const [vision, setVision] = useState(legacy?.vision ?? '');
  const [paraQuien, setParaQuien] = useState(legacy?.paraQuien ?? '');
  const [valores, setValores] = useState<string[]>(legacy?.valores ?? []);
  const [nuevoValor, setNuevoValor] = useState('');
  const [calculando, setCalculando] = useState(false);

  const guardar = async () => {
    if (!vision.trim() || !paraQuien.trim() || valores.length === 0) return;
    setCalculando(true);
    const tareasHoy = tareas.filter(t => !t.completada).slice(0, 5).map(t => t.titulo);
    let score = 50;
    let reflexion = 'Analizá tus ideas y tareas para ver la alineación.';
    try {
      const result = await calcularAlineacion({ vision, valores, paraQuien, alineacion: 0, updatedAt: HOY }, { ideas, tareasHoy });
      score = result.score;
      reflexion = result.reflexion;
    } catch { /* usa defaults */ }
    setLegacy({ vision, paraQuien, valores, alineacion: score, reflexionAlineacion: reflexion, updatedAt: HOY });
    setCalculando(false);
    setEditando(false);
  };

  const recalcular = async () => {
    if (!legacy) return;
    setCalculando(true);
    const tareasHoy = tareas.filter(t => !t.completada).slice(0, 5).map(t => t.titulo);
    try {
      const result = await calcularAlineacion(legacy, { ideas, tareasHoy });
      setLegacy({ ...legacy, alineacion: result.score, reflexionAlineacion: result.reflexion, updatedAt: HOY });
    } catch { /* silencioso */ }
    setCalculando(false);
  };

  const alineacionColor = (s: number) => s >= 70 ? '#10B981' : s >= 45 ? '#F59E0B' : '#EF4444';
  const alineacionLabel = (s: number) => s >= 70 ? 'ALINEADO' : s >= 45 ? 'PARCIAL' : 'DESCONECTADO';

  if (editando) {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="live-dot" style={{ '--dot-color': '#8B5CF6' } as any} />
            <span className="sys-label">OPTIMIZACIÓN EXISTENCIAL</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Legacy<br />Builder</h1>
        </div>
        <div className="bm-card p-4 space-y-4">
          <div>
            <span className="sys-label block mb-1">¿QUÉ QUERÉS DEJAR EN EL MUNDO?</span>
            <textarea value={vision} onChange={e => setVision(e.target.value)}
              placeholder="Crear acceso a tecnología para emprendedores de LATAM que no tienen recursos..."
              rows={3} className="w-full px-4 py-3 rounded-xl text-[13px] leading-relaxed resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
          </div>
          <div>
            <span className="sys-label block mb-1">¿PARA QUIÉN?</span>
            <input value={paraQuien} onChange={e => setParaQuien(e.target.value)}
              placeholder="Emprendedores LATAM que no tienen acceso a las mismas herramientas que USA"
              className="w-full px-4 py-3 rounded-xl text-[14px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
          </div>
          <div>
            <span className="sys-label block mb-2">TUS VALORES CORE</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {valores.map((v, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <span className="font-black" style={{ fontSize: 10, color: '#8B5CF6' }}>{v}</span>
                  <button onClick={() => setValores(prev => prev.filter((_, j) => j !== i))}>
                    <X size={10} style={{ color: '#8B5CF6' }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={nuevoValor} onChange={e => setNuevoValor(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && nuevoValor.trim()) { setValores(p => [...p, nuevoValor.trim()]); setNuevoValor(''); } }}
                placeholder="Libertad, impacto, honestidad..."
                className="flex-1 px-4 py-2 rounded-xl text-[13px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
              <button onClick={() => { if (nuevoValor.trim()) { setValores(p => [...p, nuevoValor.trim()]); setNuevoValor(''); } }}
                className="px-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Plus size={14} style={{ color: '#8B5CF6' }} />
              </button>
            </div>
          </div>
          <button onClick={guardar} disabled={!vision.trim() || !paraQuien.trim() || valores.length === 0 || calculando}
            className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white' }}>
            {calculando ? <><Loader2 size={16} className="animate-spin" />CALCULANDO ALINEACIÓN...</> : <><Compass size={16} />GUARDAR LEGADO</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#8B5CF6' } as any} />
          <span className="sys-label">OPTIMIZACIÓN EXISTENCIAL</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Legacy<br />Builder</h1>
      </div>

      {/* Score alineación */}
      <div className="bm-card p-5 space-y-3" style={{ borderColor: `${alineacionColor(legacy!.alineacion)}30` }}>
        <div className="flex items-center justify-between">
          <span className="sys-label" style={{ color: alineacionColor(legacy!.alineacion) }}>ALINEACIÓN VIDA-LEGADO</span>
          <button onClick={recalcular} disabled={calculando} className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <RefreshCw size={12} style={{ color: 'rgba(255,255,255,0.4)' }} className={calculando ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-6xl font-black sys-value" style={{ color: alineacionColor(legacy!.alineacion) }}>
            {legacy!.alineacion}
          </span>
          <div className="pb-1">
            <span className="sys-label block" style={{ color: alineacionColor(legacy!.alineacion) }}>{alineacionLabel(legacy!.alineacion)}</span>
            <span className="sys-label">/100</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full" style={{ background: alineacionColor(legacy!.alineacion) }}
            animate={{ width: `${legacy!.alineacion}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
        {legacy!.reflexionAlineacion && (
          <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{legacy!.reflexionAlineacion}</p>
        )}
      </div>

      {/* Visión */}
      <div className="bm-card p-4 space-y-2">
        <span className="sys-label" style={{ color: '#8B5CF6' }}>TU VISIÓN</span>
        <p className="text-[14px] leading-relaxed font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{legacy!.vision}</p>
        <p className="text-[11px] text-white/40">Para: {legacy!.paraQuien}</p>
      </div>

      {/* Valores */}
      <div className="bm-card p-4">
        <span className="sys-label block mb-3" style={{ color: '#8B5CF6' }}>VALORES</span>
        <div className="flex flex-wrap gap-2">
          {legacy!.valores.map((v, i) => (
            <span key={i} className="px-3 py-1 rounded-full font-black"
              style={{ fontSize: 10, letterSpacing: '0.1em', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#8B5CF6' }}>
              {v.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Ideas alineadas */}
      {ideas.length > 0 && (
        <div className="bm-card p-4">
          <span className="sys-label block mb-2" style={{ color: '#6366F1' }}>IDEAS CONECTADAS</span>
          {ideas.filter(i => i.estado !== 'idea').slice(0, 3).map(idea => (
            <div key={idea.id} className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#6366F1' }} />
              <p className="text-[12px] text-white/70">{idea.titulo}</p>
              <span className="sys-label ml-auto shrink-0" style={{ color: '#6366F1' }}>{idea.estado}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setEditando(true)}
        className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: 'rgba(139,92,246,0.7)' }}>
        EDITAR LEGADO
      </button>
    </div>
  );
}
