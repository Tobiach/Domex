import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Briefcase, Radio, Shield, Crosshair } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ContactoCRM } from '../types';

const STAGE_FACTOR: Record<string, number> = {
  prospecto: 0.10,
  contactado: 0.30,
  negociacion: 0.70,
  ganado: 1.00,
};

const NEXT_ACTION: Record<string, string> = {
  prospecto:   'PRIMER CONTACTO',
  contactado:  'ENVIAR PROPUESTA',
  negociacion: 'CERRAR DEAL',
  ganado:      'UPSELL / REFERIDO',
};

const TIPO_META: Record<string, { label: string; color: string }> = {
  servicio: { label: 'SERV',    color: '#00D4FF' },
  producto: { label: 'PROD',    color: '#FF6D28' },
  saas:     { label: 'SAAS',    color: '#10B981' },
};

type TipoFilter = 'todos' | 'servicio' | 'producto' | 'saas';

function calcDealScore(valor: number, estado: string): number {
  const valueScore = Math.min(50, Math.round((valor / 5000) * 50));
  const stageScore = Math.round((STAGE_FACTOR[estado] ?? 0) * 50);
  return valueScore + stageScore;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : 'rgba(255,255,255,0.3)';
  return (
    <div className="text-right shrink-0">
      <span className="sys-label block mb-0.5 text-[8px]">SCORE</span>
      <p className="text-sm font-black" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{score}</p>
    </div>
  );
}

function TipoBadge({ tipo }: { tipo?: string }) {
  if (!tipo) return null;
  const meta = TIPO_META[tipo];
  if (!meta) return null;
  return (
    <span
      className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded"
      style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}
    >
      {meta.label}
    </span>
  );
}

export default function CRM() {
  const { contactos, actualizarEstadoContacto } = useApp();
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todos');

  const contactosFiltrados: ContactoCRM[] = tipoFilter === 'todos'
    ? contactos
    : contactos.filter(c => c.tipo === tipoFilter);

  const etapas = [
    { id: 'prospecto',   label: 'PRIMER CONTACTO',  sub: 'IDENTIFICADOS',       color: '#3B82F6', Icon: Crosshair },
    { id: 'contactado',  label: 'EN DIÁLOGO',        sub: 'COMUNICACIÓN ACTIVA', color: '#F59E0B', Icon: Radio },
    { id: 'negociacion', label: 'PROPUESTA ACTIVA',  sub: 'NEGOCIANDO',          color: 'var(--color-accent)', Icon: Briefcase },
    { id: 'ganado',      label: 'ALIADOS',           sub: 'CERRADOS',            color: '#10B981', Icon: Shield },
  ];

  const contactosPorEtapa = (etapa: string) => contactosFiltrados.filter(c => c.estado === etapa);

  const totalValor = contactosFiltrados.reduce((acc, c) => acc + (c.valor || 0), 0);
  const enNegociacion = contactosFiltrados.filter(c => c.estado === 'negociacion' || c.estado === 'ganado').length;

  const FILTERS: { id: TipoFilter; label: string }[] = [
    { id: 'todos',    label: 'TODOS' },
    { id: 'servicio', label: 'SERVICIO' },
    { id: 'producto', label: 'PRODUCTO' },
    { id: 'saas',     label: 'SAAS' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" />
            <span className="sys-label">INTELIGENCIA HUMANA</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">CRM</h1>
        </div>
        <div className="bm-card px-4 py-3 text-right">
          <span className="sys-label block mb-0.5">PIPELINE</span>
          <p className="text-xl font-black sys-value" style={{ color: '#10B981' }}>${totalValor.toLocaleString()}</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'CONTACTOS', value: contactosFiltrados.length,                                      color: 'rgba(255,255,255,0.4)' },
          { label: 'PROSPECTOS', value: enNegociacion,                                                  color: 'var(--color-accent)' },
          { label: 'GANADOS',   value: contactosFiltrados.filter(c => c.estado === 'ganado').length,   color: '#10B981' },
        ].map(s => (
          <div key={s.label} className="bm-card p-3">
            <span className="sys-label block mb-1">{s.label}</span>
            <p className="text-base font-black sys-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tipo filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const active = tipoFilter === f.id;
          const accentColor = f.id === 'todos' ? 'var(--color-accent)'
            : f.id === 'servicio' ? '#00D4FF'
            : f.id === 'producto' ? '#FF6D28'
            : '#10B981';
          return (
            <button
              key={f.id}
              onClick={() => setTipoFilter(f.id)}
              className="hud-btn text-[9px] px-3 py-1.5 transition-all"
              style={active ? {
                color: accentColor,
                borderColor: `${accentColor}50`,
                background: `${accentColor}10`,
              } : {}}
            >
              {f.label}
              {f.id !== 'todos' && (
                <span className="ml-1.5 opacity-50">
                  {contactos.filter(c => c.tipo === f.id).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state global */}
      {contactos.length === 0 && (
        <div className="bm-card p-8 text-center space-y-2">
          <p className="text-3xl">👤</p>
          <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Nadie en el pipeline todavía</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Usá la voz: <span style={{ color: 'var(--honey-bright)' }}>"Contacto: Martín García de Empresa X, prospecto $500"</span>
          </p>
        </div>
      )}

      {/* Pipeline */}
      <div className="space-y-8">
        {etapas.map((etapa) => {
          const items = contactosPorEtapa(etapa.id);
          const { Icon } = etapa;
          return (
            <section key={etapa.id}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${etapa.color}15`, border: `1px solid ${etapa.color}30` }}>
                    <Icon size={14} style={{ color: etapa.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.2em] text-white/70 leading-none">{etapa.label}</p>
                    <span className="sys-label">{etapa.sub}</span>
                  </div>
                </div>
                <span className="sys-label px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {items.length} CONTACTOS
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map((contacto) => (
                    <motion.div
                      layout
                      key={contacto.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bm-card p-4 flex items-center gap-4 group relative overflow-hidden hover:border-white/10 transition-all"
                      style={{ '--bm-accent': etapa.color } as React.CSSProperties}
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r opacity-70" style={{ background: etapa.color }} />

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[15px] shrink-0 transition-all group-hover:scale-105 ml-2"
                        style={{ background: `${etapa.color}20`, border: `1px solid ${etapa.color}30`, color: etapa.color }}
                      >
                        {contacto.nombre.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[13px] tracking-tight truncate">{contacto.nombre}</p>
                          <TipoBadge tipo={contacto.tipo} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Briefcase size={8} className="text-white/20" />
                          <span className="sys-label truncate">{contacto.empresa}</span>
                        </div>
                        <div className="mt-1">
                          <span className="sys-label text-[8px]" style={{ color: `${etapa.color}80` }}>
                            → {NEXT_ACTION[contacto.estado] ?? ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="sys-label block mb-0.5">VALOR</span>
                          <p className="text-sm font-black sys-value text-emerald-400">${contacto.valor?.toLocaleString()}</p>
                        </div>
                        <ScoreBadge score={calcDealScore(contacto.valor ?? 0, contacto.estado)} />
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                          <Phone size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="bm-card p-4 flex items-center gap-3 opacity-30">
                    <Icon size={12} style={{ color: etapa.color }} />
                    <span className="sys-label">SIN CONTACTOS EN ESTA ETAPA</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
