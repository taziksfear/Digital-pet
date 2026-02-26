import React, { useState } from 'react';
import Room3D from '../components/Room3D';

export default function PlayView({ character = 'twilight', stats, setStats, isGreeting }) {
    const [action, setAction] = useState('idle');

    let criticalCount = 0;
    if (stats?.hunger <= 15) criticalCount++;
    if (stats?.energy <= 15) criticalCount++;
    if (stats?.mood <= 15) criticalCount++;

    let currentAnim = action;
    if (isGreeting) currentAnim = 'hello';
    else if (criticalCount >= 2) currentAnim = 'fall';
    else if (criticalCount === 1 && action !== 'joy_jump') currentAnim = 'sick';

    const modelUrl = `/models/${character}/${currentAnim}.glb`;

    const handleInteract = (e) => {
        e.stopPropagation();
        if (currentAnim !== 'fall' && currentAnim !== 'joy_jump') {
            setAction('joy_jump');
            
            setStats(prev => ({
                ...prev,
                mood: Math.min(100, prev.mood + 15),
                energy: Math.max(0, prev.energy - 5)
            }));

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
                url={modelUrl} 
                posY={-3.0}
                scale={2.2}
                loop={currentAnim !== 'fall' && currentAnim !== 'hello'} 
                onInteract={handleInteract} 
            />
            
            <div style={{ position: 'absolute', bottom: '15%', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '25px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    👆 Погладь меня!
                </span>
            </div>
        </div>
    );
}