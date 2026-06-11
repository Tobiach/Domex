import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Palette, Target, Layout, RefreshCw, ChevronRight, Camera, Check, Zap, AlertTriangle, Play, Download, Bell } from 'lucide-react';
import { seedDemoData } from '../lib/seedData';
import { useUserProfile } from '../hooks/useUserProfile';
import { cn } from '../lib/utils';
import { exportToCSV } from '../lib/exportData';
import { requestNotificationPermission } from '../hooks/useAgendaNotifications';

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
  { name: 'Oro',     hex: '#F59E0B' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Cyan',    hex: '#06B6D4' },
  { name: 'Rosa',    hex: '#EC4899' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Rojo',    hex: '#EF4444' },
  { name: 'Blanco',  hex: '#E5E5E7' },
];

const NOTIF_KEY = 'domex_notif_enabled';

const MODULE_NAMES: Record<string, string> = {
  dashboard: 'TABLERO PRINCIPAL',
  ideas: 'LAB DE IDEAS',
  chat: 'AICOLMENA AI',
  tasks: 'EJECUCIÓN',
  crm: 'RED HUMANA',
  capital: 'FLUJO DE CAPITAL',
  mercado: 'MERCADO GLOBAL',
  intel: 'INTEL FEED',
  habitos: 'SISTEMA HÁBITOS',
  conciencia: 'CONCIENCIA INTEGRAL',
  optimizacion: 'OPTIMIZACIÓN EXISTENCIAL',
};

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-11 h-6 rounded-full relative transition-colors p-0.5 shrink-0"
      style={{ background: active ? 'var(--accent-main)' : 'rgba(255,255,255,0.08)' }}
    >
      <div className={cn('w-5 h-5 bg-white rounded-full transition-all shadow', active ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}

function Section({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon size={12} style={{ color: 'var(--color-accent)' }} />
        <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 0.9 }}>{label}</span>
      </div>
      {children}
    </section>
  );
}

function ModulosSection({ profile, updateProfile }: { profile: any; updateProfile: (p: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(profile.modules) as [string, boolean][];
  const activos = entries.filter(([, v]) => v);
  const shown = expanded ? entries : entries.slice(0, 3);

  return (
    <Section label="MÓDULOS ACTIVOS" icon={Layout}>
      {/* Summary header — tap to expand */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full bm-card p-4 flex items-center justify-between group transition-all"
        style={{ borderColor: expanded ? 'rgba(0,212,255,0.18)' : 'rgba(0,212,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {activos.slice(0, 3).map(([k]) => (
              <div key={k} className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-main)', boxShadow: '0 0 6px var(--accent-main)' }} />
            ))}
            {activos.length > 3 && <div className="w-2 h-2 rounded-full bg-white/20" />}
          </div>
          <div className="text-left">
            <span className="text-[12px] font-black tracking-wide text-white/80 block">
              {activos.length} MÓDULOS ACTIVOS
            </span>
            <span className="sys-label">{expanded ? 'TAP PARA COLAPSAR' : 'TAP PARA CONFIGURAR TODOS'}</span>
          </div>
        </div>
        <ChevronRight
          size={15}
          className="transition-transform duration-300"
          style={{ color: 'var(--color-accent)', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bm-card overflow-hidden"
        >
          {shown.map(([key, value], i) => (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-3.5"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={value
                    ? { background: 'var(--accent-main)', boxShadow: '0 0 6px var(--accent-main)' }
                    : { background: 'rgba(255,255,255,0.12)' }
                  }
                />
                <span className="text-[12px] font-black tracking-wide" style={{ color: value ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {MODULE_NAMES[key] || key.toUpperCase()}
                </span>
              </div>
              <Toggle active={value} onToggle={() => updateProfile({ modules: { ...profile.modules, [key]: !value } })} />
            </div>
          ))}
        </motion.div>
      )}
    </Section>
  );
}

export default function Settings() {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem(NOTIF_KEY) === 'true');
  const { cfg: briefingCfg, update: updateBriefing } = useBriefingConfig();

  const handleExport = () => {
    exportToCSV();
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  };

  const handleNotifToggle = async () => {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    const next = !notifEnabled;
    setNotifEnabled(next);
    localStorage.setItem(NOTIF_KEY, String(next));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfile({ identity: { ...profile.identity, avatarUrl: reader.result as string } });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="live-dot" />
          <span className="sys-label">PANEL DE CONTROL</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Configuración</h1>
      </header>

      {/* Identidad */}
      <Section label="IDENTIDAD DIGITAL" icon={User}>
        <div className="bm-card p-5 space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)', color: 'var(--color-accent)' }}
              >
                {profile.identity.avatarUrl
                  ? <img src={profile.identity.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : profile.identity.iniciales}
              </div>
              <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:opacity-80 active:scale-95" style={{ background: 'var(--accent-main)' }}>
                <Camera size={13} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={profile.identity.nombre}
                  onChange={(e) => updateProfile({ identity: { ...profile.identity, nombre: e.target.value } })}
                  placeholder="Nombre"
                  className="rounded-xl p-2.5 text-[13px] font-bold focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <input
                  type="text"
                  value={profile.identity.apellido}
                  onChange={(e) => updateProfile({ identity: { ...profile.identity, apellido: e.target.value } })}
                  placeholder="Apellido"
                  className="rounded-xl p-2.5 text-[13px] font-bold focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(['Hola', 'Hey', 'Buenos días', 'Qué tal'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => updateProfile({ identity: { ...profile.identity, saludo: s as any } })}
                    className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    style={profile.identity.saludo === s
                      ? { background: 'var(--accent-main)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Estética */}
      <Section label="ATMÓSFERA VISUAL" icon={Palette}>
        <div className="bm-card p-5 space-y-5">
          <div>
            <span className="sys-label block mb-3">COLOR DE ACENTO</span>
            <div className="grid grid-cols-4 gap-2">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.hex}
                  onClick={() => updateProfile({ visual: { ...profile.visual, accentColor: color.hex } })}
                  className="h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: color.hex,
                    boxShadow: profile.visual.accentColor === color.hex ? `0 0 12px ${color.hex}60` : undefined,
                    outline: profile.visual.accentColor === color.hex ? `2px solid white` : undefined,
                    outlineOffset: profile.visual.accentColor === color.hex ? '2px' : undefined,
                  }}
                >
                  {profile.visual.accentColor === color.hex && (
                    <Check size={16} className={color.hex === '#E5E5E7' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="sys-label block mb-3">MODO DE INTERFAZ</span>
            <div className="grid grid-cols-4 gap-2">
              {['dark', 'darker', 'midnight', 'blackout'].map(t => (
                <button
                  key={t}
                  onClick={() => updateProfile({ visual: { ...profile.visual, theme: t as any } })}
                  className="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  style={profile.visual.theme === t
                    ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--color-accent)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }
                  }
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Módulos */}
      <ModulosSection profile={profile} updateProfile={updateProfile} />

      {/* Metas */}
      <Section label="METAOBJETIVOS" icon={Target}>
        <div className="bm-card p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'CAPITAL OBJETIVO', key: 'capitalObjetivo' as const },
              { label: 'META MENSUAL',     key: 'ingresoMensualMeta' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <span className="sys-label block mb-2">{label}</span>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="px-3 flex items-center" style={{ background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="sys-label">{profile.goals.moneda}</span>
                  </div>
                  <input
                    type="number"
                    value={profile.goals[key]}
                    onChange={(e) => updateProfile({ goals: { ...profile.goals, [key]: parseInt(e.target.value) || 0 } })}
                    className="flex-1 bg-transparent p-2.5 text-[13px] font-black sys-value focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Briefing */}
      <Section label="BRIEFING MATUTINO" icon={Zap}>
        <div className="bm-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-black tracking-wide text-white/80">ACTIVAR BRIEFING</p>
              <span className="sys-label">Resumen en voz al abrir la app</span>
            </div>
            <Toggle active={briefingCfg.enabled} onToggle={() => updateBriefing({ enabled: !briefingCfg.enabled })} />
          </div>
          {briefingCfg.enabled && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {[
                { label: 'DESDE', key: 'horaInicio', opts: [4,5,6,7,8,9] },
                { label: 'HASTA', key: 'horaFin',    opts: [8,9,10,11,12] },
              ].map(({ label, key, opts }) => (
                <div key={key}>
                  <span className="sys-label block mb-2">{label}</span>
                  <select
                    value={briefingCfg[key as keyof typeof briefingCfg]}
                    onChange={(e) => updateBriefing({ [key]: parseInt(e.target.value) })}
                    className="w-full rounded-xl p-2.5 text-[12px] font-black focus:outline-none sys-value"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                  >
                    {opts.map(h => <option key={h} value={h}>{h}:00 {h < 12 ? 'AM' : 'PM'}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Notificaciones de agenda */}
      <Section label="NOTIFICACIONES" icon={Bell}>
        <div className="bm-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-black tracking-wide text-white/80">ALERTAS DE AGENDA</p>
              <span className="sys-label">Recordatorio 15 min · 5 min · al inicio</span>
            </div>
            <Toggle active={notifEnabled} onToggle={handleNotifToggle} />
          </div>
          {!('Notification' in window) && (
            <p className="sys-label mt-2" style={{ color: 'rgba(239,68,68,0.6)' }}>Tu browser no soporta notificaciones</p>
          )}
        </div>
      </Section>

      {/* Export */}
      <Section label="EXPORTAR DATOS" icon={Download}>
        <button
          onClick={handleExport}
          className="w-full bm-card p-4 flex items-center justify-between group text-left transition-all"
          style={{ borderColor: exportDone ? 'rgba(16,185,129,0.3)' : 'rgba(0,212,255,0.12)', background: exportDone ? 'rgba(16,185,129,0.05)' : 'rgba(0,212,255,0.03)' }}
        >
          <div>
            <p className="text-[11px] font-black tracking-wide" style={{ color: exportDone ? '#10B981' : 'var(--color-accent)' }}>
              {exportDone ? '✓ ARCHIVO DESCARGADO' : 'EXPORTAR A CSV'}
            </p>
            <span className="sys-label">Tareas · Capital · CRM · Ideas</span>
          </div>
          <Download size={14} style={{ color: exportDone ? '#10B981' : 'var(--color-accent)' }} />
        </button>
      </Section>

      {/* Demo data */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Play size={11} style={{ color: 'var(--color-accent)' }} />
          <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 0.9 }}>DEMO</span>
        </div>
        <button
          onClick={() => { seedDemoData(); window.location.reload(); }}
          className="w-full bm-card p-4 flex items-center justify-between group text-left transition-all"
          style={{ borderColor: 'rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.04)' }}
        >
          <div>
            <p className="text-[11px] font-black tracking-wide" style={{ color: 'var(--color-accent)' }}>CARGAR DATOS DEMO</p>
            <span className="sys-label">Simula 29 días de uso real · emprendedor LATAM</span>
          </div>
          <Play size={14} style={{ color: 'var(--color-accent)' }} />
        </button>
      </section>

      {/* Zona roja */}
      <section className="space-y-3 pt-4">
        <div className="flex items-center gap-2 px-1">
          <AlertTriangle size={11} className="text-red-500" />
          <span className="sys-label" style={{ color: '#EF4444', opacity: 1 }}>ZONA DE PELIGRO</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => updateProfile({ onboardingCompleto: false })}
            className="w-full bm-card p-4 flex items-center justify-between group text-left transition-all"
            style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)' }}
          >
            <div>
              <p className="text-[11px] font-black tracking-wide text-white/70">REPETIR ONBOARDING</p>
              <span className="sys-label">Reiniciar flujo de configuración guiada</span>
            </div>
            <RefreshCw size={14} className="text-white/20 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full bm-card p-4 flex items-center justify-between group text-left transition-all"
            style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)' }}
          >
            <div>
              <p className="text-[11px] font-black tracking-wide text-red-400">RESETEAR SISTEMA</p>
              <span className="sys-label" style={{ color: 'rgba(239,68,68,0.5)', opacity: 1 }}>Borrar toda personalización y datos</span>
            </div>
            <ChevronRight size={14} className="text-red-500/30 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Confirm modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bm-card p-8 w-full max-w-sm text-center space-y-6"
            style={{ borderColor: 'rgba(239,68,68,0.3)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertTriangle size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-1">¿ESTÁS SEGURO?</h3>
              <p className="text-[11px] text-white/30 leading-relaxed">Esta acción es irreversible. Se restaurarán todos los valores de fábrica.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  ['domex_tareas','domex_ideas','domex_transacciones','domex_agenda','domex_noticias_leidas','domex_market_cache','domex_habitos'].forEach(k => localStorage.removeItem(k));
                  resetProfile();
                  window.location.reload();
                }}
                className="py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                style={{ background: '#EF4444', color: 'white' }}
              >
                RESETEAR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
