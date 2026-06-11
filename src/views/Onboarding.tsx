import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { AUTH_EMAIL_KEY, USER_DATA_KEYS, hashPassword } from '../context/AuthContext';
import { trackConversion } from '../lib/analytics';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Role = 'Founder' | 'Freelancer' | 'Profesional' | 'Emprendedor' | 'Otro';
type Pain = 'seguimientos' | 'foco' | 'priorizar' | 'balance' | 'finanzas';

const ROLES: Role[] = ['Founder', 'Freelancer', 'Profesional', 'Emprendedor', 'Otro'];

const WAKE_TIMES = ['5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '9:00', '10:00'];

const PAIN_OPTIONS: { id: Pain; label: string; icon: string }[] = [
  { id: 'seguimientos', label: 'Olvidar seguimientos importantes', icon: '🔔' },
  { id: 'foco',         label: 'Perder el foco durante el día',    icon: '🎯' },
  { id: 'priorizar',    label: 'No saber qué priorizar primero',   icon: '⚖️' },
  { id: 'balance',      label: 'Separar trabajo y vida personal',  icon: '⚡' },
  { id: 'finanzas',     label: 'Mantener mis finanzas claras',     icon: '💰' },
];

const PAIN_LABELS: Record<Pain, string> = {
  seguimientos: 'perder seguimientos',
  foco:         'perder el foco',
  priorizar:    'no saber qué priorizar',
  balance:      'separar trabajo y vida',
  finanzas:     'no tener claridad financiera',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clearUserData() {
  USER_DATA_KEYS.forEach(key => {
    if (key !== 'domex_profile') localStorage.removeItem(key);
  });
}

function buildWelcomeBriefing(nombre: string, role: Role, pain: Pain): string {
  return (
    `Bienvenido, ${nombre}. ` +
    `Como ${role.toLowerCase()}, tu mayor desafío es ${PAIN_LABELS[pain]}. ` +
    `AIcolmena va a darte un briefing de 30 segundos cada mañana ` +
    `para que sepas exactamente qué necesita tu atención. ` +
    `Sin distracciones. Sin ruido. Solo lo que importa. ` +
    `¿Arrancamos?`
  );
}

// ─── Karaoke hook ─────────────────────────────────────────────────────────────
function useKaraoke(text: string, autoPlay: boolean) {
  const [wordIdx, setWordIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const words = text.split(' ');

  const play = () => {
    if (!('speechSynthesis' in window)) { setDone(true); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-AR';
    utter.rate = 1.05;
    utterRef.current = utter;

    let boundarySupported = false;

    utter.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name !== 'word') return;
      boundarySupported = true;
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      let chars = 0;
      for (let i = 0; i < words.length; i++) {
        if (chars >= e.charIndex) { setWordIdx(i); break; }
        chars += words[i].length + 1;
      }
    };

    utter.onstart = () => {
      setPlaying(true);
      setWordIdx(0);
      // Fallback timer: advance one word every ~460ms if onboundary not firing
      setTimeout(() => {
        if (!boundarySupported) {
          let idx = 0;
          timerRef.current = setInterval(() => {
            idx++;
            if (idx < words.length) setWordIdx(idx);
            else { if (timerRef.current) clearInterval(timerRef.current); }
          }, Math.max(350, (text.length / words.length) * 70));
        }
      }, 600);
    };

    utter.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setPlaying(false);
      setDone(true);
      setWordIdx(-1);
    };

    utter.onerror = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setDone(true);
    };

    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    if (autoPlay && !playing && !done) {
      const t = setTimeout(play, 800);
      return () => clearTimeout(t);
    }
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { words, wordIdx, playing, done, play };
}

// ─── Pantalla 3 — AHA MOMENT ──────────────────────────────────────────────────
function StepBriefing({ nombre, role, pain, onEnter }: {
  nombre: string; role: Role; pain: Pain; onEnter: () => void;
}) {
  const text = buildWelcomeBriefing(nombre, role, pain);
  const { words, wordIdx, playing, done, play } = useKaraoke(text, true);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sys-label mb-2"
          style={{ color: 'var(--honey-soft)', letterSpacing: '0.2em' }}
        >
          TU PRIMER BRIEFING
        </motion.p>
        <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {done ? '¡Listo!' : playing ? 'Escuchá...' : 'Generando...'}
        </h1>
      </div>

      {/* Onda animada */}
      <div className="flex items-center justify-center gap-1 h-12">
        {playing
          ? [0.4, 0.7, 1, 0.7, 0.4, 0.6, 0.9, 0.6, 0.4].map((h, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: 'var(--violet-bright)' }}
                animate={{ scaleY: [h, 1, h * 0.6, 1, h] }}
                transition={{ duration: 0.8 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))
          : done
          ? <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <Check size={22} style={{ color: 'var(--success)' }} />
            </div>
          : Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i} className="w-1 h-4 rounded-full"
                style={{ background: 'var(--border-default)' }}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity }}
              />
            ))
        }
      </div>

      {/* Karaoke text */}
      <motion.div
        className="rounded-2xl p-5 min-h-[100px] text-center"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <p className="text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
          {words.map((w, i) => (
            <span
              key={i}
              style={{
                color: i === wordIdx ? 'var(--honey-bright)' : done ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                fontWeight: i === wordIdx ? 700 : 400,
                transition: 'color 0.1s, font-weight 0.1s',
                marginRight: 4,
              }}
            >{w}</span>
          ))}
        </p>
      </motion.div>

      {/* Replay si no está jugando */}
      {!playing && !done && (
        <button onClick={play} className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
          ▶ Reproducir
        </button>
      )}

      {/* CTA entrar */}
      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onEnter}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm tracking-wider transition-all active:scale-[0.98]"
            style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)', boxShadow: 'var(--glow-honey)' }}
          >
            Entrar a AIcolmena <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Onboarding() {
  const { updateProfile } = useUserProfile();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [wakeTime, setWakeTime] = useState('7:00');
  const [pain, setPain] = useState<Pain | ''>('');

  const canNext =
    step === 1 ? nombre.trim().length >= 2 && !!role :
    step === 2 ? !!pain :
    false;

  const handleNext = () => { if (canNext && step < 3) setStep(s => s + 1); };

  const handleEnter = () => {
    clearUserData();
    const normalizedEmail = email.trim().toLowerCase() || `user_${Date.now()}@aicolmena.local`;
    updateProfile({
      identity: {
        nombre: nombre.trim(),
        apellido: '',
        avatarUrl: null,
        iniciales: nombre.trim().charAt(0).toUpperCase(),
        saludo: 'Hola',
        email: normalizedEmail,
      },
      goals: { horaDespertar: wakeTime } as any,
      onboardingCompleto: true,
    });
    localStorage.setItem(AUTH_EMAIL_KEY, normalizedEmail);
    localStorage.setItem('domex_has_accounts', 'true');
    if (pain) localStorage.setItem('aicolmena_onboarding_pain', pain);
    if (role) localStorage.setItem('aicolmena_onboarding_role', role);
    trackConversion('onboarding_complete');
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 text-white z-[200] overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      <div className="scan-beam" />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[210]" style={{ background: 'var(--border-subtle)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--honey-core)' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ type: 'spring', stiffness: 60 }}
        />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-1">
              <div className="live-dot" />
              <span className="text-xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>AICOLMENA</span>
            </div>
            <p className="sys-label" style={{ color: 'var(--honey-soft)', opacity: 0.5 }}>PASO {step} DE 3</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>¿Quién sos?</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Personalizamos tu experiencia desde el primer día.</p>
                  </div>

                  {/* Nombre */}
                  <input
                    autoFocus
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl px-5 py-4 text-xl font-bold focus:outline-none transition-all"
                    style={{
                      background: 'var(--bg-surface)',
                      border: nombre.trim().length >= 2 ? '1px solid rgba(201,148,26,0.4)' : '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />

                  {/* Rol */}
                  <div>
                    <p className="sys-label mb-2">¿QUÉ HACÉS?</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map(r => (
                        <button
                          key={r}
                          onClick={() => setRole(r)}
                          className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                          style={{
                            background: role === r ? 'var(--honey-glow)' : 'var(--bg-surface)',
                            border: `1px solid ${role === r ? 'rgba(201,148,26,0.4)' : 'var(--border-subtle)'}`,
                            color: role === r ? 'var(--honey-bright)' : 'var(--text-secondary)',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hora despertar */}
                  <div>
                    <p className="sys-label mb-2">¿A QUÉ HORA TE LEVANTÁS?</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {WAKE_TIMES.map(t => (
                        <button
                          key={t}
                          onClick={() => setWakeTime(t)}
                          className="flex-shrink-0 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: wakeTime === t ? 'var(--violet-ghost)' : 'var(--bg-surface)',
                            border: `1px solid ${wakeTime === t ? 'rgba(167,139,250,0.3)' : 'var(--border-subtle)'}`,
                            color: wakeTime === t ? 'var(--violet-soft)' : 'var(--text-tertiary)',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email opcional */}
                  <div>
                    <p className="sys-label mb-2" style={{ opacity: 0.5 }}>EMAIL (OPCIONAL — PARA ACCEDER DESDE OTRO DISPOSITIVO)</p>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>¿Qué es lo que más te cuesta manejar?</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Solo una opción. Sé honesto — AIcolmena prioriza en base a esto.</p>
                  </div>
                  <div className="space-y-2">
                    {PAIN_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setPain(opt.id)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left active:scale-[0.98]"
                        style={pain === opt.id
                          ? { background: 'var(--violet-ghost)', border: '1px solid rgba(124,58,237,0.35)' }
                          : { background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }
                        }
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <span className="text-sm font-medium flex-1" style={{ color: pain === opt.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {opt.label}
                        </span>
                        {pain === opt.id && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--violet-bright)' }}>
                            <Check size={11} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 3 — AHA MOMENT ── */}
              {step === 3 && nombre && role && pain && (
                <StepBriefing
                  nombre={nombre.trim()}
                  role={role as Role}
                  pain={pain as Pain}
                  onEnter={handleEnter}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons (solo pasos 1 y 2) */}
          {step < 3 && (
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-black text-[10px] tracking-widest transition-all"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
                >
                  <ChevronLeft size={14} /> ATRÁS
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[11px] tracking-widest transition-all active:scale-[0.98]"
                style={canNext
                  ? { background: 'var(--honey-core)', color: 'var(--text-on-honey)', boxShadow: 'var(--glow-honey)' }
                  : { background: 'var(--bg-surface)', color: 'var(--text-tertiary)', cursor: 'not-allowed', border: '1px solid var(--border-subtle)' }
                }
              >
                SIGUIENTE <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}

          <p className="text-[9px] text-center tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            DATOS PRIVADOS · SOLO EN TU DISPOSITIVO
          </p>
        </div>
      </div>
    </div>
  );
}
