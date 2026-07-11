import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fetchMarketData } from '../services/marketService';
import { supabase } from '../services/supabaseClient';
import { syncToSupabase, fetchFromSupabase } from '../services/dbService';
import {
  PerfilUsuario,
  Idea,
  Tarea,
  Habito,
  Transaccion,
  ActivoMercado,
  ContactoCRM,
  Mensaje,
  EstadoIdea,
  Noticia,
  Habilidad,
  Objetivo,
  Agenda,
  LearningCategory,
  LearningLesson,
  MealEntry,
  MemoryEntry,
  EnergyEntry,
  HormoneEntry,
  EnergyBalanceEntry,
  LearningPath,
  PodcastEntry,
  BookEntry,
  WisdomQuote,
  DebateEntry,
  Decision,
  BlindSpot,
  AccountabilityGoal,
  LegacyProfile,
  PersonaImportante,
  TemperaturaVinculo,
} from '../types';

type EntradaIdea = Omit<Idea, 'id' | 'creadoEn'>;
type EntradaTarea = Omit<Tarea, 'id' | 'completada'>;
type EntradaTransaccion = Omit<Transaccion, 'id' | 'fecha'>;
type EntradaContacto = Omit<ContactoCRM, 'id'>;
type EntradaAgenda = Omit<Agenda, 'id'>;
type EntradaPersona = Pick<PersonaImportante, 'nombre' | 'tipoVinculo'> &
  Partial<Pick<PersonaImportante, 'apodo' | 'conoceDesde' | 'notas'>>;

const STORAGE_KEYS = {
  tareas: 'domex_tareas',
  ideas: 'domex_ideas',
  transacciones: 'domex_transacciones',
  agenda: 'domex_agenda',
  noticias: 'domex_noticias_leidas',
  market: 'domex_market_cache',
  mensajes: 'domex_mensajes',
  habitos: 'domex_habitos',
  learningCategories: 'domex_learning_categories',
  learningLessons: 'domex_learning_lessons',
  meals: 'domex_meals',
  memory: 'domex_memory',
  energy: 'domex_energy',
  hormone: 'domex_hormone',
  energyBalance: 'domex_energy_balance',
  learningPaths: 'domex_learning_paths',
  podcasts: 'domex_podcasts',
  books: 'domex_books',
  wisdom: 'domex_wisdom',
  debates: 'domex_debates',
  decisions: 'domex_decisions',
  blindSpots: 'domex_blind_spots',
  accountability: 'domex_accountability',
  legacy: 'domex_legacy',
  contactos: 'domex_contactos',
  personasImportantes: 'domex_personas_importantes',
} as const;

interface AppContextType {
  usuario: PerfilUsuario;
  ideas: Idea[];
  tareas: Tarea[];
  habitos: Habito[];
  transacciones: Transaccion[];
  mercado: ActivoMercado[];
  contactos: ContactoCRM[];
  mensajes: Mensaje[];
  noticias: Noticia[];
  habilidades: Habilidad[];
  objetivos: Objetivo[];
  balanceCalculado: number;
  agregarIdea: (idea: EntradaIdea) => void;
  actualizarEstadoIdea: (id: string, estado: EstadoIdea) => void;
  actualizarIdea: (id: string, updates: Partial<Pick<Idea, 'titulo' | 'descripcion' | 'valorEstimado' | 'potencialMensual'>>) => void;
  eliminarIdea: (id: string) => void;
  agregarTarea: (tarea: EntradaTarea) => void;
  alternarTarea: (id: string) => void;
  alternarFoco: (id: string) => void;
  agregarTransaccion: (transaccion: EntradaTransaccion) => void;
  agregarMensaje: (mensaje: Mensaje) => void;
  limpiarMensajes: () => void;
  agregarContacto: (contacto: EntradaContacto) => void;
  actualizarEstadoContacto: (id: string, estado: ContactoCRM['estado']) => void;
  agenda: Agenda[];
  agregarAgenda: (item: EntradaAgenda) => void;
  noticiasLeidas: string[];
  marcarNoticiaLeida: (id: string) => void;
  resetearTodosLosDatos: () => void;
  completarHabito: (id: string) => void;
  agregarHabito: (titulo: string, icono: string, horario?: string | null, frecuencia?: string | null) => void;
  eliminarHabito: (id: string) => void;
  hidratarDesdeDB: (data: Partial<{ tareas: Tarea[]; ideas: Idea[]; transacciones: Transaccion[]; habitos: Habito[] }>) => void;
  // Módulo: Aprendizaje
  learningCategories: LearningCategory[];
  learningLessons: LearningLesson[];
  agregarCategoriaAprendizaje: (cat: LearningCategory) => void;
  agregarLeccion: (lesson: LearningLesson) => void;
  completarLeccion: (lessonId: string, categoriaId: string) => void;
  // Módulo: Nutrición
  mealEntries: MealEntry[];
  registrarComida: (meal: MealEntry) => void;
  // Módulo: Memoria
  memoryEntries: MemoryEntry[];
  evaluarMemoria: (entry: MemoryEntry) => void;
  // Módulo: Energy Tracker
  energyEntries: EnergyEntry[];
  registrarEnergia: (entry: EnergyEntry) => void;
  // Módulo: Hormone Balance
  hormoneEntries: HormoneEntry[];
  registrarHormona: (entry: HormoneEntry) => void;
  // Módulo: Energy Balance M/F
  energyBalanceEntries: EnergyBalanceEntry[];
  registrarEnergyBalance: (entry: EnergyBalanceEntry) => void;
  // Etapa 3: Aprendizaje Avanzado
  learningPaths: LearningPath[];
  agregarPath: (path: LearningPath) => void;
  avanzarSemanaPath: (pathId: string) => void;
  podcastEntries: PodcastEntry[];
  agregarPodcast: (entry: PodcastEntry) => void;
  bookEntries: BookEntry[];
  agregarBook: (entry: BookEntry) => void;
  actualizarRatingBook: (id: string, rating: number) => void;
  wisdomQuotes: WisdomQuote[];
  agregarWisdom: (quote: WisdomQuote) => void;
  actualizarReflexionWisdom: (id: string, reflexion: string) => void;
  debateEntries: DebateEntry[];
  agregarDebate: (entry: DebateEntry) => void;
  actualizarReflexionDebate: (id: string, reflexion: string, decision?: string) => void;
  // Etapa 4: Optimización Existencial
  decisions: Decision[];
  agregarDecision: (d: Decision) => void;
  actualizarResultadoDecision: (id: string, resultado: string, aprobada: boolean, leccion?: string) => void;
  blindSpots: BlindSpot[];
  setBlindSpots: (spots: BlindSpot[]) => void;
  completarBlindSpot: (id: string) => void;
  accountabilityGoals: AccountabilityGoal[];
  agregarAccountabilityGoal: (goal: AccountabilityGoal) => void;
  actualizarProgreso: (id: string, progreso: number, completada?: boolean, leccion?: string) => void;
  legacy: LegacyProfile | null;
  setLegacy: (profile: LegacyProfile) => void;
  // Módulo: Personas importantes
  personasImportantes: PersonaImportante[];
  agregarPersona: (persona: EntradaPersona) => void;
  actualizarPersona: (id: string, updates: Partial<Pick<PersonaImportante, 'nombre' | 'apodo' | 'tipoVinculo' | 'conoceDesde' | 'notas'>>) => void;
  eliminarPersona: (id: string) => void;
  agregarTemaRecurrente: (id: string, tema: string) => void;
  registrarInteraccionPersona: (id: string, temperatura?: TemperaturaVinculo) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function calcBalance(transacciones: Transaccion[]): number {
  return transacciones.reduce((acc, t) => (
    t.tipo === 'ingreso' ? acc + t.monto : acc - t.monto
  ), 0);
}

const MENSAJES_INICIALES: Mensaje[] = [{
  id: '1',
  rol: 'asistente',
  contenido: 'Hola, soy **Colmena**. Tu centro de control está listo. ¿Qué vamos a optimizar hoy?',
  timestamp: new Date(0).toISOString(),
}];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario] = useState<PerfilUsuario>({
    nombre: "Emprendedor AIcolmena",
    balance: 0,
    ingresosMensuales: 0,
    gastosMensuales: 0,
    energia: 0,
    progresoSemanal: 0
  });

  const [noticias] = useState<Noticia[]>([]);

  const [objetivos] = useState<Objetivo[]>([]);

  const [habilidades] = useState<Habilidad[]>([
    {
      id: '1',
      nombre: 'Ventas de Alto Impacto',
      categoria: 'ventas',
      icono: 'Zap',
      recursos: [
        { id: 'v1', titulo: 'Vender es un Servicio', tipo: 'video', url: 'https://youtube.com', descripcion: 'Cambia el chip mental: vender es ayudar a tu cliente.' },
        { id: 'h1', titulo: 'HubSpot Free CRM', tipo: 'herramienta', url: 'https://hubspot.com', descripcion: 'Gestiona tus prospectos de forma profesional.' }
      ]
    },
    {
      id: '2',
      nombre: 'Finanzas para Fundadores',
      categoria: 'finanzas',
      icono: 'DollarSign',
      recursos: [
        { id: 'v2', titulo: 'Entendiendo el Cash Flow', tipo: 'video', url: 'https://youtube.com', descripcion: 'Por qué tu balance dice que ganas dinero pero tu banco está vacío.' },
        { id: 'a1', titulo: 'Guía de Impuestos 2024', tipo: 'articulo', url: 'https://google.com', descripcion: 'Optimiza tus cargas fiscales legalmente.' }
      ]
    },
    {
      id: '3',
      nombre: 'Mentalidad Imparable',
      categoria: 'mentalidad',
      icono: 'Brain',
      recursos: [
        { id: 'v3', titulo: 'Hábitos Atómicos (Resumen)', tipo: 'video', url: 'https://youtube.com', descripcion: 'Cómo los pequeños cambios generan resultados masivos.' }
      ]
    }
  ]);

  const [ideas, setIdeas] = useState<Idea[]>(() => loadFromStorage(STORAGE_KEYS.ideas, []));

  const [tareas, setTareas] = useState<Tarea[]>(() => loadFromStorage(STORAGE_KEYS.tareas, []));

  const [habitos, setHabitos] = useState<Habito[]>(() => loadFromStorage(STORAGE_KEYS.habitos, []));

  const [transacciones, setTransacciones] = useState<Transaccion[]>(() => loadFromStorage(STORAGE_KEYS.transacciones, []));

  const [mercado, setMercado] = useState<ActivoMercado[]>([
    { id: '1', nombre: 'Bitcoin', simbolo: 'BTC', precio: 65432, cambio: 2.5, tipo: 'crypto' },
    { id: '2', nombre: 'Ethereum', simbolo: 'ETH', precio: 3456, cambio: -1.2, tipo: 'crypto' },
    { id: '3', nombre: 'Apple Inc.', simbolo: 'AAPL', precio: 189.45, cambio: 0.8, tipo: 'accion' },
    { id: '4', nombre: 'S&P 500', simbolo: 'SPX', precio: 5234.12, cambio: 0.45, tipo: 'accion' },
  ]);

  const [contactos, setContactos] = useState<ContactoCRM[]>(() => loadFromStorage(STORAGE_KEYS.contactos, []));

  const [agenda, setAgenda] = useState<Agenda[]>(() => {
    try { return JSON.parse(localStorage.getItem('domex_agenda') || '[]'); } catch { return []; }
  });

  // ── Módulos Conciencia ──
  const [learningCategories, setLearningCategories] = useState<LearningCategory[]>(
    () => loadFromStorage(STORAGE_KEYS.learningCategories, [])
  );
  const [learningLessons, setLearningLessons] = useState<LearningLesson[]>(
    () => loadFromStorage(STORAGE_KEYS.learningLessons, [])
  );
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.meals, [])
  );
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.memory, [])
  );
  const [energyEntries, setEnergyEntries] = useState<EnergyEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.energy, [])
  );
  const [hormoneEntries, setHormoneEntries] = useState<HormoneEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.hormone, [])
  );
  const [energyBalanceEntries, setEnergyBalanceEntries] = useState<EnergyBalanceEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.energyBalance, [])
  );
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(
    () => loadFromStorage(STORAGE_KEYS.learningPaths, [])
  );
  const [podcastEntries, setPodcastEntries] = useState<PodcastEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.podcasts, [])
  );
  const [bookEntries, setBookEntries] = useState<BookEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.books, [])
  );
  const [wisdomQuotes, setWisdomQuotes] = useState<WisdomQuote[]>(
    () => loadFromStorage(STORAGE_KEYS.wisdom, [])
  );
  const [debateEntries, setDebateEntries] = useState<DebateEntry[]>(
    () => loadFromStorage(STORAGE_KEYS.debates, [])
  );
  const [decisions, setDecisions] = useState<Decision[]>(
    () => loadFromStorage(STORAGE_KEYS.decisions, [])
  );
  const [blindSpots, setBlindSpotsState] = useState<BlindSpot[]>(
    () => loadFromStorage(STORAGE_KEYS.blindSpots, [])
  );
  const [accountabilityGoals, setAccountabilityGoals] = useState<AccountabilityGoal[]>(
    () => loadFromStorage(STORAGE_KEYS.accountability, [])
  );
  const [legacy, setLegacyState] = useState<LegacyProfile | null>(
    () => loadFromStorage(STORAGE_KEYS.legacy, null)
  );
  const [personasImportantes, setPersonasImportantes] = useState<PersonaImportante[]>(
    () => loadFromStorage(STORAGE_KEYS.personasImportantes, [])
  );

  const [noticiasLeidas, setNoticiasLeidas] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('domex_noticias_leidas') || '[]'); } catch { return []; }
  });

  const [mensajes, setMensajes] = useState<Mensaje[]>(() =>
    loadFromStorage(STORAGE_KEYS.mensajes, MENSAJES_INICIALES)
  );

  const balanceCalculado = useMemo(() => calcBalance(transacciones), [transacciones]);

  // ---- MUTATIONS ----

  const agregarIdea = (idea: EntradaIdea) => {
    setIdeas(prev => [...prev, { ...idea, id: Date.now().toString(), creadoEn: new Date().toISOString() }]);
  };

  const actualizarEstadoIdea = (id: string, estado: EstadoIdea) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, estado } : i));
  };

  const actualizarIdea = (id: string, updates: Partial<Pick<Idea, 'titulo' | 'descripcion' | 'valorEstimado' | 'potencialMensual'>>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const eliminarIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const agregarTarea = (tarea: EntradaTarea) => {
    const nueva = { ...tarea, id: `tarea_${Date.now()}`, completada: false };
    setTareas(prev => {
      const lista = [nueva, ...prev];
      localStorage.setItem(STORAGE_KEYS.tareas, JSON.stringify(lista));
      return lista;
    });
  };

  const alternarTarea = (id: string) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  };

  const alternarFoco = (id: string) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, esFoco: !t.esFoco } : t));
  };

  const agregarTransaccion = (transaccion: EntradaTransaccion) => {
    setTransacciones(prev => [...prev, { ...transaccion, id: Date.now().toString(), fecha: new Date().toISOString() }]);
  };

  const agregarMensaje = (mensaje: Mensaje) => {
    setMensajes(prev => [...prev, mensaje]);
  };

  const limpiarMensajes = () => {
    setMensajes(MENSAJES_INICIALES);
    localStorage.removeItem(STORAGE_KEYS.mensajes);
  };

  const agregarContacto = (contacto: EntradaContacto) => {
    setContactos(prev => [...prev, { ...contacto, id: Date.now().toString() }]);
  };

  const actualizarEstadoContacto = (id: string, estado: ContactoCRM['estado']) => {
    setContactos(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
  };

  const agregarAgenda = (item: EntradaAgenda) => {
    const nuevo = { ...item, id: Date.now().toString() };
    const updated = [...agenda, nuevo].sort((a, b) => {
      const da = new Date(`${a.fecha}T${a.hora}`).getTime();
      const db = new Date(`${b.fecha}T${b.hora}`).getTime();
      return da - db;
    });
    setAgenda(updated);
    localStorage.setItem('domex_agenda', JSON.stringify(updated));
  };

  const marcarNoticiaLeida = (id: string) => {
    if (noticiasLeidas.includes(id)) return;
    const updated = [...noticiasLeidas, id];
    setNoticiasLeidas(updated);
    localStorage.setItem('domex_noticias_leidas', JSON.stringify(updated));
  };

  const completarHabito = (id: string) => {
    setHabitos(prev => prev.map(h =>
      h.id === id
        ? { ...h, completadoHoy: true, racha: h.completadoHoy ? h.racha : h.racha + 1, ultimaVez: new Date().toISOString() }
        : h
    ));
  };

  const agregarHabito = (titulo: string, icono: string, horario?: string | null, frecuencia?: string | null) => {
    const nuevo: Habito = {
      id: `habito_${Date.now()}`,
      titulo,
      icono,
      racha: 0,
      completadoHoy: false,
      ultimaVez: null,
      creadoEn: new Date().toISOString(),
      horario: horario ?? null,
      frecuencia: frecuencia ?? null,
    };
    setHabitos(prev => [...prev, nuevo]);
  };

  const eliminarHabito = (id: string) => {
    setHabitos(prev => prev.filter(h => h.id !== id));
  };

  // ── Acciones: Aprendizaje ──

  const agregarCategoriaAprendizaje = (cat: LearningCategory) => {
    setLearningCategories(prev => [...prev, cat]);
  };

  const agregarLeccion = (lesson: LearningLesson) => {
    setLearningLessons(prev => [...prev, lesson]);
  };

  const completarLeccion = (lessonId: string, categoriaId: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    setLearningLessons(prev =>
      prev.map(l => l.id === lessonId
        ? { ...l, completado: true, completadoEn: new Date().toISOString() }
        : l
      )
    );
    setLearningCategories(prev => prev.map(cat => {
      if (cat.id !== categoriaId) return cat;
      if (cat.ultimoDia === hoy) return cat;
      const ayer = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
      const nuevaRacha = cat.ultimoDia === ayer ? cat.racha + 1 : 1;
      return { ...cat, racha: nuevaRacha, ultimoDia: hoy };
    }));
  };

  // ── Acciones: Nutrición ──

  const registrarComida = (meal: MealEntry) => {
    setMealEntries(prev => [meal, ...prev]);
  };

  // ── Acciones: Memoria ──

  const evaluarMemoria = (entry: MemoryEntry) => {
    setMemoryEntries(prev => [entry, ...prev.filter(e => e.fecha !== entry.fecha)]);
  };

  // ── Acciones: Energy Tracker ──

  const registrarEnergia = (entry: EnergyEntry) => {
    setEnergyEntries(prev => [entry, ...prev.filter(e => e.fecha !== entry.fecha)]);
  };

  // ── Acciones: Hormone Balance ──

  const registrarHormona = (entry: HormoneEntry) => {
    setHormoneEntries(prev => [entry, ...prev.filter(e => e.fecha !== entry.fecha)]);
  };

  // ── Acciones: Energy Balance M/F ──

  const registrarEnergyBalance = (entry: EnergyBalanceEntry) => {
    setEnergyBalanceEntries(prev => [entry, ...prev.filter(e => e.fecha !== entry.fecha)]);
  };

  // ── Acciones: Learning Paths ──

  const agregarPath = (path: LearningPath) => setLearningPaths(prev => [path, ...prev]);

  const avanzarSemanaPath = (pathId: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    setLearningPaths(prev => prev.map(p => {
      if (p.id !== pathId || p.semanasCompletadas >= p.duracion) return p;
      if (p.ultimaSemana === hoy) return p;
      return { ...p, semanasCompletadas: p.semanasCompletadas + 1, racha: p.racha + 1, ultimaSemana: hoy };
    }));
  };

  // ── Acciones: Biblioteca ──

  const agregarPodcast = (entry: PodcastEntry) => setPodcastEntries(prev => [entry, ...prev]);
  const agregarBook = (entry: BookEntry) => setBookEntries(prev => [entry, ...prev]);
  const actualizarRatingBook = (id: string, rating: number) =>
    setBookEntries(prev => prev.map(b => b.id === id ? { ...b, rating } : b));

  // ── Acciones: Wisdom ──

  const agregarWisdom = (quote: WisdomQuote) =>
    setWisdomQuotes(prev => [quote, ...prev.filter(q => q.fecha !== quote.fecha)]);
  const actualizarReflexionWisdom = (id: string, reflexion: string) =>
    setWisdomQuotes(prev => prev.map(q => q.id === id ? { ...q, reflexionUsuario: reflexion } : q));

  // ── Acciones: Debate ──

  const agregarDebate = (entry: DebateEntry) => setDebateEntries(prev => [entry, ...prev]);
  const actualizarReflexionDebate = (id: string, reflexion: string, decision?: string) =>
    setDebateEntries(prev => prev.map(d => d.id === id
      ? { ...d, reflexionUsuario: reflexion, ...(decision ? { decisionFinal: decision } : {}) }
      : d
    ));

  // ── Acciones: Optimización Existencial ──

  const agregarDecision = (d: Decision) => setDecisions(prev => [d, ...prev]);
  const actualizarResultadoDecision = (id: string, resultado: string, aprobada: boolean, leccion?: string) =>
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, resultado, aprobada, leccion } : d));

  const setBlindSpots = (spots: BlindSpot[]) => setBlindSpotsState(spots);
  const completarBlindSpot = (id: string) =>
    setBlindSpotsState(prev => prev.map(b => b.id === id ? { ...b, completado: true } : b));

  const agregarAccountabilityGoal = (goal: AccountabilityGoal) =>
    setAccountabilityGoals(prev => [goal, ...prev]);
  const actualizarProgreso = (id: string, progreso: number, completada = false, leccion?: string) =>
    setAccountabilityGoals(prev => prev.map(g => g.id === id
      ? { ...g, progreso, completada, ...(leccion ? { leccion } : {}) }
      : g
    ));

  const setLegacy = (profile: LegacyProfile) => setLegacyState(profile);

  // ── Acciones: Personas importantes ──

  const agregarPersona = (persona: EntradaPersona) => {
    const nueva: PersonaImportante = {
      ...persona,
      id: `persona_${Date.now()}`,
      temasRecurrentes: [],
      ultimaInteraccion: null,
      temperaturaReciente: null,
      notas: persona.notas ?? '',
      creadoEn: new Date().toISOString(),
    };
    setPersonasImportantes(prev => [...prev, nueva]);
  };

  const actualizarPersona = (id: string, updates: Partial<Pick<PersonaImportante, 'nombre' | 'apodo' | 'tipoVinculo' | 'conoceDesde' | 'notas'>>) => {
    setPersonasImportantes(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const eliminarPersona = (id: string) => {
    setPersonasImportantes(prev => prev.filter(p => p.id !== id));
  };

  const agregarTemaRecurrente = (id: string, tema: string) => {
    setPersonasImportantes(prev => prev.map(p =>
      p.id === id && !p.temasRecurrentes.includes(tema)
        ? { ...p, temasRecurrentes: [...p.temasRecurrentes, tema] }
        : p
    ));
  };

  const registrarInteraccionPersona = (id: string, temperatura?: TemperaturaVinculo) => {
    setPersonasImportantes(prev => prev.map(p =>
      p.id === id
        ? { ...p, ultimaInteraccion: new Date().toISOString(), ...(temperatura ? { temperaturaReciente: temperatura } : {}) }
        : p
    ));
  };

  const hidratarDesdeDB = (data: Partial<{ tareas: Tarea[]; ideas: Idea[]; transacciones: Transaccion[]; habitos: Habito[] }>) => {
    if (data.tareas?.length) setTareas(data.tareas);
    if (data.ideas?.length) setIdeas(data.ideas);
    if (data.transacciones?.length) setTransacciones(data.transacciones);
    if (data.habitos?.length) setHabitos(data.habitos);
  };

  // ---- PERSISTENCE ----

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.tareas, JSON.stringify(tareas)); }, [tareas]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ideas, JSON.stringify(ideas)); }, [ideas]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.transacciones, JSON.stringify(transacciones)); }, [transacciones]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.habitos, JSON.stringify(habitos)); }, [habitos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.contactos, JSON.stringify(contactos)); }, [contactos]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.learningCategories, JSON.stringify(learningCategories)); }, [learningCategories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.learningLessons, JSON.stringify(learningLessons)); }, [learningLessons]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.meals, JSON.stringify(mealEntries)); }, [mealEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.memory, JSON.stringify(memoryEntries)); }, [memoryEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.energy, JSON.stringify(energyEntries)); }, [energyEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.hormone, JSON.stringify(hormoneEntries)); }, [hormoneEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.energyBalance, JSON.stringify(energyBalanceEntries)); }, [energyBalanceEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.learningPaths, JSON.stringify(learningPaths)); }, [learningPaths]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.podcasts, JSON.stringify(podcastEntries)); }, [podcastEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(bookEntries)); }, [bookEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.wisdom, JSON.stringify(wisdomQuotes)); }, [wisdomQuotes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.debates, JSON.stringify(debateEntries)); }, [debateEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.decisions, JSON.stringify(decisions)); }, [decisions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.blindSpots, JSON.stringify(blindSpots)); }, [blindSpots]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.accountability, JSON.stringify(accountabilityGoals)); }, [accountabilityGoals]);
  useEffect(() => { if (legacy) localStorage.setItem(STORAGE_KEYS.legacy, JSON.stringify(legacy)); }, [legacy]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.personasImportantes, JSON.stringify(personasImportantes)); }, [personasImportantes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.mensajes, JSON.stringify(mensajes.slice(-50)));
  }, [mensajes]);

  // ---- SUPABASE SYNC (transparent, non-blocking) ----

  // On mount: hydrate from cloud if authenticated
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const data = await fetchFromSupabase(session.user.id);
      if (data) hidratarDesdeDB(data);
    })();
  }, []);

  // On state change: debounced sync to cloud
  useEffect(() => {
    if (!supabase) return;
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      syncToSupabase(session.user.id, { tareas, ideas, transacciones, habitos });
    }, 3000);
    return () => clearTimeout(timer);
  }, [tareas, ideas, transacciones, habitos]);

  // ---- MARKET DATA ----

  useEffect(() => {
    const loadMarket = async () => {
      const data = await fetchMarketData();
      if (data.btcPrice === 0) return;
      setMercado(prev => prev.map(m => {
        if (m.simbolo === 'BTC') return { ...m, precio: data.btcPrice, cambio: data.btcChange24h };
        if (m.simbolo === 'ETH') return { ...m, precio: data.ethPrice, cambio: data.ethChange24h };
        return m;
      }));
    };
    loadMarket();
    const interval = setInterval(loadMarket, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const resetearTodosLosDatos = () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    setTareas([]);
    setIdeas([]);
    setTransacciones([]);
    setHabitos([]);
    setContactos([]);
    setAgenda([]);
    setMensajes(MENSAJES_INICIALES);
    setPersonasImportantes([]);
  };

  return (
    <AppContext.Provider value={{
      usuario, ideas, tareas, habitos, transacciones, mercado, contactos, mensajes, noticias, habilidades, objetivos,
      balanceCalculado,
      agregarIdea, actualizarEstadoIdea, actualizarIdea, eliminarIdea,
      agregarTarea, alternarTarea, alternarFoco,
      agregarTransaccion,
      agregarMensaje, limpiarMensajes,
      agregarContacto, actualizarEstadoContacto,
      agenda, agregarAgenda, noticiasLeidas, marcarNoticiaLeida, resetearTodosLosDatos,
      completarHabito, agregarHabito, eliminarHabito,
      hidratarDesdeDB,
      learningCategories, learningLessons,
      agregarCategoriaAprendizaje, agregarLeccion, completarLeccion,
      mealEntries, registrarComida,
      memoryEntries, evaluarMemoria,
      energyEntries, registrarEnergia,
      hormoneEntries, registrarHormona,
      energyBalanceEntries, registrarEnergyBalance,
      learningPaths, agregarPath, avanzarSemanaPath,
      podcastEntries, agregarPodcast,
      bookEntries, agregarBook, actualizarRatingBook,
      wisdomQuotes, agregarWisdom, actualizarReflexionWisdom,
      debateEntries, agregarDebate, actualizarReflexionDebate,
      decisions, agregarDecision, actualizarResultadoDecision,
      blindSpots, setBlindSpots, completarBlindSpot,
      accountabilityGoals, agregarAccountabilityGoal, actualizarProgreso,
      legacy, setLegacy,
      personasImportantes, agregarPersona, actualizarPersona, eliminarPersona,
      agregarTemaRecurrente, registrarInteraccionPersona,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}
