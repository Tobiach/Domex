import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Palette, 
  Target, 
  Layout, 
  RefreshCw, 
  ChevronRight,
  Camera,
  Check,
  Zap
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';

function useBriefingConfig() {
  const [cfg, setCfg] = useState(() => {
    try { return JSON.parse(localStorage.getItem('domex_briefing_config') || '{"enabled":true,"horaInicio":5,"horaFin":11}'); }
    catch { return { enabled: true, horaInicio: 5, horaFin: 11 }; }
  });
  const update = (patch: Partial<typeof cfg>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    localStorage.setItem('domex_briefing_config', JSON.stringify(next));
  };
  return { cfg, update };
}

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

export default function Settings() {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const { cfg: briefingCfg, update: updateBriefing } = useBriefingConfig();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ identity: { ...profile.identity, avatarUrl: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Centro de Control</h1>
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-1">Configuración del Sistema</p>
      </header>

      {/* Identidad */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <User size={16} className="text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Identidad Digital</h2>
        </div>
        <div className="glass-card p-6 border-white/5 space-y-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl border-2 border-white/10 overflow-hidden bg-gradient-to-br from-white/10 to-transparent"
                style={{ color: 'var(--color-accent)' }}
              >
                {profile.identity.avatarUrl ? (
                  <img src={profile.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.identity.iniciales
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/30">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text"
                  value={profile.identity.nombre}
                  onChange={(e) => updateProfile({ identity: { ...profile.identity, nombre: e.target.value } })}
                  placeholder="Nombre"
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-primary/50"
                />
                <input 
                  type="text"
                  value={profile.identity.apellido}
                  onChange={(e) => updateProfile({ identity: { ...profile.identity, apellido: e.target.value } })}
                  placeholder="Apellido"
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                {['Hola', 'Hey', 'Buenos días', 'Qué tal'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateProfile({ identity: { ...profile.identity, saludo: s as any } })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                      profile.identity.saludo === s 
                        ? "bg-primary text-white" 
                        : "bg-white/5 text-white/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estética */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette size={16} className="text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Atmósfera Visual</h2>
        </div>
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Color de Acento</label>
            <div className="grid grid-cols-4 gap-3">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.hex}
                  onClick={() => updateProfile({ visual: { ...profile.visual, accentColor: color.hex } })}
                  className={cn(
                    "h-12 rounded-xl transition-all flex items-center justify-center",
                    profile.visual.accentColor === color.hex ? "ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0F]" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: color.hex }}
                >
                  {profile.visual.accentColor === color.hex && <Check size={20} className={color.hex === '#E5E5E7' ? "text-black" : "text-white"} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Modo de Interfaz</label>
            <div className="grid grid-cols-3 gap-2">
              {['dark', 'darker', 'midnight'].map(t => (
                <button
                  key={t}
                  onClick={() => updateProfile({ visual: { ...profile.visual, theme: t as any } })}
                  className={cn(
                    "py-3 rounded-xl border text-[10px] font-black uppercase transition-all",
                    profile.visual.theme === t ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/5 text-white/30"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Layout size={16} className="text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Módulos Activos</h2>
        </div>
        <div className="glass-card p-2 border-white/5">
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
              <div key={key} className="flex items-center justify-between p-4 border-b last:border-0 border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-white/40">
                    <Zap size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-white block">{moduleNames[key] || key}</span>
                    <span className="text-[9px] text-white/30 uppercase">Activar panel de {key}</span>
                  </div>
                </div>
                <button
                  onClick={() => updateProfile({ modules: { ...profile.modules, [key]: !value } })}
                  className={cn(
                    "w-12 h-7 rounded-full relative transition-colors p-1",
                    value ? "bg-primary" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-all",
                    value ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Metas */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Target size={16} className="text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Metaobjetivos</h2>
        </div>
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Capital Objetivo</label>
                <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-3 bg-white/5 flex items-center justify-center border-r border-white/10">
                    <span className="text-[10px] font-black text-white/40">{profile.goals.moneda}</span>
                  </div>
                  <input 
                    type="number"
                    value={profile.goals.capitalObjetivo}
                    onChange={(e) => updateProfile({ goals: { ...profile.goals, capitalObjetivo: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-transparent p-3 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Meta Mensual</label>
                <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-3 bg-white/5 flex items-center justify-center border-r border-white/10">
                    <span className="text-[10px] font-black text-white/40">{profile.goals.moneda}</span>
                  </div>
                  <input 
                    type="number"
                    value={profile.goals.ingresoMensualMeta}
                    onChange={(e) => updateProfile({ goals: { ...profile.goals, ingresoMensualMeta: parseInt(e.target.value) || 0 } })}
                    className="w-full bg-transparent p-3 text-sm font-bold focus:outline-none"
                  />
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Briefing Matutino */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Zap size={16} className="text-primary" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Briefing Matutino</h2>
        </div>
        <div className="glass-card p-6 border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">Activar briefing</p>
              <p className="text-[9px] text-white/30 mt-0.5">Resumen en voz al abrir la app</p>
            </div>
            <button
              onClick={() => updateBriefing({ enabled: !briefingCfg.enabled })}
              className={cn('w-12 h-7 rounded-full relative transition-colors p-1', briefingCfg.enabled ? 'bg-primary' : 'bg-white/10')}
            >
              <div className={cn('w-5 h-5 bg-white rounded-full transition-all', briefingCfg.enabled ? 'translate-x-5' : 'translate-x-0')} />
            </button>
          </div>

          {briefingCfg.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Desde</label>
                <select
                  value={briefingCfg.horaInicio}
                  onChange={(e) => updateBriefing({ horaInicio: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-primary/50"
                >
                  {[4,5,6,7,8,9].map(h => <option key={h} value={h}>{h}:00 am</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Hasta</label>
                <select
                  value={briefingCfg.horaFin}
                  onChange={(e) => updateBriefing({ horaFin: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-primary/50"
                >
                  {[8,9,10,11,12].map(h => <option key={h} value={h}>{h}:00 {h < 12 ? 'am' : 'pm'}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Zona Peligrosa */}
      <section className="space-y-4 pt-10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Zona Roja</h2>
        <div className="space-y-2">
          <button 
            onClick={() => updateProfile({ onboardingCompleto: false })}
            className="w-full text-left glass-card p-5 border-rose-500/20 bg-rose-500/5 flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-white block">Repetir Onboarding</span>
              <span className="text-[9px] text-white/30 uppercase">Reiniciar flujo de configuración guiada</span>
            </div>
            <RefreshCw size={18} className="text-white/20 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          
          <button 
            onClick={() => setShowConfirmReset(true)}
            className="w-full text-left glass-card p-5 border-rose-500/20 bg-rose-500/10 flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rose-500 block">Resetear Sistema</span>
              <span className="text-[9px] text-rose-500/50 uppercase">Borrar toda la personalización y datos</span>
            </div>
            <ChevronRight size={18} className="text-rose-500/20 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Modal de Confirmación */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 border-rose-500/30 w-full max-w-sm text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
              <RefreshCw size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase">¿Estás seguro?</h3>
              <p className="text-xs text-white/40 leading-relaxed">Esta acción es irreversible y restaurará todos los valores de fábrica.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirmReset(false)} className="py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase">Cancelar</button>
              <button 
                onClick={() => {
                  resetProfile();
                  window.location.reload();
                }} 
                className="py-4 bg-rose-500 rounded-2xl text-[10px] font-black uppercase"
              >
                Resetear
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
