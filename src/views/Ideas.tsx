import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  Rocket, 
  Search, 
  CheckCircle2, 
  MoreVertical, 
  Plus,
  DollarSign,
  TrendingUp,
  Target,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Ideas() {
  const { ideas, actualizarEstadoIdea, contactos } = useApp();

  const columnas = [
    { id: 'idea', etiqueta: 'Concepción', icon: Lightbulb, color: 'text-amber-400', sub: 'Inspiración pura' },
    { id: 'validacion', etiqueta: 'Validación', icon: Search, color: 'text-blue-400', sub: 'Prueba de mercado' },
    { id: 'ejecucion', etiqueta: 'En Marcha', icon: Rocket, color: 'text-emerald-400', sub: 'Generando valor' },
  ];

  const totalValor = ideas.reduce((acc, current) => acc + (current.valorEstimado || 0), 0);
  const potencialMensualTotal = ideas.reduce((acc, current) => acc + (current.potencialMensual || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Laboratorio de Ideas</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Incubación estratégica</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Valor Pipeline</p>
          <p className="text-2xl font-black text-emerald-400 tracking-tighter">${totalValor.toLocaleString()}</p>
        </div>
      </header>

      {/* Resumen Financiero del Pipeline */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 bg-white/5 border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Potencial ROI</span>
          </div>
          <p className="text-xl font-black">${potencialMensualTotal.toLocaleString()}<span className="text-[10px] text-white/20 ml-1">/mes</span></p>
        </div>
        <div className="glass-card p-4 bg-white/5 border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Activos en cola</span>
          </div>
          <p className="text-xl font-black">{ideas.length}</p>
        </div>
      </div>

      <div className="space-y-12">
        {columnas.map((col) => (
          <section key={col.id} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl bg-white/5", col.color)}>
                  <col.icon size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/50 leading-none">{col.etiqueta}</h3>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">{col.sub}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase bg-white/5 px-2 py-0.5 rounded-full">
                {ideas.filter(i => i.estado === col.id).length}
              </span>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {ideas.filter(i => i.estado === col.id).map((idea) => (
                  <motion.div
                    layout
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-6 bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <h4 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{idea.titulo}</h4>
                      <button className="p-1 text-white/20 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-white/40 leading-relaxed font-medium mb-6 line-clamp-2 relative z-10">
                      {idea.descripcion}
                    </p>

                    {idea.contactoRelacionadoId && (
                      <div className="flex items-center gap-2 mb-6 bg-primary/5 p-2 rounded-xl border border-primary/10 w-fit">
                        <User size={10} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                          Contacto: {contactos.find(c => c.id === idea.contactoRelacionadoId)?.nombre}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                       <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Valor Estimado</p>
                        <p className="font-black text-white/80">${idea.valorEstimado?.toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Potencial/mes</p>
                        <p className="font-black text-emerald-400">${idea.potencialMensual?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                          <TrendingUp size={12} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">
                          Iniciado {format(new Date(idea.creadoEn), "dd MMM", { locale: es })}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {col.id !== 'ejecucion' && (
                          <button 
                            onClick={() => actualizarEstadoIdea(idea.id, col.id === 'idea' ? 'validacion' : 'ejecucion')}
                            className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                          >
                            Promover a {col.id === 'idea' ? 'Validación' : 'Ejecución'}
                          </button>
                        )}
                        {col.id === 'ejecucion' && (
                          <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={12} />
                            <span>Generando Ingresos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
