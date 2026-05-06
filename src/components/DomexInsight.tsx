import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function DomexInsight() {
  const { objetivos, ideas, tareas } = useApp();
  const navigate = useNavigate();

  // Simple logic to generate an insight
  const totalIdeasInExecution = ideas.filter(i => i.estado === 'ejecucion').length;
  const pendingTasksFoco = tareas.filter(t => t.esFoco && !t.completada).length;

  let insight = {
    titulo: "Foco Estratégico",
    contenido: `Tienes ${pendingTasksFoco} tareas críticas pendientes que impactan directamente en tus objetivos semanales. prioritiza la ejecución.`,
    link: "/tasks",
    label: "Ver Tareas"
  };

  if (totalIdeasInExecution > 0 && pendingTasksFoco === 0) {
    insight = {
      titulo: "Oportunidad de Escala",
      contenido: `Tus proyectos en ejecución están estables. Es momento de revisar tu CRM para buscar nuevos prospectos.`,
      link: "/crm",
      label: "Abrir CRM"
    };
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/20 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="flex gap-4 items-start relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Sparkles className="text-white" size={20} />
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-primary">{insight.titulo}</h4>
            <p className="text-sm text-white/80 font-medium leading-relaxed mt-1">
              {insight.contenido}
            </p>
          </div>
          <button 
            onClick={() => navigate(insight.link)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors group"
          >
            {insight.label}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
