import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Layers, Mic, BarChart2, User, X, CheckCircle, AlertCircle, Globe, Keyboard, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useVoiceEngine, SPEECH_SUPPORT } from '../../hooks/useVoiceEngine';
import { useApp } from '../../context/AppContext';
import { useStreaks } from '../../hooks/useStreaks';
import { hablarConCallback, detenerVoz, unlockAudio } from '../../services/voiceService';
import { UserContext, VoiceIntelligenceResult, DESTINO_ROUTES, CONFIDENCE_THRESHOLD } from '../../services/voiceProcessor';
import { logEvent } from '../../services/eventLog';
import { solicitarPermiso } from '../../services/notificationService';

const NAV_ITEMS = [
  { icon: Home,      label: 'HOY',      path: '/' },
  { icon: Layers,    label: 'CONTEXTO', path: '/contexto' },
  { icon: Globe,     label: 'MUNDO',    path: '/intel' },
  { icon: BarChart2, label: 'INSIGHTS', path: '/insights' },
  { icon: User,      label: 'YO',       path: '/yo' },
];

const CATEGORIA_TOAST: Record<string, { label: string; route: string }> = {
  tarea:   { label: 'Tarea guardada',     route: '/tasks' },
  reunion: { label: 'Reunión agendada',   route: '/contexto' },
  gasto:   { label: 'Gasto registrado',   route: '/capital' },
  ingreso: { label: 'Ingreso registrado', route: '/capital' },
  idea:    { label: 'Idea guardada',      route: '/ideas' },
  nota:    { label: 'Nota guardada',      route: '/' },
  habito:  { label: 'Hábito creado',      route: '/habitos' },
  crm:     { label: 'Contacto guardado',  route: '/crm' },
};

function VoiceToast({ label, route, onClose }: { label: string; route: string; onClose: () => void }) {
  const nav = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2 }}
      className="fixed left-4 right-4 max-w-sm mx-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ bottom: 84, background: '#1A1A24', border: '1px solid rgba(201,148,26,0.3)' }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'rgba(201,148,26,0.12)' }}>
        <CheckCircle size={13} style={{ color: 'var(--honey-core)' }} />
      </div>
      <span className="flex-1 font-semibold" style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        {label}
      </span>
      <button
        onClick={() => { onClose(); nav(route); }}
        className="text-xs font-black shrink-0 transition-opacity hover:opacity-70"
        style={{ color: 'var(--honey-bright)', fontSize: 11, fontFamily: 'var(--font-display)' }}
      >
        VER →
      </button>
    </motion.div>
  );
}

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

  const { estado, transcriptLive, resultado, errorMsg, iniciar, cancelar, dismissarExito, processText } = useVoiceEngine(buildContext);

  const isActive = estado !== 'idle';
  const isListening = estado === 'listening';
  const isProcessing = estado === 'processing';
  const isSuccess = estado === 'success';
  const isError = estado === 'error';

  const [pendingToast, setPendingToast] = React.useState<{ label: string; route: string } | null>(null);
  const [toast, setToast] = React.useState<{ label: string; route: string } | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevEstado = React.useRef(estado);
  const [pendingSave, setPendingSave] = React.useState<typeof resultado | null>(null);
  const [pendingMonto, setPendingMonto] = React.useState<typeof resultado | null>(null);
  const [montoInput, setMontoInput] = React.useState('');
  // Text input mode: activated when no Speech API support or user requests it
  const [showTextPanel, setShowTextPanel] = React.useState(false);
  const [textInputValue, setTextInputValue] = React.useState('');

  // Threshold for auto-save vs suggestion card
  const CONFIDENCE_AUTOSAVE = 85;

  React.useEffect(() => {
    const handler = () => { unlockAudio(); if (!isActive) iniciar(); };
    document.addEventListener('aicolmena:openVoice', handler);
    return () => document.removeEventListener('aicolmena:openVoice', handler);
  }, [isActive]);

  // Show toast when voice overlay closes (estado → idle)
  React.useEffect(() => {
    if (prevEstado.current !== 'idle' && estado === 'idle' && pendingToast) {
      setToast(pendingToast);
      setPendingToast(null);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }
    prevEstado.current = estado;
  }, [estado, pendingToast]);

  const ejecutarGuardado = React.useCallback((res: NonNullable<typeof resultado>) => {
    const d = res.datos ?? {};
    const now = new Date().toISOString();
    if (res.categoria === 'tarea') {
      agregarTarea({ titulo: d.titulo ?? 'Nueva tarea', prioridad: (d.prioridad as any) ?? 'media', fechaVencimiento: d.fecha ?? now, esFoco: false });
    } else if (res.categoria === 'reunion') {
      agregarAgenda({ titulo: d.titulo ?? 'Reunión', fecha: d.fecha ?? now, hora: d.hora ?? '10:00', personas: d.personas ?? [], tipo: 'reunion' });
    } else if (res.categoria === 'gasto' || res.categoria === 'ingreso') {
      // T8: si el monto es null, mostrar prompt en lugar de guardar con 0
      if (d.monto === null || d.monto === undefined) {
        setPendingMonto(res);
        setMontoInput('');
        return;
      }
      const desc = d.moneda === 'USD' ? `${d.titulo ?? ''} (USD)` : d.titulo ?? '';
      agregarTransaccion({ tipo: res.categoria, monto: d.monto, categoria: d.tag ?? '', descripcion: desc });
    } else if (res.categoria === 'idea') {
      agregarIdea({ titulo: d.titulo ?? 'Nueva idea', descripcion: d.contexto ?? '', estado: 'idea', valorEstimado: 0, potencialMensual: 0 });
    } else if (res.categoria === 'nota') {
      agregarIdea({ titulo: d.titulo ?? d.contexto ?? 'Nota', descripcion: d.contexto ?? '', estado: 'idea', valorEstimado: 0, potencialMensual: 0 });
    } else if (res.categoria === 'habito') {
      agregarHabito(d.titulo ?? 'Nuevo hábito', d.icono ?? '⚡', d.hora ?? null, d.frecuencia ?? null);
      // T9: solicitar permiso y programar notificación si tiene horario
      if (d.hora) {
        solicitarPermiso().then(granted => {
          if (!granted) return;
          try {
            const notifs = JSON.parse(localStorage.getItem('domex_habit_notifs') || '[]');
            notifs.push({ titulo: d.titulo ?? 'Hábito', hora: d.hora, creadoEn: Date.now() });
            localStorage.setItem('domex_habit_notifs', JSON.stringify(notifs));
          } catch { /* silent */ }
        });
      }
    } else if (res.categoria === 'crm') {
      agregarContacto({ nombre: d.titulo ?? 'Contacto', empresa: d.empresa ?? '', estado: 'prospecto', valor: d.monto ?? 0 });
    }
    logEvent('voz_usado', res.categoria);
    if (res.categoria && CATEGORIA_TOAST[res.categoria as keyof typeof CATEGORIA_TOAST]) {
      setPendingToast(CATEGORIA_TOAST[res.categoria as keyof typeof CATEGORIA_TOAST]);
    }
  }, [agregarTarea, agregarAgenda, agregarTransaccion, agregarIdea, agregarHabito, agregarContacto]);

  React.useEffect(() => {
    if (!resultado) return;
    const res = resultado;
    hablarConCallback(res.respuestaAlUsuario, () => {}, () => {
      // Solo auto-dismiss si no hay cards pendientes
      if (!pendingMonto) dismissarExito();
    });
    if (res.accion === 'navegar' && res.datos?.destino) {
      const route = DESTINO_ROUTES[res.datos.destino];
      if (route) { setTimeout(() => navigate(route), 800); }
      return;
    }
    if (res.tipo !== 'COMANDO' || res.accion !== 'guardar') return;
    const conf = res.confianza ?? 0;
    if (conf < CONFIDENCE_THRESHOLD) return;
    if (conf >= CONFIDENCE_AUTOSAVE) {
      ejecutarGuardado(res);
    } else {
      // Zona ambigua (75-84): mostrar card de sugerencia
      setPendingSave(res);
    }
  }, [resultado]);

  const toggle = () => {
    unlockAudio();
    if (isActive && !isSuccess && !isError) { cancelar(); detenerVoz(); }
    else if (!isActive) {
      if (!SPEECH_SUPPORT) {
        setTextInputValue('');
        setShowTextPanel(true);
      } else {
        iniciar();
      }
    }
  };

  const handleTextSubmit = () => {
    const text = textInputValue.trim();
    if (!text) return;
    setShowTextPanel(false);
    setTextInputValue('');
    processText(text);
  };

  return (
    <>
      {/* Text input panel — shown when Speech API not available */}
      <AnimatePresence>
        {showTextPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
            style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(24px)' }}
          >
            <button
              onClick={() => setShowTextPanel(false)}
              className="absolute top-12 right-6 flex items-center justify-center rounded-full"
              style={{ width: 40, height: 40, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              <X size={18} color="var(--text-secondary)" />
            </button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--honey-border)' }}>
              <Keyboard size={28} style={{ color: 'var(--honey-core)' }} />
            </div>
            <p className="sys-label mb-6" style={{ color: 'var(--honey-soft)', letterSpacing: '0.2em' }}>
              ESCRIBÍ TU NOTA
            </p>
            <textarea
              autoFocus
              value={textInputValue}
              onChange={e => setTextInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
              placeholder="Tarea, gasto, idea, reunión..."
              rows={3}
              className="w-full max-w-xs rounded-2xl px-4 py-3 text-sm resize-none outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--honey-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInputValue.trim()}
              className="mt-4 flex items-center gap-2 px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)' }}
            >
              <Send size={13} /> Procesar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button onClick={toggle} className="relative flex-shrink-0" aria-label="Activar voz">
        <motion.div
          animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          whileHover={!isActive ? { scale: 1.05 } : undefined}
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
                className="mt-6 max-w-xs text-center w-full px-4"
              >
                <p className="text-base font-medium leading-relaxed"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  {resultado.respuestaAlUsuario}
                </p>

                {/* Suggestion card for ambiguous intent */}
                {pendingSave && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-4 rounded-2xl p-4 text-left"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(91,33,182,0.25)' }}
                  >
                    <p className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                      No encontré una acción clara para eso.
                    </p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
                      ¿Querías guardar esto como nota?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { ejecutarGuardado({ ...pendingSave, categoria: 'nota' }); setPendingSave(null); dismissarExito(); }}
                        className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)' }}
                      >
                        Guardar como nota
                      </button>
                      <button
                        onClick={() => { setPendingSave(null); dismissarExito(); }}
                        className="px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Descartar
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* T8: prompt de monto cuando gasto/ingreso sin monto */}
                {pendingMonto && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 rounded-2xl p-4 text-left w-full"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--honey-border)' }}
                  >
                    <p className="text-[12px] font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
                      ¿Cuánto fue? Ingresá el monto para guardarlo.
                    </p>
                    <input
                      type="number"
                      inputMode="decimal"
                      autoFocus
                      value={montoInput}
                      onChange={e => setMontoInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent outline-none text-2xl font-black text-center mb-3"
                      style={{ color: 'var(--honey-bright)', borderBottom: '1px solid var(--honey-border)' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const monto = parseFloat(montoInput.replace(',', '.'));
                          if (!monto || monto <= 0) return;
                          ejecutarGuardado({ ...pendingMonto, datos: { ...pendingMonto.datos, monto } });
                          setPendingMonto(null);
                          setMontoInput('');
                          dismissarExito();
                        }}
                        disabled={!parseFloat(montoInput) || parseFloat(montoInput) <= 0}
                        className="flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                        style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)' }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setPendingMonto(null); setMontoInput(''); dismissarExito(); }}
                        className="px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Descartar
                      </button>
                    </div>
                  </motion.div>
                )}

                {!pendingSave && !pendingMonto && (
                  <button
                    onClick={() => dismissarExito()}
                    className="mt-6 px-8 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                    style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)', boxShadow: 'var(--glow-honey)' }}
                  >
                    Entendido
                  </button>
                )}
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
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { cancelar(); }}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => { cancelar(); setTextInputValue(''); setShowTextPanel(true); }}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
                    style={{ background: 'rgba(201,148,26,0.1)', color: 'var(--honey-bright)', border: '1px solid var(--honey-border)' }}
                  >
                    <Keyboard size={13} /> Escribir
                  </button>
                </div>
              </motion.div>
            )}

            {/* Hint */}
            {isListening && (
              <p className="absolute bottom-32 sys-label text-center px-6"
                style={{ color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em' }}>
                DICTÁ UNA TAREA · GASTO · IDEA · REUNIÓN
              </p>
            )}
            {/* Cancel button bottom-center */}
            {isListening && (
              <button
                onClick={() => { cancelar(); }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-full transition-all active:scale-95"
                style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--font-body)' }}
              >
                Cancelar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice toast */}
      <AnimatePresence>
        {toast && (
          <VoiceToast label={toast.label} route={toast.route} onClose={() => setToast(null)} />
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
      <div className="flex items-center h-[60px] max-w-lg mx-auto px-2 gap-0">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className="flex-1">
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5 py-1 relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: 20, height: 2, background: 'var(--honey-core)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div animate={{ scale: isActive ? 1.2 : 1 }} transition={{ duration: 0.15 }}>
                  <item.icon size={18} style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }} />
                </motion.div>
                <span style={{ fontSize: 8, letterSpacing: '0.05em', fontWeight: 700, color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)' }}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}

        <div className="flex-shrink-0 flex items-center justify-center px-1 -mt-4">
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
                    style={{ width: 20, height: 2, background: 'var(--honey-core)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div animate={{ scale: isActive ? 1.2 : 1 }} transition={{ duration: 0.15 }}>
                  <item.icon size={18} style={{ color: isActive ? 'var(--honey-bright)' : 'var(--text-tertiary)' }} />
                </motion.div>
                <span style={{ fontSize: 8, letterSpacing: '0.05em', fontWeight: 700, color: isActive ? 'var(--honey-soft)' : 'var(--text-tertiary)' }}>
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
