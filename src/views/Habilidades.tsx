import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  DollarSign, 
  Brain, 
  Briefcase, 
  ExternalLink, 
  Play, 
  FileText, 
  Wrench,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function Habilidades() {
  const { habilidades } = useApp();

  const iconos: Record<string, any> = {
    Zap,
    DollarSign,
    Brain,
    Briefcase
  };

  const colores: Record<string, string> = {
    ventas: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    finanzas: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    mentalidad: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    negocios: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Mejorar Habilidades</h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Crecimiento estratégico curado</p>
      </header>

      <div className="space-y-10">
        {habilidades.map((hab) => {
          const IconoHab = iconos[hab.icono] || Briefcase;
          
          return (
            <section key={hab.id} className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className={cn("p-2 rounded-xl border", colores[hab.categoria])}>
                  <IconoHab size={18} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white/50">{hab.nombre}</h3>
                <div className="h-px flex-1 bg-white/5 ml-2" />
              </div>

              <div className="grid gap-4">
                {hab.recursos.map((recurso) => (
                  <motion.a
                    whileHover={{ x: 4 }}
                    key={recurso.id}
                    href={recurso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-5 bg-white/[0.02] border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors">
                        {recurso.tipo === 'video' && <Play size={20} fill="currentColor" />}
                        {recurso.tipo === 'articulo' && <FileText size={20} />}
                        {recurso.tipo === 'herramienta' && <Wrench size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[15px] tracking-tight group-hover:text-white transition-colors">{recurso.titulo}</h4>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/5 px-1.5 py-0.5 rounded text-white/30">
                            {recurso.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 font-medium mt-1">{recurso.descripcion}</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-white/10 group-hover:text-primary transition-colors" />
                  </motion.a>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Sugerencia de la IA */}
      <div className="glass-card p-6 bg-primary/5 border-primary/20 flex gap-5 items-center relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-1">Análisis de Brecha AIcolmena</h4>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            Basado en tu pipeline de ideas, AIcolmena sugiere fortalecer tus habilidades de **Ventas B2B** para acelerar la validación.
          </p>
        </div>
      </div>
    </div>
  );
}
