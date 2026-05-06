import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Globe, Search, ArrowUpRight, BarChart3, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Market() {
  const { mercado } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Pulso de Mercado</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Inteligencia Global Domex</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 animate-pulse" />
          <div className="relative p-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
            <Globe className="text-emerald-400" size={18} />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Vivo</span>
          </div>
        </div>
      </header>

      {/* Grid de Activos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mercado.map((activo) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={activo.id}
            className="glass-card p-6 bg-white/[0.03] border-white/5 hover:border-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all shadow-lg">
                  <span className="font-black text-lg">{activo.simbolo.charAt(0)}</span>
                </div>
                <div>
                   <h3 className="font-black text-lg tracking-tighter">{activo.nombre}</h3>
                   <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{activo.simbolo}</span>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black",
                activo.cambio >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {activo.cambio >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {activo.cambio}%
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Precio Domex v4</p>
                <h2 className="text-3xl font-black tracking-tighter">${activo.precio.toLocaleString()}</h2>
              </div>
              <BarChart3 className="text-white/10 group-hover:text-primary/40 transition-colors" size={32} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alerta de Oportunidad */}
      <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20 flex gap-5 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest transform rotate-45 translate-x-4 -translate-y-2 w-20 text-center">
          Hot
        </div>
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <Zap className="text-black" size={24} />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-amber-500 mb-1">Análisis de Oportunidad</h4>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            Se detectó una alta correlación entre **S&P 500** y tu **SaaS de Logística**. Domex recomienda revisar el posicionamiento de marca.
          </p>
        </div>
      </div>
    </div>
  );
}
