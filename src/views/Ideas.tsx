import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Rocket, Search, CheckCircle2, MoreVertical, User, Trash2, ChevronRight, Pencil, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Idea } from '../types';

const COLUMNAS = [
  { id: 'idea',       label: 'CONCEPCIÓN',  icon: Lightbulb,    color: '#F59E0B', sub: 'INSPIRACIÓN PURA' },
  { id: 'validacion', label: 'VALIDACIÓN',  icon: Search,       color: '#3B82F6', sub: 'PRUEBA DE MERCADO' },
  { id: 'ejecucion',  label: 'EN MARCHA',   icon: Rocket,       color: '#10B981', sub: 'GENERANDO VALOR' },
];

type EditState = { titulo: string; descripcion: string; valorEstimado: string; potencialMensual: string };

export default function Ideas() {
  const { ideas, actualizarEstadoIdea, actualizarIdea, eliminarIdea, contactos } = useApp();
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({ titulo: '', descripcion: '', valorEstimado: '', potencialMensual: '' });

  const abrirEdicion = (idea: Idea) => {
    setMenuAbierto(null);
    setEditando(idea.id);
    setEditForm({ titulo: idea.titulo, descripcion: idea.descripcion, valorEstimado: String(idea.valorEstimado || ''), potencialMensual: String(idea.potencialMensual || '') });
  };

  const guardarEdicion = (id: string) => {
    actualizarIdea(id, { titulo: editForm.titulo, descripcion: editForm.descripcion, valorEstimado: Number(editForm.valorEstimado) || 0, potencialMensual: Number(editForm.potencialMensual) || 0 });
    setEditando(null);
  };

  const totalValor = ideas.reduce((acc, i) => acc + (i.valorEstimado || 0), 0);
  const potencialMensual = ideas.reduce((acc, i) => acc + (i.potencialMensual || 0), 0);
  const enEjecucion = ideas.filter(i => i.estado === 'ejecucion').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" />
            <span className="sys-label">LABORATORIO ACTIVO</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Ideas</h1>
        </div>
        <div className="bm-card px-4 py-3 text-right">
          <span className="sys-label block mb-0.5">PIPELINE TOTAL</span>
          <p className="text-xl font-black sys-value" style={{ color: '#10B981' }}>
            ${totalValor.toLocaleString()}
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'ROI MENSUAL',  value: `$${potencialMensual.toLocaleString()}`, color: '#10B981' },
          { label: 'EN EJECUCIÓN', value: enEjecucion,                              color: 'var(--color-accent)' },
          { label: 'TOTAL IDEAS',  value: ideas.length,                              color: 'rgba(255,255,255,0.5)' },
        ].map(s => (
          <div key={s.label} className="bm-card p-3">
            <span className="sys-label block mb-1">{s.label}</span>
            <p className="text-base font-black sys-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state global */}
      {ideas.length === 0 && (
        <div className="bm-card p-8 text-center space-y-2">
          <p className="text-3xl">💡</p>
          <p className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Tu laboratorio de ideas está vacío
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Tocá el micrófono y decí<br />
            <span style={{ color: 'var(--honey-bright)' }}>"Idea: app para gestionar turnos en peluquerías"</span>
          </p>
        </div>
      )}

      {/* Columnas */}
      <div className="space-y-10">
        {COLUMNAS.map((col) => {
          const colIdeas = ideas.filter(i => i.estado === col.id);
          const Icon = col.icon;
          return (
            <section key={col.id}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${col.color}15`, border: `1px solid ${col.color}30` }}>
                    <Icon size={15} style={{ color: col.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.2em] text-white/70 leading-none">{col.label}</p>
                    <span className="sys-label">{col.sub}</span>
                  </div>
                </div>
                <span className="sys-label px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {colIdeas.length} ITEMS
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {colIdeas.map((idea) => (
                    <motion.div
                      layout key={idea.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bm-card p-5 relative group"
                      style={{ '--bm-accent': col.color } as any}
                    >
                      {/* Accent bar */}
                      <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-r-full opacity-60" style={{ background: col.color }} />

                      {/* Top row */}
                      <div className="flex justify-between items-start mb-3 pl-3">
                        <h4 className="font-black text-[15px] tracking-tight pr-2 leading-tight">{idea.titulo}</h4>
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setMenuAbierto(menuAbierto === idea.id ? null : idea.id)}
                            className="p-1 text-white/20 hover:text-white/60 transition-colors"
                          >
                            <MoreVertical size={17} />
                          </button>
                          <AnimatePresence>
                            {menuAbierto === idea.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                className="absolute right-0 top-8 z-20 min-w-[170px] rounded-xl overflow-hidden"
                                style={{ background: '#0A0A18', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
                              >
                                <button
                                  onClick={() => abrirEdicion(idea)}
                                  className="w-full text-left px-3 py-2.5 text-[12px] text-white/60 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                >
                                  <Pencil size={13} />
                                  <span>Editar</span>
                                </button>
                                {col.id !== 'ejecucion' && (
                                  <button
                                    onClick={() => { actualizarEstadoIdea(idea.id, col.id === 'idea' ? 'validacion' : 'ejecucion'); setMenuAbierto(null); }}
                                    className="w-full text-left px-3 py-2.5 text-[12px] text-white/60 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                  >
                                    <ChevronRight size={13} />
                                    <span>→ {col.id === 'idea' ? 'Validación' : 'Ejecución'}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => { eliminarIdea(idea.id); setMenuAbierto(null); }}
                                  className="w-full text-left px-3 py-2.5 text-[12px] text-red-400/80 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 size={13} />
                                  <span>Eliminar</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {editando === idea.id ? (
                        <div className="pl-3 space-y-2 mb-4">
                          <input
                            value={editForm.titulo}
                            onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] font-black text-white outline-none focus:border-[rgba(0,212,255,0.4)]"
                            placeholder="Título"
                          />
                          <textarea
                            value={editForm.descripcion}
                            onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white/70 outline-none resize-none focus:border-[rgba(0,212,255,0.4)]"
                            placeholder="Descripción"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={editForm.valorEstimado}
                              onChange={e => setEditForm(f => ({ ...f, valorEstimado: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white/70 outline-none focus:border-[rgba(0,212,255,0.4)]"
                              placeholder="Valor est. $"
                              type="number"
                            />
                            <input
                              value={editForm.potencialMensual}
                              onChange={e => setEditForm(f => ({ ...f, potencialMensual: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white/70 outline-none focus:border-[rgba(0,212,255,0.4)]"
                              placeholder="Potencial/mes $"
                              type="number"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => guardarEdicion(idea.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--color-accent)' }}>
                              <Check size={11} /> GUARDAR
                            </button>
                            <button onClick={() => setEditando(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest text-white/40" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <X size={11} /> CANCELAR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[12px] text-white/35 leading-relaxed mb-4 line-clamp-2 pl-3">{idea.descripcion}</p>
                      )}

                      {idea.contactoRelacionadoId && (
                        <div className="flex items-center gap-1.5 mb-4 pl-3">
                          <User size={9} style={{ color: 'var(--color-accent)' }} />
                          <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>
                            {contactos.find(c => c.id === idea.contactoRelacionadoId)?.nombre}
                          </span>
                        </div>
                      )}

                      {/* Financial metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-4 pl-3">
                        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="sys-label block mb-0.5">VALOR EST.</span>
                          <p className="text-sm font-black sys-value">${idea.valorEstimado?.toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="sys-label block mb-0.5">POTENCIAL/MES</span>
                          <p className="text-sm font-black sys-value" style={{ color: '#10B981' }}>${idea.potencialMensual?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pl-3 border-t border-white/5 pt-3">
                        <span className="sys-label">
                          CREADA {format(new Date(idea.creadoEn), "dd MMM", { locale: es }).toUpperCase()}
                        </span>
                        {col.id !== 'ejecucion' ? (
                          <button
                            onClick={() => actualizarEstadoIdea(idea.id, col.id === 'idea' ? 'validacion' : 'ejecucion')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all active:scale-95"
                            style={{ background: `${col.color}15`, border: `1px solid ${col.color}30`, color: col.color }}
                          >
                            PROMOVER <ChevronRight size={10} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
                            style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <CheckCircle2 size={11} />
                            LIVE
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colIdeas.length === 0 && (
                  <div className="bm-card p-5 flex items-center gap-3 opacity-40">
                    <Icon size={14} style={{ color: col.color }} />
                    <span className="sys-label">SIN IDEAS EN ESTA ETAPA</span>
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
