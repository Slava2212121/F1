import React from 'react';
import { ViewState } from '../types';
import { Calendar, Users, Tv, Trophy, Newspaper, Heart, Target } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isSpaceTheme?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isSpaceTheme = false }) => {
  const navItems = [
    { view: ViewState.PREDICTIONS, icon: Target, label: 'Прогнозы' },
    { view: ViewState.NEWS, icon: Newspaper, label: 'Новости' },
    { view: ViewState.CALENDAR, icon: Calendar, label: 'Календарь' },
    { view: ViewState.DRIVERS, icon: Users, label: 'Пилоты' },
    { view: ViewState.CONSTRUCTORS, icon: Trophy, label: 'Команды' },
    { view: ViewState.STREAMS, icon: Tv, label: 'Эфир' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex w-64 flex-shrink-0 border-r flex-col h-full z-50 transition-colors duration-500 ${isSpaceTheme ? 'bg-[#050014]/80 backdrop-blur-md border-purple-500/20' : 'bg-black border-white/10'}`}>
        <div className={`h-16 flex items-center gap-3 px-6 border-b ${isSpaceTheme ? 'border-purple-500/20' : 'border-white/10'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transform -skew-x-12 ${isSpaceTheme ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-f1-red'}`}>
              <span className="font-display font-black text-white text-lg skew-x-12">F1</span>
          </div>
          <span className="font-display font-bold tracking-tight text-lg">PADDOCK<span className={isSpaceTheme ? 'text-purple-400' : 'text-f1-red'}>PRIME</span></span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
              const isActive = currentView === item.view;
              const isPredictions = item.view === ViewState.PREDICTIONS;
              
              let activeClass = '';
              let inactiveClass = '';
              
              if (isSpaceTheme) {
                 activeClass = 'bg-[#1a0033]/60 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.4),inset_0_0_10px_rgba(34,211,238,0.2)]';
                 inactiveClass = 'text-gray-400 hover:text-white hover:bg-white/5';
              } else {
                 if (isPredictions) {
                    // special glowing red for Predictions tab
                    activeClass = 'bg-f1-red/10 text-[#ff4444] drop-shadow-[0_0_10px_rgba(255,68,68,0.8)] border border-f1-red/20 shadow-[inset_0_0_15px_rgba(225,6,0,0.2)]';
                    inactiveClass = 'text-gray-400 hover:text-[#ff8888] hover:bg-white/5 hover:drop-shadow-[0_0_5px_rgba(255,68,68,0.5)]';
                 } else {
                    activeClass = 'bg-f1-red/10 text-f1-red';
                    inactiveClass = 'text-gray-400 hover:text-white hover:bg-white/5';
                 }
              }

              return (
                  <button
                      key={item.view}
                      onClick={() => setView(item.view)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 active:scale-95 shimmer-effect ${isActive ? activeClass : inactiveClass}`}
                  >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive && isPredictions && !isSpaceTheme ? "drop-shadow-[0_0_8px_rgba(255,68,68,1)]" : ""} />
                      <span className={`text-sm font-medium tracking-wide uppercase ${isActive && isPredictions && !isSpaceTheme ? "drop-shadow-[0_0_8px_rgba(255,68,68,1)]" : ""}`}>{item.label}</span>
                  </button>
              );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-50 pb-safe transition-colors duration-500 ${isSpaceTheme ? 'bg-[#050014]/90 border-purple-500/20' : 'bg-black/90 border-white/10'}`}>
        <div className="flex items-center justify-between px-1 py-2">
          {navItems.map((item) => {
              const isActive = currentView === item.view;
              const isPredictions = item.view === ViewState.PREDICTIONS;
              
              let activeText = '';
              let glowClasses = '';
              
              if (isSpaceTheme) {
                  activeText = 'text-purple-400';
              } else {
                  if (isActive && isPredictions) {
                      activeText = 'text-[#ff4444]';
                      glowClasses = 'drop-shadow-[0_0_8px_rgba(255,68,68,1)]';
                  } else {
                      activeText = 'text-f1-red';
                  }
              }

              return (
                  <button
                      key={item.view}
                      onClick={() => setView(item.view)}
                      className={`flex flex-col items-center justify-center gap-1 p-1 flex-1 rounded-lg transition-all duration-300 active:scale-95 shimmer-effect ${isActive ? activeText : 'text-gray-400 hover:text-white'}`}
                  >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={glowClasses} />
                      <span className={`text-[8px] sm:text-[9px] font-medium tracking-wide uppercase truncate w-full text-center ${glowClasses}`}>{item.label}</span>
                  </button>
              );
          })}
        </div>
      </nav>
    </>
  );
};