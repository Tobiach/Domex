// Cron job: runs daily at 11:00 UTC (8 AM Argentina)
// Full push notification requires VAPID keys + web-push package (future sprint)
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Domex] Morning briefing cron triggered at', new Date().toISOString());

  return res.status(200).json({
    ok: true,
    message: 'Briefing cron triggered',
    timestamp: new Date().toISOString(),
  });
}
