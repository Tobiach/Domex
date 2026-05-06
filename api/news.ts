export default async function handler(req: any, res: any) {
  const API_KEY = process.env.NEWSAPI_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'NEWSAPI_KEY not configured' });
  }

  const queryES = 'inteligencia artificial OR bitcoin OR mercados OR Elon Musk OR Trump OR negocios OR startups';
  const queryEN = 'AI OR Bitcoin OR market OR Musk OR Trump';

  try {
    const [resES, resEN] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(queryES)}&language=es&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`),
      fetch(`https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(queryEN)}&language=en&pageSize=10&apiKey=${API_KEY}`)
    ]);

    const dataES = await resES.json();
    const dataEN = await resEN.json();

    if (dataES.status === 'error') {
      return res.status(400).json({ error: dataES.message });
    }

    const articles = [
      ...(dataES.articles || []),
      ...(dataEN.articles || [])
    ];

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
    return res.status(200).json({ articles });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching news' });
  }
}
