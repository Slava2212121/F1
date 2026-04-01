import React from 'react';
import { X, Trophy, Clock, Flag } from 'lucide-react';

interface RaceResult {
  position: number;
  driver: string;
  team: string;
  time: string;
  points: number;
}

interface RaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceName: string;
  results: RaceResult[];
}

export const RaceResultsModal: React.FC<RaceResultsModalProps> = ({ isOpen, onClose, raceName, results }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-f1-carbon border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-black/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold">{raceName}</h2>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <Flag size={14} /> Официальные результаты
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={result.position} 
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 
                  index === 1 ? 'bg-gray-300/10 border border-gray-300/30' :
                  index === 2 ? 'bg-amber-700/20 border border-amber-700/50' :
                  'bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-6 sm:w-8 font-display font-bold text-lg sm:text-xl text-center ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {result.position}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                      {result.driver}
                      {index === 0 && <Trophy size={14} className="text-yellow-500" />}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">{result.team}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-xs sm:text-sm flex items-center justify-end gap-1">
                    <Clock size={12} className="text-gray-500" /> {result.time}
                  </div>
                  <div className={`text-xs sm:text-sm font-bold mt-0.5 ${result.points > 0 ? 'text-f1-red' : 'text-gray-500'}`}>
                    {result.points > 0 ? `+${result.points} очков` : '0 очков'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
