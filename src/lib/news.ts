export interface NewsItem {
  id: string;
  title: string;
  link: string;
  time: string;
  imageUrl?: string;
  summary?: string;
}

export const fetchF1News = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.f1news.ru%2Fexport%2Fnews.xml');
    if (!response.ok) throw new Error('Failed to fetch news');
    
    const data = await response.json();
    if (data.status !== 'ok') throw new Error('RSS to JSON failed');
    
    const newsList: NewsItem[] = data.items.map((item: any) => {
      const date = new Date(item.pubDate.replace(' ', 'T')); // Handle "2026-04-06 12:10:00" format
      
      // Calculate relative time or format nicely
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = '';
      if (diffMins < 60) {
        timeStr = `${diffMins} мин. назад`;
      } else if (diffHours < 24) {
        timeStr = `${diffHours} ч. назад`;
      } else {
        timeStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }

      return {
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        time: timeStr,
        imageUrl: item.enclosure?.link,
        summary: item.description
      };
    });

    return newsList.slice(0, 20);
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
};
