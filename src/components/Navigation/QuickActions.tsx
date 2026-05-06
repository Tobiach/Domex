import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckSquare, Lightbulb, UserPlus, DollarSign, Calendar, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import SmartIdeaForm from '../Forms/SmartIdeaForm';
import SmartTaskForm from '../Forms/SmartTaskForm';
import SmartCapitalForm from '../Forms/SmartCapitalForm';
import SmartContactForm from '../Forms/SmartContactForm';
import SmartEventForm from '../Forms/SmartEventForm';

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<'tarea' | 'idea' | 'capital' | 'crm' | 'evento' | null>(null);

  const manejarAccion = (tipo: 'tarea' | 'idea' | 'capital' | 'crm' | 'evento') => {
    setSeccionActiva(tipo);
    setIsOpen(false);
  };

  const cerrarFormulario = () => setSeccionActiva(null);

  const accionesSecundarias = [
    { icon: Lightbulb, etiqueta: 'Nueva idea', color: '#F59E0B', tipo: 'idea' as const },
    { icon: DollarSign, etiqueta: 'Registrar ingreso o gasto', color: '#10B981', tipo: 'capital' as const },
    { icon: UserPlus, etiqueta: 'Nuevo contacto', color: '#8B5CF6', tipo: 'crm' as const },
    { icon: Calendar, etiqueta: 'Crear evento', color: '#F43F5E', tipo: 'evento' as const },
  ];

  return (
    <>
      {/* Botón Flotante Principal */}
      <div className="fixed bottom-24 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-300 z-[60] shadow-2xl overflow-hidden",
            isOpen 
              ? "bg-[#18181F] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]" 
              : "bg-surface text-white border border-white/5"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] w-full h-full flex items-center justify-center shadow-[0_8px_30px_rgba(124,58,237,0.35)]"
              >
                <Plus size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#0A0A0F]/65 backdrop-blur-[20px] flex flex-col pt-[60px] px-5 pb-[30px]"
          >
            {/* Botón Cerrar Superior */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 bg-[#18181F] rounded-[10px] flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold text-white tracking-tight">¿Qué querés crear?</h2>
              <p className="text-[13px] text-[#A1A1AA] mt-1">Sugerido para hoy</p>
            </div>

            {/* Acción Principal */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => manejarAccion('tarea')}
              className="w-full h-16 rounded-[18px] px-[18px] bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] shadow-[0_8px_30px_rgba(124,58,237,0.35)] flex items-center"
            >
              <div className="mr-3">
                <CheckSquare size={22} className="text-white" />
              </div>
              <span className="text-[16px] font-medium text-white">Crear tarea</span>
            </motion.button>

            {/* Acciones Secundarias */}
            <div className="mt-5 space-y-[14px]">
              {accionesSecundarias.map((accion, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  onClick={() => manejarAccion(accion.tipo)}
                  className="w-full h-14 bg-[#111118] border border-[#1F1F2A] rounded-[16px] px-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: accion.color }}
                    >
                      <accion.icon size={18} className="text-white" />
                    </div>
                    <span className="text-[15px] font-medium text-[#E4E4E7]">{accion.etiqueta}</span>
                  </div>
                  <ArrowRight className="text-[#6B7280]" size={16} />
                </motion.button>
              ))}
            </div>

            {/* Bloque IA */}
            <div className="mt-[26px] bg-[#0F0F17] border border-dashed border-[#2A2A3A] rounded-[14px] p-3.5">
              <span className="text-[12px] text-[#8B8BA0] block mb-1">Sugerencia inteligente</span>
              <p className="text-[13px] text-white">Tenés tareas pendientes. Crear una ahora mejora tu progreso.</p>
            </div>
          </motion.div>
        )}

        {seccionActiva === 'idea' ? (
          <SmartIdeaForm onClose={cerrarFormulario} />
        ) : seccionActiva === 'tarea' ? (
          <SmartTaskForm onClose={cerrarFormulario} />
        ) : seccionActiva === 'capital' ? (
          <SmartCapitalForm onClose={cerrarFormulario} />
        ) : seccionActiva === 'crm' ? (
          <SmartContactForm onClose={cerrarFormulario} />
        ) : seccionActiva === 'evento' ? (
          <SmartEventForm onClose={cerrarFormulario} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
