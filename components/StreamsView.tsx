import React from 'react';
import { motion } from 'motion/react';
import { Play, MessageCircle, Users, Radio } from 'lucide-react';

const RUSSIAN_STREAMS = [
    { id: 1, title: 'Racing Brothers', badge: 'Выбор автора', links: [{ name: 'VK Video', url: 'https://vk.com/racingbrothers', icon: Users }, { name: 'Telegram', url: 'https://t.me/RacingBrothers', icon: MessageCircle }] },
    { id: 2, title: 'Башмаков о гонках', badge: 'Аналитика', links: [{ name: 'VK Video', url: 'https://vk.com/bashmakov_on_racing', icon: Users }] },
    { id: 3, title: 'Гаснут огни (А. Попов)', badge: 'Классика', links: [{ name: 'VK Video', url: 'https://vk.com/gasnutognif1', icon: Users }] },
    { id: 4, title: 'F1 MEMES TV', badge: 'Развлекательный', links: [{ name: 'VK Video', url: 'https://vk.com/f1memestv', icon: Users }] },
];

export const StreamsView: React.FC = () => {
  return (
    <div className="pt-6 pb-24 px-4 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            Прямой <span className="text-f1-red">Эфир</span>
            <span className="flex h-3 w-3 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-f1-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-f1-red"></span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Radio size={14} className="text-f1-red" />
            Сезон 2026: Предсезонные тесты. Сахир, Бахрейн.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {RUSSIAN_STREAMS.map((stream, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            key={stream.id} 
            className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group border border-white/5 hover:border-f1-red/30 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-f1-red/10"></div>
            
            <div className="relative z-10 mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold text-xl">{stream.title}</h3>
                {stream.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-300 px-2 py-1 rounded-md">
                    {stream.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              {stream.links.map((link, i) => {
                const Icon = link.icon || Play;
                return (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white/5 hover:bg-f1-red text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,24,1,0.4)]"
                  >
                    <Icon size={16} />
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
