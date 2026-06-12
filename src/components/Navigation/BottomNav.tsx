import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Layers, Mic, BarChart2, User, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVoiceEngine } from '../../hooks/useVoiceEngine';
import { useApp } from '../../context/AppContext';
import { useStreaks } from '../../hooks/useStreaks';
import { hablarConCallback, detenerVoz, unlockAudio } from '../../services/voiceService';
import { UserContext, VoiceIntelligenceResult, DESTINO_ROUTES, CONFIDENCE_THRESHOLD } from '../../services/voiceProcessor';
import { logEvent } from '../../services/eventLog';

const NAV_ITEMS = [
  { icon: Home,      label: 'HOY',      path: '/' },
  { icon: Layers,    label: 'CONTEXTO', path: '/contexto' },
  { icon: BarChart2, label: 'INSIGHTS', path: '/insights' },
  { icon: User,      label: 'YO',       path: '/yo' },
];

const ESTADO_LABEL: Record<string, string> = {
  listening:  'ESCUCHANDO...',
  processing: 'PROCESANDO...',
  success:    'LISTO',
  error:      'ERROR',
};

const CATEGORIA_ICON: Record<string, string> = {
  tarea:     '✅',
  reunion:   '📅',
  gasto:     '💸',
  ingreso:   '💰',
  idea:      '💡',
  habito:    '⚡',
  crm:       '👤',
  nota:      '📝',
  navegacion:'🧭',
};

function WaveRing({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      {active && (
        <>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ border: '1px solid rgba(201,148,26,0.3)', width: 96 + i * 28, height: 96 + i * 28 }}
              initial={{ opacity: 0.6, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 1.6, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </>
      )}
      <motion.div
        className="rounded-full flex items-center justify-center"
        style={{
          width: 96, height: 96,
          background: active ? 'var(--honey-core)' : 'var(--bg-elevated)',
          boxShadow: active ? 'var(--glow-honey)' : 'none',
          border: active ? 'none' : '1px solid var(--border-default)',
        }}
        animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={active ? { repeat: Infinity, duration: 1.4 } : {}}
      >
        <Mic size={36} color={active ? 'var(--text-on-honey)' : 'var(--text-tertiary)'} strokeWidth={2} />
      </motion.div>
    </div>
  );
}

function VoiceFAB() {
  const { tareas, mercado, agenda, agregarTarea, agregarAgenda, agregarTransaccion, agregarIdea, agregarHabito, agregarContacto } = useApp();
  const streak = useStreaks();
  const navigate = useNavigate();

  const buildContext = (): UserContext => {
    const btcChange = mercado.find(m => m.simbolo === 'BTC')?.cambio ?? 0;
    const ethChange = mercado.find(m => m.simbolo === 'ETH')?.cambio ?? 0;
    const hoy = new Date().toISOString().split('T')[0];
    const todayTasks = tareas.filter(t => !t.completada && t.fechaVencimiento?.startsWith(hoy))
      .map(t => ({ titulo: t.titulo, prioridad: t.prioridad }));
    const nextMeetings = agenda.filter(a => a.fecha?.startsWith(hoy))
      .map(a => ({ title: a.titulo, time: a.hora ?? '' }));
    return { btcChange, ethChange, todayTasks, streak, nextMeetings, newsCount: 0 };
  };

  const { estado, transcriptLive, resultado, errorMsg, iniciar, cancelar, dismissarExito } = useVoiceEngine(buildContext);

  const isActive = estado !== 'idle';
  const isListening = estado === 'listening';
  const isProcessing = estado === 'processing';
  const isSuccess = estado === 'success';
  const isError = estado === 'error';

  React.useEffect(() => {
    const handler = () => { unlockAudio(); if (!isActive) iniciar(); };
    document.addEventListener('aicolmena:openVoice', handler);
    return () => document.removeEventListener('aicolmena:openVoice', handler);
  }, [isActive]);

  React.useEffect(() => {
    if (!resultado) return;
    const res = resultado;
    hablarConCallback(res.respuestaAlUsuario, () => {}, () => dismissarExito());
    if (res.accion === 'navegar' && res.datos?.destino) {
      const route = DESTINO_ROUTES[res.datos.destino];
      if (route) { setTimeout(() => navigate(route), 800); }
      return;
    }
    if (res.tipo !== 'COMANDO' || res.accion !== 'guardar') return;
    if ((res.confianza ?? 0) < CONFIDENCE_THRESHOLD) return;
    const d = res.datos ?? {};
    const now = new Date().toISOString();
    if (res.categoria === 'tarea') {
      agregarTarea({ titulo: d.titulo ?? 'Nueva tarea', prioridad: (d.prioridad as any) ?? 'media', fechaVencimiento: d.fecha ?? now, esFoco: false });
    } else if (res.categoria === 'reunion') {
      agregarAgenda({ titulo: d.titulo ?? 'Reunión', fecha: d.fecha ?? now, hora: d.hora ?? '10:00', personas: d.personas ?? [], tipo: 'reunion' });
    } else if (res.categoria === 'gasto') {
      agregarTransaccion({ tipo: 'gasto', monto: d.monto ?? 0, categoria: d.tag ?? 'General', descripcion: d.titulo ?? '' });
    } else if (res.categoria === 'ingreso') {
      agregarTransaccion({ tipo: 'ingreso', monto: d.monto ?? 0, categoria: 'Ventas', descripcion: d.titulo ?? '' });
    } else if (res.categoria === 'idea') {
      agregarIdea({ titulo: d.titulo ?? 'Nueva idea', descripcion: d.contexto ?? '', estado: 'idea', valorEstimado: 0, potencialMensual: 0 });
    } else if (res.categoria === 'habito') {
      agregarHabito(d.titulo ?? 'Nuevo hábito', d.icono ?? '⚡');
    } else if (res.categoria === 'crm') {
      agregarContacto({ nombre: d.titulo ?? 'Contacto', empresa: d.empresa ?? '', estado: 'prospecto', valor: d.monto ?? 0 });
    }
    logEvent('voz_usado', res.categoria);
  }, [resultado]);

  const toggle = () => {
    unlockAudio();
    if (isActive && !isSuccess && !isError) { cancelar(); detenerVoz(); }
    else if (!isActive) iniciar();
  };

  return (
    <>
      {/* FAB button */}
      <button onClick={toggle} className="relative flex-shrink-0" aria-label="Activar voz">
        <motion.div
          animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={isActive ? { repeat: Infinity, duration: 1.2 } : {}}
          className="fab"
          style={{
            background: isActive ? 'var(--honey-bright)' : 'var(--honey-core)',
            boxShadow: isActive ? 'var(--glow-honey)' : '0 4px 16px rgba(201,148,26,0.25)',
          }}
        >
          {isActive
            ? <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                <Mic size={22} color="var(--text-on-honey)" strokeWidth={2.5} />
              </motion.div>
            : <Mic size={22} color="var(--text-on-honey)" strokeWidth={2.5} />
          }
        </motion.div>
      </button>

      {/* Fullscreen voice panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
            style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(24px)' }}
          >
            {/* Cancel / close */}
            {!isSuccess && (
              <button
                onClick={() => { cancelar(); detenerVoz(); }}
                className="absolute top-12 right-6 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
                style={{ width: 40, height: 40, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              >
                <X size={18} color="var(--text-secondary)" />
              </button>
            )}

            {/* Estado label */}
            <motion.p
              key={estado}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="sys-label mb-10"
              style={{ color: isError ? 'var(--danger)' : 'var(--honey-soft)', letterSpacing: '0.2em' }}
            >
              {ESTADO_LABEL[estado] ?? ''}
            </motion.p>

            {/* Mic ring / success / error */}
            {(isListening || isProcessing) && (
              <WaveRing active={isListening} />
            )}

            {isSuccess && resultado && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                  {CATEGORIA_ICON[resultado.categoria ?? ''] ?? '✅'}
                </div>
                <CheckCircle size={20} color="var(--success)" />
              </motion.div>
            )}

            {isError && (
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
                <AlertCircle size={36} color="var(--danger)" />
              </div>
            )}

            {/* Processing spinner */}
            {isProcessing && (
              <div className="mt-8 w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--honey-core)', borderTopColor: 'transparent' }} />
            )}

            {/* Transcript live */}
            {(isListening || isProcessing) && (
              <motion.div
                className="mt-10 max-w-xs text-center min-h-[56px]"
                animate={{ opacity: transcriptLive ? 1 : 0.4 }}
              >
                <p className="text-base font-medium leading-relaxed"
                  style={{ color: transcriptLive ? 'var(--text-primary)' : 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
                  {transcriptLive || (isListening ? 'Hablá ahora...' : '')}
                </p>
              </motion.div>
            )}

            {/* AI response */}
            {isSuccess && resultado && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 max-w-xs text-center"
              >
                <p className="text-base font-medium leading-relaxed"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  {resultado.respuestaAlUsuario}
                </p>
                <button
                  onClick={() => dismissarExito()}
                  className="mt-6 px-8 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                  style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)', boxShadow: 'var(--glow-honey)' }}
                >
                  Entendido
                </button>
              </motion.div>
            )}

            {/* Error message */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 max-w-xs text-center"
              >
                <p className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>
                  {errorMsg || 'No se pudo procesar el comando.'}
                </p>
                <button
                  onClick={() => { cancelar(); }}
                  className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                >
                  Cerrar
                </button>
              </motion.div>
            )}

            {/* Hint */}
            {isListening && (
              <p className="absolute bottom-20 sys-label text-center"
                style={{ color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em' }}>
                DICTÁ UNA TAREA · GASTO · IDEA · REUNIÓN
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'rgba(10,10,15,0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      <div className="flex items-center h-[60px] max-w-lg mx-auto px-4 gap-1">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className="flex-1">
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5 py-1 relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: 24, height: 2, background: 'var(--honey-core)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon size={20} style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 9, letterSpacing: '0.06em', fontWeight: 700, color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)' }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}

        <div className="flex-shrink-0 flex items-center justify-center px-2 -mt-4">
          <VoiceFAB />
        </div>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavLink key={item.path} to={item.path} className="flex-1">
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5 py-1 relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: 24, height: 2, background: 'var(--honey-core)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <item.icon size={20} style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }} />
                <span style={{ fontSize: 9, letterSpacing: '0.06em', fontWeight: 700, color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)' }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
