import React, { useState, useEffect } from 'react';
import { useProgress, useGLTF } from '@react-three/drei';
import HomeView from './views/HomeView';
import PlayView from './views/PlayView';
import SleepView from './views/SleepView';
import WardrobeView from './views/WardrobeView';
import DevView from './views/DevView';
import './index.css';

const ANIMATIONS_LIST = ['idle', 'sleep', 'joy_jump', 'hello', 'fall', 'sick', 'eat'];

// СЛОВАРЬ (Для перевода кнопок)
const loc = {
    ru: { settings: 'Настройки', theme: 'Тема', lang: 'Язык', city: 'Город', devMode: 'Режим разработчика', home: 'Домой', play: 'Игра', sleep: 'Сон', wardrobe: 'Шкаф', heal: 'Вылечить', loading: 'Загрузка...' },
    en: { settings: 'Settings', theme: 'Theme', lang: 'Language', city: 'City', devMode: 'Developer Mode', home: 'Home', play: 'Play', sleep: 'Sleep', wardrobe: 'Wardrobe', heal: 'Heal', loading: 'Loading...' }
};

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
    
    // БАЗОВЫЕ СТАТЫ (Используем ключи сервера: hng, eng, md)
    const [stats, setStats] = useState({ hng: 100, eng: 100, md: 100 });
    const PLAYER_ID = "test_user_1"; // Временный ID для тестов БД
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('pet_th') || 'drk'); 
    const [language, setLanguage] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [city, setCity] = useState(localStorage.getItem('pet_cty') || 'Moscow');
    const [weather, setWeather] = useState('clr'); 
    const [isRescuing, setIsRescuing] = useState(false);

    const isDark = theme === 'drk';
    const colors = {
        text: isDark ? '#ffffff' : '#2c3e50', glassBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        modalBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)', border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 38, 135, 0.15)', textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
    };
    
    // ТА САМАЯ ПЕРЕМЕННАЯ, ИЗ-ЗА КОТОРОЙ БЫЛА ОШИБКА:
    const l = loc[language];

    // ОТПРАВКА НА СЕРВЕР GO
    const sendAction = (actionName, payload = "") => {
        fetch('/api/act', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ uId: PLAYER_ID, act: actionName, pLd: payload })
        })
        .then(res => res.json())
        .then(data => { if (data && data.hng !== undefined) setStats(data); })
        .catch(err => console.log("Бэкенд недоступен"));
    };

    // СИНХРОНИЗАЦИЯ С БД GO
    useEffect(() => {
        const fetchStats = () => {
            fetch(`/api/pet?uId=${PLAYER_ID}`)
                .then(res => res.json())
                .then(data => { if (data && data.hng !== undefined) setStats(data); })
                .catch(err => console.log("Бэкенд недоступен"));
        };
        fetchStats();
        const syncLoop = setInterval(fetchStats, 3000);
        return () => clearInterval(syncLoop);
    }, []);

    useEffect(() => {
        // Проверяем, упали ли ВСЕ статы до 0 (используем Math.floor на случай дробных чисел от Go)
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

    useEffect(() => { localStorage.setItem('pet_th', theme); localStorage.setItem('pet_lng', language); localStorage.setItem('pet_cty', city); }, [theme, language, city]);
    useEffect(() => { ANIMATIONS_LIST.forEach(anim => useGLTF.preload(`/models/${character}/${anim}.glb`)); }, [character]);
    useEffect(() => { const timer = setTimeout(() => setIsGreeting(false), 5000); return () => clearTimeout(timer); }, []);
    useEffect(() => { if (!isDevMode && currentView === 'dev') setCurrentView('home'); }, [isDevMode, currentView]);

    const fetchWeather = () => { const weathers = ['clr', 'rn', 'snw']; setWeather(weathers[Math.floor(Math.random() * 3)]); };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoadingScreen l={l} />
            <WeatherOverlay weather={weather} />

            {/* РЕНДЕР КОМНАТ */}
            {currentView === 'home' && <HomeView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} />}
            {currentView === 'play' && <PlayView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} />}
            {currentView === 'sleep' && <SleepView character={character} stats={stats} setStats={setStats} sendAction={sendAction} />}
            {currentView === 'wardrobe' && <WardrobeView character={character} />}
            {currentView === 'dev' && isDevMode && <DevView character={character} />}

            {/* КНОПКА НАСТРОЕК */}
            <button onClick={() => setIsSettingsOpen(true)} style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow }}>⚙️</button>

            {/* МОДАЛКА НАСТРОЕК */}
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

            {/* НИЖНЕЕ МЕНЮ */}
            <div style={{ position: 'absolute', bottom: '2%', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-around', background: colors.glassBg, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '30px', zIndex: 100, backdropFilter: 'blur(15px)', boxShadow: colors.shadow }}>
                <NavButton icon="🏠" label={l.home} isActive={currentView === 'home'} onClick={() => setCurrentView('home')} colors={colors} />
                <NavButton icon="🎾" label={l.play} isActive={currentView === 'play'} onClick={() => setCurrentView('play')} colors={colors} />
                <NavButton icon="🌙" label={l.sleep} isActive={currentView === 'sleep'} onClick={() => setCurrentView('sleep')} colors={colors} />
                <NavButton icon="👕" label={l.wardrobe} isActive={currentView === 'wardrobe'} onClick={() => setCurrentView('wardrobe')} colors={colors} />
                {isDevMode && <NavButton icon="🛠" label="Dev" isActive={currentView === 'dev'} onClick={() => setCurrentView('dev')} colors={colors} />}
            </div>

            {/* ПАНЕЛЬ СТАТОВ DEV MODE */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, padding: '15px', borderRadius: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: colors.shadow }}>
                {isDevMode && <div style={{ fontSize: '11px', textAlign: 'center', color: '#ff7675', marginBottom: '5px', fontWeight: 'bold' }}>🛠 Dev Mode</div>}
                
                {/* ОТОБРАЖАЕМ СТАТЫ С СЕРВЕРА (hng, eng, md) */}
                <StatBar icon="🍖" value={Math.round(stats.hng)} color="#ff6b6b" onClick={() => sendAction('dev_minus_hng')} isInteractive={isDevMode} />
                <StatBar icon="⚡" value={Math.round(stats.eng)} color="#feca57" onClick={() => sendAction('dev_minus_eng')} isInteractive={isDevMode} />
                <StatBar icon="💖" value={Math.round(stats.md)} color="#ff9ff3" onClick={() => sendAction('dev_minus_md')} isInteractive={isDevMode} />
                
                {isDevMode && <button onClick={() => sendAction('heal')} style={{marginTop: '10px', background: '#2ecc71', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'}}>{l.heal}</button>}
            </div>

            {isRescuing && (
                <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', 
                    background: 'rgba(20, 25, 40, 0.95)', // Темно-синий ночной фон
                    backdropFilter: 'blur(10px)',
                    zIndex: 10000, display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', color: 'white',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>
                        🌙
                    </div>
                    <h2 style={{ textAlign: 'center', margin: '0 20px', color: '#a29bfe' }}>
                        Питомец полностью истощен...
                    </h2>
                    <p style={{ color: '#dfe6e9', marginTop: '10px' }}>
                        Отправляем в глубокий сон для восстановления сил
                    </p>
                    
                    {/* Анимированная полоска загрузки */}
                    <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '30px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: '#a29bfe', animation: 'fillBar 3s linear' }} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ UI
function NavButton({ icon, label, isActive, onClick, colors }) {
    return (
        <button onClick={onClick} style={{ background: isActive ? colors.border : 'transparent', border: 'none', color: colors.text, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer' }}>
            <span style={{ fontSize: '24px', textShadow: colors.textShadow }}>{icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textShadow: colors.textShadow }}>{label}</span>
        </button>
    );
}

function StatBar({ icon, value, color, onClick, isInteractive }) {
    // Чтобы полоска не уезжала за пределы 100% или меньше 0%
    const safeValue = Math.max(0, Math.min(100, value));
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: isInteractive ? 'pointer' : 'default' }} onClick={isInteractive ? onClick : undefined}>
            <span>{icon}</span>
            <div style={{ width: '100px', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${safeValue}%`, height: '100%', background: color, transition: 'width 0.3s ease', boxShadow: `0 0 10px ${color}` }} />
            </div>
            <span style={{ width: '35px', textAlign: 'right', fontWeight: 'bold' }}>{safeValue}%</span>
        </div>
    );
}

function ToggleSwitch({ isOn, onToggle, iconOn, iconOff, isDark }) {
    return (
        <div onClick={onToggle} style={{ width: '60px', height: '30px', background: isOn ? 'rgba(46, 204, 113, 0.7)' : (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'), borderRadius: '15px', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: '2px', left: isOn ? '32px' : '2px', width: '24px', height: '24px', background: 'white', borderRadius: '50%', transition: 'left 0.3s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#333', fontWeight: 'bold' }}>{isOn ? iconOn : iconOff}</div>
        </div>
    );
}