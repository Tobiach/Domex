import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Plus, X, Loader2, AlertTriangle, CheckCircle2, Barcode, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MealEntry } from '../types';
import { analizarComida } from '../services/nutritionService';

interface ProductoBarcode {
  nombre: string;
  calorias: number;
  proteina: number;
  carbohidratos: number;
  grasas: number;
  imagen?: string;
}

async function fetchBarcode(barcode: string): Promise<ProductoBarcode | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,nutriments,image_url`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;
    const n = data.product?.nutriments ?? {};
    return {
      nombre: data.product?.product_name || 'Producto sin nombre',
      calorias: Math.round(n['energy-kcal_100g'] ?? 0),
      proteina: Math.round(n.proteins_100g ?? 0),
      carbohidratos: Math.round(n.carbohydrates_100g ?? 0),
      grasas: Math.round(n.fat_100g ?? 0),
      imagen: data.product?.image_url,
    };
  } catch {
    return null;
  }
}

const TIPOS: MealEntry['tipo'][] = ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'];
const TIPO_LABELS: Record<MealEntry['tipo'], string> = {
  desayuno: 'DESAYUNO', almuerzo: 'ALMUERZO',
  merienda: 'MERIENDA', cena: 'CENA', snack: 'SNACK',
};

const COLOR_PROCESADA: Record<string, string> = {
  natural: '#10B981',
  'semi-procesada': '#F59E0B',
  ultraprocesada: '#EF4444',
};

function calcScore(meals: MealEntry[]): number {
  if (meals.length === 0) return 0;
  const azucarTotal = meals.reduce((s, m) => s + m.azucar, 0);
  const ultraprocesadas = meals.filter(m => m.procesada === 'ultraprocesada').length;
  const naturales = meals.filter(m => m.procesada === 'natural').length;
  const azucarScore = Math.max(0, 100 - (azucarTotal / 50) * 40);
  const naturalScore = (naturales / meals.length) * 30;
  const upScore = Math.max(0, 30 - (ultraprocesadas / meals.length) * 30);
  return Math.min(100, Math.round(azucarScore * 0.4 + naturalScore + upScore));
}

export default function Nutricion() {
  const navigate = useNavigate();
  const { mealEntries, registrarComida } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [modoEntrada, setModoEntrada] = useState<'descripcion' | 'barcode'>('descripcion');
  const [tipo, setTipo] = useState<MealEntry['tipo']>('almuerzo');
  const [descripcion, setDescripcion] = useState('');
  const [analizando, setAnalizando] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [buscandoBarcode, setBuscandoBarcode] = useState(false);
  const [productoBarcode, setProductoBarcode] = useState<ProductoBarcode | null>(null);
  const [errorBarcode, setErrorBarcode] = useState('');

  const hoy = new Date().toISOString().split('T')[0];
  const mealshoy = mealEntries.filter(m => m.creadoEn.startsWith(hoy));
  const score = calcScore(mealshoy);
  const caloriasTotal = mealshoy.reduce((s, m) => s + m.calorias, 0);
  const azucarTotal = mealshoy.reduce((s, m) => s + m.azucar, 0);
  const proteinaTotal = mealshoy.reduce((s, m) => s + m.proteina, 0);
  const scoreColor = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  const handleRegistrar = async () => {
    if (!descripcion.trim()) return;
    setAnalizando(true);
    try {
      const analisis = await analizarComida(descripcion.trim());
      const meal: MealEntry = {
        id: `meal_${Date.now()}`,
        timestamp: new Date().toISOString(),
        tipo,
        descripcion: descripcion.trim(),
        calorias: analisis.calorias,
        azucar: analisis.azucar,
        proteina: analisis.proteina,
        procesada: analisis.procesada,
        analisisIA: analisis.analisisIA,
        creadoEn: new Date().toISOString(),
      };
      registrarComida(meal);
      setDescripcion('');
      setShowForm(false);
    } catch {
      const meal: MealEntry = {
        id: `meal_${Date.now()}`,
        timestamp: new Date().toISOString(),
        tipo,
        descripcion: descripcion.trim(),
        calorias: 0, azucar: 0, proteina: 0,
        procesada: 'natural',
        analisisIA: 'Sin análisis disponible.',
        creadoEn: new Date().toISOString(),
      };
      registrarComida(meal);
      setDescripcion('');
      setShowForm(false);
    } finally {
      setAnalizando(false);
    }
  };

  const handleBuscarBarcode = async () => {
    if (!barcode.trim()) return;
    setBuscandoBarcode(true);
    setErrorBarcode('');
    setProductoBarcode(null);
    const producto = await fetchBarcode(barcode.trim());
    setBuscandoBarcode(false);
    if (!producto) { setErrorBarcode('Producto no encontrado. Verificá el código.'); return; }
    setProductoBarcode(producto);
  };

  const handleRegistrarBarcode = () => {
    if (!productoBarcode) return;
    const meal: MealEntry = {
      id: `meal_${Date.now()}`,
      timestamp: new Date().toISOString(),
      tipo,
      descripcion: productoBarcode.nombre,
      calorias: productoBarcode.calorias,
      azucar: 0,
      proteina: productoBarcode.proteina,
      procesada: 'semi-procesada',
      analisisIA: `Macros por 100g: ${productoBarcode.calorias}kcal · ${productoBarcode.proteina}g prot · ${productoBarcode.carbohidratos}g carb · ${productoBarcode.grasas}g grasas`,
      creadoEn: new Date().toISOString(),
    };
    registrarComida(meal);
    setBarcode(''); setProductoBarcode(null); setShowForm(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 pb-2">
        <header className="flex items-center justify-between pt-1">
          <div>
            <button onClick={() => navigate('/conciencia')} className="flex items-center gap-1 sys-label hover:opacity-70 transition-opacity mb-1.5">
              ← CONCIENCIA
            </button>
            <h1 className="text-[22px] font-black tracking-tight uppercase">Nutrición</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#10B98118', border: '1px solid #10B98130' }}
          >
            <Plus size={16} style={{ color: '#10B981' }} />
          </button>
        </header>

        {/* Score del día */}
        <div className="bm-card p-4 relative overflow-hidden">
          <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: scoreColor }} />
          <div className="flex items-center gap-2 mb-3">
            <div className="live-dot" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            <span className="sys-label">NUTRICIÓN HOY</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'SCORE', val: `${score}`, unit: '/100', color: scoreColor },
              { label: 'KCAL', val: `${caloriasTotal}`, unit: '', color: 'white' },
              { label: 'AZÚCAR', val: `${azucarTotal}g`, unit: azucarTotal > 50 ? ' ⚠' : '', color: azucarTotal > 50 ? '#F59E0B' : 'white' },
              { label: 'PROTEÍNA', val: `${proteinaTotal}g`, unit: '', color: 'white' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-[16px] font-black sys-value" style={{ color: stat.color }}>
                  {stat.val}<span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{stat.unit}</span>
                </p>
                <span className="sys-label">{stat.label}</span>
              </div>
            ))}
          </div>
          {azucarTotal > 50 && (
            <div className="flex items-center gap-2 mt-3 p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertTriangle size={11} style={{ color: '#F59E0B' }} />
              <span className="text-[10px] font-medium" style={{ color: '#F59E0B' }}>
                {azucarTotal}g azúcar · Límite recomendado: 50g
              </span>
            </div>
          )}
        </div>

        {/* Historial de hoy */}
        <div className="space-y-2">
          {mealshoy.length === 0 && (
            <div className="bm-card p-6 text-center">
              <Utensils size={20} style={{ color: '#10B981', margin: '0 auto', opacity: 0.3 }} className="mb-3" />
              <p className="sys-label">SIN COMIDAS REGISTRADAS HOY</p>
            </div>
          )}
          {mealshoy.map((meal, i) => {
            const procColor = COLOR_PROCESADA[meal.procesada] ?? 'white';
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bm-card p-4 relative overflow-hidden"
              >
                <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: procColor }} />
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="sys-label" style={{ color: procColor, opacity: 1 }}>
                        {TIPO_LABELS[meal.tipo]}
                      </span>
                      <span className="sys-label">· {new Date(meal.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[13px] font-bold leading-snug mb-1">{meal.descripcion}</p>
                    <p className="text-[11px] text-white/40 italic">{meal.analisisIA}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-[12px] font-black sys-value">{meal.calorias} <span className="text-[8px] text-white/30">kcal</span></p>
                    <p className="sys-label">{meal.azucar}g azúcar</p>
                    <p className="sys-label">{meal.proteina}g prot</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="h-20" />
      </div>

      {/* Sheet: registrar comida */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
              style={{ background: '#07070F', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', borderRadius: '22px 22px 0 0' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="px-6 pb-10 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="sys-label" style={{ color: '#10B981', opacity: 1 }}>REGISTRAR COMIDA</span>
                  <button onClick={() => { setShowForm(false); setProductoBarcode(null); setBarcode(''); setErrorBarcode(''); }}>
                    <X size={14} className="text-white/30" />
                  </button>
                </div>

                {/* Mode selector */}
                <div className="flex gap-2">
                  {[
                    { key: 'descripcion', label: 'Descripción', Icon: Utensils },
                    { key: 'barcode', label: 'Código de barras', Icon: ScanLine },
                  ].map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => setModoEntrada(key as any)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                      style={{
                        background: modoEntrada === key ? '#10B98118' : 'rgba(255,255,255,0.03)',
                        border: modoEntrada === key ? '1px solid #10B98140' : '1px solid rgba(255,255,255,0.07)',
                        color: modoEntrada === key ? '#10B981' : 'rgba(255,255,255,0.3)',
                      }}>
                      <Icon size={11} />{label}
                    </button>
                  ))}
                </div>

                {/* Tipo selector (both modes) */}
                <div className="flex gap-2 flex-wrap">
                  {TIPOS.map(t => (
                    <button key={t} onClick={() => setTipo(t)}
                      className="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                      style={{
                        background: tipo === t ? '#10B98118' : 'rgba(255,255,255,0.04)',
                        border: tipo === t ? '1px solid #10B98140' : '1px solid rgba(255,255,255,0.07)',
                        color: tipo === t ? '#10B981' : 'rgba(255,255,255,0.3)',
                      }}>
                      {TIPO_LABELS[t]}
                    </button>
                  ))}
                </div>

                {modoEntrada === 'descripcion' ? (
                  <>
                    <textarea
                      value={descripcion}
                      onChange={e => setDescripcion(e.target.value)}
                      placeholder='Ej: "2 huevos, tostada integral, café con leche"'
                      rows={3}
                      className="w-full rounded-xl p-3 text-[13px] text-white bg-transparent resize-none outline-none"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <button
                      onClick={handleRegistrar}
                      disabled={analizando || !descripcion.trim()}
                      className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{ background: '#10B981', color: '#fff' }}
                    >
                      {analizando
                        ? <><Loader2 size={13} className="animate-spin" /> ANALIZANDO CON IA...</>
                        : <><CheckCircle2 size={12} /> REGISTRAR Y ANALIZAR</>
                      }
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={barcode}
                        onChange={e => setBarcode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={e => e.key === 'Enter' && handleBuscarBarcode()}
                        placeholder="Ingresá el código (ej: 7790895000064)"
                        className="flex-1 rounded-xl px-4 py-3 text-[13px] text-white bg-transparent outline-none"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <button
                        onClick={handleBuscarBarcode}
                        disabled={buscandoBarcode || !barcode.trim()}
                        className="px-4 rounded-xl font-black text-[10px] transition-all disabled:opacity-40"
                        style={{ background: '#10B981', color: '#fff' }}
                      >
                        {buscandoBarcode ? <Loader2 size={14} className="animate-spin" /> : 'BUSCAR'}
                      </button>
                    </div>

                    {errorBarcode && (
                      <p className="text-[11px]" style={{ color: 'var(--danger)' }}>{errorBarcode}</p>
                    )}

                    {productoBarcode && (
                      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        {productoBarcode.imagen && (
                          <img src={productoBarcode.imagen} alt={productoBarcode.nombre} className="w-16 h-16 object-contain mx-auto rounded-lg" />
                        )}
                        <p className="font-black text-[14px] text-center">{productoBarcode.nombre}</p>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { l: 'KCAL', v: productoBarcode.calorias },
                            { l: 'PROT', v: `${productoBarcode.proteina}g` },
                            { l: 'CARB', v: `${productoBarcode.carbohidratos}g` },
                            { l: 'GRAS', v: `${productoBarcode.grasas}g` },
                          ].map(x => (
                            <div key={x.l}>
                              <p className="font-black text-[13px]" style={{ color: '#10B981' }}>{x.v}</p>
                              <p className="sys-label">{x.l}</p>
                            </div>
                          ))}
                        </div>
                        <p className="sys-label text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Macros por 100g · Open Food Facts</p>
                        <button
                          onClick={handleRegistrarBarcode}
                          className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest"
                          style={{ background: '#10B981', color: '#fff' }}
                        >
                          REGISTRAR ESTE PRODUCTO
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
