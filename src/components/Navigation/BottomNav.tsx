import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { Home, Lightbulb, CheckSquare, Users, Sparkles, Settings, TrendingUp, Newspaper, Flame, Brain, Compass } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUserProfile } from '../../hooks/useUserProfile';

export function BottomNav() {
  const { profile } = useUserProfile();

  const allItems = [
    { icon: Home,        label: 'INICIO',   path: '/',        key: 'dashboard' },
    { icon: TrendingUp,  label: 'MERCADO',  path: '/mercado', key: 'mercado' },
    { icon: Newspaper,   label: 'INTEL',    path: '/intel',   key: 'intel' },
    { icon: Sparkles,    label: 'AI',       path: '/chat',    key: 'chat' },
    { icon: Lightbulb,   label: 'IDEAS',    path: '/ideas',   key: 'ideas' },
    { icon: CheckSquare, label: 'TAREAS',   path: '/tasks',   key: 'tasks' },
    { icon: Users,       label: 'CRM',      path: '/crm',     key: 'crm' },
    { icon: Flame,       label: 'HÁBITOS',  path: '/habitos',    key: 'habitos' },
    { icon: Brain,       label: 'MENTE',    path: '/conciencia',   key: 'conciencia' },
    { icon: Compass,     label: 'OPT',      path: '/optimizacion', key: 'optimizacion' },
  ];

  const navItems = [
    ...allItems.filter(item => profile.modules[item.key as keyof typeof profile.modules]),
    { icon: Settings, label: 'CONFIG', path: '/settings', key: 'settings' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{
        background: 'rgba(6,6,14,0.92)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-end h-[60px] max-w-lg mx-auto overflow-x-auto no-scrollbar px-2">
        <div className="flex justify-around items-stretch min-w-full h-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center justify-center min-w-[52px] relative group"
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
                      style={{
                        width: 28,
                        background: 'var(--accent-main)',
                        boxShadow: '0 0 8px var(--color-accent)',
                      }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <item.icon
                    size={isActive ? 20 : 18}
                    className="transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)',
                      filter: isActive ? 'drop-shadow(0 0 6px var(--color-accent))' : 'none',
                    }}
                  />
                  <span
                    className="mt-0.5 font-black transition-all duration-200"
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.06em',
                      color: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
