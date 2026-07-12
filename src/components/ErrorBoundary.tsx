import React from 'react';

const SOPORTE_WHATSAPP = '5491136026302';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reportarPorWhatsApp = () => {
    const mensaje = `Hola, AIcolmena se rompió.\nError: ${this.state.error?.message ?? 'desconocido'}\nHora: ${new Date().toLocaleString('es-AR')}`;
    const url = SOPORTE_WHATSAPP
      ? `https://wa.me/${SOPORTE_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-6 text-center"
        style={{ background: 'var(--bg-primary, #0A0A0F)', color: 'var(--text-primary, white)' }}
      >
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-xl font-black tracking-tight">Algo se rompió de nuestro lado</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary, rgba(255,255,255,0.6))' }}>
            Tus datos están a salvo en tu dispositivo. Contános qué pasó y lo arreglamos.
          </p>
          <button
            onClick={this.reportarPorWhatsApp}
            className="w-full py-3.5 rounded-2xl font-black text-sm"
            style={{ background: 'var(--honey-core, #C9941A)', color: 'var(--text-on-honey, #0A0A0F)' }}
          >
            Reportar por WhatsApp
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-surface, rgba(255,255,255,0.04))', border: '1px solid var(--border-default, rgba(255,255,255,0.1))' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
}
