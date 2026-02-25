import React, { useState } from 'react';

export default function Wardrobe({ currentCharacter, currentCostume, onAction }) {
    const [activeTab, setActiveTab] = useState('chars'); // 'chars' или 'costumes'

    return (
        <div className="wardrobe-container">
            <div className="tabs-container">
                <button 
                    className={`tab-btn ${activeTab === 'chars' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('chars')}
                >Персонажи</button>
                <button 
                    className={`tab-btn ${activeTab === 'costumes' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('costumes')}
                >Костюмы</button>
            </div>

            {/* Вкладка: Персонажи */}
            {activeTab === 'chars' && (
                <div className="grid-layout active">
                    <div className={`item-card ${currentCharacter === 'pig' ? 'selected' : ''}`}>
                        <div className="item-icon">🐷</div><div className="item-name">Свинка</div>
                    </div>
                    {/* Другие персонажи можно добавить сюда позже */}
                </div>
            )}

            {/* Вкладка: Костюмы */}
            {activeTab === 'costumes' && (
                <div className="grid-layout active">
                    <div 
                        id="costume-santa" 
                        className={`item-card ${currentCostume === 'santa' ? 'selected' : ''}`} 
                        onClick={() => onAction('equip_santa')}
                    >
                        <div className="item-icon">🎅</div><div className="item-name">Колпак</div>
                    </div>
                    <div 
                        className={`item-card ${currentCostume === 'none' ? 'selected' : ''}`} 
                        onClick={() => onAction('equip_none')}
                    >
                        <div className="item-icon">❌</div><div className="item-name">Снять всё</div>
                    </div>
                </div>
            )}
        </div>
    );
}