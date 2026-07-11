import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, SkipForward, RotateCcw, ChevronRight, Pause, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { hablarConCallback } from '../services/voiceService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getPatterns, generatePatterns } from '../services/patternService';
import { obtenerCheckInRelacionalDelDia } from '../services/optimizacionService';

const BRIEFING_KEY = 'domex_briefing_';

function getBriefingKey() {
  return BRIEFING_KEY + new Date().toISOString().split('T')[0];
}

function getBriefingConfig() {
  try {
    return JSON.parse(localStorage.getItem('domex_briefing_config') || '{"enabled":true,"horaInicio":5,"horaFin":11}');
  } catch {
    return { enabled: true, horaInicio: 5, horaFin: 11 };
  }
}

function esVentanaBriefing(): boolean {
  const cfg = getBriefingConfig();
  if (!cfg.enabled) return false;
  const hora = new Date().getHours();
  return hora >= cfg.horaInicio && hora < cfg.horaFin;
}

interface Props {
  onClose: () => void;
}

type Estado = 'listo' | 'reproduciendo' | 'pausado' | 'terminado';

export default function BriefingMatutino({ onClose }: Props) {
  const { tareas, mercado, agenda, personasImportantes, energyEntries, hormoneEntries, memoryEntries } = useApp();
  const { profile } = useUserProfile();
  const [estado, setEstado] = useState<Estado>('listo');
  const [lineaActiva, setLineaActiva] = useState(-1);
  const stopRef = useRef<(() => void) | null>(null);
  const [patternInsight, setPatternInsight] = useState('');
  const [checkInRelacional, setCheckInRelacional] = useState('');
  const [recursoCrisis, setRecursoCrisis] = useState('');

  const nombre = profile.identity.nombre || 'vos';
  useEffect(() => {
    const cached = getPatterns();
    if (cached?.insight) {
      setPatternInsight(cached.insight);
    } else {
      generatePatterns(nombre)
        .then(p => { if (p.insight) setPatternInsight(p.insight); })
        .catch(() => {});
    }
  }, [nombre]);

  // Máximo 1 check-in relacional proactivo por día (ver optimizacionService.ts).
  useEffect(() => {
    obtenerCheckInRelacionalDelDia({ personas: personasImportantes, energyEntries, hormoneEntries, memoryEntries })
      .then(resultado => {
        if (resultado.crisis && resultado.recurso) {
          setRecursoCrisis(`Si necesitás hablar con alguien ahora: ${resultado.recurso.nombre}, ${resultado.recurso.telefono}.`);
        } else if (resultado.correlaciones[0]) {
          setCheckInRelacional(resultado.correlaciones[0].pregunta);
        }
      })
      .catch(() => {});
  }, []);

  const ahora = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const horaActual = format(new Date(), 'HH:mm');

  const tareasFoco = tareas
    .filter(t => t.esFoco && !t.completada)
    .slice(0, 3);

  const btc = mercado.find(m => m.simbolo === 'BTC');
  const eth = mercado.find(m => m.simbolo === 'ETH');

  const proximaReunion = agenda
    .filter(a => {
      const dt = new Date(`${a.fecha}T${a.hora}`);
      return dt > new Date();
    })
    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())[0];

  const horaNum = new Date().getHours();
  const saludo = horaNum >= 5 && horaNum < 12 ? 'Buenos días' : horaNum >= 12 && horaNum < 19 ? 'Buenas tardes' : 'Buenas noches';

  const lineas = [
    `${saludo}, ${nombre}. Son las ${horaActual} del ${ahora}.`,
    tareasFoco.length > 0
      ? `Tenés ${tareasFoco.length} tarea${tareasFoco.length > 1 ? 's' : ''} clave hoy: ${tareasFoco.map(t => t.titulo).join(', ')}.`
      : 'No tenés tareas críticas pendientes hoy.',
    btc
      ? `Mercado: Bitcoin ${btc.cambio >= 0 ? 'subió' : 'bajó'} un ${Math.abs(btc.cambio)}%${eth ? `. Ethereum ${eth.cambio >= 0 ? '+' : ''}${eth.cambio}%` : ''}.`
      : 'Mercado sin datos disponibles.',
    proximaReunion
      ? `Próxima reunión: ${proximaReunion.titulo} a las ${proximaReunion.hora}${proximaReunion.personas.length ? ` con ${proximaReunion.personas.join(', ')}` : ''}.`
      : '',
    patternInsight || '',
    recursoCrisis || checkInRelacional || '',
    '¿Arrancamos?',
  ].filter(Boolean);

  const textoCompleto = lineas.join(' ');

  const reproducir = () => {
    setEstado('reproduciendo');
    setLineaActiva(0);

    let lineaIdx = 0;
    const intervalId = setInterval(() => {
      lineaIdx++;
      if (lineaIdx < lineas.length) {
        setLineaActiva(lineaIdx);
      } else {
        clearInterval(intervalId);
      }
    }, Math.floor((textoCompleto.length / lineas.length) * 60));

    hablarConCallback(
      textoCompleto,
      () => {},
      () => {
        clearInterval(intervalId);
        setEstado('terminado');
        setLineaActiva(-1);
      }
    );

    stopRef.current = () => {
      clearInterval(intervalId);
      window.speechSynthesis.cancel();
    };
  };

  const pausar = () => {
    window.speechSynthesis.pause();
    setEstado('pausado');
  };

  const reanudar = () => {
    window.speechSynthesis.resume();
    setEstado('reproduciendo');
  };

  const saltar = () => {
    stopRef.current?.();
    cerrar();
  };

  const repetir = () => {
    stopRef.current?.();
    window.speechSynthesis.cancel();
    setEstado('listo');
    setLineaActiva(-1);
  };

  const cerrar = () => {
    localStorage.setItem(getBriefingKey(), '1');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0F] overflow-hidden"
    >
      {/* Orbes animados de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(212,144,10,0.08)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center gap-8">
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-1">Sistema operativo personal</p>
          <h1 className="text-3xl font-black italic tracking-tighter">AICOLMENA</h1>
        </motion.div>

        {/* Wave animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-1 h-12"
        >
          {estado === 'reproduciendo' ? (
            [0.3, 0.6, 1, 0.6, 0.3, 0.6, 1, 0.6, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
                className="w-1.5 bg-primary rounded-full h-8 origin-center"
              />
            ))
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Volume2 size={28} className="text-primary" />
            </div>
          )}
        </motion.div>

        {/* Líneas de briefing */}
        <div className="w-full space-y-3 min-h-[160px]">
          <AnimatePresence>
            {lineas.map((linea, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: lineaActiva === idx ? 1 : estado === 'terminado' ? 0.6 : 0.25 }}
                className="text-[15px] leading-relaxed font-medium text-center"
                style={{
                  color: lineaActiva === idx ? 'white' : undefined,
                }}
              >
                {linea}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* Botones */}
        <div className="w-full space-y-3">
          {estado === 'terminado' ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={cerrar}
              className="w-full py-4 rounded-2xl bg-primary font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
            >
              Al dashboard
              <ChevronRight size={18} />
            </motion.button>
          ) : estado === 'listo' ? (
            <button
              onClick={reproducir}
              className="w-full py-4 rounded-2xl bg-primary font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
            >
              <Volume2 size={18} />
              Reproducir briefing
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={repetir}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
              >
                <RotateCcw size={14} />
                Repetir
              </button>
              <button
                onClick={estado === 'pausado' ? reanudar : pausar}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
              >
                {estado === 'pausado' ? <Play size={14} /> : <Pause size={14} />}
                {estado === 'pausado' ? 'Continuar' : 'Pausar'}
              </button>
              <button
                onClick={saltar}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
              >
                <SkipForward size={14} />
                Saltar
              </button>
            </div>
          )}

          {estado !== 'terminado' && (
            <button
              onClick={cerrar}
              className="w-full py-2 text-[11px] text-white/20 font-bold uppercase tracking-widest hover:text-white/40 transition-colors"
            >
              No mostrar hoy
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function useBriefing() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(getBriefingKey()) && esVentanaBriefing()) {
      const timer = setTimeout(() => setMostrar(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    mostrar,
    cerrar: () => setMostrar(false),
    repetir: () => setMostrar(true), // re-abre sin verificar el flag del día
  };
}
