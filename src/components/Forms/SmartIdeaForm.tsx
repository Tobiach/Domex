import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Target, 
  DollarSign,
  Rocket,
  Wand2,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Props {
  onClose: () => void;
}

export default function SmartIdeaForm({ onClose }: Props) {
  const { agregarIdea } = useApp();
  const [step, setStep] = useState(1);
  const [loadingIA, setLoadingIA] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    problema: '',
    solucion: '',
    monetizacion: '',
    valorEstimado: '',
    potencialMensual: ''
  });

  const [estaEscuchando, setEstaEscuchando] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (step === 1) setFormData(prev => ({ ...prev, titulo: transcript }));
        else if (step === 2) setFormData(prev => ({ ...prev, descripcion: transcript }));
        setEstaEscuchando(false);
      };

      recognition.onerror = () => setEstaEscuchando(false);
      recognition.onend = () => setEstaEscuchando(false);

      recognitionRef.current = recognition;
    }
  }, [step]);

  const alternarEscucha = () => {
    if (estaEscuchando) {
      recognitionRef.current?.stop();
    } else {
      setEstaEscuchando(true);
      recognitionRef.current?.start();
    }
  };

  const optimizarConIA = async () => {
    if (!formData.titulo || !formData.descripcion) return;
    setLoadingIA(true);
    try {
      const prompt = `Actúa como un arquitecto de negocios. Optimiza esta idea de negocio. 
      Input: Título: ${formData.titulo}, Descripción: ${formData.descripcion}.
      Output: Devuelve un JSON estrictamente con: { "titulo": "Título Ganador", "descripcion": "Descripción estratégica corta", "valorEstimado": 10000, "potencial": 2000 }. No incluyas markdown, solo el JSON.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const data = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      
      setFormData(prev => ({
        ...prev,
        titulo: data.titulo,
        descripcion: data.descripcion,
        valorEstimado: data.valorEstimado.toString(),
        potencialMensual: data.potencial.toString()
      }));
    } catch (error) {
      console.error("Error optimizando con IA:", error);
    } finally {
      setLoadingIA(false);
    }
  };

  const manejarGuardado = () => {
    agregarIdea({
      titulo: formData.titulo,
      descripcion: formData.descripcion || formData.solucion,
      estado: 'idea',
      valorEstimado: parseInt(formData.valorEstimado) || 0,
      potencialMensual: parseInt(formData.potencialMensual) || 0
    });
    onClose();
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Idea Central</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ej: Plataforma de exportación para artesanos"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-lg font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10"
                />
                <button 
                  onClick={alternarEscucha}
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
                    estaEscuchando ? "bg-primary text-white animate-pulse" : "text-white/20 hover:text-white"
                  )}
                >
                  {estaEscuchando ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Visión / Propósito</label>
              <textarea 
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="¿Qué problema real estás resolviendo con esta idea?"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 h-32 focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 resize-none text-[15px] leading-relaxed"
              />
            </div>

            <button 
              onClick={optimizarConIA}
              disabled={loadingIA || !formData.titulo}
              className="w-full py-4 rounded-2xl border border-dashed border-primary/30 text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
            >
              {loadingIA ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Estrategia Inteligente Domex
            </button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Valor Activo ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    value={formData.valorEstimado}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorEstimado: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-10 font-bold focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Ingreso Mensual ($)</label>
                <div className="relative">
                  <Rocket size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    type="number" 
                    value={formData.potencialMensual}
                    onChange={(e) => setFormData(prev => ({ ...prev, potencialMensual: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 pl-10 font-bold focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex gap-4 items-start">
              <div className="p-2 bg-primary/20 rounded-lg">
                <HelpCircle size={18} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sugerencia Inteligente</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  Las ideas con un retorno proyectado claro se validan un 40% más rápido. Esto ayuda a priorizar.
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-card bg-surface border-white/10 overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-white/5">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '50%' }}
            animate={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <div className="p-8">
          <header className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase whitespace-pre-line leading-none">
                {step === 1 ? 'Nueva\nIdea' : 'Configuración\nFinanciera'}
              </h2>
              <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-2">
                {step === 1 ? 'Capturá tu idea y desarrollala mejor' : 'Calibrá el impacto económico'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
            >
              <Check size={24} />
            </button>
          </header>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <footer className="mt-10 flex gap-4">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-2xl bg-white/5 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Volver
              </button>
            )}
            <button 
              onClick={step === 1 ? () => setStep(2) : manejarGuardado}
              className="flex-[2] py-4 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              {step === 1 ? (
                <>
                  Siguiente paso
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <Check size={16} />
                  Guardar Idea
                </>
              )}
            </button>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
