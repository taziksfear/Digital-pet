import React, { useState, useEffect } from 'react';
import { useProgress, useGLTF } from '@react-three/drei';
import HomeView from './views/HomeView';
import PlayView from './views/PlayView';
import SleepView from './views/SleepView';
import WardrobeView from './views/WardrobeView';
import DevView from './views/DevView';
import './index.css';

const ANIMATIONS_LIST = ['idle', 'sleep', 'joy_jump', 'hello', 'fall', 'sick', 'eat'];

const loc = {
    ru: {
        settings: 'Настройки', theme: 'Тема', lang: 'Язык', city: 'Город', devMode: 'Режим разработчика',
        home: 'Домой', play: 'Игра', sleep: 'Сон', wardrobe: 'Шкаф', heal: 'Вылечить', loading: 'Загрузка...'
    },
    en: {
        settings: 'Settings', theme: 'Theme', lang: 'Language', city: 'City', devMode: 'Developer Mode',
        home: 'Home', play: 'Play', sleep: 'Sleep', wardrobe: 'Wardrobe', heal: 'Heal', loading: 'Loading...'
    }
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
        id: i,
        left: `${Math.random() * 100}%`,
        animDuration: `${isRain ? 0.7 + Math.random() * 0.5 : 3 + Math.random() * 3}s`,
        animDelay: `${Math.random() * 2}s`,
        opacity: 0.4 + Math.random() * 0.5,
        fontSize: `${isRain ? 12 + Math.random() * 10 : 16 + Math.random() * 15}px`
    }));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: overlayColor, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
            {particles.map(p => (
                <div key={p.id} style={{ position: 'absolute', top: '-10%', left: p.left, opacity: p.opacity, fontSize: p.fontSize, animation: `fall ${p.animDuration} linear infinite`, animationDelay: p.animDelay }}>
                    {symbol}
                </div>
            ))}
        </div>
    );
}

export default function App() {
    const [currentView, setCurrentView] = useState('home');
    const [character, setCharacter] = useState('twilight');
    const [isGreeting, setIsGreeting] = useState(true);

    const [stats, setStats] = useState({ hunger: 100, energy: 100, mood: 100 });
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('pet_th') || 'drk'); 
    const [language, setLanguage] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [city, setCity] = useState(localStorage.getItem('pet_cty') || 'Moscow');
    const [weather, setWeather] = useState('clr'); 

    const isDark = theme === 'drk';
    const colors = {
        text: isDark ? '#ffffff' : '#2c3e50',
        glassBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        modalBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)',
        border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 38, 135, 0.15)',
        textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
    };

    const l = loc[language];

    useEffect(() => {
        const gameLoop = setInterval(() => {
            setStats(prev => {
                const isSleeping = currentView === 'sleep';
                
                return {
                    hunger: Math.max(0, prev.hunger - 1),
                    mood: Math.max(0, prev.mood - 1),
                    energy: isSleeping ? Math.min(100, prev.energy + 5) : Math.max(0, prev.energy - 1)
                };
            });
        }, 3000); 

        return () => clearInterval(gameLoop);
    }, [currentView]);

    useEffect(() => { localStorage.setItem('pet_th', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('pet_lng', language); }, [language]);
    useEffect(() => { localStorage.setItem('pet_cty', city); }, [city]);

    useEffect(() => { ANIMATIONS_LIST.forEach(anim => useGLTF.preload(`/models/${character}/${anim}.glb`)); }, [character]);
    useEffect(() => { const timer = setTimeout(() => setIsGreeting(false), 5000); return () => clearTimeout(timer); }, []);
    useEffect(() => { if (!isDevMode && currentView === 'dev') setCurrentView('home'); }, [isDevMode, currentView]);

    const fetchWeather = () => {
        const weathers = ['clr', 'rn', 'snw'];
        setWeather(weathers[Math.floor(Math.random() * 3)]);
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoadingScreen l={l} />
            <WeatherOverlay weather={weather} />

            {currentView === 'home' && <HomeView character={character} stats={stats} setStats={setStats} isGreeting={isGreeting} />}
            {currentView === 'play' && <PlayView character={character} stats={stats} setStats={setStats} isGreeting={isGreeting} />}
            {currentView === 'sleep' && <SleepView character={character} />}
            {currentView === 'wardrobe' && <WardrobeView character={character} />}
            {currentView === 'dev' && isDevMode && <DevView character={character} />}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: colors.shadow }}
            >
                ⚙️
            </button>

            {isSettingsOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '320px', color: colors.text, textShadow: colors.textShadow, transition: 'all 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>{l.settings}</h2>
                            <button onClick={() => setIsSettingsOpen(false)} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✖</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{l.theme}:</span>
                                <ToggleSwitch isOn={isDark} onToggle={() => setTheme(isDark ? 'lgt' : 'drk')} iconOn="🌙" iconOff="☀️" isDark={isDark} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{l.lang}:</span>
                                <ToggleSwitch isOn={language === 'en'} onToggle={() => setLanguage(language === 'ru' ? 'en' : 'ru')} iconOn="EN" iconOff="RU" isDark={isDark} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{l.city}:</span>
                                <input type="text" value={city} onChange={e => setCity(e.target.value)} onBlur={fetchWeather} style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', border: `1px solid ${colors.border}`, color: colors.text, padding: '8px 12px', borderRadius: '12px', width: '100px', outline: 'none', textAlign: 'center', fontWeight: 'bold' }} />
                            </div>
                        </div>
                        
                        <hr style={{ margin: '25px 0', borderColor: colors.border }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)', padding: '10px 15px', borderRadius: '15px', border: `1px solid ${colors.border}` }}>
                            <span style={{ fontWeight: 'bold', color: '#ff7675', textShadow: 'none' }}>🛠 {l.devMode}</span>
                            <ToggleSwitch isOn={isDevMode} onToggle={() => setIsDevMode(!isDevMode)} iconOn="ON" iconOff="OFF" isDark={isDark} />
                        </div>
                    </div>
                </div>
            )}

            <div style={{ position: 'absolute', bottom: '2%', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-around', background: colors.glassBg, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '30px', zIndex: 100, backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', boxShadow: colors.shadow, transition: 'all 0.3s ease' }}>
                <NavButton icon="🏠" label={l.home} isActive={currentView === 'home'} onClick={() => setCurrentView('home')} colors={colors} />
                <NavButton icon="🎾" label={l.play} isActive={currentView === 'play'} onClick={() => setCurrentView('play')} colors={colors} />
                <NavButton icon="🌙" label={l.sleep} isActive={currentView === 'sleep'} onClick={() => setCurrentView('sleep')} colors={colors} />
                <NavButton icon="👕" label={l.wardrobe} isActive={currentView === 'wardrobe'} onClick={() => setCurrentView('wardrobe')} colors={colors} />
                {isDevMode && <NavButton icon="🛠" label="Dev" isActive={currentView === 'dev'} onClick={() => setCurrentView('dev')} colors={colors} />}
            </div>

            <div style={{ position: 'absolute', top: '20px', right: '20px', background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, color: colors.text, padding: '15px', borderRadius: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: colors.shadow }}>

                {isDevMode && <div style={{ fontSize: '11px', textAlign: 'center', color: '#ff7675', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>🛠 Dev: Клик для -20%</div>}

                <StatBar icon="🍖" value={stats.hunger} color="#ff6b6b" onClick={() => setStats(s => ({...s, hunger: Math.max(0, s.hunger - 20)}))} isInteractive={isDevMode} />
                <StatBar icon="⚡" value={stats.energy} color="#feca57" onClick={() => setStats(s => ({...s, energy: Math.max(0, s.energy - 20)}))} isInteractive={isDevMode} />
                <StatBar icon="💖" value={stats.mood} color="#ff9ff3" onClick={() => setStats(s => ({...s, mood: Math.max(0, s.mood - 20)}))} isInteractive={isDevMode} />

                {isDevMode && (
                    <button onClick={() => setStats({hunger: 100, energy: 100, mood: 100})} style={{marginTop: '10px', background: 'rgba(46, 204, 113, 0.8)', border: 'none', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'}}>{l.heal}</button>
                )}
            </div>
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
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: isInteractive ? 'pointer' : 'default' }} onClick={isInteractive ? onClick : undefined}>
            <span>{icon}</span>
            <div style={{ width: '100px', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(150,150,150,0.2)' }}>
                <div style={{ width: `${value}%`, height: '100%', background: color, transition: 'width 0.3s ease', boxShadow: `0 0 10px ${color}` }} />
            </div>
            <span style={{ width: '35px', textAlign: 'right', fontWeight: 'bold' }}>{value}%</span>
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