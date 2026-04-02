export interface NewsItem {
  id: string;
  title: string;
  link: string;
  time: string;
}

export const fetchF1News = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch('https://www.f1news.ru/');
    if (!response.ok) throw new Error('Failed to fetch news');
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newsList: NewsItem[] = [];
    
    const links = doc.querySelectorAll('a');
    links.forEach((el) => {
      const href = el.getAttribute('href');
      const text = el.textContent?.trim() || '';
      const className = el.className || '';
      
      if (href && href.includes('/news/') && text.length > 20 && (className.includes('b-news-list__title') || className.includes('b-home-super-news__link'))) {
        let time = '';
        if (className.includes('b-news-list__title')) {
           const li = el.closest('li');
           if (li) {
             time = li.querySelector('.b-news-list__time')?.textContent?.trim() || li.querySelector('.b-news-list__date')?.textContent?.trim() || '';
           }
        }
        
        newsList.push({
          id: href,
          title: text,
          link: href.startsWith('http') ? href : "https://www.f1news.ru" + href,
          time: time || 'Недавно'
        });
      }
    });

    // Deduplicate by link and limit to 20
    return Array.from(new Map(newsList.map(item => [item.link, item])).values()).slice(0, 20);
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
};
