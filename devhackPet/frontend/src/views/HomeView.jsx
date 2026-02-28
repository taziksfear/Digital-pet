import React, { useState } from 'react';
import Room3D from '../components/Room3D';

function Takoyaki({ style, onPointerDown, onPointerMove, onPointerUp }) {
    return (
        <div 
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            style={{
                width: '80px', height: '80px', cursor: 'grab',
                userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))',
                ...style
            }}
        >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="45" fill="#e5b05c" />
                <circle cx="50" cy="50" r="45" fill="url(#takoGrad)" />
                <defs><radialGradient id="takoGrad"><stop offset="40%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(139,69,19,0.4)"/></radialGradient></defs>
                <path d="M 15 45 Q 30 20 60 30 T 85 45 Q 90 70 70 80 T 30 75 Q 10 60 15 45" fill="#4a2511" />
                <path d="M 10 35 Q 50 10 90 45" stroke="#fffacd" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M 15 55 Q 50 30 85 65" stroke="#fffacd" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <circle cx="35" cy="30" r="2.5" fill="#2e4c16" /><circle cx="65" cy="40" r="3" fill="#2e4c16" />
                <circle cx="45" cy="60" r="2" fill="#2e4c16" /><circle cx="75" cy="60" r="2.5" fill="#2e4c16" />
            </svg>
        </div>
    );
}

export default function HomeView({ character = 'twilight', stats, setStats, sendAction, isGreeting, onFeed }) {
    const [action, setAction] = useState('idle');
    const [isDragging, setIsDragging] = useState(false);
    const [foodPos, setFoodPos] = useState({ x: 0, y: 0 });

    let criticalCount = 0;
    if (stats?.hng <= 15) criticalCount++;
    if (stats?.eng <= 15) criticalCount++;
    if (stats?.md <= 15) criticalCount++;

    let currentAnim = action;
    if (isGreeting) currentAnim = 'hello';
    else if (criticalCount >= 2) currentAnim = 'fall';
    else if (criticalCount === 1 && action !== 'eat') currentAnim = 'sick';

    const handlePointerDown = (e) => {
        if (currentAnim === 'fall') return;
        setIsDragging(true);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setFoodPos({ x: e.clientX - 40, y: e.clientY - 40 }); 
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
        
        if (e.clientY < window.innerHeight / 2.0 && currentAnim !== 'fall') {
            setAction('eat');
            setStats(prev => ({ ...prev, hng: Math.min(100, prev.hng + 25), eng: Math.max(0, prev.eng - 5) }));
            sendAction('fd');

            // Вызываем коллбэк для задания
            if (onFeed) onFeed();

            setTimeout(() => setAction('idle'), 2500);
        }
        setFoodPos({ x: 0, y: 0 }); 
    };

    const scaleMult = character === 'rick' ? 0.2 : 1;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundImage: 'url(/images/kitchen_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Room3D url={`/models/${character}/${currentAnim}.glb`} posY={-2.5} scale={2.2 * scaleMult} loop={currentAnim !== 'fall' && currentAnim !== 'hello'} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '25%', display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: 10 }}>
                <div style={{ width: '100%', height: '40px', background: 'linear-gradient(180deg, #deab7a 0%, #c48b53 100%)', borderTop: '4px solid #f2c79b', borderBottom: '8px solid #8c5828' }} />
                <div style={{ width: '100%', height: '20px', background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', height: '100%', padding: '0 20%' }}>
                    <div style={{ width: '40px', height: '100%', background: 'linear-gradient(90deg, #5c3a18 0%, #8c5828 20%, #3e2710 100%)', borderLeft: '2px solid #a87242' }} />
                    <div style={{ width: '40px', height: '100%', background: 'linear-gradient(90deg, #5c3a18 0%, #8c5828 20%, #3e2710 100%)', borderLeft: '2px solid #a87242' }} />
                </div>
            </div>
            <Takoyaki 
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                style={{
                    position: 'absolute', zIndex: 1000, transition: isDragging ? 'none' : 'all 0.3s ease',
                    bottom: isDragging ? 'auto' : '22%', left: isDragging ? `${foodPos.x}px` : 'calc(50% - 40px)', top: isDragging ? `${foodPos.y}px` : 'auto',
                }}
            />
        </div>
    );
}