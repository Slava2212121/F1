import React from 'react';
import { ViewState } from '../types';
import { Calendar, Users, Tv, Trophy, Newspaper } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: ViewState.NEWS, icon: Newspaper, label: 'Новости' },
    { view: ViewState.CALENDAR, icon: Calendar, label: 'Календарь' },
    { view: ViewState.DRIVERS, icon: Users, label: 'Пилоты' },
    { view: ViewState.CONSTRUCTORS, icon: Trophy, label: 'Команды' },
    { view: ViewState.STREAMS, icon: Tv, label: 'Эфир' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 flex-shrink-0 bg-black border-r border-white/10 flex-col h-full z-50">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-f1-red rounded-lg flex items-center justify-center transform -skew-x-12">
              <span className="font-display font-black text-white text-lg skew-x-12">F1</span>
          </div>
          <span className="font-display font-bold tracking-tight text-lg">PADDOCK<span className="text-f1-red">PRIME</span></span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                  <button
                      key={item.view}
                      onClick={() => setView(item.view)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-f1-red/10 text-f1-red' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm font-medium tracking-wide uppercase">{item.label}</span>
                  </button>
              );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                  <button
                      key={item.view}
                      onClick={() => setView(item.view)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${isActive ? 'text-f1-red' : 'text-gray-400 hover:text-white'}`}
                  >
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
                  </button>
              );
          })}
        </div>
      </nav>
    </>
  );
};