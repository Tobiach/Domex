import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useStreaks } from '../hooks/useStreaks';
import { useVoiceEngine } from '../hooks/useVoiceEngine';
import { VoicePanel } from './Voice/VoicePanel';
import { hablarConCallback, detenerVoz, unlockAudio } from '../services/voiceService';
import { UserContext, VoiceIntelligenceResult, DESTINO_ROUTES, CONFIDENCE_THRESHOLD } from '../services/voiceProcessor';
import { logEvent } from '../services/eventLog';

// ─── Floating Mic Button ─────────────────────────────────────────────────────

export default function FloatingMicButton() {
  const {
    tareas,
    mercado,
    agenda,
    noticiasLeidas,
    agregarTarea,
    agregarAgenda,
    agregarTransaccion,
    agregarIdea,
    agregarHabito,
    agregarContacto,
  } = useApp();
  const streak = useStreaks();
  const navigate = useNavigate();

  // Ref pattern: siempre refleja las actions más recientes sin re-crear el hook
  const appActionsRef = useRef({
    agregarTarea,
    agregarAgenda,
    agregarTransaccion,
    agregarIdea,
    agregarHabito,
    agregarContacto,
    navigate,
  });
  appActionsRef.current = {
    agregarTarea,
    agregarAgenda,
    agregarTransaccion,
    agregarIdea,
    agregarHabito,
    agregarContacto,
    navigate,
  };

  const buildContext = (): UserContext => {
    const hoy = new Date().toISOString().split('T')[0];
    const btc = mercado.find(m => m.simbolo === 'BTC');
    const eth = mercado.find(m => m.simbolo === 'ETH');
    const ahora = new Date();
    return {
      btcChange: btc?.cambio ?? 0,
      ethChange: eth?.cambio ?? 0,
      todayTasks: tareas
        .filter(t => !t.completada && (t.esFoco || t.fechaVencimiento?.startsWith(hoy)))
        .slice(0, 5)
        .map(t => ({ titulo: t.titulo, prioridad: t.prioridad })),
      streak,
      nextMeetings: agenda
        .filter(a => new Date(`${a.fecha}T${a.hora}`) > ahora)
        .sort((a, b) =>
          new Date(`${a.fecha}T${a.hora}`).getTime() -
          new Date(`${b.fecha}T${b.hora}`).getTime()
        )
        .slice(0, 3)
        .map(a => ({ title: a.titulo, time: a.hora })),
      newsCount: noticiasLeidas.length,
    };
  };

  const { estado, transcriptLive, transcriptFinal, resultado, errorMsg, iniciar, cancelar, reintentar, dismissarExito } =
    useVoiceEngine(buildContext);

  const handleCancelar = useCallback(() => {
    detenerVoz();
    cancelar();
  }, [cancelar]);

  // Ejecuta las acciones en AppContext cuando la IA retorna un resultado exitoso
  useEffect(() => {
    if (estado !== 'success' || !resultado) return;

    // TTS: panel se cierra al terminar de hablar
    if (resultado.respuestaAlUsuario) {
      hablarConCallback(resultado.respuestaAlUsuario, () => {}, () => dismissarExito(), 1.05);
    } else {
      dismissarExito();
    }

    if (resultado.tipo !== 'COMANDO') return;

    // Si la confianza es muy baja, no ejecutamos el comando
    if (resultado.confianza < CONFIDENCE_THRESHOLD) return;

    logEvent('voz_usado', resultado.categoria);

    const hoy = new Date().toISOString().split('T')[0];
    const manana = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
    const datos = resultado.datos ?? {};
    const actions = appActionsRef.current;

    switch (resultado.categoria) {
      case 'tarea':
        actions.agregarTarea({
          titulo: datos.titulo ?? 'Tarea sin título',
          prioridad: datos.prioridad === 'alta' ? 'alta' : datos.prioridad === 'baja' ? 'baja' : 'media',
          esFoco: datos.prioridad === 'alta',
          fechaVencimiento: datos.fecha ?? hoy,
        });
        break;

      case 'reunion':
        actions.agregarAgenda({
          titulo: datos.titulo ?? 'Reunión',
          personas: datos.personas ?? [],
          fecha: datos.fecha ?? manana,
          hora: datos.hora ?? '10:00',
          contexto: datos.contexto ?? undefined,
          tipo: 'reunion',
        });
        break;

      case 'gasto':
        actions.agregarTransaccion({
          tipo: 'gasto',
          monto: datos.monto ?? 0,
          categoria: datos.contexto ?? 'Otros',
          descripcion: datos.titulo ?? 'Gasto',
        });
        break;

      case 'ingreso':
        actions.agregarTransaccion({
          tipo: 'ingreso',
          monto: datos.monto ?? 0,
          categoria: datos.contexto ?? 'Ventas',
          descripcion: datos.titulo ?? 'Ingreso',
        });
        break;

      case 'idea':
      case 'nota':
        actions.agregarIdea({
          titulo: datos.titulo ?? 'Nueva idea',
          descripcion: datos.contexto ?? datos.titulo ?? '',
          estado: 'idea',
        });
        break;

      case 'habito':
        actions.agregarHabito(
          datos.titulo ?? 'Nuevo hábito',
          datos.icono ?? '⚡'
        );
        break;

      case 'crm':
        actions.agregarContacto({
          nombre: datos.titulo ?? datos.personas?.[0] ?? 'Contacto',
          empresa: datos.empresa ?? datos.tag ?? '',
          estado: 'prospecto',
          valor: 0,
        });
        break;

      case 'navegacion': {
        const destino = datos.destino ?? '';
        const ruta = DESTINO_ROUTES[destino] ?? null;
        if (ruta) actions.navigate(ruta);
        break;
      }
    }
  }, [estado, resultado]);

  // ─── Estilo visual por estado ────────────────────────────────────────────────

  const BTN_STYLES = {
    idle: {
      bg: 'rgba(255,255,255,0.05)',
      border: 'rgba(255,255,255,0.12)',
      glow: undefined,
      icon: 'rgba(255,255,255,0.5)',
    },
    listening: {
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.55)',
      glow: '0 0 22px rgba(239,68,68,0.38)',
      icon: '#EF4444',
    },
    processing: {
      bg: 'rgba(0,212,255,0.08)',
      border: 'rgba(0,212,255,0.35)',
      glow: '0 0 22px rgba(0,212,255,0.28)',
      icon: 'var(--color-accent)',
    },
    success: {
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.5)',
      glow: '0 0 22px rgba(16,185,129,0.38)',
      icon: '#10B981',
    },
    error: {
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.3)',
      glow: undefined,
      icon: '#EF4444',
    },
  } as const;

  const s = BTN_STYLES[estado];
  const panelVisible = estado !== 'idle';

  const handleButtonClick = () => {
    if (estado === 'idle') {
      // Desbloquear audio iOS en el primer tap (debe ser desde un gesto del usuario).
      unlockAudio();
      // Cancelar TTS antes de iniciar reconocimiento — iOS no puede usar
      // reconocimiento de voz y síntesis de audio simultáneamente.
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      iniciar();
    } else if (estado === 'listening') {
      cancelar();
    }
    // otros estados: el usuario actúa sobre el panel
  };

  return (
    <>
      <VoicePanel
        visible={panelVisible}
        estado={estado}
        transcriptLive={transcriptLive}
        transcriptFinal={transcriptFinal}
        resultado={resultado}
        errorMsg={errorMsg}
        onCancelar={handleCancelar}
        onReintentar={reintentar}
      />

      {/* Botón flotante — 56px para cumplir con el mínimo táctil de 44pt iOS */}
      <motion.button
        onClick={handleButtonClick}
        whileTap={{ scale: 0.88 }}
        aria-label={estado === 'idle' ? 'Activar voz' : 'Detener voz'}
        className="fixed bottom-[72px] right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          boxShadow: s.glow,
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      >
        {/* Anillos de pulso — solo durante listening */}
        {estado === 'listening' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(239,68,68,0.18)' }}
              animate={{ scale: [1, 1.65, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.15, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(239,68,68,0.08)' }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.15, repeat: Infinity, delay: 0.35 }}
            />
          </>
        )}

        {/* Ícono */}
        <span className="relative z-10" style={{ color: s.icon, display: 'flex', alignItems: 'center' }}>
          {estado === 'idle'       && <Mic size={22} />}
          {estado === 'listening'  && <MicOff size={22} />}
          {estado === 'processing' && <Loader2 size={22} className="animate-spin" />}
          {estado === 'success'    && <CheckCircle2 size={22} />}
          {estado === 'error'      && <AlertCircle size={22} />}
        </span>
      </motion.button>
    </>
  );
}
