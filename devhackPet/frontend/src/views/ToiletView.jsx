import React from 'react';
import Room3D from '../components/Room3D';

export default function ToiletView({ character = 'twilight' }) {
    // В App.jsx мы уже добавили в ANIMATIONS_LIST анимацию 'toilet'
    // Твоему тиммейту нужно сделать анимацию сидения и назвать её toilet.glb
    const modelUrl = `/models/${character}/toilet.glb`;
    const scaleMult = character === 'rick' ? 0.2 : 1;
    return (
        <div style={{ 
            width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', 
            backgroundImage: 'url(/images/toilet_bg.png)', // Фон ванной комнаты
            backgroundSize: 'cover', backgroundPosition: 'center' 
        }}>
            
            {/* 3D Питомец (Находится ЗА дверью) */}
            <Room3D 
                url={modelUrl} 
                posY={-2.5} 
                scale={2.2 * scaleMult} 
                loop={true} 
            />

            {/* ВЕКТОРНАЯ ДВЕРЬ КАБИНКИ */}
            <div style={{
                position: 'absolute',
                bottom: '12%', // Зазор снизу, чтобы было видно ноги!
                left: '50%',
                transform: 'translateX(-50%)',
                width: '65%',
                height: '65%',
                background: 'linear-gradient(180deg, #ecf0f1 0%, #bdc3c7 100%)', // Цвет двери
                border: '6px solid #7f8c8d',
                borderRadius: '5px',
                zIndex: 10,
                boxShadow: '10px 10px 20px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Тень под дверью (падает на ноги) */}
                <div style={{ position: 'absolute', bottom: '-20px', left: 0, width: '100%', height: '20px', background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }} />

                {/* Табличка WC */}
                <div style={{ 
                    marginTop: '30px', padding: '10px 20px', 
                    background: '#34495e', color: '#ecf0f1', 
                    borderRadius: '8px', fontWeight: 'bold', fontSize: '24px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    border: '2px solid #2c3e50'
                }}>
                    WC
                </div>

                {/* Ручка двери (Занято - красный) */}
                <div style={{ 
                    position: 'absolute', right: '15px', top: '50%', 
                    width: '12px', height: '40px', background: '#c0392b', 
                    borderRadius: '6px', border: '2px solid #922b21',
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.3)'
                }} />
                
                {/* Петли */}
                <div style={{ position: 'absolute', left: '-6px', top: '20%', width: '6px', height: '30px', background: '#7f8c8d', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: '-6px', bottom: '20%', width: '6px', height: '30px', background: '#7f8c8d', borderRadius: '3px 0 0 3px' }} />
            </div>

            {/* Полумрак для атмосферы */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(20, 30, 40, 0.2)', pointerEvents: 'none', zIndex: 11 }} />
        </div>
    );
}