import posthog from 'posthog-js';

const KEY  = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN as string | undefined;
const HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;

export function initAnalytics() {
  if (!KEY) return; // no-op en dev si no hay key

  posthog.init(KEY, {
    api_host: HOST ?? 'https://us.i.posthog.com',

    // ── Privacidad total ──────────────────────────────────────
    autocapture: false,          // no captura clics/inputs automáticos
    capture_pageview: false,     // controlamos manualmente
    capture_pageleave: false,
    disable_session_recording: false, // replay activo para ver uso real en pruebas de 14 días
    mask_all_text: true,         // enmascara TODO el texto en el replay (personas, notas, salud)
    mask_all_element_attributes: true,

    // ── Comportamiento ────────────────────────────────────────
    persistence: 'localStorage+cookie',
    bootstrap: { distinctID: crypto.randomUUID() }, // ID anónimo por defecto

    // ── Sin datos de red innecesarios ─────────────────────────
    opt_out_capturing_by_default: false,
    sanitize_properties: (props) => {
      // elimina cualquier propiedad que contenga info sensible
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === 'string' && v.includes('@')) continue; // emails
        clean[k] = v;
      }
      return clean;
    },
  });
}

// ── Identificar usuario (solo hash del email, no el email real) ──
export function identifyUser(emailHash: string, nombre: string) {
  if (!KEY) return;
  posthog.identify(emailHash, { nombre_inicial: nombre.charAt(0).toUpperCase() });
}

export function resetUser() {
  if (!KEY) return;
  posthog.reset();
}

// ── Eventos de página ─────────────────────────────────────────────
export function trackPage(path: string) {
  if (!KEY) return;
  posthog.capture('page_view', { path });
}

// ── Eventos de módulos ────────────────────────────────────────────
export function trackModule(module: string) {
  if (!KEY) return;
  posthog.capture('module_open', { module });
}

// ── Eventos de features ───────────────────────────────────────────
export function trackFeature(feature: string, props?: Record<string, string | number | boolean>) {
  if (!KEY) return;
  posthog.capture('feature_used', { feature, ...props });
}

// ── Eventos de conversión ─────────────────────────────────────────
export function trackConversion(event: 'onboarding_complete' | 'login' | 'export_csv' | 'ai_priority_generated' | 'focus_session_started') {
  if (!KEY) return;
  posthog.capture(event);
}
