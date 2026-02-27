import React from 'react';

// Список доступных персонажей
const CHARACTERS = [
    { id: 'twilight', name: 'Сумеречный', icon: '🦄', locked: false },
    { id: 'pig', name: 'Свинка', icon: '🐷', locked: true },
    { id: 'fluffy', name: 'Пухляш', icon: '🐻', locked: true },
    { id: 'eye', name: 'Глазастик', icon: '👁️', locked: true },
    { id: 'robot', name: 'Робот', icon: '🤖', locked: true },
];

export default function WardrobeModal({ isOpen, onClose, unlockedCharacters, currentCharacter, onSelect, onUnlockRequest, l, colors }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                background: colors.modalBg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadow,
                padding: '25px',
                borderRadius: '25px',
                width: '90%',
                maxWidth: '600px',
                color: colors.text
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.characters}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '15px',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                }}>
                    {CHARACTERS.map(char => {
                        const isUnlocked = unlockedCharacters.includes(char.id);
                        const isSelected = currentCharacter === char.id;

                        return (
                            <div
                                key={char.id}
                                onClick={() => isUnlocked ? onSelect(char.id) : null}
                                style={{
                                    background: colors.glassBg,
                                    border: `2px solid ${isSelected ? '#8ac6d1' : 'transparent'}`,
                                    borderRadius: '16px',
                                    padding: '15px',
                                    textAlign: 'center',
                                    transition: 'transform 0.2s',
                                    cursor: isUnlocked ? 'pointer' : 'default',
                                    opacity: isUnlocked ? 1 : 0.7,
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => isUnlocked && (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseLeave={(e) => isUnlocked && (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>{char.icon}</div>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{char.name}</div>

                                {!isUnlocked ? (
                                    <>
                                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔒</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUnlockRequest(char.id); }}
                                            style={{
                                                background: '#8ac6d1',
                                                border: 'none',
                                                color: 'white',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                width: '100%'
                                            }}
                                        >
                                            {l.unlock}
                                        </button>
                                    </>
                                ) : (
                                    isSelected && <div style={{ marginTop: '8px', color: '#8ac6d1', fontWeight: 'bold' }}>✓ Выбран</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}