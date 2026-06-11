import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Target, Star, Zap, Archive, Focus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import FocusMode from '../components/FocusMode';
import type { Tarea } from '../types';

const PREVIEW_LIMIT = 5;

function priorityColor(p: string) {
  return p === 'alta' ? '#EF4444' : p === 'media' ? '#F59E0B' : '#10B981';
}

function TaskDrawer({ tarea, onClose, onToggle, onToggleFoco, objetivoLabel }: {
  tarea: Tarea;
  onClose: () => void;
  onToggle: () => void;
  onToggleFoco: () => void;
  objetivoLabel?: string;
}) {
  const pColor = tarea.completada ? 'rgba(255,255,255,0.2)' : priorityColor(tarea.prioridad);
  const isOverdue = !tarea.completada && new Date(tarea.fechaVencimiento) < new Date();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(18,13,4,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative bm-card mx-3 mb-3 p-5 space-y-4"
        style={{ borderColor: `${pColor}30`, zIndex: 1 }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        {/* Accent bar top */}
        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b opacity-60" style={{ background: pColor }} />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="sys-label px-2 py-0.5 rounded"
                style={{ color: pColor, background: `${pColor}15` }}
              >
                {tarea.prioridad.toUpperCase()}
              </span>
              {tarea.esFoco && (
                <span className="sys-label px-2 py-0.5 rounded" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.12)' }}>
                  FOCO
                </span>
              )}
              {isOverdue && (
                <span className="sys-label px-2 py-0.5 rounded" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.12)' }}>
                  VENCIDA
                </span>
              )}
            </div>
            {/* Full title — no truncate */}
            <p className={cn('font-bold text-[15px] leading-snug', tarea.completada && 'line-through text-white/30')}>
              {tarea.titulo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 shrink-0 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3">
          <div className="bm-card px-3 py-2 flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Clock size={11} style={{ color: isOverdue ? '#EF4444' : 'rgba(212,144,10,0.6)' }} />
            <span className="sys-label" style={{ color: isOverdue ? '#EF4444' : undefined }}>
              {format(new Date(tarea.fechaVencimiento), 'dd MMM yyyy').toUpperCase()}
            </span>
          </div>
          {objetivoLabel && (
            <div className="bm-card px-3 py-2 flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <Target size={11} style={{ color: 'var(--color-accent)' }} />
              <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>{objetivoLabel}</span>
            </div>
          )}
        </div>

        <div className="hud-sep" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { onToggle(); onClose(); }}
            className={cn(
              'flex-1 py-3 rounded font-black text-[11px] tracking-[0.12em] transition-all',
              tarea.completada
                ? 'border border-white/10 text-white/30 hover:border-white/20'
                : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
            )}
          >
            {tarea.completada ? 'REABRIR TAREA' : 'MARCAR COMPLETADA'}
          </button>
          <button
            onClick={() => { onToggleFoco(); onClose(); }}
            className={cn(
              'px-4 py-3 rounded font-black text-[11px] tracking-[0.12em] transition-all',
              tarea.esFoco
                ? 'border border-amber-500/40 text-amber-400 bg-amber-500/08'
                : 'border border-white/10 text-white/30 hover:border-amber-500/30 hover:text-amber-400'
            )}
          >
            <Star size={14} fill={tarea.esFoco ? 'currentColor' : 'none'} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Tasks() {
  const { tareas, alternarTarea, alternarFoco, objetivos } = useApp();
  const [focusOpen, setFocusOpen] = useState(false);
  const [selected, setSelected] = useState<Tarea | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const secciones = [
    { id: 'foco',        label: 'PROTOCOLOS CRÍTICOS', sub: 'FOCO MÁXIMO',  icon: Zap,     color: 'var(--color-accent)', alwaysExpanded: true },
    { id: 'pendientes',  label: 'COLA DE EJECUCIÓN',    sub: 'EN PROGRESO',  icon: Clock,   color: '#F59E0B',             alwaysExpanded: false },
    { id: 'completadas', label: 'OPERACIONES CERRADAS', sub: 'COMPLETADAS',  icon: Archive, color: 'rgba(255,255,255,0.2)', alwaysExpanded: false },
  ];

  const filtrar = (id: string) => {
    if (id === 'foco')       return tareas.filter(t => t.esFoco && !t.completada);
    if (id === 'pendientes') return tareas.filter(t => !t.completada && !t.esFoco);
    return tareas.filter(t => t.completada);
  };

  const total      = tareas.filter(t => !t.completada).length;
  const completadas = tareas.filter(t => t.completada).length;
  const pct        = tareas.length > 0 ? Math.round((completadas / tareas.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {focusOpen && <FocusMode onClose={() => setFocusOpen(false)} />}

      <AnimatePresence>
        {selected && (
          <TaskDrawer
            key="drawer"
            tarea={selected}
            onClose={() => setSelected(null)}
            onToggle={() => alternarTarea(selected.id)}
            onToggleFoco={() => alternarFoco(selected.id)}
            objetivoLabel={objetivos.find(o => o.id === selected.objetivoId)?.titulo}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" />
            <span className="sys-label">SISTEMA DE EJECUCIÓN</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Tareas</h1>
        </div>
        <div className="flex gap-2 items-start">
          <button
            onClick={() => setFocusOpen(true)}
            className="bm-card px-3 py-3 flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95"
            style={{ borderColor: 'rgba(196,94,0,0.3)', background: 'rgba(196,94,0,0.06)' }}
          >
            <Focus size={13} style={{ color: '#C45E00' }} />
            <span className="sys-label text-[9px]" style={{ color: '#C45E00' }}>FOCUS</span>
          </button>
          <div className="bm-card px-4 py-3 text-right">
            <span className="sys-label block mb-0.5">COMPLETADO</span>
            <p className="text-xl font-black sys-value" style={{ color: 'var(--color-accent)' }}>{pct}%</p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bm-card p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="sys-label">PROGRESO</span>
          <span className="sys-label">{completadas}/{tareas.length} TAREAS</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent-main)', boxShadow: '0 0 8px var(--color-accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {secciones.map((sec) => {
          const Icon = sec.icon;
          const allItems   = filtrar(sec.id);
          const isExpanded = sec.alwaysExpanded || !!expanded[sec.id];
          const visible    = isExpanded ? allItems : allItems.slice(0, PREVIEW_LIMIT);
          const hidden     = allItems.length - PREVIEW_LIMIT;

          return (
            <section key={sec.id}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${sec.color}15`, border: `1px solid ${sec.color}30` }}>
                    <Icon size={13} style={{ color: sec.color }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.2em] leading-none"
                      style={{ color: sec.color === 'rgba(255,255,255,0.2)' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}>
                      {sec.label}
                    </p>
                    <span className="sys-label">{sec.sub}</span>
                  </div>
                </div>
                <span className="sys-label px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {allItems.length} ITEMS
                </span>
              </div>

              {/* Task list */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {visible.map((tarea) => (
                    <motion.div
                      layout
                      key={tarea.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className={cn('bm-card p-4 flex items-center gap-3 group relative overflow-hidden transition-all cursor-pointer active:scale-[0.99]', tarea.completada && 'opacity-40')}
                      onClick={() => setSelected(tarea)}
                    >
                      <div
                        className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r"
                        style={{ background: tarea.completada ? 'rgba(255,255,255,0.1)' : priorityColor(tarea.prioridad) }}
                      />

                      {/* Checkbox — stopPropagation so it doesn't open drawer */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); alternarTarea(tarea.id); }}
                        className={cn(
                          'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-all ml-2',
                          tarea.completada
                            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                            : 'border-white/15 hover:border-white/30 text-transparent'
                        )}
                      >
                        <CheckCircle2 size={16} className={tarea.completada ? 'opacity-100' : 'opacity-0'} />
                      </motion.button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-bold text-[13px] tracking-tight truncate', tarea.completada && 'line-through text-white/30')}>
                          {tarea.titulo}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span
                            className="sys-label px-1.5 py-0.5 rounded"
                            style={{ color: priorityColor(tarea.prioridad), background: `${priorityColor(tarea.prioridad)}12` }}
                          >
                            {tarea.prioridad.toUpperCase()}
                          </span>
                          <span className="text-white/10">·</span>
                          <span className="sys-label flex items-center gap-1">
                            <Clock size={8} />
                            {format(new Date(tarea.fechaVencimiento), 'dd MMM').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Star — stopPropagation */}
                      <button
                        onClick={(e) => { e.stopPropagation(); alternarFoco(tarea.id); }}
                        className={cn('p-1.5 rounded-lg transition-all shrink-0', tarea.esFoco ? 'text-amber-400' : 'text-white/15 hover:text-white/40')}
                        style={tarea.esFoco ? { background: 'rgba(245,158,11,0.1)' } : undefined}
                      >
                        <Star size={15} fill={tarea.esFoco ? 'currentColor' : 'none'} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Expand / collapse button */}
                {!sec.alwaysExpanded && allItems.length > PREVIEW_LIMIT && (
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                    className="w-full py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-80"
                    style={{ border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 4 }}
                  >
                    {isExpanded
                      ? <><ChevronUp size={12} className="text-white/30" /><span className="sys-label text-[9px]">COLAPSAR</span></>
                      : <><ChevronDown size={12} className="text-white/30" /><span className="sys-label text-[9px]">VER {hidden} MÁS</span></>
                    }
                  </button>
                )}

                {allItems.length === 0 && (
                  <div className="bm-card p-4 flex items-center gap-3 opacity-30">
                    <Icon size={12} style={{ color: sec.color }} />
                    <span className="sys-label">SIN TAREAS EN ESTA CATEGORÍA</span>
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
