# BACKLOG — AIcolmena
# Features que NO se implementan hasta D30 retention > 30%
# Agregar acá todo lo que se pida fuera de prioridad

## 🔴 PRIORIDAD 1 — RETENCIÓN (en curso)
- [x] localStorage persistence para AppContext — ya implementado, ver AppContext.tsx
- [ ] **Motor de contexto emocional/relacional** — EN CONSTRUCCIÓN (chat paralelo, 2026-07-11+):
      modelo de "persona importante" (listo), motor de correlación extendiendo
      `detectarBlindSpots`, piso de seguridad de crisis, 3 checkboxes de consentimiento,
      pantalla "qué sabe Colmena de mí" en YO, máx. 1 check-in proactivo/día. Ver
      `KICKOFF-PARALELO-CODIGO.md`. Gate antes de pasar a reestructuración visual: 14 días de
      uso propio estable.
- [ ] Push notification D1: "Tu briefing de hoy está listo"
- [ ] Push notification D3: seguimiento contextual
- [ ] Push notification D7: resumen de primera semana

## 🟡 PRIORIDAD 2 — EXPERIENCIA (cuando P1 esté sólido)
- [x] Onboarding paso a paso — ya implementado (3 pasos + karaoke)
- [x] Sincronización texto-voz en briefing (karaoke) — ya implementado
- [ ] Modo silencio / "hoy no" para el briefing
- [ ] Reestructuración visual completa (tipografía/imágenes/animaciones/pulido mobile) —
      plan detallado en Drive "AIcolmena — Fundamentos e Inversión", BLOQUEADO hasta cerrar P1

## 🟢 PRIORIDAD 3 — FEATURES NUEVOS (después de HITO 1)
- [x] Finanzas personales básicas — ya implementado (Capital/Transacciones)
- [ ] Google Calendar sync — decisión tomada: solo lectura, detecta reuniones, no escribe
- [ ] CRM básico con alertas de seguimiento — el CRM de ventas (`ContactoCRM`) ya existe;
      esto ahora se resuelve como parte del motor de personas de P1, no aparte
- [ ] Resumen semanal compartible — pieza central de la estrategia de crecimiento (ver plan
      de Fable en Drive), pendiente decisión de Tobias sobre si se adelanta pese al gate D30

## 🔵 VISIÓN (2026-2027 — no tocar ahora)
- [ ] Agentes semi-autónomos
- [ ] Plan Team
- [ ] Integraciones enterprise
- [ ] Wearables

## IDEAS DESCARTADAS O DIFERIDAS
[Agregar acá features que se pidieron pero no pasan el filtro de retención]
