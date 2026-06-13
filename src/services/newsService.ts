import { NewsItem } from '../types';
import { supabase } from './supabaseClient';

const CACHE_KEY = 'domex_news_cache';
const CACHE_TTL = 15 * 60 * 1000;
const SUPABASE_CACHE_TTL_HOURS = 24;

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'mock-1',
    titulo: 'Gemini 2.0 redefine el análisis financiero en tiempo real',
    resumen: 'La nueva arquitectura de Google permite procesar millones de puntos de datos de mercado con una latencia mínima, superando a modelos anteriores.',
    fuente: 'AIcolmena Tech',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    fecha: new Date().toISOString(),
    categoria: 'IA',
    personaje: 'Sundar Pichai'
  },
  {
    id: 'mock-2',
    titulo: 'Elon Musk anuncia nueva integración de X con sistemas de pago crypto',
    resumen: 'La plataforma busca convertirse en una "everything app" incluyendo billeteras digitales y soporte para las principales criptomonedas.',
    fuente: 'Crypto Daily',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1611974717482-9831d617b04a?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 3600000).toISOString(),
    categoria: 'PODER',
    personaje: 'Elon Musk'
  },
  {
    id: 'mock-3',
    titulo: 'Bitcoin rompe resistencia clave mientras aumenta la adopción institucional',
    resumen: 'Grandes fondos de inversión están incrementando sus posiciones en BTC, impulsando el precio hacia nuevos máximos históricos.',
    fuente: 'Finance Times',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 7200000).toISOString(),
    categoria: 'CRIPTO',
    personaje: null
  },
  {
    id: 'mock-4',
    titulo: 'La Fed mantiene tasas pero sugiere ajustes para el próximo trimestre',
    resumen: 'Jerome Powell indicó que la inflación está bajo control pero que el mercado laboral sigue mostrando una fortaleza inesperada.',
    fuente: 'Wall Street News',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1611974717482-9831d617b04a?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 10800000).toISOString(),
    categoria: 'MERCADO',
    personaje: 'Jerome Powell'
  },
  {
    id: 'mock-5',
    titulo: 'NVIDIA presenta Blackwell: El chip que dominará la era de la IA Gen',
    resumen: 'Jensen Huang asegura que la potencia de cómputo se ha multiplicado por diez en el último año gracias a las nuevas arquitecturas.',
    fuente: 'Tech Crunch',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 14400000).toISOString(),
    categoria: 'IA',
    personaje: 'Jensen Huang'
  },
  {
    id: 'mock-6',
    titulo: 'Apple integra IA en todo su ecosistema con Apple Intelligence',
    resumen: 'La compañía busca recuperar terreno frente a Google y Microsoft con una apuesta centrada en la privacidad y el procesamiento on-device.',
    fuente: 'Bloomberg',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 18000000).toISOString(),
    categoria: 'PODER',
    personaje: 'Tim Cook'
  },
  {
    id: 'mock-7',
    titulo: 'Solana supera a Ethereum en volumen de transacciones en DEX',
    resumen: 'La red se consolida como la plataforma preferida para memecoins y microtransacciones debido a sus bajas comisiones.',
    fuente: 'The Block',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 21600000).toISOString(),
    categoria: 'CRIPTO',
    personaje: null
  },
  {
    id: 'mock-8',
    titulo: 'El petróleo cae ante la debilidad de la demanda en mercados clave',
    resumen: 'Los precios del crudo siguen bajo presión mientras los analistas ajustan sus previsiones para el resto del año.',
    fuente: 'Energy Weekly',
    url: '#',
    imagen: 'https://images.unsplash.com/photo-1581089781785-c54155675c55?auto=format&fit=crop&q=80&w=800',
    fecha: new Date(Date.now() - 25200000).toISOString(),
    categoria: 'MERCADO',
    personaje: null
  }
];

function categorizarNoticia(titulo: string, descripcion: string): NewsItem['categoria'] {
  const text = (titulo + ' ' + descripcion).toLowerCase();
  
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('eth') || text.includes('btc') || text.includes('blockchain') || text.includes('solana') || text.includes('binance') || text.includes('coinbase')) {
    return 'CRIPTO';
  }
  
  if (text.includes(' ai') || text.includes('inteligencia artificial') || text.includes('gpt') || text.includes('gemini') || text.includes('llm') || text.includes('nvidia') || text.includes('openai') || text.includes('robot')) {
    return 'IA';
  }
  
  if (text.includes('trump') || text.includes('musk') || text.includes('bezos') || text.includes('zuckerberg') || text.includes('powell') || text.includes('ceo') || text.includes('presidente') || text.includes('google') || text.includes('amazon') || text.includes('meta')) {
    return 'PODER';
  }
  
  return 'MERCADO';
}

function extraerPersonaje(titulo: string, descripcion: string): string | null {
  const text = titulo + ' ' + descripcion;
  if (text.includes('Musk')) return 'Elon Musk';
  if (text.includes('Trump')) return 'Donald Trump';
  if (text.includes('Bezos')) return 'Jeff Bezos';
  if (text.includes('Zuckerberg')) return 'Mark Zuckerberg';
  if (text.includes('Powell')) return 'Jerome Powell';
  if (text.includes('Pichai')) return 'Sundar Pichai';
  if (text.includes('Cook')) return 'Tim Cook';
  if (text.includes('Gates')) return 'Bill Gates';
  if (text.includes('Huang')) return 'Jensen Huang';
  return null;
}

export async function fetchIntelNews(): Promise<NewsItem[]> {
  // Check cache
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    const combined: NewsItem[] = (data.articles || []).map((art: any, idx: number) => ({
      id: `news-${idx}-${art.publishedAt}`,
      titulo: art.title,
      resumen: art.description || art.content || 'Sin descripción disponible.',
      fuente: art.source.name,
      url: art.url,
      imagen: art.urlToImage,
      fecha: art.publishedAt,
      categoria: categorizarNoticia(art.title, art.description || ''),
      personaje: extraerPersonaje(art.title, art.description || '')
    }));

    const unique = Array.from(new Map(combined.map(item => [item.titulo, item])).values())
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: unique, timestamp: Date.now() }));

    // T10: persistir en Supabase como backup 24h
    if (supabase) {
      void (async () => {
        try {
          await supabase.from('news_cache').insert({ category: 'general', articles: unique, cached_at: new Date().toISOString() });
        } catch { /* silent */ }
      })();
    }

    return unique;

  } catch (error) {
    console.error('Error fetching news:', error);

    // T10: fallback a caché Supabase (máximo 24h)
    if (supabase) {
      try {
        const { data: sbData } = await supabase
          .from('news_cache')
          .select('articles, cached_at')
          .eq('category', 'general')
          .order('cached_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sbData) {
          const ageHours = (Date.now() - new Date(sbData.cached_at).getTime()) / 1000 / 3600;
          if (ageHours < SUPABASE_CACHE_TTL_HOURS) {
            return sbData.articles as NewsItem[];
          }
        }
      } catch { /* silent */ }
    }

    return MOCK_NEWS;
  }
}
