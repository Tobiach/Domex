export interface PerfilUsuario {
  nombre: string;
  avatar?: string;
  balance: number;
  ingresosMensuales: number;
  gastosMensuales: number;
  energia: number;
  progresoSemanal: number;
}

export type EstadoIdea = 'idea' | 'validacion' | 'ejecucion';

export interface Recurso {
  id: string;
  titulo: string;
  url: string;
  tipo: 'video' | 'articulo' | 'herramienta';
  descripcion: string;
}

export interface Habilidad {
  id: string;
  nombre: string;
  categoria: 'ventas' | 'finanzas' | 'mentalidad' | 'negocios';
  recursos: Recurso[];
  icono: string;
}

export interface Idea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIdea;
  creadoEn: string;
  valorEstimado?: number;
  potencialMensual?: number;
  contactoRelacionadoId?: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  categoria: 'mercado' | 'economia' | 'oportunidad';
  fecha: string;
}

export interface Objetivo {
  id: string;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  creadoEn: string;
}

export interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
  prioridad: 'baja' | 'media' | 'alta';
  fechaVencimiento: string;
  esFoco: boolean;
  objetivoId?: string;
}

export interface Habito {
  id: string;
  titulo: string;
  icono: string;
  racha: number;
  completadoHoy: boolean;
  ultimaVez: string | null;
  creadoEn: string;
}

export interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  categoria: string;
  descripcion: string;
  fecha: string;
}

export interface ActivoMercado {
  id: string;
  nombre: string;
  simbolo: string;
  precio: number;
  cambio: number;
  tipo: 'crypto' | 'accion' | 'divisa';
}

export interface ContactoCRM {
  id: string;
  nombre: string;
  empresa: string;
  estado: 'prospecto' | 'contactado' | 'negociacion' | 'ganado';
  valor: number;
  tipo?: 'servicio' | 'producto' | 'saas';
}

export interface Mensaje {
  id: string;
  rol: 'usuario' | 'asistente';
  contenido: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  titulo: string;
  resumen: string;
  fuente: string;
  url: string;
  imagen: string | null;
  fecha: string;
  categoria: 'IA' | 'MERCADO' | 'CRIPTO' | 'PODER';
  personaje: string | null;
}

export interface UserProfile {
  identity: {
    nombre: string;
    apellido: string;
    avatarUrl: string | null;
    iniciales: string;
    saludo: 'Hola' | 'Hey' | 'Buenos días' | 'Qué tal';
    email?: string;
    passwordHash?: string;
  };
  visual: {
    accentColor: string;
    theme: 'dark' | 'darker' | 'midnight';
    fontSize: 'compact' | 'normal' | 'large';
  };
  modules: {
    dashboard: boolean;
    ideas: boolean;
    tasks: boolean;
    crm: boolean;
    capital: boolean;
    chat: boolean;
    mercado: boolean;
    intel: boolean;
    habitos: boolean;
    conciencia: boolean;
    optimizacion: boolean;
  };
  goals: {
    capitalObjetivo: number;
    ingresoMensualMeta: number;
    tareasFocoDiarias: number;
    moneda: 'USD' | 'ARS' | 'EUR';
  };
  onboardingCompleto: boolean;
}

export interface Agenda {
  id: string;
  titulo: string;
  personas: string[];
  fecha: string;
  hora: string;
  contexto?: string;
  tipo: 'reunion' | 'recordatorio' | 'evento';
}

export interface VoiceProcessorResult {
  tipo: 'tarea' | 'reunion' | 'gasto' | 'idea' | 'nota';
  titulo: string;
  detalles: {
    fecha?: string;
    hora?: string;
    monto?: number;
    personas?: string[];
    contexto?: string;
    categoria?: string;
  };
  prioridad: 'alta' | 'normal' | 'baja';
  confianza: number;
}

// ─── Módulo: Micro-aprendizaje ─────────────────────────────────────────────

export interface LearningCategory {
  id: string;
  nombre: string;
  descripcion: string;
  colorAccent: string;
  icono: string;
  racha: number;
  ultimoDia: string | null;
  creadoEn: string;
}

export interface LearningLesson {
  id: string;
  categoriaId: string;
  titulo: string;
  contenido: string;
  tipoContenido: 'ai-generated' | 'user-external';
  duracionEstimada: number;
  fuente?: string;
  completado: boolean;
  completadoEn?: string;
  creadoEn: string;
}

// ─── Módulo: Nutrición ────────────────────────────────────────────────────

export interface MealEntry {
  id: string;
  timestamp: string;
  tipo: 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'snack';
  descripcion: string;
  calorias: number;
  azucar: number;
  proteina: number;
  procesada: 'natural' | 'semi-procesada' | 'ultraprocesada';
  analisisIA: string;
  creadoEn: string;
}

// ─── Módulo: Memoria ──────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  fecha: string;
  score: number;
  sintomas: string[];
  contexto: string;
  creadoEn: string;
}

// ─── Etapa 4: Optimización Existencial ───────────────────────────────────

export interface Decision {
  id: string;
  descripcion: string;
  fecha: string;
  contexto: string;
  alternativas: string[];
  sentimiento: 'confianza' | 'duda' | 'urgencia' | 'miedo';
  clarityAlMomento: number; // 1-10
  resultado?: string;
  aprobada?: boolean;
  leccion?: string;
  creadoEn: string;
}

export interface BlindSpot {
  id: string;
  descripcion: string;
  evidencia: string[];
  impacto: string;
  intervencion: string;
  completado: boolean;
  creadoEn: string;
}

export interface AccountabilityGoal {
  id: string;
  meta: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number; // 0-100
  completada: boolean;
  leccion?: string;
  creadoEn: string;
}

export interface LegacyProfile {
  vision: string;
  valores: string[];
  paraQuien: string;
  alineacion: number; // 0-100
  reflexionAlineacion?: string;
  updatedAt: string;
}

// ─── Etapa 3: Aprendizaje Avanzado ───────────────────────────────────────

export interface LearningPath {
  id: string;
  titulo: string;
  goal: string;
  duracion: number; // semanas
  dificultad: 'principiante' | 'intermedio' | 'avanzado';
  roadmap: string; // markdown generado por Groq
  semanasCompletadas: number;
  racha: number;
  ultimaSemana: string | null;
  creadoEn: string;
}

export interface PodcastEntry {
  id: string;
  titulo: string;
  tema: string;
  ideas: string[];
  aplicables: string[];
  aprendizajeKey: string;
  creadoEn: string;
}

export interface BookEntry {
  id: string;
  titulo: string;
  autor: string;
  resumen: string;
  ideasClave: string[];
  aplicaciones: string[];
  rating: number;
  completado: boolean;
  creadoEn: string;
}

export interface WisdomQuote {
  id: string;
  fecha: string;
  cita: string;
  autor: string;
  tema: string;
  reflexionUsuario?: string;
  guardado: boolean;
  creadoEn: string;
}

export interface DebateEntry {
  id: string;
  pregunta: string;
  opcionA: { titulo: string; pro: string[]; contra: string[]; riesgo: string; oportunidad: string };
  opcionB: { titulo: string; pro: string[]; contra: string[]; riesgo: string; oportunidad: string };
  insight: string;
  reflexionUsuario?: string;
  decisionFinal?: string;
  creadoEn: string;
}

// ─── Módulo: Hormone Balance ──────────────────────────────────────────────

export interface HormoneEntry {
  id: string;
  fecha: string;
  inputs: {
    energia: number;   // 1-10
    libido: number;    // 1-10
    vigor: number;     // 1-10 (proxy testosterona)
    mood: number;      // 1-10
    focus: number;     // 1-10
    motivation: number; // 1-10
    placer: number;    // 1-10
    estres: number;    // 1-10 (a invertir)
    brainFog: number;  // 1-10 (a invertir)
  };
  scores: {
    T: number;  // 0-100
    C: number;  // 0-100 (cortisol invertido)
    D: number;  // 0-100
  };
  analisisIA?: string;
  creadoEn: string;
}

// ─── Módulo: Energy Balance M/F ───────────────────────────────────────────

export interface EnergyBalanceEntry {
  id: string;
  fecha: string;
  tipo: 'masculino' | 'femenino' | 'balanceado';
  reflexion?: string;
  sugerenciaIA?: string;
  creadoEn: string;
}

// ─── Módulo: Energy Tracker ───────────────────────────────────────────────

export interface EnergyEntry {
  id: string;
  fecha: string;
  score: number; // 1-10
  factores: {
    sueno: number; // horas
    tipoDeSueno: 'profundo' | 'interrumpido' | 'ligero';
    estresTopics: string[];
  };
  analisisIA?: string;
  recomendacion?: string;
  creadoEn: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────

export const DEFAULT_PROFILE: UserProfile = {
  identity: {
    nombre: '',
    apellido: '',
    avatarUrl: null,
    iniciales: 'DX',
    saludo: 'Hola',
  },
  visual: {
    accentColor: '#00D4FF',
    theme: 'dark',
    fontSize: 'normal',
  },
  modules: {
    dashboard: true,
    ideas: true,
    tasks: true,
    crm: true,
    capital: true,
    chat: true,
    mercado: true,
    intel: true,
    habitos: true,
    conciencia: true,
    optimizacion: true,
  },
  goals: {
    capitalObjetivo: 50000,
    ingresoMensualMeta: 5000,
    tareasFocoDiarias: 3,
    moneda: 'USD',
  },
  onboardingCompleto: false,
};
