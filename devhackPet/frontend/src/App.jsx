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
    const API_BASE = import.meta.env.VITE_GO_API_URL || '';
    const PYTHON_API_BASE = import.meta.env.VITE_PYTHON_API_URL || '';

    const [currentView, setCurrentView] = useState('home');
    const [character, setCharacter] = useState('twilight');
    const [isGreeting, setIsGreeting] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [petName, setPetName] = useState('Питомец'); 
    const [inputName, setInputName] = useState('');

    const [stats, setStats] = useState({ hng: 100, eng: 100, md: 100, tl: 50 });
    const [balance, setBalance] = useState(1000); 
    const tg = window.Telegram?.WebApp;
    const PLAYER_ID = tg?.initDataUnsafe?.user?.id?.toString() || "test_user_1";

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('pet_th') || 'drk'); 
    const [language, setLanguage] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [city, setCity] = useState(localStorage.getItem('pet_cty') || '');
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

    // Состояния для модалки рекламы (лечение)
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [adTimerFinished, setAdTimerFinished] = useState(false);
    const [adTimer, setAdTimer] = useState(null);

    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
        }
    }, [tg]);

    // Голосовое общение и AI
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

    const recordedChunksRef = useRef([]);

    const toiletInterval = useRef(null);
    const isDark = theme === 'drk';
    const l = loc[language];

    const colors = {
        text: isDark ? '#ffffff' : '#2c3e50',
        glassBg: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        modalBg: isDark ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.6)',
        border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        shadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(31, 38, 135, 0.15)',
        textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)'
    };

    const sendAction = (actionName, payload = "") => {
        fetch(`${API_BASE}/api/act`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uId: PLAYER_ID, act: actionName, pLd: payload })
        })
        .then(res => res.json())
        .then(data => { 
            if (data) {
                setStats({ hng: data.hng, eng: data.eng, md: data.md, tl: data.tl !== undefined ? data.tl : 50 });
                if (data.balance !== undefined) setBalance(data.balance);
                if (data.wth) setWeather(data.wth);

                if (data.tut === 1) setShowTutorial(true);
                else setShowTutorial(false);
                if (data.nm) setPetName(data.nm);
                if (data.unlocked) {
                    try { setUnlockedCharacters(JSON.parse(data.unlocked)); } 
                    catch (e) { console.error("Ошибка парсинга", e); }
                }
            }
        }).catch(err => console.log("Бэкенд недоступен", err));
    };

    useEffect(() => {
        const fetchStats = () => {
            fetch(`${API_BASE}/api/pet?uId=${PLAYER_ID}`).then(res => res.json())
            .then(data => { 
                if (data) {
                    setStats({ hng: data.hng, eng: data.eng, md: data.md, tl: data.tl !== undefined ? data.tl : 50 });
                    if (data.balance !== undefined) setBalance(data.balance);
                    if (data.wth) setWeather(data.wth);
                    
                    if (data.tut === 1) setShowTutorial(true);
                    else setShowTutorial(false);
                    if (data.nm) setPetName(data.nm);

                    if (data.unlocked) {
                        try { setUnlockedCharacters(JSON.parse(data.unlocked)); } 
                        catch (e) { console.error("Ошибка парсинга", e); }
                    }
                }
            }).catch(err => console.log("Бэкенд недоступен", err));
        };
        fetchStats();
        const syncLoop = setInterval(fetchStats, 3000);
        return () => clearInterval(syncLoop);
    }, []);

    // Функция получения реальной погоды по координатам
    const fetchRealWeather = async (lat, lon) => {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();
            if (data.current_weather) {
                const code = data.current_weather.weathercode;
                let wth = 'clr';
                if (code >= 51 && code <= 67) wth = 'rn';
                else if (code >= 71 && code <= 77) wth = 'snw';
                else if (code >= 80 && code <= 99) wth = 'rn';

                setWeather(wth);
                sendAction('set_wth', wth);
                console.log(`Погода обновлена: ${wth} (код ${code})`);
            }
        } catch (err) {
            console.error('Ошибка получения погоды:', err);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchRealWeather(latitude, longitude);
                },
                (error) => {
                    console.warn('Геолокация недоступна, используем определение по IP');
                    fetch('https://ipapi.co/json/')
                        .then(res => res.json())
                        .then(data => {
                            if (data.latitude && data.longitude) {
                                fetchRealWeather(data.latitude, data.longitude);
                            }
                        })
                        .catch(err => console.error('Ошибка определения по IP:', err));
                }
            );
        } else {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data.latitude && data.longitude) {
                        fetchRealWeather(data.latitude, data.longitude);
                    }
                })
                .catch(err => console.error('Ошибка определения по IP:', err));
        }
    };

    useEffect(() => {
        if (!isDevMode) {
            detectLocation();
        } else {
            if (!city) setCity('Moscow');
            fetchWeatherDev();
        }
    }, [isDevMode]);

    useEffect(() => {
        if (!isDevMode && city && city !== localStorage.getItem('pet_cty')) {
            fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
                .then(res => res.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const { latitude, longitude } = data.results[0];
                        fetchRealWeather(latitude, longitude);
                    }
                })
                .catch(err => console.error('Ошибка геокодирования:', err));
        }
    }, [city, isDevMode]);

    const fetchWeatherDev = () => {
        const weathers = ['clr', 'rn', 'snw'];
        const newWth = weathers[Math.floor(Math.random() * 3)];
        setWeather(newWth);
        sendAction('set_wth', newWth);
    };

    const fetchWeather = () => {
        if (isDevMode) fetchWeatherDev();
        else detectLocation();
    };

    // --- Функция для генерации AI фразы по тексту (для событий) ---
    const generateAIPhrase = async (prompt, context = "") => {
        try {
            const petStatsDesc = `Голод: ${Math.round(stats.hng)}%, Энергия: ${Math.round(stats.eng)}%, Настроение: ${Math.round(stats.md)}%, Туалет: ${Math.round(stats.tl)}%`;
            const response = await fetch(`${PYTHON_API_BASE}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    pet_name: petName,
                    pet_character: character,
                    pet_stats: petStatsDesc,
                    weather: weather,
                    context: context
                })
            });
            const data = await response.json();
            if (response.ok) {
                return data.answer;
            } else {
                console.error("AI generation error:", data);
                return null;
            }
        } catch (err) {
            console.error("Error generating AI phrase:", err);
            return null;
        }
    };

    // --- Автоматические реплики на события ---
    const lastEventRef = useRef({});
    const showAIBubble = async (text) => {
        setBubbleText(text);
        setShowBubble(true);
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
        bubbleTimer.current = setTimeout(() => {
            setShowBubble(false);
            setBubbleText('');
        }, 10000);
    };

    useEffect(() => {
        const checkEvents = async () => {
            if (stats.hng < 20 && !lastEventRef.current.hungry) {
                lastEventRef.current.hungry = true;
                const phrase = await generateAIPhrase("Я очень голоден! Покорми меня.", "Ты хочешь есть, сообщи об этом хозяину.");
                if (phrase) showAIBubble(phrase);
            } else if (stats.hng >= 20) {
                lastEventRef.current.hungry = false;
            }

            if (stats.eng < 20 && !lastEventRef.current.tired) {
                lastEventRef.current.tired = true;
                const phrase = await generateAIPhrase("Я устал, хочу спать.", "Ты хочешь спать, сообщи хозяину.");
                if (phrase) showAIBubble(phrase);
            } else if (stats.eng >= 20) {
                lastEventRef.current.tired = false;
            }

            if (stats.md < 20 && !lastEventRef.current.sad) {
                lastEventRef.current.sad = true;
                const phrase = await generateAIPhrase("Мне грустно, поиграй со мной.", "Тебе грустно, попроси поиграть.");
                if (phrase) showAIBubble(phrase);
            } else if (stats.md >= 20) {
                lastEventRef.current.sad = false;
            }

            if (stats.tl > 80 && !lastEventRef.current.toilet) {
                lastEventRef.current.toilet = true;
                const phrase = await generateAIPhrase("Мне нужно в туалет!", "Тебе нужно в туалет, сообщи хозяину.");
                if (phrase) showAIBubble(phrase);
            } else if (stats.tl <= 80) {
                lastEventRef.current.toilet = false;
            }
        };
        checkEvents();
    }, [stats]);

    const handleViewChange = async (view) => {
        setCurrentView(view);
        if (view === 'sleep') {
            const phrase = await generateAIPhrase("Я иду спать. Спокойной ночи!", "Ты идёшь спать, пожелай спокойной ночи.");
            if (phrase) showAIBubble(phrase);
        } else if (view === 'play') {
            const phrase = await generateAIPhrase("Ура, играть!", "Ты рад играть, вырази радость.");
            if (phrase) showAIBubble(phrase);
        } else if (view === 'home') {
            const phrase = await generateAIPhrase("Я вернулся домой.", "Ты вернулся домой, скажи что-нибудь приятное.");
            if (phrase) showAIBubble(phrase);
        } else if (view === 'toilet') {
            const phrase = await generateAIPhrase("Мне нужно в туалет.", "Ты идёшь в туалет, скажи что-нибудь.");
            if (phrase) showAIBubble(phrase);
        }
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

    // --- Функции для лечения через рекламу ---
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
        sendAction('heal');
        incrementQuestProgress(3);
    };

    const handleFollowLink = () => {
        window.open('https://example.com', '_blank');
        sendAction('balance_add', '50');
        setBalance(prev => prev + 50);
        closeAdModal();
    };

    // --- ГОЛОСОВЫЕ ФУНКЦИИ ---
    const startRecording = async () => {
        recordedChunksRef.current = [];
        setAudioUrl(null);
        setRecordedBlob(null);
        setResponseText('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Не удалось получить доступ к микрофону');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        recordedChunksRef.current = [];
        setAudioUrl(null);
        setRecordedBlob(null);
        setIsRecording(false);
        setIsVoiceModalOpen(false);
    };

    const restartRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        recordedChunksRef.current = [];
        setAudioUrl(null);
        setRecordedBlob(null);
        startRecording();
    };

    const sendRecording = async () => {
        if (!recordedBlob) return;
        setIsSending(true);
        setResponseText('');
        setIsThinking(true);
        setThinkingPhase(0);

        thinkingInterval.current = setInterval(() => {
            setThinkingPhase(prev => (prev + 1) % 2);
        }, 5000);

        const formData = new FormData();
        formData.append('file', recordedBlob, 'voice.webm');
        const petStatsDesc = `Голод: ${Math.round(stats.hng)}%, Энергия: ${Math.round(stats.eng)}%, Настроение: ${Math.round(stats.md)}%, Туалет: ${Math.round(stats.tl)}%`;
        formData.append('pet_name', petName);
        formData.append('pet_character', character);
        formData.append('pet_stats', petStatsDesc);
        formData.append('weather', weather);

        try {
            const res = await fetch(`${PYTHON_API_BASE}/api/voice/process`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setResponseText(data.answer);
                setBubbleText(data.answer);
                setShowBubble(true);
                if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
                bubbleTimer.current = setTimeout(() => {
                    setShowBubble(false);
                    setBubbleText('');
                }, 10000);
            } else {
                alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка соединения с сервером. Убедитесь, что сервер запущен');
        } finally {
            setIsSending(false);
            setIsThinking(false);
            clearInterval(thinkingInterval.current);
            setIsVoiceModalOpen(false);
            recordedChunksRef.current = [];
            setAudioUrl(null);
            setRecordedBlob(null);
        }
    };

    const closeBubble = () => {
        setShowBubble(false);
        setBubbleText('');
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };

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

            {petName && (
                <div style={{ 
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', 
                    zIndex: 100, background: colors.glassBg, backdropFilter: 'blur(10px)', 
                    border: `1px solid ${colors.border}`, padding: '8px 25px', borderRadius: '20px', 
                    color: colors.text, fontWeight: '900', fontSize: '18px', boxShadow: colors.shadow, 
                    letterSpacing: '2px', textTransform: 'uppercase' 
                }}>
                    {petName}
                </div>
            )}

            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, padding: '8px', borderRadius: '20px', boxShadow: colors.shadow }}>
                    <StatBar icon="🍖" value={Math.round(stats.hng)} color="#ff6b6b" onClick={() => sendAction('dev_minus_hng')} isInteractive={isDevMode} />
                    <StatBar icon="⚡" value={Math.round(stats.eng)} color="#feca57" onClick={() => sendAction('dev_minus_eng')} isInteractive={isDevMode} />
                    <StatBar icon="💖" value={Math.round(stats.md)} color="#ff9ff3" onClick={() => sendAction('dev_minus_md')} isInteractive={isDevMode} />
                    <StatBar icon="🚽" value={Math.round(stats.tl)} color="#1e90ff" onClick={() => sendAction('dev_minus_tl')} isInteractive={isDevMode} />
                </div>
                <div onClick={() => isDevMode ? sendAction('balance_add', '100') : setIsShopOpen(true)} style={{ background: colors.glassBg, backdropFilter: 'blur(10px)', border: `1px solid ${colors.border}`, padding: '8px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: colors.shadow, color: '#f1c40f', fontWeight: 'bold', fontSize: '16px' }}>
                    <span>💰</span><span>{balance}</span>
                </div>
                {!isDevMode && (
                    <button onClick={handleHealWithAd} style={{ background: '#2ecc71', border: 'none', color: 'white', padding: '6px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', boxShadow: colors.shadow }}>{l.heal}</button>
                )}
                {isDevMode && (
                    <button onClick={() => sendAction('heal')} style={{ background: '#2ecc71', border: 'none', color: 'white', padding: '6px 15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', boxShadow: colors.shadow }}>{l.heal}</button>
                )}
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
            {isVoiceModalOpen && (
                <VoiceModal 
                    onClose={cancelRecording} 
                    l={l} colors={colors} 
                    isRecording={isRecording} 
                    startRecording={startRecording} 
                    stopRecording={stopRecording} 
                    audioUrl={audioUrl} 
                    sendRecording={sendRecording} 
                    isSending={isSending} 
                    restartRecording={restartRecording} 
                    cancelRecording={cancelRecording} 
                />
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
                                padding: 0,
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

            {/* Модалка рекламы для лечения */}
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

            <div style={{ position: 'absolute', bottom: '2%', left: '5%', right: '5%', display: 'flex', justifyContent: 'space-around', background: colors.glassBg, border: `1px solid ${colors.border}`, padding: '15px', borderRadius: '30px', zIndex: 100, backdropFilter: 'blur(15px)', boxShadow: colors.shadow }}>
                <NavButton icon="🏠" label={l.home} isActive={currentView === 'home'} onClick={() => handleViewChange('home')} colors={colors} />
                <NavButton icon="🎾" label={l.play} isActive={currentView === 'play'} onClick={() => handleViewChange('play')} colors={colors} />
                <NavButton icon="🌙" label={l.sleep} isActive={currentView === 'sleep'} onClick={() => handleViewChange('sleep')} colors={colors} />
                <NavButton icon="🚽" label={l.toilet} isActive={currentView === 'toilet'} onClick={() => handleViewChange('toilet')} colors={colors} />
                {isDevMode && <NavButton icon="🛠" label="Dev" isActive={currentView === 'dev'} onClick={() => setCurrentView('dev')} colors={colors} />}
            </div>

            {isRescuing && <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(20,25,40,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px', animation: 'float 2s ease-in-out infinite' }}>🌙</div>
                <h2 style={{ textAlign: 'center', color: '#a29bfe' }}>Питомец истощен...</h2>
                <div style={{ width: '60%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginTop: '30px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#a29bfe', animation: 'fillBar 3s linear forwards' }} />
                </div>
            </div>}
            {showTutorial && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(20,25,40,0.85)', backdropFilter: 'blur(5px)', zIndex: 15000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', padding: '20px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                    
                    <div style={{ background: 'linear-gradient(135deg, #34495e, #2c3e50)', border: '2px solid #3498db', borderRadius: '25px', padding: '30px', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                        <h2 style={{ color: '#3498db', marginTop: 0, fontSize: '26px' }}>Добро пожаловать!</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', fontSize: '15px', marginBottom: '20px' }}>
                            <div>🍖 <b>Следи за статами:</b> Корми, играй и укладывай спать своего питомца.</div>
                            <div>💰 <b>Зарабатывай монеты:</b> Заходи в раздел игр и ГЕМБЛИ ПО СТРАШНОМУ!</div>
                            <div>👕 <b>Открывай скины:</b> Загляни в гардероб, чтобы загемблить новые уникальные 3D-костюмы.</div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '15px', border: '1px solid #7f8c8d' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ecf0f1' }}>Как назовешь питомца?</div>
                            <input 
                                type="text" 
                                value={inputName} 
                                onChange={(e) => setInputName(e.target.value)}
                                placeholder="Введи имя..."
                                maxLength={12}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #3498db', outline: 'none', fontSize: '16px', boxSizing: 'border-box', background: '#ecf0f1', color: '#2c3e50', fontWeight: 'bold', textAlign: 'center' }}
                            />
                        </div>

                        <button 
                            onClick={() => { 
                                const finalName = inputName.trim() || 'Питомец';
                                sendAction('set_nm', finalName);
                                setPetName(finalName);

                                setShowTutorial(false); 
                                sendAction('tut_dn'); 
                            }} 
                            style={{ marginTop: '25px', width: '100%', padding: '15px', background: 'linear-gradient(180deg, #2ecc71 0%, #27ae60 100%)', color: 'white', border: 'none', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 15px rgba(46, 204, 113, 0.4)' }}
                        >
                            Начать игру!
                        </button>
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