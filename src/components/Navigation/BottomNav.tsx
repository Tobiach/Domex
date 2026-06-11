import React from 'react';
import { motion } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Layers, Mic, BarChart2, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVoiceEngine } from '../../hooks/useVoiceEngine';
import { useApp } from '../../context/AppContext';
import { useStreaks } from '../../hooks/useStreaks';
import { hablarConCallback, detenerVoz, unlockAudio } from '../../services/voiceService';
import { UserContext, VoiceIntelligenceResult, DESTINO_ROUTES, CONFIDENCE_THRESHOLD } from '../../services/voiceProcessor';
import { logEvent } from '../../services/eventLog';

const NAV_ITEMS = [
  { icon: Home,     label: 'HOY',      path: '/' },
  { icon: Layers,   label: 'CONTEXTO', path: '/contexto' },
  { icon: BarChart2,label: 'INSIGHTS', path: '/insights' },
  { icon: User,     label: 'YO',       path: '/yo' },
];

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

  const { estado, iniciar, cancelar, resultado, dismissarExito } = useVoiceEngine(buildContext);

  const isActive = estado !== 'idle';

  // Handle result when it arrives
  React.useEffect(() => {
    if (!resultado) return;
    const res = resultado;
    hablarConCallback(res.respuestaAlUsuario, () => {}, () => dismissarExito());
    if (res.accion === 'navegar' && res.datos?.destino) {
      const route = DESTINO_ROUTES[res.datos.destino];
      if (route) { setTimeout(() => navigate(route), 400); }
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
    if (isActive) { cancelar(); detenerVoz(); }
    else iniciar();
  };

  return (
    <button
      onClick={toggle}
      className="relative flex-shrink-0"
      aria-label="Activar voz"
    >
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
          ? <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}>
              <Mic size={22} color="var(--text-on-honey)" strokeWidth={2.5} />
            </motion.div>
          : <Mic size={22} color="var(--text-on-honey)" strokeWidth={2.5} />
        }
      </motion.div>
    </button>
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
        {/* Primeros 2 tabs */}
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
                <item.icon
                  size={20}
                  style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }}
                />
                <span style={{
                  fontSize: 9, letterSpacing: '0.06em', fontWeight: 700,
                  color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)',
                }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}

        {/* FAB central de voz */}
        <div className="flex-shrink-0 flex items-center justify-center px-2 -mt-4">
          <VoiceFAB />
        </div>

        {/* Últimos 2 tabs */}
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
                <item.icon
                  size={20}
                  style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }}
                />
                <span style={{
                  fontSize: 9, letterSpacing: '0.06em', fontWeight: 700,
                  color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)',
                }}>
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
