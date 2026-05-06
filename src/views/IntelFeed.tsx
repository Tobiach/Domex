import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Square, 
  ChevronRight, 
  Sparkles,
  Newspaper,
  Volume2,
  Brain,
  TrendingUp,
  Coins,
  Search
} from 'lucide-react';
import { fetchIntelNews } from '../services/newsService';
import { NewsItem } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Markdown from 'react-markdown';
import { callGroqFast } from '../services/groqService';

type Categoria = 'TODOS' | 'IA' | 'MERCADO' | 'CRIPTO' | 'PODER';

export default function IntelFeed() {
  const [noticias, setNoticias] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Categoria>('TODOS');
  const [briefing, setBriefing] = useState<string>('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progresoAudio, setProgresoAudio] = useState(0);
  const [palabraActualIndex, setPalabraActualIndex] = useState(-1);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [velocidad, setVelocidad] = useState(1);
  
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    cargarNoticias();
    return () => {
      synth.cancel();
    };
  }, []);

  const cargarNoticias = async () => {
    setLoading(true);
    const data = await fetchIntelNews();
    setNoticias(data);
    setUltimaActualizacion(new Date());
    setLoading(false);
    
    if (data.length > 0) {
      generarBriefing(data.slice(0, 10));
    }
  };

  const generarBriefing = async (topNews: NewsItem[]) => {
    setLoadingBriefing(true);
    try {
      const prompt = `Sos un analista financiero ejecutivo de alto nivel.
      Resumí estas noticias en bullets concisos y potentes para un briefing de 60 segundos.
      Enfócate en el impacto estratégico.
      Cada bullet máximo 2 líneas. No uses negritas excesivas.
      
      Noticias:
      ${topNews.map(n => `- [${n.categoria}] ${n.titulo}: ${n.resumen}`).join('\n')}
      
      Respondé SOLO con los bullets, empezando con •`;

      const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 512 });
      setBriefing(text || 'No se pudo generar el briefing en este momento.');
    } catch (error) {
      console.error('Error generando briefing:', error);
      setBriefing('• Hubo un error al procesar las noticias recientes.');
    } finally {
      setLoadingBriefing(false);
    }
  };

  const manejarNarracion = (texto: string) => {
    if (reproduciendo) {
      synth.pause();
      setReproduciendo(false);
      return;
    }

    if (synth.paused) {
      synth.resume();
      setReproduciendo(true);
      return;
    }

    synth.cancel();
    
    // Limpiar texto de markdown simple para voz
    const textoLimpio = texto.replace(/[•*#]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-ES';
    utterance.rate = velocidad;
    utteranceRef.current = utterance;

    utterance.onstart = () => setReproduciendo(true);
    utterance.onend = () => {
      setReproduciendo(false);
      setProgresoAudio(0);
      setPalabraActualIndex(-1);
    };
    
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        // Aproximar progreso
        setProgresoAudio((charIndex / textoLimpio.length) * 100);
        setPalabraActualIndex(charIndex);
      }
    };

    synth.speak(utterance);
  };

  const detenerNarracion = () => {
    synth.cancel();
    setReproduciendo(false);
    setProgresoAudio(0);
    setPalabraActualIndex(-1);
  };

  const noticiasFiltradas = activeFilter === 'TODOS' 
    ? noticias 
    : noticias.filter(n => n.categoria === activeFilter);

  const getCategoriaIcon = (cat: Categoria) => {
    switch (cat) {
      case 'IA': return <Brain size={14} />;
      case 'MERCADO': return <TrendingUp size={14} />;
      case 'CRIPTO': return <Coins size={14} />;
      case 'PODER': return <Search size={14} />;
      default: return <Newspaper size={14} />;
    }
  };

  const getCategoriaColor = (cat: NewsItem['categoria']) => {
    switch (cat) {
      case 'IA': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'MERCADO': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'CRIPTO': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'PODER': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">
              Intelligence Feed • {ultimaActualizacion ? `hace ${formatDistanceToNow(ultimaActualizacion, { locale: es })}` : 'Cargando...'}
            </p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Intel <span className="text-primary">Feed</span>
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={cargarNoticias}
          disabled={loading}
          className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-white/60 hover:text-white transition-colors border-white/10"
        >
          <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </div>

      {/* Briefing Section */}
      <div className="glass-card rounded-[2.5rem] border-white/10 p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_15px_var(--color-accent)]"
            animate={{ width: `${progresoAudio}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-white">Domex Briefing</h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Resumen IA Directivo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={velocidad} 
              onChange={(e) => setVelocidad(parseFloat(e.target.value))}
              className="bg-white/5 border-none text-[10px] font-black text-white/60 px-2 py-1 rounded-lg outline-none cursor-pointer"
            >
              <option value="0.8">0.8x</option>
              <option value="1">1.0x</option>
              <option value="1.2">1.2x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

        <div className="relative group min-h-[200px]">
          {loadingBriefing ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-white/5 rounded-full w-full animate-pulse" style={{ width: `${100 - i * 10}%` }} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-white/80 leading-relaxed font-medium">
              <Markdown>{briefing}</Markdown>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => manejarNarracion(briefing)}
            disabled={!briefing || loadingBriefing}
            className={cn(
              "flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all",
              reproduciendo 
                ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                : "bg-white text-black hover:bg-white/90"
            )}
          >
            {reproduciendo ? (
              <>
                <Pause size={18} fill="currentColor" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Narrar Briefing</span>
              </>
            )}
          </motion.button>

          {reproduciendo && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={detenerNarracion}
              className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-rose-500 border-rose-500/20"
            >
              <Square size={20} fill="currentColor" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {(['TODOS', 'IA', 'MERCADO', 'CRIPTO', 'PODER'] as Categoria[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-2",
                activeFilter === cat 
                  ? "bg-white text-black border-white" 
                  : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
              )}
            >
              {getCategoriaIcon(cat)}
              {cat}
              <span className={cn(
                "ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px]",
                activeFilter === cat ? "bg-black/10" : "bg-white/10"
              )}>
                {cat === 'TODOS' ? noticias.length : noticias.filter(n => n.categoria === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-3xl h-48 animate-pulse border-white/5" />
          ))
        ) : (
          noticiasFiltradas.map((noticia, idx) => (
            <motion.div
              layout
              key={noticia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-[2.5rem] border-white/10 overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Image Section */}
                <div className="sm:w-48 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-white/5">
                  {noticia.imagen ? (
                    <img 
                      src={noticia.imagen} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Newspaper size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
                  
                  {/* Category Badge */}
                  <div className={cn(
                    "absolute top-4 left-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md",
                    getCategoriaColor(noticia.categoria)
                  )}>
                    {noticia.categoria}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                      <span>{noticia.fuente}</span>
                      <span>{formatDistanceToNow(new Date(noticia.fecha), { addSuffix: true, locale: es })}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {noticia.titulo}
                    </h2>
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                      {noticia.resumen}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {noticia.personaje && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10 italic">
                           <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black">
                             {noticia.personaje.charAt(0)}
                           </div>
                           <span className="text-[10px] text-white/60 font-medium">{noticia.personaje}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => manejarNarracion(noticia.titulo + '. ' + noticia.resumen)}
                        className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-white/40 hover:text-primary transition-colors border-white/10"
                      >
                        <Volume2 size={16} />
                      </motion.button>
                      <a 
                        href={noticia.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="h-10 px-4 rounded-xl glass-card flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all border-white/10"
                      >
                        <span>Detalles</span>
                        <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
