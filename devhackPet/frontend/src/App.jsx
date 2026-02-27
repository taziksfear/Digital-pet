import React, { useState, useEffect, useRef } from 'react';
import { useProgress, useGLTF } from '@react-three/drei';
import HomeView from './views/HomeView';
import PlayView from './views/PlayView';
import SleepView from './views/SleepView';
import ToiletView from './views/ToiletView';
import WardrobeView from './views/WardrobeView';
import DevView from './views/DevView';
import WheelOfFortune from './components/WheelOfFortune';
import WardrobeModal from './components/WardrobeModal';
import './index.css';

const ANIMATIONS_LIST = ['idle', 'sleep', 'joy_jump', 'hello', 'fall', 'sick', 'eat', 'toilet'];

// СЛОВАРЬ (Для перевода кнопок)
const loc = {
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
        tl: 'Туалет',
        wheel: 'Колесо фортуны',
        wardrobe: 'Гардероб',
        changeClothes: 'Переодеться',
        characters: 'Персонажи',
        unlock: 'Получить',
        locked: 'Заблокировано'
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
        tl: 'Toilet',
        wheel: 'Wheel of Fortune',
        wardrobe: 'Wardrobe',
        changeClothes: 'Change clothes',
        characters: 'Characters',
        unlock: 'Unlock',
        locked: 'Locked'
    }
};

// Начальные задания
const initialQuests = [
    { id: 1, titleKey: 'quest1', description: '10 раз', target: 10, reward: 50, progress: 0, completed: false, claimed: false },
    { id: 2, titleKey: 'quest2', description: '20 раз', target: 20, reward: 70, progress: 0, completed: false, claimed: false },
    { id: 3, titleKey: 'quest3', description: '10 раз', target: 10, reward: 150, progress: 0, completed: false, claimed: false },
    { id: 4, titleKey: 'quest4', description: '5 раз', target: 5, reward: 100, progress: 0, completed: false, claimed: false },
    { id: 5, titleKey: 'quest5', description: '1 раз', target: 1, reward: 200, progress: 0, completed: false, claimed: false },
];

function LoadingScreen({ l }) {
    const { active, progress } = useProgress();
    if (!active) return null;
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#2c3e50', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <h2>{l.loading}</h2>
            <div style={{ width: '60%', height: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden', marginTop: '20px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#3498db', transition: 'width 0.3s ease' }} />
            </div>
        </div>
    );
}

function WeatherOverlay({ weather }) {
    if (weather === 'clr') return null;
    const isRain = weather === 'rn';
    const overlayColor = isRain ? 'rgba(0, 30, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    const symbol = isRain ? '💧' : '❄️';
    const particles = Array.from({ length: 25 }).map((_, i) => ({
        id: i, left: `${Math.random() * 100}%`,
        animDuration: `${isRain ? 0.7 + Math.random() * 0.5 : 3 + Math.random() * 3}s`,
        animDelay: `${Math.random() * 2}s`, opacity: 0.4 + Math.random() * 0.5,
        fontSize: `${isRain ? 12 + Math.random() * 10 : 16 + Math.random() * 15}px`
    }));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: overlayColor, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
            {particles.map(p => (
                <div key={p.id} style={{ position: 'absolute', top: '-10%', left: p.left, opacity: p.opacity, fontSize: p.fontSize, animation: `fall ${p.animDuration} linear infinite`, animationDelay: p.animDelay }}>{symbol}</div>
            ))}
        </div>
    );
}

export default function App() {
    const [currentView, setCurrentView] = useState('home');
    const [character, setCharacter] = useState('twilight');
    const [isGreeting, setIsGreeting] = useState(true);
    
    // БАЗОВЫЕ СТАТЫ (с сервера)
    const [stats, setStats] = useState({ hng: 100, eng: 100, md: 100, tl: 50 });
    const [balance, setBalance] = useState(1000); // баланс с сервера
    const PLAYER_ID = "test_user_1";
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('pet_th') || 'drk'); 
    const [language, setLanguage] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [city, setCity] = useState(localStorage.getItem('pet_cty') || 'Moscow');
    const [weather, setWeather] = useState('clr'); 
    const [isRescuing, setIsRescuing] = useState(false);

    const [isGamesOpen, setIsGamesOpen] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [adTimerFinished, setAdTimerFinished] = useState(false);
    const [adTimer, setAdTimer] = useState(null);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isQuestsOpen, setIsQuestsOpen] = useState(false);
    const [quests, setQuests] = useState(initialQuests);
    const [claimingQuestId, setClaimingQuestId] = useState(null);

    const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
    const [isWheelOpen, setIsWheelOpen] = useState(false);
    const [unlockedCharacters, setUnlockedCharacters] = useState(['twilight']);

    // Голосовое общение
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingPhase, setThinkingPhase] = useState(0);
    const [showFullResponse, setShowFullResponse] = useState(false);
    const thinkingInterval = useRef(null);

    const [showBubble, setShowBubble] = useState(false);
    const [bubbleText, setBubbleText] = useState('');
    const bubbleTimer = useRef(null);

    const toiletInterval = useRef(null);

    const isDark = theme === 'drk';
    const colors = {
        text: isDark ? '#ffffff' : '#2c3e50', glassBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        modalBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)', border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 38, 135, 0.15)', textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
    };
    
    const l = loc[language];

    // ОТПРАВКА НА СЕРВЕР GO
    const sendAction = (actionName, payload = "") => {
        fetch('/api/act', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ uId: PLAYER_ID, act: actionName, pLd: payload })
        })
        .then(res => res.json())
        .then(data => { 
            if (data) {
                setStats({ 
                    hng: data.hng, 
                    eng: data.eng, 
                    md: data.md, 
                    tl: data.tl !== undefined ? data.tl : 50 
                });
                if (data.balance !== undefined) setBalance(data.balance);
            }
        })
        .catch(err => console.log("Бэкенд недоступен"));
    };

    // СИНХРОНИЗАЦИЯ С БД GO
    useEffect(() => {
        const fetchStats = () => {
            fetch(`/api/pet?uId=${PLAYER_ID}`)
                .then(res => res.json())
                .then(data => { 
                    if (data) {
                        setStats({ 
                            hng: data.hng, 
                            eng: data.eng, 
                            md: data.md, 
                            tl: data.tl !== undefined ? data.tl : 50 
                        });
                        if (data.balance !== undefined) setBalance(data.balance);
                    }
                })
                .catch(err => console.log("Бэкенд недоступен"));
        };
        fetchStats();
        const syncLoop = setInterval(fetchStats, 3000);
        return () => clearInterval(syncLoop);
    }, []);

    // Проверка на смерть и запуск спасения
    useEffect(() => {
        const isDead = Math.floor(stats.hng) <= 0 && Math.floor(stats.eng) <= 0 && Math.floor(stats.md) <= 0;
        if (isDead && !isRescuing) {
            setIsRescuing(true);
            setCurrentView('sleep');
            setTimeout(() => {
                sendAction('heal');
                setIsRescuing(false);
            }, 3000);
        }
    }, [stats, isRescuing]);

    useEffect(() => { 
        localStorage.setItem('pet_th', theme); 
        localStorage.setItem('pet_lng', language); 
        localStorage.setItem('pet_cty', city); 
    }, [theme, language, city]);

    useEffect(() => { 
        ANIMATIONS_LIST.forEach(anim => useGLTF.preload(`/models/${character}/${anim}.glb`)); 
    }, [character]);

    useEffect(() => { 
        const timer = setTimeout(() => setIsGreeting(false), 5000); 
        return () => clearTimeout(timer); 
    }, []);

    useEffect(() => { 
        if (!isDevMode && currentView === 'dev') setCurrentView('home'); 
    }, [isDevMode, currentView]);

    // Эффект для туалета: при входе запускаем интервал + отправляем toilet_start, при выходе отправляем idle
    useEffect(() => {
        if (currentView === 'toilet') {
            sendAction('toilet_start'); // устанавливаем состояние "toilet" на сервере
            toiletInterval.current = setInterval(() => {
                setStats(prev => {
                    const newTl = Math.min(100, (prev.tl || 50) + 10);
                    sendAction('toilet_update', newTl.toString());
                    return { ...prev, tl: newTl };
                });
            }, 1000);
        } else {
            if (toiletInterval.current) {
                clearInterval(toiletInterval.current);
                toiletInterval.current = null;
            }
            // При выходе из туалета возвращаем состояние в idle
            if (currentView !== 'toilet' && currentView !== 'sleep' && currentView !== 'dev') {
                sendAction('idle');
            }
        }
        return () => {
            if (toiletInterval.current) {
                clearInterval(toiletInterval.current);
                toiletInterval.current = null;
            }
        };
    }, [currentView]);

    const fetchWeather = () => { 
        const weathers = ['clr', 'rn', 'snw']; 
        setWeather(weathers[Math.floor(Math.random() * 3)]); 
    };

    const handleGameSelect = (gameId) => {
        setBalance(prev => prev + 10);
        sendAction('balance_add', '10');
        incrementQuestProgress(4);
        setIsGamesOpen(false);
    };

    const healPet = () => {
        sendAction('heal');
        incrementQuestProgress(3);
    };

    const handleHealWithAd = () => {
        setIsAdModalOpen(true);
        setAdTimerFinished(false);
        const timer = setTimeout(() => setAdTimerFinished(true), 15000);
        setAdTimer(timer);
    };

    const closeAdModal = () => {
        if (adTimer) clearTimeout(adTimer);
        setIsAdModalOpen(false);
        setAdTimerFinished(false);
        healPet();
    };

    const handleFollowLink = () => {
        window.open('https://shrinkme.io/st?api=9c62bfbee88432d1980098a96d7f39f290b12a2f&url=google.com', '_blank');
        setBalance(prev => prev + 50);
        sendAction('balance_add', '50');
        closeAdModal();
    };

    const handleBalanceClick = () => {
        if (isDevMode) {
            setBalance(prev => prev + 100);
            sendAction('balance_add', '100');
        } else setIsShopOpen(true);
    };

    const closeShop = () => setIsShopOpen(false);

    const handlePurchase = (amount) => {
        setBalance(prev => prev + amount);
        sendAction('balance_add', amount.toString());
        incrementQuestProgress(5);
        setIsShopOpen(false);
    };

    const incrementQuestProgress = (questId) => {
        setQuests(prev => prev.map(q => {
            if (q.id === questId && !q.completed && !q.claimed) {
                const newProgress = Math.min(q.progress + 1, q.target);
                const completed = newProgress >= q.target;
                return { ...q, progress: newProgress, completed };
            }
            return q;
        }));
    };

    const claimQuestReward = (questId) => {
        if (claimingQuestId === questId) return;
        setClaimingQuestId(questId);
        setQuests(prev => prev.map(q => {
            if (q.id === questId && q.completed && !q.claimed) {
                setBalance(b => {
                    const newBalance = b + q.reward;
                    sendAction('balance_add', q.reward.toString());
                    return newBalance;
                });
                return { ...q, claimed: true };
            }
            return q;
        }));
        setClaimingQuestId(null);
    };

    const handleFeed = () => incrementQuestProgress(1);
    const handlePet = () => incrementQuestProgress(2);

    const handleOpenWardrobe = () => setIsWardrobeOpen(true);
    const handleCloseWardrobe = () => setIsWardrobeOpen(false);

    const handleSelectCharacter = (charId) => {
        if (unlockedCharacters.includes(charId)) {
            setCharacter(charId);
            sendAction('set_char', charId);
            setIsWardrobeOpen(false);
        }
    };

    const handleUnlockRequest = (charId) => {
        setIsWheelOpen(true);
    };

    const handleWheelWin = (amount) => {
        setBalance(prev => prev + amount);
        sendAction('balance_add', amount.toString());
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoadingScreen l={l} />
            <WeatherOverlay weather={weather} />

            {currentView === 'home' && <HomeView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} onFeed={handleFeed} />}
            {currentView === 'play' && <PlayView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} onPet={handlePet} />}
            {currentView === 'sleep' && <SleepView character={character} stats={stats} setStats={setStats} sendAction={sendAction} />}
            {currentView === 'toilet' && <ToiletView character={character} stats={stats} setStats={setStats} sendAction={sendAction} />}
            {currentView === 'wardrobe' && <WardrobeView character={character} />}
            {currentView === 'dev' && isDevMode && <DevView character={character} />}
            
            {/* Вертикальный ряд иконок слева сверху */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setIsSettingsOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</button>
                
                {/* Иконка рулетки с бейджем PLAY */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setIsWheelOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎰</button>
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4757', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '3px 6px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>PLAY</span>
                </div>

                {/* Иконка гардероба */}
                <div style={{ position: 'relative' }}>
                    <button onClick={handleOpenWardrobe} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👕</button>
                </div>

                <button onClick={() => setIsGamesOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</button>
                <button onClick={() => setIsQuestsOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📋</button>
            </div>

            {/* Кнопка микрофона справа, по центру */}
            <div style={{ position: 'absolute', bottom: '20%', right: '20px', zIndex: 100 }}>
                <button onClick={() => setIsVoiceModalOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow, width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎤</button>
            </div>

            {/* Модалка настроек */}
            {isSettingsOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '320px', color: colors.text }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{l.settings}</h2>
                            <button onClick={() => setIsSettingsOpen(false)} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.theme}:</span><ToggleSwitch isOn={isDark} onToggle={() => setTheme(isDark ? 'lgt' : 'drk')} iconOn="🌙" iconOff="☀️" isDark={isDark} /></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.lang}:</span><ToggleSwitch isOn={language === 'en'} onToggle={() => setLanguage(language === 'ru' ? 'en' : 'ru')} iconOn="EN" iconOff="RU" isDark={isDark} /></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.city}:</span><input type="text" value={city} onChange={e => setCity(e.target.value)} onBlur={fetchWeather} style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', border: `1px solid ${colors.border}`, color: colors.text, padding: '8px', borderRadius: '12px', width: '100px', textAlign: 'center' }} /></div>
                        </div>
                        <hr style={{ margin: '25px 0', borderColor: colors.border }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)', padding: '10px 15px', borderRadius: '15px', border: `1px solid ${colors.border}` }}>
                            <span style={{ fontWeight: 'bold', color: '#ff7675' }}>🛠 {l.devMode}</span><ToggleSwitch isOn={isDevMode} onToggle={() => setIsDevMode(!isDevMode)} iconOn="ON" iconOff="OFF" isDark={isDark} />
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка игр (Gamepad) */}
            {isGamesOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '350px', color: colors.text, textShadow: colors.textShadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{l.gamesModalTitle}</h2>
                            <button onClick={() => setIsGamesOpen(false)} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div 
                                onClick={() => handleGameSelect('quiz')}
                                style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <span style={{ fontWeight: 'bold' }}>🧠 Викторина</span>
                                <span style={{ background: '#8ac6d1', padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '14px' }}>+10</span>
                            </div>
                            <div 
                                onClick={() => handleGameSelect('clicker')}
                                style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <span style={{ fontWeight: 'bold' }}>🖱️ Кликер</span>
                                <span style={{ background: '#8ac6d1', padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '14px' }}>+10</span>
                            </div>
                            <div 
                                onClick={() => handleGameSelect('memory')}
                                style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <span style={{ fontWeight: 'bold' }}>🧩 Мемори</span>
                                <span style={{ background: '#8ac6d1', padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '14px' }}>+10</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsGamesOpen(false)}
                            style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: '16px', color: colors.text, fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {l.close}
                        </button>
                    </div>
                </div>
            )}

            {/* Модалка рекламы (имитация) */}
            {isAdModalOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    
                    <div style={{ width: '80%', maxWidth: '600px', marginBottom: '20px' }}>
                        <div style={{ width: '100%', height: '8px', background: '#555', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    background: '#8ac6d1', 
                                    animation: 'shrink 15s linear forwards' 
                                }} 
                            />
                        </div>
                    </div>

                    <img 
                        src="https://i.imgur.com/XhXK1pF.png" 
                        alt="Ad" 
                        style={{ maxWidth: '90%', maxHeight: '70%', borderRadius: '20px' }} 
                    />
                    
                    {adTimerFinished && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px', width: '80%', maxWidth: '300px' }}>
                            <button 
                                onClick={handleFollowLink}
                                style={{
                                    background: '#ffaa00',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    padding: '12px 20px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                🔗 {l.followLink}
                            </button>
                            <button 
                                onClick={closeAdModal}
                                style={{
                                    background: '#8ac6d1',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    padding: '12px 20px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                ✖ {l.closeAd}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Модалка магазина (покупка монет) */}
            {isShopOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '650px', color: colors.text, textShadow: colors.textShadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{l.shop}</h2>
                            <button onClick={closeShop} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '15px', flexWrap: 'wrap' }}>
                            <div style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', width: '140px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <img src="/images/handful.jpg" alt="горсть монет" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '16px' }} />
                                <h3 style={{ margin: '10px 0 5px', fontSize: '16px' }}>Горсть</h3>
                                <p style={{ fontSize: '14px', margin: '0 0 10px' }}>100 {l.coins}</p>
                                <button onClick={() => handlePurchase(100)} style={{ background: '#8ac6d1', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>{l.buy}</button>
                            </div>

                            <div style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', width: '140px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <img src="/images/bag.jpg" alt="мешок монет" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '16px' }} />
                                <h3 style={{ margin: '10px 0 5px', fontSize: '16px' }}>Мешок</h3>
                                <p style={{ fontSize: '14px', margin: '0 0 10px' }}>500 {l.coins}</p>
                                <button onClick={() => handlePurchase(500)} style={{ background: '#8ac6d1', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>{l.buy}</button>
                            </div>

                            <div style={{ 
                                background: 'linear-gradient(145deg, #f6b93b, #e58e26)', 
                                border: '3px solid gold', 
                                borderRadius: '20px', 
                                padding: '20px 15px', 
                                width: '170px', 
                                textAlign: 'center', 
                                boxShadow: '0 0 20px gold',
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.05)'}>
                                
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ff4757', color: 'white', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                    🔥 BEST
                                </div>

                                <img src="/images/chest.jpg" alt="сундук монет" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '16px' }} />
                                <h3 style={{ margin: '10px 0 5px', fontSize: '18px', color: '#fff', textShadow: '2px 2px 0 #b85e00' }}>Сундук</h3>
                                <p style={{ fontSize: '16px', margin: '0 0 10px', color: '#fff', fontWeight: 'bold' }}>1000 {l.coins}</p>
                                <button onClick={() => handlePurchase(1000)} style={{ background: '#fff', border: 'none', color: '#e58e26', padding: '10px 15px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{l.buy}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка заданий */}
            {isQuestsOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '500px', color: colors.text, textShadow: colors.textShadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{l.questsModalTitle}</h2>
                            <button onClick={() => setIsQuestsOpen(false)} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {quests
                                .sort((a, b) => {
                                    if (!a.completed && b.completed) return -1;
                                    if (a.completed && !b.completed) return 1;
                                    if (a.completed && !a.claimed && b.completed && b.claimed) return -1;
                                    if (a.completed && a.claimed && b.completed && !b.claimed) return 1;
                                    return a.id - b.id;
                                })
                                .map(q => (
                                    <div key={q.id} style={{ 
                                        background: colors.glassBg, 
                                        border: `1px solid ${colors.border}`, 
                                        borderRadius: '16px', 
                                        padding: '15px',
                                        opacity: q.claimed ? 0.6 : 1
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '16px' }}>{l[q.titleKey]}</h3>
                                                <p style={{ margin: '5px 0', fontSize: '14px' }}>{q.description}</p>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                                                    {q.progress}/{q.target}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: '0 0 5px', fontSize: '16px', color: '#ffaa00' }}>+{q.reward}💰</p>
                                                {q.completed && !q.claimed && (
                                                    <button 
                                                        onClick={() => claimQuestReward(q.id)}
                                                        disabled={claimingQuestId === q.id}
                                                        style={{ 
                                                            background: '#8ac6d1', 
                                                            border: 'none', 
                                                            color: 'white', 
                                                            padding: '5px 12px', 
                                                            borderRadius: '20px', 
                                                            cursor: claimingQuestId === q.id ? 'wait' : 'pointer',
                                                            fontWeight: 'bold',
                                                            opacity: claimingQuestId === q.id ? 0.6 : 1
                                                        }}
                                                    >
                                                        {claimingQuestId === q.id ? '...' : l.claim}
                                                    </button>
                                                )}
                                                {q.claimed && (
                                                    <span style={{ color: '#888', fontSize: '14px' }}>✅ {l.completed}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка записи голоса */}
            {isVoiceModalOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '400px', color: colors.text }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>{l.voiceModalTitle}</h2>
                            <button onClick={cancelRecording} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                        </div>
                        {!audioUrl ? (
                            <div style={{ textAlign: 'center' }}>
                                {isRecording ? (
                                    <div>
                                        <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{l.recording}</p>
                                        <button onClick={stopRecording} style={{ margin: '10px', padding: '10px 20px', background: '#ff6b6b', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.stopRecord}</button>
                                    </div>
                                ) : (
                                    <button onClick={startRecording} style={{ padding: '10px 20px', background: '#8ac6d1', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.startRecord}</button>
                                )}
                            </div>
                        ) : (
                            <div>
                                <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '15px' }} />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button onClick={sendRecording} disabled={isSending} style={{ padding: '10px 20px', background: '#4caf50', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.send}</button>
                                    <button onClick={restartRecording} style={{ padding: '10px 20px', background: '#ffaa00', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.restart}</button>
                                    <button onClick={cancelRecording} style={{ padding: '10px 20px', background: '#aaa', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.cancel}</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Облачко с ответом питомца */}
            {(isThinking || showBubble) && (
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: '300px',
                    background: 'white',
                    color: '#333',
                    padding: '15px 20px',
                    borderRadius: '30px',
                    borderBottomLeftRadius: '5px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    zIndex: 1500,
                    animation: 'bubbleAppear 0.3s ease-out',
                    pointerEvents: 'auto'
                }}>
                    {!isThinking && (
                        <button 
                            onClick={closeBubble}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                color: '#999',
                                padding: '0',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ✖
                        </button>
                    )}
                    
                    {isThinking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontStyle: 'italic' }}>
                                {thinkingPhase === 0 ? l.thinking : l.reasoning}
                            </span>
                            <span className="dot-flashing"></span>
                        </div>
                    ) : (
                        <>
                            <p style={{ margin: 0 }}>{bubbleText}</p>
                            {bubbleText.length > 150 && (
                                <button onClick={() => setShowFullResponse(true)} style={{ background: 'none', border: 'none', color: '#8ac6d1', cursor: 'pointer', marginTop: '8px', fontWeight: 'bold' }}>{l.viewFull}</button>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Модалка полного ответа */}
            {showFullResponse && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '500px', color: colors.text }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2>{l.voiceModalTitle}</h2>
                            <button onClick={() => setShowFullResponse(false)} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>{bubbleText}</p>
                    </div>
                </div>
            )}

            {/* Модалка гардероба */}
            <WardrobeModal
                isOpen={isWardrobeOpen}
                onClose={handleCloseWardrobe}
                unlockedCharacters={unlockedCharacters}
                currentCharacter={character}
                onSelect={handleSelectCharacter}
                onUnlockRequest={handleUnlockRequest}
                l={l}
                colors={colors}
            />

            {/* Модалка колеса фортуны */}
            <WheelOfFortune
                isOpen={isWheelOpen}
                onClose={() => setIsWheelOpen(false)}
                balance={balance}
                setBalance={setBalance}
                spinCost={25}
                onWin={handleWheelWin}
                colors={colors}
                l={l}
            />

            {/* Нижняя панель с основными кнопками */}
            <div style={{ position: 'absolute', bottom: '2%', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-around', background: colors.glassBg, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '30px', zIndex: 100, backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', boxShadow: colors.shadow, transition: 'all 0.3s ease' }}>
                <NavButton icon="🏠" label={l.home} isActive={currentView === 'home'} onClick={() => setCurrentView('home')} colors={colors} />
                <NavButton icon="🎾" label={l.play} isActive={currentView === 'play'} onClick={() => setCurrentView('play')} colors={colors} />
                <NavButton icon="🌙" label={l.sleep} isActive={currentView === 'sleep'} onClick={() => setCurrentView('sleep')} colors={colors} />
                <NavButton icon="🚽" label={l.toilet} isActive={currentView === 'toilet'} onClick={() => setCurrentView('toilet')} colors={colors} />
                {isDevMode && <NavButton icon="🛠" label="Dev" isActive={currentView === 'dev'} onClick={() => setCurrentView('dev')} colors={colors} />}
            </div>

            {/* Панель статистики и баланса */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, padding: '15px', borderRadius: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: colors.shadow }}>
                {isDevMode && <div style={{ fontSize: '11px', textAlign: 'center', color: '#ff7675', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>🛠 Dev: Клик для -20%<br />Баланс +100</div>}

                <div 
                    onClick={handleBalanceClick}
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '5px', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        borderBottom: `1px solid ${colors.border}`, 
                        paddingBottom: '8px',
                        cursor: 'pointer'
                    }}
                >
                    <span>💰 Баланс:</span>
                    <span>{balance}</span>
                </div>

                <StatBar icon="🍖" value={Math.round(stats.hng)} color="#ff6b6b" onClick={() => sendAction('dev_minus_hng')} isInteractive={isDevMode} />
                <StatBar icon="⚡" value={Math.round(stats.eng)} color="#feca57" onClick={() => sendAction('dev_minus_eng')} isInteractive={isDevMode} />
                <StatBar icon="💖" value={Math.round(stats.md)} color="#ff9ff3" onClick={() => sendAction('dev_minus_md')} isInteractive={isDevMode} />
                <StatBar icon="🚽" value={Math.round(stats.tl)} color="#1e90ff" onClick={() => sendAction('dev_minus_tl')} isInteractive={isDevMode} />

                {isDevMode && (
                    <button onClick={() => sendAction('heal')} style={{marginTop: '10px', background: '#2ecc71', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'}}>{l.heal}</button>
                )}

                {!isDevMode && (
                    <button 
                        onClick={handleHealWithAd} 
                        style={{marginTop: '10px', background: 'rgba(255, 165, 0, 0.8)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        {l.heal}
                    </button>
                )}
            </div>

            {/* Оверлей спасения */}
            {isRescuing && (
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(20, 25, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000, display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', color: 'white',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>🌙</div>
                    <h2 style={{ textAlign: 'center', margin: '0 20px', color: '#a29bfe' }}>Питомец полностью истощен...</h2>
                    <p style={{ color: '#dfe6e9', marginTop: '10px' }}>Отправляем в глубокий сон для восстановления сил</p>
                    <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '30px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: '#a29bfe', animation: 'fillBar 3s linear' }} />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(360deg); }
                }
                @keyframes bubbleAppear {
                    from { opacity: 0; transform: translateX(-50%) scale(0.8); }
                    to { opacity: 1; transform: translateX(-50%) scale(1); }
                }
                @keyframes fillBar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                .dot-flashing {
                    position: relative;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #333;
                    animation: dot-flashing 1s infinite linear alternate;
                    animation-delay: 0.5s;
                }
                .dot-flashing::before, .dot-flashing::after {
                    content: '';
                    display: inline-block;
                    position: absolute;
                    top: 0;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: #333;
                    animation: dot-flashing 1s infinite alternate;
                }
                .dot-flashing::before {
                    left: -12px;
                    animation-delay: 0s;
                }
                .dot-flashing::after {
                    left: 12px;
                    animation-delay: 1s;
                }
                @keyframes dot-flashing {
                    0% { background-color: #333; }
                    50%, 100% { background-color: rgba(51, 51, 51, 0.2); }
                }
            `}</style>
        </div>
    );
}

function NavButton({ icon, label, isActive, onClick, colors }) {
    return (
        <button onClick={onClick} style={{ background: isActive ? colors.border : 'transparent', border: 'none', color: colors.text, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <span style={{ fontSize: '24px', textShadow: colors.textShadow }}>{icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textShadow: colors.textShadow }}>{label}</span>
        </button>
    );
}

function StatBar({ icon, value, color, onClick, isInteractive }) {
    const safeValue = Math.max(0, Math.min(100, value));
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: isInteractive ? 'pointer' : 'default' }} onClick={isInteractive ? onClick : undefined}>
            <span>{icon}</span>
            <div style={{ width: '100px', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(150,150,150,0.2)' }}>
                <div style={{ width: `${safeValue}%`, height: '100%', background: color, transition: 'width 0.3s ease', boxShadow: `0 0 10px ${color}` }} />
            </div>
            <span style={{ width: '35px', textAlign: 'right', fontWeight: 'bold' }}>{safeValue}%</span>
        </div>
    );
}

function ToggleSwitch({ isOn, onToggle, iconOn, iconOff, isDark }) {
    return (
        <div onClick={onToggle} style={{ width: '60px', height: '30px', background: isOn ? 'rgba(46, 204, 113, 0.7)' : (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'), borderRadius: '15px', position: 'relative', cursor: 'pointer', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', top: '2px', left: isOn ? '32px' : '2px', width: '24px', height: '24px', background: 'white', borderRadius: '50%', transition: 'left 0.3s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#333', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                {isOn ? iconOn : iconOff}
            </div>
        </div>
    );
}