import React from 'react';

const CHARACTERS = [
    { id: 'twilight', name: 'Искорка', icon: '🦄', rarity: 'Дефолт', color: '#9b59b6' },
    { id: 'rick', name: 'Рик', icon: '👨‍🔬', rarity: 'Обычная', color: '#bdc3c7' }
];

export default function WardrobeModal({ isOpen, onClose, unlockedCharacters, currentCharacter, onSelect, onUnlockRequest, l, colors }) {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '400px', color: colors.text, boxShadow: colors.shadow }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.wardrobe}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '5px' }}>
                    {CHARACTERS.map(char => {
                        const isUnlocked = unlockedCharacters.includes(char.id);
                        const isSelected = currentCharacter === char.id;

                        return (
                            <div key={char.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.glassBg, border: `2px solid ${isSelected ? '#2ecc71' : colors.border}`, borderRadius: '15px', padding: '10px 15px', opacity: isUnlocked ? 1 : 0.7 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '30px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', border: `1px solid ${char.color}`, boxShadow: `0 0 10px ${char.color}40` }}>
                                        {char.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px' }}>{char.name}</h3>
                                        <span style={{ fontSize: '12px', color: char.color, fontWeight: 'bold' }}>{char.rarity}</span>
                                    </div>
                                </div>

                                {isUnlocked ? (
                                    <button 
                                        onClick={() => onSelect(char.id)} disabled={isSelected}
                                        style={{ background: isSelected ? '#2ecc71' : '#3498db', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: isSelected ? 'default' : 'pointer' }}
                                    >
                                        {isSelected ? 'Надето' : 'Выбрать'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={onUnlockRequest}
                                        style={{ background: '#e74c3c', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(231, 76, 60, 0.4)' }}
                                    >
                                        🔒 Выбить
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button onClick={onUnlockRequest} style={{ width: '100%', marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, #f1c40f, #e67e22)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 126, 34, 0.5)' }}>
                    🎰 Рулетка Персонажей
                </button>
            </div>
        </div>
    );
}