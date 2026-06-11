import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, TrendingUp, TrendingDown, Zap, Newspaper, Calendar, ChevronRight, Check, X, Volume2, Activity, BookOpen, Utensils, Brain } from 'lucide-react';
import DailyPriorities from '../components/DailyPriorities';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreaks, calcScore, saveDailyScore, getDailyScores } from '../hooks/useStreaks';
import { cn } from '../lib/utils';
import { hablarTexto } from '../services/voiceService';
import { useNavigate, useOutletContext } from 'react-router-dom';
import DomexInsight from '../components/DomexInsight';

function ScoreCircle({ score, onClick }: { score: number; onClick: () => void }) {
  const r = 22;
  const rOuter = 28;
  const circ = 2 * Math.PI * r;
  const circOuter = 2 * Math.PI * rOuter;
  const dash = (score / 100) * circ;
  const color = score >= 90 ? '#10B981' : score >= 70 ? 'var(--accent-main)' : '#FF6D28';
  return (
    <button onClick={onClick} className="hover:opacity-80 transition-opacity relative group">
      <svg width="64" height="64" viewBox="0 0 64 64">
        {/* Outer dashed decorative ring */}
        <circle cx="32" cy="32" r={rOuter} fill="none" stroke="rgba(0,212,255,0.12)"
          strokeWidth="1" strokeDasharray="2 5" />
        {/* Secondary tick marks */}
        {[0, 60, 120, 180, 240, 300].map(deg => {
          const rad = (deg - 90) * Math.PI / 180;
          return (
            <line key={deg}
              x1={32 + (rOuter - 2) * Math.cos(rad)} y1={32 + (rOuter - 2) * Math.sin(rad)}
              x2={32 + (rOuter + 2) * Math.cos(rad)} y2={32 + (rOuter + 2) * Math.sin(rad)}
              stroke="rgba(0,212,255,0.35)" strokeWidth="1"
            />
          );
        })}
        {/* Track */}
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
        {/* Progress */}
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Score */}
        <text x="32" y="35" textAnchor="middle" fontSize="13" fontWeight="900"
          fill="white" fontFamily="'JetBrains Mono', monospace">{score}</text>
      </svg>
    </button>
  );
}

function HoraNow() {
  const [hora, setHora] = useState(() => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const id = setInterval(() => setHora(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })), 30000);
    return () => clearInterval(id);
  }, []);
  return <span className="sys-value">{hora}</span>;
}

function saludo(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const PRIORIDAD_CONFIG = {
  alta:  { label: 'CRÍTICA', color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
  media: { label: 'ALTA',    color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  baja:  { label: 'NORMAL',  color: 'text-white/30',  bg: 'bg-white/5 border-white/10' },
};

export default function Dashboard() {
  const { tareas, mercado, agenda, noticiasLeidas, marcarNoticiaLeida, alternarTarea, balanceCalculado, learningCategories, learningLessons, mealEntries, memoryEntries, energyEntries } = useApp();
  const { profile } = useUserProfile();
  const streak = useStreaks();
  const navigate = useNavigate();
  const { onRepetirBriefing } = useOutletContext<{ onRepetirBriefing?: () => void }>() ?? {};

  const [celebrando, setCelebrando] = useState<string | null>(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [historial, setHistorial] = useState(() => getDailyScores());

  const tareasFoco = tareas.filter(t => t.esFoco && !t.completada).slice(0, 3);
  const tareasCompletadas = tareas.filter(t => t.completada).length;
  const score = calcScore(tareasCompletadas, tareas.length, noticiasLeidas.length);

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    saveDailyScore({ fecha: hoy, score, tareasCompletadas, totalTareas: tareas.length, noticiasLeidas: noticiasLeidas.length });
    setHistorial(getDailyScores());
  }, [score]);

  const btc = mercado.find(m => m.simbolo === 'BTC');
  const eth = mercado.find(m => m.simbolo === 'ETH');
  const ahora = new Date();
  const proximaReunion = agenda
    .filter(a => new Date(`${a.fecha}T${a.hora}`) > ahora)
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())[0];
  const enMenosde30min = proximaReunion
    ? (new Date(`${proximaReunion.fecha}T${proximaReunion.hora}`).getTime() - ahora.getTime()) < 30 * 60000
    : false;

  const nombre = profile.identity.nombre || 'OPERADOR';

  const completarTarea = (id: string) => {
    alternarTarea(id);
    setCelebrando(id);
    setTimeout(() => setCelebrando(null), 900);
  };

  const graphData = historial.slice(-14).map(d => ({ dia: d.fecha.slice(5), score: d.score }));

  return (
    <div className="flex flex-col gap-3 pb-2">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-[20px] font-black tracking-tight leading-none">
            {saludo()},
          </h1>
          <h1 className="text-[22px] font-black tracking-tight leading-none glow-cyan">{nombre}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Zap size={9} style={{ color: 'var(--accent-secondary)' }} />
              <span className="sys-label" style={{ color: 'var(--accent-secondary)', letterSpacing: '0.15em' }}>{streak}d RACHA</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {onRepetirBriefing && (
            <button onClick={onRepetirBriefing} className="w-9 h-9 bm-card flex items-center justify-center transition-all" title="Briefing">
              <Volume2 size={13} style={{ color: 'var(--color-accent)' }} />
            </button>
          )}
          <div className="flex flex-col items-end gap-1">
            <p className="text-lg font-black tabular-nums sys-value glow-cyan"><HoraNow /></p>
            <ScoreCircle score={score} onClick={() => setShowScoreBreakdown(true)} />
          </div>
        </div>
      </header>

      {/* ── NEURAL ANALYSIS ── */}
      <div className="bm-card p-0.5">
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          <Activity size={10} style={{ color: 'var(--color-accent)' }} />
          <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>ANÁLISIS NEURAL · IA</span>
        </div>
        <div className="px-2 pb-2">
          <DomexInsight />
        </div>
      </div>

      {/* ── PRIORIDADES IA ── */}
      <DailyPriorities />

      {/* ── PROTOCOLOS ACTIVOS ── */}
      <div className="bm-card p-4 space-y-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={10} style={{ color: 'var(--color-accent)' }} />
            <span className="sys-label">PROTOCOLOS HOY</span>
          </div>
          <button onClick={() => navigate('/tasks')} className="sys-label flex items-center gap-0.5 hover:text-white/50 transition-colors">
            VER TODOS <ChevronRight size={9} />
          </button>
        </div>

        {tareasFoco.length > 0 ? tareasFoco.map((t, i) => {
          const cfg = PRIORIDAD_CONFIG[t.prioridad];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, backgroundColor: celebrando === t.id ? 'rgba(16,185,129,0.08)' : 'transparent' }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-1 px-1 rounded-lg transition-colors"
            >
              <button onClick={() => completarTarea(t.id)} className="w-11 h-11 flex items-center justify-center shrink-0">
                <div className={cn(
                  'w-5 h-5 rounded flex items-center justify-center transition-all',
                  celebrando === t.id
                    ? 'bg-emerald-500 border border-emerald-400'
                    : 'border border-white/20 hover:border-primary/60'
                )}>
                  {celebrando === t.id && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
              </button>
              <span className={cn('text-[13px] font-medium flex-1 leading-tight transition-all', celebrando === t.id && 'line-through opacity-40')}>
                {t.titulo}
              </span>
              <span className={cn('text-[8px] font-black px-1.5 py-0.5 rounded border sys-value', cfg.bg, cfg.color)} style={{ letterSpacing: '0.2em' }}>
                {cfg.label}
              </span>
            </motion.div>
          );
        }) : (
          <p className="text-[11px] text-emerald-400/70 font-medium py-1 sys-value tracking-wide">// SIN PROTOCOLOS CRÍTICOS PENDIENTES</p>
        )}
      </div>

      {/* ── CAPITAL + MERCADO ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bm-card p-4">
          <span className="sys-label block mb-2">CAPITAL</span>
          <p className="text-[17px] font-black sys-value" style={{ color: balanceCalculado >= 0 ? 'white' : '#f87171' }}>
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: profile.goals.moneda, maximumFractionDigits: 0 }).format(balanceCalculado)}
          </p>
          <button onClick={() => navigate('/capital')} className="sys-label mt-2 block hover:opacity-70 transition-opacity" style={{ color: 'var(--color-accent)' }}>
            DETALLES →
          </button>
        </div>

        <div className="bm-card p-4">
          <span className="sys-label block mb-2">MERCADO</span>
          {btc && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="sys-label" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>BTC</span>
              <div className={cn('flex items-center gap-0.5 text-[11px] font-black sys-value', btc.cambio >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {btc.cambio >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {btc.cambio >= 0 ? '+' : ''}{btc.cambio}%
              </div>
            </div>
          )}
          {eth && (
            <div className="flex items-center gap-1.5">
              <span className="sys-label" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>ETH</span>
              <div className={cn('flex items-center gap-0.5 text-[11px] font-black sys-value', eth.cambio >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {eth.cambio >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {eth.cambio >= 0 ? '+' : ''}{eth.cambio}%
              </div>
            </div>
          )}
          <button onClick={() => navigate('/mercado')} className="sys-label mt-2 block hover:opacity-70 transition-opacity" style={{ color: 'var(--color-accent)' }}>
            DETALLES →
          </button>
        </div>
      </div>

      {/* ── INTEL STREAM ── */}
      <NoticiaCard noticiasLeidas={noticiasLeidas} marcarLeida={marcarNoticiaLeida} />

      {/* ── PRÓXIMA REUNIÓN ── */}
      {proximaReunion ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={cn('bm-card p-4 flex items-center gap-4', enMenosde30min && 'border-red-500/30')}
          style={enMenosde30min ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}
        >
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', enMenosde30min ? 'bg-red-500/15' : 'bg-primary/10')}>
            <Calendar size={15} className={enMenosde30min ? 'text-red-400' : 'text-primary'} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="sys-label block mb-0.5">{enMenosde30min ? '⚠ EN MENOS DE 30 MIN' : 'PRÓXIMA REUNIÓN'}</span>
            <p className="text-[13px] font-bold leading-tight truncate">{proximaReunion.titulo}</p>
            <p className="sys-label mt-0.5" style={{ letterSpacing: '0.15em' }}>
              {proximaReunion.hora}{proximaReunion.personas.length > 0 && ` · ${proximaReunion.personas.join(', ')}`}
            </p>
          </div>
          {enMenosde30min && <div className="live-dot live-dot-amber" />}
        </motion.div>
      ) : (
        <div className="bm-card p-4 flex items-center gap-3">
          <Calendar size={14} className="text-white/15 shrink-0" />
          <span className="sys-label">SIN REUNIONES PROGRAMADAS</span>
        </div>
      )}

      {/* ── CONCIENCIA INTEGRAL ── */}
      {(() => {
        const hoy = new Date().toISOString().split('T')[0];
        const totalRacha = learningCategories.reduce((s, c) => s + c.racha, 0);
        const totalLessons = learningLessons.filter(l => l.completado).length;
        const calHoy = mealEntries.filter(m => m.creadoEn.startsWith(hoy)).reduce((s, m) => s + m.calorias, 0);
        const azHoy = mealEntries.filter(m => m.creadoEn.startsWith(hoy)).reduce((s, m) => s + m.azucar, 0);
        const memHoy = memoryEntries.find(e => e.fecha === hoy);
        const energiaHoy = energyEntries.find(e => e.fecha === hoy);
        const widgets = [
          { icon: BookOpen, label: 'APRENDER', val: learningCategories.length > 0 ? `🔥${totalRacha}d` : '—', sub: learningCategories.length > 0 ? `${totalLessons} lecciones` : 'Sin categorías', color: '#6366F1', path: '/conciencia/aprender' },
          { icon: Utensils, label: 'NUTRICIÓN', val: calHoy > 0 ? `${calHoy}kcal` : '—', sub: calHoy > 0 ? `${azHoy}g azúcar` : 'Sin registro hoy', color: '#10B981', path: '/conciencia/nutricion' },
          { icon: Brain, label: 'MEMORIA', val: memHoy ? `${memHoy.score}/10` : '—', sub: memHoy ? 'Check-in hoy ✓' : 'Sin check-in', color: '#8B5CF6', path: '/conciencia/memoria' },
          { icon: Zap, label: 'ENERGÍA', val: energiaHoy ? `${energiaHoy.score}/10` : '—', sub: energiaHoy ? `${energiaHoy.factores.sueno}h sueño` : 'Sin check-in', color: '#F59E0B', path: '/conciencia/energia' },
        ];
        return (
          <div className="grid grid-cols-3 gap-2">
            {widgets.map(w => {
              const Icon = w.icon;
              return (
                <button key={w.path} onClick={() => navigate(w.path)} className="bm-card p-3 text-left relative overflow-hidden" style={{ '--bm-accent': w.color } as React.CSSProperties}>
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r" style={{ background: w.color }} />
                  <Icon size={10} style={{ color: w.color }} className="mb-1.5" />
                  <p className="text-[13px] font-black sys-value leading-none mb-0.5" style={{ color: w.val !== '—' ? 'white' : 'rgba(255,255,255,0.2)' }}>{w.val}</p>
                  <span className="sys-label block" style={{ color: w.color, opacity: 1 }}>{w.label}</span>
                  <span className="sys-label block mt-0.5">{w.sub}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* ── EVOLUCIÓN ── */}
      <button
        onClick={() => setShowGraph(!showGraph)}
        className="w-full py-2.5 flex items-center justify-center gap-2 group"
      >
        <div className="flex-1 h-px bg-white/5" />
        <span className="sys-label group-hover:text-white/40 transition-colors px-3">
          {showGraph ? '▲' : '▼'} EVOLUCIÓN {Math.min(historial.length, 14)}D
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </button>

      <AnimatePresence>
        {showGraph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bm-card p-4 overflow-hidden"
          >
            {graphData.length > 1 ? (
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={graphData}>
                  <XAxis dataKey="dia" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#040810', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.3)' }}
                    itemStyle={{ color: 'var(--accent-main)' }}
                    formatter={(v: number) => [`${v}pts`, 'SCORE']}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--accent-main)" strokeWidth={1.5} dot={false}
                    style={{ filter: 'drop-shadow(0 0 4px var(--accent-main))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="sys-label text-center py-4">DATOS INSUFICIENTES — CONTINÚA USANDO AICOLMENA</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCORE MODAL ── */}
      <AnimatePresence>
        {showScoreBreakdown && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowScoreBreakdown(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs bm-card p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="sys-label">PERFORMANCE REPORT</span>
                <button onClick={() => setShowScoreBreakdown(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex justify-center py-2">
                <ScoreCircle score={score} onClick={() => {}} />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'TAREAS COMPLETADAS', val: `${tareasCompletadas}/${tareas.length}`, pts: Math.round(tareas.length > 0 ? (tareasCompletadas/tareas.length)*50 : 0) },
                  { label: 'INTEL PROCESADA', val: `${noticiasLeidas.length}/3`, pts: Math.round(Math.min(noticiasLeidas.length/3,1)*50) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="sys-label">{row.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-black sys-value">{row.val}</span>
                      <span className="sys-label block mt-0.5">{row.pts}pts</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="sys-label" style={{ color: 'var(--color-accent)' }}>SCORE TOTAL</span>
                  <span className="text-lg font-black sys-value" style={{ color: 'var(--color-accent)' }}>{score}<span className="text-white/20 text-xs">/100</span></span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </div>
  );
}

function NoticiaCard({ noticiasLeidas, marcarLeida }: { noticiasLeidas: string[], marcarLeida: (id: string) => void }) {
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('domex_news_cache');
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        const noLeidas = data.filter((n: any) => !noticiasLeidas.includes(n.id));
        setNoticia(noLeidas.length > 0 ? noLeidas[0] : data[0] || null);
      } catch {}
    }
  }, []);

  if (!noticia) return (
    <div className="bm-card p-4 flex items-center gap-3">
      <Newspaper size={13} className="text-white/15 shrink-0" />
      <span className="sys-label flex-1">STREAM INTEL — SIN DATOS EN CACHÉ</span>
      <button onClick={() => navigate('/intel')} className="sys-label hover:opacity-60" style={{ color: 'var(--color-accent)' }}>CARGAR →</button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
      className="bm-card p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="live-dot" style={{ background: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
          <span className="sys-label">STREAM INTEL</span>
          {noticiasLeidas.includes(noticia.id) && <span className="sys-label opacity-50">[LEÍDA]</span>}
        </div>
        <button onClick={() => navigate('/intel')} className="sys-label hover:opacity-60 transition-opacity" style={{ color: 'var(--color-accent)' }}>
          INTEL →
        </button>
      </div>
      <p className="text-[13px] font-bold leading-snug line-clamp-2">{noticia.titulo}</p>
      <div className="flex items-center justify-between">
        <span className="sys-label">{noticia.fuente}</span>
        <button
          onClick={() => { marcarLeida(noticia.id); hablarTexto(`${noticia.titulo}. ${noticia.resumen || ''}`); }}
          className="flex items-center gap-1.5 text-[8px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border transition-all"
          style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.08)' }}
        >
          ▶ AUDIO
        </button>
      </div>
    </motion.div>
  );
}
