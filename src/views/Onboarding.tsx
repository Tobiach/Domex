import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Target, 
  Layout, 
  Zap,
  DollarSign,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';

const ACCENT_COLORS = [
  { name: 'Violeta', hex: '#7C3AED' },
  { name: 'Oro', hex: '#F59E0B' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Rojo', hex: '#EF4444' },
  { name: 'Blanco', hex: '#E5E5E7' },
];

export default function Onboarding() {
  const { profile, updateProfile } = useUserProfile();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      updateProfile({ onboardingCompleto: true });
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    if (step === 1) return profile.identity.nombre.length >= 2;
    if (step === 3) {
      const activeModules = Object.values(profile.modules).filter(Boolean);
      return activeModules.length >= 2;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0F] text-white z-[200] overflow-y-auto">
      <div className="min-h-full flex flex-col items-center p-6 sm:p-12">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden z-[210]">
          <motion.div 
            className="h-full bg-amber-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <main className="w-full max-w-lg mt-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-10 py-4"
            >
            {step === 1 && (
              <div className="space-y-8">
                <header>
                  <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <Zap className="text-primary" size={28} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter">¿Cómo te llamamos?</h1>
                  <p className="text-white/40 mt-2 font-medium">Domex se adaptará a tu identidad.</p>
                </header>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Tu nombre</label>
                    <input 
                      autoFocus
                      type="text"
                      value={profile.identity.nombre}
                      onChange={(e) => updateProfile({ identity: { ...profile.identity, nombre: e.target.value } })}
                      placeholder="Ej: Elon"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Tu apellido (opcional)</label>
                    <input 
                      type="text"
                      value={profile.identity.apellido}
                      onChange={(e) => updateProfile({ identity: { ...profile.identity, apellido: e.target.value } })}
                      placeholder="Ej: Musk"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {profile.identity.nombre && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 glass-card border-primary/20 bg-primary/5"
                  >
                    <p className="text-sm font-bold text-white/70 italic text-center">
                      "{profile.identity.saludo}, {profile.identity.nombre}. Bienvenido a Domex."
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <header>
                  <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <Palette className="text-primary" size={28} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter">Tu color de acento</h1>
                  <p className="text-white/40 mt-2 font-medium">Personalizá la atmósfera de tu sistema.</p>
                </header>

                <div className="grid grid-cols-4 gap-4">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => updateProfile({ visual: { ...profile.visual, accentColor: color.hex } })}
                      className={cn(
                        "group relative aspect-square rounded-2xl transition-all flex items-center justify-center overflow-hidden",
                        profile.visual.accentColor === color.hex 
                          ? "ring-4 ring-white ring-offset-4 ring-offset-[#0A0A0F]" 
                          : "hover:scale-110 active:scale-95"
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {profile.visual.accentColor === color.hex && (
                        <Check size={24} className={cn(
                          color.hex === '#E5E5E7' ? "text-black" : "text-white"
                        )} />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6 glass-card flex items-center gap-4 border-[var(--color-accent-20)]">
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: 'var(--color-accent)' }} />
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-white">Vista Previa</h4>
                    <p className="text-xs text-white/40">Así se verá tu interfaz.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <header>
                  <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <Layout className="text-primary" size={28} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter">¿Qué módulos activar?</h1>
                  <p className="text-white/40 mt-2 font-medium">Elegí las herramientas que necesitás hoy.</p>
                </header>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(profile.modules).map(([key, value]) => {
                    const moduleNames: Record<string, string> = {
                      dashboard: 'Tablero Principal',
                      ideas: 'Laboratorio de Ideas',
                      chat: 'Asistente Domex AI',
                      tasks: 'Ejecución y Tareas',
                      crm: 'Red y Contactos',
                      capital: 'Flujo de Capital',
                      mercado: 'Mercado en Vivo',
                      intel: 'Intel Feed'
                    };
                    return (
                      <button
                        key={key}
                        onClick={() => updateProfile({ modules: { ...profile.modules, [key]: !value } })}
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                          value 
                            ? "bg-primary/20 border-primary text-white" 
                            : "bg-white/5 border-white/5 text-white/40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", value ? "bg-primary/20" : "bg-white/10")}>
                            <Sparkles size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-[10px] uppercase tracking-widest opacity-50 mb-0.5">{key}</span>
                            <span className="font-bold text-sm uppercase tracking-tight">{moduleNames[key] || key}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-10 h-6 rounded-full relative transition-colors shrink-0",
                          value ? "bg-primary" : "bg-white/10"
                        )}>
                          <motion.div 
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                            animate={{ x: value ? 16 : 0 }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {!isStepValid() && (
                  <p className="text-center text-xs text-rose-500 font-bold uppercase tracking-widest">Activá al menos 2 módulos para continuar</p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <header>
                  <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-4">
                    <Target className="text-primary" size={28} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter">Configurá tus metas</h1>
                  <p className="text-white/40 mt-2 font-medium">Definí tus objetivos estratégicos.</p>
                </header>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Capital Objetivo</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="number"
                          value={profile.goals.capitalObjetivo}
                          onChange={(e) => updateProfile({ goals: { ...profile.goals, capitalObjetivo: parseInt(e.target.value) || 0 } })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-sm font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Meta Mensual</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="number"
                          value={profile.goals.ingresoMensualMeta}
                          onChange={(e) => updateProfile({ goals: { ...profile.goals, ingresoMensualMeta: parseInt(e.target.value) || 0 } })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 text-sm font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Tareas foco diarias</label>
                      <span className="text-primary font-black">{profile.goals.tareasFocoDiarias}</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="5"
                      value={profile.goals.tareasFocoDiarias}
                      onChange={(e) => updateProfile({ goals: { ...profile.goals, tareasFocoDiarias: parseInt(e.target.value) } })}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Moneda Principal</label>
                    <div className="flex gap-2">
                      {['USD', 'ARS', 'EUR'].map(m => (
                        <button
                          key={m}
                          onClick={() => updateProfile({ goals: { ...profile.goals, moneda: m as any } })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border text-xs font-black transition-all",
                            profile.goals.moneda === m 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Buttons */}
      <footer className="w-full max-w-lg mt-12 grid grid-cols-2 gap-4">
        <button 
          onClick={handleBack}
          disabled={step === 1}
          className={cn(
            "py-5 rounded-[22px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
            step === 1 ? "opacity-0 invisible" : "bg-white/5 text-white/40 hover:bg-white/10"
          )}
        >
          <ChevronLeft size={18} />
          Anterior
        </button>
        <button 
          onClick={handleNext}
          disabled={!isStepValid()}
          className={cn(
            "py-5 rounded-[22px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
            isStepValid() ? "premium-gradient shadow-lg shadow-primary/20" : "bg-white/5 text-white/20 cursor-not-allowed"
          )}
        >
          {step === 4 ? (
            <>
              Activar Domex
              <Check size={18} />
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </footer>
      </div>
    </div>
  );
}
