import React, { useState } from 'react';
import { Eye, Loader2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectarBlindSpots, generarOportunidades } from '../services/optimizacionService';

export default function OptimizacionHub() {
  const { ideas, tareas, habitos, contactos, decisions, blindSpots, setBlindSpots,
    completarBlindSpot, mercado } = useApp();
  const [escaneando, setEscaneando] = useState(false);
  const [radarCargando, setRadarCargando] = useState(false);
  const [radarResult, setRadarResult] = useState<string | null>(null);

  const spotsActivos = blindSpots.filter(b => !b.completado);
  const btcChange = mercado.find(m => m.simbolo === 'BTC')?.cambio ?? 0;

  const escanearBlindSpots = async () => {
    setEscaneando(true);
    const tareasCompletadas = tareas.filter(t => t.completada).length;
    try {
      const spots = await detectarBlindSpots({ ideas, habitos, contactos, decisions, tareasCompletadasSemana: tareasCompletadas });
      setBlindSpots(spots);
    } catch { /* silencioso */ }
    setEscaneando(false);
  };

  const lanzarRadar = async () => {
    setRadarCargando(true);
    try {
      const result = await generarOportunidades({ ideas, contactos, btcChange });
      setRadarResult(result.oportunidades.map(o => `**${o.titulo}** — ${o.razon}. Acción: ${o.accion}`).join('\n\n') + `\n\n_Insight: ${result.insight}_`);
    } catch { setRadarResult('Error al cargar. Intentá de nuevo.'); }
    setRadarCargando(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#6366F1' } as any} />
          <span className="sys-label">ETAPA 4</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Optimización<br />Existencial</h1>
      </div>

      {/* Decisiones/Accountability/Legado se sacaron de este lugar prominente
          (poda de vistas) — accesibles solo via More */}

      {/* Blind Spots */}
      <div className="bm-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={14} style={{ color: '#EF4444' }} />
            <span className="sys-label" style={{ color: '#EF4444' }}>BLIND SPOTS</span>
          </div>
          <button onClick={escanearBlindSpots} disabled={escaneando}
            className="sys-label px-3 py-1 rounded-lg flex items-center gap-1 disabled:opacity-40"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
            {escaneando ? <Loader2 size={10} className="animate-spin" /> : null}
            {escaneando ? 'ESCANEANDO...' : 'ESCANEAR IA'}
          </button>
        </div>
        {spotsActivos.length === 0 ? (
          <p className="text-[11px] text-white/30">Tocá "ESCANEAR IA" para detectar patrones que no estás viendo.</p>
        ) : (
          <div className="space-y-2">
            {spotsActivos.map(spot => (
              <div key={spot.id} className="p-3 rounded-xl space-y-1.5"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="font-black text-[13px]">{spot.descripcion}</p>
                <p className="text-[11px] text-white/50">{spot.impacto}</p>
                <div className="flex items-start gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: '#10B981' }} />
                  <p className="text-[11px] font-medium" style={{ color: '#10B981' }}>{spot.intervencion}</p>
                </div>
                <button onClick={() => completarBlindSpot(spot.id)}
                  className="flex items-center gap-1 sys-label mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <CheckCircle size={10} />MARCAR TRABAJADO
                </button>
              </div>
            ))}
          </div>
        )}
        {blindSpots.filter(b => b.completado).length > 0 && (
          <p className="sys-label" style={{ color: '#10B981' }}>✓ {blindSpots.filter(b => b.completado).length} trabajados</p>
        )}
      </div>

      {/* Opportunity Radar */}
      <div className="bm-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="sys-label" style={{ color: '#6366F1' }}>OPPORTUNITY RADAR</span>
          <button onClick={lanzarRadar} disabled={radarCargando}
            className="sys-label px-3 py-1 rounded-lg flex items-center gap-1 disabled:opacity-40"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1' }}>
            {radarCargando ? <Loader2 size={10} className="animate-spin" /> : null}
            {radarCargando ? 'ANALIZANDO...' : 'RADAR SEMANAL'}
          </button>
        </div>
        {radarResult ? (
          <div className="text-[12px] leading-relaxed space-y-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {radarResult.split('\n\n').map((block, i) => (
              <p key={i}>
                {block.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={j} style={{ color: 'white' }}>{part.slice(2, -2)}</strong>
                    : part
                )}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/30">Groq cruza tus ideas + contactos + mercado y detecta oportunidades que no estás viendo.</p>
        )}
      </div>
    </div>
  );
}
