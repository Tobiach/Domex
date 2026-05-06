import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../Navigation/BottomNav';
import { QuickActions } from '../Navigation/QuickActions';
import { useUserProfile } from '../../hooks/useUserProfile';
import FloatingMicButton from '../FloatingMicButton';
import BriefingMatutino, { useBriefing } from '../BriefingMatutino';
import { AnimatePresence as AP } from 'motion/react';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { mostrar, cerrar } = useBriefing();

  useEffect(() => {
    if (!profile.onboardingCompleto && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [profile.onboardingCompleto, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-32 selection:bg-primary/30">
      <header className="max-w-lg mx-auto px-5 pt-10 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black italic tracking-tighter hover:opacity-80 transition-opacity">
          DOMEX
        </Link>
        <Link to="/settings" className="relative group">
          <div 
             className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-xs transition-all group-hover:border-primary/50 group-hover:scale-105"
             style={{ color: 'var(--color-accent)' }}
          >
            {profile.identity.avatarUrl ? (
              <img src={profile.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
            ) : (
              profile.identity.iniciales
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0F] rounded-full shadow-lg" />
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <QuickActions />
      <FloatingMicButton />
      <BottomNav />

      <AP>
        {mostrar && <BriefingMatutino onClose={cerrar} />}
      </AP>
    </div>
  );
}
