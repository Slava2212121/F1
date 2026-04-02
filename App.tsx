import React, { useState, useMemo, useEffect } from 'react';
import { ViewState, Driver } from './types';
import { Navigation } from './components/Navigation';
import { CalendarView } from './components/CalendarView';
import { ConstructorsView, CONSTRUCTORS } from './components/ConstructorsView';
import { NewsView } from './components/NewsView';
import { DriversView } from './components/DriversView';
import { StreamsView } from './components/StreamsView';
import { Play, Share2, Search, Bell, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchF1News, NewsItem } from './src/lib/news';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'race' | 'news' | 'system';
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Квалификация началась!', message: 'Гран-при Бахрейна: Q1 уже в эфире. Включайте трансляцию.', time: 'Только что', read: false, type: 'race' },
  { id: '2', title: 'Новая статья на F1News', message: 'Анализ предсезонных тестов: кто быстрее всех?', time: '2 часа назад', read: false, type: 'news' },
  { id: '3', title: 'Обновление приложения', message: 'Добавлены результаты Гран-при Австралии.', time: 'Вчера', read: true, type: 'system' },
];

export default function App() {
  const [currentView, setView] = useState<ViewState>(ViewState.DRIVERS);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    }
  }, []);

  useEffect(() => {
    fetchF1News()
      .then(data => setNews(data || []))
      .catch(err => console.error("Failed to fetch news for search", err));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const filteredConstructors = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return CONSTRUCTORS.filter(team => 
        team.name?.toLowerCase().includes(lowerQuery) || 
        team.drivers?.some(d => d?.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

  const filteredNews = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return news.filter(item => 
        item.title?.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, news]);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.NEWS:
        return <NewsView />;
      case ViewState.CALENDAR:
        return <CalendarView />;
      case ViewState.DRIVERS:
        return <DriversView searchQuery={searchQuery} />;
      case ViewState.CONSTRUCTORS:
        return <ConstructorsView />;
      case ViewState.STREAMS:
        return <StreamsView />;
      default:
        return <DriversView searchQuery={searchQuery} />;
    }
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans selection:bg-f1-red selection:text-white overflow-hidden">
      <Navigation currentView={currentView} setView={setView} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden pb-[72px] md:pb-0">
        {/* Top Bar - Minimal */}
        <header className="h-16 flex items-center justify-end px-6 border-b border-white/5 bg-black/50 backdrop-blur-md z-40 flex-shrink-0">
          <div className="flex gap-4">
              <button onClick={() => setShowSearch(!showSearch)} className={`hover:text-white transition-colors ${showSearch ? 'text-f1-red' : 'text-gray-400'}`}><Search size={20}/></button>
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllAsRead(); }} className={`hover:text-white relative transition-colors ${showNotifications ? 'text-f1-red' : 'text-gray-400'}`}>
                  <Bell size={20}/>
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-f1-red rounded-full"></span>}
              </button>
          </div>
        </header>

        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10 z-30 p-4 animate-fade-in h-[calc(100vh-4rem)] overflow-y-auto">
             <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Поиск по гонщикам, командам, новостям..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-f1-red transition-colors"
                />
             </div>
             {searchQuery && (
                 <div className="max-w-2xl mx-auto mt-4 space-y-6">
                     {filteredDrivers.length > 0 && (
                         <div>
                             <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3 px-2">Пилоты</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {filteredDrivers.map(driver => (
                                     <div key={driver.id} className="glass-panel p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setView(ViewState.DRIVERS); setShowSearch(false); setSearchQuery(''); }}>
                                         <img src={driver.image} alt={driver.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover bg-gray-800 border border-f1-red/50" />
                                         <div>
                                             <h4 className="font-bold text-sm">{driver.name}</h4>
                                             <p className="text-xs text-f1-red">{driver.team}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}

                     {filteredConstructors.length > 0 && (
                         <div>
                             <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3 px-2">Команды</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {filteredConstructors.map(team => (
                                     <div key={team.id} className="glass-panel p-3 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden" onClick={() => { setView(ViewState.CONSTRUCTORS); setShowSearch(false); setSearchQuery(''); }}>
                                         <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.color }} />
                                         <div className="pl-2">
                                             <h4 className="font-bold text-sm">{team.name}</h4>
                                             <p className="text-xs text-gray-400">{team.drivers.join(' / ')}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                     
                     {filteredNews.length > 0 && (
                         <div>
                             <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3 px-2">Новости</h3>
                             <div className="space-y-2">
                                 {filteredNews.map(item => (
                                     <a 
                                        key={item.id} 
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-panel p-3 rounded-xl flex flex-col gap-1 hover:bg-white/5 transition-colors cursor-pointer block"
                                     >
                                         <h4 className="font-bold text-sm leading-tight">{item.title}</h4>
                                         <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={10} /> {item.time}
                                         </span>
                                     </a>
                                 ))}
                             </div>
                         </div>
                     )}

                     {filteredDrivers.length === 0 && filteredConstructors.length === 0 && filteredNews.length === 0 && (
                         <div className="p-4 glass-panel rounded-xl text-center text-gray-400 text-sm">
                             Ничего не найдено
                         </div>
                     )}
                 </div>
             )}
          </div>
        )}

        {/* Notifications Overlay */}
        {showNotifications && (
          <div className="absolute top-16 right-0 w-full max-w-sm bg-black/95 backdrop-blur-xl border-l border-b border-white/10 z-30 h-[calc(100vh-4rem)] sm:h-auto sm:max-h-[80vh] overflow-y-auto animate-fade-in shadow-2xl">
              <div className="p-4 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-md flex justify-between items-center">
                  <h3 className="font-bold text-lg">Уведомления</h3>
                  <div className="flex items-center gap-3">
                      {unreadCount > 0 && <span className="text-xs text-f1-red bg-f1-red/10 px-2 py-1 rounded-full">{unreadCount} новых</span>}
                      {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-gray-400 hover:text-white transition-colors" title="Очистить все">
                              <Trash2 size={16} />
                          </button>
                      )}
                  </div>
              </div>
              <div className="p-2 space-y-2">
                  {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                          Нет новых уведомлений
                      </div>
                  ) : (
                      notifications.map(notification => (
                          <div 
                              key={notification.id} 
                              onClick={() => markAsRead(notification.id)}
                              className={`p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border-l-2 ${notification.read ? 'border-transparent opacity-70' : 'border-f1-red'}`}
                          >
                              <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
                              <p className="text-xs text-gray-400">{notification.message}</p>
                              <span className="text-[10px] text-gray-500 mt-2 block">{notification.time}</span>
                          </div>
                      ))
                  )}
              </div>
          </div>
        )}

        {/* Main Container */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-f1-dark to-black relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}