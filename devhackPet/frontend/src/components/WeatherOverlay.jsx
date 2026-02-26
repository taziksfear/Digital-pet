import React from 'react';

export default function WeatherOverlay({ weather }) {
    if (weather === 'clr') return null;

    const pts = Array.from({ length: 20 }).map((_, i) => (
        <div 
            key={i} 
            className={`wx-pt ${weather}`} 
            style={{ 
                left: `${Math.random() * 100}%`, 
                animationDuration: `${Math.random() * 2 + 1}s`, 
                animationDelay: `${Math.random()}s` 
            }} 
        />
    ));

    return (
        <div className="wx-cnt">
            {pts}
        </div>
    );
}