import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, LiveUpdate, Driver } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models - Switching to standard Flash for better stability/quota management
const FAST_MODEL = 'gemini-flash-latest';

// Local Simulation Data to save Quota
const LOCAL_MESSAGES = [
    { message: "Пилот Ferrari улучшает время на втором секторе, демонстрируя отличный баланс.", flag: 'GREEN' },
    { message: "Механики Red Bull готовят свежий комплект шин Soft для квалификационной попытки.", flag: 'GREEN' },
    { message: "Команда Mercedes анализирует данные телеметрии, ищут оптимальные настройки подвески.", flag: 'GREEN' },
    { message: "Небольшая ошибка на торможении в 4-м повороте, пилот выехал за пределы трассы.", flag: 'YELLOW' },
    { message: "Williams проводит серию кругов с полными баками, проверяя износ резины.", flag: 'GREEN' },
    { message: "Радиообмен: 'Ветер усилился в 10-м повороте, будьте осторожны'.", flag: 'GREEN' },
    { message: "McLaren возвращается в боксы после короткой серии кругов.", flag: 'GREEN' },
    { message: "Льюис Хэмилтон ставит лучшее время сектора!", flag: 'GREEN' },
    { message: "Дым из задней части болида Haas! Возможные проблемы с двигателем.", flag: 'YELLOW' },
    { message: "Тесты прерваны красными флагами. Обломки на трассе.", flag: 'RED' }
];

// Fallback Data for when API quota is exceeded (429 Error)
const FALLBACK_NEWS: NewsItem[] = [
    {
        id: 'fallback-1',
        title: 'Феррари: Новый регламент 2026 нам подходит',
        summary: 'Руководитель Скудерии Фредерик Вассёр заявил, что команда "попала в точку" с концепцией активной аэродинамики.',
        timestamp: new Date().toISOString(),
        category: 'Breaking',
        imageUrl: 'https://media.formula1.com/image/upload/f_auto,c_limit,w_960,q_auto/f_auto/q_auto/content/dam/fom-website/manual/Misc/2026-Concept/2026-Concept-Front-34'
    },
    {
        id: 'fallback-2',
        title: 'Honda возвращается официально',
        summary: 'Aston Martin начинает новую эру с эксклюзивными моторами Honda. Алонсо доволен первыми тестами.',
        timestamp: new Date().toISOString(),
        category: 'Tech',
        imageUrl: 'https://media.formula1.com/image/upload/f_auto,c_limit,w_960,q_auto/f_auto/q_auto/content/dam/fom-website/manual/Misc/2026-Concept/2026-Concept-Rear-34'
    },
    {
        id: 'fallback-3',
        title: 'Краткий гид по сезону 2026',
        summary: 'Активная аэродинамика, уменьшенный вес и биотопливо. Все, что нужно знать о революции в Ф1.',
        timestamp: new Date().toISOString(),
        category: 'Interview',
        imageUrl: 'https://media.formula1.com/image/upload/content/dam/fom-website/2018-redesign-assets/Racehub%20header%20images%2016x9/Bahrain.jpg.transform/9col/image.jpg'
    },
    {
        id: 'fallback-4',
        title: 'Вольфф: "Антонелли напоминает мне молодого Льюиса"',
        summary: 'Тото Вольфф не скупится на похвалу своему новому протеже после первых дней тестов.',
        timestamp: new Date().toISOString(),
        category: 'Rumor',
        imageUrl: 'https://media.formula1.com/image/upload/f_auto,c_limit,w_960,q_auto/content/dam/fom-website/manual/Misc/2022/Audi/Audi-F1-Livery-Launch-04.jpg.transform/9col/image.jpg'
    }
];

const handleApiError = (error: any, context: string) => {
  console.warn(`[${context}] Handled API Issue. Using simulation.`);
};

/**
 * Generates simulated live race commentary based on a scenario.
 */
export const generateLiveCommentary = async (raceName: string, currentLap: number, totalLaps: number): Promise<LiveUpdate> => {
  // QUOTA SAVER: Use local simulation 70% of the time
  if (Math.random() > 0.3) {
      const template = LOCAL_MESSAGES[Math.floor(Math.random() * LOCAL_MESSAGES.length)];
      return {
          lap: currentLap,
          timestamp: Date.now(),
          message: template.message,
          flag: template.flag as any
      };
  }

  try {
    const prompt = `
      Date: Feb 16, 2026. F1 Commentary.
      Status: Lap ${currentLap}/${totalLaps}.
      Task: One SHORT dramatic sentence in Russian about 2026 active aero/testing.
      Output: JSON { "message": "text", "flag": "GREEN" }
    `;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            flag: { type: Type.STRING, enum: ['GREEN', 'YELLOW', 'RED', 'SC', 'VSC', 'CHEQUERED'] }
          },
          required: ['message', 'flag']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    return {
      lap: currentLap,
      timestamp: Date.now(),
      message: data.message || "Тесты продолжаются.",
      flag: data.flag || 'GREEN'
    };
  } catch (error) {
    handleApiError(error, 'LiveCommentary');
    const template = LOCAL_MESSAGES[Math.floor(Math.random() * LOCAL_MESSAGES.length)];
    return {
      lap: currentLap,
      timestamp: Date.now(),
      message: template.message,
      flag: 'GREEN'
    };
  }
};

/**
 * Generates latest F1 news headlines for Feb 2026.
 */
export const generateNews = async (): Promise<NewsItem[]> => {
  try {
    const prompt = `
      Date: Feb 2026.
      Task: 4 realistic F1 news headlines in Russian.
      Topics: Hamilton (Ferrari), Antonelli (Mercedes), Newey (Aston), Audi.
      Output: JSON Array [{title, summary, category}]
    `;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Breaking', 'Tech', 'Interview', 'Rumor'] }
            },
            required: ['title', 'summary', 'category']
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    
    if (!Array.isArray(data) || data.length === 0) {
        return FALLBACK_NEWS;
    }
    
    return data.map((item: any, index: number) => ({
      id: `news-${index}-${Date.now()}`,
      title: item.title,
      summary: item.summary,
      timestamp: new Date().toISOString(),
      category: item.category,
      imageUrl: `https://picsum.photos/800/600?random=${index + 50}` // Different random seed
    }));
  } catch (error) {
    handleApiError(error, 'News');
    return FALLBACK_NEWS;
  }
};

/**
 * Simulates driver analysis or fun fact.
 */
export const getDriverInsight = async (driverName: string): Promise<string> => {
    // Fallback insights - Updated for 2026 Grid
    const fallbacks: Record<string, string> = {
        'Lewis Hamilton': "Нацелен на восьмой титул с Ferrari.",
        'Max Verstappen': "Защищает титул в условиях нового регламента.",
        'Lando Norris': "Лидер McLaren, готовый бороться за победы.",
        'Andrea Kimi Antonelli': "Самый ожидаемый новичок десятилетия.",
        'Carlos Sainz': "Ведет Williams к новым вершинам.",
        'Nico Hülkenberg': "Опытный лидер заводской команды Audi.",
        'Sergio Perez': "Лидер нового американского проекта Cadillac.",
        'Gabriel Bortoleto': "Чемпион F2 дебютирует в Audi.",
        'Franco Colapinto': "Молодая надежда Alpine.",
        'Isack Hadjar': "Агрессивный стиль пилотирования в Red Bull.",
        'George Russell': "Готов стать лидером Mercedes после ухода Хэмилтона.",
        'Charles Leclerc': "Мечтает о титуле вместе с легендарной Скудерией.",
        'Oscar Piastri': "Один из самых перспективных молодых пилотов пелотона.",
        'Oliver Bearman': "Набирается опыта в Haas после яркого дебюта.",
        'Pierre Gasly': "Опытный боец, выжимающий максимум из Alpine.",
        'Liam Lawson': "Доказывает свою скорость в основной команде.",
        'Fernando Alonso': "Неувядающий ветеран, продолжающий творить чудеса.",
        'Esteban Ocon': "Новый вызов в Haas после многих лет в Alpine.",
        'Alexander Albon': "Надежный лидер Williams, стабильно приносящий очки.",
        'Lance Stroll': "Продолжает выступления за команду Aston Martin.",
        'Yuki Tsunoda': "Быстрый и эмоциональный гонщик из Японии.",
        'Jack Doohan': "Австралийский дебютант, готовый проявить себя в Alpine."
    };

    // Simple partial match
    for (const key of Object.keys(fallbacks)) {
        if (driverName.includes(key) || key.includes(driverName)) {
            return fallbacks[key];
        }
    }
    
    return "Гонщик готов к вызовам сезона 2026.";
}