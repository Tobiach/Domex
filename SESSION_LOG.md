# SESSION LOG — AIcolmena
# Actualizar al inicio y cierre de cada sesión

## ESTADO ACTUAL DEL PROYECTO
ESTADO_APP: motor de contexto emocional/relacional en construcción (chat paralelo) — commit
más reciente en main: f743b69 (modelo local-first de persona importante)
BRANCH_ACTIVA: main (redesign-v2 ya mergeada hace tiempo, ese branch quedó obsoleto)
ULTIMO_DEPLOY: sin confirmar desde acá — verificar con `vercel ls` antes de asumir qué está
live; los env vars de Supabase nuevo están seteados en Vercel pero requieren un deploy nuevo
para tomar efecto
BUGS_CRITICOS: 0 conocidos
TSC_ERRORS: 0 (al momento del último commit)
FEATURE_ACTUAL: motor de personas + motor de correlación + piso de seguridad de crisis (ver
KICKOFF-PARALELO-CODIGO.md para el detalle completo)
PROXIMO_PASO: cerrar el gate de P1 (14 días de uso propio estable) antes de tocar nada visual

## MÉTRICAS ACTUALES
USUARIOS_PAGOS: 0
MRR_ACTUAL: $0

## PROTOCOLO DE ROLLBACK
- Volver atrás: `git checkout main`
- Checkpoint real (verificado, no el "v1" que este doc mencionaba antes y nunca existió en git):
  tag `checkpoint-pre-reestructuracion-2026-07-11` sobre commit `e8e44ef`
- Merge a main: NO hacer sin confirmación explícita de Tobias
- Deploy producción: pendiente de re-deployar con las env vars de Supabase nuevo aplicadas

## REDESIGN — 11/11 PASOS COMPLETOS

| Paso | Descripción | Commit |
|------|-------------|--------|
| 0 | Backup: checkpoint + tag v1-estable-pre-redesign + branch redesign-v2 | ae0cf9c |
| 1 | Design tokens: tokens.css, paleta Miel Fundida completa | 6cbe41a |
| 2 | Tipografía: Space Grotesk + Inter en index.html | 6cbe41a |
| 3 | Tab bar: 4 tabs (HOY/CONTEXTO/INSIGHTS/YO) + FAB central de voz | 30f3eed |
| 4 | Dashboard HOY: BriefingHeroCard + 3 prioridades + ScoreCircle honey | 9619fd4 |
| 5 | VoicePanel fullscreen: transcript live, estados, éxito/error animados | 9619fd4 |
| 6 | CONTEXTO: tabs internos (Tareas/Ideas/Finanzas/Personas) | 6f9dca0 |
| 7 | Onboarding 3 pasos: nombre+rol+hora / pain point / karaoke aha moment | ab3e96b |
| 8 | INSIGHTS: stats + LineChart score + BarChart finanzas periodo selector | 9619fd4 |
| 8 | YO: stats uso + balance + plan + logout | 9619fd4 |
| 9 | Saludo horario correcto (buenos días/tardes/noches) | anterior |
| 10 | Karaoke briefing: sync palabra a palabra con onboundary + fallback timer | ab3e96b |
| 11 | Empty states personalidad (Tasks/Ideas/Capital/CRM/Habitos) + skeleton mercado | aa5afdb |

## ARCHIVOS CLAVE CREADOS/MODIFICADOS
- `src/styles/tokens.css` — sistema de diseño completo (Miel Fundida)
- `src/components/Navigation/BottomNav.tsx` — tab bar + FAB + VoicePanel overlay
- `src/views/Dashboard.tsx` — pantalla HOY con skeleton mercado
- `src/views/Contexto.tsx` — pantalla CONTEXTO (nueva)
- `src/views/Insights.tsx` — pantalla INSIGHTS con charts (nueva)
- `src/views/Yo.tsx` — pantalla YO con stats (nueva)
- `src/views/Onboarding.tsx` — 3 pasos + karaoke (reescrito)
- `src/views/Tasks.tsx / Ideas.tsx / Capital.tsx / CRM.tsx / Habitos.tsx` — empty states

## DECISIONES TÉCNICAS
- VoicePanel integrado en BottomNav (no portal) — más simple, funciona igual
- Karaoke usa speechSynthesis.onboundary con fallback a interval timer (mobile compatibility)
- Onboarding: email es opcional — genera ID anónimo si no se ingresa
- Conciencia usa grid 2×2 (no 3-col con orphan)
- ScoreCircle migrado de cyan (#00D4FF) a honey tokens

## PENDIENTE
- [x] Alias aicolmena.vercel.app — hecho 2026-07-11 vía Vercel CLI
- [x] Supabase conectado — proyecto nuevo dedicado (aerclckcbrzihoefmeep), schema + RLS +
      Email OTP + SMTP (Resend) aplicados vía CLI
- [ ] Deploy a producción con las env vars nuevas (falta disparar el build)
- [ ] Push notifications retención D1/D3/D7 — sigue sin arrancar, ver BACKLOG.md P1
- [ ] Resolver acceso a Vercel en PC madre (bloqueado por passkey 2FA)
- [ ] 10 preguntas abiertas del plan de reestructuración/crecimiento (ver Drive)

## PRÓXIMOS 3 PASOS
1. Terminar motor emocional en el chat paralelo (KICKOFF-PARALELO-CODIGO.md)
2. 14 días de uso propio estable (gate antes de tocar nada visual)
3. Deploy a producción una vez resuelto el acceso de Vercel en PC madre (o desde PC B)

## HISTORIAL DE SESIONES

### 2026-06-11 — Redesign completo 11/11 pasos
Pasos 1-11 implementados en una sesión. 0 errores TSC. Deploy en domex-temp.vercel.app.

### 2026-07-10/11 — Rebrand, auditoría, research de mercado/legal, motor emocional
Rebrand Domex→AIcolmena completado (PWA manifest agregado). Research de mercado y legal
(AR/BR/CL/CO) vía Perplexity — ver carpeta Drive "AIcolmena — Fundamentos e Inversión". Plan de
reestructuración visual + crecimiento armado (modelo Fable 5) — pausado hasta cerrar el motor
emocional. Migración completa a Supabase nuevo vía CLI (schema, auth, SMTP). Arrancó
construcción del motor de contexto emocional/relacional en chat paralelo (persona importante +
correlación + piso de seguridad de crisis).
