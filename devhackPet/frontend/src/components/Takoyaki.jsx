import React from 'react';

export default function Takoyaki({ style, onPointerDown, onPointerMove, onPointerUp }) {
    return (
        <div 
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                width: '80px', height: '80px', cursor: 'grab',
                userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))',
                ...style
            }}
        >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                {/* Шарик из теста */}
                <circle cx="50" cy="50" r="45" fill="#e5b05c" />
                <circle cx="50" cy="50" r="45" fill="radial-gradient(circle, transparent 40%, rgba(139,69,19,0.4) 100%)" />
                
                {/* Соус терияки */}
                <path d="M 15 45 Q 30 20 60 30 T 85 45 Q 90 70 70 80 T 30 75 Q 10 60 15 45" fill="#4a2511" />
                
                {/* Полоски майонеза */}
                <path d="M 10 35 Q 50 10 90 45" stroke="#fffacd" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M 15 55 Q 50 30 85 65" stroke="#fffacd" strokeWidth="5" fill="none" strokeLinecap="round"/>
                <path d="M 25 75 Q 50 50 75 85" stroke="#fffacd" strokeWidth="5" fill="none" strokeLinecap="round"/>
                
                {/* Зеленая посыпка (нори) */}
                <circle cx="35" cy="30" r="2.5" fill="#2e4c16" />
                <circle cx="65" cy="40" r="3" fill="#2e4c16" />
                <circle cx="45" cy="60" r="2" fill="#2e4c16" />
                <circle cx="75" cy="60" r="2.5" fill="#2e4c16" />
                <circle cx="50" cy="80" r="2" fill="#2e4c16" />
                <circle cx="30" cy="50" r="1.5" fill="#2e4c16" />
            </svg>
        </div>
    );
}