import React, { useState } from 'react';
import Room3D from '../components/Room3D';

export default function HomeView({ character = 'twilight', stats, setStats, isGreeting }) {
    const [action, setAction] = useState('idle');
    const [isDragging, setIsDragging] = useState(false);
    const [foodPos, setFoodPos] = useState({ x: 0, y: 0 });

    // Проверка критического состояния
    let criticalCount = 0;
    if (stats?.hunger <= 15) criticalCount++;
    if (stats?.energy <= 15) criticalCount++;
    if (stats?.mood <= 15) criticalCount++;

    let currentAnim = action;
    if (isGreeting) currentAnim = 'hello';
    else if (criticalCount >= 2) currentAnim = 'fall';
    else if (criticalCount === 1 && action !== 'eat') currentAnim = 'sick';

    const modelUrl = `/models/${character}/${currentAnim}.glb`;

    // Логика перетаскивания еды
    const handlePointerDown = (e) => {
        if (currentAnim === 'fall') return;
        setIsDragging(true);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setFoodPos({ x: e.clientX - 30, y: e.clientY - 30 });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
        
        // Зона кормления (теперь она должна быть чуть выше стола, у ее рта)
        if (e.clientY < window.innerHeight / 2.0 && currentAnim !== 'fall') {
            setAction('eat');
            
            // Награда за еду (+25 голода, -5 энергии)
            setStats(prev => ({
                ...prev,
                hunger: Math.min(100, prev.hunger + 25),
                energy: Math.max(0, prev.energy - 5)
            }));

            setTimeout(() => setAction('idle'), 2500);
        }
        setFoodPos({ x: 0, y: 0 }); 
    };

    return (
        <div style={{ 
            width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
            backgroundImage: 'url(/images/kitchen_bg.png)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}>

            <Room3D 
                url={modelUrl} 
                posY={-3.0}
                scale={2.2}
                loop={currentAnim !== 'fall' && currentAnim !== 'hello'} 
            />

            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: 'url(/images/kitchen_foreground.png)',
                backgroundSize: 'cover', backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat',
                pointerEvents: 'none', 
                zIndex: 10
            }} />

            <div 
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                style={{
                    position: 'absolute',
                    bottom: isDragging ? 'auto' : '15%',
                    left: isDragging ? `${foodPos.x}px` : 'calc(50% - 30px)', 
                    top: isDragging ? `${foodPos.y}px` : 'auto',
                    fontSize: '60px', cursor: 'grab', touchAction: 'none', 
                    zIndex: 1000, transition: isDragging ? 'none' : 'all 0.3s ease',
                    textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
            >
                🍖
            </div>
        </div>
    );
}