import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Target, TrendingUp, TrendingDown, Zap,
  Newspaper, Calendar, ChevronRight, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreaks, calcScore } from '../hooks/useStreaks';
import { cn } from '../lib/utils';
import { hablarTexto } from '../services/voiceService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function ScoreCircle({ score }: { score: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#F43F5E';
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">{score}</text>
    </svg>
  );
}

function HoraNow() {
  const [hora, setHora] = useState(() => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const id = setInterval(() => setHora(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })), 30000);
    return () => clearInterval(id);
  }, []);
  return <span>{hora}</span>;
}

function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function Dashboard() {
  const { tareas, mercado, agenda, noticiasLeidas, marcarNoticiaLeida, alternarTarea } = useApp();
  const { profile } = useUserProfile();
  const streak = useStreaks();
  const navigate = useNavigate();

  const tareasFoco = tareas.filter(t => t.esFoco && !t.completada).slice(0, 3);
  const tareasCompletadas = tareas.filter(t => t.completada).length;
  const score = calcScore(tareasCompletadas, tareas.length, noticiasLeidas.length);

  const btc = mercado.find(m => m.simbolo === 'BTC');
  const eth = mercado.find(m => m.simbolo === 'ETH');

  const ahora = new Date();
  const proximaReunion = agenda
    .filter(a => new Date(`${a.fecha}T${a.hora}`) > ahora)
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())[0];

  const enMenosde30min = proximaReunion
    ? (new Date(`${proximaReunion.fecha}T${proximaReunion.hora}`).getTime() - ahora.getTime()) < 30 * 60000
    : false;

  const nombre = profile.identity.nombre || 'Domex';

  return (
    <div className="flex flex-col gap-3 pb-2">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{saludo()}</p>
          <h1 className="text-2xl font-black tracking-tight leading-none mt-0.5">
            {nombre} <span className="text-primary">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xl font-black tabular-nums"><HoraNow /></p>
            <div className="flex items-center gap-1 justify-end">
              <Zap size={10} className="text-amber-400" />
              <p className="text-[10px] font-black text-amber-400">{streak} días</p>
            </div>
          </div>
          <ScoreCircle score={score} />
        </div>
      </header>

      {/* ── TAREAS FOCO ── */}
      <section className="glass-card p-4 bg-white/[0.02] border-white/5 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Target size={13} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Importa hoy</span>
          </div>
          <button onClick={() => navigate('/tasks')} className="text-[10px] text-white/20 hover:text-white/50 transition-colors flex items-center gap-0.5">
            Ver todas <ChevronRight size={10} />
          </button>
        </div>

        {tareasFoco.length > 0 ? tareasFoco.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 py-1.5"
          >
            <button
              onClick={() => alternarTarea(t.id)}
              className="w-5 h-5 rounded-md border-2 border-primary/30 flex items-center justify-center hover:border-primary transition-colors shrink-0"
            >
              <div className="w-2 h-2 rounded-sm bg-primary opacity-0 hover:opacity-100 transition-opacity" />
            </button>
            <span className="text-sm font-medium leading-tight flex-1">{t.titulo}</span>
            <span className={cn(
              'text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md',
              t.prioridad === 'alta' ? 'bg-red-500/20 text-red-400' :
              t.prioridad === 'media' ? 'bg-amber-500/20 text-amber-400' :
              'bg-white/10 text-white/30'
            )}>{t.prioridad}</span>
          </motion.div>
        )) : (
          <p className="text-xs text-emerald-400 font-medium py-1">Sin tareas críticas — día libre 🎯</p>
        )}
      </section>

      {/* ── FINANZAS + MERCADO ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 bg-white/[0.02] border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Capital</p>
          <p className="text-lg font-black tabular-nums">
            {new Intl.NumberFormat('es-AR', { style: 'currency', currency: profile.goals.moneda, maximumFractionDigits: 0 }).format(0)}
          </p>
          <button onClick={() => navigate('/capital')} className="text-[9px] text-primary/60 hover:text-primary mt-1 transition-colors font-bold">
            Ver finanzas →
          </button>
        </div>

        <div className="glass-card p-4 bg-white/[0.02] border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Mercado</p>
          {btc && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-black text-white/50">BTC</span>
              <div className={cn('flex items-center gap-0.5 text-xs font-black', btc.cambio >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {btc.cambio >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {btc.cambio >= 0 ? '+' : ''}{btc.cambio}%
              </div>
            </div>
          )}
          {eth && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-white/50">ETH</span>
              <div className={cn('flex items-center gap-0.5 text-xs font-black', eth.cambio >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {eth.cambio >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {eth.cambio >= 0 ? '+' : ''}{eth.cambio}%
              </div>
            </div>
          )}
          <button onClick={() => navigate('/mercado')} className="text-[9px] text-primary/60 hover:text-primary mt-1.5 transition-colors font-bold block">
            Ver mercado →
          </button>
        </div>
      </div>

      {/* ── NOTICIA PRINCIPAL ── */}
      <NoticiaCard noticiasLeidas={noticiasLeidas} marcarLeida={marcarNoticiaLeida} />

      {/* ── PRÓXIMA REUNIÓN ── */}
      {proximaReunion ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'glass-card p-4 border flex items-center gap-4',
            enMenosde30min ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-white/[0.02]'
          )}
        >
          <div className={cn('p-2 rounded-xl', enMenosde30min ? 'bg-red-500/20' : 'bg-blue-500/20')}>
            <Calendar size={16} className={enMenosde30min ? 'text-red-400' : 'text-blue-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">
              {enMenosde30min ? '⚠ En menos de 30 min' : 'Próxima reunión'}
            </p>
            <p className="text-sm font-bold leading-tight truncate">{proximaReunion.titulo}</p>
            <p className="text-[10px] text-white/40 mt-0.5">
              {proximaReunion.hora}
              {proximaReunion.personas.length > 0 && ` · ${proximaReunion.personas.join(', ')}`}
            </p>
          </div>
          <button onClick={() => navigate('/more')} className="text-white/20 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 border border-white/5 bg-white/[0.02] flex items-center gap-4"
        >
          <div className="p-2 rounded-xl bg-white/5">
            <Calendar size={16} className="text-white/20" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">Agenda</p>
            <p className="text-sm text-white/40 font-medium">Sin reuniones programadas</p>
          </div>
        </motion.div>
      )}
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
        if (noLeidas.length > 0) setNoticia(noLeidas[0]);
        else if (data.length > 0) setNoticia(data[0]);
      } catch {}
    }
  }, []);

  if (!noticia) {
    return (
      <div className="glass-card p-4 border border-white/5 bg-white/[0.02] flex items-center gap-3">
        <Newspaper size={16} className="text-white/20 shrink-0" />
        <p className="text-sm text-white/30 font-medium">Sin noticias cargadas</p>
        <button onClick={() => navigate('/intel')} className="ml-auto text-[9px] text-primary/60 hover:text-primary font-bold transition-colors">
          Ver Intel →
        </button>
      </div>
    );
  }

  const leida = noticiasLeidas.includes(noticia.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-4 border border-white/5 bg-white/[0.02] space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={13} className="text-amber-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Noticia del día</span>
          {leida && <span className="text-[8px] text-white/20 font-bold uppercase">(leída)</span>}
        </div>
        <button onClick={() => navigate('/intel')} className="text-[9px] text-primary/60 hover:text-primary font-bold transition-colors">
          Intel →
        </button>
      </div>
      <p className="text-sm font-bold leading-snug line-clamp-2">{noticia.titulo}</p>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/30">{noticia.fuente}</p>
        <button
          onClick={() => {
            marcarLeida(noticia.id);
            hablarTexto(`${noticia.titulo}. ${noticia.resumen || ''}`);
          }}
          className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg hover:bg-amber-400/20 transition-colors flex items-center gap-1"
        >
          ▶ Audio
        </button>
      </div>
    </motion.div>
  );
}
