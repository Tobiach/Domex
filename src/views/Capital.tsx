import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight, ArrowDownLeft, Activity, History, Rocket, ChevronRight,
  TrendingUp, Plus, X, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const CATEGORIAS_GASTO = ['Alimentación','Transporte','Marketing','Salud','Educación','Entretenimiento','Servicios','Cuidado personal','Tecnología','Vivienda','Otros'];
const CATEGORIAS_INGRESO = ['Ventas','Servicios','Inversiones','Freelance','Dividendos','Otros ingresos'];

type ModalTipo = 'ingreso' | 'gasto' | null;

function TransaccionModal({
  tipo,
  onClose,
  onGuardar,
}: {
  tipo: NonNullable<ModalTipo>;
  onClose: () => void;
  onGuardar: (data: { monto: number; categoria: string; descripcion: string; fecha: string }) => void;
}) {
  const isIngreso = tipo === 'ingreso';
  const CATS = isIngreso ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const color = isIngreso ? '#10B981' : '#EF4444';

  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(CATS[0]);
  const [nuevaCat, setNuevaCat] = useState('');
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const catFinal = mostrarNueva && nuevaCat.trim() ? nuevaCat.trim() : categoria;
  const montoNum = parseFloat(monto.replace(',', '.')) || 0;
  const puedeGuardar = montoNum > 0;

  const handleGuardar = () => {
    if (!puedeGuardar) return;
    onGuardar({ monto: montoNum, categoria: catFinal, descripcion, fecha });
    onClose();
  };

  return (
    <>
      <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.65)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl pb-10"
        style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        {/* Handle */}
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isIngreso
                ? <ArrowDownLeft size={16} style={{ color }} />
                : <ArrowUpRight size={16} style={{ color }} />
              }
              <span className="sys-label" style={{ color, opacity: 1 }}>
                {isIngreso ? 'NUEVO INGRESO' : 'NUEVO GASTO'}
              </span>
            </div>
            <button onClick={onClose}><X size={14} className="text-white/30" /></button>
          </div>

          {/* Monto */}
          <div>
            <span className="sys-label block mb-1.5">MONTO</span>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30` }}>
              <span className="text-xl font-black" style={{ color: 'var(--text-tertiary)' }}>$</span>
              <input
                type="number"
                inputMode="decimal"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="0"
                autoFocus
                className="flex-1 bg-transparent outline-none text-2xl font-black sys-value"
                style={{ color, minWidth: 0 }}
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <span className="sys-label block mb-1.5">CATEGORÍA</span>
            <div className="flex flex-wrap gap-1.5">
              {CATS.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategoria(cat); setMostrarNueva(false); }}
                  className="px-3 py-1.5 rounded-lg font-bold transition-all"
                  style={{
                    fontSize: 9, letterSpacing: '0.06em',
                    background: categoria === cat && !mostrarNueva ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${categoria === cat && !mostrarNueva ? `${color}50` : 'rgba(255,255,255,0.07)'}`,
                    color: categoria === cat && !mostrarNueva ? color : 'var(--text-tertiary)',
                  }}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="px-3 py-1.5 rounded-lg font-bold transition-all"
                style={{
                  fontSize: 9, letterSpacing: '0.06em',
                  background: mostrarNueva ? 'rgba(201,148,26,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mostrarNueva ? 'rgba(201,148,26,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: mostrarNueva ? 'var(--honey-bright)' : 'var(--text-tertiary)',
                }}
              >
                + NUEVA
              </button>
            </div>
            {mostrarNueva && (
              <input
                value={nuevaCat}
                onChange={e => setNuevaCat(e.target.value)}
                placeholder="Nombre de la categoría"
                className="mt-2 w-full px-4 py-2.5 rounded-xl text-[13px] bg-transparent outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            )}
          </div>

          {/* Descripción */}
          <div>
            <span className="sys-label block mb-1.5">DESCRIPCIÓN (OPCIONAL)</span>
            <input
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder={isIngreso ? 'ej: Pago cliente Control.Evo' : 'ej: Almuerzo reunión'}
              className="w-full px-4 py-2.5 rounded-xl text-[13px] bg-transparent outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
            />
          </div>

          {/* Fecha */}
          <div>
            <span className="sys-label block mb-1.5">FECHA</span>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-[13px] font-medium bg-transparent outline-none"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'white', colorScheme: 'dark' }}
            />
          </div>

          {/* Guardar */}
          <button
            onClick={handleGuardar}
            disabled={!puedeGuardar}
            className="w-full h-12 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30"
            style={{ background: color, color: '#fff' }}
          >
            <CheckCircle2 size={14} />
            GUARDAR {isIngreso ? 'INGRESO' : 'GASTO'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function NetoMesCard({ ingresosDelMes, gastosDelMes, netMes, transacciones, currentMonth }: {
  ingresosDelMes: number; gastosDelMes: number; netMes: number;
  transacciones: any[]; currentMonth: string;
}) {
  const [abierto, setAbierto] = useState(false);

  const total = ingresosDelMes + gastosDelMes;
  const pctIngresos = total > 0 ? (ingresosDelMes / total) * 100 : 50;

  const desgloseMes = useMemo(() => {
    const map: Record<string, { ingreso: number; gasto: number }> = {};
    transacciones
      .filter(t => t.fecha.startsWith(currentMonth))
      .forEach(t => {
        const cat = t.categoria || 'Sin categoría';
        if (!map[cat]) map[cat] = { ingreso: 0, gasto: 0 };
        if (t.tipo === 'ingreso') map[cat].ingreso += t.monto;
        else map[cat].gasto += t.monto;
      });
    return Object.entries(map).sort((a, b) => (b[1].ingreso + b[1].gasto) - (a[1].ingreso + a[1].gasto));
  }, [transacciones, currentMonth]);

  if (total === 0) {
    return (
      <div className="rounded-xl p-3" style={{ background: 'rgba(201,148,26,0.07)', border: '1px solid rgba(201,148,26,0.2)' }}>
        <span className="sys-label block mb-1">NETO MES</span>
        <p className="text-[13px] font-black sys-value" style={{ color: 'var(--text-tertiary)' }}>Sin datos</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: netMes >= 0 ? 'rgba(201,148,26,0.07)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${netMes >= 0 ? 'rgba(201,148,26,0.2)' : 'rgba(239,68,68,0.15)'}`,
    }}>
      <button className="w-full p-3 text-left" onClick={() => setAbierto(!abierto)}>
        <div className="flex items-center justify-between mb-1">
          <span className="sys-label">NETO MES</span>
          {desgloseMes.length > 0 && (
            abierto ? <ChevronUp size={10} className="text-white/30" /> : <ChevronDown size={10} className="text-white/30" />
          )}
        </div>
        <p className="text-[13px] font-black sys-value truncate mb-2" style={{ color: netMes >= 0 ? 'var(--honey-bright)' : '#f87171' }}>
          {netMes >= 0 ? '+' : ''}{netMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
        </p>
        {/* Barra proporción */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.2)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#10B981' }}
            initial={{ width: 0 }}
            animate={{ width: `${pctIngresos}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="sys-label text-emerald-400">{pctIngresos.toFixed(0)}% ingresos</span>
          <span className="sys-label text-red-400">{(100 - pctIngresos).toFixed(0)}% gastos</span>
        </div>
      </button>

      <AnimatePresence>
        {abierto && desgloseMes.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="sys-label pt-2 mb-1">POR CATEGORÍA</p>
              {desgloseMes.map(([cat, vals]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                  <div className="flex gap-2">
                    {vals.ingreso > 0 && <span className="text-[10px] font-black text-emerald-400">+${vals.ingreso.toLocaleString('es-AR')}</span>}
                    {vals.gasto > 0 && <span className="text-[10px] font-black text-red-400">-${vals.gasto.toLocaleString('es-AR')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Capital() {
  const { balanceCalculado, transacciones: allTransacciones, ideas, agregarTransaccion } = useApp();
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [showModal, setShowModal] = useState<ModalTipo>(null);

  const transacciones = filtroCategoria === 'todas'
    ? allTransacciones
    : filtroCategoria === 'sin-categoria'
      ? allTransacciones.filter(t => !t.categoria)
      : allTransacciones.filter(t => t.categoria === filtroCategoria);

  const todasCategorias = Array.from(new Set(allTransacciones.map(t => t.categoria).filter(Boolean)));

  const currentMonth = new Date().toISOString().slice(0, 7);
  const ingresosDelMes = allTransacciones
    .filter(t => t.tipo === 'ingreso' && t.fecha.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.monto, 0);
  const gastosDelMes = allTransacciones
    .filter(t => t.tipo === 'gasto' && t.fecha.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.monto, 0);
  const netMes = ingresosDelMes - gastosDelMes;

  const valorPipeline = ideas.reduce((acc, i) => acc + (i.valorEstimado || 0), 0);
  const potencialMensual = ideas
    .filter(i => i.estado === 'ejecucion')
    .reduce((acc, i) => acc + (i.potencialMensual || 0), 0);

  const handleGuardar = (tipo: NonNullable<ModalTipo>, data: { monto: number; categoria: string; descripcion: string; fecha: string }) => {
    agregarTransaccion({ tipo, monto: data.monto, categoria: data.categoria, descripcion: data.descripcion });
  };

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
            {/* INGRESOS — tappable */}
            <button
              onClick={() => setShowModal('ingreso')}
              className="rounded-xl p-3 text-left transition-all active:scale-95 group"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="sys-label">INGRESOS</span>
                <Plus size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[13px] font-black sys-value text-emerald-400 truncate">
                +${ingresosDelMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </button>

            {/* GASTOS — tappable */}
            <button
              onClick={() => setShowModal('gasto')}
              className="rounded-xl p-3 text-left transition-all active:scale-95 group"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="sys-label">GASTOS</span>
                <Plus size={10} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[13px] font-black sys-value text-red-400 truncate">
                -${gastosDelMes.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </button>

            {/* NETO MES — con desglose */}
            <NetoMesCard
              ingresosDelMes={ingresosDelMes}
              gastosDelMes={gastosDelMes}
              netMes={netMes}
              transacciones={allTransacciones}
              currentMonth={currentMonth}
            />
          </div>
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowModal('ingreso')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}
        >
          <ArrowDownLeft size={13} /> Agregar ingreso
        </button>
        <button
          onClick={() => setShowModal('gasto')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
        >
          <ArrowUpRight size={13} /> Agregar gasto
        </button>
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
          <span className="sys-label">{allTransacciones.length} TOTAL</span>
        </div>

        {todasCategorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['todas', ...todasCategorias, 'sin-categoria'].map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full font-bold transition-all"
                style={{
                  fontSize: 9, letterSpacing: '0.07em',
                  background: filtroCategoria === cat ? 'rgba(201,148,26,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${filtroCategoria === cat ? 'rgba(201,148,26,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: filtroCategoria === cat ? 'var(--honey-bright)' : 'var(--text-tertiary)',
                }}
              >
                {cat === 'todas' ? 'TODAS' : cat === 'sin-categoria' ? 'SIN CATEGORÍA' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {transacciones.length === 0 ? (
            <div className="bm-card p-8 text-center space-y-3">
              <p className="text-3xl">💸</p>
              <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Sin movimientos todavía</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Usá la voz: <span style={{ color: 'var(--honey-bright)' }}>"Gasté 5000 en marketing"</span>
                <br />o tocá los botones de arriba.
              </p>
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
                t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'
              )} style={{
                background: t.tipo === 'ingreso' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${t.tipo === 'ingreso' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {t.tipo === 'ingreso' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] tracking-tight truncate">{t.descripcion || 'Sin descripción'}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {t.categoria
                    ? <span className="sys-label" style={{ color: 'var(--text-tertiary)' }}>{t.categoria}</span>
                    : <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.25)' }}>
                        Categorizar
                      </span>
                  }
                  <span className="text-white/10">·</span>
                  <span className="sys-label">{format(new Date(t.fecha), "dd MMM").toUpperCase()}</span>
                </div>
              </div>

              <p className={cn('font-black text-[15px] sys-value shrink-0', t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400')}>
                {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {transacciones.length === 0 && allTransacciones.length > 0 && (
        <div className="bm-card p-6 text-center">
          <p className="sys-label">SIN MOVIMIENTOS EN ESTA CATEGORÍA</p>
        </div>
      )}

      {/* Modales */}
      <AnimatePresence>
        {showModal && (
          <TransaccionModal
            tipo={showModal}
            onClose={() => setShowModal(null)}
            onGuardar={(data) => handleGuardar(showModal, data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
