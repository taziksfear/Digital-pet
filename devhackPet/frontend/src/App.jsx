import React, { useState, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';

import HomeView from './views/HomeView';
import PlayView from './views/PlayView';
import SleepView from './views/SleepView';
import ToiletView from './views/ToiletView';
import WardrobeView from './views/WardrobeView';
import DevView from './views/DevView';
import SlotsView from './views/SlotsView';
import WheelOfFortune from './components/WheelOfFortune';
import WardrobeModal from './components/WardrobeModal';
import { LoadingScreen, WeatherOverlay, NavButton, StatBar } from './components/SharedUI';
import { SettingsModal, ShopModal, GamesModal, QuestsModal, VoiceModal } from './components/AppModals';
import { loc, initialQuests, ANIMATIONS_LIST } from './config';
import './index.css';

export default function App() {
    const [currentView, setCurrentView] = useState('home');
    const [character, setCharacter] = useState('twilight');
    const [isGreeting, setIsGreeting] = useState(true);

    const [stats, setStats] = useState({ hng: 100, eng: 100, md: 100, tl: 50 });
    const [balance, setBalance] = useState(1000); 
    const tg = window.Telegram?.WebApp;
    const PLAYER_ID = tg?.initDataUnsafe?.user?.id?.toString() || "test_user_1";

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('pet_th') || 'drk'); 
    const [language, setLanguage] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [city, setCity] = useState(localStorage.getItem('pet_cty') || 'Moscow');
    const [weather, setWeather] = useState('clr'); 
    const [isRescuing, setIsRescuing] = useState(false);

    const [isGamesOpen, setIsGamesOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isQuestsOpen, setIsQuestsOpen] = useState(false);
    const [quests, setQuests] = useState(initialQuests);
    const [claimingQuestId, setClaimingQuestId] = useState(null);
    const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
    const [isWheelOpen, setIsWheelOpen] = useState(false);
    const [unlockedCharacters, setUnlockedCharacters] = useState(['twilight']);

    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
        }
    }, [tg]);

    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const toiletInterval = useRef(null);
    const isDark = theme === 'drk';
    const l = loc[language];

    const colors = {
        text: isDark ? '#ffffff' : '#2c3e50', glassBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        modalBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)', border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 38, 135, 0.15)', textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
    };

    const sendAction = (actionName, payload = "") => {
        fetch('/api/act', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ uId: PLAYER_ID, act: actionName, pLd: payload })
        })
        .then(res => res.json())
        .then(data => { 
            if (data) {
                setStats({ hng: data.hng, eng: data.eng, md: data.md, tl: data.tl !== undefined ? data.tl : 50 });
                    if (data.balance !== undefined) setBalance(data.balance);
                    if (data.unlocked);

                    if (data.wth) setWeather(data.wth);
            }
        }).catch(err => console.log("Бэкенд недоступен"));
    };

    useEffect(() => {
        const fetchStats = () => {
            fetch(`/api/pet?uId=${PLAYER_ID}`).then(res => res.json())
                .then(data => { 
        if (data) {
            setStats({ hng: data.hng, eng: data.eng, md: data.md, tl: data.tl !== undefined ? data.tl : 50 });
            if (data.balance !== undefined) setBalance(data.balance);

            if (data.unlocked) {
                try {
                    setUnlockedCharacters(JSON.parse(data.unlocked));
                } catch (e) { console.error("Ошибка парсинга персонажей", e); }
            }
        }
    }).catch(err => console.log("Бэкенд недоступен"));
        };
        fetchStats();
        const syncLoop = setInterval(fetchStats, 3000);
        return () => clearInterval(syncLoop);
        
    }, []);

    useEffect(() => {
        localStorage.setItem('pet_unlocked', JSON.stringify(unlockedCharacters));
    }, [unlockedCharacters]);

    useEffect(() => {
        if (currentView === 'toilet') {
            sendAction('toilet_start');
            toiletInterval.current = setInterval(() => {
                setStats(prev => {
                    const newTl = Math.min(100, (prev.tl || 50) + 10);
                    sendAction('toilet_update', newTl.toString());
                    return { ...prev, tl: newTl };
                });
            }, 1000);
        } else {
            if (toiletInterval.current) clearInterval(toiletInterval.current);
            if (currentView !== 'toilet' && currentView !== 'sleep' && currentView !== 'dev' && currentView !== 'slots') sendAction('idle');
        }
        return () => clearInterval(toiletInterval.current);
    }, [currentView]);

    useEffect(() => {
        const isDead = Math.floor(stats.hng) <= 0 && Math.floor(stats.eng) <= 0 && Math.floor(stats.md) <= 0;
        if (isDead && !isRescuing) {
            setIsRescuing(true); setCurrentView('sleep');
            setTimeout(() => { sendAction('heal'); setIsRescuing(false); }, 3000);
        }
    }, [stats, isRescuing]);

    useEffect(() => { localStorage.setItem('pet_th', theme); localStorage.setItem('pet_lng', language); localStorage.setItem('pet_cty', city); }, [theme, language, city]);
    useEffect(() => { ANIMATIONS_LIST.forEach(anim => useGLTF.preload(`/models/${character}/${anim}.glb`)); }, [character]);
    useEffect(() => { const timer = setTimeout(() => setIsGreeting(false), 5000); return () => clearTimeout(timer); }, []);

    const fetchWeather = () => {
        const weathers = ['clr', 'rn', 'snw'];
        const newWth = weathers[Math.floor(Math.random() * 3)];
        setWeather(newWth);
        sendAction('set_wth', newWth);
    };
    const handleGameSelect = () => { setBalance(p => p + 10); sendAction('balance_add', '10'); incrementQuestProgress(4); setIsGamesOpen(false); };
    const handlePurchase = (amount) => { setBalance(p => p + amount); sendAction('balance_add', amount.toString()); incrementQuestProgress(5); setIsShopOpen(false); };
    const incrementQuestProgress = (id) => setQuests(prev => prev.map(q => (q.id === id && !q.completed && !q.claimed) ? { ...q, progress: Math.min(q.progress + 1, q.target), completed: Math.min(q.progress + 1, q.target) >= q.target } : q));
    const claimQuestReward = (questId) => {
        setClaimingQuestId(questId);
        setQuests(prev => prev.map(q => {
            if (q.id === questId && q.completed && !q.claimed) { setBalance(b => b + q.reward); sendAction('balance_add', q.reward.toString()); return { ...q, claimed: true }; }
            return q;
        }));
        setClaimingQuestId(null);
    };

    const startRecording = () => setIsRecording(true);
    const stopRecording = () => { setIsRecording(false); setAudioUrl('test'); };
    const cancelRecording = () => { setIsVoiceModalOpen(false); setAudioUrl(null); setIsRecording(false); };
    const restartRecording = () => setAudioUrl(null);
    const sendRecording = () => { setIsSending(true); setTimeout(() => { setIsSending(false); cancelRecording(); }, 1000); };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LoadingScreen l={l} />
            <WeatherOverlay weather={weather} />

            {currentView === 'home' && <HomeView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} onFeed={() => incrementQuestProgress(1)} />}
            {currentView === 'play' && <PlayView character={character} stats={stats} setStats={setStats} sendAction={sendAction} isGreeting={isGreeting} onPet={() => incrementQuestProgress(2)} />}
            {currentView === 'sleep' && <SleepView character={character} stats={stats} setStats={setStats} sendAction={sendAction} />}
            {currentView === 'toilet' && <ToiletView character={character} stats={stats} setStats={setStats} sendAction={sendAction} />}
            {currentView === 'wardrobe' && <WardrobeView character={character} />}
            {currentView === 'slots' && <SlotsView balance={balance} setBalance={setBalance} sendAction={sendAction} />}
            {currentView === 'dev' && isDevMode && <DevView character={character} />}

            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setIsSettingsOpen(true)} style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: '20px', borderRadius: '15px', width: '45px', height: '45px', boxShadow: colors.shadow, backdropFilter: 'blur(10px)' }}>⚙️</button>
                <button onClick={() => setIsWardrobeOpen(true)} style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: '20px', borderRadius: '15px', width: '45px', height: '45px', boxShadow: colors.shadow, backdropFilter: 'blur(10px)' }}>👕</button>
                <button onClick={() => setIsGamesOpen(true)} style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: '20px', borderRadius: '15px', width: '45px', height: '45px', boxShadow: colors.shadow, backdropFilter: 'blur(10px)' }}>🎮</button>
                <button onClick={() => setIsQuestsOpen(true)} style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: '20px', borderRadius: '15px', width: '45px', height: '45px', boxShadow: colors.shadow, backdropFilter: 'blur(10px)' }}>📋</button>
            </div>

            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div onClick={() => isDevMode ? sendAction('balance_add', '100') : setIsShopOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, padding: '8px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: colors.shadow, color: '#f1c40f', fontWeight: 'bold', fontSize: '16px' }}>
                    <span>💰</span><span>{balance}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, padding: '8px', borderRadius: '20px', boxShadow: colors.shadow }}>
                    <StatBar icon="🍖" value={Math.round(stats.hng)} color="#ff6b6b" onClick={() => sendAction('dev_minus_hng')} isInteractive={isDevMode} />
                    <StatBar icon="⚡" value={Math.round(stats.eng)} color="#feca57" onClick={() => sendAction('dev_minus_eng')} isInteractive={isDevMode} />
                    <StatBar icon="💖" value={Math.round(stats.md)} color="#ff9ff3" onClick={() => sendAction('dev_minus_md')} isInteractive={isDevMode} />
                    <StatBar icon="🚽" value={Math.round(stats.tl)} color="#1e90ff" onClick={() => sendAction('dev_minus_tl')} isInteractive={isDevMode} />
                </div>
                <button onClick={() => { sendAction('heal'); incrementQuestProgress(3); }} style={{ background: '#2ecc71', border: 'none', color: 'white', padding: '6px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', boxShadow: colors.shadow }}>{l.heal}</button>
            </div>

            <button onClick={() => setIsVoiceModalOpen(true)} style={{ position: 'absolute', bottom: '20%', right: '20px', zIndex: 100, background: colors.glassBg, border: `1px solid ${colors.border}`, color: colors.text, fontSize: '24px', borderRadius: '50%', width: '50px', height: '50px', boxShadow: colors.shadow }}>🎤</button>

            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} l={l} colors={colors} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} city={city} setCity={setCity} fetchWeather={fetchWeather} isDark={isDark} isDevMode={isDevMode} setIsDevMode={(val) => {
                if (!val) { setIsDevMode(false); return; }
                const pass = prompt("Введите пароль разработчика:");
                const correctPass = import.meta.env.VITE_DEV_PASSWORD || "1235";
                if (pass === correctPass) setIsDevMode(true);
                else if (pass !== null) alert("Неверный пароль!");
            }} />}
            {isShopOpen && <ShopModal onClose={() => setIsShopOpen(false)} l={l} colors={colors} handlePurchase={handlePurchase} />}
            {isQuestsOpen && <QuestsModal onClose={() => setIsQuestsOpen(false)} l={l} colors={colors} quests={quests} claimQuestReward={claimQuestReward} claimingQuestId={claimingQuestId} />}
            {isVoiceModalOpen && <VoiceModal onClose={cancelRecording} l={l} colors={colors} isRecording={isRecording} startRecording={startRecording} stopRecording={stopRecording} audioUrl={audioUrl} sendRecording={sendRecording} isSending={isSending} restartRecording={restartRecording} cancelRecording={cancelRecording} />}

            {isGamesOpen && <GamesModal onClose={() => setIsGamesOpen(false)} l={l} colors={colors} handleGameSelect={handleGameSelect} openSlots={() => { setCurrentView('slots'); setIsGamesOpen(false); }} />}

            <WardrobeModal isOpen={isWardrobeOpen} onClose={() => setIsWardrobeOpen(false)} unlockedCharacters={unlockedCharacters} currentCharacter={character} onSelect={(id) => { setCharacter(id); sendAction('set_char', id); setIsWardrobeOpen(false); }} onUnlockRequest={() => { setIsWheelOpen(true); setIsWardrobeOpen(false); }} l={l} colors={colors} />

            <WheelOfFortune isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} balance={balance} setBalance={setBalance} sendAction={sendAction} unlockedCharacters={unlockedCharacters} onUnlock={(charId) => { 
                setUnlockedCharacters(prev => {
                    const newList = [...prev, charId];
                    sendAction('unlock_char', JSON.stringify(newList));
                    return newList;
                });
                sendAction('set_char', charId); 
                setCharacter(charId); 
            }} colors={colors} l={l} 
            />

            <div style={{ position: 'absolute', bottom: '2%', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-around', background: colors.glassBg, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '30px', zIndex: 100, backdropFilter: 'blur(15px)', boxShadow: colors.shadow }}>
                <NavButton icon="🏠" label={l.home} isActive={currentView === 'home'} onClick={() => setCurrentView('home')} colors={colors} />
                <NavButton icon="🎾" label={l.play} isActive={currentView === 'play'} onClick={() => setCurrentView('play')} colors={colors} />
                <NavButton icon="🌙" label={l.sleep} isActive={currentView === 'sleep'} onClick={() => setCurrentView('sleep')} colors={colors} />
                <NavButton icon="🚽" label={l.toilet} isActive={currentView === 'toilet'} onClick={() => setCurrentView('toilet')} colors={colors} />
                {isDevMode && <NavButton icon="🛠" label="Dev" isActive={currentView === 'dev'} onClick={() => setCurrentView('dev')} colors={colors} />}
            </div>

            {isRescuing && <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(20,25,40,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>🌙</div>
                <h2 style={{ textAlign: 'center', color: '#a29bfe' }}>Питомец истощен...</h2>
                <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '30px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#a29bfe', animation: 'fillBar 3s linear forwards' }} />
                </div>
            </div>}
        </div>
    );
}