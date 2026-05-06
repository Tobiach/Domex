import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { Home, Lightbulb, CheckSquare, Users, Sparkles, MoreHorizontal, TrendingUp, Newspaper } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUserProfile } from '../../hooks/useUserProfile';

export function BottomNav() {
  const { profile } = useUserProfile();

  const allItems = [
    { icon: Home, label: 'Inicio', path: '/', key: 'dashboard' },
    { icon: TrendingUp, label: 'Mercado', path: '/mercado', key: 'mercado' },
    { icon: Newspaper, label: 'Intel', path: '/intel', key: 'intel' },
    { icon: Sparkles, label: 'Domex AI', path: '/chat', key: 'chat' },
    { icon: Lightbulb, label: 'Laboratorio', path: '/ideas', key: 'ideas' },
    { icon: CheckSquare, label: 'Ejecución', path: '/tasks', key: 'tasks' },
    { icon: Users, label: 'Red', path: '/crm', key: 'crm' },
  ];

  const navItems = [
    ...allItems.filter(item => profile.modules[item.key as keyof typeof profile.modules]),
    { icon: MoreHorizontal, label: 'Menú', path: '/settings', key: 'settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-x-0 border-b-0 rounded-none rounded-t-[2.5rem] border-t-white/10 bg-black/80 backdrop-blur-2xl pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-end h-20 max-w-lg mx-auto overflow-x-auto no-scrollbar px-4">
        <div className="flex justify-around items-end min-w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center min-w-[72px] h-full pb-3 pt-5 transition-all duration-300 relative shrink-0",
                isActive ? "text-primary scale-110" : "text-white/30 hover:text-white/60"
              )}
            >
            {({ isActive }) => (
              <>
                <item.icon size={isActive ? 26 : 22} className={cn("transition-all duration-500", isActive && "drop-shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.8)]")} />
                <span className={cn(
                  "text-[9px] mt-1.5 font-black uppercase tracking-widest transition-opacity duration-300", 
                  isActive ? "opacity-100" : "opacity-40"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute top-0 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_var(--color-accent)]" 
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      </div>
    </nav>
  );
}
