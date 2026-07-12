import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useStreaks, getDailyScores } from '../hooks/useStreaks';
import { TrendingUp, TrendingDown, Flame, CheckSquare, Lightbulb, Users, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

type Periodo = '7d' | '30d' | 'todo';

export default function Insights() {
  const { tareas, ideas, transacciones, habitos } = useApp();
  const streak = useStreaks();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>('7d');

  const ahora = Date.now();
  const cutoff = periodo === '7d' ? ahora - 7 * 86400000 : periodo === '30d' ? ahora - 30 * 86400000 : 0;

  const txPeriodo = transacciones.filter(t => new Date(t.fecha ?? 0).getTime() >= cutoff);
  const ingresos = txPeriodo.filter(t => t.tipo === 'ingreso').reduce((a, t) => a + t.monto, 0);
  const gastos   = txPeriodo.filter(t => t.tipo === 'gasto').reduce((a, t) => a + t.monto, 0);
  const balance  = ingresos - gastos;

  const completadas = tareas.filter(t => t.completada).length;
  const pendientes  = tareas.filter(t => !t.completada).length;
  const habitosActivos = habitos.filter(h => h.racha > 0).length;

  const scores = getDailyScores().slice(-14);
  const scoreData = scores.map(d => ({ dia: d.fecha.slice(5), score: d.score }));

  // Ingresos vs gastos por día (últimos 7 días)
  const finData = (() => {
    const map: Record<string, { dia: string; ingresos: number; gastos: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(ahora - i * 86400000);
      const key = d.toISOString().split('T')[0];
      map[key] = { dia: key.slice(5), ingresos: 0, gastos: 0 };
    }
    transacciones.filter(t => new Date(t.fecha ?? 0).getTime() >= ahora - 7 * 86400000).forEach(t => {
      const key = new Date(t.fecha ?? 0).toISOString().split('T')[0];
      if (map[key]) map[key][t.tipo === 'ingreso' ? 'ingresos' : 'gastos'] += t.monto;
    });
    return Object.values(map);
  })();

  const hasData = tareas.length > 0 || transacciones.length > 0 || habitos.length > 0;

  const stats = [
    { label: 'Racha',       value: `${streak}d`,   icon: Flame,       color: 'var(--honey-bright)', big: true },
    { label: 'Completadas', value: completadas,     icon: CheckSquare, color: 'var(--success)' },
    { label: 'Pendientes',  value: pendientes,      icon: CheckSquare, color: 'var(--danger)' },
    { label: 'Hábitos',     value: habitosActivos,  icon: Flame,       color: 'var(--violet-soft)' },
    { label: 'Ideas',       value: ideas.length,    icon: Lightbulb,   color: 'var(--info)' },
    { label: 'CRM',         value: `${transacciones.length}tx`, icon: Users, color: 'var(--text-secondary)' },
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Insights
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Tu progreso de un vistazo</p>
        </div>
        <BarChart2 size={20} style={{ color: 'var(--honey-core)' }} />
      </div>

      {!hasData ? (
        <div className="bm-card p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Todavía no hay datos</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Usá la voz para dictar tareas, gastos e ideas. Acá vas a ver tus patrones.
          </p>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bm-card p-3 flex flex-col gap-1">
                <Icon size={14} style={{ color }} />
                <p className="text-lg font-black leading-none" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</p>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>{label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Score evolution */}
          {scoreData.length > 1 && (
            <div className="bm-card p-4">
              <p className="sys-label mb-3" style={{ color: 'var(--honey-soft)' }}>SCORE — ÚLTIMOS {scoreData.length} DÍAS</p>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={scoreData}>
                  <XAxis dataKey="dia" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 10 }}
                    labelStyle={{ color: 'var(--text-tertiary)' }}
                    itemStyle={{ color: 'var(--honey-bright)' }}
                    formatter={(v: number) => [`${v}pts`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--honey-core)" strokeWidth={2} dot={false}
                    style={{ filter: 'drop-shadow(0 0 4px var(--honey-core))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Finanzas */}
          <div className="bm-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="sys-label" style={{ color: 'var(--violet-soft)' }}>FINANZAS</p>
              <div className="flex gap-1">
                {(['7d', '30d', 'todo'] as Periodo[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider transition-all"
                    style={{
                      background: periodo === p ? 'var(--honey-glow)' : 'transparent',
                      color: periodo === p ? 'var(--honey-bright)' : 'var(--text-tertiary)',
                      border: `1px solid ${periodo === p ? 'rgba(201,148,26,0.3)' : 'transparent'}`,
                    }}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Ingresos</p>
                <p className="text-base font-black" style={{ color: 'var(--success)', fontFamily: 'var(--font-display)' }}>
                  +${ingresos.toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Gastos</p>
                <p className="text-base font-black" style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
                  -${gastos.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Balance</p>
                <p className="text-base font-black flex items-center gap-1" style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)', fontFamily: 'var(--font-display)' }}>
                  {balance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  ${Math.abs(balance).toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {finData.some(d => d.ingresos > 0 || d.gastos > 0) ? (
              <ResponsiveContainer width="100%" height={72}>
                <BarChart data={finData} barGap={2}>
                  <XAxis dataKey="dia" tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 10 }}
                    labelStyle={{ color: 'var(--text-tertiary)' }}
                    formatter={(v: number, name: string) => [`$${v.toLocaleString('es-AR')}`, name === 'ingresos' ? 'Ingresos' : 'Gastos']}
                  />
                  <Bar dataKey="ingresos" fill="var(--success)" radius={[3, 3, 0, 0]} opacity={0.8} />
                  <Bar dataKey="gastos" fill="var(--danger)" radius={[3, 3, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="sys-label text-center py-2" style={{ color: 'var(--text-tertiary)' }}>SIN MOVIMIENTOS EN EL PERÍODO</p>
            )}
          </div>

          {/* Links profundos */}
          <div className="bm-card p-4">
            <p className="sys-label mb-3" style={{ color: 'var(--violet-soft)' }}>MÁS PROFUNDO</p>
            <div className="space-y-1.5">
              {/* Conciencia se saco de este lugar prominente (poda de vistas) — solo via More */}
              {[
                { label: 'Intel & Noticias', path: '/intel', icon: '📡' },
                { label: 'Hábitos',          path: '/habitos', icon: '⚡' },
                { label: 'Optimización',     path: '/optimizacion', icon: '🎯' },
              ].map(({ label, path, icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all active:scale-[0.98]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <span>{icon}</span>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{label}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>›</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
