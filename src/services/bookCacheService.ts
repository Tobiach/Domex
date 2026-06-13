import { supabase } from './supabaseClient';

export interface BookInfo {
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  publishYear: string | null;
  source: 'supabase' | 'openlibrary' | 'google';
}

async function searchOpenLibrary(title: string, author?: string): Promise<BookInfo | null> {
  try {
    const q = encodeURIComponent(`${title}${author ? ` ${author}` : ''}`);
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&fields=key,title,author_name,cover_i,first_publish_year&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const book = data.docs?.[0];
    if (!book) return null;
    return {
      title: book.title ?? title,
      author: book.author_name?.[0] ?? author ?? '',
      description: '',
      coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
      publishYear: book.first_publish_year ? String(book.first_publish_year) : null,
      source: 'openlibrary',
    };
  } catch {
    return null;
  }
}

async function searchGoogleBooks(title: string, author?: string): Promise<BookInfo | null> {
  try {
    const q = encodeURIComponent(`intitle:${title}${author ? `+inauthor:${author}` : ''}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0]?.volumeInfo;
    if (!item) return null;
    return {
      title: item.title ?? title,
      author: item.authors?.[0] ?? author ?? '',
      description: item.description ?? '',
      coverUrl: item.imageLinks?.thumbnail ?? null,
      publishYear: item.publishedDate?.slice(0, 4) ?? null,
      source: 'google',
    };
  } catch {
    return null;
  }
}

// Fetch book metadata. Priority: Supabase cache → Open Library → Google Books.
// Results are cached in Supabase books_cache table.
export async function getBookInfo(title: string, author?: string): Promise<BookInfo | null> {
  const query = `${title}${author ? ` ${author}` : ''}`.toLowerCase().trim();

  // 1. Check Supabase cache
  if (supabase) {
    try {
      const { data } = await supabase
        .from('books_cache')
        .select('book_data')
        .ilike('search_query', query)
        .maybeSingle();
      if (data) return data.book_data as BookInfo;
    } catch { /* silent */ }
  }

  // 2. Try Open Library (free, no key)
  let book = await searchOpenLibrary(title, author);

  // 3. Fallback to Google Books
  if (!book) book = await searchGoogleBooks(title, author);

  if (!book) return null;

  // 4. Cache result in Supabase
  if (supabase) {
    void (async () => {
      try {
        await supabase.from('books_cache').upsert({ search_query: query, book_data: book });
      } catch { /* silent */ }
    })();
  }

  return book;
}
