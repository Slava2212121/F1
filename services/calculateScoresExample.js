// Пример кода для Firebase Cloud Functions или вашего сервера (Node.js)
// Вызывайте эту функцию после завершения гонки.

import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Вспомогательная функция, которая должна определять ID команды в которой состоит гонщик.
 * В реальности это может быть запрос к коллекции 'drivers', или использование заранее подготовленного маппинга.
 */
function getDriverTeamId(driverId) {
    // ВАЖНО: Замените это на реальную проверку по вашей базе данных
    // Пример: return driversData[driverId].teamId;
    return "example_team_id"; 
}

/**
 * Рассчитывает баллы для всех прогнозов конкретной гонки
 * @param {string} raceId - ID прошедшей гонки
 * @param {Object} results - Фактические результаты гонки
 * @param {string} results.winnerDriverId - Кто победил
 * @param {string} results.dotdDriverId - Гонщик дня
 * @param {string} results.randomEventValue - Ответ на случайное событие ('yes'/'no')
 */
export async function calculateRacePredictions(raceId, results) {
    console.log(`Начинаем расчет турнира для гонки: ${raceId}`);

    const predictionsRef = db.collection('predictions').where('raceId', '==', raceId).where('isCalculated', '==', false);
    const snapshot = await predictionsRef.get();

    if (snapshot.empty) {
        console.log('Нет необработанных прогнозов для этой гонки.');
        return;
    }

    const batch = db.batch();

    snapshot.forEach(doc => {
        const p = doc.data();
        let points = 0;
        let hits = 0;

        // --- 1. Проверяем победителя гонки ---
        if (p.winnerDriverId === results.winnerDriverId) {
            // Точное попадание
            points += 10;
            hits += 1;
        } else if (getDriverTeamId(p.winnerDriverId) === getDriverTeamId(results.winnerDriverId)) {
            // Утешительный бонус: угадана только команда-победитель
            points += 3;
        }

        // --- 2. Проверяем гонщика дня ---
        if (p.dotdDriverId === results.dotdDriverId) {
            // Точное попадание
            points += 5;
            hits += 1;
        } else if (getDriverTeamId(p.dotdDriverId) === getDriverTeamId(results.dotdDriverId)) {
            // Утешительный бонус: угадана только команда DOTD
            points += 1;
        }

        // --- 3. Проверяем случайное событие ---
        if (p.randomEventValue === results.randomEventValue) {
            points += 8;
            hits += 1;
        }

        // --- 4. Проверяем Мастер-бонус ---
        // Бонус дается только если угаданы все три точных исхода
        if (hits === 3) {
            points += 5;
        }

        // Сохраняем результат в документе прогноза
        batch.update(doc.ref, {
            pointsEarned: points,
            isCalculated: true,
            calculatedAt: new Date()
        });

        // Также здесь можно инкрементировать общий счет пользователя в коллекции 'users'
    });

    await batch.commit();
    console.log(`Успешно начислены баллы для ${snapshot.size} участников.`);
}
