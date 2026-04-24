import React, { useState } from 'react';
import { Driver } from '../types';
import { getDriverInsight } from '../services/geminiService';
import { ChevronRight, Zap, Info, X, Heart } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface DriverCardProps {
  driver: Driver;
  position?: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({ driver, position }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = JSON.parse(localStorage.getItem('f1_favorites_drivers') || '[]');
    return favorites.includes(driver.id);
  });

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('f1_favorites_drivers') || '[]');
    if (isFavorite) {
      const newFavorites = favorites.filter((id: string) => id !== driver.id);
      localStorage.setItem('f1_favorites_drivers', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      const newFavorites = [...favorites, driver.id];
      localStorage.setItem('f1_favorites_drivers', JSON.stringify(newFavorites));
      setIsFavorite(true);
    }
  };

  const handleAnalyze = async () => {
    if (insight) return;
    setLoading(true);
    const text = await getDriverInsight(driver.name);
    setInsight(text);
    setLoading(false);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: (position || 1) * 0.05 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="glass-panel rounded-2xl overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-6xl font-black italic select-none">
          {driver.number}
        </div>

        {position && (
          <div className="absolute top-4 left-4 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-lg">
            {position}
          </div>
        )}
        
        <button 
            onClick={() => setShowDetails(true)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 rounded-full p-1.5 transition-colors z-10 opacity-0 group-hover:opacity-100"
        >
            <Info size={16} />
        </button>
        
        <button 
            onClick={toggleFavorite}
            className={`absolute top-4 right-12 text-gray-400 hover:text-f1-red transition-colors z-10 opacity-0 group-hover:opacity-100 ${isFavorite ? 'text-f1-red opacity-100' : ''}`}
        >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className="flex items-end p-4 pt-10 gap-4">
          <img 
              src={driver.image} 
              alt={driver.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full border-2 border-f1-red object-cover bg-gray-800"
          />
          <div className="flex-1 pb-2">
              <h3 className="text-xl font-bold leading-none">{driver.name}</h3>
              <p className="text-f1-red text-sm font-semibold uppercase tracking-wider">{driver.team}</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-center bg-white/5 rounded-lg p-3 mb-3">
               <span className="text-gray-400 text-xs uppercase">Очки сезона</span>
               <span className="text-xl font-display font-bold text-white">{driver.points}</span>
          </div>

          {insight ? (
              <div className="text-xs text-gray-300 bg-f1-red/10 p-3 rounded-lg border border-f1-red/20 animate-fade-in">
                  <Zap size={12} className="inline mr-1 text-f1-red" />
                  {insight}
              </div>
          ) : (
              <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full text-xs font-bold uppercase tracking-wider py-3 rounded-lg bg-white/10 hover:bg-f1-red hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                  {loading ? 'Загрузка...' : 'Краткий обзор'}
                  {!loading && <ChevronRight size={14} />}
              </button>
          )}
        </div>
      </motion.div>

      {/* Driver Details Modal */}
      <AnimatePresence>
      {showDetails && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#151515] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 rounded-full p-1 transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <img 
                        src={driver.image} 
                        alt={driver.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full border-2 border-f1-red object-cover bg-gray-800"
                    />
                    <div>
                        <h2 className="text-2xl font-display font-bold leading-none">{driver.name}</h2>
                        <p className="text-f1-red text-sm font-semibold uppercase tracking-wider mt-1">{driver.team}</p>
                    </div>
                </div>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Номер</span>
                        <span className="text-sm font-display font-bold text-right">{driver.number}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Страна</span>
                        <span className="text-sm font-medium text-right">{driver.countryName || driver.countryCode}</span>
                    </div>
                    {driver.birthDate && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Дата рождения</span>
                        <span className="text-sm font-medium text-right">{driver.birthDate}</span>
                    </div>
                    )}
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Очки в сезоне 2026</span>
                        <span className="text-sm font-display font-bold text-right">{driver.points}</span>
                    </div>
                    {driver.wins !== undefined && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Победы</span>
                        <span className="text-sm font-display font-bold text-right">{driver.wins}</span>
                    </div>
                    )}
                    {driver.grandsPrix !== undefined && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Гран-при</span>
                        <span className="text-sm font-display font-bold text-right">{driver.grandsPrix}</span>
                    </div>
                    )}
                    {driver.championships !== undefined && driver.championships > 0 && (
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400 text-sm">Чемпионские титулы</span>
                        <span className="text-sm font-display font-bold text-right text-yellow-500">{driver.championships}</span>
                    </div>
                    )}
                    {driver.careerHistory && (
                    <div className="pt-2">
                        <span className="text-gray-400 text-sm block mb-1">Карьера</span>
                        <span className="text-sm font-medium text-gray-300 leading-relaxed">{driver.careerHistory}</span>
                    </div>
                    )}
                </div>

                {insight ? (
                    <div className="text-sm text-gray-300 bg-f1-red/10 p-4 rounded-xl border border-f1-red/20 animate-fade-in leading-relaxed max-h-64 overflow-y-auto">
                        <div className="flex items-center mb-2">
                            <Zap size={16} className="text-f1-red mr-2" />
                            <span className="font-bold text-white">AI Анализ</span>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <Markdown>{insight}</Markdown>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full text-sm font-bold uppercase tracking-wider py-3 rounded-xl bg-white/5 hover:bg-f1-red hover:text-white transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-f1-red"
                    >
                        {loading ? 'Анализ...' : 'AI Анализ пилота'}
                    </button>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};