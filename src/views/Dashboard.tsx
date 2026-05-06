import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  TrendingUp, 
  Wallet, 
  CheckCircle2, 
  Lightbulb, 
  TrendingDown, 
  Play, 
  Zap, 
  Target, 
  Star,
  ChevronRight,
  Newspaper,
  Volume2,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { sintetizarVoz, reproducirAudio } from '../services/voiceService';
import DomexInsight from '../components/DomexInsight';

export default function Dashboard() {
  const { usuario, tareas, noticias } = useApp();
  const { profile } = useUserProfile();
  const [estaReproduciendo, setEstaReproduciendo] = useState(false);

  const tareasFoco = tareas
    .filter(t => t.esFoco && !t.completada)
    .slice(0, profile.goals.tareasFocoDiarias);
    
  const totalTareasHoy = tareas.length;
  const completadasHoy = tareas.filter(t => t.completada).length;
  const progresoPorcentaje = totalTareasHoy > 0 ? (completadasHoy / totalTareasHoy) * 100 : 0;

  const manejarResumenAudio = async (textoPersonalizado?: string) => {
    if (estaReproduciendo) return;
    setEstaReproduciendo(true);
    
    const textoAReproducir = textoPersonalizado || `${profile.identity.saludo} ${profile.identity.nombre}. Hoy tienes ${tareasFoco.length} tareas clave de las ${profile.goals.tareasFocoDiarias} que te propusiste. Tu balance es de ${usuario.balance} ${profile.goals.moneda} y la energía vital está al ${usuario.energia} por ciento. Sigamos avanzando.`;
    
    const audioBase64 = await sintetizarVoz(textoAReproducir);
    if (audioBase64) {
      await reproducirAudio(audioBase64);
    }
    setEstaReproduciendo(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: profile.goals.moneda,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Encabezado Principal - Control Center Style */}
      <header className="flex items-center justify-between py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">{profile.identity.saludo} • ONLINE</p>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-2">
            Control <span className="text-primary">{profile.identity.nombre || 'Domex'}</span>
          </h1>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <div 
             className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-lg border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden group"
             style={{ color: 'var(--color-accent)' }}
          >
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {profile.identity.avatarUrl ? (
              <img src={profile.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="relative z-10 text-white/80 group-hover:text-white">{profile.identity.iniciales}</span>
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-4 border-[#0A0A0F] flex items-center justify-center">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </motion.div>
      </header>

      {/* Domex Insight (Conexión entre sistemas) */}
      <DomexInsight />

      {/* Grid de Estado Rápido - KPIs de Vida */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-5 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Capital</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-black text-white">{formatCurrency(usuario.balance)}</h4>
            <p className="text-[9px] text-white/30 font-bold uppercase tracking-tight">Meta: {formatCurrency(profile.goals.capitalObjetivo)}</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-5 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Target size={16} className="text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Foco</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-white">{tareasFoco.length}<span className="text-sm text-white/30 font-medium">/{profile.goals.tareasFocoDiarias}</span></h4>
            <p className="text-[10px] text-primary font-bold">Prioridades críticas</p>
          </div>
        </motion.div>
      </div>

      {/* Botón Resumen Auditivo - Rediseño Premium */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => manejarResumenAudio()}
        disabled={estaReproduciendo}
        className="w-full relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 glass-card p-1 rounded-3xl border-primary/20 flex items-center gap-4 group-hover:border-primary/40 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            {estaReproduciendo ? (
               <div className="flex gap-1 items-end h-4">
                 <motion.div animate={{ height: [4, 16, 8, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
                 <motion.div animate={{ height: [8, 4, 16, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
                 <motion.div animate={{ height: [16, 8, 4, 8, 16] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-white rounded-full" />
               </div>
            ) : <Volume2 size={24} className="text-white" />}
          </div>
          <div className="text-left flex-1 py-1">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary">Briefing de Inteligencia</h3>
            <p className="text-[13px] text-white/80 font-bold mt-0.5">Escuchar análisis matutino</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] text-white/30 font-medium italic uppercase tracking-widest">Domex AI • 2 min</span>
            </div>
          </div>
          <ChevronRight size={20} className="mr-4 text-white/20 group-hover:text-primary transition-colors" />
        </div>
      </motion.button>

      {/* Lo importante hoy (Noticias Inteligentes) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Newspaper size={18} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Lo importante hoy</h3>
          </div>
          <button 
            onClick={() => manejarResumenAudio("Resumen de noticias: " + noticias.map(n => n.titulo).join('. '))}
            className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg flex items-center gap-1"
          >
            <Volume2 size={12} />
            SÍNTESIS AUDIO
          </button>
        </div>

        <div className="grid gap-3">
          {noticias.map((noticia, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              key={noticia.id}
              className="glass-card p-4 bg-white/[0.02] border-white/5 flex gap-4"
            >
              <div className={cn(
                "w-1 h-auto rounded-full shrink-0",
                noticia.categoria === 'mercado' ? "bg-emerald-500" :
                noticia.categoria === 'economia' ? "bg-blue-500" : "bg-amber-500"
              )} />
              <div>
                <h4 className="font-bold text-[14px] tracking-tight">{noticia.titulo}</h4>
                <p className="text-xs text-white/40 font-medium mt-1 leading-relaxed line-clamp-2">
                  {noticia.contenido}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Foco del Día (Psicología de 3 objetivos) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-accent" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Foco del Día</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
              {completadasHoy} de {totalTareasHoy} completadas
            </span>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progresoPorcentaje}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {tareasFoco.length > 0 ? tareasFoco.map((tarea, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={tarea.id} 
              className="glass-card p-5 bg-white/[0.03] border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-primary/40 font-black text-lg">{idx + 1}</div>
                <h4 className="font-bold text-[15px] tracking-tight group-hover:text-white transition-colors">{tarea.titulo}</h4>
              </div>
              <div className="w-6 h-6 rounded-lg border-2 border-primary/20 flex items-center justify-center group-hover:border-primary transition-all cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary opacity-0 group-hover:opacity-100" />
              </div>
            </motion.div>
          )) : (
            <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/10 flex items-center gap-4">
              <Star className="text-emerald-500" size={24} />
              <p className="text-sm font-medium text-emerald-500/80">¡Foco completado! Tu claridad mental está al máximo.</p>
            </div>
          )}
        </div>
      </section>

      {/* Métricas Vitales */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 bg-white/5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Zap size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Energía Vital</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">{usuario.energia}%</span>
              <span className="text-[10px] text-white/20 font-bold uppercase">Nivel</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usuario.energia}%` }}
                className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" 
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 bg-white/5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Progreso</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">{usuario.progresoSemanal}%</span>
              <span className="text-[10px] text-white/20 font-bold uppercase">Meta</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${usuario.progresoSemanal}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Estado Financiero Compacto */}
      <section className="space-y-4">
         <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-white/40" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Capital Disponible</h3>
          </div>
          <ArrowUpRight size={18} className="text-white/20" />
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/5">
           <div className="flex justify-between items-end">
            <div>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1 italic">Balance de Operaciones</p>
              <h2 className="text-4xl font-black tracking-tighter">${usuario.balance.toLocaleString()}</h2>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-black bg-emerald-400/10 px-2 py-1 rounded-lg">
              <TrendingUp size={12} />
              <span>+12%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Motivacional */}
      <div className="pt-4 flex flex-col items-center text-center space-y-2 opacity-30">
        <div className="h-px w-20 bg-white/20" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Domex Neuro-Link v4.5</p>
      </div>
    </div>
  );
}
