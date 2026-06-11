import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Volume2, ChevronLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MemoryEntry } from '../types';
import { analizarPatronMemoria, getTipDelDia } from '../services/memoryService';
import { hablarTexto } from '../services/voiceService';

const SINTOMAS = ['Brain fog', 'Olvido palabras', 'Dispersión', 'Lentitud mental'];

const SCORE_LABELS: Record<number, string> = {
  1: 'MUY BAJO', 2: 'BAJO', 3: 'BAJO', 4: 'MODERADO',
  5: 'MODERADO', 6: 'BUENO', 7: 'BUENO', 8: 'MUY BUENO',
  9: 'EXCELENTE', 10: 'PICO',
};

function scoreColor(s: number): string {
  if (s >= 8) return '#10B981';
  if (s >= 6) return '#F59E0B';
  return '#EF4444';
}

export default function Memoria() {
  const navigate = useNavigate();
  const { memoryEntries, evaluarMemoria, mealEntries } = useApp();

  const hoy = new Date().toISOString().split('T')[0];
  const yaRegistroHoy = memoryEntries.some(e => e.fecha === hoy);

  const [score, setScore] = useState(7);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [contexto, setContexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [analisis, setAnalisis] = useState<string | null>(null);
  const [cargandoAnalisis, setCargandoAnalisis] = useState(false);

  const tip = getTipDelDia();
  const ultimos7 = memoryEntries.slice(0, 7);
  const azucarPromedio = mealEntries.length > 0
    ? Math.round(mealEntries.slice(0, 7).reduce((s, m) => s + m.azucar, 0) / Math.min(mealEntries.length, 7))
    : 0;

  useEffect(() => {
    if (memoryEntries.length >= 3 && !analisis) {
      setCargandoAnalisis(true);
      analizarPatronMemoria(memoryEntries, azucarPromedio)
        .then(r => setAnalisis(r))
        .finally(() => setCargandoAnalisis(false));
    }
  }, [memoryEntries.length]);

  const toggleSintoma = (s: string) => {
    setSintomas(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}`,
      fecha: hoy,
      score,
      sintomas,
      contexto,
      creadoEn: new Date().toISOString(),
    };
    evaluarMemoria(entry);
    setGuardando(false);
    setSintomas([]);
    setContexto('');

    // Actualizar análisis con el nuevo registro
    if (memoryEntries.length >= 2) {
      setCargandoAnalisis(true);
      analizarPatronMemoria([entry, ...memoryEntries], azucarPromedio)
        .then(r => setAnalisis(r))
        .finally(() => setCargandoAnalisis(false));
    }
  };

  const col = scoreColor(score);

  return (
    <div className="flex flex-col gap-3 pb-2">
      <header className="flex items-center justify-between pt-1">
        <div>
          <button onClick={() => navigate('/conciencia')} className="flex items-center gap-1 sys-label hover:opacity-70 transition-opacity mb-1.5">
            ← CONCIENCIA
          </button>
          <h1 className="text-[22px] font-black tracking-tight uppercase">Memoria</h1>
        </div>
        <Brain size={20} style={{ color: '#8B5CF6', opacity: 0.5 }} />
      </header>

      {/* Check-in diario */}
      <div className="bm-card p-4 relative overflow-hidden">
        <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: '#8B5CF6' }} />
        <div className="flex items-center gap-2 mb-4">
          <div className="live-dot" style={{ background: '#8B5CF6', boxShadow: '0 0 6px #8B5CF6' }} />
          <span className="sys-label" style={{ color: '#8B5CF6', opacity: 1 }}>
            {yaRegistroHoy ? 'CHECK-IN HOY ✓' : 'CHECK-IN DIARIO'}
          </span>
        </div>

        {!yaRegistroHoy ? (
          <div className="space-y-4">
            {/* Slider */}
            <div className="text-center space-y-2">
              <p className="text-[42px] font-black sys-value" style={{ color: col }}>{score}</p>
              <span className="sys-label" style={{ color: col, opacity: 1 }}>{SCORE_LABELS[score] ?? 'BUENO'}</span>
              <p className="text-[11px] text-white/30">¿Cómo está tu memoria y claridad mental hoy?</p>
              <input
                type="range" min={1} max={10} step={1}
                value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
                style={{ accentColor: col }}
              />
              <div className="flex justify-between">
                <span className="sys-label">1</span>
                <span className="sys-label">10</span>
              </div>
            </div>

            {/* Síntomas */}
            <div>
              <span className="sys-label block mb-2">SÍNTOMAS (opcional)</span>
              <div className="flex flex-wrap gap-2">
                {SINTOMAS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSintoma(s)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide transition-all"
                    style={{
                      background: sintomas.includes(s) ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                      border: sintomas.includes(s) ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
                      color: sintomas.includes(s) ? '#EF4444' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Contexto */}
            <input
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              placeholder='Ej: "Dormí 5h", "Mucho estrés hoy"'
              className="w-full rounded-xl px-3 py-2.5 text-[12px] text-white/70 bg-transparent outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            />

            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: '#8B5CF6', color: '#fff' }}
            >
              {guardando ? <Loader2 size={13} className="animate-spin" /> : 'REGISTRAR'}
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-[38px] font-black sys-value" style={{ color: col }}>
              {memoryEntries[0]?.score ?? score}
            </p>
            <span className="sys-label" style={{ color: col, opacity: 1 }}>
              {SCORE_LABELS[memoryEntries[0]?.score ?? score]} — HOY REGISTRADO
            </span>
          </div>
        )}
      </div>

      {/* Análisis IA */}
      {(analisis || cargandoAnalisis) && (
        <div className="bm-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="sys-label" style={{ color: '#8B5CF6', opacity: 1 }}>ANÁLISIS DE PATRÓN</span>
            {analisis && (
              <button onClick={() => hablarTexto(analisis, 1.05)}>
                <Volume2 size={12} className="text-white/30" />
              </button>
            )}
          </div>
          {cargandoAnalisis ? (
            <div className="flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-purple-400" />
              <span className="sys-label">Analizando patrones...</span>
            </div>
          ) : (
            <p className="text-[12px] text-white/60 leading-relaxed">{analisis}</p>
          )}
        </div>
      )}

      {/* Historial últimos 7 días */}
      {ultimos7.length > 0 && (
        <div className="bm-card p-4">
          <span className="sys-label block mb-3">ÚLTIMOS {ultimos7.length} DÍAS</span>
          <div className="flex items-end gap-1.5 h-12">
            {ultimos7.slice().reverse().map((e, i) => {
              const h = (e.score / 10) * 48;
              const c = scoreColor(e.score);
              return (
                <div key={e.id} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: h }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                    className="w-full rounded-sm"
                    style={{ background: c, opacity: 0.7 }}
                  />
                  <span className="sys-label text-center">
                    {e.fecha.slice(8)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tip del día */}
      <div className="bm-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="sys-label" style={{ color: '#8B5CF6', opacity: 1 }}>TIP HOY</span>
          <button onClick={() => hablarTexto(tip, 1.05)}>
            <Volume2 size={12} className="text-white/30" />
          </button>
        </div>
        <p className="text-[12px] text-white/60 leading-relaxed">{tip}</p>
      </div>

      <div className="h-20" />
    </div>
  );
}
