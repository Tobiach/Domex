import { useState, useEffect, useCallback } from 'react';
import { UserProfile, DEFAULT_PROFILE } from '../types';

const STORAGE_KEY = 'domex_profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge with default to handle new fields in future updates
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          identity: { ...DEFAULT_PROFILE.identity, ...parsed.identity },
          visual: { ...DEFAULT_PROFILE.visual, ...parsed.visual },
          modules: { ...DEFAULT_PROFILE.modules, ...parsed.modules },
          goals: { ...DEFAULT_PROFILE.goals, ...parsed.goals },
        };
      } catch (e) {
        console.error('Error parsing profile', e);
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const updateCSSVariables = useCallback((color: string) => {
    const root = document.documentElement;
    root.style.setProperty('--accent-main', color);
    // Calcular versiones con opacidad (formato hex + opacidad en hex)
    root.style.setProperty('--accent-10', `${color}1A`);
    root.style.setProperty('--accent-20', `${color}33`);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
    setProfile(prev => {
      const next = typeof updates === 'function' ? updates(prev) : {
        ...prev,
        ...updates,
        identity: updates.identity ? { ...prev.identity, ...updates.identity } : prev.identity,
        visual: updates.visual ? { ...prev.visual, ...updates.visual } : prev.visual,
        modules: updates.modules ? { ...prev.modules, ...updates.modules } : prev.modules,
        goals: updates.goals ? { ...prev.goals, ...updates.goals } : prev.goals,
      };

      // Auto-calcular iniciales
      if (next.identity.nombre || next.identity.apellido) {
        const n = next.identity.nombre.charAt(0) || '';
        const a = next.identity.apellido.charAt(0) || '';
        next.identity.iniciales = (n + a).toUpperCase() || 'DX';
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    updateCSSVariables(profile.visual.accentColor);
  }, [profile.visual.accentColor, updateCSSVariables]);

  return {
    profile,
    updateProfile,
    resetProfile,
  };
}

export function useAccentColor() {
  const { profile } = useUserProfile();
  return profile.visual.accentColor;
}
