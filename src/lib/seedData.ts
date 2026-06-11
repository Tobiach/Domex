// Demo data — 29 días de uso realista de un emprendedor argentino

const uid = () => Math.random().toString(36).slice(2, 10);

function diasAtras(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function isoAtras(n: number, hora = '10:00'): string {
  return `${diasAtras(n)}T${hora}:00.000Z`;
}

const hoy = diasAtras(0);

export function seedDemoData(): void {
  // ── TAREAS ──────────────────────────────────────────────────────────────────
  const tareas = [
    // ── TAREAS EXISTENTES ─────────────────────────────────────────────────────
    { id: uid(), titulo: 'Cerrar propuesta con cliente iPhone', completada: false, prioridad: 'alta', fechaVencimiento: hoy, esFoco: true },
    { id: uid(), titulo: 'Preparar demo para Cabañas Rakun', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-1), esFoco: true },
    { id: uid(), titulo: 'Llamar a Fede (clínica dental)', completada: false, prioridad: 'media', fechaVencimiento: hoy, esFoco: false },
    { id: uid(), titulo: 'Revisar métricas dashboard logística', completada: false, prioridad: 'alta', fechaVencimiento: hoy, esFoco: true },
    { id: uid(), titulo: 'Actualizar portfolio Control.Evo', completada: false, prioridad: 'baja', fechaVencimiento: diasAtras(-3), esFoco: false },
    { id: uid(), titulo: 'Enviar contrato al cliente de logística', completada: true, prioridad: 'alta', fechaVencimiento: diasAtras(2), esFoco: false },
    { id: uid(), titulo: 'Configurar agente WhatsApp para bodegón', completada: true, prioridad: 'media', fechaVencimiento: diasAtras(5), esFoco: false },
    { id: uid(), titulo: 'Reunión de seguimiento con barbería Emi', completada: true, prioridad: 'media', fechaVencimiento: diasAtras(7), esFoco: false },
    { id: uid(), titulo: 'Pagar hosting Vercel mes de mayo', completada: true, prioridad: 'baja', fechaVencimiento: diasAtras(10), esFoco: false },
    { id: uid(), titulo: 'Definir precio paquete automatización WSP', completada: true, prioridad: 'alta', fechaVencimiento: diasAtras(14), esFoco: false },

    // ── PROYECTO 1: PROSPECTEAR LEADS WEBS ───────────────────────────────────
    { id: uid(), titulo: '[Leads Webs] Búsqueda manual 20 negocios en Instagram', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-7), esFoco: true },
    { id: uid(), titulo: '[Leads Webs] Extraer datos: nombre, IG, ubicación, contacto', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-7), esFoco: false },
    { id: uid(), titulo: '[Leads Webs] Revisar si tienen web actual', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-7), esFoco: false },
    { id: uid(), titulo: '[Leads Webs] Clasificar por tipo de negocio y potencial', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-9), esFoco: false },
    { id: uid(), titulo: '[Leads Webs] Primer contacto por DM o WhatsApp', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-9), esFoco: false },
    { id: uid(), titulo: '[Leads Webs] Enviar propuesta inicial', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-14), esFoco: false },

    // ── PROYECTO 2: APPLE-TECNO DASHBOARD ────────────────────────────────────
    { id: uid(), titulo: '[Apple-Tecno] Calcular costo de desarrollo (features + servidor + mantenimiento)', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-2), esFoco: true },
    { id: uid(), titulo: '[Apple-Tecno] Definir modelo: recurrente vs. one-time', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-2), esFoco: true },
    { id: uid(), titulo: '[Apple-Tecno] Preparar propuesta escrita con 2-3 opciones de precio', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-3), esFoco: false },
    { id: uid(), titulo: '[Apple-Tecno] Reunión con cliente para presentar propuesta', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-4), esFoco: false },
    { id: uid(), titulo: '[Apple-Tecno] Firma de contrato', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-5), esFoco: false },
    { id: uid(), titulo: '[Apple-Tecno] Inicio de desarrollo', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-7), esFoco: false },

    // ── PROYECTO 3: MERCADO PAGO API + TESTING ────────────────────────────────
    { id: uid(), titulo: '[MP API] Revisar código actual con Ezequiel + Enzo', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-1), esFoco: true },
    { id: uid(), titulo: '[MP API] Integrar API Mercado Pago (transacciones, webhooks, confirmaciones)', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-3), esFoco: false },
    { id: uid(), titulo: '[MP API] Setup ambiente staging', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-3), esFoco: false },
    { id: uid(), titulo: '[MP API] Plan de testing (casos críticos)', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-4), esFoco: false },
    { id: uid(), titulo: '[MP API] Ejecutar testing en staging', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-5), esFoco: false },
    { id: uid(), titulo: '[MP API] Fix de bugs encontrados', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-6), esFoco: false },
    { id: uid(), titulo: '[MP API] Rollout a producción', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-7), esFoco: false },
    { id: uid(), titulo: '[MP API] Monitoreo post-launch primeros 7 días', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-14), esFoco: false },

    // ── PROYECTO 4: ENCASA VENEZUELA ─────────────────────────────────────────
    { id: uid(), titulo: '[EnCasa] Definir roadmap detallado MVP (Yo + Muñeca)', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-14), esFoco: false },
    { id: uid(), titulo: '[EnCasa] Listar 20 potenciales proveedores/locales venezolanos', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-21), esFoco: false },
    { id: uid(), titulo: '[EnCasa] Contactar 10 proveedores con propuesta presale', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-28), esFoco: false },
    { id: uid(), titulo: '[EnCasa] Cerrar 5 proveedores comprometidos', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-35), esFoco: false },
    { id: uid(), titulo: '[EnCasa] Soft launch a usuarios beta', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-60), esFoco: false },

    // ── PROYECTO 5: AICOLMENA MVP ─────────────────────────────────────────────
    { id: uid(), titulo: '[AICOLMENA] Google Calendar sync', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-14), esFoco: true },
    { id: uid(), titulo: '[AICOLMENA] Deal scoring automático', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-21), esFoco: false },
    { id: uid(), titulo: '[AICOLMENA] Meeting notes automático', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-21), esFoco: false },
    { id: uid(), titulo: '[AICOLMENA] Pipeline forecast', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-28), esFoco: false },
    { id: uid(), titulo: '[AICOLMENA] QA exhaustivo + beta testing 20-30 usuarios', completada: false, prioridad: 'alta', fechaVencimiento: diasAtras(-42), esFoco: false },
    { id: uid(), titulo: '[AICOLMENA] Iteraciones feedback (max 2 sprints)', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-56), esFoco: false },

    // ── TAREAS PERSONALES ─────────────────────────────────────────────────────
    { id: uid(), titulo: 'Comprar regalo mamá — Día de la Madre Paraguay (15/05)', completada: false, prioridad: 'media', fechaVencimiento: diasAtras(-3), esFoco: true },
    { id: uid(), titulo: 'Inscribirse en gym — elegir membresía', completada: false, prioridad: 'baja', fechaVencimiento: diasAtras(-19), esFoco: false },
    { id: uid(), titulo: 'Revisar opciones de alquiler y calcular presupuesto', completada: false, prioridad: 'baja', fechaVencimiento: diasAtras(-19), esFoco: false },
  ];

  // ── IDEAS ────────────────────────────────────────────────────────────────────
  const ideas = [
    { id: uid(), titulo: 'Agencia IA para PyMEs LATAM', descripcion: 'Automatización end-to-end con agentes de WhatsApp, IG y FB. Modelo: retainer mensual USD 500-800.', estado: 'ejecucion', creadoEn: isoAtras(28), valorEstimado: 5000, potencialMensual: 2500 },
    { id: uid(), titulo: 'SaaS para lubricentros', descripcion: 'Sistema de recordatorio de cambio de aceite vía WhatsApp + gestión de turnos. $25/mes por local.', estado: 'validacion', creadoEn: isoAtras(20), valorEstimado: 2000, potencialMensual: 800 },
    { id: uid(), titulo: 'Pack redes sociales con IA generativa', descripcion: 'Contenido mensual automatizado para Instagram y Facebook. 15 posts + stories por $150/mes.', estado: 'validacion', creadoEn: isoAtras(15), valorEstimado: 3000, potencialMensual: 1200 },
    { id: uid(), titulo: 'Dashboard métricas para clínicas', descripcion: 'Integración con turnos web, métricas de pacientes y alertas de ocupación. Modelo SaaS.', estado: 'idea', creadoEn: isoAtras(10), valorEstimado: 4000, potencialMensual: 0 },
    { id: uid(), titulo: 'AIcolmena para equipos (multiusuario)', descripcion: 'Versión team de AIcolmena con tablero compartido, asignación de tareas y CRM colaborativo.', estado: 'idea', creadoEn: isoAtras(5), valorEstimado: 15000, potencialMensual: 0 },

    // ── PROYECTOS NUEVOS (sesión 12/05/2026) ──────────────────────────────────
    { id: uid(), titulo: 'Prospectear Leads — Webs y App-Webs', descripcion: 'Encontrar negocios en Instagram sin web o con web mala. Tiendas, restaurantes, clínicas, servicios. Ofrecerles creación de websites/app-webs. Fase 1 manual, luego scraper. Valor por cliente: $500-$5,000 USD.', estado: 'ejecucion', creadoEn: isoAtras(1), valorEstimado: 5000, potencialMensual: 1500 },
    { id: uid(), titulo: 'Dashboard Apple-Tecno — 3 sucursales iPhone', descripcion: 'Cliente potencial CALIENTE. Dashboard de control operativo: inventario, ventas, métricas por sucursal. Decisión de pricing en 3-4 días. Opciones: $1,000 + $200/mes (5 años = $13k) vs $2,500 one-time. Dev: Ezequiel + Enzo ($150 USD/mes).', estado: 'ejecucion', creadoEn: isoAtras(2), valorEstimado: 2500, potencialMensual: 200 },
    { id: uid(), titulo: 'App Logística — Mercado Pago + Testing', descripcion: 'App tercerizada a Ezequiel + Enzo. 90% completa. Falta integración real MP API y testing en producción. Blocker: MP webhooks + confirmaciones. Cliente esperando. Timeline: próxima semana en staging.', estado: 'ejecucion', creadoEn: isoAtras(5), valorEstimado: 1500, potencialMensual: 0 },
    { id: uid(), titulo: 'EnCasa Venezuela — Marketplace LATAM', descripcion: 'Marketplace validado para venezolanos en Argentina. Problema: info fragmentada de productos venezolanos sin saber stock. Estrategia: MVP lean → 5-10 proveedores con presale → traction → expansión. Co-founder: Muñeca (65/35). ARR potencial: $50k+ si 10k usuarios × $5 comisión.', estado: 'validacion', creadoEn: isoAtras(7), valorEstimado: 50000, potencialMensual: 5000 },
    { id: uid(), titulo: 'AICOLMENA MVP — Beta en 8 semanas', descripcion: 'Nuestro producto propio (ex-AICOLMENA). 60-70% completo. Features clave a agregar: Google Calendar sync (12h, 4 áreas), Deal scoring automático (16h, 3 áreas), Meeting notes (16h, 4 áreas). Meta: 50 usuarios beta en 12 semanas. SaaS $12-29/mes.', estado: 'ejecucion', creadoEn: isoAtras(3), valorEstimado: 15000, potencialMensual: 2900 },
  ];

  // ── TRANSACCIONES ────────────────────────────────────────────────────────────
  const transacciones = [
    // Ingresos
    { id: uid(), tipo: 'ingreso', monto: 750, categoria: 'Clientes', descripcion: 'Cliente Logística — mes abril', fecha: diasAtras(28) },
    { id: uid(), tipo: 'ingreso', monto: 750, categoria: 'Clientes', descripcion: 'Cliente Logística — mes mayo', fecha: diasAtras(2) },
    { id: uid(), tipo: 'ingreso', monto: 350, categoria: 'Clientes', descripcion: 'Cierre web Rukawe', fecha: diasAtras(22) },
    { id: uid(), tipo: 'ingreso', monto: 200, categoria: 'Clientes', descripcion: 'Barbería Emi — setup inicial', fecha: diasAtras(18) },
    { id: uid(), tipo: 'ingreso', monto: 150, categoria: 'Nippon Flex', descripcion: 'Comisión colchones — primo', fecha: diasAtras(12) },
    // Gastos
    { id: uid(), tipo: 'gasto', monto: 40, categoria: 'SaaS', descripcion: 'Supabase + Claude API', fecha: diasAtras(27) },
    { id: uid(), tipo: 'gasto', monto: 20, categoria: 'SaaS', descripcion: 'Vercel Pro', fecha: diasAtras(26) },
    { id: uid(), tipo: 'gasto', monto: 35, categoria: 'SaaS', descripcion: 'Groq API — AIcolmena', fecha: diasAtras(20) },
    { id: uid(), tipo: 'gasto', monto: 80, categoria: 'Marketing', descripcion: 'Meta Ads prueba restaurante', fecha: diasAtras(16) },
    { id: uid(), tipo: 'gasto', monto: 60, categoria: 'Transporte', descripcion: 'Nafta + peaje reuniones', fecha: diasAtras(14) },
    { id: uid(), tipo: 'gasto', monto: 120, categoria: 'Coworking', descripcion: 'Espacio cowork semana', fecha: diasAtras(10) },
    { id: uid(), tipo: 'gasto', monto: 45, categoria: 'SaaS', descripcion: 'Notion + Figma', fecha: diasAtras(8) },
    { id: uid(), tipo: 'gasto', monto: 25, categoria: 'Alimentación', descripcion: 'Almuerzo reunión cliente', fecha: diasAtras(4) },
    { id: uid(), tipo: 'gasto', monto: 15, categoria: 'SaaS', descripcion: 'ChatGPT Plus', fecha: diasAtras(3) },
  ];

  // ── AGENDA ───────────────────────────────────────────────────────────────────
  const agenda = [
    { id: uid(), titulo: 'Reunión cierre iPhone (3 sucursales)', personas: ['Cliente iPhone'], fecha: diasAtras(-1), hora: '10:00', contexto: 'Negociando $500-800 USD', tipo: 'reunion', creadoEn: isoAtras(3) },
    { id: uid(), titulo: 'Call Gabriela — Cabañas Rakun', personas: ['Gabriela'], fecha: diasAtras(-3), hora: '15:00', contexto: 'Ver web y cerrar propuesta', tipo: 'reunion', creadoEn: isoAtras(5) },
    { id: uid(), titulo: 'Llamada Fede (primo dentista)', personas: ['Fede'], fecha: diasAtras(-5), hora: '11:30', contexto: 'Presupuesto clínica ~$400 USD', tipo: 'reunion', creadoEn: isoAtras(7) },
    { id: uid(), titulo: 'Demo bodegón Las Sierras', personas: ['Dueño bodegón'], fecha: diasAtras(2), hora: '18:00', contexto: 'Completado ✓', tipo: 'reunion', creadoEn: isoAtras(10) },
  ];

  // ── HÁBITOS ──────────────────────────────────────────────────────────────────
  const habitos = [
    { id: uid(), titulo: 'Gym', icono: '💪', racha: 12, completadoHoy: true, ultimaVez: hoy, creadoEn: isoAtras(28) },
    { id: uid(), titulo: 'Lectura 30min', icono: '📚', racha: 18, completadoHoy: true, ultimaVez: hoy, creadoEn: isoAtras(28) },
    { id: uid(), titulo: 'Meditación', icono: '🧘', racha: 7, completadoHoy: false, ultimaVez: diasAtras(1), creadoEn: isoAtras(20) },
    { id: uid(), titulo: 'Sin redes hasta mediodía', icono: '📵', racha: 5, completadoHoy: false, ultimaVez: diasAtras(1), creadoEn: isoAtras(15) },
  ];

  // ── CRM ──────────────────────────────────────────────────────────────────────
  const contactosCRM = [
    { id: uid(), nombre: 'Cliente iPhone', empresa: 'iPhone 3 Sucursales', estado: 'negociacion', valor: 650, tipo: 'servicio' },
    { id: uid(), nombre: 'Gabriela', empresa: 'Cabañas Rakun', estado: 'contactado', valor: 350, tipo: 'servicio' },
    { id: uid(), nombre: 'Fede', empresa: 'Clínica Dental', estado: 'prospecto', valor: 400, tipo: 'servicio' },
    { id: uid(), nombre: 'Emi', empresa: 'Barbería Emi', estado: 'ganado', valor: 200, tipo: 'servicio' },
    { id: uid(), nombre: 'Lucas M.', empresa: 'Lubricentros WSP', estado: 'contactado', valor: 500, tipo: 'servicio' },
    { id: uid(), nombre: 'Bodegón Las Sierras', empresa: 'Gastronomía', estado: 'contactado', valor: 250, tipo: 'servicio' },
    { id: uid(), nombre: 'Apple-Tecno', empresa: 'Apple-Tecno — Dashboard 3 sucursales', estado: 'negociacion', valor: 2500, tipo: 'producto' },
    { id: uid(), nombre: 'Cliente Logística', empresa: 'App Logística — Ezequiel + Enzo', estado: 'negociacion', valor: 800, tipo: 'producto' },
  ];

  // ── ENERGY (últimos 14 días) ──────────────────────────────────────────────────
  const energyEntries = Array.from({ length: 14 }, (_, i) => ({
    id: uid(),
    fecha: diasAtras(i + 1),
    score: [7, 8, 6, 9, 7, 8, 9, 6, 7, 8, 9, 7, 8, 6][i],
    factores: {
      sueno: [7, 8, 6, 8, 7, 7, 9, 5, 7, 8, 8, 7, 7, 6][i],
      tipoDeSueno: ['bueno', 'excelente', 'regular', 'bueno', 'bueno', 'bueno', 'excelente', 'malo', 'bueno', 'bueno', 'excelente', 'bueno', 'bueno', 'regular'][i],
      estresTopics: [['cliente iPhone'], [], ['propuesta'], [], ['reuniones'], [], [], ['deudas'], [], [], ['launch'], [], [], ['planificación']][i],
    },
    analisisIA: 'Energía estable. El sueño de calidad correlaciona con picos de productividad.',
    recomendacion: 'Mantené la rutina de gym. Considerá meditación antes de reuniones críticas.',
    creadoEn: isoAtras(i + 1),
  }));

  // ── MEMORY ENTRIES (últimos 10 días) ─────────────────────────────────────────
  const memoryEntries = Array.from({ length: 10 }, (_, i) => ({
    id: uid(),
    fecha: diasAtras(i + 1),
    score: [8, 7, 9, 7, 8, 6, 8, 9, 7, 8][i],
    sintomas: [[], ['niebla mental leve'], [], ['cansancio'], [], ['distracción'], [], [], ['leve olvido'], []][i],
    contexto: ['Día productivo', 'Semana intensa de reuniones', 'Foco total en propuestas', 'Algo disperso', 'Buena concentración', 'Poco descanso', 'Recuperado', 'Top mental', 'Normal', 'Bien'][i],
    creadoEn: isoAtras(i + 1),
  }));

  // ── LEARNING CATEGORIES ───────────────────────────────────────────────────────
  const learningCategories = [
    { id: 'lc1', nombre: 'Ventas B2B', descripcion: 'Técnicas de cierre y negociación para servicios de IA', colorAccent: '#00D4FF', icono: '🎯', racha: 8, ultimoDia: diasAtras(1), creadoEn: isoAtras(25) },
    { id: 'lc2', nombre: 'IA & Automatización', descripcion: 'Prompting avanzado, APIs y agentes IA', colorAccent: '#FF6D28', icono: '🤖', racha: 15, ultimoDia: hoy, creadoEn: isoAtras(28) },
    { id: 'lc3', nombre: 'Marketing Digital', descripcion: 'Performance, copywriting y funnel para servicios', colorAccent: '#10B981', icono: '📈', racha: 4, ultimoDia: diasAtras(2), creadoEn: isoAtras(18) },
  ];

  const learningLessons = [
    { id: uid(), categoriaId: 'lc2', titulo: 'Cómo diseñar agentes con Groq', contenido: 'Los LLMs de Groq (llama-3.3-70b) son ideales para tareas de razonamiento rápido...', tipoContenido: 'texto', duracionEstimada: 8, completado: true, completadoEn: isoAtras(2), creadoEn: isoAtras(10) },
    { id: uid(), categoriaId: 'lc1', titulo: 'Framework de cierre SPIN Selling', contenido: 'SPIN: Situación, Problema, Implicación, Necesidad. Para servicios de IA aplicar...', tipoContenido: 'texto', duracionEstimada: 12, completado: true, completadoEn: isoAtras(5), creadoEn: isoAtras(15) },
    { id: uid(), categoriaId: 'lc2', titulo: 'Integración WhatsApp Business API', contenido: 'Meta ofrece WABA gratuito hasta 1000 conversaciones. Pasos: crear app en Meta...', tipoContenido: 'texto', duracionEstimada: 15, completado: true, completadoEn: isoAtras(8), creadoEn: isoAtras(20) },
    { id: uid(), categoriaId: 'lc3', titulo: 'Copywriting para propuestas de servicio', contenido: 'La propuesta no vende el servicio, vende el resultado. Estructura: Dolor → Sueño → Fix...', tipoContenido: 'texto', duracionEstimada: 10, completado: false, creadoEn: isoAtras(3) },
  ];

  // ── DAILY SCORES (29 días) ─────────────────────────────────────────────────
  const dailyScores = Array.from({ length: 29 }, (_, i) => ({
    fecha: diasAtras(28 - i),
    score: Math.round(55 + Math.random() * 40),
    tareasCompletadas: Math.floor(1 + Math.random() * 5),
    totalTareas: Math.floor(4 + Math.random() * 4),
    noticiasLeidas: Math.floor(Math.random() * 5),
  }));

  // ── DECISIONS ─────────────────────────────────────────────────────────────
  const decisions = [
    {
      id: uid(),
      descripcion: 'Enfocarme en servicios (Control.Evo) antes de escalar AIcolmena',
      fecha: diasAtras(20),
      contexto: 'Tenía la tentación de lanzar AIcolmena como SaaS antes de estabilizar ingresos de servicios',
      alternativas: ['Lanzar AIcolmena como SaaS ya', 'Primero $2k/mes en servicios, luego SaaS'],
      sentimiento: 'confianza',
      clarityAlMomento: 8,
      resultado: 'Correcta — cerré 2 clientes más desde esa decisión',
      aprobada: true,
      leccion: 'El dinero urgente no puede esperar el producto ideal',
      creadoEn: isoAtras(20),
    },
    {
      id: uid(),
      descripcion: 'No bajar el precio al cliente iPhone por debajo de $500 USD',
      fecha: diasAtras(7),
      contexto: 'Presionó para pagar $300 USD por las 3 sucursales',
      alternativas: ['Aceptar $300', 'Mantener $500 como mínimo y negociar extras'],
      sentimiento: 'duda',
      clarityAlMomento: 6,
      resultado: null,
      aprobada: null,
      leccion: null,
      creadoEn: isoAtras(7),
    },
  ];

  // ── ACCOUNTABILITY ─────────────────────────────────────────────────────────
  const accountabilityGoals = [
    {
      id: uid(),
      meta: 'Cerrar 3 clientes nuevos en mayo',
      fechaInicio: diasAtras(28),
      fechaFin: diasAtras(-2),
      progreso: 66,
      completada: false,
      leccion: null,
      creadoEn: isoAtras(28),
    },
    {
      id: uid(),
      meta: 'Lanzar AIcolmena v2 con todas las etapas',
      fechaInicio: diasAtras(28),
      fechaFin: diasAtras(-5),
      progreso: 90,
      completada: false,
      leccion: null,
      creadoEn: isoAtras(28),
    },
  ];

  // ── LEGACY ────────────────────────────────────────────────────────────────
  const legacy = {
    vision: 'Construir el sistema operativo personal para emprendedores LATAM que no tienen acceso a herramientas de clase mundial',
    valores: ['autonomía', 'ejecución', 'impacto real', 'consistencia', 'aprendizaje continuo'],
    paraQuien: 'Para el Tobia de 10 años atrás — y para cualquier emprendedor que empieza sin red',
    alineacion: 78,
    reflexionAlineacion: 'Estoy ejecutando en la dirección correcta, pero necesito más foco en cerrar clientes antes de construir más features',
    updatedAt: isoAtras(5),
  };

  // ── WRITE TO LOCALSTORAGE ─────────────────────────────────────────────────
  localStorage.setItem('domex_tareas', JSON.stringify(tareas));
  localStorage.setItem('domex_ideas', JSON.stringify(ideas));
  localStorage.setItem('domex_transacciones', JSON.stringify(transacciones));
  localStorage.setItem('domex_agenda', JSON.stringify(agenda));
  localStorage.setItem('domex_habitos', JSON.stringify(habitos));
  localStorage.setItem('domex_contactos', JSON.stringify(contactosCRM));
  localStorage.setItem('domex_energy', JSON.stringify(energyEntries));
  localStorage.setItem('domex_memory', JSON.stringify(memoryEntries));
  localStorage.setItem('domex_learning_categories', JSON.stringify(learningCategories));
  localStorage.setItem('domex_learning_lessons', JSON.stringify(learningLessons));
  localStorage.setItem('domex_daily_scores', JSON.stringify(dailyScores));
  localStorage.setItem('domex_decisions', JSON.stringify(decisions));
  localStorage.setItem('domex_accountability', JSON.stringify(accountabilityGoals));
  localStorage.setItem('domex_legacy', JSON.stringify(legacy));
}
