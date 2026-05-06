import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  PieChart, 
  Activity,
  History,
  Rocket,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Capital() {
  const { usuario, transacciones, ideas } = useApp();
  const navigate = useNavigate();

  const valorPipeline = ideas.reduce((acc, current) => acc + (current.valorEstimado || 0), 0);
  const potencialMensual = ideas.filter(i => i.estado === 'ejecucion').reduce((acc, current) => acc + (current.potencialMensual || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Control de Capital</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Flujo de caja estratégico</p>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <Activity size={24} className="text-emerald-500" />
        </div>
      </header>

      {/* Tarjeta de Balance */}
      <div className="glass-card p-8 premium-gradient border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
        <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2 italic">Balance Neto Domex</p>
        <div className="flex items-baseline gap-2">
          <span className="text-white/40 text-2xl font-black">$</span>
          <h2 className="text-5xl font-black tracking-tighter text-white">
            {usuario.balance.toLocaleString()}
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Ingresos mes</p>
            <p className="text-xl font-black text-emerald-400 group-hover:scale-105 transition-transform origin-left">+${usuario.ingresosMensuales.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Gastos mes</p>
            <p className="text-xl font-black text-rose-400 group-hover:scale-105 transition-transform origin-left">-${usuario.gastosMensuales.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Valor en Pipeline (Sistema Integrado) */}
      <div className="grid gap-4">
        <div className="glass-card p-6 bg-white/[0.03] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Rocket size={80} />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Valor Estratégico en Pipeline</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black tracking-tighter">${valorPipeline.toLocaleString()}</p>
                <p className="text-[9px] text-emerald-500 font-bold uppercase mt-1 flex items-center gap-1">
                  <TrendingUp size={10} />
                  Potencial +${potencialMensual}/mes en ejecución
                </p>
              </div>
              <button 
                onClick={() => navigate('/ideas')}
                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all"
              >
                <ChevronRight size={20} className="text-white/40" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historial Quirúrgico */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History size={18} className="text-white/40" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Movimientos Recientes</h3>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Ver todo</button>
        </div>

        <div className="space-y-3">
          {transacciones.map((t) => (
            <div key={t.id} className="glass-card p-5 bg-white/[0.02] border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                  t.tipo === 'ingreso' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {t.tipo === 'ingreso' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-[15px] tracking-tight">{t.descripcion}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{t.categoria}</span>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <span className="text-[9px] font-bold text-white/20">{format(new Date(t.fecha), "dd MMM HH:mm")}</span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "font-black text-lg tracking-tight",
                t.tipo === 'ingreso' ? "text-emerald-400" : "text-rose-400"
              )}>
                {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Análisis de Optimización */}
      <div className="glass-card p-6 bg-primary/5 border-primary/20 flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <PieChart className="text-white" size={20} />
        </div>
        <div>
          <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-1">Optimización Detectada</h4>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            Tus suscripciones bajaron un <span className="text-emerald-400 font-black">4%</span> este mes. Domex sugiere reinvertir en **Validación de Ideas**.
          </p>
        </div>
      </div>
    </div>
  );
}
