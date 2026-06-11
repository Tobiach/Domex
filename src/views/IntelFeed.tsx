import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Play, Pause, Square, ChevronRight, Sparkles, Newspaper, Volume2, Brain, TrendingUp, Coins, Search } from 'lucide-react';
import { fetchIntelNews } from '../services/newsService';
import { NewsItem } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Markdown from 'react-markdown';
import { callGroqFast } from '../services/groqService';

type Categoria = 'TODOS' | 'IA' | 'MERCADO' | 'CRIPTO' | 'PODER';

const catColor = (cat: NewsItem['categoria']) => {
  switch (cat) {
    case 'IA':      return '#06B6D4';
    case 'MERCADO': return '#F59E0B';
    case 'CRIPTO':  return '#F97316';
    case 'PODER':   return '#EF4444';
  }
};

export default function IntelFeed() {
  const [noticias, setNoticias] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Categoria>('TODOS');
  const [briefing, setBriefing] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoAudio, setProgresoAudio] = useState(0);
  const [velocidad, setVelocidad] = useState(1);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    cargarNoticias();
    return () => { synth.cancel(); };
  }, []);

  const cargarNoticias = async () => {
    setLoading(true);
    const data = await fetchIntelNews();
    setNoticias(data);
    setUltimaActualizacion(new Date());
    setLoading(false);
    if (data.length > 0) generarBriefing(data.slice(0, 10));
  };

  const generarBriefing = async (topNews: NewsItem[]) => {
    setLoadingBriefing(true);
    try {
      const prompt = `Sos un analista ejecutivo. Resumí estas noticias en bullets concisos para un briefing de 60 segundos. Enfócate en impacto estratégico. Máx 2 líneas por bullet. Respondé SOLO con bullets empezando con •\n\n${topNews.map(n => `- [${n.categoria}] ${n.titulo}: ${n.resumen}`).join('\n')}`;
      const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 512 });
      setBriefing(text || 'Error generando briefing.');
    } catch {
      setBriefing('• Error al procesar noticias recientes.');
    } finally {
      setLoadingBriefing(false);
    }
  };

  const manejarNarracion = (texto: string) => {
    if (reproduciendo) { synth.pause(); setReproduciendo(false); return; }
    if (synth.paused) { synth.resume(); setReproduciendo(true); return; }
    synth.cancel();
    const textoLimpio = texto.replace(/[•*#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-ES';
    utterance.rate = velocidad;
    utteranceRef.current = utterance;
    utterance.onstart = () => setReproduciendo(true);
    utterance.onend = () => { setReproduciendo(false); setProgresoAudio(0); };
    utterance.onboundary = (e) => { if (e.name === 'word') setProgresoAudio((e.charIndex / textoLimpio.length) * 100); };
    synth.speak(utterance);
  };

  const detenerNarracion = () => {
    synth.cancel();
    setReproduciendo(false);
    setProgresoAudio(0);
  };

  const noticiasFiltradas = activeFilter === 'TODOS' ? noticias : noticias.filter(n => n.categoria === activeFilter);

  const getCatIcon = (cat: Categoria) => {
    if (cat === 'IA') return <Brain size={11} />;
    if (cat === 'MERCADO') return <TrendingUp size={11} />;
    if (cat === 'CRIPTO') return <Coins size={11} />;
    if (cat === 'PODER') return <Search size={11} />;
    return <Newspaper size={11} />;
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot live-dot-amber" />
            <span className="sys-label">
              {ultimaActualizacion
                ? `ACTUALIZADO ${formatDistanceToNow(ultimaActualizacion, { locale: es }).toUpperCase()}`
                : 'CARGANDO SEÑAL...'}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Intel Feed</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={cargarNoticias}
          disabled={loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
        >
          <RotateCcw size={15} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </header>

      {/* Briefing card */}
      <div className="bm-card relative overflow-hidden scanline">
        {/* Audio progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'var(--accent-main)', boxShadow: '0 0 8px var(--color-accent)' }}
            animate={{ width: `${progresoAudio}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              </div>
              <div>
                <p className="text-[13px] font-black tracking-tight leading-none">AICOLMENA BRIEFING</p>
                <span className="sys-label mt-0.5 block" style={{ color: 'var(--color-accent)', opacity: 0.9 }}>ANÁLISIS IA · EJECUTIVO</span>
              </div>
            </div>
            <select
              value={velocidad}
              onChange={(e) => setVelocidad(parseFloat(e.target.value))}
              className="bg-transparent text-[9px] font-black text-white/30 outline-none cursor-pointer sys-label"
              style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px' }}
            >
              <option value="0.8">0.8×</option>
              <option value="1">1.0×</option>
              <option value="1.2">1.2×</option>
              <option value="1.5">1.5×</option>
            </select>
          </div>

          <div className="min-h-[120px] mb-4">
            {loadingBriefing ? (
              <div className="space-y-2 py-2">
                {[100, 90, 80, 70].map((w, i) => (
                  <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: `${w}%`, background: 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-white/60 leading-relaxed">
                <Markdown>{briefing}</Markdown>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => manejarNarracion(briefing)}
              disabled={!briefing || loadingBriefing}
              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] tracking-widest uppercase transition-all"
              style={reproduciendo
                ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }
              }
            >
              {reproduciendo ? <><Pause size={13} fill="currentColor" /> PAUSAR</> : <><Play size={13} fill="currentColor" /> NARRAR</>}
            </motion.button>
            {reproduciendo && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={detenerNarracion}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              >
                <Square size={14} fill="currentColor" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {(['TODOS', 'IA', 'MERCADO', 'CRIPTO', 'PODER'] as Categoria[]).map((cat) => {
            const active = activeFilter === cat;
            const color = cat === 'TODOS' ? 'var(--color-accent)' : catColor(cat as any);
            const count = cat === 'TODOS' ? noticias.length : noticias.filter(n => n.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                style={active
                  ? { background: `${color}18`, border: `1px solid ${color}40`, color }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
                }
              >
                {getCatIcon(cat)}
                {cat}
                <span className="sys-label px-1.5 py-0.5 rounded" style={{ background: active ? `${color}20` : 'rgba(255,255,255,0.05)', opacity: 1, color: active ? color : 'rgba(255,255,255,0.3)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* News list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bm-card h-28 animate-pulse" />
          ))
        ) : (
          noticiasFiltradas.map((noticia, idx) => {
            const color = catColor(noticia.categoria);
            return (
              <motion.div
                layout
                key={noticia.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bm-card p-4 group hover:border-white/10 transition-all relative overflow-hidden"
                style={{ '--bm-accent': color } as any}
              >
                {/* Category accent bar */}
                <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r opacity-60" style={{ background: color }} />

                <div className="pl-3">
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="sys-label px-2 py-0.5 rounded-lg border"
                      style={{ color, background: `${color}10`, borderColor: `${color}20`, opacity: 1 }}
                    >
                      {noticia.categoria}
                    </span>
                    <span className="sys-label">{formatDistanceToNow(new Date(noticia.fecha), { addSuffix: true, locale: es }).toUpperCase()}</span>
                  </div>

                  <h3 className="font-bold text-[13px] tracking-tight leading-snug mb-1 group-hover:text-white/90 transition-colors line-clamp-2">
                    {noticia.titulo}
                  </h3>
                  <p className="text-[11px] text-white/35 leading-relaxed line-clamp-2 mb-3">
                    {noticia.resumen}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="sys-label">{noticia.fuente?.toUpperCase()}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => manejarNarracion(noticia.titulo + '. ' + noticia.resumen)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <Volume2 size={12} />
                      </button>
                      <a
                        href={noticia.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 h-7 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                      >
                        VER <ChevronRight size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
