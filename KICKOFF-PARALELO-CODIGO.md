# KICKOFF — AIcolmena, carril de código en paralelo

> Pegar este archivo completo como primer mensaje en un chat NUEVO de Claude Code, con
> `C:\Users\estudiante\AIcolmena` como working directory. Este chat arranca sin memoria de la
> conversación donde se decidió esto — todo el contexto necesario está acá.

## Contexto (no cuestionar, es input ya decidido)

AIcolmena es un AI Personal OS por voz para LATAM (React 19 + Vite 6 + TS + Tailwind 4 + Framer
Motion, Groq como LLM principal, Supabase opcional/null-safe). El foco actual es construir el
**motor de contexto emocional/relacional**: un modelo de "persona importante" en la vida del
usuario + un motor que correlaciona eventos de esas personas con datos de ánimo/energía/sueño/
plata/trabajo, mostrando SIEMPRE la correlación como pregunta abierta, nunca como afirmación.

Regla dura de secuencia (viene de otra conversación, no la rompas): la reestructuración VISUAL
(tipografía, imágenes, animaciones, colores hardcodeados, nav de 5→4 tabs) está **pausada a
propósito** hasta que este motor esté estable. No toques nada de diseño/visual en este chat —
solo lo funcional listado abajo. Tampoco toques nada de Supabase/infraestructura — eso corre en
otro carril, en paralelo, y no depende de este trabajo.

## Qué SÍ hacer acá (en orden sugerido)

1. **Modelo de "persona importante"** — nueva interface en `src/types.ts`, nueva entidad en
   `AppContext.tsx` siguiendo el patrón ya existente de `STORAGE_KEYS` + `useEffect` +
   localStorage (ver cómo están hechos `contactos`, `habitos`, etc. en ese archivo). Campos:
   nombre, cómo la nombra el usuario (apodo), tipo de vínculo, hace cuánto se conocen (opcional),
   temas recurrentes (lista libre, se llena sola con el uso), última interacción, "temperatura"
   reciente (positiva/neutra/tensa — inferida, nunca un campo que se le pida directo al usuario),
   notas libres editables a mano. Vive local-first (localStorage), NO se sincroniza a Supabase
   por decisión ya tomada (dato sensible, opt-in aparte más adelante).

2. **Motor de correlación** — extender el patrón de `detectarBlindSpots()` en
   `src/services/optimizacionService.ts` (mismo estilo: junta datos, arma prompt a Groq, pide
   JSON, parsea). Nueva función que cruce: personas + `EnergyEntry` + `HormoneEntry` +
   `MemoryEntry`. Regla no negociable: el prompt tiene que forzar que la salida sea formulada
   como pregunta ("¿tiene que ver con...?"), nunca como afirmación. Empezar simple: 3+
   repeticiones de un patrón antes de mostrarlo (umbral conservador, ajustable después).

3. **Piso de seguridad — detección de crisis (prioridad alta, no es opcional).** Antes de que
   cualquier dato de usuario entre al motor de correlación, un paso previo (heurística de
   keywords + clasificación con Groq) que detecte señales de violencia/ideación suicida/abuso.
   Si se detecta: NO se trata como dato para correlacionar, se corta el flujo normal y se
   muestra un recurso de ayuda real (línea de crisis Argentina como mínimo — buscar el número
   oficial vigente, no inventarlo). Esto va desde el primer commit de este motor, no se pospone.

4. **3 checkboxes de consentimiento separados** — en onboarding o settings: (a) voz/
   transcripción, (b) salud/estado emocional, (c) datos de terceros. Opt-in explícito, no un
   solo "acepto términos". Requisito legal ya investigado, no es debatible.

5. **Máximo 1 check-in relacional proactivo por día** — en la lógica que genera el briefing/
   HOY: si hay más de un patrón o persona para preguntar, se prioriza el de mayor confianza y el
   resto espera al día siguiente.

6. **Pantalla "qué sabe Colmena de mí"** — dentro de la vista `Yo.tsx` (NO crear una sección
   nueva llamada "Memoria", ese nombre ya lo usa la vista de memoria cognitiva/sueño/azúcar que
   existe). Lista editable de lo que el sistema registró: personas, patrones detectados, notas.
   El usuario puede editar o borrar cualquier entrada.

7. **Red de seguridad básica de QA** (justificación: ayuda a validar que este mismo motor esté
   estable, no es la reestructuración visual pausada):
   - `ErrorBoundary` global en `App.tsx` — hoy un crash de React deja pantalla blanca. Mensaje
     digno + botón que abra WhatsApp con un mensaje pre-armado de reporte.
   - Activar session replay de PostHog (ya está instalado como dependencia, `posthog-js`, pero
     no se está usando replay) — sirve para ver qué pasa de verdad en el uso diario de prueba.

8. **Shim de migración `domex_*` → `aicolmena_*`** en localStorage — hay 84 referencias a
   "domex" en 19 archivos, la mayoría keys de localStorage. Antes de tocarlas: función que al
   iniciar la app, si encuentra una key vieja `domex_*` sin su equivalente `aicolmena_*`, copia
   el valor y no borra la vieja hasta confirmar que la migración funcionó. Hacer esto ahora
   evita perder datos de las pruebas de estabilidad de 14 días que ya están corriendo.

## Qué NO hacer acá

- Nada de tipografía, imágenes, colores, animaciones, ni el fix del tab bar de 5→4 — está
  pausado a propósito, corre en otra fase.
- Nada de Supabase (schema, auth, env vars) — corre en otro carril, no lo toques ni asumas que
  ya está listo.
- No inventar el número de línea de ayuda para crisis — buscarlo real o dejarlo como TODO
  explícito y avisar.

## Al terminar cada bloque

`npm run lint` (tsc --noEmit) = 0 errores antes de commitear. Commits chicos y separados por
bloque (no un commit gigante con los 8 puntos juntos). No hace falta build+deploy hasta que el
founder decida — este trabajo se valida localmente primero (regla de las "14 días de uso propio
estable" antes de pasar a la fase visual).
