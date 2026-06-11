import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Flame, ChevronLeft, Check, Volume2, X, Loader2, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LearningCategory, LearningLesson } from '../types';
import { generarLecciones, resumirContenidoExterno } from '../services/learningService';
import { hablarTexto } from '../services/voiceService';

const PRESET_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#F97316', '#EC4899'];
const PRESET_ICONS = ['📚', '🧠', '💡', '🎯', '💰', '🔬', '🎨', '⚡', '🏋️', '🧘'];

// ─── Subvista: Detalle de categoría ──────────────────────────────────────────

function CategoryView({
  cat,
  lessons,
  onBack,
  onCompleteLesson,
  onAddExternal,
}: {
  cat: LearningCategory;
  lessons: LearningLesson[];
  onBack: () => void;
  onCompleteLesson: (id: string, catId: string) => void;
  onAddExternal: (desc: string) => void;
}) {
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null);
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [externalInput, setExternalInput] = useState('');
  const [addingExternal, setAddingExternal] = useState(false);

  const completadas = lessons.filter(l => l.completado).length;

  const handleAddExternal = async () => {
    if (!externalInput.trim()) return;
    setAddingExternal(true);
    await onAddExternal(externalInput.trim());
    setAddingExternal(false);
    setExternalInput('');
    setShowAddExternal(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 pb-2">
        <header className="flex items-center gap-3 pt-1">
          <button onClick={onBack} className="w-9 h-9 bm-card flex items-center justify-center">
            <ChevronLeft size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              {cat.racha > 0 && (
                <span className="flex items-center gap-1 sys-label" style={{ color: '#F97316', opacity: 1 }}>
                  <Flame size={9} />🔥{cat.racha}d
                </span>
              )}
              <span className="sys-label">{completadas}/{lessons.length} COMPLETADAS</span>
            </div>
            <h1 className="text-[18px] font-black tracking-tight leading-none">
              <span className="mr-2">{cat.icono}</span>{cat.nombre}
            </h1>
          </div>
          <button
            onClick={() => setShowAddExternal(true)}
            className="h-9 px-3 flex items-center gap-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest"
            style={{ background: `${cat.colorAccent}18`, border: `1px solid ${cat.colorAccent}30`, color: cat.colorAccent }}
          >
            <Plus size={12} />
            AGREGAR
          </button>
        </header>

        {/* Barra de progreso */}
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: cat.colorAccent }}
            initial={{ width: 0 }}
            animate={{ width: lessons.length > 0 ? `${(completadas / lessons.length) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Lista de lecciones */}
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bm-card p-4 relative overflow-hidden"
              style={lesson.completado ? { opacity: 0.65 } : {}}
            >
              <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r"
                style={{ background: lesson.completado ? '#10B981' : cat.colorAccent }} />

              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="sys-label">
                      {lesson.tipoContenido === 'user-external' ? '🔗 EXTERNO' : 'IA GENERADO'}
                    </span>
                    <span className="sys-label">· {lesson.duracionEstimada} MIN</span>
                    {lesson.completado && (
                      <span className="sys-label" style={{ color: '#10B981', opacity: 1 }}>· ✓ HECHO</span>
                    )}
                  </div>
                  <p className="text-[13px] font-bold leading-snug">{lesson.titulo}</p>
                  {lesson.fuente && (
                    <p className="sys-label mt-1 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <ExternalLink size={8} className="inline mr-1" />
                      {lesson.fuente}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedLesson(lesson)}
                    className="h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                    style={{ background: `${cat.colorAccent}18`, border: `1px solid ${cat.colorAccent}28`, color: cat.colorAccent }}
                  >
                    LEER
                  </button>
                  <button
                    onClick={() => hablarTexto(lesson.contenido, 1.05)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Volume2 size={12} className="text-white/30" />
                  </button>
                  {!lesson.completado && (
                    <button
                      onClick={() => onCompleteLesson(lesson.id, lesson.categoriaId)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <Check size={12} style={{ color: '#10B981' }} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {lessons.length === 0 && (
            <div className="bm-card p-8 text-center">
              <Loader2 size={20} className="animate-spin mx-auto mb-3" style={{ color: cat.colorAccent }} />
              <p className="sys-label">GENERANDO LECCIONES CON IA...</p>
            </div>
          )}
        </div>

        <div className="h-20" />
      </div>

      {/* Modal: Agregar contenido externo */}
      <AnimatePresence>
        {showAddExternal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddExternal(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
              style={{ background: '#07070F', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', borderRadius: '22px 22px 0 0' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="px-6 pb-10 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="sys-label" style={{ color: cat.colorAccent, opacity: 1 }}>AGREGAR CONTENIDO EXTERNO</span>
                  <button onClick={() => setShowAddExternal(false)}>
                    <X size={14} className="text-white/30" />
                  </button>
                </div>
                <p className="text-[11px] text-white/30">
                  Describí el artículo, video o libro que querés agregar. Groq lo resume automáticamente.
                </p>
                <textarea
                  value={externalInput}
                  onChange={e => setExternalInput(e.target.value)}
                  placeholder='Ej: "Artículo de HBR sobre liderazgo en tiempos de crisis"'
                  rows={3}
                  className="w-full rounded-xl p-3 text-[13px] text-white bg-transparent resize-none outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button
                  onClick={handleAddExternal}
                  disabled={addingExternal || !externalInput.trim()}
                  className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: cat.colorAccent, color: '#fff' }}
                >
                  {addingExternal ? <><Loader2 size={13} className="animate-spin" /> PROCESANDO...</> : 'AGREGAR Y RESUMIR'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Leer lección */}
      <AnimatePresence>
        {selectedLesson && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLesson(null)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto max-h-[85vh] overflow-y-auto"
              style={{ background: '#07070F', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', borderRadius: '22px 22px 0 0' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="px-6 pb-10 pt-2 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="sys-label block mb-1">{selectedLesson.duracionEstimada} MIN · {selectedLesson.tipoContenido === 'ai-generated' ? 'AICOLMENA IA' : 'EXTERNO'}</span>
                    <h2 className="text-[16px] font-black leading-snug">{selectedLesson.titulo}</h2>
                  </div>
                  <button onClick={() => setSelectedLesson(null)}>
                    <X size={14} className="text-white/30 shrink-0" />
                  </button>
                </div>

                <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-line">
                  {selectedLesson.contenido.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => hablarTexto(selectedLesson.contenido, 1.05)}
                    className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    <Volume2 size={12} /> ESCUCHAR
                  </button>
                  {!selectedLesson.completado && (
                    <button
                      onClick={() => {
                        onCompleteLesson(selectedLesson.id, selectedLesson.categoriaId);
                        setSelectedLesson(null);
                      }}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest"
                      style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}
                    >
                      <Check size={12} /> COMPLETADA
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Vista principal: lista de categorías ────────────────────────────────────

export default function Aprendizaje() {
  const navigate = useNavigate();
  const { learningCategories, learningLessons, agregarCategoriaAprendizaje, agregarLeccion, completarLeccion } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');
  const [newIcon, setNewIcon] = useState('📚');

  const selectedCat = learningCategories.find(c => c.id === selectedCatId) ?? null;
  const catLessons = selectedCatId ? learningLessons.filter(l => l.categoriaId === selectedCatId) : [];

  const handleCreateCategory = async () => {
    if (!newName.trim()) return;
    setGenerating(true);
    const cat: LearningCategory = {
      id: `cat_${Date.now()}`,
      nombre: newName.trim(),
      descripcion: newDesc,
      colorAccent: newColor,
      icono: newIcon,
      racha: 0,
      ultimoDia: null,
      creadoEn: new Date().toISOString(),
    };
    agregarCategoriaAprendizaje(cat);
    setShowCreate(false);
    setSelectedCatId(cat.id);
    setNewName('');
    setNewDesc('');
    try {
      const lecciones = await generarLecciones(cat.nombre, cat.id);
      lecciones.forEach(l => agregarLeccion(l));
    } catch {
      // categoría queda vacía — usuario puede agregar contenido externo
    }
    setGenerating(false);
  };

  const handleAddExternal = async (desc: string) => {
    if (!selectedCatId) return;
    try {
      const lesson = await resumirContenidoExterno(desc, selectedCatId);
      agregarLeccion(lesson);
    } catch {
      // falla silenciosamente — el usuario puede intentarlo de nuevo
    }
  };

  // Vista: detalle de categoría
  if (selectedCat) {
    return (
      <CategoryView
        cat={selectedCat}
        lessons={catLessons}
        onBack={() => setSelectedCatId(null)}
        onCompleteLesson={(lessonId, catId) => completarLeccion(lessonId, catId)}
        onAddExternal={handleAddExternal}
      />
    );
  }

  // Vista: lista de categorías
  return (
    <>
      <div className="flex flex-col gap-3 pb-2">
        <header className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button onClick={() => navigate('/conciencia')} className="flex items-center gap-1 sys-label hover:opacity-70 transition-opacity">
                ← CONCIENCIA
              </button>
            </div>
            <h1 className="text-[22px] font-black tracking-tight uppercase">Aprendizaje</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#6366F118', border: '1px solid #6366F130' }}
          >
            <Plus size={16} style={{ color: '#6366F1' }} />
          </button>
        </header>

        {learningCategories.length === 0 ? (
          <div className="bm-card p-8 text-center space-y-3">
            <BookOpen size={28} style={{ color: '#6366F1', margin: '0 auto', opacity: 0.5 }} />
            <p className="text-[14px] font-bold">Sin categorías</p>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Creá una categoría y Groq genera 5 lecciones automáticamente.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mx-auto flex items-center gap-2 h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
              style={{ background: '#6366F118', border: '1px solid #6366F130', color: '#6366F1' }}
            >
              <Plus size={12} /> CREAR PRIMERA CATEGORÍA
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {learningCategories.map((cat, i) => {
              const catL = learningLessons.filter(l => l.categoriaId === cat.id);
              const done = catL.filter(l => l.completado).length;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="w-full bm-card p-4 flex items-center gap-4 text-left relative overflow-hidden group"
                  style={{ '--bm-accent': cat.colorAccent } as React.CSSProperties}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r" style={{ background: cat.colorAccent }} />

                  <span className="text-2xl">{cat.icono}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black leading-tight">{cat.nombre}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="sys-label">{done}/{catL.length} LECCIONES</span>
                      {cat.racha > 0 && (
                        <span className="flex items-center gap-1 sys-label" style={{ color: '#F97316', opacity: 1 }}>
                          <Flame size={8} />🔥{cat.racha}d
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini progreso */}
                  <div className="w-10 shrink-0">
                    <div className="h-[2px] rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: cat.colorAccent,
                          width: catL.length > 0 ? `${(done / catL.length) * 100}%` : '0%',
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-right font-black sys-value" style={{ color: cat.colorAccent }}>
                      {catL.length > 0 ? Math.round((done / catL.length) * 100) : 0}%
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        <div className="h-20" />
      </div>

      {/* Modal: Crear categoría */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
              style={{ background: '#07070F', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none', borderRadius: '22px 22px 0 0' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="px-6 pb-10 pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="sys-label" style={{ color: newColor, opacity: 1 }}>NUEVA CATEGORÍA</span>
                  <button onClick={() => setShowCreate(false)}><X size={14} className="text-white/30" /></button>
                </div>

                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder='Ej: "Liderazgo ejecutivo"'
                  className="w-full rounded-xl px-4 py-3 text-[14px] font-bold text-white bg-transparent outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                />

                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Descripción breve (opcional)"
                  className="w-full rounded-xl px-4 py-2.5 text-[12px] text-white/60 bg-transparent outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                />

                {/* Iconos */}
                <div>
                  <span className="sys-label block mb-2">ÍCONO</span>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_ICONS.map(ico => (
                      <button
                        key={ico}
                        onClick={() => setNewIcon(ico)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                        style={{
                          background: newIcon === ico ? `${newColor}25` : 'rgba(255,255,255,0.04)',
                          border: newIcon === ico ? `1px solid ${newColor}50` : '1px solid transparent',
                        }}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colores */}
                <div>
                  <span className="sys-label block mb-2">COLOR</span>
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(col => (
                      <button
                        key={col}
                        onClick={() => setNewColor(col)}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                          background: col,
                          outline: newColor === col ? `2px solid ${col}` : 'none',
                          outlineOffset: 2,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateCategory}
                  disabled={generating || !newName.trim()}
                  className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: newColor, color: '#fff' }}
                >
                  {generating
                    ? <><Loader2 size={13} className="animate-spin" /> GENERANDO LECCIONES...</>
                    : <><Plus size={12} /> CREAR Y GENERAR LECCIONES</>
                  }
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
