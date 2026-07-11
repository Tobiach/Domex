# CLAUDE.md — AIcolmena

> Leído automáticamente por Claude Code al iniciar sesión en este repo.
> Corrige y reemplaza la referencia rota en `.cursorrules` ("CLAUDE.md y CLAUDE_CODE_MASTER.md" —
> este archivo es la fuente real; `CLAUDE_CODE_MASTER.md` no existe y no hace falta crearlo aparte).

---

## QUIÉN SOY

Tobias Nahuel — 21 años, CABA. Founder de AIcolmena. Builder, no teórico.
Este es mi proyecto propio (startup), no un cliente — distinto de Control.Evo (bar-restaurante-arg,
Super Ezefran), que son trabajos de implementación para terceros. No mezclar contexto entre ambos.

---

## QUÉ ES AICOLMENA

AI Personal OS para LATAM. No es un CRM ni un to-do list — es un asistente de vida diaria por voz
con un motor central de contexto emocional/relacional: aprende de lo que el usuario cuenta a lo
largo del tiempo (personas importantes, patrones de ánimo/energía/sueño/plata/trabajo) y detecta
correlaciones, mostrándolas SIEMPRE como pregunta abierta, nunca como afirmación clínica.
Alrededor de eso: briefing matutino, tareas, ideas, finanzas personales, hábitos, insights.

**Regla de oro de producto:** antes de cada feature, preguntar — ¿esto ayuda a que el usuario
vuelva mañana? Si no, va al backlog, no se implementa ahora. Nada de features fuera de esto
hasta que la retención D30 supere 30%.

---

## STACK

React 19 · Vite 6 · TypeScript · Tailwind 4 · React Router 7 · Supabase · Groq (motor principal
de IA) · Gemini (`@google/genai`, secundario) · PostHog (analytics, opcional — sin key no trackea)
· Vercel

Serverless functions en `api/`: `gemini-text.ts`, `groq.ts`, `news.ts`, `send-briefing.ts`, `early-access.ts`.

---

## ESTADO REAL (verificado en código el 2026-07-10 — no confiar ciegamente en BACKLOG.md/SESSION_LOG.md, ver nota abajo)

- **0 usuarios pagos, MRR $0.** Producto pre-revenue.
- Rebrand completo: Domex/DomexAI → AIcolmena/AIcolmenaAI (último commit `e112a95`).
- Redesign v2 "Miel Fundida" completo y mergeado a `main` (11/11 pasos).
- Deploy vive en `https://domex-temp.vercel.app`, alias `aicolmena.vercel.app` configurado
  (2026-07-11). Falta re-deployar a producción para que tome las env vars de Supabase nuevo.
- **Persistencia localStorage: YA IMPLEMENTADA.** `BACKLOG.md` la lista como pendiente P1 —
  está desactualizado. `AppContext.tsx` persiste 12+ entidades (tareas, ideas, transacciones,
  hábitos, contactos, learning, meals, memory, energy, hormone, etc.) vía `useEffect` + `localStorage`.
- **Push notifications D1/D3/D7: SIGUEN PENDIENTES DE VERDAD.** `notificationService.ts` tiene
  23 líneas — solo registra el service worker y pide permiso del browser. No hay lógica de
  campaña D1/D3/D7 ni scheduling. Esto sí es un gap real y es la prioridad #1 de retención.
- `SESSION_LOG.md` está congelado en 2026-06-11 — hay commits posteriores (el rebrand) sin loguear.
- **Supabase: activado en proyecto nuevo dedicado** (`aerclckcbrzihoefmeep`, región Canadá).
  Nunca había estado conectado en prod antes (verificado 2026-07-11). Vía CLI ya están: schema
  completo con RLS (8 tablas), auth con `site_url`/redirect URLs apuntando a producción, SMTP
  real (Resend) configurado. Env vars ya están en Vercel — **falta el deploy** para que tomen
  efecto en producción. Ver `project_aicolmena_vision_emocional.md` en memoria persistente.
- **Motor de contexto emocional/relacional: EN CONSTRUCCIÓN**, corriendo en un chat paralelo
  desde 2026-07-11 (ver `KICKOFF-PARALELO-CODIGO.md` en la raíz del repo). Modelo de "persona
  importante" ya commiteado; motor de correlación y piso de seguridad de crisis en progreso.
  Este es ahora el foco central del producto, no una feature más — ver la sección QUÉ ES
  AICOLMENA arriba, que todavía no refleja esto del todo.

**⚠️ Antes de asumir el estado de una feature por lo que dice BACKLOG.md o SESSION_LOG.md,
verificar en el código (`grep`/`Read`) — ya se demostró que la documentación va atrasada
respecto al código real.**

---

## CÓMO TRABAJAMOS

```
1. Responder SIEMPRE en español (rioplatense en texto visible al usuario final de la app)
2. Sin confirmaciones innecesarias — actuar directo salvo cambio destructivo/irreversible
3. Sin motivar, sin validar ideas automáticamente, sin abrir frentes no pedidos
4. Responder solo al terminar: qué hice, máximo 3 líneas
5. Leer este CLAUDE.md + MEMORY.md persistente antes de implementar
6. Verificar el código real antes de confiar en BACKLOG.md/SESSION_LOG.md
7. npm run lint (tsc --noEmit) = 0 errores antes de cualquier commit
8. TypeScript estricto — nunca `any` sin comentario explicando por qué
9. 0 console.log en producción
10. Mobile-first 375px
11. Commit con mensaje claro después de cada bloque de trabajo
12. No explicar lo que vas a hacer — hacerlo
13. No agregar dependencias >50kb sin mencionarlo
14. No quemar tokens mostrando código que no se pidió ver
```

---

## NUNCA SIN AUTORIZACIÓN EXPLÍCITA (heredado de .cursorrules)

- Cambiar arquitectura de Supabase o RLS
- Cambiar la URL de Vercel (`domex-temp.vercel.app` / futura `aicolmena.vercel.app`)
- Modificar el sistema de autenticación
- Cambiar el flujo de generación del briefing matutino

---

## FASES DE OPERACIÓN

**Fase 1 — Lectura dirigida:** Read/Grep/Glob directo si sé qué busco. Agente Explore solo si son +3-5 búsquedas abiertas.
**Fase 2 — Diagnóstico:** identificar línea exacta y efecto secundario antes de escribir.
**Fase 3 — Ejecución:** Edit para cambios puntuales, Write solo para archivos nuevos. Paralelo si son independientes.
**Fase 4 — Build → commit → push → deploy:**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
$env:NODE_OPTIONS="--max-old-space-size=3072"
npm run lint    # 0 errores
npm run build   # limpio
git add src/[archivos específicos]
git commit -m "tipo: descripción clara"
git push origin main
npx vercel --yes --prod
```
**Fase 5 — Reporte:** máximo 3 líneas — qué cambió, commit, URL si aplica.

---

## ANTI-TOKEN-BURN

❌ No releer un archivo recién editado · ❌ No leer archivos completos si alcanza un extracto ·
❌ No explicar antes de actuar · ❌ No abrir frentes no pedidos · ❌ No usar bash grep/find
teniendo Grep/Glob dedicados

✅ Leer lo mínimo necesario · ✅ Paralelizar tool calls independientes · ✅ Reportar solo el resultado

---

## PROYECTOS PARALELOS — NO MEZCLAR

Si la tarea menciona logística, Apple-Tecno, cabañas, EncasaVenezuela, Control.Evo, bar-restaurante-arg
o Super Ezefran: son repos/negocios separados. Preguntar antes de tocar cualquier cosa cruzada.

---

*Actualizado: 2026-07-11*
