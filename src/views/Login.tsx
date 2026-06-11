import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, accountExists } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailNext = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Ingresá un email válido');
      return;
    }
    if (!accountExists(trimmed)) {
      setError('No encontramos una cuenta con ese email.');
      return;
    }
    setError('');
    setStep('password');
  };

  const handleLogin = () => {
    setLoading(true);
    const result = login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result === 'ok') {
      window.location.href = '/';
    } else if (result === 'wrong_password') {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#06060E] text-white flex items-center justify-center px-6 grid-bg">
      <div className="scan-beam" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="live-dot" />
            <span className="text-[22px] font-black tracking-tighter glow-cyan">AICOLMENA</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-1">Iniciá sesión</h1>
          <p className="text-white/40 text-sm">Accedé a tu sistema personal.</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl text-sm font-bold text-center"
            style={{ background: 'rgba(255,109,40,0.1)', border: '1px solid rgba(255,109,40,0.3)', color: '#FF6D28' }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {step === 'email' ? (
            <>
              <input
                autoFocus
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailNext()}
                placeholder="tu@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
              />
              <button
                onClick={handleEmailNext}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] tracking-widest text-black"
                style={{ background: 'var(--accent-main)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
              >
                CONTINUAR <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('email'); setError(''); setPassword(''); }}
                className="text-[10px] font-black tracking-widest text-white/30 hover:text-white/60 transition-colors mb-1 block"
              >
                ← {email}
              </button>
              <div className="relative">
                <input
                  autoFocus
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && !loading && password && handleLogin()}
                  placeholder="Contraseña"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all pr-12"
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
              <button
                onClick={handleLogin}
                disabled={loading || !password}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] tracking-widest text-black transition-all active:scale-95"
                style={{
                  background: loading || !password ? 'rgba(0,212,255,0.4)' : 'var(--accent-main)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                }}
              >
                {loading ? 'VERIFICANDO...' : 'ENTRAR →'}
              </button>
            </>
          )}
        </div>

        {/* Links */}
        <p className="text-center text-[10px] text-white/30 tracking-widest">
          ¿Primera vez?{' '}
          <button
            onClick={() => navigate('/landing')}
            className="underline hover:text-white/60 transition-colors"
            style={{ color: 'var(--accent-main)' }}
          >
            Crear cuenta →
          </button>
        </p>

        <p className="text-center sys-label" style={{ color: 'rgba(0,212,255,0.22)' }}>
          STARK PROTOCOL v2.1 · ENCRYPTED
        </p>
      </motion.div>
    </div>
  );
}
