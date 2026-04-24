import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchF1News, NewsItem } from '../src/lib/news';

interface NewsViewProps {
  searchQuery?: string;
}

export const NewsView: React.FC<NewsViewProps> = ({ searchQuery }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const uniqueNews = await fetchF1News();
      if (uniqueNews.length === 0) throw new Error('No news');
      setNews(uniqueNews);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить новости. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = React.useMemo(() => {
    if (!searchQuery) return news;
    const lowerQuery = searchQuery.toLowerCase();
    return news.filter(item => item.title.toLowerCase().includes(lowerQuery));
  }, [searchQuery, news]);

  return (
    <div className="pt-6 pb-24 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center px-2 mb-6">
        <h1 className="text-2xl font-display font-bold">Новости <span className="text-f1-red">F1News.ru</span></h1>
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="p-2 bg-white/10 hover:bg-f1-red hover:text-white rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-3">
          {loading && news.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl animate-pulse flex flex-col gap-2">
                <div className="h-5 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/4 mt-2"></div>
              </div>
            ))
          ) : (
            filteredNews.map((item, index) => (
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={item.id} 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-4 rounded-xl flex flex-col gap-2 hover:bg-white/10 transition-colors group block"
              >
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-48 object-cover rounded-lg mb-2" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                <h3 className="font-bold text-lg leading-tight group-hover:text-f1-red transition-colors">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {item.summary}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </span>
                  <span className="flex items-center gap-1 text-f1-red opacity-0 group-hover:opacity-100 transition-opacity">
                    Читать <ExternalLink size={12} />
                  </span>
                </div>
              </motion.a>
            ))
          )}
        </div>
      )}
    </div>
  );
};
