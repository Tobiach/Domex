import { useEffect, useRef } from 'react';

export function useAgendaNotifications(enabled: boolean) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !('Notification' in window)) return;

    const check = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const nowMin = now.getHours() * 60 + now.getMinutes();

      try {
        const agenda = JSON.parse(localStorage.getItem('domex_agenda') || '[]');
        agenda.forEach((item: { id: string; titulo: string; fecha: string; hora: string }) => {
          if (item.fecha !== todayStr || !item.hora) return;

          const [h, m] = item.hora.split(':').map(Number);
          const itemMin = h * 60 + m;
          const diff = itemMin - nowMin;

          const keys: [string, number, string, string][] = [
            [`${item.id}_15`, 15, `⏰ ${item.titulo}`, 'En 15 minutos · AIcolmena OS'],
            [`${item.id}_5`,   5, `🔔 ${item.titulo}`, 'En 5 minutos · AIcolmena OS'],
            [`${item.id}_0`,   0, `🚨 ${item.titulo}`, 'Ahora · AIcolmena OS'],
          ];

          keys.forEach(([key, target, title, body]) => {
            if (diff >= target - 1 && diff <= target + 1 && !notifiedRef.current.has(key)) {
              notifiedRef.current.add(key);
              new Notification(title, { body, icon: '/favicon.ico' });
            }
          });
        });
      } catch {}
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [enabled]);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}
