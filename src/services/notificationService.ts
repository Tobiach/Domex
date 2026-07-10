export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/service-worker.js');
  } catch {
    return null;
  }
}

export async function solicitarPermiso(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export async function mostrarNotificacion(titulo: string, cuerpo: string) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification(titulo, {
    body: cuerpo,
    icon: '/icon.svg',
  });
}
