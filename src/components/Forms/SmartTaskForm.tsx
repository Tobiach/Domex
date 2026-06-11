import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Calendar, 
  Flag, 
  Target,
  Wand2,
  X,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { callGroqFast } from '../../services/groqService';

interface Props {
  onClose: () => void;
}

export default function SmartTaskForm({ onClose }: Props) {
  const { agregarTarea, objetivos } = useApp();
  const [loadingIA, setLoadingIA] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta',
    esFoco: false,
    objetivoId: '',
    venceEn: 0 // 0: hoy, 1: mañana, 7: prox semana
  });

  const sugerirPrioridad = async () => {
    if (!formData.titulo) return;
    setLoadingIA(true);
    try {
      const text = await callGroqFast([{ role: 'user', content: `Analiza esta tarea: "${formData.titulo}". Clasifica su prioridad como "baja", "media" o "alta" basado en urgencia estratégica. Devuelve solo la palabra.` }], { maxTokens: 10, temperature: 0.1 });
      const prio = text.trim().toLowerCase();
      if (prio && ['baja', 'media', 'alta'].includes(prio)) {
        setFormData(prev => ({ ...prev, prioridad: prio as any }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIA(false);
    }
  };

  const manejarGuardado = () => {
    if (!formData.titulo) return;
    
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + formData.venceEn);

    agregarTarea({
      titulo: formData.titulo,
      prioridad: formData.prioridad,
      esFoco: formData.esFoco,
      objetivoId: formData.objetivoId || undefined,
      fechaVencimiento: fecha.toISOString()
    });
    onClose();
  };

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
          <header className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Crear Tarea</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Definí una acción concreta para hoy</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </header>

          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">¿Qué hay que hacer?</label>
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Cerrar contrato de hosting"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-lg font-bold focus:outline-none focus:border-primary/50 transition-all"
                />
                <button 
                  onClick={sugerirPrioridad}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-primary hover:bg-primary/10 transition-all"
                >
                  {loadingIA ? <Wand2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
              </div>
            </div>

            <div className="bg-[#0F0F17] border border-dashed border-primary/30 rounded-2xl p-5 mb-4 group hover:border-primary transition-all">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Sparkles className="text-primary" size={18} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">Optimización AIcolmena AI</span>
                  <p className="text-[13px] text-white/70 leading-relaxed">
                    {formData.titulo.length > 5 
                      ? `Esta tarea parece tener un impacto alto en tu objetivo de "Escalabilidad". ¿Deseas marcarla como FOCO?`
                      : "Escribe una acción concreta para que pueda analizar su impacto real en tus objetivos."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Prioridad */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Prioridad Status</label>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  {(['baja', 'media', 'alta'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFormData(prev => ({ ...prev, prioridad: p }))}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                        formData.prioridad === p 
                          ? "bg-white text-black shadow-lg" 
                          : "text-white/30 hover:bg-white/5"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vencimiento */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Vence en:</label>
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  {[
                    { label: 'Hoy', val: 0 },
                    { label: 'Mañana', val: 1 },
                    { label: '7d', val: 7 },
                  ].map((d) => (
                    <button
                      key={d.val}
                      onClick={() => setFormData(prev => ({ ...prev, venceEn: d.val }))}
                      className={cn(
                        "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                        formData.venceEn === d.val 
                          ? "bg-white text-black shadow-lg" 
                          : "text-white/30 hover:bg-white/5"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Foco y Objetivos */}
            <div className="space-y-4 pt-2">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, esFoco: !prev.esFoco }))}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  formData.esFoco 
                    ? "bg-primary/20 border-primary/40" 
                    : "bg-white/5 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl transition-colors", formData.esFoco ? "bg-primary text-white" : "bg-white/10 text-white/30")}>
                    <Target size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 block">Foco Crítico</span>
                    <span className="text-sm font-bold text-white">Prioridad de impacto diario</span>
                  </div>
                </div>
                <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", formData.esFoco ? "border-primary bg-primary" : "border-white/10")}>
                  {formData.esFoco && <Check size={14} className="text-white" />}
                </div>
              </button>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Vincular a Objetivo</label>
                <select 
                  value={formData.objetivoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, objetivoId: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none appearance-none"
                >
                  <option value="">Ninguno</option>
                  {objetivos.map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.titulo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={manejarGuardado}
            className="w-full mt-10 premium-gradient py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Sincronizar Tarea
          </button>
        </div>
      </motion.div>
    </div>
  );
}
