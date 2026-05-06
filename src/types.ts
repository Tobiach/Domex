export interface PerfilUsuario {
  nombre: string;
  avatar?: string;
  balance: number;
  ingresosMensuales: number;
  gastosMensuales: number;
  energia: number; // 0-100
  progresoSemanal: number; // 0-100
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
  esFoco: boolean; // Indica si es una de las 3 tareas clave del día
  objetivoId?: string; // Conexión con objetivos
}

export interface Habito {
  id: string;
  titulo: string;
  racha: number;
  completadoHoy: boolean;
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
  };
  goals: {
    capitalObjetivo: number;
    ingresoMensualMeta: number;
    tareasFocoDiarias: number;
    moneda: 'USD' | 'ARS' | 'EUR';
  };
  onboardingCompleto: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  identity: {
    nombre: '',
    apellido: '',
    avatarUrl: null,
    iniciales: 'DX',
    saludo: 'Hola',
  },
  visual: {
    accentColor: '#7C3AED',
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
  },
  goals: {
    capitalObjetivo: 50000,
    ingresoMensualMeta: 5000,
    tareasFocoDiarias: 3,
    moneda: 'USD',
  },
  onboardingCompleto: false,
};
