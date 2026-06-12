import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Bell, Mic, Palette, Flame, CheckSquare, Lightbulb } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useStreaks } from '../hooks/useStreaks';

function ResumenSemanal({ tareas, habitos, transacciones, learningLessons }: {
  tareas: any[]; habitos: any[]; transacciones: any[]; learningLessons: any[];
}) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const tareasCompletadas = tareas.filter(t => t.completada).length;
  const totalTareas = tareas.length;
  const habitosActivos = habitos.length;
  const rachaMax = habitos.reduce((max: number, h: any) => Math.max(max, h.racha ?? 0), 0);
  const gastosEstaSemana = transacciones
    .filter((t: any) => t.tipo === 'gasto' && t.fecha >= sevenDaysAgo)
    .reduce((sum: number, t: any) => sum + t.monto, 0);
  const briefingsEscuchados = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    return !!localStorage.getItem('domex_briefing_escuchado_' + d);
  }).filter(Boolean).length;
  const leccionesCompletadas = learningLessons.filter((l: any) => l.completado).length;
  const hayDatos = tareasCompletadas > 0 || habitosActivos > 0 || gastosEstaSemana > 0 || briefingsEscuchados > 0 || leccionesCompletadas > 0;

  return (
    <div className="bm-card p-4" style={{ background: 'var(--bg-surface-warm)', border: '1px solid rgba(201,148,26,0.15)' }}>
      <p className="sys-label mb-3" style={{ color: 'var(--honey-core)', opacity: 1 }}>RESUMEN DE LA SEMANA</p>
      {!hayDatos ? (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Empezá a usar AIcolmena y acá vas a ver tu resumen.
        </p>
      ) : (
        <div className="space-y-2">
          {totalTareas > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tareas completadas</span>
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {tareasCompletadas} de {totalTareas}
              </span>
            </div>
          )}
          {habitosActivos > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Hábitos activos</span>
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {habitosActivos} · racha máx. {rachaMax}d
              </span>
            </div>
          )}
          {gastosEstaSemana > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Gastos esta semana</span>
              <span className="text-xs font-black" style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
                −${gastosEstaSemana.toLocaleString('es-AR')}
              </span>
            </div>
          )}
          {briefingsEscuchados > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Briefings escuchados</span>
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {briefingsEscuchados} de 7
              </span>
            </div>
          )}
          {leccionesCompletadas > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Lecciones completadas</span>
              <span className="text-xs font-black" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {leccionesCompletadas}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Yo() {
  const { profile } = useUserProfile();
  const { logout } = useAuth();
  const { tareas, ideas, transacciones, habitos, learningLessons } = useApp();
  const streak = useStreaks();
  const navigate = useNavigate();

  const nombre = profile.identity.nombre || 'Emprendedor';
  const iniciales = profile.identity.iniciales || nombre.slice(0, 2).toUpperCase();

  const completadas = tareas.filter(t => t.completada).length;
  const balance = transacciones.reduce((a, t) => t.tipo === 'ingreso' ? a + t.monto : a - t.monto, 0);

  const usageStats = [
    { icon: Flame,       label: 'Racha',      value: `${streak} días`,   color: 'var(--honey-bright)' },
    { icon: CheckSquare, label: 'Completadas', value: completadas,        color: 'var(--success)' },
    { icon: Lightbulb,   label: 'Ideas',       value: ideas.length,       color: 'var(--info)' },
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Avatar + nombre */}
      <div className="flex items-center gap-4 pt-1">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black overflow-hidden flex-shrink-0"
          style={{ background: 'var(--violet-ghost)', border: '1px solid var(--border-default)', color: 'var(--violet-soft)', fontFamily: 'var(--font-display)' }}
        >
          {profile.identity.avatarUrl
            ? <img src={profile.identity.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            : iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black tracking-tight truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{nombre}</h1>
          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{profile.identity.email || 'Sin email'}</p>
          <span className="chip mt-1">Beta · Plan Gratis</span>
        </div>
      </div>

      {/* Resumen semanal */}
      <ResumenSemanal tareas={tareas} habitos={habitos} transacciones={transacciones} learningLessons={learningLessons} />

      {/* Stats de uso */}
      <div className="grid grid-cols-3 gap-2">
        {usageStats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bm-card p-3 text-center">
            <Icon size={16} style={{ color }} className="mx-auto mb-1" />
            <p className="text-base font-black leading-none" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</p>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginTop: 2 }}>{label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Balance */}
      <div className="bm-card p-4 flex items-center justify-between">
        <div>
          <p className="sys-label mb-1">BALANCE NETO</p>
          <p className="text-xl font-black" style={{
            fontFamily: 'var(--font-display)',
            color: balance >= 0 ? 'var(--success)' : 'var(--danger)',
          }}>
            {balance >= 0 ? '+' : ''}${Math.abs(balance).toLocaleString('es-AR')}
          </p>
        </div>
        <button onClick={() => navigate('/capital')} className="chip-honey text-xs">Ver capital →</button>
      </div>

      <div className="hud-sep" />

      {/* Acciones */}
      <div className="space-y-1.5">
        {[
          { icon: Settings, label: 'Configuración completa', action: () => navigate('/settings') },
          { icon: Mic,      label: 'Preferencias de voz',    action: () => navigate('/settings') },
          { icon: Bell,     label: 'Notificaciones',          action: () => navigate('/settings') },
          { icon: Palette,  label: 'Tema y apariencia',       action: () => navigate('/settings') },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <Icon size={16} style={{ color: 'var(--violet-soft)' }} />
            <span className="text-sm font-medium flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      {/* Plan */}
      <div className="bm-card p-4">
        <p className="sys-label mb-1" style={{ color: 'var(--violet-soft)' }}>PLAN ACTUAL</p>
        <p className="text-lg font-black mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Gratis · Beta</p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Acceso completo durante el beta. Sin límites.</p>
        <button
          className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'var(--honey-core)', color: 'var(--text-on-honey)', boxShadow: 'var(--glow-honey)' }}
          onClick={() => navigate('/settings')}
        >
          Ver planes →
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => logout()}
        className="flex items-center gap-2 text-sm mx-auto py-2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--danger)' }}
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );
}
