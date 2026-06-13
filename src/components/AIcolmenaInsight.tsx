import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStreaks } from '../hooks/useStreaks';
import { callGroqFast } from '../services/groqService';

const CACHE_KEY = 'domex_insight_cache';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 horas

interface InsightContext {
  nombre: string;
  tareasCriticas: number;
  tareasCompletadas: number;
  totalTareas: number;
  streak: number;
  balance: number;
  btcChange: number;
  ideasActivas: number;
  proximaReunion: string;
}

async function fetchInsight(ctx: InsightContext): Promise<string> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { texto, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return texto;
    }
  } catch {}

  const prompt = `Sos el analista estratégico de ${ctx.nombre}.
Analizá su situación y dá UN insight accionable en máximo 2 líneas.

DATOS:
- Tareas críticas pendientes: ${ctx.tareasCriticas}
- Progreso hoy: ${ctx.tareasCompletadas}/${ctx.totalTareas} tareas completadas
- Racha: ${ctx.streak} días seguidos
- Balance actual: $${ctx.balance.toFixed(0)}
- BTC cambio 24h: ${ctx.btcChange >= 0 ? '+' : ''}${ctx.btcChange}%
- Ideas en ejecución: ${ctx.ideasActivas}
- Próxima reunión: ${ctx.proximaReunion}

Escribí texto directo y ejecutivo. Sin saludos, sin listas, sin markdown.
Empezá con el problema o la oportunidad más urgente.
Sé específico con los números del contexto.`;

  const texto = await callGroqFast(
    [{ role: 'user', content: prompt }],
    { maxTokens: 100, temperature: 0.5 }
  );

  const textoLimpio = texto.replace(/[*#_`]/g, '').trim();
  localStorage.setItem(CACHE_KEY, JSON.stringify({ texto: textoLimpio, timestamp: Date.now() }));
  return textoLimpio;
}

export default function AIcolmenaInsight() {
  const { tareas, ideas, balanceCalculado, mercado, agenda } = useApp();
  const { profile } = useUserProfile();
  const streak = useStreaks();
  const [insight, setInsight] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const ahora = new Date();
    const proximaReunion = agenda
      .filter(a => new Date(`${a.fecha}T${a.hora}`) > ahora)
      .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())[0];

    const ctx: InsightContext = {
      nombre: profile.identity.nombre || 'Operador',
      tareasCriticas: tareas.filter(t => t.prioridad === 'alta' && !t.completada).length,
      tareasCompletadas: tareas.filter(t => t.completada).length,
      totalTareas: tareas.length,
      streak,
      balance: balanceCalculado,
      btcChange: mercado.find(m => m.simbolo === 'BTC')?.cambio ?? 0,
      ideasActivas: ideas.filter(i => i.estado === 'ejecucion').length,
      proximaReunion: proximaReunion
        ? `${proximaReunion.titulo} a las ${proximaReunion.hora}`
        : 'ninguna',
    };

    fetchInsight(ctx)
      .then(setInsight)
      .catch(() => setInsight('Cerrá tus tareas críticas antes del mediodía para maximizar el score del día.'))
      .finally(() => setCargando(false));
  }, []); // Solo al montar — cache de 4h

  if (cargando) {
    return (
      <div className="animate-pulse h-16 rounded-2xl bg-white/5 border border-white/5" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/20 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
      <div className="flex gap-3 items-start relative z-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Sparkles className="text-white" size={16} />
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Foco Estratégico · IA</p>
          <p className="text-sm text-white/85 font-medium leading-relaxed">{insight}</p>
        </div>
      </div>
    </motion.div>
  );
}
