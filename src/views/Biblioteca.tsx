import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, BookOpen, Loader2, Star, Mic, MicOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resumirPodcast, resumirLibro } from '../services/bibliotecaService';
import type { PodcastEntry, BookEntry } from '../types';

type Tab = 'podcasts' | 'libros';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)}>
          <Star size={16} fill={s <= value ? '#F59E0B' : 'none'} style={{ color: s <= value ? '#F59E0B' : 'rgba(255,255,255,0.2)' }} />
        </button>
      ))}
    </div>
  );
}

export default function Biblioteca() {
  const { podcastEntries, agregarPodcast, bookEntries, agregarBook, actualizarRatingBook } = useApp();
  const [tab, setTab] = useState<Tab>('podcasts');
  const [showForm, setShowForm] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // Podcast form
  const [escuchando, setEscuchando] = useState(false);
  const [descripcionPodcast, setDescripcionPodcast] = useState('');
  const recognitionRef = React.useRef<any>(null);

  // Book form
  const [tituloLibro, setTituloLibro] = useState('');
  const [autorLibro, setAutorLibro] = useState('');

  // Detail view
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEntry | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookEntry | null>(null);

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (escuchando) {
      recognitionRef.current?.stop();
      setEscuchando(false);
      return;
    }
    const r = new SR();
    r.lang = 'es-AR';
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((res: any) => res[0].transcript).join(' ');
      setDescripcionPodcast(prev => prev + ' ' + t);
    };
    r.onend = () => setEscuchando(false);
    r.start();
    recognitionRef.current = r;
    setEscuchando(true);
  };

  const guardarPodcast = async () => {
    if (!descripcionPodcast.trim()) return;
    setProcesando(true);
    try {
      const analysis = await resumirPodcast(descripcionPodcast);
      const entry: PodcastEntry = { id: `pod_${Date.now()}`, ...analysis, creadoEn: new Date().toISOString() };
      agregarPodcast(entry);
      setDescripcionPodcast('');
      setShowForm(false);
    } catch {
      alert('Error al analizar. Intentá de nuevo.');
    }
    setProcesando(false);
  };

  const guardarLibro = async () => {
    if (!tituloLibro.trim() || !autorLibro.trim()) return;
    setProcesando(true);
    try {
      const analysis = await resumirLibro(tituloLibro, autorLibro);
      const entry: BookEntry = {
        id: `book_${Date.now()}`, titulo: tituloLibro, autor: autorLibro,
        ...analysis, rating: 0, completado: false, creadoEn: new Date().toISOString(),
      };
      agregarBook(entry);
      setTituloLibro(''); setAutorLibro('');
      setShowForm(false);
    } catch {
      alert('Error al resumir. Intentá de nuevo.');
    }
    setProcesando(false);
  };

  // Detail views
  if (selectedPodcast) {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setSelectedPodcast(null)} className="sys-label" style={{ color: 'var(--color-accent)' }}>← PODCASTS</button>
        <div>
          <span className="sys-label block mb-1" style={{ color: '#F97316' }}>{selectedPodcast.tema.toUpperCase()}</span>
          <h2 className="text-2xl font-black uppercase">{selectedPodcast.titulo}</h2>
        </div>
        <div className="bm-card p-4 space-y-3">
          <span className="sys-label" style={{ color: '#F97316' }}>IDEAS CLAVE</span>
          {selectedPodcast.ideas.map((idea, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="sys-value text-xs shrink-0" style={{ color: '#F97316' }}>0{i + 1}</span>
              <p className="text-[13px] leading-relaxed text-white/80">{idea}</p>
            </div>
          ))}
        </div>
        <div className="bm-card p-4 space-y-2">
          <span className="sys-label" style={{ color: '#10B981' }}>APLICAR HOY</span>
          {selectedPodcast.aplicables.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#10B981' }} />
              <p className="text-[13px] text-white/80">{a}</p>
            </div>
          ))}
        </div>
        <div className="bm-card p-4" style={{ borderColor: 'rgba(249,115,22,0.3)' }}>
          <span className="sys-label block mb-1" style={{ color: '#F97316' }}>LO MÁS IMPORTANTE</span>
          <p className="font-black text-base">{selectedPodcast.aprendizajeKey}</p>
        </div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <button onClick={() => setSelectedBook(null)} className="sys-label" style={{ color: 'var(--color-accent)' }}>← LIBROS</button>
        <div>
          <span className="sys-label block mb-1" style={{ color: '#6366F1' }}>{selectedBook.autor.toUpperCase()}</span>
          <h2 className="text-2xl font-black uppercase">{selectedBook.titulo}</h2>
          <StarRating value={selectedBook.rating} onChange={v => actualizarRatingBook(selectedBook.id, v)} />
        </div>
        <div className="bm-card p-4">
          <span className="sys-label block mb-2" style={{ color: '#6366F1' }}>RESUMEN EJECUTIVO</span>
          <p className="text-[13px] leading-relaxed text-white/80">{selectedBook.resumen}</p>
        </div>
        <div className="bm-card p-4 space-y-3">
          <span className="sys-label" style={{ color: '#6366F1' }}>IDEAS CLAVE</span>
          {selectedBook.ideasClave.map((idea, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="sys-value text-xs shrink-0" style={{ color: '#6366F1' }}>0{i + 1}</span>
              <p className="text-[13px] leading-relaxed text-white/80">{idea}</p>
            </div>
          ))}
        </div>
        <div className="bm-card p-4 space-y-2">
          <span className="sys-label" style={{ color: '#10B981' }}>CÓMO APLICARLO</span>
          {selectedBook.aplicaciones.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#10B981' }} />
              <p className="text-[13px] text-white/80">{a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="live-dot" />
          <span className="sys-label">APRENDIZAJE AVANZADO</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">Biblioteca</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['podcasts', 'libros'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl font-black uppercase transition-all"
            style={{
              fontSize: 10, letterSpacing: '0.1em',
              background: tab === t ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === t ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
              color: tab === t ? 'white' : 'rgba(255,255,255,0.3)',
            }}
          >
            {t === 'podcasts' ? '🎙 PODCASTS' : '📚 LIBROS'}
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest"
        style={{
          background: tab === 'podcasts' ? 'rgba(249,115,22,0.15)' : 'rgba(99,102,241,0.15)',
          border: `1px solid ${tab === 'podcasts' ? 'rgba(249,115,22,0.3)' : 'rgba(99,102,241,0.3)'}`,
          color: tab === 'podcasts' ? '#F97316' : '#6366F1',
        }}
      >
        + {tab === 'podcasts' ? 'AGREGAR PODCAST' : 'AGREGAR LIBRO'}
      </button>

      {/* List */}
      {tab === 'podcasts' && (
        <div className="space-y-2">
          {podcastEntries.length === 0 && (
            <div className="bm-card p-6 text-center">
              <Headphones size={24} style={{ color: '#F97316', margin: '0 auto 8px' }} />
              <p className="text-[11px] text-white/30">Dictá o escribí sobre un podcast y Groq extrae las ideas.</p>
            </div>
          )}
          {podcastEntries.map((p, i) => (
            <motion.button key={p.id} onClick={() => setSelectedPodcast(p)}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bm-card p-4 text-left relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: '#F97316' }} />
              <span className="sys-label block mb-0.5" style={{ color: '#F97316' }}>{p.tema.toUpperCase()}</span>
              <p className="font-black text-sm">{p.titulo}</p>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">{p.aprendizajeKey}</p>
            </motion.button>
          ))}
        </div>
      )}

      {tab === 'libros' && (
        <div className="space-y-2">
          {bookEntries.length === 0 && (
            <div className="bm-card p-6 text-center">
              <BookOpen size={24} style={{ color: '#6366F1', margin: '0 auto 8px' }} />
              <p className="text-[11px] text-white/30">Ingresá título + autor y Groq genera el resumen ejecutivo.</p>
            </div>
          )}
          {bookEntries.map((b, i) => (
            <motion.button key={b.id} onClick={() => setSelectedBook(b)}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bm-card p-4 text-left relative overflow-hidden">
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: '#6366F1' }} />
              <span className="sys-label block mb-0.5" style={{ color: '#6366F1' }}>{b.autor.toUpperCase()}</span>
              <p className="font-black text-sm">{b.titulo}</p>
              <StarRating value={b.rating} onChange={v => actualizarRatingBook(b.id, v)} />
            </motion.button>
          ))}
        </div>
      )}

      {/* Forms */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !procesando && setShowForm(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 pb-10 space-y-4"
              style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.08)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />

              {tab === 'podcasts' ? (
                <>
                  <span className="sys-label block" style={{ color: '#F97316' }}>RESUMIR PODCAST</span>
                  <p className="text-[11px] text-white/40">Dictá o escribí de qué trató el podcast.</p>
                  <div className="relative">
                    <textarea
                      value={descripcionPodcast}
                      onChange={e => setDescripcionPodcast(e.target.value)}
                      placeholder="Escuché un podcast sobre liderazgo con Simon Sinek donde habló de..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-[13px] leading-relaxed resize-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                    />
                    <button onClick={toggleMic} className="absolute right-3 bottom-3 p-1.5 rounded-lg"
                      style={{ background: escuchando ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' }}>
                      {escuchando ? <MicOff size={14} style={{ color: '#EF4444' }} /> : <Mic size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                    </button>
                  </div>
                  <button onClick={guardarPodcast} disabled={!descripcionPodcast.trim() || procesando}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white' }}>
                    {procesando ? <><Loader2 size={16} className="animate-spin" />ANALIZANDO...</> : <><Headphones size={16} />RESUMIR</>}
                  </button>
                </>
              ) : (
                <>
                  <span className="sys-label block" style={{ color: '#6366F1' }}>AGREGAR LIBRO</span>
                  <div>
                    <span className="sys-label block mb-1">TÍTULO</span>
                    <input value={tituloLibro} onChange={e => setTituloLibro(e.target.value)}
                      placeholder="El Poder del Ahora" className="w-full px-4 py-3 rounded-xl text-[14px]"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  </div>
                  <div>
                    <span className="sys-label block mb-1">AUTOR</span>
                    <input value={autorLibro} onChange={e => setAutorLibro(e.target.value)}
                      placeholder="Eckhart Tolle" className="w-full px-4 py-3 rounded-xl text-[14px]"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
                  </div>
                  <button onClick={guardarLibro} disabled={!tituloLibro.trim() || !autorLibro.trim() || procesando}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: 'white' }}>
                    {procesando ? <><Loader2 size={16} className="animate-spin" />RESUMIENDO...</> : <><BookOpen size={16} />GENERAR RESUMEN</>}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
