import { callGroqWithFallback } from './groqService';

export interface UserContext {
  btcChange: number;
  ethChange: number;
  todayTasks: Array<{ titulo: string; prioridad: string }>;
  streak: number;
  nextMeetings: Array<{ title: string; time: string }>;
  newsCount: number;
  diasSinAbrir?: number;
  patternInsight?: string;
}

export type VoiceIntentType = 'COMANDO' | 'PREGUNTA' | 'CONVERSACIÓN';

export type VoiceCategoria =
  | 'tarea'
  | 'reunion'
  | 'gasto'
  | 'ingreso'
  | 'idea'
  | 'nota'
  | 'habito'
  | 'crm'
  | 'navegacion';

export interface VoiceDatos {
  titulo?: string;
  fecha?: string | null;
  hora?: string | null;
  monto?: number | null;
  personas?: string[];
  contexto?: string | null;
  prioridad?: 'alta' | 'normal' | 'baja';
  frecuencia?: string | null;
  icono?: string | null;
  empresa?: string | null;
  tag?: string | null;
  destino?: string | null;
  moneda?: string | null;
}

export interface VoiceIntelligenceResult {
  tipo: VoiceIntentType;
  categoria?: VoiceCategoria;
  accion: 'guardar' | 'responder' | 'charlar' | 'navegar';
  datos?: VoiceDatos;
  confianza: number;
  respuestaAlUsuario: string;
}

// Routes mapped by destino value returned from AI
export const DESTINO_ROUTES: Record<string, string> = {
  habitos:      '/habitos',
  tareas:       '/tasks',
  ideas:        '/ideas',
  crm:          '/crm',
  mercado:      '/mercado',
  intel:        '/intel',
  chat:         '/chat',
  dashboard:    '/',
  inicio:       '/',
  configuracion:'/settings',
  conciencia:   '/conciencia',
  aprender:     '/conciencia/aprender',
  nutricion:    '/conciencia/nutricion',
  memoria:      '/conciencia/memoria',
  energia:      '/conciencia/energia',
  hormonas:     '/conciencia/hormonas',
  balance:      '/conciencia/balance',
  paths:         '/conciencia/paths',
  biblioteca:    '/conciencia/biblioteca',
  debate:        '/conciencia/debate',
  mente:         '/conciencia',
  optimizacion:  '/optimizacion',
  decisiones:    '/optimizacion/decisiones',
  accountability:'/optimizacion/accountability',
  legado:        '/optimizacion/legado',
};

// Minimum confidence to execute a COMANDO (lower → show success but don't write)
export const CONFIDENCE_THRESHOLD = 75;

export async function procesarVozInteligente(
  transcript: string,
  context: UserContext
): Promise<VoiceIntelligenceResult> {
  const ahora = new Date();
  const manana = new Date(ahora);
  manana.setDate(manana.getDate() + 1);
  const mananaStr = manana.toISOString().split('T')[0];
  const hoyStr = ahora.toISOString().split('T')[0];

  const prompt = `Sos Colmena, el asistente de inteligencia artificial de AIcolmena para emprendedores argentinos. Analizá el texto y devolvé solo JSON válido sin markdown.

ENTRADA: "${transcript}"

CONTEXTO:
Hoy: ${hoyStr} (${ahora.toLocaleString('es-AR')})
Mañana: ${mananaStr}
Mercado: BTC ${context.btcChange >= 0 ? '+' : ''}${context.btcChange}% | ETH ${context.ethChange >= 0 ? '+' : ''}${context.ethChange}%
Tareas: ${context.todayTasks.length > 0 ? context.todayTasks.map(t => `${t.titulo}(${t.prioridad})`).join(', ') : 'ninguna'}
Racha: ${context.streak} días
Reuniones: ${context.nextMeetings.length > 0 ? context.nextMeetings.map(m => `${m.title}@${m.time}`).join(', ') : 'ninguna'}${context.diasSinAbrir ? `\nDías sin abrir la app: ${context.diasSinAbrir}` : ''}${context.patternInsight ? `\nInsight de comportamiento: ${context.patternInsight}` : ''}

═══ MÓDULOS Y DETECCIÓN ═══

COMANDO/tarea — crear tarea, recordatorio o seguimiento
  Claves: "recordar", "tengo que", "hay que", "agregar tarea", "hacer", "pendiente", "anotá que", "acordame", "me falta", "tengo pendiente", "mandé la propuesta", "seguimiento a", "llamar a", "contactar a", "vence el"

COMANDO/reunion — agendar reunión, llamada, juntada
  Claves: "reunión", "meeting", "agendar", "juntarme", "juntamos", "llamada con", "cita con", "nos vemos", "zoom", "meet", "call con", "hablo con", "el martes", "el viernes", "pasado mañana", "la semana que viene"

COMANDO/gasto — registrar GASTO, pago, compra, inversión
  Claves: "gasté", "invertí", "pagué", "compré", "gasto de", "salió", "me costó", "pagué por"
  NUNCA usar para cobros/ingresos
  Campo "tag": categoría del gasto. Opciones: Alimentación, Transporte, Marketing, Salud, Educación, Entretenimiento, Servicios, Cuidado personal, Tecnología, Vivienda, Otros
  Si no se menciona categoría, "tag": null

COMANDO/ingreso — registrar INGRESO, cobro, pago recibido
  Claves: "cobré", "me pagaron", "me pagó", "llegó el pago", "llegó el depósito", "ingresé", "me transfirieron", "me depositaron", "facturé", "cobré del cliente", "me debían y pagaron", "entró plata", "cerramos la venta"
  Campo "tag": categoría del ingreso. Opciones: Ventas, Servicios, Inversiones, Freelance, Dividendos, Otros ingresos
  Si no se menciona categoría, inferir de contexto. Si no hay contexto, "tag": null

COMANDO/idea — nueva idea de negocio, proyecto o solución
  Claves: "idea:", "qué tal si", "podríamos", "nueva idea", "se me ocurrió", "startup", "y si hacemos", "pensé en", "proyecto nuevo"

COMANDO/nota — nota genérica sin categoría clara
  Claves: "anotá", "guardá esto", "nota:", "quiero recordar", "anotame", "guardame"

COMANDO/habito — crear o registrar un hábito diario
  Claves: "hábito", "rutina", "quiero hacer", "cada día", "todos los días", "diariamente", "meditar", "ejercitar", "leer cada", "fui al gym", "entrené", "corrí hoy", "hice ejercicio"

COMANDO/crm — guardar contacto, lead, cliente o interacción
  Claves: "guardar contacto", "agregar cliente", "conocí a", "nuevo lead", "potencial cliente", "guardá a", "hablé con", "se interesó", "prospecto", "seguimiento a [nombre]", "cerré con", "mandé propuesta a"

COMANDO/navegacion — navegar a una sección de la app
  Claves: "abrir", "ir a", "mostrar", "ver mis", "llevame a", "andá a", "abrí", "mostrá", "quiero ver"
  Destinos válidos: habitos, tareas, ideas, crm, mercado, intel, chat, dashboard, inicio, configuracion, conciencia, aprender, nutricion, memoria, mente, energia, hormonas, balance, paths, biblioteca, debate, optimizacion, decisiones, accountability, legado

PREGUNTA — consulta sobre datos del sistema
  Claves: "cómo está", "cuánto", "qué tareas", "mi racha", "mis reuniones", "cuánto tengo", "cómo voy", "qué pasa con el bitcoin", "cuántos clientes"

CONVERSACIÓN — saludo, agradecimiento, charla casual

═══ REGLAS ═══
1. "tengo reunión X" → SIEMPRE COMANDO/reunion
2. "quiero meditar cada mañana" / "fui al gym" → COMANDO/habito
3. "guardar a Lucas como lead" / "hablé con X" → COMANDO/crm
4. "ir a hábitos" / "andá a tareas" → COMANDO/navegacion
5. "cobré X" / "me pagaron X" → SIEMPRE COMANDO/ingreso (NO gasto)
6. "gasté X" / "pagué X" → SIEMPRE COMANDO/gasto (NO ingreso)
7. Fechas: "mañana"=${mananaStr}, "hoy"=${hoyStr}, "pasado mañana"=día+2, "el lunes/martes/etc."=próximo día de semana
8. Horas: "10am"="10:00", "3pm"="15:00", "6pm"="18:00", "a la tarde"="16:00", "a la noche"="20:00"
9. Ignorar muletillas: "che", "boludo", "mirá", "dale" al inicio → procesar el resto
10. respuestaAlUsuario: jerga rioplatense, 1 frase. Ej: "Dale, tarea guardada.", "Ya quedó la reunión.", "Re bien, hábito creado.", "Listo, ingreso registrado.", "Copado, anotado.", "Para allá voy."
11. confianza: 70-100. Dudoso → 70-75
12. datos SIEMPRE presente en COMANDO aunque campos sean null
13. moneda: "dólares/USD/USDT/en dólares/billete verde" → "USD"; "pesos/ARS" o sin mención → "ARS"

═══ FORMATOS ═══

TAREA:
{"tipo":"COMANDO","categoria":"tarea","accion":"guardar","datos":{"titulo":"Enviar propuesta","fecha":"${hoyStr}","hora":null,"monto":null,"personas":[],"contexto":null,"prioridad":"media","frecuencia":null,"icono":null,"empresa":null,"tag":null,"destino":null},"confianza":95,"respuestaAlUsuario":"Tarea guardada."}

HÁBITO:
{"tipo":"COMANDO","categoria":"habito","accion":"guardar","datos":{"titulo":"Meditar","fecha":null,"hora":"08:00","monto":null,"personas":[],"contexto":"mañana","prioridad":"normal","frecuencia":"diaria","icono":"🧘","empresa":null,"tag":null,"destino":null},"confianza":93,"respuestaAlUsuario":"Hábito 'Meditar' creado."}

GASTO:
{"tipo":"COMANDO","categoria":"gasto","accion":"guardar","datos":{"titulo":"Almuerzo en restaurante","fecha":"${hoyStr}","hora":null,"monto":5000,"personas":[],"contexto":"almuerzo restaurante","prioridad":"normal","frecuencia":null,"icono":null,"empresa":null,"tag":"Alimentación","destino":null,"moneda":"ARS"},"confianza":95,"respuestaAlUsuario":"Mandado el gasto."}

INGRESO:
{"tipo":"COMANDO","categoria":"ingreso","accion":"guardar","datos":{"titulo":"Cliente X","fecha":"${hoyStr}","hora":null,"monto":80000,"personas":["Cliente X"],"contexto":"pago cliente","prioridad":"normal","frecuencia":null,"icono":null,"empresa":null,"tag":"Ventas","destino":null,"moneda":"ARS"},"confianza":95,"respuestaAlUsuario":"Listo, ingreso registrado."}

CRM:
{"tipo":"COMANDO","categoria":"crm","accion":"guardar","datos":{"titulo":"Lucas","fecha":null,"hora":null,"monto":null,"personas":["Lucas"],"contexto":"inversor crypto","prioridad":"normal","frecuencia":null,"icono":null,"empresa":null,"tag":"inversor crypto","destino":null},"confianza":91,"respuestaAlUsuario":"Lucas guardado como lead."}

NAVEGACIÓN:
{"tipo":"COMANDO","categoria":"navegacion","accion":"navegar","datos":{"titulo":null,"fecha":null,"hora":null,"monto":null,"personas":[],"contexto":null,"prioridad":"normal","frecuencia":null,"icono":null,"empresa":null,"tag":null,"destino":"habitos"},"confianza":98,"respuestaAlUsuario":"Abriendo hábitos."}

PREGUNTA:
{"tipo":"PREGUNTA","accion":"responder","respuestaAlUsuario":"Respuesta directa con datos del contexto.","confianza":95}

CONVERSACIÓN:
{"tipo":"CONVERSACIÓN","accion":"charlar","respuestaAlUsuario":"Respuesta cálida y breve.","confianza":100}

RESPONDÉ SOLO JSON. SIN TEXTO EXTRA.`;

  const text = await callGroqWithFallback(
    [{ role: 'user', content: prompt }],
    { maxTokens: 450, temperature: 0.1 }
  );

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  try {
    return JSON.parse(cleaned) as VoiceIntelligenceResult;
  } catch {
    throw new Error('No entendí bien. Intentá de nuevo.');
  }
}

export function iniciarReconocimientoVoz(
  onResult: (transcript: string) => void,
  onEnd: () => void
): (() => void) | null {
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const recognition = new SpeechRec();
  recognition.lang = 'es-AR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e: any) => onResult(e.results[0][0].transcript);
  recognition.onerror = () => onEnd();
  recognition.onend = onEnd;
  recognition.start();

  return () => recognition.stop();
}
