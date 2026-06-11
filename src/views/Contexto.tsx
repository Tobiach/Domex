import React, { useState } from 'react';
import { lazy, Suspense } from 'react';
import { CheckSquare, Lightbulb, DollarSign, Users } from 'lucide-react';

const Tasks   = lazy(() => import('./Tasks'));
const Ideas   = lazy(() => import('./Ideas'));
const Capital = lazy(() => import('./Capital'));
const CRM     = lazy(() => import('./CRM'));

const TABS = [
  { key: 'tareas',   label: 'Tareas',   icon: CheckSquare },
  { key: 'ideas',    label: 'Ideas',    icon: Lightbulb },
  { key: 'finanzas', label: 'Finanzas', icon: DollarSign },
  { key: 'personas', label: 'Personas', icon: Users },
] as const;

type Tab = typeof TABS[number]['key'];

const Loader = () => (
  <div className="space-y-3 pt-4">
    {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
  </div>
);

export default function Contexto() {
  const [tab, setTab] = useState<Tab>('tareas');

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar interno */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
              style={{
                background: active ? 'var(--violet-ghost)' : 'transparent',
                borderBottom: active ? '2px solid var(--honey-core)' : '2px solid transparent',
              }}
            >
              <Icon size={16} style={{ color: active ? 'var(--honey-bright)' : 'var(--text-tertiary)' }} />
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>
                {label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <Suspense fallback={<Loader />}>
        {tab === 'tareas'   && <Tasks />}
        {tab === 'ideas'    && <Ideas />}
        {tab === 'finanzas' && <Capital />}
        {tab === 'personas' && <CRM />}
      </Suspense>
    </div>
  );
}
