import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Flame, Sparkles, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { callGroqFast } from '../services/groqService';
import type { EnergyBalanceEntry } from '../types';

const HOY = new Date().toISOString().split('T')[0];

const TIPOS = [
  {
    key: 'masculino' as const,
    icon: Flame,
    color: '#F59E0B',
    label: 'MASCULINO',
    desc: 'Acción · Dirección · Decisión · Fuerza',
  },
  {
    key: 'balanceado' as const,
    icon: Scale,
    color: '#10B981',
    label: 'BALANCEADO',
    desc: 'Acción con intuición · Fortaleza + apertura',
  },
  {
    key: 'femenino' as const,
    icon: Sparkles,
    color: '#EC4899',
    label: 'FEMENINO',
    desc: 'Intuición · Creatividad · Conexión · Flow',
  },
];

const SUGERENCIAS: Record<EnergyBalanceEntry['tipo'], string> = {
  masculino: 'Mucho hacer. Pausá 10min: meditá o salí a caminar. Escuchá tu intuición.',
  femenino: 'Buena energía receptiva. Pero hoy necesitás 1 acción concreta que te dé poder.',
  balanceado: 'Estás en el punto ideal. Combiná tarea grande + momento de conexión hoy.',
};

async function generarSugerenciaIA(tipo: EnergyBalanceEntry['tipo']): Promise<string> {
  const prompt = `Sos AIcolmena, asistente de desarrollo personal. El usuario dice que hoy siente energía predominantemente ${tipo}.
Devolvé solo JSON sin markdown:
{"sugerencia":"1 acción específica para hoy de máximo 15 palabras, en español rioplatense, directa y accionable"}`;

  const text = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 80, temperature: 0.4 }
  );
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  try { return JSON.parse(cleaned).sugerencia; } catch { throw new Error('Sugerencia no disponible.'); }
}

export default function EnergyBalance() {
  const { energyBalanceEntries, registrarEnergyBalance } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [seleccionado, setSeleccionado] = useState<EnergyBalanceEntry['tipo'] | null>(null);
  const [guardando, setGuardando] = useState(false);

  const yaRegistroHoy = energyBalanceEntries.some(e => e.fecha === HOY);
  const entradaHoy = energyBalanceEntries.find(e => e.fecha === HOY);
  const tipoHoy = TIPOS.find(t => t.key === entradaHoy?.tipo);

  const guardar = async () => {
    if (!seleccionado) return;
    setGuardando(true);
    let sugerenciaIA = SUGERENCIAS[seleccionado];
    try {
      sugerenciaIA = await generarSugerenciaIA(seleccionado);
    } catch { /* usa fallback */ }

    const entry: EnergyBalanceEntry = {
      id: `eb_${Date.now()}`,
      fecha: HOY,
      tipo: seleccionado,
      sugerenciaIA,
      creadoEn: new Date().toISOString(),
    };
    registrarEnergyBalance(entry);
    setGuardando(false);
    setShowForm(false);
    setSeleccionado(null);
  };

  // Historial: conteo por tipo
  const conteo = energyBalanceEntries.reduce(
    (acc, e) => { acc[e.tipo] = (acc[e.tipo] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" style={{ '--dot-color': '#EC4899' } as any} />
          <span className="sys-label">MÓDULO SALUD</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Energy<br />Balance</h1>
        <p className="text-[11px] text-white/30 mt-1">M · F no es género. Es energía existencial que fluctúa cada día.</p>
      </div>

      {/* Estado hoy */}
      {entradaHoy && tipoHoy ? (
        <div className="bm-card p-5 space-y-3" style={{ borderColor: `${tipoHoy.color}30` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `${tipoHoy.color}18`, border: `1px solid ${tipoHoy.color}28` }}>
              <tipoHoy.icon size={22} style={{ color: tipoHoy.color }} />
            </div>
            <div>
              <span className="sys-label block mb-0.5" style={{ color: tipoHoy.color }}>HOY</span>
              <p className="font-black text-xl uppercase">{tipoHoy.label}</p>
            </div>
          </div>
          <p className="text-[11px] text-white/40">{tipoHoy.desc}</p>
          {entradaHoy.sugerenciaIA && (
            <div className="p-3 rounded-lg" style={{ background: `${tipoHoy.color}0D`, border: `1px solid ${tipoHoy.color}25` }}>
              <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {entradaHoy.sugerenciaIA}
              </p>
            </div>
          )}
        </div>
      ) : (
        <motion.button
          onClick={() => setShowForm(true)}
          whileTap={{ scale: 0.97 }}
          className="w-full bm-card p-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(236,72,153,0.3)' }}
        >
          <div>
            <span className="sys-label block mb-1" style={{ color: '#EC4899' }}>CHECK-IN PENDIENTE</span>
            <p className="font-black text-lg">¿Qué energía predomina hoy?</p>
          </div>
          <Scale size={28} style={{ color: '#EC4899' }} />
        </motion.button>
      )}

      {/* Resumen patrón */}
      {energyBalanceEntries.length >= 3 && (
        <div className="bm-card p-4">
          <span className="sys-label block mb-3">PATRÓN {energyBalanceEntries.length} DÍAS</span>
          <div className="flex gap-3">
            {TIPOS.map(t => (
              <div key={t.key} className="flex-1 text-center">
                <t.icon size={16} style={{ color: t.color, margin: '0 auto 4px' }} />
                <span className="font-black text-lg sys-value" style={{ color: t.color }}>{conteo[t.key] ?? 0}</span>
                <span className="sys-label block">{t.label.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      {energyBalanceEntries.filter(e => e.fecha !== HOY).length > 0 && (
        <div className="space-y-2">
          <span className="sys-label px-1">HISTORIAL</span>
          {energyBalanceEntries.filter(e => e.fecha !== HOY).slice(0, 7).map(entry => {
            const t = TIPOS.find(tp => tp.key === entry.tipo)!;
            return (
              <div key={entry.id} className="bm-card p-3 flex items-center gap-3">
                <t.icon size={16} style={{ color: t.color, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <span className="sys-label" style={{ color: t.color }}>{t.label}</span>
                  <p className="text-[11px] text-white/30">{entry.fecha}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !guardando && setShowForm(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-4"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />
              <span className="sys-label block" style={{ color: '#EC4899' }}>CHECK-IN ENERGÍA M/F</span>
              <p className="font-black text-xl">¿Qué energía sentís hoy?</p>

              <div className="space-y-3">
                {TIPOS.map(t => (
                  <motion.button
                    key={t.key}
                    onClick={() => setSeleccionado(t.key)}
                    whileTap={{ scale: 0.97 }}
                    className="w-full p-4 rounded-xl text-left transition-all"
                    style={{
                      background: seleccionado === t.key ? `${t.color}15` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${seleccionado === t.key ? t.color : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <t.icon size={20} style={{ color: t.color }} />
                      <div>
                        <p className="font-black uppercase" style={{ fontSize: 12, letterSpacing: '0.08em', color: seleccionado === t.key ? t.color : 'rgba(255,255,255,0.7)' }}>
                          {t.label}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={guardar}
                disabled={!seleccionado || guardando}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-opacity disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #EC4899, #BE185D)', color: 'white' }}
              >
                {guardando ? (
                  <><Loader2 size={16} className="animate-spin" />GENERANDO...</>
                ) : (
                  <><Scale size={16} />REGISTRAR</>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
