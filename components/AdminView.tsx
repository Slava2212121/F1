import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { updateDocument } from '../services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { INITIAL_DRIVERS } from '../data/drivers';
import { CONSTRUCTORS } from './ConstructorsView';
import { F1_2026_CALENDAR } from './CalendarView';
import { X, Plus, Trash2 } from 'lucide-react';

export const AdminView = ({ data }: { data: any }) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'races' | 'drivers' | 'teams' | 'notifications'>('races');
  const [editingRace, setEditingRace] = useState<any>(null);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Панель Администратора</h2>
        <p className="text-gray-400 mb-6 text-center">Войдите, чтобы редактировать результаты гонок и статистику.</p>
        <button 
          onClick={loginWithGoogle}
          className="bg-f1-red text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Войти через Google
        </button>
      </div>
    );
  }

  if (user.email !== 'slavakolos12@gmail.com') {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Доступ запрещен</h2>
        <p className="text-gray-400 mb-6 text-center">У вас нет прав администратора.</p>
        <button onClick={logout} className="text-gray-400 hover:text-white underline">Выйти</button>
      </div>
    );
  }

  const handleUpdate = async (collection: string, id: string, field: string, value: any) => {
    try {
      await updateDocument(collection, id, { [field]: value, name: id });
    } catch (e) {
      alert('Ошибка при сохранении: ' + e);
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.title || !newNotification.message) return;
    try {
      const id = Date.now().toString();
      await updateDocument('notifications', id, {
        title: newNotification.title,
        message: newNotification.message,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      });
      setNewNotification({ title: '', message: '' });
      alert('Уведомление отправлено!');
    } catch (e) {
      alert('Ошибка: ' + e);
    }
  };

  const saveRaceResults = async () => {
    if (!editingRace) return;
    try {
      await updateDocument('races', editingRace.id.toString(), { results: editingRace.results || [], name: editingRace.name });
      setEditingRace(null);
    } catch (e) {
      alert('Ошибка: ' + e);
    }
  };

  const addResultRow = () => {
    setEditingRace({
      ...editingRace,
      results: [...(editingRace.results || []), { position: '', driver: '', team: '', time: '', points: 0, status: '' }]
    });
  };

  const updateResultRow = (index: number, field: string, value: any) => {
    const newResults = [...(editingRace.results || [])];
    newResults[index] = { ...newResults[index], [field]: value };
    setEditingRace({ ...editingRace, results: newResults });
  };

  const removeResultRow = (index: number) => {
    const newResults = [...(editingRace.results || [])];
    newResults.splice(index, 1);
    setEditingRace({ ...editingRace, results: newResults });
  };

  const mergedRaces = F1_2026_CALENDAR.map(race => {
    const fb = data.calendar?.find((r: any) => r.id === race.id?.toString() || r.name === race.name);
    return fb ? { ...race, ...fb } : race;
  });

  const mergedDrivers = INITIAL_DRIVERS.map(driver => {
    const fb = data.drivers?.find((d: any) => d.id === driver.id);
    return fb ? { ...driver, ...fb } : driver;
  });

  const mergedTeams = CONSTRUCTORS.map(team => {
    const fb = data.teams?.find((t: any) => t.id === team.id);
    return fb ? { ...team, ...fb } : team;
  });

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Админка</h2>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-white">Выйти</button>
      </div>

      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl overflow-x-auto hide-scrollbar">
        {['races', 'drivers', 'teams', 'notifications', 'predictions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 ${
              activeTab === tab
                ? (tab === 'predictions'
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] border border-cyan-500/50'
                    : 'bg-f1-red text-white')
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'notifications' ? 'Уведомления' : tab === 'predictions' ? 'Лига прогнозов' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'predictions' && mergedRaces.filter(r => r.status.toUpperCase() === 'COMPLETED').map((race: any) => (
          <div key={race.id} className="glass-panel p-4 rounded-xl">
             <h3 className="font-bold">{race.name} - Верные ответы</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Победитель</label>
                    <input type="text" value={race.correctAnswers?.winner || ''} onChange={(e) => handleUpdate('races', race.id.toString(), 'correctAnswers', {...(race.correctAnswers || {}), winner: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">DOTD</label>
                    <input type="text" value={race.correctAnswers?.dotd || ''} onChange={(e) => handleUpdate('races', race.id.toString(), 'correctAnswers', {...(race.correctAnswers || {}), dotd: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 block mb-1">Событие</label>
                    <input type="text" value={race.correctAnswers?.randomEvent || ''} onChange={(e) => handleUpdate('races', race.id.toString(), 'correctAnswers', {...(race.correctAnswers || {}), randomEvent: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm" />
                 </div>
             </div>
          </div>
        ))}

        {activeTab === 'races' && mergedRaces.map((race: any) => (
          <div key={race.id} className="glass-panel p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{race.name}</h3>
              <button 
                onClick={() => setEditingRace(race)}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
              >
                Результаты
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Статус</label>
                <select 
                  value={race.status || 'upcoming'} 
                  onChange={(e) => handleUpdate('races', race.id.toString(), 'status', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm"
                >
                  <option value="UPCOMING">Предстоит</option>
                  <option value="NEXT">Следующая</option>
                  <option value="COMPLETED">Завершена</option>
                  <option value="CANCELLED">Отменена</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Победитель</label>
                <input 
                  type="text" 
                  value={race.winner || ''} 
                  onChange={(e) => handleUpdate('races', race.id.toString(), 'winner', e.target.value)}
                  placeholder="Имя пилота"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'drivers' && mergedDrivers.map((driver: any) => (
          <div key={driver.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold">{driver.name}</h3>
              <p className="text-xs text-gray-400">{driver.team}</p>
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Очки</label>
              <input 
                type="number" 
                value={driver.points || 0} 
                onChange={(e) => handleUpdate('drivers', driver.id, 'points', Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm text-center"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Позиция</label>
              <input 
                type="number" 
                value={driver.position || 0} 
                onChange={(e) => handleUpdate('drivers', driver.id, 'position', Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm text-center"
              />
            </div>
          </div>
        ))}

        {activeTab === 'teams' && mergedTeams.map((team: any) => (
          <div key={team.id} className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold">{team.name}</h3>
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Очки</label>
              <input 
                type="number" 
                value={team.points || 0} 
                onChange={(e) => handleUpdate('teams', team.id, 'points', Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm text-center"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Позиция</label>
              <input 
                type="number" 
                value={team.position || 0} 
                onChange={(e) => handleUpdate('teams', team.id, 'position', Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm text-center"
              />
            </div>
          </div>
        ))}

        {activeTab === 'notifications' && (
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="font-bold mb-4">Отправить Push-уведомление</h3>
            <p className="text-xs text-gray-400 mb-4">
              Это уведомление появится у всех пользователей, у которых открыто приложение. Для фоновых уведомлений (когда приложение закрыто) требуется интеграция RuStore Push SDK в Android-проект.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Заголовок</label>
                <input 
                  type="text" 
                  value={newNotification.title} 
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  placeholder="Например: Гонка началась!"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Текст</label>
                <textarea 
                  value={newNotification.message} 
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  placeholder="Гран-при Бахрейна стартовал. Следите за результатами!"
                  className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm h-24 resize-none"
                />
              </div>
              <button 
                onClick={handleSendNotification}
                disabled={!newNotification.title || !newNotification.message}
                className="w-full bg-f1-red text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity"
              >
                Отправить всем
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Race Results Edit Modal */}
      {editingRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#151515] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg">Результаты: {editingRace.name}</h3>
              <button onClick={() => setEditingRace(null)} className="text-gray-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-bold uppercase mb-2 px-2">
                <div className="col-span-2">Поз.</div>
                <div className="col-span-3">Пилот</div>
                <div className="col-span-2">Команда</div>
                <div className="col-span-2">Статус</div>
                <div className="col-span-1">Время</div>
                <div className="col-span-1">Очки</div>
                <div className="col-span-1"></div>
              </div>
              
              {(editingRace.results || []).map((res: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg">
                  <div className="col-span-2">
                    <input type="text" value={res.position} onChange={e => updateResultRow(idx, 'position', e.target.value)} placeholder="1, DNF" className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm" />
                  </div>
                  <div className="col-span-3">
                    <input type="text" value={res.driver} onChange={e => updateResultRow(idx, 'driver', e.target.value)} placeholder="Имя" className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm" />
                  </div>
                  <div className="col-span-2">
                    <input type="text" value={res.team} onChange={e => updateResultRow(idx, 'team', e.target.value)} placeholder="Команда" className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm" />
                  </div>
                  <div className="col-span-2">
                    <input type="text" value={res.status || ''} onChange={e => updateResultRow(idx, 'status', e.target.value)} placeholder="SC, VSC" className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm" />
                  </div>
                  <div className="col-span-1">
                    <input type="text" value={res.time} onChange={e => updateResultRow(idx, 'time', e.target.value)} placeholder="+1.234" className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm" />
                  </div>
                  <div className="col-span-1">
                    <input type="number" value={res.points} onChange={e => updateResultRow(idx, 'points', Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded p-1.5 text-white text-sm text-center" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeResultRow(idx)} className="text-red-500 hover:text-red-400 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button onClick={addResultRow} className="w-full py-3 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 mt-4">
                <Plus size={16} /> Добавить пилота
              </button>
            </div>
            
            <div className="p-4 border-t border-white/10 flex gap-3">
              <button onClick={() => setEditingRace(null)} className="flex-1 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors">
                Отмена
              </button>
              <button onClick={saveRaceResults} className="flex-1 py-3 rounded-xl font-bold bg-f1-red text-white hover:bg-red-700 transition-colors">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
