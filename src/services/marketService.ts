const CACHE_KEY = 'domex_market_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
  lastUpdateMinutes?: number; // minutos desde la última actualización exitosa
}

// In-memory cache (persiste por sesión, no por recarga)
const memCache = new Map<string, { data: MarketData; timestamp: number }>();

export async function fetchMarketData(): Promise<MarketData> {
  const CACHE_KEY_MEM = 'btc_eth';

  // 1. Caché en memoria (más rápido, persiste por sesión)
  const mem = memCache.get(CACHE_KEY_MEM);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) {
    const mins = Math.floor((Date.now() - mem.timestamp) / 60000);
    return { ...mem.data, lastUpdateMinutes: mins };
  }

  // 2. Caché en localStorage
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        const mins = Math.floor((Date.now() - timestamp) / 60000);
        const result = { ...data, lastUpdateMinutes: mins };
        memCache.set(CACHE_KEY_MEM, { data: result, timestamp });
        return result;
      }
    }
  } catch {}

  // 3. Fetch fresco de CoinGecko
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    );
    if (!res.ok) throw new Error('API error');
    const json = await res.json();

    const result: MarketData = {
      btcPrice: json.bitcoin.usd,
      btcChange24h: parseFloat(json.bitcoin.usd_24h_change.toFixed(2)),
      ethPrice: json.ethereum.usd,
      ethChange24h: parseFloat(json.ethereum.usd_24h_change.toFixed(2)),
      lastUpdateMinutes: 0,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
    memCache.set(CACHE_KEY_MEM, { data: result, timestamp: Date.now() });
    return result;
  } catch {
    // Fallback: devolver último dato conocido con timestamp
    const mem2 = memCache.get(CACHE_KEY_MEM);
    if (mem2) {
      const mins = Math.floor((Date.now() - mem2.timestamp) / 60000);
      return { ...mem2.data, lastUpdateMinutes: mins };
    }
    return { btcPrice: 0, btcChange24h: 0, ethPrice: 0, ethChange24h: 0, lastUpdateMinutes: undefined };
  }
}
