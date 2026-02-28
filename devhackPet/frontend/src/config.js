export const ANIMATIONS_LIST = ['idle', 'sleep', 'joy_jump', 'hello', 'fall', 'sick', 'eat', 'toilet'];

export const loc = {
    ru: {
        settings: 'Настройки', theme: 'Тема', lang: 'Язык', city: 'Город', devMode: 'Режим разработчика',
        home: 'Домой', play: 'Игра', sleep: 'Сон', toilet: 'Туалет', heal: 'Вылечить', loading: 'Загрузка...',
        ar: 'AR', games: 'Игры', gamesModalTitle: 'Выбери игру', playGame: 'Играть', close: 'Закрыть',
        closeAd: 'Закрыть рекламу', shop: 'Магазин', buy: 'Купить', coins: 'монет',
        followLink: 'Перейти по ссылке (+50 монет)',
        quests: 'Задания', questsModalTitle: 'Задания', claim: 'Получить', completed: 'Выполнено',
        quest1: 'Покорми персонажа', quest2: 'Погладь персонажа', quest3: 'Вылечи персонажа',
        quest4: 'Поиграй в игры', quest5: 'Купи монеты',
        voice: 'Голос', voiceModalTitle: 'Голосовое общение', startRecord: 'Начать запись',
        stopRecord: 'Остановить', send: 'Отправить', restart: 'Заново', cancel: 'Отмена',
        recording: 'Идёт запись...', thinking: 'Думаю...', reasoning: 'Рассуждаю...',
        viewFull: 'Посмотреть всё',
        tl: 'Туалет', wheel: 'Колесо фортуны', wardrobe: 'Гардероб',
        changeClothes: 'Переодеться', characters: 'Персонажи', unlock: 'Получить', locked: 'Заблокировано'
    },
    en: {
        settings: 'Settings', theme: 'Theme', lang: 'Language', city: 'City', devMode: 'Developer Mode',
        home: 'Home', play: 'Play', sleep: 'Sleep', toilet: 'Toilet', heal: 'Heal', loading: 'Loading...',
        ar: 'AR', games: 'Games', gamesModalTitle: 'Choose game', playGame: 'Play', close: 'Close',
        closeAd: 'Close ad', shop: 'Shop', buy: 'Buy', coins: 'coins',
        followLink: 'Follow link (+50 coins)',
        quests: 'Quests', questsModalTitle: 'Quests', claim: 'Claim', completed: 'Completed',
        quest1: 'Feed the pet', quest2: 'Pet the pet', quest3: 'Heal the pet',
        quest4: 'Play games', quest5: 'Buy coins',
        voice: 'Voice', voiceModalTitle: 'Voice chat', startRecord: 'Start recording',
        stopRecord: 'Stop', send: 'Send', restart: 'Restart', cancel: 'Cancel',
        recording: 'Recording...', thinking: 'Thinking...', reasoning: 'Reasoning...',
        viewFull: 'View full',
        tl: 'Toilet', wheel: 'Wheel of Fortune', wardrobe: 'Wardrobe',
        changeClothes: 'Change clothes', characters: 'Characters', unlock: 'Unlock', locked: 'Locked'
    }
};

export const initialQuests = [
    { id: 1, titleKey: 'quest1', description: '10 раз', target: 10, reward: 50, progress: 0, completed: false, claimed: false },
    { id: 2, titleKey: 'quest2', description: '20 раз', target: 20, reward: 70, progress: 0, completed: false, claimed: false },
    { id: 3, titleKey: 'quest3', description: '10 раз', target: 10, reward: 150, progress: 0, completed: false, claimed: false },
    { id: 4, titleKey: 'quest4', description: '5 раз', target: 5, reward: 100, progress: 0, completed: false, claimed: false },
    { id: 5, titleKey: 'quest5', description: '1 раз', target: 1, reward: 200, progress: 0, completed: false, claimed: false },
];