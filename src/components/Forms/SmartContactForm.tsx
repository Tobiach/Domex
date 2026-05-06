import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UserPlus, 
  Briefcase, 
  Target, 
  DollarSign,
  Sparkles,
  ArrowRight,
  Loader2,
  Users,
  Building2,
  PieChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { callGroqFast } from '../../services/groqService';

interface Props {
  onClose: () => void;
}

export default function SmartContactForm({ onClose }: Props) {
  const { agregarContacto } = useApp();
  const [loadingIA, setLoadingIA] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    estado: 'prospecto' as 'prospecto' | 'contactado' | 'negociacion' | 'ganado',
    valor: ''
  });

  const sugerirAnalisis = async () => {
    if (!formData.nombre || !formData.empresa) return;
    setLoadingIA(true);
    try {
      const prompt = `Analiza este prospecto de negocio: Nombre: ${formData.nombre}, Empresa: ${formData.empresa}. 
      Estima un valor de contrato realista (un número entre 500 y 50000) y sugiere un estado (prospecto, contactado, negociacion, ganado).
      Devuelve solo un JSON: { "valor": 5000, "estado": "prospecto" }`;
      
      const text = await callGroqFast([{ role: 'user', content: prompt }], { maxTokens: 64, temperature: 0.2 });
      const data = JSON.parse(text.replace(/```json|```/g, '').trim());
      
      setFormData(prev => ({
        ...prev,
        valor: data.valor.toString(),
        estado: data.estado
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIA(false);
    }
  };

  const manejarGuardado = () => {
    if (!formData.nombre) return;
    agregarContacto({
      nombre: formData.nombre,
      empresa: formData.empresa,
      estado: formData.estado,
      valor: parseFloat(formData.valor) || 0
    });
    onClose();
  };

  const estados = [
    { id: 'prospecto', label: 'Prospecto', color: 'bg-blue-500' },
    { id: 'contactado', label: 'Contactado', color: 'bg-amber-500' },
    { id: 'negociacion', label: 'Negociación', color: 'bg-orange-500' },
    { id: 'ganado', label: 'Ganado', color: 'bg-emerald-500' },
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
          <header className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Nuevo Aliado</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Expansión de red estratégica</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </header>

          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Nombre Completo</label>
              <div className="relative">
                <Users size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  autoFocus
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Elon Musk"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 pl-14 font-bold focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Empresa / Proyecto</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  value={formData.empresa}
                  onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                  placeholder="Ej: X Corp"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 pl-14 font-bold focus:outline-none focus:border-primary/50 transition-all"
                />
                <button 
                  onClick={sugerirAnalisis}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-primary hover:bg-primary/10 transition-all"
                >
                  {loadingIA ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor Proyectado */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Valor Pipeline ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-10 font-bold focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Status CRM</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none appearance-none"
                >
                  {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={manejarGuardado}
            className="w-full mt-10 premium-gradient py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Sincronizar Contacto
          </button>
        </div>
      </motion.div>
    </div>
  );
}
