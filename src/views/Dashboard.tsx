import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, TrendingDown, Zap, Newspaper, Calendar,
  Check, X, BookOpen, Utensils, Brain, Mic, ArrowUp, Play, Pause, RotateCcw, Target,
} from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreaks, calcScore, saveDailyScore, getDailyScores } from '../hooks/useStreaks';
import { cn } from '../lib/utils';
import { hablarTexto, hablarConCallback, detenerVoz, pausarVoz, reanudarVoz } from '../services/voiceService';
import { useNavigate, useOutletContext } from 'react-router-dom';

// ── Helpers ────────────────────────────────────────────────────────

function saludo(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatEyebrow(): string {
  const d = new Date();
  const weekday = d.toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase();
  const day = d.getDate();
  const month = d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase().replace('.', '');
  return `${weekday} · ${day} ${month}`;
}

const WAVE_HEIGHTS = [4, 8, 12, 6, 10, 14, 8, 5, 11, 7];

// ── BriefingText ───────────────────────────────────────────────────

function BriefingText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i} style={{ color: 'var(--honey-bright)', fontWeight: 600 }}>{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

// ── BriefingHeroCard ───────────────────────────────────────────────

function BriefingHeroCard({ onPlay, text }: { onPlay?: () => void; text: string }) {
  const [escuchado, setEscuchado] = useState(() =>
    !!localStorage.getItem('domex_briefing_escuchado_' + new Date().toISOString().split('T')[0])
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startAudio = () => {
    hablarConCallback(
      text,
      () => setIsPlaying(true),
      () => { setIsPlaying(false); setIsPaused(false); }
    );
  };

  const handlePlay = () => {
    if (isPlaying && !isPaused) {
      pausarVoz();
      setIsPaused(true);
      return;
    }
    if (isPaused) {
      reanudarVoz();
      setIsPaused(false);
      return;
    }
    const key = 'domex_briefing_escuchado_' + new Date().toISOString().split('T')[0];
    localStorage.setItem(key, '1');
    setEscuchado(true);
    setIsPlaying(true);
    startAudio();
    onPlay?.();
  };

  const handleRestart = () => {
    detenerVoz();
    setIsPlaying(false);
    setIsPaused(false);
    setTimeout(() => { setIsPlaying(true); startAudio(); }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden"
      style={{
        background: '#0F0D08',
        border: '1px solid rgba(201,148,26,0.3)',
        borderRadius: 20,
        padding: 16,
      }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,148,26,0.6), transparent)' }} />
      {/* Halo top-right */}
      <div className="absolute -top-6 -right-6 pointer-events-none"
        style={{ width: 100, height: 100, background: 'radial-gradient(circle, rgba(201,148,26,0.10) 0%, transparent 70%)' }} />

      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--honey-core)', letterSpacing: '0.1em' }}>
          ✦ TU BRIEFING DE HOY
        </span>
        <span style={{
          background: 'rgba(201,148,26,0.12)', border: '1px solid rgba(201,148,26,0.25)',
          borderRadius: 5, padding: '2px 8px',
          fontSize: 9, fontWeight: 600, color: 'var(--honey-core)', fontFamily: 'var(--font-display)',
        }}>
          {escuchado ? 'VISTO' : 'NUEVO'}
        </span>
      </div>

      {/* Body */}
      <div className="flex gap-3.5 items-start">
        {/* Play/Pause button with pulse ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 54, height: 54 }}>
          {isPlaying && !isPaused && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ width: 66, height: 66, border: '1px solid rgba(201,148,26,0.25)' }}
              animate={{ scale: [1, 1.1], opacity: [0.6, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
            />
          )}
          <button
            onClick={handlePlay}
            className="flex items-center justify-center rounded-full transition-all active:scale-95 relative"
            style={{ width: 54, height: 54, background: 'var(--honey-core)', flexShrink: 0 }}
            aria-label={isPlaying && !isPaused ? 'Pausar briefing' : 'Reproducir briefing'}
          >
            {isPlaying && !isPaused
              ? <Pause size={20} style={{ color: '#1A1206' }} fill="#1A1206" />
              : <Play size={20} style={{ color: '#1A1206', marginLeft: 2 }} fill="#1A1206" />
            }
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Progress bar */}
          <div className="h-0.5 rounded-full mb-2.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full"
              style={{ width: escuchado ? '100%' : '30%', background: 'linear-gradient(90deg, #C9941A, #F0B429)', transition: 'width 0.8s ease' }} />
          </div>
          {/* Briefing text */}
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
            <BriefingText text={text} />
          </p>
          {/* Waveform decoration */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {WAVE_HEIGHTS.map((h, i) => (
              <div key={i} style={{ width: 3, height: h, background: 'var(--honey-core)', opacity: isPlaying && !isPaused ? 1 : 0.5, borderRadius: 2, flexShrink: 0, transition: 'opacity 0.3s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer with restart button */}
      <div className="mt-2 flex items-center justify-between">
        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
          30 seg · Generado para hoy · Nova
        </p>
        {isPlaying && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-1 transition-opacity hover:opacity-60"
            style={{ fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
          >
            <RotateCcw size={10} />
            REINICIAR
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Priority helpers ───────────────────────────────────────────────

const PRIORIDAD_STYLE = {
  alta:  { iconType: 'GOLD'   as const, chipLabel: 'URGENTE', chipBg: 'rgba(248,113,113,0.1)',  chipColor: '#FCA5A5' },
  media: { iconType: 'VIOLET' as const, chipLabel: 'HOY',     chipBg: 'rgba(201,148,26,0.12)',  chipColor: 'var(--honey-bright)' },
  baja:  { iconType: 'TEAL'   as const, chipLabel: 'NORMAL',  chipBg: 'rgba(52,211,153,0.1)',   chipColor: '#6EE7B7' },
};

const ICON_CONFIG = {
  GOLD:   { bg: 'rgba(201,148,26,0.10)', border: 'rgba(201,148,26,0.2)',  color: 'var(--honey-core)',  Icon: Target   },
  VIOLET: { bg: 'rgba(91,33,182,0.15)',  border: 'rgba(91,33,182,0.2)',   color: 'var(--violet-soft)', Icon: Calendar },
  TEAL:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.15)', color: '#5EEAD4',            Icon: Zap      },
};

// ── ScoreCircle ─────────────────────────────────────────────────────

function ScoreCircle({ score, onClick }: { score: number; onClick: () => void }) {
  const r = 22;
  const rOuter = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 90 ? 'var(--success)' : score >= 70 ? 'var(--honey-core)' : '#FF6D28';
  return (
    <button onClick={onClick} className="hover:opacity-80 transition-opacity">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={rOuter} fill="none" stroke="rgba(201,148,26,0.12)" strokeWidth="1" strokeDasharray="2 5" />
        {[0, 60, 120, 180, 240, 300].map(deg => {
          const rad = (deg - 90) * Math.PI / 180;
          return (
            <line key={deg}
              x1={32 + (rOuter - 2) * Math.cos(rad)} y1={32 + (rOuter - 2) * Math.sin(rad)}
              x2={32 + (rOuter + 2) * Math.cos(rad)} y2={32 + (rOuter + 2) * Math.sin(rad)}
              stroke="rgba(201,148,26,0.35)" strokeWidth="1"
            />
          );
        })}
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="32" y="35" textAnchor="middle" fontSize="13" fontWeight="900"
          fill="white" fontFamily="'JetBrains Mono', monospace">{score}</text>
      </svg>
    </button>
  );
}

// ── QuickDictationBar ──────────────────────────────────────────────

function QuickDictationBar() {
  return (
    <button
      onClick={() => document.dispatchEvent(new CustomEvent('aicolmena:openVoice'))}
      className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition-opacity hover:opacity-80"
      style={{ background: '#0D0B10', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <Mic size={18} style={{ color: 'var(--violet-core)', flexShrink: 0 }} />
      <span className="flex-1" style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        Dictá algo rápido...
      </span>
      <div className="flex items-center justify-center rounded-full"
        style={{ width: 30, height: 30, background: 'var(--honey-core)', flexShrink: 0 }}>
        <ArrowUp size={14} style={{ color: '#1A1206' }} />
      </div>
    </button>
  );
}

// ── NoticiaCard ─────────────────────────────────────────────────────

function NoticiaCard({ noticiasLeidas, marcarLeida }: { noticiasLeidas: string[]; marcarLeida: (id: string) => void }) {
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

// ── Dashboard ───────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    tareas, mercado, agenda, noticiasLeidas, marcarNoticiaLeida,
    alternarTarea, balanceCalculado, learningCategories, learningLessons,
    mealEntries, memoryEntries, energyEntries,
  } = useApp();
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

  const nombre = profile.identity.nombre || 'Emprendedor';
  const inicial = nombre.charAt(0).toUpperCase();

  const completarTarea = (id: string) => {
    alternarTarea(id);
    setCelebrando(id);
    setTimeout(() => setCelebrando(null), 900);
  };

  const graphData = historial.slice(-14).map(d => ({ dia: d.fecha.slice(5), score: d.score }));

  const briefingText = useMemo(() => {
    const parts: string[] = [];
    if (tareasFoco.length > 0) {
      parts.push(`Tenés **${tareasFoco.length} prioridad${tareasFoco.length !== 1 ? 'es' : ''}** para hoy`);
    }
    if (balanceCalculado > 0) {
      parts.push(`tu capital está en **positivo**`);
    } else if (balanceCalculado < 0) {
      parts.push(`revisá tu **capital**`);
    }
    if (proximaReunion) {
      parts.push(`próxima reunión a las **${proximaReunion.hora}**`);
    }
    return parts.length > 0
      ? parts.join('. ') + '.'
      : `**${nombre}**, todo listo para empezar.`;
  }, [tareasFoco.length, balanceCalculado, proximaReunion, nombre]);

  return (
    <div className="relative flex flex-col gap-4 pb-2">

      {/* ── BACKGROUND EFFECTS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Hex pattern top-right */}
        <div className="absolute top-0 right-0" style={{
          width: 200, height: 200, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48' viewBox='0 0 56 48'%3E%3Cpolygon points='28,0 56,16 56,32 28,48 0,32 0,16' fill='none' stroke='%23C9941A' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '56px 48px',
        }} />
        {/* Orb gold */}
        <div className="absolute" style={{ width: 160, height: 160, top: -40, right: -40, background: 'radial-gradient(circle, rgba(201,148,26,0.12) 0%, transparent 70%)' }} />
        {/* Orb violet */}
        <div className="absolute" style={{ width: 120, height: 120, bottom: 120, left: -30, background: 'radial-gradient(circle, rgba(91,33,182,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative flex flex-col gap-4" style={{ zIndex: 1 }}>

        {/* ── HEADER ── */}
        <header className="flex items-start justify-between pt-1">
          {/* Left */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>
              {formatEyebrow()}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {saludo()},<br />
              <span style={{ color: 'var(--honey-core)' }}>{nombre}</span>
            </h1>
            {streak > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <Zap size={10} style={{ color: 'var(--honey-core)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontFamily: 'var(--font-display)' }}>
                  {streak} DÍAS DE RACHA
                </span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
            {/* Avatar */}
            <div className="rounded-full flex items-center justify-center"
              style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #1A1206, #2A1E08)', border: '1.5px solid rgba(201,148,26,0.4)', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--honey-core)' }}>{inicial}</span>
            </div>
            {/* ACTIVO pill */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div className="rounded-full" style={{ width: 5, height: 5, background: '#34D399', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 600, color: '#34D399', letterSpacing: '0.05em' }}>ACTIVO</span>
            </div>
            {/* Score tappable */}
            <button onClick={() => setShowScoreBreakdown(true)} className="hover:opacity-70 transition-opacity">
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--honey-soft)', letterSpacing: '0.08em' }}>
                {score}pts
              </span>
            </button>
          </div>
        </header>

        {/* ── BRIEFING CARD ── */}
        <BriefingHeroCard onPlay={onRepetirBriefing} text={briefingText} />

        {/* ── PRIORIDADES ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
              LO QUE IMPORTA HOY
            </span>
            {tareasFoco.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--violet-soft)', fontWeight: 500 }}>
                {tareasFoco.length} pendiente{tareasFoco.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {tareasFoco.length > 0 ? (
            <div className="space-y-2">
              {tareasFoco.map((t, i) => {
                const pStyle = PRIORIDAD_STYLE[t.prioridad as keyof typeof PRIORIDAD_STYLE] ?? PRIORIDAD_STYLE.media;
                const iCfg = ICON_CONFIG[pStyle.iconType];
                const IconComp = iCfg.Icon;
                const isCelebrating = celebrando === t.id;
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-[14px] px-3.5 py-3"
                    style={{
                      background: '#0D0B10',
                      border: `1px solid ${i === 0 ? 'rgba(201,148,26,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    {/* Icon box / complete button */}
                    <button
                      onClick={() => completarTarea(t.id)}
                      className="flex items-center justify-center rounded-[10px] shrink-0 transition-all active:scale-90"
                      style={{
                        width: 36, height: 36,
                        background: isCelebrating ? 'rgba(52,211,153,0.15)' : iCfg.bg,
                        border: `1px solid ${isCelebrating ? 'rgba(52,211,153,0.3)' : iCfg.border}`,
                      }}
                    >
                      {isCelebrating
                        ? <Check size={16} style={{ color: 'var(--success)' }} strokeWidth={3} />
                        : <IconComp size={16} style={{ color: iCfg.color }} />
                      }
                    </button>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('leading-tight truncate', isCelebrating && 'line-through opacity-40')}
                        style={{ fontSize: 12.5, fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {t.titulo}
                      </p>
                      <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
                        {t.fechaVencimiento
                          ? new Date(t.fechaVencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                          : 'Sin fecha'
                        }
                      </p>
                    </div>

                    {/* Status chip */}
                    <span style={{
                      background: pStyle.chipBg, color: pStyle.chipColor,
                      borderRadius: 5, padding: '2px 7px',
                      fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-display)',
                      letterSpacing: '0.05em', flexShrink: 0,
                    }}>
                      {pStyle.chipLabel}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-2xl"
              style={{ background: '#0D0B10', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Mic size={24} style={{ color: 'var(--violet-soft)' }} />
              <p className="text-center" style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
                Todavía no tenés prioridades para hoy.<br />
                <span style={{ color: 'var(--honey-soft)' }}>Tocá el micrófono y contame qué está pasando.</span>
              </p>
            </div>
          )}
        </section>

        {/* ── DIVISOR ── */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,148,26,0.1), transparent)' }} />

        {/* ── BARRA DE DICTADO RÁPIDO ── */}
        <QuickDictationBar />

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
            {!btc && !eth ? (
              <div className="space-y-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ) : (
              <>
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
              </>
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
            className="bm-card p-4 flex items-center gap-4"
            style={enMenosde30min ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', enMenosde30min ? 'bg-red-500/15' : 'bg-[var(--violet-ghost)]')}>
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
            { icon: BookOpen,  label: 'APRENDER', val: learningCategories.length > 0 ? `🔥${totalRacha}d` : '—', sub: learningCategories.length > 0 ? `${totalLessons} lecciones` : 'Sin categorías', color: '#6366F1', path: '/conciencia/aprender' },
            { icon: Utensils,  label: 'NUTRICIÓN', val: calHoy > 0 ? `${calHoy}kcal` : '—', sub: calHoy > 0 ? `${azHoy}g azúcar` : 'Sin registro hoy',  color: '#10B981', path: '/conciencia/nutricion' },
            { icon: Brain,     label: 'MEMORIA',   val: memHoy ? `${memHoy.score}/10` : '—', sub: memHoy ? 'Check-in hoy ✓' : 'Sin check-in',             color: '#8B5CF6', path: '/conciencia/memoria' },
            { icon: Zap,       label: 'ENERGÍA',   val: energiaHoy ? `${energiaHoy.score}/10` : '—', sub: energiaHoy ? `${energiaHoy.factores.sueno}h sueño` : 'Sin check-in', color: '#F59E0B', path: '/conciencia/energia' },
          ];
          return (
            <div className="grid grid-cols-2 gap-2">
              {widgets.map(w => {
                const Icon = w.icon;
                return (
                  <button key={w.path} onClick={() => navigate(w.path)}
                    className="bm-card p-3 text-left relative overflow-hidden"
                    style={{ '--bm-accent': w.color } as React.CSSProperties}>
                    <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r" style={{ background: w.color }} />
                    <Icon size={11} style={{ color: w.color }} className="mb-1.5 ml-1" />
                    <p className="text-[14px] font-black sys-value leading-none mb-0.5 ml-1"
                      style={{ color: w.val !== '—' ? 'white' : 'rgba(255,255,255,0.2)' }}>{w.val}</p>
                    <span className="sys-label block ml-1" style={{ color: w.color, opacity: 1 }}>{w.label}</span>
                    <span className="sys-label block mt-0.5 ml-1">{w.sub}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* ── EVOLUCIÓN ── */}
        <button onClick={() => setShowGraph(!showGraph)} className="w-full py-2.5 flex items-center justify-center gap-2 group">
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
                      contentStyle={{ background: '#040810', border: '1px solid rgba(201,148,26,0.25)', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}
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
                    { label: 'TAREAS COMPLETADAS', val: `${tareasCompletadas}/${tareas.length}`, pts: Math.round(tareas.length > 0 ? (tareasCompletadas / tareas.length) * 50 : 0) },
                    { label: 'INTEL PROCESADA', val: `${noticiasLeidas.length}/3`, pts: Math.round(Math.min(noticiasLeidas.length / 3, 1) * 50) },
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
                    <span className="text-lg font-black sys-value" style={{ color: 'var(--color-accent)' }}>
                      {score}<span className="text-white/20 text-xs">/100</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-20" />
      </div>
    </div>
  );
}
