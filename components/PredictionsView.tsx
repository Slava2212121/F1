import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, AlertTriangle, ShieldCheck, ChevronRight, BookOpen, User, CheckCircle2, Lock, Flag } from 'lucide-react';
import { INITIAL_DRIVERS } from '../data/drivers';
import { auth, loginWithGoogle, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Расширенный фильтр запрещенных слов (включая законы РФ: наркотики, экстремизм, суицид, рознь)
const FORBIDDEN_ROOTS = [
    // Мат и нецензурная брань
    'хуй', 'пизд', 'еба', 'бля', 'сука', 'мудак', 'говн', 'хер', 'пидор', 'шлюх', 'гандон', 'залуп', 'дроч', 'долбоеб', 'уебан', 'мразь', 'пидар', 'хрен',
    // 18+, анатомия, порнография
    'письк', 'член', 'жоп', 'порно', 'сиськ', 'вагин', 'анус', 'пенис', 'сперм', 'секс', 'порнух', 'интим',
    // Пропаганда наркотиков (Законодательство РФ)
    'наркот', 'кокаин', 'героин', 'мефедрон', 'марихуан', 'гашиш', 'амфетамин', 'экстази', 'спайс', 'соли', 'меф', 'лсд', 'lsd', 'снюс', 'насвай', 'экстази',
    // Экстремизм, терроризм, нацизм
    'террор', 'нацист', 'фашист', 'гитлер', 'игил', 'джихад', 'свастик',
    // Пропаганда суицида
    'суицид', 'самоубийст', 'вскрытьвен', 'повеситьс',
    // Разжигание ненависти, расизм и нац. рознь
    'нигер', 'nigg', 'чурк', 'хохол', 'кацап', 'москаль', 'хач', 'жид', 'даун', 'аутист'
];

const isNameValid = (name: string) => {
    // Удаляем все пробелы и символы, чтобы избежать обхода фильтра типа "н а р к о т и к"
    const lower = name.toLowerCase().replace(/[^а-яёa-z]/g, '');
    for (const root of FORBIDDEN_ROOTS) {
        if (lower.includes(root)) return false;
    }
    return true;
};

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Компонент модального окна регистрации
const RegistrationModal: React.FC<{ onComplete: (name: string, uid: string) => void, onCancel: () => void }> = ({ onComplete, onCancel }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaQ, setCaptchaQ] = useState({ a: 0, b: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCaptchaQ({
            a: Math.floor(Math.random() * 10) + 1,
            b: Math.floor(Math.random() * 10) + 1
        });
    }, []);

    const handleSubmit = async () => {
        setError('');
        if (name.trim().length < 3) {
            setError('Имя должно содержать минимум 3 символа.');
            return;
        }
        if (!isNameValid(name)) {
            setError('Ошибка: Имя содержит недопустимые слова (нарушение правил). Пожалуйста, выберите другое имя.');
            return;
        }
        if (parseInt(captchaAnswer) !== (captchaQ.a + captchaQ.b)) {
            setError('Ошибка: Капча решена неверно. Вы робот?');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            if (result.user) {
                // Check if user already has an assigned name, otherwise register this new one
                const userDoc = await getDoc(doc(db, 'users', result.user.uid));
                let finalName = name.trim();
                
                if (!userDoc.exists()) {
                    await setDoc(doc(db, 'users', result.user.uid), {
                        nickname: finalName,
                        createdAt: serverTimestamp()
                    });
                } else {
                    finalName = userDoc.data().nickname || finalName;
                }
                
                onComplete(finalName, result.user.uid);
            }
        } catch (e: any) {
            console.error("Auth error:", e);
            setError('Ошибка авторизации Google. ' + (e.message || ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 max-w-md w-full shadow-[0_0_40px_rgba(147,51,234,0.2)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <User className="text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider">Регистрация пилота</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">Ваш никнейм</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например: SuperMax33"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">Отображается в таблице лидеров. Запрещены оскорбительные слова.</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                            <Lock size={14} className="text-purple-400"/> Анти-бот капча
                        </label>
                        <p className="text-xs text-gray-400 mb-3">Решите простой пример, чтобы доказать, что вы человек.</p>
                        <div className="flex items-center gap-4">
                            <div className="bg-black px-4 py-2 rounded-lg font-mono text-lg font-bold border border-white/10 tracking-widest text-purple-400">
                                {captchaQ.a} + {captchaQ.b} =
                            </div>
                            <input 
                                type="number" 
                                value={captchaAnswer}
                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                className="w-20 bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-lg text-center focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex gap-2 items-start">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button onClick={onCancel} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50">
                            Отмена
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(147,51,234,0.4)] disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? 'Авторизация...' : 'Войти в Лигу'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PredictionsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MAKE_PREDICTION' | 'LEADERBOARD' | 'RULES'>('MAKE_PREDICTION');
  const [leaderboardScope, setLeaderboardScope] = useState<'RACE' | 'STAGE' | 'GLOBAL'>('RACE');
  
  // Auth state
  const [user, setUser] = useState<{name: string, uid: string} | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionLoaded, setPredictionLoaded] = useState(false);

  const [prediction, setPrediction] = useState({
    winner: '',
    dotd: '',
    randomEvent: ''
  });

  const activeStage = "Этап 1: Майами - Венгрия";
  const raceId = "miami_2026";
  const nextRace = "Гран-при Майами";
  const deadline = new Date("2026-05-02T19:00:00Z"); 
  const now = new Date();
  const isLocked = now > deadline;

  const drivers = INITIAL_DRIVERS;

  const randomEventsOptions = [
    "Только VSC",
    "Только SC",
    "Красный флаг",
    "Всё сразу",
    "Ничего из этого"
  ];

  // Load auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser({ name: userDoc.data().nickname, uid: fbUser.uid });
        } else {
          // They must complete registration to get a nickname
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Load prediction if user exists
  useEffect(() => {
    if (user && user.uid) {
        const fetchPrediction = async () => {
            const predId = `${raceId}_${user.uid}`;
            const predDoc = await getDoc(doc(db, 'predictions', predId));
            if (predDoc.exists()) {
                const data = predDoc.data();
                setPrediction({
                    winner: data.winner || '',
                    dotd: data.dotd || '',
                    randomEvent: data.randomEvent || ''
                });
            }
            setPredictionLoaded(true);
        };
        fetchPrediction();
    } else {
        setPredictionLoaded(false);
        setPrediction({ winner: '', dotd: '', randomEvent: '' });
    }
  }, [user]);

  const handlePredict = async () => {
    if (!user) {
        setShowAuth(true);
        return;
    }
    if (isLocked) {
        alert("Ставки на этот этап уже закрыты!");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const predId = `${raceId}_${user.uid}`;
        await setDoc(doc(db, 'predictions', predId), {
            userId: user.uid,
            raceId: raceId,
            winner: prediction.winner,
            dotd: prediction.dotd,
            randomEvent: prediction.randomEvent,
            updatedAt: serverTimestamp()
        });
        alert(`Прогноз успешно сохранен!`);
    } catch (e: any) {
        console.error("Prediction error:", e);
        alert("Ошибка при сохранении: " + e.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black relative">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 pointer-events-none"></div>

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in relative z-10 pb-24">
        {showAuth && <RegistrationModal onComplete={(name, uid) => { setUser({name, uid}); setShowAuth(false); }} onCancel={() => setShowAuth(false)} />}

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] transform -skew-x-6 border border-purple-400/30">
                    <Target className="text-white transform skew-x-6 drop-shadow-lg" size={32} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest border border-purple-500/30">BETA SEASON</span>
                    </div>
                    <h1 className="font-display font-black text-4xl tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Лига <span className="text-purple-400">Прогнозов</span></h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Текущий этап: <span className="text-purple-300 border-b border-purple-500/30 pb-0.5">{activeStage}</span></p>
                </div>
            </div>
            
            {/* User Profile Hook */}
            <div className="flex items-center gap-3 bg-black/50 p-2 pl-4 rounded-full border border-white/5 backdrop-blur-md">
                {user ? (
                    <>
                        <span className="text-sm font-bold text-gray-300">{user.name}</span>
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.5)]">
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                    </>
                ) : (
                    <>
                        <span className="text-sm text-gray-400 font-medium">Вы не авторизованы</span>
                        <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors">
                            Войти
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-black/60 p-1.5 rounded-2xl w-max border border-white/10 backdrop-blur-xl shadow-lg">
            <button 
            onClick={() => setActiveTab('MAKE_PREDICTION')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'MAKE_PREDICTION' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
            Мой прогноз
            </button>
            <button 
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'LEADERBOARD' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
            Таблица лидеров
            </button>
            <button 
            onClick={() => setActiveTab('RULES')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'RULES' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
            <BookOpen size={16} /> Правила
            </button>
        </div>

        {/* RULES CONTENT */}
        {activeTab === 'RULES' && (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform rotate-12">
                    <Target size={200} />
                </div>
            <h2 className="text-2xl lg:text-3xl font-black font-display uppercase tracking-wider mb-8 flex items-center gap-4 text-white">
                <Target className="text-purple-500" size={32} />
                Правила турнира
            </h2>
            
            <div className="space-y-10 text-gray-300 relative z-10">
                <section>
                    <h3 className="text-xl font-bold text-purple-300 mb-4 tracking-wide uppercase">Как это работает?</h3>
                    <p className="mb-3 text-lg leading-relaxed">Вы соревнуетесь с другими фанатами Формулы 1, предсказывая исходы гонок. Чем точнее ваши предсказания, тем выше вы в таблице лидеров!</p>
                    <p className="text-lg leading-relaxed">Весь сезон разделен на <strong>ЭТАПЫ</strong> (например, "Майами - Венгрия"). В каждом этапе ведется своя турнирная таблица, а также есть Глобальная таблица за весь сезон.</p>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-purple-300 mb-4 tracking-wide uppercase">Система баллов</h3>
                    <ul className="space-y-4 list-none bg-black/40 p-6 rounded-2xl border border-white/5">
                        <li className="flex gap-4">
                            <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/50">1</div>
                            <div>
                                <strong className="text-white text-lg">Победитель гонки</strong>
                                <p className="mt-1">Точное попадание в пилота — <strong className="text-purple-400">10 баллов</strong>. Если вы ошиблись с пилотом, но угадали команду-победителя (например, выиграл Рассел, а вы поставили на Антонелли из Mercedes) — утешительные <strong className="text-purple-400">+3 балла</strong>.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/50">2</div>
                            <div>
                                <strong className="text-white text-lg">Гонщик дня / DOTD</strong>
                                <p className="mt-1">Точное попадание — <strong className="text-purple-400">5 баллов</strong>. Угадали только команду — <strong className="text-purple-400">+1 балл</strong>.</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/50">3</div>
                            <div>
                                <strong className="text-white text-lg">Случайное событие <span className="text-purple-400">(8 баллов)</span></strong>
                                <p className="mt-1">На каждую гонку будет индивидуальное событие (например: "Будет ли машина безопасности?"). Это ваш шанс заработать дополнительные очки за интуицию!</p>
                            </div>
                        </li>
                    </ul>
                    
                    <div className="mt-4 bg-gradient-to-r from-yellow-600/20 to-amber-600/10 border border-yellow-500/30 p-5 rounded-2xl flex items-start gap-4">
                        <Trophy className="text-yellow-500 shrink-0" />
                        <div>
                            <strong className="text-yellow-500 text-lg uppercase tracking-wider block mb-1">Особый Мастер-Бонус (+5 баллов)</strong>
                            <p className="text-yellow-200/70">Если вы точно угадаете всех победителей (10 баллов) + DOTD (5 баллов) + событие (8 баллов) в рамках одной гонки, система начислит бонус за безошибочный анализ.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-purple-300 mb-4 tracking-wide uppercase">Дедлайны и блокировки</h3>
                    <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-10">
                        <AlertTriangle className="text-red-400 shrink-0" size={28} />
                        <div>
                            <p className="font-medium text-white mb-2">Прием ставок на гонку строго закрывается ровно за 24 часа до старта самой гонки.</p>
                            <p className="text-red-200/70 text-sm">Как только таймер истечет — форма блокируется, и прогноз нельзя будет изменить ни при каких обстоятельствах. До наступления дедлайна вы можете менять решение неограниченное число раз.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-yellow-500 mb-4 tracking-wide uppercase flex items-center gap-2">
                        <Trophy size={24} /> Призы по окончании лиги
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-b from-yellow-500/20 to-transparent border border-yellow-500/30 p-5 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-yellow-400"></div>
                            <span className="text-5xl font-black font-display text-white/10 absolute top-2 right-2 pointer-events-none">1</span>
                            <Trophy className="text-yellow-400 mx-auto mb-3" size={32} />
                            <h4 className="font-bold text-lg text-white mb-2">1 Место</h4>
                            <p className="text-yellow-200/80 text-sm font-medium border-b border-white/10 pb-3 mb-3">500 рублей</p>
                            <p className="text-xs text-gray-300">Ваш никнейм будет почетно закреплен на главной странице приложения до следующего этапа!</p>
                        </div>
                        <div className="bg-gradient-to-b from-gray-400/20 to-transparent border border-gray-400/30 p-5 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gray-400"></div>
                            <span className="text-5xl font-black font-display text-white/10 absolute top-2 right-2 pointer-events-none">2</span>
                            <Trophy className="text-gray-400 mx-auto mb-3" size={32} />
                            <h4 className="font-bold text-lg text-white mb-2">2 Место</h4>
                            <p className="text-gray-300 text-sm font-medium border-b border-white/10 pb-3 mb-3">Хотелка в приложении</p>
                            <p className="text-xs text-gray-400">Любое адекватное пожелание по добавлению функции или дизайна в приложение владельцу.</p>
                        </div>
                        <div className="bg-gradient-to-b from-amber-700/20 to-transparent border border-amber-700/30 p-5 rounded-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-1 bg-amber-700"></div>
                            <span className="text-5xl font-black font-display text-white/10 absolute top-2 right-2 pointer-events-none">3</span>
                            <Trophy className="text-amber-600 mx-auto mb-3" size={32} />
                            <h4 className="font-bold text-lg text-white mb-2">3 Место</h4>
                            <p className="text-amber-300/80 text-sm font-medium border-b border-white/10 pb-3 mb-3">Слава в Telegram</p>
                            <p className="text-xs text-gray-400">Размещение вашего имени на почетном месте в официальном Telegram-канале на 24 часа.</p>
                        </div>
                    </div>
                </section>
            </div>
            </div>
        )}

        {/* MAKE PREDICTION CONTENT */}
        {activeTab === 'MAKE_PREDICTION' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Race track stylized background */}
                    <div className="absolute top-0 right-0 bottom-0 w-64 bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none transform skew-x-12 translate-x-10"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black font-display uppercase tracking-wider text-white mb-2 flex items-center gap-3">
                                    <Flag className="text-purple-500" /> {nextRace}
                                </h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={16} className={isLocked ? "text-f1-red" : "text-green-400"} />
                                    <span className={isLocked ? "text-f1-red font-bold" : "text-gray-300"}>
                                        {isLocked ? "Прием ставок закрыт" : `Закрытие: 2 Мая, 19:00 (за 24ч до старта)`}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden sm:block text-right">
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Статус гонки</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isLocked ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                    {isLocked ? 'ЗАБЛОКИРОВАНО' : 'АКТИВНО'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Winner Prediction */}
                            <div className="bg-white/[0.02] p-5 lg:p-6 rounded-2xl border border-white/5 transition-all focus-within:border-purple-500/50 focus-within:bg-white/[0.04]">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="block text-sm font-bold text-white uppercase tracking-wider">
                                        Победитель гонки <span className="block text-xs font-medium text-gray-500 mt-1 normal-case">За точного пилота 10 баллов, за команду 3 балла</span>
                                    </label>
                                    <Trophy size={20} className="text-purple-400 opacity-50" />
                                </div>
                                <select 
                                    disabled={isLocked}
                                    value={prediction.winner}
                                    onChange={(e) => setPrediction({...prediction, winner: e.target.value})}
                                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all font-medium"
                                >
                                    <option value="">Выберите пилота...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                                    ))}
                                </select>
                            </div>

                            {/* DOTD Prediction */}
                            <div className="bg-white/[0.02] p-5 lg:p-6 rounded-2xl border border-white/5 transition-all focus-within:border-purple-500/50 focus-within:bg-white/[0.04]">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="block text-sm font-bold text-white uppercase tracking-wider">
                                        Гонщик дня / DOTD <span className="block text-xs font-medium text-gray-500 mt-1 normal-case">За точного пилота 5 баллов, за команду 1 балл</span>
                                    </label>
                                    <User size={20} className="text-purple-400 opacity-50" />
                                </div>
                                <select 
                                    disabled={isLocked}
                                    value={prediction.dotd}
                                    onChange={(e) => setPrediction({...prediction, dotd: e.target.value})}
                                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white appearance-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all font-medium"
                                >
                                    <option value="">Выберите пилота...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Random Event Prediction */}
                            <div className="bg-white/[0.02] p-5 lg:p-6 rounded-2xl border border-white/5">
                                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                                    Случайное событие <span className="text-purple-400">(8 баллов)</span>
                                    <span className="block text-xs font-medium text-gray-400 mt-2 p-3 bg-black/40 rounded-lg border border-white/5 normal-case">Вопрос на Майами: Какое из событий произойдет в гонке?</span>
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    {randomEventsOptions.map(event => (
                                        <button 
                                            key={event}
                                            disabled={isLocked}
                                            onClick={() => setPrediction({...prediction, randomEvent: event})}
                                            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${prediction.randomEvent === event ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-black border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'} disabled:opacity-50`}
                                        >
                                            {event}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/10">
                            {user ? (
                                <button 
                                    onClick={handlePredict}
                                    disabled={isLocked || !prediction.winner || !prediction.dotd || !prediction.randomEvent || isSubmitting}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                                >
                                    <ShieldCheck size={24} />
                                    {isLocked ? "СТАВКИ ЗАКРЫТЫ" : isSubmitting ? "ОТПРАВКА..." : predictionLoaded ? "ОБНОВИТЬ ПРОГНОЗ" : "ЗАФИКСИРОВАТЬ ПРОГНОЗ"}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setShowAuth(true)}
                                    className="w-full bg-white text-black hover:bg-gray-200 font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                                >
                                    <User size={24} />
                                    ЗАРЕГИСТРИРОВАТЬСЯ ДЛЯ СТАВКИ
                                </button>
                            )}
                            
                            {!isLocked && user && (
                                <p className="text-center text-xs text-gray-500 mt-4 flex justify-center items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-500" />
                                    Бесплатно и безопасно. Менять решение можно до дедлайна.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Status Widget */}
                <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative">
                        <h3 className="font-display font-black text-xl mb-6 text-white uppercase tracking-wider flex items-center gap-3">
                            <Target className="text-purple-500" size={24} />
                            СТАТУС ИГРЫ
                        </h3>
                        <div className="space-y-5">
                            <div className="flex gap-4 items-start bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                                <div className="mt-1 flex-shrink-0"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse"></div></div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">{activeStage}</h4>
                                    <p className="text-xs text-purple-300 mt-1">Идет прием ставок</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start opacity-40 px-2">
                                <div className="mt-1 flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-500"></div></div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Этап 2: Нидерланды - США</h4>
                                    <p className="text-xs text-gray-400">Ожидается в августе</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start opacity-40 px-2">
                                <div className="mt-1 flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-500"></div></div>
                                <div>
                                    <h4 className="font-bold text-sm text-white">Этап 3: Мексика - Абу-Даби</h4>
                                    <p className="text-xs text-gray-400">Ожидается в октябре</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Hint Widget */}
                <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl">
                    <h3 className="font-bold text-gray-300 mb-6 flex items-center gap-2 uppercase tracking-wide text-sm">
                        <Trophy className="text-yellow-500" size={16} /> 
                        Напоминание о баллах
                    </h3>
                    <ul className="space-y-4 text-xs font-medium">
                        <li className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-gray-400">Победитель</span>
                            <div className="text-right">
                                <span className="font-bold text-white block">10 очков</span>
                                <span className="text-[10px] text-gray-500">или 3 за команду</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-gray-400">Гонщик дня (DOTD)</span>
                            <div className="text-right">
                                <span className="font-bold text-white block">5 очков</span>
                                <span className="text-[10px] text-gray-500">или 1 за команду</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center pb-3 border-b border-white/5">
                            <span className="text-gray-400">Случайное событие</span>
                            <span className="font-bold text-white">8 очков</span>
                        </li>
                        <li className="flex justify-between items-center pt-1">
                            <span className="flex items-center gap-1.5 text-yellow-500 font-bold"><Target size={12}/> Мастер-бонус</span>
                            <span className="font-bold text-yellow-500">+5 очков</span>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
        )} 
        
        {/* LEADERBOARD CONTENT */}
        {activeTab === 'LEADERBOARD' && (
            <div className="bg-black/60 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 lg:p-8 border-b border-white/5 bg-white/[0.02] gap-6">
                <h2 className="text-2xl font-black font-display uppercase tracking-wider text-white flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={28} />
                    Зал Славы
                </h2>
                
                {/* Leaderboard Scope Toggles */}
                <div className="flex bg-black p-1.5 rounded-xl border border-white/10 w-full lg:w-max overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setLeaderboardScope('RACE')}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap ${leaderboardScope === 'RACE' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Гонка (Майами)
                    </button>
                    <button 
                        onClick={() => setLeaderboardScope('STAGE')}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap ${leaderboardScope === 'STAGE' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Этап 1
                    </button>
                    <button 
                        onClick={() => setLeaderboardScope('GLOBAL')}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap ${leaderboardScope === 'GLOBAL' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Общий зачет
                    </button>
                </div>
            </div>

            <div className="p-12 lg:p-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <Trophy size={48} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-bold font-display uppercase tracking-wider text-gray-300 mb-3">Таблица пока пуста</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                    {leaderboardScope === 'RACE' 
                        ? 'Как только гонка в Майами завершится, и будут подсчитаны результаты, здесь появятся лучшие аналитики.' 
                        : 'Ни один из пользователей еще не получил баллы. Сделайте первый прогноз и возглавьте рейтинг!'}
                </p>
                {leaderboardScope === 'RACE' && (
                    <p className="text-xs text-purple-400/70 mt-6 bg-purple-900/10 px-4 py-2 rounded-lg border border-purple-500/20">
                        Таблица текущей гонки обновится на следующую после закрытия дедлайна.
                    </p>
                )}
            </div>
            </div>
        )}
      </div>
    </div>
  );
};
