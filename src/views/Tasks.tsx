import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, Star, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Tasks() {
  const { tareas, alternarTarea, alternarFoco, objetivos } = useApp();
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const mensajesMotivacion = [
    "¡Excelente trabajo!",
    "Seguís avanzando",
    "Foco total",
    "Objetivo cumplido",
    "Poder Domex activo",
    "Claridad mental +1"
  ];

  const manejarCheck = (id: string, yaCompletada: boolean) => {
    alternarTarea(id);
    if (!yaCompletada) {
      const msg = mensajesMotivacion[Math.floor(Math.random() * mensajesMotivacion.length)];
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const categorias = [
    { id: 'foco', etiqueta: 'Foco del día', icon: Target, color: 'text-primary' },
    { id: 'pendientes', etiqueta: 'Pendientes', icon: Clock, color: 'text-amber-500' },
    { id: 'completadas', etiqueta: 'Completadas', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  const filtrarTareas = (catId: string) => {
    if (catId === 'foco') return tareas.filter(t => t.esFoco && !t.completada);
    if (catId === 'pendientes') return tareas.filter(t => !t.completada && !t.esFoco);
    return tareas.filter(t => t.completada);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Gestión de Tareas</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Optimización de ejecución</p>
        </div>
      </header>

      <div className="space-y-10">
        {categorias.map((cat) => (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <cat.icon size={18} className={cat.color} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white/50">{cat.etiqueta}</h3>
              <div className="h-px flex-1 bg-white/5 ml-2" />
              <span className="text-[10px] font-black text-white/20">{filtrarTareas(cat.id).length}</span>
            </div>

            <div className="space-y-3 relative">
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl"
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {filtrarTareas(cat.id).map((tarea) => (
                  <motion.div
                    layout
                    key={tarea.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "glass-card p-4 flex items-center gap-4 group transition-all duration-300",
                      tarea.completada ? "opacity-50 grayscale border-emerald-500/10" : "bg-white/[0.03] hover:bg-white/[0.06] border-white/5"
                    )}
                  >
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => manejarCheck(tarea.id, tarea.completada)}
                      className={cn(
                        "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-lg",
                        tarea.completada 
                          ? "bg-emerald-500 border-emerald-500 text-black shadow-emerald-500/20" 
                          : "border-white/20 hover:border-primary text-transparent"
                      )}
                    >
                      <CheckCircle2 size={18} className={tarea.completada ? "text-black" : "opacity-0"} />
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-bold text-[15px] truncate",
                        tarea.completada && "line-through text-white/40"
                      )}>
                        {tarea.titulo}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                          tarea.prioridad === 'alta' ? "bg-rose-500/10 text-rose-500" :
                          tarea.prioridad === 'media' ? "bg-amber-500/10 text-amber-500" :
                          "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {tarea.prioridad}
                        </span>
                        <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(tarea.fechaVencimiento), "d 'de' MMMM", { locale: es })}
                        </span>
                        {tarea.objetivoId && (
                          <span className="text-[9px] text-primary/40 font-black uppercase tracking-widest flex items-center gap-1">
                            <Target size={10} />
                            {objetivos.find(o => o.id === tarea.objetivoId )?.titulo}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => alternarFoco(tarea.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        tarea.esFoco ? "bg-primary/20 text-primary" : "text-white/10 hover:text-white/40 hover:bg-white/5"
                      )}
                    >
                      <Star size={18} fill={tarea.esFoco ? "currentColor" : "none"} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filtrarTareas(cat.id).length === 0 && (
                <p className="text-[10px] text-white/10 font-black uppercase tracking-widest text-center py-4 italic">
                  Sin tareas en esta categoría
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
