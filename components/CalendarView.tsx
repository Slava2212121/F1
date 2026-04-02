import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Flag, ChevronRight, Trophy, AlertTriangle, Star } from 'lucide-react';
import { RaceResultsModal } from './RaceResultsModal';
import { motion } from 'motion/react';

interface Race {
  id: number;
  round: string | number;
  country: string;
  countryCode: string; // Added countryCode
  name: string;
  circuit: string;
  date: string;
  fullDate: string; // Added fullDate
  status: 'COMPLETED' | 'UPCOMING' | 'NEXT' | 'CANCELLED';
  flag: string;
  winner?: string;
  note?: string;
  weather?: string;
  temp?: string; // Added temp
}

const F1_2026_CALENDAR: Race[] = [
  { id: 1, round: 1, country: 'Австралия', countryCode: 'AU', name: 'Гран-при Австралии', circuit: 'Мельбурн', date: '8 Марта', fullDate: '2026-03-08', status: 'COMPLETED', flag: '🇦🇺', winner: 'Расселл' },
  { id: 2, round: 2, country: 'Китай', countryCode: 'CN', name: 'Гран-при Китая (+ Спринт)', circuit: 'Шанхай', date: '15 Марта', fullDate: '2026-03-15', status: 'COMPLETED', flag: '🇨🇳', winner: 'Антонелли' },
  { id: 3, round: 3, country: 'Япония', countryCode: 'JP', name: 'Гран-при Японии', circuit: 'Сузука', date: '29 Марта', fullDate: '2026-03-29', status: 'COMPLETED', flag: '🇯🇵', winner: 'Антонелли' },
  { id: 4, round: '—', country: 'Бахрейн', countryCode: 'BH', name: 'Гран-при Бахрейна', circuit: 'Сахир', date: '12 Апреля', fullDate: '2026-04-12', status: 'CANCELLED', flag: '🇧🇭' },
  { id: 5, round: '—', country: 'Саудовская Аравия', countryCode: 'SA', name: 'Гран-при Саудовской Аравии', circuit: 'Джидда', date: '19 Апреля', fullDate: '2026-04-19', status: 'CANCELLED', flag: '🇸🇦' },
  { id: 6, round: 4, country: 'США', countryCode: 'US', name: 'Гран-при Майами', circuit: 'Майами', date: '4 Мая', fullDate: '2026-05-04', status: 'NEXT', flag: '🇺🇸' },
  { id: 7, round: 5, country: 'Канада', countryCode: 'CA', name: 'Гран-при Канады (+ Спринт)', circuit: 'Монреаль', date: '25 Мая', fullDate: '2026-05-25', status: 'UPCOMING', flag: '🇨🇦' },
  { id: 8, round: 6, country: 'Монако', countryCode: 'MC', name: 'Гран-при Монако', circuit: 'Монте-Карло', date: '7 Июня', fullDate: '2026-06-07', status: 'UPCOMING', flag: '🇲🇨' },
  { id: 9, round: 7, country: 'Испания', countryCode: 'ES', name: 'Гран-при Барселоны-Каталонии', circuit: 'Барселона', date: '14 Июня', fullDate: '2026-06-14', status: 'UPCOMING', flag: '🇪🇸' },
  { id: 10, round: 8, country: 'Австрия', countryCode: 'AT', name: 'Гран-при Австрии', circuit: 'Шпильберг', date: '28 Июня', fullDate: '2026-06-28', status: 'UPCOMING', flag: '🇦🇹' },
  { id: 11, round: 9, country: 'Великобритания', countryCode: 'GB', name: 'Гран-при Великобритании', circuit: 'Сильверстоун', date: '5 Июля', fullDate: '2026-07-05', status: 'UPCOMING', flag: '🇬🇧' },
  { id: 12, round: 10, country: 'Бельгия', countryCode: 'BE', name: 'Гран-при Бельгии', circuit: 'Спа-Франкоршам', date: '19 Июля', fullDate: '2026-07-19', status: 'UPCOMING', flag: '🇧🇪' },
  { id: 13, round: 11, country: 'Венгрия', countryCode: 'HU', name: 'Гран-при Венгрии', circuit: 'Будапешт', date: '26 Июля', fullDate: '2026-07-26', status: 'UPCOMING', flag: '🇭🇺' },
  { id: 14, round: 12, country: 'Нидерланды', countryCode: 'NL', name: 'Гран-при Нидерландов (+ Спринт)', circuit: 'Зандворт', date: '23 Августа', fullDate: '2026-08-23', status: 'UPCOMING', flag: '🇳🇱' },
  { id: 15, round: 13, country: 'Италия', countryCode: 'IT', name: 'Гран-при Италии', circuit: 'Монца', date: '6 Сентября', fullDate: '2026-09-06', status: 'UPCOMING', flag: '🇮🇹' },
  { id: 16, round: 14, country: 'Испания', countryCode: 'ES', name: 'Гран-при Испании (Мадрид)', circuit: 'Мадрид', date: '13 Сентября', fullDate: '2026-09-13', status: 'UPCOMING', flag: '🇪🇸' },
  { id: 17, round: 15, country: 'Азербайджан', countryCode: 'AZ', name: 'Гран-при Азербайджана', circuit: 'Баку', date: '26 Сентября', fullDate: '2026-09-26', status: 'UPCOMING', flag: '🇦🇿', note: 'Субботняя гонка' },
  { id: 18, round: 16, country: 'Сингапур', countryCode: 'SG', name: 'Гран-при Сингапура (+ Спринт)', circuit: 'Марина-Бэй', date: '11 Октября', fullDate: '2026-10-11', status: 'UPCOMING', flag: '🇸🇬' },
  { id: 19, round: 17, country: 'США', countryCode: 'US', name: 'Гран-при США', circuit: 'Остин', date: '26 Октября', fullDate: '2026-10-26', status: 'UPCOMING', flag: '🇺🇸' },
  { id: 20, round: 18, country: 'Мексика', countryCode: 'MX', name: 'Гран-при Мехико', circuit: 'Мехико', date: '2 Ноября', fullDate: '2026-11-02', status: 'UPCOMING', flag: '🇲🇽' },
  { id: 21, round: 19, country: 'Бразилия', countryCode: 'BR', name: 'Гран-при Сан-Паулу', circuit: 'Сан-Паулу', date: '9 Ноября', status: 'UPCOMING', flag: '🇧🇷' },
  { id: 22, round: 20, country: 'США', countryCode: 'US', name: 'Гран-при Лас-Вегаса', circuit: 'Лас-Вегас', date: '22 Ноября', status: 'UPCOMING', flag: '🇺🇸' },
  { id: 23, round: 21, country: 'Катар', countryCode: 'QA', name: 'Гран-при Катара', circuit: 'Лусаил', date: '29 Ноября', status: 'UPCOMING', flag: '🇶🇦' },
  { id: 24, round: 22, country: 'ОАЭ', countryCode: 'AE', name: 'Гран-при Абу-Даби', circuit: 'Яс-Марина', date: '6 Декабря', status: 'UPCOMING', flag: '🇦🇪', note: 'Финал сезона' }
];

const RACE_RESULTS: Record<string, any[]> = {
  'Австралия': [
    { position: 1, driver: 'Джордж Расселл', team: 'Mercedes AMG F1', time: '1:23:06.801', points: 25 },
    { position: 2, driver: 'Андреа Кими Антонелли', team: 'Mercedes AMG F1', time: '+2.974', points: 18 },
    { position: 3, driver: 'Шарль Леклер', team: 'Scuderia Ferrari', time: '+15.519', points: 15 },
    { position: 4, driver: 'Льюис Хэмилтон', team: 'Scuderia Ferrari', time: '+16.144', points: 12 },
    { position: 5, driver: 'Ландо Норрис', team: 'McLaren', time: '+51.741', points: 10 },
    { position: 6, driver: 'Макс Ферстаппен', team: 'Red Bull', time: '+54.617', points: 8 },
    { position: 7, driver: 'Оливер Берман', team: 'Haas', time: '+1 круг', points: 6 },
    { position: 8, driver: 'Арвид Линдблад', team: 'Racing Bulls', time: '+1 круг', points: 4 },
    { position: 9, driver: 'Габриэл Бортолето', team: 'Audi', time: '+1 круг', points: 2 },
    { position: 10, driver: 'Пьер Гасли', team: 'Alpine', time: '+1 круг', points: 1 },
    { position: 11, driver: 'Эстебан Окон', team: 'Haas', time: '+1 круг', points: 0 },
    { position: 12, driver: 'Алекс Албон', team: 'Williams', time: '+1 круг', points: 0 },
    { position: 13, driver: 'Лиам Лоусон', team: 'Racing Bulls', time: '+1 круг', points: 0 },
    { position: 14, driver: 'Франко Колапинто', team: 'Alpine', time: '+2 круга', points: 0 },
    { position: 15, driver: 'Карлос Сайнс-мл.', team: 'Williams', time: '+2 круга', points: 0 },
    { position: 16, driver: 'Серхио Перес', team: 'Cadillac', time: '+3 круга', points: 0 },
    { position: 17, driver: 'Лэнс Стролл', team: 'Aston Martin', time: '+15 кругов', points: 0 },
    { position: 18, driver: 'Фернандо Алонсо', team: 'Aston Martin', time: 'DNF', points: 0 },
    { position: 19, driver: 'Валттери Боттас', team: 'Cadillac', time: 'DNF', points: 0 },
    { position: 20, driver: 'Исак Хаджар', team: 'Red Bull', time: 'DNF', points: 0 },
    { position: 21, driver: 'Нико Хюлькенберг', team: 'Audi', time: 'DNS', points: 0 },
    { position: 22, driver: 'Оскар Пиастри', team: 'McLaren', time: 'DNS', points: 0 },
  ],
  'Китай': [
    { position: 1, driver: 'Андреа Кими Антонелли', team: 'Mercedes AMG F1', time: '1:33:15.607', points: 25 },
    { position: 2, driver: 'Джордж Расселл', team: 'Mercedes AMG F1', time: '+5.515', points: 18 },
    { position: 3, driver: 'Льюис Хэмилтон', team: 'Scuderia Ferrari', time: '+25.267', points: 15 },
    { position: 4, driver: 'Шарль Леклер', team: 'Scuderia Ferrari', time: '+28.894', points: 12 },
    { position: 5, driver: 'Оливер Берман', team: 'Haas', time: '+57.268', points: 10 },
    { position: 6, driver: 'Пьер Гасли', team: 'Alpine', time: '+59.647', points: 8 },
    { position: 7, driver: 'Лиам Лоусон', team: 'Racing Bulls', time: '+1:20.588', points: 6 },
    { position: 8, driver: 'Исак Хаджар', team: 'Red Bull', time: '+1:27.247', points: 4 },
    { position: 9, driver: 'Карлос Сайнс-мл.', team: 'Williams', time: '+1 круг', points: 2 },
    { position: 10, driver: 'Франко Колапинто', team: 'Alpine', time: '+1 круг', points: 1 },
    { position: 11, driver: 'Нико Хюлькенберг', team: 'Audi', time: '+1 круг', points: 0 },
    { position: 12, driver: 'Арвид Линдблад', team: 'Racing Bulls', time: '+1 круг', points: 0 },
    { position: 13, driver: 'Валттери Боттас', team: 'Cadillac', time: '+1 круг', points: 0 },
    { position: 14, driver: 'Эстебан Окон', team: 'Haas', time: '+1 круг', points: 0 },
    { position: 15, driver: 'Серхио Перес', team: 'Cadillac', time: '+1 круг', points: 0 },
    { position: 16, driver: 'Макс Ферстаппен', team: 'Red Bull', time: 'DNF', points: 0 },
    { position: 17, driver: 'Фернандо Алонсо', team: 'Aston Martin', time: 'DNF', points: 0 },
    { position: 18, driver: 'Лэнс Стролл', team: 'Aston Martin', time: 'DNF', points: 0 },
    { position: 19, driver: 'Габриэл Бортолето', team: 'Audi', time: 'DNS', points: 0 },
    { position: 20, driver: 'Ландо Норрис', team: 'McLaren', time: 'DNS', points: 0 },
    { position: 21, driver: 'Оскар Пиастри', team: 'McLaren', time: 'DNS', points: 0 },
    { position: 22, driver: 'Алекс Албон', team: 'Williams', time: 'DNS', points: 0 },
  ],
  'Япония': [
    { position: 1, driver: 'Андреа Кими Антонелли', team: 'Mercedes AMG F1', time: '1:28:03.403', points: 25 },
    { position: 2, driver: 'Оскар Пиастри', team: 'McLaren', time: '+13.722', points: 18 },
    { position: 3, driver: 'Шарль Леклер', team: 'Scuderia Ferrari', time: '+15.270', points: 15 },
    { position: 4, driver: 'Джордж Расселл', team: 'Mercedes AMG F1', time: '+15.754', points: 12 },
    { position: 5, driver: 'Ландо Норрис', team: 'McLaren', time: '+23.479', points: 10 },
    { position: 6, driver: 'Льюис Хэмилтон', team: 'Scuderia Ferrari', time: '+25.037', points: 8 },
    { position: 7, driver: 'Пьер Гасли', team: 'Alpine', time: '+32.340', points: 6 },
    { position: 8, driver: 'Макс Ферстаппен', team: 'Red Bull', time: '+32.677', points: 4 },
    { position: 9, driver: 'Лиам Лоусон', team: 'Racing Bulls', time: '+50.180', points: 2 },
    { position: 10, driver: 'Эстебан Окон', team: 'Haas', time: '+51.216', points: 1 },
    { position: 11, driver: 'Нико Хюлькенберг', team: 'Audi', time: '+52.280', points: 0 },
    { position: 12, driver: 'Исак Хаджар', team: 'Red Bull', time: '+56.154', points: 0 },
    { position: 13, driver: 'Габриэл Бортолето', team: 'Audi', time: '+59.078', points: 0 },
    { position: 14, driver: 'Арвид Линдблад', team: 'Racing Bulls', time: '+59.848', points: 0 },
    { position: 15, driver: 'Карлос Сайнс-мл.', team: 'Williams', time: '+1:05.008', points: 0 },
    { position: 16, driver: 'Франко Колапинто', team: 'Alpine', time: '+1:05.773', points: 0 },
    { position: 17, driver: 'Серхио Перес', team: 'Cadillac', time: '+1:32.453', points: 0 },
    { position: 18, driver: 'Фернандо Алонсо', team: 'Aston Martin', time: '+1 круг', points: 0 },
    { position: 19, driver: 'Валттери Боттас', team: 'Cadillac', time: '+1 круг', points: 0 },
    { position: 20, driver: 'Алекс Албон', team: 'Williams', time: '+2 круга', points: 0 },
    { position: 21, driver: 'Лэнс Стролл', team: 'Aston Martin', time: 'DNF', points: 0 },
    { position: 22, driver: 'Оливер Берман', team: 'Haas', time: 'DNF', points: 0 },
  ]
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Гонка началась!');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft(`${days}д ${hours}ч ${minutes}м`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return <div className="text-f1-gold font-display font-bold text-lg">{timeLeft}</div>;
};

export const CalendarView: React.FC = () => {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [races, setRaces] = useState<Race[]>(F1_2026_CALENDAR);
  const [favorites, setFavorites] = useState<number[]>([]);
  const nextRace = races.find(r => r.status === 'NEXT');

  React.useEffect(() => {
    const fetchWeather = async () => {
      const updatedRaces = await Promise.all(races.map(async (race) => {
        if (race.status === 'UPCOMING' || race.status === 'NEXT') {
          try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(race.country)}?format=j1&lang=ru`);
            const data = await response.json();
            const weather = data.current_condition?.[0]?.weatherDesc?.[0]?.value || 'N/A';
            const temp = data.current_condition?.[0]?.temp_C ? `Воздух: ${data.current_condition[0].temp_C}°C` : '';
            return { ...race, weather, temp };
          } catch (error) {
            console.error(`Error fetching weather for ${race.country}:`, error);
            return { ...race, weather: 'N/A', temp: '' };
          }
        }
        return race;
      }));
      setRaces(updatedRaces);
    };
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const handleRaceClick = (race: Race) => {
    if (RACE_RESULTS[race.country] && race.status === 'COMPLETED') {
      setSelectedRace(race);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, raceId: number) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(raceId)
      ? favorites.filter(id => id !== raceId)
      : [...favorites, raceId];
    setFavorites(newFavorites);
    localStorage.setItem('f1_favorites', JSON.stringify(newFavorites));
  };
  
  return (
    <div className="pt-6 pb-24 px-4 space-y-4 max-w-4xl mx-auto bg-f1-black min-h-screen text-white">
      <div className="flex justify-between items-center px-2 mb-6">
        <h1 className="text-2xl font-display font-bold">Календарь <span className="text-f1-red">2026</span></h1>
        <div className="bg-f1-gold/20 px-3 py-1 rounded-full text-xs font-medium text-f1-gold">
          22 Этапа
        </div>
      </div>
      
      {nextRace && (
        <div className="bg-f1-dark p-4 rounded-2xl border border-f1-gold/30 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase">До следующей гонки</p>
            <p className="font-bold">{nextRace.name}</p>
          </div>
          <Countdown targetDate={nextRace.fullDate} />
        </div>
      )}
      
      <div className="space-y-4">
        {races.map((race, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            key={race.id} 
            onClick={() => handleRaceClick(race)}
            className={`rounded-2xl overflow-hidden transition-all duration-300 bg-f1-dark border border-f1-carbon ${
              RACE_RESULTS[race.country] && race.status === 'COMPLETED' ? 'cursor-pointer hover:border-f1-gold/50' : ''
            } ${
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
              <button onClick={(e) => toggleFavorite(e, race.id)} className="mr-2">
                <Star size={20} className={favorites.includes(race.id) ? 'fill-f1-gold text-f1-gold' : 'text-f1-carbon'} />
              </button>
              <div className="flex flex-col items-center justify-center w-10 sm:w-12 flex-shrink-0">
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase mb-1">Раунд</span>
                <span className={`text-xl sm:text-2xl font-display font-bold ${race.status === 'NEXT' ? 'text-f1-red' : race.status === 'CANCELLED' ? 'text-gray-600' : 'text-white'}`}>
                  {race.round}
                </span>
              </div>
              
              <div className="w-px h-10 sm:h-12 bg-white/10"></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="text-lg sm:text-xl font-bold bg-white/10 px-2 py-0.5 rounded text-white">{race.countryCode}</span>
                  <h3 className={`font-bold text-sm sm:text-base truncate ${race.status === 'COMPLETED' ? 'text-gray-400' : race.status === 'CANCELLED' ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {race.name}
                  </h3>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate flex items-center gap-1">
                  <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{race.circuit}</span>
                </p>
                {race.weather && (
                  <p className="text-[10px] sm:text-xs text-blue-400 mt-1 flex items-center gap-1">
                    <span className="flex-shrink-0">
                      {race.weather.toLowerCase().includes('sunny') || race.weather.includes('Ясно') ? '☀️' : 
                       race.weather.toLowerCase().includes('cloudy') || race.weather.includes('Облачно') ? '☁️' : 
                       race.weather.toLowerCase().includes('rain') || race.weather.includes('Дождь') ? '🌧️' : '🌤️'}
                    </span>
                    <span className="truncate">
                      {race.temp.replace('Воздух: ', '')}, {
                        race.weather.toLowerCase().includes('sunny') ? 'Ясно' : 
                        race.weather.toLowerCase().includes('cloudy') ? 'Облачно' : 
                        race.weather.toLowerCase().includes('rain') ? 'Дождь' : race.weather
                      }
                    </span>
                  </p>
                )}
                {race.winner && (
                  <p className="text-[10px] sm:text-xs text-yellow-500 mt-1 flex items-center gap-1">
                    <Trophy size={10} className="flex-shrink-0" /> <span className="truncate">Победитель: {race.winner}</span>
                  </p>
                )}
                {race.note && (
                  <p className="text-[10px] sm:text-xs text-f1-red mt-1 font-medium truncate">
                    {race.note}
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end flex-shrink-0 ml-1">
                <div className={`text-xs sm:text-sm font-medium whitespace-nowrap ${race.status === 'COMPLETED' || race.status === 'CANCELLED' ? 'text-gray-500' : 'text-gray-300'}`}>
                  {race.date}
                </div>
                {race.status === 'COMPLETED' && (
                  <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase mt-1 font-medium">Завершено</span>
                )}
                {race.status === 'CANCELLED' && (
                  <span className="text-[8px] sm:text-[10px] text-red-500 uppercase mt-1 font-bold flex items-center gap-1">
                    <AlertTriangle size={8} className="sm:w-2.5 sm:h-2.5" /> Отменен
                  </span>
                )}
                {RACE_RESULTS[race.country] && race.status === 'COMPLETED' && (
                  <span className="text-[10px] text-f1-red mt-1 flex items-center gap-1 opacity-80">
                    Результаты <ChevronRight size={10} />
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <RaceResultsModal 
        isOpen={!!selectedRace} 
        onClose={() => setSelectedRace(null)} 
        raceName={selectedRace?.name || ''}
        results={selectedRace ? RACE_RESULTS[selectedRace.country] || [] : []}
      />
    </div>
  );
};
