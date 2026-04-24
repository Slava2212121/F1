import React, { useState, useEffect } from 'react';
import { Driver, ViewState } from '../types';
import { INITIAL_DRIVERS } from '../data/drivers';
import { DriverCard } from './DriverCard';
import { F1_2026_CALENDAR, Race } from './CalendarView';
import { CONSTRUCTORS, Constructor } from './ConstructorsView';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Flag, Trophy, Heart } from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const [favoriteDrivers, setFavoriteDrivers] = useState<string[]>([]);
  const [favoriteRaces, setFavoriteRaces] = useState<number[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  
  useEffect(() => {
    const storedDrivers = localStorage.getItem('f1_favorites_drivers');
    if (storedDrivers) setFavoriteDrivers(JSON.parse(storedDrivers));

    const storedRaces = localStorage.getItem('f1_favorites');
    if (storedRaces) setFavoriteRaces(JSON.parse(storedRaces));

    const storedTeams = localStorage.getItem('f1_favorites_teams');
    if (storedTeams) setFavoriteTeams(JSON.parse(storedTeams));
  }, []);

  const toggleFavoriteRace = (e: React.MouseEvent, raceId: number) => {
    e.stopPropagation();
    const newFavorites = favoriteRaces.includes(raceId)
      ? favoriteRaces.filter(id => id !== raceId)
      : [...favoriteRaces, raceId];
    setFavoriteRaces(newFavorites);
    localStorage.setItem('f1_favorites', JSON.stringify(newFavorites));
  };

  const toggleFavoriteTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    const newFavorites = favoriteTeams.includes(teamId)
      ? favoriteTeams.filter(id => id !== teamId)
      : [...favoriteTeams, teamId];
    setFavoriteTeams(newFavorites);
    localStorage.setItem('f1_favorites_teams', JSON.stringify(newFavorites));
  };

  const filteredDrivers = INITIAL_DRIVERS.filter(d => favoriteDrivers.includes(d.id));
  const filteredRaces = F1_2026_CALENDAR.filter(r => favoriteRaces.includes(r.id));
  const filteredTeams = CONSTRUCTORS.filter(t => favoriteTeams.includes(t.id));

  return (
    <div className="pt-6 pb-24 px-4 max-w-7xl mx-auto space-y-10">
      <h1 className="text-2xl font-display font-bold mb-6">Избранное</h1>
      
      <div>
        <h2 className="text-xl font-display font-bold mb-4 text-gray-300 border-b border-white/10 pb-2">Пилоты</h2>
        {filteredDrivers.length === 0 ? (
          <p className="text-gray-500 italic">Нет избранных пилотов.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDrivers.map((driver, index) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-display font-bold mb-4 text-gray-300 border-b border-white/10 pb-2">Команды</h2>
        {filteredTeams.length === 0 ? (
          <p className="text-gray-500 italic">Нет избранных команд.</p>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {filteredTeams.map((team, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={team.id} 
                className="glass-panel p-4 rounded-xl flex items-center justify-between relative overflow-hidden group gap-2"
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
                  style={{ backgroundColor: team.color }}
                />
                
                <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 flex-1 min-w-0">
                  <button onClick={(e) => toggleFavoriteTeam(e, team.id)} className="flex-shrink-0">
                    <Heart size={18} className={favoriteTeams.includes(team.id) ? 'fill-f1-gold text-f1-gold' : 'text-f1-carbon hover:text-white transition-colors'} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-lg leading-tight truncate">{team.name}</h3>
                    <div className="text-[10px] sm:text-sm text-gray-400 flex flex-wrap gap-1 mt-1">
                      {team.drivers.map((driver, i) => (
                        <React.Fragment key={driver}>
                          <span className="truncate max-w-full">{driver}</span>
                          {i < team.drivers.length - 1 && <span className="text-white/20 hidden sm:inline">|</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-display font-bold text-lg sm:text-2xl">{team.points}</div>
                  <div className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Очков</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-display font-bold mb-4 text-gray-300 border-b border-white/10 pb-2">Гонки</h2>
        {filteredRaces.length === 0 ? (
          <p className="text-gray-500 italic">Нет избранных гонок.</p>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {filteredRaces.map((race, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={race.id} 
                className={`rounded-2xl overflow-hidden transition-all duration-300 bg-f1-dark border border-f1-carbon ${
                  race.status === 'NEXT' 
                    ? 'border-f1-red shadow-[0_0_15px_rgba(255,24,1,0.3)]' 
                    : race.status === 'CANCELLED'
                    ? 'opacity-60 grayscale'
                    : 'hover:bg-f1-carbon'
                }`}
              >
                {race.status === 'NEXT' && (
                  <div className="bg-f1-red text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-wider text-center">
                    Следующая гонка
                  </div>
                )}
                
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <button onClick={(e) => toggleFavoriteRace(e, race.id)} className="flex-shrink-0">
                    <Heart size={20} className={favoriteRaces.includes(race.id) ? 'fill-f1-gold text-f1-gold' : 'text-f1-carbon'} />
                  </button>
                  <div className="flex flex-col items-center justify-center w-10 sm:w-12 flex-shrink-0">
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase mb-1">Раунд</span>
                    <span className={`text-xl sm:text-2xl font-display font-bold ${race.status === 'NEXT' ? 'text-f1-red' : race.status === 'CANCELLED' ? 'text-gray-600' : 'text-white'}`}>
                      {race.round}
                    </span>
                  </div>
                  
                  <div className="w-px h-10 sm:h-12 bg-white/10 flex-shrink-0"></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg sm:text-xl flex-shrink-0" title={race.country}>{race.flag}</span>
                      <h3 className="font-bold text-sm sm:text-base truncate">{race.country}</h3>
                      {race.status === 'COMPLETED' && (
                        <span className="ml-auto bg-white/10 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block flex-shrink-0">
                          Завершена
                        </span>
                      )}
                      {race.status === 'CANCELLED' && (
                        <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block flex-shrink-0">
                          Отменена
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-sm text-gray-400 truncate">{race.name}</p>
                  </div>
                </div>
                
                <div className="bg-black/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-f1-red" />
                      <span>{race.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-f1-red" />
                      <span className="truncate max-w-[100px] sm:max-w-none">{race.circuit}</span>
                    </div>
                  </div>
                  
                  {race.winner && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm bg-f1-gold/10 text-f1-gold px-3 py-1 rounded-full w-fit">
                      <Trophy size={14} />
                      <span className="font-bold">{race.winner}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
