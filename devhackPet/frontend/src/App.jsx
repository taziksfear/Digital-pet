import React, { useState, useEffect, useRef } from 'react';
import PRnd from './classes/PetRenderer'; // Убедись, что файл называется PetRenderer.js
import BottomDock from './components/BottomDock';
import StatsOverlay from './components/StatsOverlay';
import Tutorial from './components/Tutorial';
import WeatherOverlay from './components/WeatherOverlay';
import NameModal from './components/NameModal';
import { getPSt, sndAct } from './utils/api';
import { loc } from './loc';

import HomeView from './views/HomeView';
import PlayView from './views/PlayView';
import SleepView from './views/SleepView';
import WardrobeView from './views/WardrobeView';
import SettingsView from './views/SettingsView';

import './index.css';

export default function App() {
    // === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
    const [stats, setStats] = useState({ hunger: 50, energy: 80, mood: 10 });
    const [character, setCharacter] = useState('pig'); 
    const [costume, setCostume] = useState('none');
    const [petName, setPetName] = useState(''); 
    
    // === РОУТИНГ ===
    const [currentView, setCurrentView] = useState('home');
    
    // === БРОНЕБОЙНАЯ ЗАЩИТА НАСТРОЕК ===
    // Если в localStorage попал мусор (undefined, null), жестко ставим дефолты!
    const savedTheme = localStorage.getItem('pet_theme');
    const savedLang = localStorage.getItem('pet_lang');
    const savedCity = localStorage.getItem('pet_city');

    const [theme, setTheme] = useState((savedTheme === 'lgt' || savedTheme === 'drk') ? savedTheme : 'lgt'); 
    const [lang, setLang] = useState((savedLang === 'ru' || savedLang === 'en') ? savedLang : 'ru'); 
    const [city, setCity] = useState((savedCity && savedCity !== 'undefined') ? savedCity : 'Moscow'); 
    const [weather, setWeather] = useState('clr'); 
    
    const [isNameModalVisible, setNameModalVisible] = useState(false); 
    const [toastMessage, setToastMessage] = useState('');
    
    // === ТУТОРИАЛ ===
    const [tutStep, setTutStep] = useState(1); 
    const [tutPaused, setTutPaused] = useState(false); 

    // Безопасное получение словаря (защита от белого экрана)
    const text = loc[lang] || loc['ru']; 

    const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };
    const nextTutStep = (nextStep) => { setTutPaused(true); setTimeout(() => { setTutStep(nextStep); setTutPaused(false); }, 2500); };

    const syncWithServer = async () => {
        const data = await getPSt();
        if (data) {
            setStats({ hunger: data.hunger, energy: data.energy, mood: data.mood });
            if (data.name) setPetName(data.name);
            if (data.character) setCharacter(data.character);
            if (data.costume) setCostume(data.costume);
            if (data.tutorial === 0) setTutStep(0);
        }
    };

    const handleNavigation = (newView) => {
        if (tutPaused) return;
        setCurrentView(newView);

        let action = null;
        if (newView === 'home') action = 'feed';
        if (newView === 'play') action = 'play';
        if (newView === 'sleep') action = 'sleep';

        if (action) {
            setStats(prev => {
                let nextStats = { ...prev };
                if (action === 'feed') { nextStats.hunger = Math.min(100, nextStats.hunger + 25); nextStats.energy = Math.max(0, nextStats.energy - 5); }
                if (action === 'play') { nextStats.mood = Math.min(100, nextStats.mood + 30); nextStats.energy = Math.max(0, nextStats.energy - 15); }
                if (action === 'sleep') { nextStats.energy = Math.min(100, nextStats.energy + 20); }
                return nextStats;
            });
            sndAct(action).then(data => { if(data) setStats({ hunger: data.hunger, energy: data.energy, mood: data.mood }) }).catch(()=>{});

            if (newView === 'play') { showToast(text.pl_t); if (tutStep === 1) nextTutStep(2); }
            if (newView === 'home') { showToast(text.fd_t); if (tutStep === 2) nextTutStep(3); }
            if (newView === 'sleep') { showToast(text.slp_t); if (tutStep === 3) nextTutStep(4); }
        }

        if (newView === 'wardrobe' && tutStep === 4) nextTutStep(5);
    };

    const handleAction = (actionType, payload = '') => {
        if (tutPaused) return;
        if (actionType === 'set_char') { setCharacter(payload); sndAct('set_char', payload).catch(()=>{}); }
        if (actionType === 'equip_santa') {
            setCostume('santa'); sndAct('equip_santa').catch(()=>{});
            if (tutStep === 5) {
                setTutStep(0); sndAct('tut_done').catch(()=>{}); showToast(text.tut_dn);
                setTimeout(() => { if (!petName) setNameModalVisible(true); }, 2000);
            }
        }
        if (actionType === 'equip_none') { setCostume('none'); sndAct('equip_none').catch(()=>{}); }
    };

    const fetchWeather = async () => {
        if (!city) return;

        const c = city.toLowerCase().trim();
        if (c === 'снег' || c === 'snow') { setWeather('snw'); return; }
        if (c === 'дождь' || c === 'rain') { setWeather('rn'); return; }
        if (c === 'ясно' || c === 'clear') { setWeather('clr'); return; }

        try {
            // 2. Ищем город
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                console.log('Город не найден');
                setWeather('clr'); 
                return;
            }

            const { latitude, longitude, name } = geoData.results[0];

            // 3. Запрашиваем реальную погоду (Код осадков + Температуру)
            const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
            const wxData = await wxRes.json();
            
            const code = wxData.current.weather_code;
            const temp = wxData.current.temperature_2m;

            // Специально для тебя: открываем консоль браузера (F12) и смотрим реальные данные!
            console.log(`🌍 Город: ${name} | Температура: ${temp}°C | Код осадков (WMO): ${code}`);

            // 4. Логика осадков
            if (code >= 51 && code <= 67) {
                setWeather('rn'); // Морось и дождь
            } else if (code >= 71 && code <= 86) {
                setWeather('snw'); // Снег
            } else if (code >= 95) {
                setWeather('rn'); // Гроза
            } else {
                setWeather('clr'); // Ясно или пасмурно (без осадков)
            }
        } catch (error) {
            console.error('Ошибка API погоды:', error);
            setWeather('clr');
        }
    };

    useEffect(() => { localStorage.setItem('pet_theme', theme); localStorage.setItem('pet_lang', lang); localStorage.setItem('pet_city', city); }, [theme, lang, city]);
    useEffect(() => { document.documentElement.className = `t-${theme}`; }, [theme]);
    useEffect(() => { document.body.classList.toggle('t-on', tutStep > 0 && !tutPaused); }, [tutStep, tutPaused]);
    useEffect(() => { fetchWeather(); }, [city]);
    useEffect(() => { syncWithServer(); const interval = setInterval(syncWithServer, 3000); return () => clearInterval(interval); }, []);

    // Логика фонов (исправлена комната сна!)
    let backgroundClass = 'bg-hm'; 
    if (currentView === 'play') backgroundClass = 'bg-pl'; 
    if (currentView === 'sleep') backgroundClass = 'bg-slp'; // Добавлен затемненный фон для сна
    if (currentView === 'wardrobe') backgroundClass = 'bg-wrd'; 

    return (
        <div className={`app-cnt ${backgroundClass}`}>
            <WeatherOverlay weather={weather} />
            {petName && currentView !== 'wardrobe' && currentView !== 'settings' && <div className="p-nm-lbl">{petName}</div>}
            
            <div className={`st-txt ${toastMessage ? 'vis' : ''}`}>{toastMessage}</div>
            <StatsOverlay stats={stats} text={text} />

            <div className="vw-wrp">
                {currentView === 'home'  && <HomeView costume={costume} character={character} />}
                {currentView === 'play'  && <PlayView costume={costume} character={character} />}
                {currentView === 'sleep' && <SleepView costume={costume} character={character} />}
                {currentView === 'wardrobe' && <WardrobeView text={text} character={character} costume={costume} handleAction={handleAction} tutStep={tutStep} />}
                {currentView === 'settings' && <SettingsView text={text} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} city={city} setCity={setCity} fetchWeather={fetchWeather} />}
            </div>

            <BottomDock currentView={currentView} handleNavigation={handleNavigation} text={text} tutStep={tutStep} />
            {isNameModalVisible && <NameModal text={text} saveName={(nm) => { sndAct('set_name', nm).catch(()=>{}); setPetName(nm); setNameModalVisible(false); }} />}
            {tutStep > 0 && !tutPaused && <Tutorial tutStep={tutStep} text={text} />}
        </div>
    );
}