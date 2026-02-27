import React, { useState } from 'react';
import Room3D from '../components/Room3D';

export default function PlayView({ character = 'twilight', stats, setStats, sendAction, isGreeting, onPet }) {
    const [action, setAction] = useState('idle');

    let criticalCount = 0;
    if (stats?.hng <= 15) criticalCount++;
    if (stats?.eng <= 15) criticalCount++;
    if (stats?.md <= 15) criticalCount++;

    let currentAnim = action;
    if (isGreeting) currentAnim = 'hello';
    else if (criticalCount >= 2) currentAnim = 'fall';
    else if (criticalCount === 1 && action !== 'joy_jump') currentAnim = 'sick';

    const handleInteract = (e) => {
        e.stopPropagation();
        if (currentAnim !== 'fall' && currentAnim !== 'joy_jump') {
            setAction('joy_jump');
            setStats(prev => ({ ...prev, md: Math.min(100, prev.md + 15), eng: Math.max(0, prev.eng - 5) }));
            sendAction('pl');

            // Вызываем коллбэк для задания
            if (onPet) onPet();

            setTimeout(() => setAction('idle'), 2000);
        }
    };

    return (
        <div style={{ 
            width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
            backgroundImage: 'url(/images/street_bg.png)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}>
            <Room3D 
                url={`/models/${character}/${currentAnim}.glb`} 
                posY={-3.0} 
                scale={2.2} 
                loop={currentAnim !== 'fall' && currentAnim !== 'hello'} 
                onInteract={handleInteract} 
            />
            
            <div style={{ position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold' }}>
                    👆 Погладь меня!
                </span>
            </div>
        </div>
    );
}