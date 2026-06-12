import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

interface CalendarModalProps {
  onClose: () => void;
}

export default function CalendarModal({ onClose }: CalendarModalProps) {
  const { agenda, agregarAgenda } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [showForm, setShowForm] = useState(false);
  const [formTitulo, setFormTitulo] = useState('');
  const [formHora, setFormHora] = useState('10:00');
  const [formPersonas, setFormPersonas] = useState('');

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysWithEvents = useMemo(() => {
    const set = new Set<number>();
    agenda.forEach(a => {
      const d = new Date(a.fecha);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [agenda, year, month]);

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const selectedEvents = useMemo(() => {
    if (!selectedDateStr) return [];
    return agenda
      .filter(a => a.fecha === selectedDateStr)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [agenda, selectedDateStr]);

  const handleGuardar = () => {
    if (!formTitulo.trim() || !selectedDateStr) return;
    agregarAgenda({
      titulo: formTitulo.trim(),
      fecha: selectedDateStr,
      hora: formHora,
      personas: formPersonas ? formPersonas.split(',').map(p => p.trim()).filter(Boolean) : [],
      tipo: 'reunion',
    });
    setFormTitulo('');
    setFormHora('10:00');
    setFormPersonas('');
    setShowForm(false);
  };

  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-3xl overflow-hidden"
        style={{ background: '#0F0D08', border: '1px solid rgba(201,148,26,0.2)', borderBottom: 'none', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--honey-core)', letterSpacing: '0.12em' }}>
            CALENDARIO
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
            style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.06)' }}
          >
            <X size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 pb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg transition-opacity hover:opacity-60"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ChevronLeft size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            {MESES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg transition-opacity hover:opacity-60"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 px-4 mb-1">
          {DIAS.map(d => (
            <div key={d} className="flex items-center justify-center py-1">
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-4 gap-y-0.5 pb-4">
          {cells.map((day, i) => {
            if (day === null) return <div key={`b-${i}`} style={{ minHeight: 38 }} />;
            const isToday = day === todayDate && month === todayMonth && year === todayYear;
            const isSelected = day === selectedDay;
            const hasEvents = daysWithEvents.has(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className="flex flex-col items-center justify-center rounded-xl transition-all relative"
                style={{ minHeight: 38, background: isSelected ? 'var(--honey-core)' : 'transparent' }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: isToday ? 800 : 500,
                  fontFamily: 'var(--font-display)',
                  color: isSelected ? 'var(--text-on-honey)' : isToday ? 'white' : 'var(--text-secondary)',
                }}>
                  {day}
                </span>
                {isToday && !isSelected && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--violet-soft)', marginTop: 1 }} />
                )}
                {hasEvents && !isSelected && !isToday && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--honey-core)', marginTop: 1 }} />
                )}
                {hasEvents && isToday && !isSelected && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--honey-bright)', marginTop: 1 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t"
              style={{ borderColor: 'rgba(201,148,26,0.12)' }}
            >
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--honey-core)', letterSpacing: '0.1em' }}>
                    {selectedDay} DE {MESES[month].toUpperCase()}
                  </span>
                  {!showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-95"
                      style={{ background: 'rgba(201,148,26,0.12)', border: '1px solid rgba(201,148,26,0.2)' }}
                    >
                      <Plus size={11} style={{ color: 'var(--honey-bright)' }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--honey-bright)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                        NUEVA REUNIÓN
                      </span>
                    </button>
                  )}
                </div>

                {selectedEvents.length > 0 && (
                  <div className="space-y-2">
                    {selectedEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: 'rgba(91,33,182,0.1)', border: '1px solid rgba(91,33,182,0.15)' }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--honey-bright)', fontFamily: 'var(--font-display)', minWidth: 38, flexShrink: 0 }}>
                          {ev.hora}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            {ev.titulo}
                          </p>
                          {ev.personas.length > 0 && (
                            <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ev.personas.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEvents.length === 0 && !showForm && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
                    Sin eventos este día.
                  </p>
                )}

                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        value={formTitulo}
                        onChange={e => setFormTitulo(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGuardar()}
                        placeholder="Título de la reunión..."
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="time"
                          value={formHora}
                          onChange={e => setFormHora(e.target.value)}
                          className="px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', colorScheme: 'dark', fontFamily: 'var(--font-body)' }}
                        />
                        <input
                          type="text"
                          value={formPersonas}
                          onChange={e => setFormPersonas(e.target.value)}
                          placeholder="Con quién..."
                          className="px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowForm(false); setFormTitulo(''); }}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleGuardar}
                          disabled={!formTitulo.trim()}
                          className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                          style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)' }}
                        >
                          Guardar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-6" />
      </motion.div>
    </motion.div>
  );
}
