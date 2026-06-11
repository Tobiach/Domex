import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Utensils, Brain, ChevronRight, Flame, Zap, Battery, Activity, Scale, Map, Library, Quote, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { generarCitaDiaria } from '../services/wisdomService';
import type { WisdomQuote } from '../types';

export default function Conciencia() {
  const navigate = useNavigate();
  const { learningCategories, mealEntries, memoryEntries, energyEntries, hormoneEntries, energyBalanceEntries,
    learningPaths, podcastEntries, bookEntries, debateEntries, wisdomQuotes, agregarWisdom, actualizarReflexionWisdom } = useApp();
  const { profile } = useUserProfile();
  const [wisdomCargando, setWisdomCargando] = useState(false);
  const [reflexionWisdom, setReflexionWisdom] = useState('');

  const hoy = new Date().toISOString().split('T')[0];
  const totalRacha = learningCategories.reduce((sum, c) => sum + c.racha, 0);
  const comidashoy = mealEntries.filter(m => m.creadoEn.startsWith(hoy)).length;
  const memoriaHoy = memoryEntries.find(e => e.fecha === hoy);
  const energiaHoy = energyEntries.find(e => e.fecha === hoy);
  const hormonaHoy = hormoneEntries.find(e => e.fecha === hoy);
  const balanceHoy = energyBalanceEntries.find(e => e.fecha === hoy);
  const wisdomHoy = wisdomQuotes.find(w => w.fecha === hoy);
  const pathsActivos = learningPaths.filter(p => p.semanasCompletadas < p.duracion).length;

  const generarWisdom = async () => {
    setWisdomCargando(true);
    try {
      const data = await generarCitaDiaria(profile.identity.nombre);
      const quote: WisdomQuote = { id: `wisdom_${Date.now()}`, ...data, guardado: false, creadoEn: new Date().toISOString() };
      agregarWisdom(quote);
    } catch { /* silencioso */ }
    setWisdomCargando(false);
  };

  // Auto-generar cita si no hay una hoy
  useEffect(() => {
    if (!wisdomHoy && !wisdomCargando) generarWisdom();
  }, []);

  const caloriasHoy = mealEntries
    .filter(m => m.creadoEn.startsWith(hoy))
    .reduce((s, m) => s + m.calorias, 0);
  const azucarHoy = mealEntries
    .filter(m => m.creadoEn.startsWith(hoy))
    .reduce((s, m) => s + m.azucar, 0);

  const MODULES = [
    {
      label: 'APRENDIZAJE',
      sublabel: learningCategories.length > 0
        ? `${learningCategories.length} categorías · 🔥${totalRacha}d racha total`
        : 'Sin categorías — creá la primera',
      color: '#6366F1',
      icon: BookOpen,
      path: '/conciencia/aprender',
      stat: learningCategories.length > 0 ? `${totalRacha}d` : '—',
      statLabel: 'RACHA',
    },
    {
      label: 'NUTRICIÓN',
      sublabel: comidashoy > 0
        ? `Hoy: ${comidashoy} comidas · ${caloriasHoy} kcal · ${azucarHoy}g azúcar`
        : 'Ninguna comida registrada hoy',
      color: '#10B981',
      icon: Utensils,
      path: '/conciencia/nutricion',
      stat: comidashoy > 0 ? `${caloriasHoy}` : '—',
      statLabel: 'KCAL HOY',
    },
    {
      label: 'MEMORIA',
      sublabel: memoriaHoy
        ? `Check-in hoy: ${memoriaHoy.score}/10`
        : 'Sin check-in hoy',
      color: '#8B5CF6',
      icon: Brain,
      path: '/conciencia/memoria',
      stat: memoriaHoy ? `${memoriaHoy.score}/10` : '—',
      statLabel: 'HOY',
    },
    {
      label: 'ENERGÍA',
      sublabel: energiaHoy
        ? `Score hoy: ${energiaHoy.score}/10 · ${energiaHoy.factores.sueno}h sueño`
        : 'Sin check-in de energía hoy',
      color: '#F59E0B',
      icon: Battery,
      path: '/conciencia/energia',
      stat: energiaHoy ? `${energiaHoy.score}/10` : '—',
      statLabel: 'ENERGÍA',
    },
    {
      label: 'HORMONAS',
      sublabel: hormonaHoy
        ? `T:${hormonaHoy.scores.T} · C:${hormonaHoy.scores.C} · D:${hormonaHoy.scores.D}`
        : 'Sin check-in hormonal hoy',
      color: '#8B5CF6',
      icon: Activity,
      path: '/conciencia/hormonas',
      stat: hormonaHoy ? `${hormonaHoy.scores.T}` : '—',
      statLabel: 'T-SCORE',
    },
    {
      label: 'BALANCE M/F',
      sublabel: balanceHoy
        ? `Hoy: energía ${balanceHoy.tipo.toUpperCase()}`
        : 'Sin check-in de balance hoy',
      color: '#EC4899',
      icon: Scale,
      path: '/conciencia/balance',
      stat: balanceHoy ? balanceHoy.tipo.slice(0, 3).toUpperCase() : '—',
      statLabel: 'HOY',
    },
    {
      label: 'PATHS',
      sublabel: learningPaths.length > 0
        ? `${pathsActivos} activo${pathsActivos !== 1 ? 's' : ''} · ${learningPaths.length} total`
        : 'Sin learning paths creados',
      color: '#6366F1',
      icon: Map,
      path: '/conciencia/paths',
      stat: learningPaths.length > 0 ? `${pathsActivos}` : '—',
      statLabel: 'ACTIVOS',
    },
    {
      label: 'BIBLIOTECA',
      sublabel: (podcastEntries.length + bookEntries.length) > 0
        ? `${podcastEntries.length} podcasts · ${bookEntries.length} libros`
        : 'Sin podcasts ni libros agregados',
      color: '#F97316',
      icon: Library,
      path: '/conciencia/biblioteca',
      stat: (podcastEntries.length + bookEntries.length) > 0 ? `${podcastEntries.length + bookEntries.length}` : '—',
      statLabel: 'ITEMS',
    },
    {
      label: 'DEBATE',
      sublabel: debateEntries.length > 0
        ? `${debateEntries.length} debate${debateEntries.length !== 1 ? 's' : ''} · ${debateEntries.filter(d => d.reflexionUsuario).length} reflexionados`
        : 'Sin debates registrados',
      color: '#8B5CF6',
      icon: Scale,
      path: '/conciencia/debate',
      stat: debateEntries.length > 0 ? `${debateEntries.length}` : '—',
      statLabel: 'DEBATES',
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-2">

      <header className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="live-dot" style={{ background: '#8B5CF6', boxShadow: '0 0 6px #8B5CF6' }} />
            <span className="sys-label">CONCIENCIA INTEGRAL</span>
          </div>
          <h1 className="text-[22px] font-black tracking-tight uppercase">Centro de Desarrollo</h1>
        </div>
        <Zap size={20} style={{ color: '#8B5CF6', opacity: 0.5 }} />
      </header>

      {/* Wisdom del día */}
      {wisdomHoy ? (
        <div className="bm-card p-4 space-y-3" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-2">
            <Quote size={12} style={{ color: '#F59E0B' }} />
            <span className="sys-label" style={{ color: '#F59E0B' }}>SABIDURÍA DEL DÍA</span>
          </div>
          <p className="text-[14px] font-semibold leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.85)' }}>
            "{wisdomHoy.cita}"
          </p>
          <p className="sys-label" style={{ color: '#F59E0B' }}>— {wisdomHoy.autor}</p>
          {wisdomHoy.reflexionUsuario ? (
            <p className="text-[11px] text-white/40 italic">{wisdomHoy.reflexionUsuario}</p>
          ) : (
            <div className="space-y-2">
              <input
                value={reflexionWisdom}
                onChange={e => setReflexionWisdom(e.target.value)}
                placeholder="Tu reflexión (opcional)..."
                className="w-full px-3 py-2 rounded-lg text-[12px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'white' }}
              />
              {reflexionWisdom.trim() && (
                <button
                  onClick={() => { actualizarReflexionWisdom(wisdomHoy.id, reflexionWisdom); setReflexionWisdom(''); }}
                  className="sys-label px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  GUARDAR REFLEXIÓN
                </button>
              )}
            </div>
          )}
        </div>
      ) : wisdomCargando ? (
        <div className="bm-card p-4 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" style={{ color: '#F59E0B' }} />
          <span className="sys-label" style={{ color: '#F59E0B' }}>GENERANDO SABIDURÍA DEL DÍA...</span>
        </div>
      ) : null}

      <div className="space-y-3">
        {MODULES.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.button
              key={mod.path}
              onClick={() => navigate(mod.path)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="w-full bm-card p-4 flex items-center gap-4 text-left relative overflow-hidden group"
              style={{ '--bm-accent': mod.color } as React.CSSProperties}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: mod.color }} />

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}28` }}
              >
                <Icon size={18} style={{ color: mod.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="sys-label" style={{ color: mod.color, opacity: 1 }}>{mod.label}</span>
                </div>
                <p className="text-[11px] text-white/40 font-medium leading-snug">{mod.sublabel}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[18px] font-black sys-value" style={{ color: mod.color }}>{mod.stat}</p>
                <span className="sys-label">{mod.statLabel}</span>
              </div>

              <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {learningCategories.length === 0 && mealEntries.length === 0 && !memoriaHoy && (
        <div className="bm-card p-6 text-center space-y-3">
          <Flame size={28} style={{ color: '#8B5CF6', margin: '0 auto' }} />
          <p className="text-[13px] font-bold">Empezá tu desarrollo integral</p>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Aprendizaje, nutrición y memoria funcionan en conjunto.
            Cada módulo alimenta al siguiente.
          </p>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}
