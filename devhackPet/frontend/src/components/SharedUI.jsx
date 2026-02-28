import React from 'react';
import { useProgress } from '@react-three/drei';

export function LoadingScreen({ l }) {
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

export function WeatherOverlay({ weather }) {
    if (weather === 'clr') return null;
    const isRain = weather === 'rn';
    const overlayColor = isRain ? 'rgba(0, 30, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    const symbol = isRain ? '💧' : '❄️';
    const particles = Array.from({ length: 25 }).map((_, i) => ({
        id: i, left: `${Math.random() * 100}%`, animDuration: `${isRain ? 0.7 + Math.random() * 0.5 : 3 + Math.random() * 3}s`,
        animDelay: `${Math.random() * 2}s`, opacity: 0.4 + Math.random() * 0.5, fontSize: `${isRain ? 12 + Math.random() * 10 : 16 + Math.random() * 15}px`
    }));
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: overlayColor, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
            {particles.map(p => <div key={p.id} style={{ position: 'absolute', top: '-10%', left: p.left, opacity: p.opacity, fontSize: p.fontSize, animation: `fall ${p.animDuration} linear infinite`, animationDelay: p.animDelay }}>{symbol}</div>)}
        </div>
    );
}

export function NavButton({ icon, label, isActive, onClick, colors }) {
    return (
        <button onClick={onClick} style={{ background: isActive ? colors.border : 'transparent', border: 'none', color: colors.text, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '8px 15px', borderRadius: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <span style={{ fontSize: '24px', textShadow: colors.textShadow }}>{icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textShadow: colors.textShadow }}>{label}</span>
        </button>
    );
}

export function StatBar({ icon, value, color, onClick, isInteractive }) {
    const safeValue = Math.max(0, Math.min(100, value));
    return (
        <div 
            style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', 
                fontSize: '14px', fontWeight: 'bold', 
                cursor: isInteractive ? 'pointer' : 'default',
                color: color, // Красим текст в цвет статы для красоты
                background: 'rgba(0,0,0,0.2)', // Легкая затемненная подложка
                padding: '4px 8px', borderRadius: '12px'
            }} 
            onClick={isInteractive ? onClick : undefined}
        >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            <span>{safeValue}%</span>
        </div>
    );
}

export function ToggleSwitch({ isOn, onToggle, iconOn, iconOff, isDark }) {
    return (
        <div onClick={onToggle} style={{ width: '60px', height: '30px', background: isOn ? 'rgba(46, 204, 113, 0.7)' : (isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'), borderRadius: '15px', position: 'relative', cursor: 'pointer', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', top: '2px', left: isOn ? '32px' : '2px', width: '24px', height: '24px', background: 'white', borderRadius: '50%', transition: 'left 0.3s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: '#333', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                {isOn ? iconOn : iconOff}
            </div>
        </div>
    );
}