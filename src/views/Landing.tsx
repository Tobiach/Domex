import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Mic, Brain, TrendingUp, Play,
  CheckCircle2, Target, Users, Shield, Star,
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const PAIN_STATS = [
  { val: '65%', label: 'de los emprendedores se siente desbordado regularmente', src: 'Cerevity 2025' },
  { val: '10+', label: 'apps distintas que el emprendedor promedio usa cada día', src: 'Buildfire 2026' },
  { val: '50%', label: 'de los negocios pequeños nunca usó un CRM real', src: 'DemandSage 2026' },
];

const STEPS = [
  { num: '01', label: 'DICTÁS', desc: 'Hablás con AIcolmena por voz en español rioplatense. Tareas, gastos, reuniones, ideas. Sin tipear nada.' },
  { num: '02', label: 'AICOLMENA PROCESA', desc: 'La IA analiza, clasifica y registra todo en tiempo real. Sin fricción, sin listas de tareas eternas.' },
  { num: '03', label: 'VOS DECIDÍS', desc: 'Tu negocio claro y organizado. Sabés qué hacer hoy, qué seguir, y qué soltar.' },
];

const FEATURES = [
  { icon: Mic,        label: 'Voz inteligente',     desc: 'Dictá tareas, gastos y reuniones en español coloquial. Sin tipear.' },
  { icon: Brain,      label: 'IA con contexto',      desc: 'Groq analiza tu negocio específico y te da insights accionables.' },
  { icon: Users,      label: 'CRM de emprendedor',   desc: 'Pipeline de ventas, seguimientos y contactos en un solo lugar.' },
  { icon: TrendingUp, label: 'Capital en tiempo real',desc: 'Balance, crypto, ingresos y gastos. Todo visible de un vistazo.' },
  { icon: Target,     label: 'Hábitos y performance', desc: 'Rutinas, energía, hormonas, decisiones. Tu rendimiento optimizado.' },
  { icon: Shield,     label: 'Datos offline-first',  desc: 'Tu información es tuya. Local y privada. Sin dependencia de servidores.' },
];

const MODULES = [
  'Dashboard', 'AIcolmena AI', 'Ideas', 'Tareas', 'CRM', 'Capital',
  'Mercado', 'Intel Feed', 'Hábitos', 'Aprendizaje', 'Nutrición',
  'Memoria', 'Energía', 'Hormonas', 'Balance', 'Paths',
  'Biblioteca', 'Debate', 'Decision Log', 'Accountability', 'Legacy Builder',
];

const TESTIMONIALS = [
  {
    name: 'Martín R.', role: 'Emprendedor · Buenos Aires', initials: 'MR',
    text: 'Antes perdía 2 horas al día buscando dónde estaba cada cosa. Ahora dicto mientras camino y AIcolmena organiza todo.',
    stars: 5,
  },
  {
    name: 'Valeria M.', role: 'Freelancer · Rosario', initials: 'VM',
    text: 'El CRM de voz cambió cómo hago seguimiento de clientes. No pierdo más oportunidades por olvidarme de llamar.',
    stars: 5,
  },
  {
    name: 'Diego P.', role: 'Fundador startup · CDMX', initials: 'DP',
    text: 'Finalmente una app que entiende cómo piensa un emprendedor latinoamericano. No está diseñada para Silicon Valley.',
    stars: 5,
  },
];

const SPONSORS = [
  'GROWTHTECH', 'LATAM VC', 'STARTUP BA', 'ACELERADOR MX',
  'INNOVA HUB', 'EMPRENDE+', 'DIGITAL RISE', 'FOUNDERS LAB',
];

const MARKET_BARS = [
  { year: '2024', val: '$214B', pct: 25, color: 'var(--accent-main)' },
  { year: '2026', val: '$372B', pct: 43, color: 'var(--accent-main)' },
  { year: '2028', val: '$576B', pct: 67, color: '#FF6D28' },
  { year: '2030', val: '$864B', pct: 100, color: '#FF6D28' },
];

const IMPACT_STATS = [
  { val: '87%', label: 'de fundadores reportan burnout o ansiedad', color: '#FF6D28' },
  { val: '32%', label: 'del tiempo de ventas se pierde en carga manual', color: 'var(--accent-main)' },
  { val: '82%', label: 'de negocios fallan por mala gestión financiera', color: '#FF6D28' },
  { val: '4×',  label: 'crecimiento proyectado del mercado IA hacia 2030', color: 'var(--accent-main)' },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
      setEmail('');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#06060E] text-white overflow-x-hidden">
      <div className="scan-beam" />

      {/* FLOATING ORBS */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(0,212,255,0.05)' }}
        />
        <motion.div
          animate={{ y: [0, 28, 0], x: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'rgba(255,109,40,0.04)' }}
        />
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 9 }}
          className="absolute bottom-1/3 left-1/3 w-80 h-40 rounded-full blur-3xl"
          style={{ background: 'rgba(0,212,255,0.03)' }}
        />
      </div>

      {/* ── STICKY NAV ── */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(6,6,14,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,212,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="live-dot" />
            <span className="text-[20px] font-black tracking-tighter glow-cyan">AICOLMENA</span>
            <span className="sys-label ml-1" style={{ color: 'rgba(0,212,255,0.4)' }}>OS</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-[10px] font-black tracking-widest text-white/30 hover:text-white/70 transition-colors"
            >
              LISTA DE ESPERA
            </button>
            <button onClick={() => navigate('/onboarding')} className="hud-btn text-[10px]">
              ENTRAR →
            </button>
          </div>
        </div>
      </nav>

      {/* ── TOP BANNER ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-6 flex justify-center">
        <div
          className="flex items-center gap-2 py-2 px-5 rounded-full text-[10px] font-black tracking-[0.15em]"
          style={{ background: 'rgba(255,109,40,0.08)', border: '1px solid rgba(255,109,40,0.22)', color: '#FF6D28' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6D28]" style={{ animation: 'live-pulse 2s infinite' }} />
          IA GLOBAL: $214B → $864B PARA 2030 · 32% CAGR ANUAL · AICOLMENA ES TU VENTAJA
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span
              className="inline-block px-5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-6"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.28)', color: 'var(--accent-main)' }}
            >
              EARLY ACCESS · SOLO 30 LUGARES
            </span>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[1.05] mb-5">
              El <span className="glow-cyan">65%</span> de los<br />
              emprendedores se<br />
              siente desbordado.<br />
              <span style={{ color: '#FF6D28' }}>Nosotros los organizamos.</span>
            </h1>

            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-md">
              Dictá por voz. Gestioná tu negocio con IA. Tomá decisiones que importan.
              Un sistema operativo personal para emprendedores LATAM que van en serio.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/onboarding')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-[11px] tracking-widest text-black"
                style={{ background: 'var(--accent-main)', boxShadow: '0 0 28px rgba(0,212,255,0.4)' }}
              >
                QUIERO ACCESO EARLY ACCESS <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-[11px] tracking-widest text-white/50"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Play size={13} /> VER DEMO
              </motion.button>
            </div>

            <div className="flex items-center gap-6">
              {[
                { val: '15+', label: 'módulos' },
                { val: '<2s', label: 'carga' },
                { val: '29d', label: 'datos demo' },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-black glow-cyan">{val}</div>
                  <div className="sys-label text-[8px]">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* PHONE MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div
                className="relative rounded-[2.5rem] overflow-hidden"
                style={{
                  width: 260, height: 520,
                  border: '2px solid rgba(0,212,255,0.22)',
                  background: 'rgba(4,8,16,0.99)',
                  boxShadow: '0 0 60px rgba(0,212,255,0.1), 0 40px 80px rgba(0,0,0,0.7)',
                }}
              >
                <div className="p-5 pt-10 h-full flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="live-dot" />
                    <span className="text-[13px] font-black glow-cyan">AICOLMENA</span>
                    <span className="sys-label text-[8px]">ONLINE</span>
                  </div>

                  {[
                    { label: 'TAREAS DE HOY', val: '4 / 7', color: 'var(--accent-main)' },
                    { label: 'CRM — PIPELINE', val: '$2.400 USD', color: '#FF6D28' },
                    { label: 'RACHA DE HÁBITOS', val: '12 días', color: '#10B981' },
                    { label: 'BALANCE CAPITAL', val: '+$840 mes', color: 'var(--accent-main)' },
                  ].map(item => (
                    <div key={item.label} className="bm-card p-3">
                      <span className="sys-label text-[8px]">{item.label}</span>
                      <div className="text-[17px] font-black mt-0.5" style={{ color: item.color }}>{item.val}</div>
                    </div>
                  ))}

                  <div className="flex-1" />

                  <div className="flex justify-center">
                    <motion.div
                      animate={{ boxShadow: ['0 0 12px rgba(0,212,255,0.2)', '0 0 24px rgba(0,212,255,0.5)', '0 0 12px rgba(0,212,255,0.2)'] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,212,255,0.1)', border: '1.5px solid rgba(0,212,255,0.4)' }}
                    >
                      <Mic size={18} style={{ color: 'var(--accent-main)' }} />
                    </motion.div>
                  </div>
                  <p className="text-center sys-label text-[8px]">DICTÁ · AICOLMENA CLASIFICA</p>
                </div>
              </div>

              {/* Glow under phone */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-6 blur-xl"
                style={{ background: 'rgba(0,212,255,0.18)' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PAIN STATS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="sys-label">EL PROBLEMA QUE RESOLVEMOS</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">El emprendedor moderno vive en caos.</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PAIN_STATS.map(({ val, label, src }, i) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="bm-card p-7 text-center"
            >
              <div className="text-5xl font-black glow-cyan mb-3">{val}</div>
              <p className="text-white/50 text-xs leading-relaxed mb-3">{label}</p>
              <span className="sys-label text-[8px]" style={{ color: 'rgba(0,212,255,0.3)' }}>{src}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="hud-sep mb-10" />
        <div className="text-center mb-10">
          <span className="sys-label">CÓMO FUNCIONA</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">Tres pasos. Sin fricción.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(({ num, label, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.14 }}
              className="bm-card p-7"
            >
              <div className="text-5xl font-black mb-4" style={{ color: 'rgba(0,212,255,0.12)' }}>{num}</div>
              <div className="sys-label mb-2" style={{ color: 'var(--accent-main)' }}>{label}</div>
              <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI MARKET GROWTH ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bm-card p-8 sm:p-12"
          style={{ borderColor: 'rgba(255,109,40,0.18)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
            <div>
              <span className="sys-label" style={{ color: '#FF6D28' }}>EL MERCADO QUE ESTÁS MONTANDO</span>
              <h2 className="text-3xl font-black tracking-tighter mt-3 mb-4">
                La IA crece 4× en 6 años.<br />
                <span className="glow-cyan">Subite antes que todos.</span>
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-4">
                El mercado global de IA pasa de{' '}
                <strong className="text-white">$214B en 2024</strong> a{' '}
                <strong className="text-white">$864B en 2030</strong>.
                CAGR del 32%. Los emprendedores que se adapten ahora liderarán la próxima década.
              </p>
              <p className="text-white/30 text-xs leading-relaxed">
                Las apps de productividad con IA crecen al 9.2% anual —
                el segmento más rápido del software empresarial.
              </p>
            </div>

            <div className="space-y-4">
              {MARKET_BARS.map(({ year, val, pct, color }, i) => (
                <motion.div key={year} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="flex justify-between mb-1.5">
                    <span className="sys-label">{year}</span>
                    <span className="font-black text-[11px]" style={{ color }}>{val}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </motion.div>
              ))}
              <p className="sys-label text-[8px] mt-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
                FUENTE: MARKNTEL ADVISORS · STATISTA 2024
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <span className="sys-label">LO QUE INCLUYE</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">Un sistema completo, no una app más.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bm-card p-6 group"
              style={{ transition: 'border-color 0.2s' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.18)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent-main)' }} />
              </div>
              <p className="font-black text-sm text-white mb-1.5">{label}</p>
              <p className="text-[12px] text-white/38 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section id="demo" className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <span className="sys-label">DEMO EN VIVO</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">Mirá cómo funciona.</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden aspect-video flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(4,8,16,0.99)', border: '1px solid rgba(0,212,255,0.12)' }}
        >
          <div className="absolute inset-0 scanline" />

          {/* Animated grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-4 cursor-pointer" onClick={() => navigate('/onboarding')}>
            <motion.div
              animate={{ boxShadow: ['0 0 16px rgba(0,212,255,0.25)', '0 0 40px rgba(0,212,255,0.5)', '0 0 16px rgba(0,212,255,0.25)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1.5px solid rgba(0,212,255,0.45)' }}
            >
              <Play size={28} style={{ color: 'var(--accent-main)' }} />
            </motion.div>
            <div className="text-center">
              <p className="font-black text-white/70 text-sm mb-1">Probá en vivo →</p>
              <span className="sys-label">EMPEZAR GRATIS · 3 MIN</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MODULES SHOWCASE ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="hud-sep mb-10" />
        <div className="text-center mb-8">
          <span className="sys-label">LOS MÓDULOS</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">15+ sistemas integrados.</h2>
          <p className="text-white/35 text-sm mt-2">No necesitás otras apps. Todo está acá.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {MODULES.map((mod, i) => (
            <motion.span
              key={mod}
              initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="px-3 py-1.5 text-[10px] font-black tracking-[0.12em]"
              style={{
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid rgba(0,212,255,0.14)',
                borderRadius: 4,
                color: 'rgba(0,212,255,0.65)',
              }}
            >
              {mod.toUpperCase()}
            </motion.span>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <span className="sys-label">BETA USERS</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">Lo que dicen los primeros.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map(({ name, role, initials, text, stars }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bm-card p-6 flex flex-col gap-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star key={j} size={12} fill="#FF6D28" style={{ color: '#FF6D28' }} />
                ))}
              </div>
              <p className="text-white/55 text-sm leading-relaxed flex-1">"{text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] shrink-0"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--accent-main)' }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">{name}</p>
                  <p className="sys-label text-[9px]">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SPONSORS TICKER ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20 overflow-hidden">
        <div className="hud-sep mb-8" />
        <p className="text-center sys-label mb-6">RESPALDADO POR</p>

        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-20 z-10"
            style={{ background: 'linear-gradient(to right, #06060E, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 z-10"
            style={{ background: 'linear-gradient(to left, #06060E, transparent)' }}
          />

          <div className="overflow-hidden">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex gap-5 w-max"
            >
              {[...SPONSORS, ...SPONSORS].map((name, i) => (
                <div
                  key={i}
                  className="shrink-0 px-6 py-3 flex items-center justify-center"
                  style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, minWidth: 148 }}
                >
                  <span className="sys-label text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>{name}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="hud-sep mt-8" />
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <span className="sys-label">EL IMPACTO EN NÚMEROS</span>
          <h2 className="text-3xl font-black tracking-tighter mt-2">Por qué no podés seguir igual.</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {IMPACT_STATS.map(({ val, label, color }, i) => (
            <motion.div
              key={val}
              initial={{ opacity: 0, scale: 0.88 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bm-card p-6 text-center"
            >
              <div className="text-4xl font-black mb-2" style={{ color }}>{val}</div>
              <p className="sys-label text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── EMAIL CTA ── */}
      <section id="waitlist" className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bm-card p-10 text-center space-y-7"
          style={{ borderColor: 'rgba(0,212,255,0.18)', boxShadow: '0 0 80px rgba(0,212,255,0.05)' }}
        >
          <div>
            <span className="sys-label mb-2 block" style={{ color: '#FF6D28' }}>ACCESO LIMITADO</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3">
              Anotate antes de que se llene.
            </h2>
            <p className="text-white/38 text-sm max-w-sm mx-auto leading-relaxed">
              Solo 30 lugares en early access. Los primeros reciben onboarding personalizado sin costo.
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-6"
              style={{ color: '#10B981' }}
            >
              <CheckCircle2 size={22} />
              <span className="font-black tracking-widest text-sm">ANOTADO. TE CONTACTAMOS PRONTO.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-all"
              />
              <button
                type="submit" disabled={loading}
                className="px-7 py-3.5 rounded-xl font-black text-[10px] tracking-widest text-black transition-all shrink-0 active:scale-95"
                style={{
                  background: loading ? 'rgba(0,212,255,0.45)' : 'var(--accent-main)',
                  boxShadow: '0 0 22px rgba(0,212,255,0.35)',
                }}
              >
                {loading ? '...' : 'ANOTARME'}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-6 text-[10px] text-white/18">
            <span>✓ Sin spam</span>
            <span>✓ Cancelás cuando querés</span>
            <span>✓ Early access prioritario</span>
          </div>

          <p className="text-[10px] text-white/20 tracking-widest">
            ¿Ya tenés acceso?{' '}
            <button
              onClick={() => navigate('/onboarding')}
              className="underline hover:text-white/50 transition-colors"
              style={{ color: 'var(--accent-main)' }}
            >
              Entrá directo →
            </button>
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 max-w-5xl mx-auto px-6 pb-10">
        <div className="hud-sep mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="live-dot" />
            <span className="font-black glow-cyan">AICOLMENA</span>
            <span className="sys-label text-[9px]">OS · STARK PROTOCOL v2.1</span>
          </div>
          <p className="sys-label text-[9px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            © 2026 · MADE FOR LATAM ENTREPRENEURS
          </p>
        </div>
      </footer>
    </div>
  );
}
