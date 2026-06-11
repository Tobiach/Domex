import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Plus, Activity, History, Rocket, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Capital() {
  const { balanceCalculado, transacciones, ideas } = useApp();
  const navigate = useNavigate();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const ingresosDelMes = transacciones
    .filter(t => t.tipo === 'ingreso' && t.fecha.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.monto, 0);
  const gastosDelMes = transacciones
    .filter(t => t.tipo === 'gasto' && t.fecha.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.monto, 0);
  const netMes = ingresosDelMes - gastosDelMes;

  const valorPipeline = ideas.reduce((acc, i) => acc + (i.valorEstimado || 0), 0);
  const potencialMensual = ideas
    .filter(i => i.estado === 'ejecucion')
    .reduce((acc, i) => acc + (i.potencialMensual || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" />
            <span className="sys-label">FLUJO EN TIEMPO REAL</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Capital</h1>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Activity size={18} className="text-emerald-400" />
        </div>
      </header>

      {/* Balance principal */}
      <div className="bm-card p-6 relative overflow-hidden scanline">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-10" style={{ background: 'var(--color-accent)' }} />
        <div className="relative z-10">
          <span className="sys-label block mb-3">BALANCE NETO AICOLMENA</span>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-2xl font-black text-white/20 sys-value">$</span>
            <h2 className={cn('text-5xl font-black tracking-tighter sys-value', balanceCalculado >= 0 ? 'text-white' : 'text-red-400')}>
              {Math.abs(balanceCalculado).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </h2>
            {balanceCalculado < 0 && <span className="text-red-400/50 text-sm font-black">DÉFICIT</span>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <span className="sys-label block mb-1">INGRESOS</span>
              <p className="text-base font-black sys-value text-emerald-400">+${ingresosDelMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <span className="sys-label block mb-1">GASTOS</span>
              <p className="text-base font-black sys-value text-red-400">-${gastosDelMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="rounded-xl p-3" style={{
              background: netMes >= 0 ? 'rgba(0,212,255,0.07)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${netMes >= 0 ? 'rgba(0,212,255,0.12)' : 'rgba(239,68,68,0.15)'}`,
            }}>
              <span className="sys-label block mb-1">NETO MES</span>
              <p className="text-base font-black sys-value" style={{ color: netMes >= 0 ? 'var(--color-accent)' : '#f87171' }}>
                {netMes >= 0 ? '+' : ''}{netMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="bm-card p-5 relative overflow-hidden group">
        <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Rocket size={60} />
        </div>
        <div className="relative z-10">
          <span className="sys-label block mb-3">PIPELINE ESTRATÉGICO</span>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-black sys-value">${valorPipeline.toLocaleString()}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp size={10} className="text-emerald-400" />
                <span className="sys-label" style={{ color: '#10B981', opacity: 0.9 }}>
                  ${potencialMensual.toLocaleString()}/MES EN EJECUCIÓN
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/ideas')}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ChevronRight size={18} className="text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Historial */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History size={13} className="text-white/30" />
            <span className="sys-label">MOVIMIENTOS RECIENTES</span>
          </div>
          <span className="sys-label">TODOS →</span>
        </div>

        <div className="space-y-2">
          {transacciones.length === 0 ? (
            <div className="bm-card p-5 text-center">
              <span className="sys-label">SIN TRANSACCIONES REGISTRADAS</span>
            </div>
          ) : transacciones.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bm-card p-4 flex items-center gap-4 group hover:border-white/10 transition-all"
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                t.tipo === 'ingreso'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              )} style={{
                background: t.tipo === 'ingreso' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${t.tipo === 'ingreso' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {t.tipo === 'ingreso' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] tracking-tight truncate">{t.descripcion}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="sys-label">{t.categoria.toUpperCase()}</span>
                  <span className="text-white/10">·</span>
                  <span className="sys-label">{format(new Date(t.fecha), "dd MMM HH:mm").toUpperCase()}</span>
                </div>
              </div>

              <p className={cn('font-black text-[15px] sys-value shrink-0', t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400')}>
                {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Optimización */}
      <div className="bm-card p-5 flex gap-4 items-start" style={{ borderColor: 'rgba(0,212,255,0.12)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <TrendingUp size={16} style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <span className="sys-label block mb-1" style={{ color: 'var(--color-accent)', opacity: 0.9 }}>ANÁLISIS AICOLMENA</span>
          <p className="text-[12px] text-white/50 font-medium leading-relaxed">
            Suscripciones bajaron un <span className="text-emerald-400 font-black">4%</span> este mes. Reinvertir delta en validación de ideas activas.
          </p>
        </div>
      </div>
    </div>
  );
}
