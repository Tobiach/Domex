import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  onClose: () => void;
}

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export default function FocusMode({ onClose }: Props) {
  const { tareas } = useApp();
  const pending = tareas.filter(t => !t.completada);

  const [selectedTask, setSelectedTask] = useState(pending[0]?.titulo || '');
  const [isWork, setIsWork] = useState(true);
  const [timeLeft, setTimeLeft] = useState(WORK_SEC);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const total = isWork ? WORK_SEC : BREAK_SEC;
  const pct = ((total - timeLeft) / total) * 100;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const color = isWork ? 'var(--accent-main)' : '#FF6D28';

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          if (isWork) {
            setSessions(s => s + 1);
            setIsWork(false);
            setTimeLeft(BREAK_SEC);
          } else {
            setIsWork(true);
            setTimeLeft(WORK_SEC);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, isWork]);

  const reset = () => { setIsRunning(false); setIsWork(true); setTimeLeft(WORK_SEC); };

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
      style={{ backgroundColor: '#000' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <X size={18} className="text-white/50" />
      </button>

      <div className="flex flex-col items-center gap-8 px-8 w-full max-w-sm">

        {/* Mode + sessions */}
        <div className="text-center space-y-2">
          <span className="sys-label" style={{ color }}>
            {isWork ? 'MODO TRABAJO · ENFOQUE MÁXIMO' : 'DESCANSO ACTIVO'}
          </span>
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: Math.max(4, sessions + 1) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i < sessions ? '#FF6D28' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </div>

        {/* SVG circular timer */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={color} strokeWidth="3"
              strokeDasharray={circ}
              strokeDashoffset={circ - (pct / 100) * circ}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 8px ${isWork ? '#00D4FF' : '#FF6D28'})` }}
            />
          </svg>
          <div className="text-center z-10">
            <p className="text-5xl font-black tracking-tighter" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
              {mm}:{ss}
            </p>
            <span className="sys-label text-[9px]">{isWork ? 'TRABAJO' : 'DESCANSO'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <RotateCcw size={16} className="text-white/40" />
          </button>

          <button
            onClick={() => setIsRunning(r => !r)}
            className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: color, boxShadow: `0 0 32px ${isWork ? '#00D4FF40' : '#FF6D2840'}` }}
          >
            {isRunning
              ? <Pause size={28} className="text-black" />
              : <Play size={28} className="text-black ml-1" />}
          </button>

          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[14px] font-black" style={{ color: '#FF6D28' }}>{sessions}</span>
            <span className="sys-label text-[8px]">SESIONES</span>
          </div>
        </div>

        {/* Task selector */}
        <div className="w-full bm-card p-4 space-y-2">
          <span className="sys-label block">TAREA EN FOCO</span>
          {pending.length > 0 ? (
            <select
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
              className="w-full bg-transparent text-[12px] font-bold focus:outline-none text-white/80 truncate"
            >
              {pending.map(t => (
                <option key={t.id} value={t.titulo} style={{ background: '#06060E' }}>
                  {t.titulo}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[11px] text-white/30">Sin tareas pendientes</p>
          )}
        </div>

      </div>
    </motion.div>
  );
}
