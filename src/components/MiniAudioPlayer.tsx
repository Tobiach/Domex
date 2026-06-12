import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, X, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export default function MiniAudioPlayer() {
  const { isPlaying, isPaused, title, pausar, reanudar, detener } = useAudioPlayer();
  const visible = isPlaying || isPaused;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="fixed left-4 right-4 max-w-sm mx-auto z-50 flex items-center gap-3 px-5 py-2.5"
          style={{
            bottom: 76,
            background: '#0F0D08',
            border: '1px solid rgba(201,148,26,0.3)',
            borderRadius: 20,
          }}
        >
          <Volume2 size={13} style={{ color: 'var(--honey-core)', flexShrink: 0 }} />

          <span
            className="flex-1 truncate"
            style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}
          >
            {title || 'Nova hablando...'}
          </span>

          <button
            onClick={isPaused ? reanudar : pausar}
            className="flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{ width: 44, height: 44, background: 'rgba(201,148,26,0.12)', border: '1px solid rgba(201,148,26,0.2)', flexShrink: 0 }}
            aria-label={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused
              ? <Play size={16} style={{ color: 'var(--honey-bright)', marginLeft: 2 }} />
              : <Pause size={16} style={{ color: 'var(--honey-bright)' }} />
            }
          </button>

          <button
            onClick={detener}
            className="flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
            aria-label="Detener"
          >
            <X size={14} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
