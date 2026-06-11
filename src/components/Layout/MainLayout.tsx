import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../Navigation/BottomNav';
import { QuickActions } from '../Navigation/QuickActions';
import { useUserProfile } from '../../hooks/useUserProfile';
import FloatingMicButton from '../FloatingMicButton';
import HiveBackground from '../HiveBackground';
import BriefingMatutino, { useBriefing } from '../BriefingMatutino';
import { AnimatePresence as AP } from 'motion/react';
import AppTour, { TOUR_KEY } from '../AppTour';
import { AUTH_EMAIL_KEY } from '../../context/AuthContext';
import { useAgendaNotifications } from '../../hooks/useAgendaNotifications';
import { trackPage, trackModule, identifyUser } from '../../lib/analytics';
import { logEvent } from '../../services/eventLog';

const THEME_BG: Record<string, string> = {
  dark:     '#120D04',
  darker:   '#0D0802',
  midnight: '#080610',
  blackout: '#000000',
};

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { mostrar, cerrar, repetir } = useBriefing();
  const [showTour, setShowTour] = useState(false);

  const bgColor = THEME_BG[profile.visual?.theme ?? 'dark'] ?? '#06060E';
  const notifEnabled = localStorage.getItem('domex_notif_enabled') === 'true';
  useAgendaNotifications(notifEnabled);

  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
    return () => { document.body.style.backgroundColor = ''; };
  }, [bgColor]);

  // Identify user (solo hash del email, nunca el email real)
  useEffect(() => {
    const email = profile.identity.email;
    if (email) {
      const hash = btoa(email.toLowerCase()).slice(0, 16);
      identifyUser(hash, profile.identity.nombre || '?');
    }
  }, [profile.identity.email]);

  // Track page + module on route change
  useEffect(() => {
    const path = location.pathname;
    trackPage(path);
    const module = path === '/' ? 'dashboard' : path.replace(/\//g, '_').slice(1) || 'dashboard';
    trackModule(module);
    logEvent('modulo_visitado', module);
    const todayKey = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('aicolmena_last_open') !== todayKey) {
      logEvent('app_open');
      localStorage.setItem('aicolmena_last_open', todayKey);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!profile.onboardingCompleto) {
      navigate('/landing');
      return;
    }

    // Backward compat: if existing user has no auth session, set a legacy one
    if (!localStorage.getItem(AUTH_EMAIL_KEY)) {
      const legacyEmail = profile.identity.email || 'legacy_user';
      localStorage.setItem(AUTH_EMAIL_KEY, legacyEmail);
    }

    // Show tour once after onboarding
    if (!localStorage.getItem(TOUR_KEY)) {
      setShowTour(true);
    }
  }, [profile.onboardingCompleto, navigate]);

  return (
    <div className="min-h-screen text-white pb-32 selection:bg-primary/30 grid-bg" style={{ backgroundColor: bgColor }}>
      {/* Ambient bees */}
      <HiveBackground />
      {/* Moving scan beam */}
      <div className="scan-beam" />

      <header className="max-w-lg mx-auto px-5 pt-10" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-center">
          <Link to="/" className="group flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="live-dot" />
            <div>
              <span className="text-[22px] font-black tracking-tighter leading-none glow-honey">AICOLMENA</span>
              <span className="sys-label ml-2 align-middle" style={{ color: 'rgba(212,144,10,0.50)' }}>OS · ONLINE</span>
            </div>
          </Link>
          <Link to="/settings" className="relative group">
            <div
              className="w-10 h-10 flex items-center justify-center font-black text-xs transition-all"
              style={{
                color: 'var(--color-accent)',
                background: 'rgba(212,144,10,0.05)',
                border: '1px solid rgba(212,144,10,0.18)',
                borderRadius: 4,
              }}
            >
              {profile.identity.avatarUrl ? (
                <img src={profile.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover" style={{ borderRadius: 3 }} />
              ) : (
                profile.identity.iniciales
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#120D04] rounded-full" />
          </Link>
        </div>
        {/* Status bar */}
        <div className="hud-sep mt-3" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="sys-label" style={{ color: 'rgba(212,144,10,0.35)' }}>HIVE PROTOCOL v1.0 · ENCRYPTED</span>
          <span className="sys-label" style={{ color: 'rgba(212,144,10,0.35)' }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-8" style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet context={{ onRepetirBriefing: repetir }} />
          </motion.div>
        </AnimatePresence>
      </main>
      <QuickActions />
      <BottomNav />

      <AP>
        {mostrar && <BriefingMatutino onClose={cerrar} />}
      </AP>

      {/* New user tour */}
      {showTour && <AppTour onComplete={() => setShowTour(false)} />}
    </div>
  );
}
