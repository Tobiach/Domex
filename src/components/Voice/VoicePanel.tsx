import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, AlertTriangle, Loader2, RotateCcw, X,
  CalendarDays, CheckSquare, TrendingDown, TrendingUp, Lightbulb, FileText, MessageCircle,
  Flame, Users, Compass,
} from 'lucide-react';
import { VoiceEstado } from '../../hooks/useVoiceEngine';
import { VoiceIntelligenceResult } from '../../services/voiceProcessor';
import { cn } from '../../lib/utils';

// ─── Waveform ────────────────────────────────────────────────────────────────

const BAR_HEIGHTS = [0.35, 0.65, 1, 0.55, 0.8, 0.4, 0.9, 0.5, 0.75, 0.3, 0.7, 0.45];

function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: 'var(--accent-main)', transformOrigin: 'bottom' }}
          animate={
            active
              ? {
                  height: [`${h * 10}px`, `${Math.max(h, 1 - h + 0.2) * 36}px`, `${h * 10}px`],
                  opacity: [0.45, 1, 0.45],
                }
              : { height: '3px', opacity: 0.2 }
          }
          transition={{
            duration: 0.55 + (i % 4) * 0.12,
            repeat: active ? Infinity : 0,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIA_META: Record<string, { label: string; color: string; Icon: React.FC<any> }> = {
  tarea:      { label: 'TAREA GUARDADA',     color: '#10B981', Icon: CheckSquare },
  reunion:    { label: 'REUNIÓN AGENDADA',   color: '#3B82F6', Icon: CalendarDays },
  gasto:      { label: 'GASTO REGISTRADO',   color: '#F59E0B', Icon: TrendingDown },
  ingreso:    { label: 'INGRESO REGISTRADO', color: '#10B981', Icon: TrendingUp },
  idea:       { label: 'IDEA GUARDADA',      color: '#EC4899', Icon: Lightbulb },
  nota:       { label: 'NOTA GUARDADA',      color: 'var(--color-accent)', Icon: FileText },
  habito:     { label: 'HÁBITO CREADO',      color: '#F97316', Icon: Flame },
  crm:        { label: 'CONTACTO GUARDADO',  color: '#8B5CF6', Icon: Users },
  navegacion: { label: 'NAVEGANDO...',       color: 'rgba(255,255,255,0.6)', Icon: Compass },
};

const EXAMPLE_COMMANDS = [
  '"Agregar tarea llamar al contador"',
  '"Reunión mañana 10am con Lucas"',
  '"Gasté 500 pesos en nafta"',
  '"Quiero meditar cada mañana"',
  '"Guardá a Martín como lead de CRM"',
  '"Ir a hábitos"',
];

// ─── Sub-panels ───────────────────────────────────────────────────────────────

function ListeningPanel({
  transcriptLive,
  onCancelar,
}: {
  transcriptLive: string;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 1 }}>
            ESCUCHANDO...
          </span>
        </div>
        <button
          onClick={onCancelar}
          aria-label="Cancelar"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <X size={14} />
        </button>
      </div>

      <VoiceWaveform active={true} />

      {/* Live transcript — most critical UX element */}
      <div className="min-h-[52px] flex items-center">
        <AnimatePresence mode="wait">
          {transcriptLive ? (
            <motion.p
              key="transcript"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[19px] font-black tracking-tight text-white leading-snug"
            >
              "{transcriptLive}"
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13px] text-white/20 font-medium italic"
            >
              Hablá ahora — Colmena está escuchando...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="sys-label text-center">
        TOCÁ EL BOTÓN O DETENÉ AL TERMINAR
      </p>
    </div>
  );
}

function ProcessingPanel({ transcriptFinal }: { transcriptFinal: string }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
        >
          <Loader2 size={13} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
        </div>
        <span className="sys-label" style={{ color: 'var(--color-accent)', opacity: 1 }}>
          ANALIZANDO COMANDO...
        </span>
      </div>

      {/* Show exactly what was heard before sending to AI */}
      <div className="bm-card p-4">
        <span className="sys-label block mb-2">COMANDO DETECTADO</span>
        <p className="text-[16px] font-black tracking-tight text-white leading-snug">
          "{transcriptFinal}"
        </p>
      </div>

      {/* Staggered processing dots */}
      <div className="flex items-center justify-center gap-2 py-1">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent-main)' }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </div>
    </div>
  );
}

function SuccessPanel({ resultado, onCancelar }: { resultado: VoiceIntelligenceResult; onCancelar: () => void }) {
  const isCMD = resultado.tipo === 'COMANDO';
  const meta = CATEGORIA_META[resultado.categoria ?? ''] ?? {
    label: 'COMPLETADO',
    color: '#10B981',
    Icon: MessageCircle,
  };
  const { Icon } = meta;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={13} className="text-emerald-400" />
        <span className="sys-label" style={{ color: '#10B981', opacity: 1 }}>
          {isCMD ? meta.label : 'RESPUESTA DE COLMENA'}
        </span>
        <span className="sys-label ml-auto" style={{ color: 'rgba(255,255,255,0.15)', opacity: 1 }}>
          CONFIANZA {resultado.confianza}%
        </span>
        <button
          onClick={onCancelar}
          aria-label="Cerrar y detener voz"
          className="w-7 h-7 rounded flex items-center justify-center text-white/30 hover:text-white/70 transition-colors ml-1"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <X size={13} />
        </button>
      </div>

      {isCMD ? (
        <div
          className="bm-card p-4 space-y-2"
          style={{ '--bm-accent': meta.color } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              <Icon size={13} style={{ color: meta.color }} />
            </div>
            <span className="sys-label" style={{ color: meta.color, opacity: 1 }}>
              {meta.label}
            </span>
          </div>

          {resultado.datos?.titulo && (
            <p className="text-[17px] font-black tracking-tight leading-snug">
              {resultado.datos.titulo}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            {resultado.datos?.fecha && (
              <span className="sys-label">{resultado.datos.fecha}</span>
            )}
            {resultado.datos?.hora && (
              <span className="sys-label">· {resultado.datos.hora}</span>
            )}
            {resultado.datos?.monto != null && resultado.datos.monto > 0 && (
              <span className="text-[13px] font-black sys-value text-amber-400">
                ${resultado.datos.monto.toLocaleString('es-AR')}
              </span>
            )}
            {resultado.datos?.personas && resultado.datos.personas.length > 0 && (
              <span className="sys-label">
                · {resultado.datos.personas.join(', ')}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* For PREGUNTA / CONVERSACIÓN types */
        <div className="bm-card p-4">
          <p className="text-[14px] text-white/70 leading-relaxed font-medium">
            {resultado.respuestaAlUsuario}
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <div className="live-dot" style={{ width: 5, height: 5 }} />
        <p className="sys-label" style={{ color: 'rgba(255,255,255,0.2)', opacity: 1 }}>HABLANDO... · X PARA DETENER</p>
      </div>
    </div>
  );
}

function ErrorPanel({
  errorMsg,
  onReintentar,
  onCancelar,
}: {
  errorMsg: string;
  onReintentar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <AlertTriangle size={13} className="text-red-400" />
        <span className="sys-label" style={{ color: '#EF4444', opacity: 1 }}>
          NO PUDE PROCESARLO
        </span>
      </div>

      <div
        className="rounded-xl p-3.5"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <p className="text-[13px] text-white/55 leading-relaxed">{errorMsg}</p>
      </div>

      {/* Contextual examples help users understand what to say */}
      <div>
        <span className="sys-label block mb-2">INTENTÁ DECIR</span>
        <div className="space-y-1.5">
          {EXAMPLE_COMMANDS.map((cmd, i) => (
            <div
              key={i}
              className="bm-card px-3 py-2.5"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-[12px] text-white/40 font-medium">{cmd}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onReintentar}
          className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all active:scale-98"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <RotateCcw size={13} />
          REINTENTAR
        </button>
        <button
          onClick={onCancelar}
          className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface VoicePanelProps {
  visible: boolean;
  estado: VoiceEstado;
  transcriptLive: string;
  transcriptFinal: string;
  resultado: VoiceIntelligenceResult | null;
  errorMsg: string;
  onCancelar: () => void;
  onReintentar: () => void;
}

export function VoicePanel({
  visible,
  estado,
  transcriptLive,
  transcriptFinal,
  resultado,
  errorMsg,
  onCancelar,
  onReintentar,
}: VoicePanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — tap to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={estado !== 'processing' ? onCancelar : undefined}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(6,6,14,0.72)', backdropFilter: 'blur(6px)' }}
          />

          {/* Bottom sheet — spring entrance */}
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg"
            style={{
              background: '#07070F',
              border: '1px solid rgba(255,255,255,0.07)',
              borderBottom: 'none',
              borderRadius: '22px 22px 0 0',
              boxShadow: '0 -24px 64px rgba(0,0,0,0.85)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-9 h-[3px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Content — animate between states */}
            <div className="px-6 pb-10 pt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={estado}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {estado === 'listening' && (
                    <ListeningPanel
                      transcriptLive={transcriptLive}
                      onCancelar={onCancelar}
                    />
                  )}
                  {estado === 'processing' && (
                    <ProcessingPanel transcriptFinal={transcriptFinal} />
                  )}
                  {estado === 'success' && resultado && (
                    <SuccessPanel resultado={resultado} onCancelar={onCancelar} />
                  )}
                  {estado === 'error' && (
                    <ErrorPanel
                      errorMsg={errorMsg}
                      onReintentar={onReintentar}
                      onCancelar={onCancelar}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
