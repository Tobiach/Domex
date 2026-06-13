import { supabase } from './supabaseClient';

const CACHE_TTL_HOURS = 6;
// open.er-api.com — free, no API key required, updates daily
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

interface RatesData {
  [currency: string]: number;
}

async function fetchFreshRates(): Promise<RatesData> {
  const res = await fetch(EXCHANGE_API_URL);
  if (!res.ok) throw new Error(`ExchangeRate fetch error ${res.status}`);
  const data = await res.json();
  if (!data.rates) throw new Error('Invalid exchange rate response');
  return data.rates as RatesData;
}

async function readSupabaseCache(): Promise<{ rates: RatesData; ageHours: number } | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('exchange_rate_cache')
      .select('rates, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    const ageHours = (Date.now() - new Date(data.updated_at).getTime()) / 1000 / 3600;
    return { rates: data.rates as RatesData, ageHours };
  } catch {
    return null;
  }
}

async function saveToSupabase(rates: RatesData): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('exchange_rate_cache').insert({ base_currency: 'USD', rates });
  } catch { /* silent */ }
}

// Returns the exchange rate from USD to the target currency.
// Uses Supabase cache (6h TTL) before hitting the external API.
export async function getExchangeRate(to: string): Promise<number> {
  const cached = await readSupabaseCache();
  if (cached && cached.ageHours < CACHE_TTL_HOURS) {
    return cached.rates[to] ?? 1;
  }

  try {
    const rates = await fetchFreshRates();
    await saveToSupabase(rates);
    return rates[to] ?? 1;
  } catch {
    // Fallback to stale cache if available
    if (cached) return cached.rates[to] ?? 1;
    return 1;
  }
}

// Converts an amount from USD to ARS using cached rates
export async function usdToArs(amount: number): Promise<number> {
  const rate = await getExchangeRate('ARS');
  return amount * rate;
}
