import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-f1-red/20 to-black pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-2xl font-display font-bold mb-2">Наши Партнеры</h2>
        <p className="text-gray-400 mb-8 text-sm">
          Поддержите проект, подписавшись на ресурсы наших спонсоров. Это помогает нам развиваться!
        </p>

        <div className="w-full space-y-4 mb-8">
          <a 
            href="https://vk.com/racingbrothers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 bg-[#0077FF]/10 hover:bg-[#0077FF]/20 border border-[#0077FF]/30 rounded-xl transition-all group active:scale-95"
          >
            <span className="font-bold text-[#0077FF]">ВК Сообщество</span>
            <ExternalLink size={18} className="text-[#0077FF] group-hover:scale-110 transition-transform" />
          </a>
          
          <a 
            href="https://t.me/RacingBrothers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 rounded-xl transition-all group active:scale-95"
          >
            <span className="font-bold text-[#229ED9]">Telegram Канал</span>
            <ExternalLink size={18} className="text-[#229ED9] group-hover:scale-110 transition-transform" />
          </a>

          <a 
            href="https://www.youtube.com/@Racing.Brothers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 rounded-xl transition-all group active:scale-95"
          >
            <span className="font-bold text-[#FF0000]">YouTube Канал</span>
            <ExternalLink size={18} className="text-[#FF0000] group-hover:scale-110 transition-transform" />
          </a>
        </div>

        <button
          onClick={onComplete}
          disabled={timeLeft > 0}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
            timeLeft > 0 
              ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
              : 'bg-f1-red text-white hover:bg-red-600 active:scale-95 shimmer-effect'
          }`}
        >
          {timeLeft > 0 ? `Продолжить через ${timeLeft} сек` : 'Перейти в приложение'}
        </button>
      </div>
    </motion.div>
  );
};
