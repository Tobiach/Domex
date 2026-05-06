import React, { createContext, useContext, useState } from 'react';
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
  Agenda
} from '../types';

type EntradaIdea = Omit<Idea, 'id' | 'creadoEn'>;
type EntradaTarea = Omit<Tarea, 'id' | 'completada'>;
type EntradaTransaccion = Omit<Transaccion, 'id' | 'fecha'>;
type EntradaContacto = Omit<ContactoCRM, 'id'>;
type EntradaAgenda = Omit<Agenda, 'id'>;

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
  agregarIdea: (idea: EntradaIdea) => void;
  actualizarEstadoIdea: (id: string, estado: EstadoIdea) => void;
  agregarTarea: (tarea: EntradaTarea) => void;
  alternarTarea: (id: string) => void;
  alternarFoco: (id: string) => void;
  agregarTransaccion: (transaccion: EntradaTransaccion) => void;
  agregarMensaje: (mensaje: Mensaje) => void;
  agregarContacto: (contacto: EntradaContacto) => void;
  actualizarEstadoContacto: (id: string, estado: ContactoCRM['estado']) => void;
  agenda: Agenda[];
  agregarAgenda: (item: EntradaAgenda) => void;
  noticiasLeidas: string[];
  marcarNoticiaLeida: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuario] = useState<PerfilUsuario>({
    nombre: "Emprendedor Domex",
    balance: 5420.50,
    ingresosMensuales: 8000,
    gastosMensuales: 2579.50,
    energia: 85,
    progresoSemanal: 64
  });

  const [noticias] = useState<Noticia[]>([
    { id: '1', titulo: 'Inflación a la baja', contenido: 'La proyección mensual cae un 0.5%, abriendo ventana para inversiones de bajo riesgo.', categoria: 'economia', fecha: new Date().toISOString() },
    { id: '2', titulo: 'Auge en Logística SaaS', contenido: 'Se detectó un incremento del 15% en la demanda de soluciones Last Mile en el sector alimenticio.', categoria: 'oportunidad', fecha: new Date().toISOString() },
    { id: '3', titulo: 'Bitcoin estabilizado', contenido: 'Resistencia en los 65k tras el halving, mercado lateral ideal para acumulación.', categoria: 'mercado', fecha: new Date().toISOString() },
  ]);

  const [objetivos] = useState<Objetivo[]>([
    { id: '1', titulo: 'Alcanzar $5k ingresos pasivos', completado: false, creadoEn: new Date().toISOString() },
    { id: '2', titulo: 'Lanzar MVP Logística', completado: false, creadoEn: new Date().toISOString() },
  ]);

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

  const [ideas, setIdeas] = useState<Idea[]>([
    { id: '1', titulo: 'SaaS de Logística', descripcion: 'Optimización de rutas con IA', estado: 'ejecucion', creadoEn: new Date().toISOString(), valorEstimado: 25000, potencialMensual: 4500, contactoRelacionadoId: '1' },
    { id: '2', titulo: 'App de Mentoría', descripcion: 'Conectar coaches con startups', estado: 'validacion', creadoEn: new Date().toISOString(), valorEstimado: 12000, potencialMensual: 1800, contactoRelacionadoId: '2' },
    { id: '3', titulo: 'Marketplace Vegano', descripcion: 'Solo productos locales', estado: 'idea', creadoEn: new Date().toISOString(), valorEstimado: 8000, potencialMensual: 900 },
  ]);

  const [tareas, setTareas] = useState<Tarea[]>([
    { id: '1', titulo: 'Firmar contrato con inversionista', completada: false, prioridad: 'alta', fechaVencimiento: new Date().toISOString(), esFoco: true, objetivoId: '2' },
    { id: '2', titulo: 'Revisar métricas de logística', completada: false, prioridad: 'alta', fechaVencimiento: new Date().toISOString(), esFoco: true, objetivoId: '2' },
    { id: '3', titulo: 'Planificar siguiente sprint', completada: false, prioridad: 'media', fechaVencimiento: new Date().toISOString(), esFoco: true },
    { id: '4', titulo: 'Ajustar stop loss BTC', completada: false, prioridad: 'media', fechaVencimiento: new Date().toISOString(), esFoco: false, objetivoId: '1' },
  ]);

  const [habitos, setHabitos] = useState<Habito[]>([
    { id: '1', titulo: 'Lectura 30 min', racha: 12, completadoHoy: true },
    { id: '2', titulo: 'Meditación', racha: 5, completadoHoy: false },
    { id: '3', titulo: 'Prospección diaria', racha: 21, completadoHoy: true },
  ]);

  const [transacciones, setTransacciones] = useState<Transaccion[]>([
    { id: '1', tipo: 'gasto', monto: 45.90, categoria: 'Suscripciones', descripcion: 'Servidores AWS', fecha: new Date().toISOString() },
    { id: '2', tipo: 'ingreso', monto: 1200.00, categoria: 'Ventas', descripcion: 'Cliente A - Milestone 1', fecha: new Date().toISOString() },
  ]);

  const [mercado] = useState<ActivoMercado[]>([
    { id: '1', nombre: 'Bitcoin', simbolo: 'BTC', precio: 65432, cambio: 2.5, tipo: 'crypto' },
    { id: '2', nombre: 'Ethereum', simbolo: 'ETH', precio: 3456, cambio: -1.2, tipo: 'crypto' },
    { id: '3', nombre: 'Apple Inc.', simbolo: 'AAPL', precio: 189.45, cambio: 0.8, tipo: 'accion' },
    { id: '4', nombre: 'S&P 500', simbolo: 'SPX', precio: 5234.12, cambio: 0.45, tipo: 'accion' },
  ]);

  const [contactos, setContactos] = useState<ContactoCRM[]>([
    { id: '1', nombre: 'Juan Pérez', empresa: 'TechSolutions', estado: 'negociacion', valor: 5000 },
    { id: '2', nombre: 'María García', empresa: 'Innovate Corp', estado: 'prospecto', valor: 2000 },
    { id: '3', nombre: 'Roberto Gómez', empresa: 'Global S.A.', estado: 'ganado', valor: 12000 },
  ]);

  const [agenda, setAgenda] = useState<Agenda[]>(() => {
    try { return JSON.parse(localStorage.getItem('domex_agenda') || '[]'); } catch { return []; }
  });

  const [noticiasLeidas, setNoticiasLeidas] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('domex_noticias_leidas') || '[]'); } catch { return []; }
  });

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: '1', rol: 'asistente', contenido: 'Hola, soy **Domex AI**. Tu centro de control está listo. ¿Qué vamos a optimizar hoy?', timestamp: new Date().toISOString() }
  ]);

  const agregarIdea = (idea: EntradaIdea) => {
    setIdeas([...ideas, { ...idea, id: Date.now().toString(), creadoEn: new Date().toISOString() }]);
  };

  const actualizarEstadoIdea = (id: string, estado: EstadoIdea) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, estado } : i));
  };

  const agregarTarea = (tarea: EntradaTarea) => {
    setTareas([...tareas, { ...tarea, id: Date.now().toString(), completada: false }]);
  };

  const alternarTarea = (id: string) => {
    setTareas(tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  };

  const alternarFoco = (id: string) => {
    setTareas(tareas.map(t => t.id === id ? { ...t, esFoco: !t.esFoco } : t));
  };

  const agregarTransaccion = (transaccion: EntradaTransaccion) => {
    setTransacciones([...transacciones, { ...transaccion, id: Date.now().toString(), fecha: new Date().toISOString() }]);
  };

  const agregarMensaje = (mensaje: Mensaje) => {
    setMensajes(prev => [...prev, mensaje]);
  };

  const agregarContacto = (contacto: EntradaContacto) => {
    setContactos([...contactos, { ...contacto, id: Date.now().toString() }]);
  };

  const actualizarEstadoContacto = (id: string, estado: ContactoCRM['estado']) => {
    setContactos(contactos.map(c => c.id === id ? { ...c, estado } : c));
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

  return (
    <AppContext.Provider value={{ 
      usuario, ideas, tareas, habitos, transacciones, mercado, contactos, mensajes, noticias, habilidades, objetivos,
      agregarIdea, actualizarEstadoIdea, agregarTarea, alternarTarea, alternarFoco, agregarTransaccion, agregarMensaje,
      agregarContacto, actualizarEstadoContacto,
      agenda, agregarAgenda, noticiasLeidas, marcarNoticiaLeida
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
