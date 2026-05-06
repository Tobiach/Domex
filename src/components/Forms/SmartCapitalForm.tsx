import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Minus, 
  DollarSign, 
  Tag, 
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Props {
  onClose: () => void;
}

export default function SmartCapitalForm({ onClose }: Props) {
  const { agregarTransaccion } = useApp();
  const [loadingIA, setLoadingIA] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    tipo: 'gasto' as 'ingreso' | 'gasto',
    monto: '',
    categoria: '',
    descripcion: ''
  });

  const categoriasSugeridas = formData.tipo === 'ingreso' 
    ? ['Ventas', 'Inversión', 'Freelance', 'Otros']
    : ['Suscripciones', 'Marketing', 'Operaciones', 'Personal', 'Impuestos'];

  const sugerirCategoria = async () => {
    if (!formData.descripcion) return;
    setLoadingIA(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza este movimiento financiero: "${formData.descripcion}". Clasifícalo en una de estas categorías: ${categoriasSugeridas.join(', ')}. Devuelve solo el nombre de la categoría.`,
      });
      const cat = response.text?.trim();
      if (cat) {
        setFormData(prev => ({ ...prev, categoria: cat }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIA(false);
    }
  };

  const manejarGuardado = () => {
    if (!formData.monto || !formData.categoria) return;
    agregarTransaccion({
      tipo: formData.tipo,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
      descripcion: formData.descripcion || formData.categoria
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
              <h3 className="text-2xl font-black tracking-tight uppercase">Registrar Movimiento</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Controlá tu flujo de caja con precisión</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </header>

          <div className="space-y-6">
            {/* Selector de Tipo */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl gap-1.5">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'ingreso' }))}
                className={cn(
                  "flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest",
                  formData.tipo === 'ingreso' 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-white/30 hover:bg-white/5"
                )}
              >
                <TrendingUp size={16} />
                Ingreso
              </button>
              <button 
                onClick={() => setFormData(prev => ({ ...prev, tipo: 'gasto' }))}
                className={cn(
                  "flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest",
                  formData.tipo === 'gasto' 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                    : "text-white/30 hover:bg-white/5"
                )}
              >
                <TrendingDown size={16} />
                Gasto
              </button>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 text-center block">Monto Total</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                  <span className="text-4xl font-black text-white/10 group-focus-within:text-primary transition-colors">$</span>
                </div>
                <input 
                  autoFocus
                  type="number" 
                  value={formData.monto}
                  onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-transparent text-6xl font-black text-center focus:outline-none placeholder:text-white/5 py-4"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Descripción / Concepto</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej: Pago de servicios oficina"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 font-bold focus:outline-none focus:border-primary/50 transition-all"
                />
                <button 
                  onClick={sugerirCategoria}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-primary hover:bg-primary/10 transition-all"
                >
                  {loadingIA ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Elegir Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categoriasSugeridas.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData(prev => ({ ...prev, categoria: cat }))}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      formData.categoria === cat
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={manejarGuardado}
            className={cn(
              "w-full mt-10 py-5 rounded-[22px] font-black uppercase tracking-[0.2em] text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2",
              formData.tipo === 'ingreso' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
            )}
          >
            {formData.tipo === 'ingreso' ? <Plus size={20} /> : <Minus size={20} />}
            Registrar Movimiento
          </button>
        </div>
      </motion.div>
    </div>
  );
}
