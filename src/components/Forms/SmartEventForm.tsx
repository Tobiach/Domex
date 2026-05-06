import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  Plus,
  ArrowRight,
  Bell,
  Users,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onClose: () => void;
}

export default function SmartEventForm({ onClose }: Props) {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'reunion',
    fecha: new Date().toISOString().split('T')[0],
    recordatorio: true
  });

  const tipos = [
    { id: 'reunion', label: 'Reunión', icon: Users },
    { id: 'focus', label: 'Bloque Foco', icon: Target },
    { id: 'social', label: 'Networking', icon: Star },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0A0A0F]/90 backdrop-blur-3xl"
      />
      
      <motion.div 
        layoutId="action-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-card bg-[#0F0F17] border-white/10 overflow-hidden relative"
      >
        <div className="p-8">
          <header className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Programar Evento</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Sincronizá tu agenda estratégica</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </header>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">¿Qué va a suceder?</label>
              <input 
                autoFocus
                type="text" 
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Revisión Estratégica Q3"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-lg font-bold focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Fecha</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="date" 
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Recordatorio</label>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, recordatorio: !prev.recordatorio }))}
                  className={cn(
                    "w-full p-4 rounded-2xl border flex items-center justify-center gap-2 transition-all",
                    formData.recordatorio ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-white/5 text-white/20"
                  )}
                >
                  <Bell size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Activo</span>
                </button>
              </div>
            </div>

            <div className="bg-[#0F0F17] border border-dashed border-[#2A2A3A] rounded-[14px] p-3.5 mt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="text-primary mt-0.5" size={14} />
                <div>
                  <span className="text-[12px] text-[#8B8BA0] block mb-1">Sugerencia inteligente</span>
                  <p className="text-[13px] text-white">Los bloques de foco de 90 minutos por la mañana aumentan tu productividad un 30%.</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 premium-gradient py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Agendar Evento
          </button>
        </div>
      </motion.div>
    </div>
  );
}
