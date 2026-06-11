const CACHE_KEY = 'domex_market_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export interface MarketData {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
}

export async function fetchMarketData(): Promise<MarketData> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
  } catch {}

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
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result, timestamp: Date.now() }));
    return result;
  } catch {
    return { btcPrice: 0, btcChange24h: 0, ethPrice: 0, ethChange24h: 0 };
  }
}
