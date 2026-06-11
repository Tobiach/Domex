import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';
import { AUTH_EMAIL_KEY, USER_DATA_KEYS, hashPassword } from '../context/AuthContext';
import { trackConversion } from '../lib/analytics';

const CHALLENGES = [
  { id: 'memory',        label: 'No recuerdo qué tengo que hacer',  icon: '🧠' },
  { id: 'overwhelm',    label: 'Demasiadas cosas en la cabeza',     icon: '😰' },
  { id: 'opportunities', label: 'Pierdo oportunidades de negocio',  icon: '💼' },
  { id: 'progress',     label: 'No sé si estoy progresando',        icon: '📊' },
];

function clearUserData() {
  USER_DATA_KEYS.forEach(key => {
    if (key !== 'domex_profile') localStorage.removeItem(key);
  });
}

export default function Onboarding() {
  const { updateProfile } = useUserProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canNext =
    step === 1 ? nombre.trim().length >= 2 && email.trim().includes('@') :
    step === 2 ? !!challenge :
    true;

  const handleNext = async () => {
    if (!canNext) return;
    if (step < 3) { setStep(step + 1); return; }

    setLoading(true);

    // Clear previous user data before saving new profile
    clearUserData();

    const normalizedEmail = email.trim().toLowerCase();

    updateProfile({
      identity: {
        nombre: nombre.trim(),
        apellido: '',
        avatarUrl: null,
        iniciales: nombre.trim().charAt(0).toUpperCase(),
        saludo: 'Hola',
        email: normalizedEmail,
        passwordHash: password ? hashPassword(password) : undefined,
      },
      onboardingCompleto: true,
    });

    // Set auth session
    localStorage.setItem(AUTH_EMAIL_KEY, normalizedEmail);
    localStorage.setItem('domex_has_accounts', 'true');

    trackConversion('onboarding_complete');
    // Full reload so AppContext re-reads clean localStorage
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 bg-[#06060E] text-white z-[200] overflow-y-auto grid-bg">
      <div className="scan-beam" />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[210]">
        <motion.div
          className="h-full"
          style={{ background: 'var(--accent-main)' }}
          animate={{ width: `${(step / 3) * 100}%` }}
          transition={{ type: 'spring', stiffness: 60 }}
        />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="live-dot" />
              <span className="text-[22px] font-black tracking-tighter glow-cyan">AICOLMENA</span>
            </div>
            <p className="sys-label" style={{ color: 'rgba(0,212,255,0.5)' }}>
              PASO {step} DE 3 · CONFIGURACIÓN INICIAL
            </p>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="space-y-5"
            >
              {/* STEP 1 — Identidad */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter mb-1">¿Quién sos?</h1>
                    <p className="text-white/40 text-sm">AIcolmena usa estos datos para personalizar tu experiencia.</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      autoFocus
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                      placeholder="Tu nombre"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xl font-bold focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && canNext && handleNext()}
                      placeholder="tu@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
                    />
                  </div>

                  {nombre.trim().length >= 2 && email.trim().includes('@') && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bm-card px-4 py-3"
                    >
                      <p className="text-sm text-white/60 italic text-center">
                        "Hola, <strong className="text-white">{nombre.trim()}</strong>. Bienvenido a AIcolmena."
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 2 — Desafío */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter mb-1">¿Cuál es tu mayor desafío?</h1>
                    <p className="text-white/40 text-sm">Personalizamos qué módulos priorizar para vos.</p>
                  </div>
                  <div className="space-y-2">
                    {CHALLENGES.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setChallenge(opt.id)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left"
                        style={challenge === opt.id
                          ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.35)' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-sm font-medium text-white/80">{opt.label}</span>
                        {challenge === opt.id && <Check size={14} className="ml-auto shrink-0" style={{ color: 'var(--accent-main)' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 — Objetivo + Password */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter mb-1">Último paso</h1>
                    <p className="text-white/40 text-sm">Todo opcional — podés completarlo después desde Configuración.</p>
                  </div>

                  <input
                    autoFocus
                    type="text"
                    value={objetivo}
                    onChange={e => setObjetivo(e.target.value)}
                    placeholder="Tu objetivo: Ej. Doblar mis ingresos este año"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                      placeholder="Contraseña (opcional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="bm-card px-4 py-4 space-y-1.5">
                    <span className="sys-label block">RESUMEN</span>
                    <p className="text-sm text-white/70">
                      <span className="text-white font-bold">{nombre}</span>
                      {' · '}
                      {CHALLENGES.find(c => c.id === challenge)?.icon}{' '}
                      {CHALLENGES.find(c => c.id === challenge)?.label.toLowerCase()}
                    </p>
                    <p className="sys-label text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {email}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-black text-[10px] tracking-widest text-white/40 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={15} /> ATRÁS
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canNext || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-[11px] tracking-widest transition-all"
              style={canNext
                ? { background: 'var(--accent-main)', color: '#000' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
              }
            >
              {loading ? 'INICIANDO...' : step === 3 ? 'ACTIVAR AICOLMENA' : 'SIGUIENTE'}
              {!loading && (step === 3 ? <Check size={15} /> : <ChevronRight size={15} />)}
            </button>
          </div>

          <p className="text-[10px] text-white/25 text-center tracking-widest">
            DATOS PRIVADOS · ENCRYPTED
          </p>
        </div>
      </div>
    </div>
  );
}
