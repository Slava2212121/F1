import React from 'react';
import { motion } from 'motion/react';

interface Constructor {
  id: string;
  name: string;
  points: number;
  color: string;
  drivers: string[];
}

export const CONSTRUCTORS: Constructor[] = [
  { id: '1', name: 'Mercedes-AMG', points: 135, color: '#27F4D2', drivers: ['A. Antonelli', 'G. Russell'] },
  { id: '2', name: 'Scuderia Ferrari HP', points: 90, color: '#E80020', drivers: ['C. Leclerc', 'L. Hamilton'] },
  { id: '3', name: 'McLaren', points: 46, color: '#FF8000', drivers: ['L. Norris', 'O. Piastri'] },
  { id: '4', name: 'Red Bull Racing', points: 20, color: '#3671C6', drivers: ['M. Verstappen', 'A. Lindblad'] },
  { id: '5', name: 'Haas F1 Team', points: 18, color: '#B6BABD', drivers: ['O. Bearman', 'E. Ocon'] },
  { id: '6', name: 'Alpine', points: 16, color: '#FF87BC', drivers: ['P. Gasly', 'F. Colapinto'] },
  { id: '7', name: 'Visa Cash App RB', points: 10, color: '#6692FF', drivers: ['L. Lawson', 'Y. Tsunoda'] },
  { id: '8', name: 'Audi F1 Team', points: 2, color: '#F50537', drivers: ['N. Hülkenberg', 'G. Bortoleto'] },
  { id: '9', name: 'Williams Racing', points: 2, color: '#64C4FF', drivers: ['C. Sainz', 'A. Albon'] },
  { id: '10', name: 'Aston Martin', points: 0, color: '#229971', drivers: ['F. Alonso', 'L. Stroll'] },
  { id: '11', name: 'Cadillac F1 Team', points: 0, color: '#FFB800', drivers: ['V. Bottas', 'S. Perez'] },
].sort((a, b) => b.points - a.points);

export const ConstructorsView: React.FC = () => {
  return (
    <div className="pt-6 pb-24 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold mb-6 px-2">Кубок Конструкторов <span className="text-f1-red">2026</span></h1>
      
      <div className="space-y-3">
        {CONSTRUCTORS.map((team, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            key={team.id} 
            className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
              style={{ backgroundColor: team.color }}
            />
            
            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4">
              <div className="w-6 sm:w-8 text-center font-display font-bold text-lg sm:text-xl text-gray-400">
                {index + 1}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">{team.name}</h3>
                <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap gap-1 sm:gap-2 mt-1">
                  {team.drivers.map((driver, i) => (
                    <React.Fragment key={driver}>
                      <span className="whitespace-nowrap">{driver}</span>
                      {i < team.drivers.length - 1 && <span className="text-white/20 hidden sm:inline">|</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-2">
              <div className="font-display font-bold text-xl sm:text-2xl">{team.points}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Очков</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
