import React, { useState, useEffect } from 'react';

const PRIZES = [
    { id: 'rick', type: 'char', name: 'Рик', color: '#bdc3c7', icon: '👨‍🔬', chance: 20 },
    { id: 'twilight', type: 'char', name: 'Искорка', color: '#9b59b6', icon: '🦄', chance: 10 },
    { id: 'alien', type: 'char', name: 'Инопрешеленец', color: '#9b59b6', icon: '👽', chance: 5 },
    { id: 'mannequin', type: 'char', name: 'Маникен', color: '#9b59b6', icon: '👤', chance: 10 },
    { id: 'robot', type: 'char', name: 'Робот', color: '#9b59b6', icon: '🤖', chance: 10 },
    { id: 'zombie', type: 'char', name: 'Зомби', color: '#9b59b6', icon: '🧟', chance: 15 },
    { id: 'coin_50', type: 'coin', amount: 50, name: '50 Монет', color: '#f1c40f', icon: '🪙', chance: 25 },
    { id: 'coin_200', type: 'coin', amount: 200, name: '200 Монет', color: '#2ecc71', icon: '💎', chance: 15 },
];

export default function WheelOfFortune({ isOpen, onClose, balance, setBalance, sendAction, unlockedCharacters, onUnlock, colors }) {
    const SPIN_COST = 200;
    const ITEM_WIDTH = 130; // 120px ширина блока + 10px отступ (gap)
    
    const [isSpinning, setIsSpinning] = useState(false);
    const [strip, setStrip] = useState([]);
    const [result, setResult] = useState(null);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [offset, setOffset] = useState(0); // Наш новый надежный якорь для анимации

    useEffect(() => {
        if (isOpen) {
            setStrip(Array.from({ length: 10 }, () => PRIZES[Math.floor(Math.random() * PRIZES.length)]));
            setResult(null);
            setOffset(0); // Сбрасываем позицию
            setIsDuplicate(false);
        }
    }, [isOpen]);

    const getWinPrize = () => {
        const roll = Math.random() * 100;
        let currentSum = 0;
        for (const p of PRIZES) {
            currentSum += p.chance;
            if (roll <= currentSum) return p;
        }
        return PRIZES[0];
    };

    const handleSpin = () => {
        if (balance < SPIN_COST || isSpinning) return;

        setBalance(prev => prev - SPIN_COST);
        sendAction('balance_add', `-${SPIN_COST}`);
        
        setIsSpinning(false); // Выключаем анимацию для сброса
        setResult(null);
        setIsDuplicate(false);
        setOffset(0); // Моментально возвращаем ленту в начало

        const win = getWinPrize();
        
        const newStrip = [];
        for (let i = 0; i < 40; i++) {
            newStrip.push(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
        }
        newStrip.push(win); // Победный предмет будет ровно 40-м индексом
        newStrip.push(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
        newStrip.push(PRIZES[Math.floor(Math.random() * PRIZES.length)]);

        setStrip(newStrip);

        // Даем React миллисекунду на отрисовку ленты, затем запускаем полет
        setTimeout(() => {
            setIsSpinning(true);
            setOffset(40 * ITEM_WIDTH); // Двигаем ленту ровно до 40-го элемента
        }, 50);

        // Ждем 4 секунды пока рулетка крутится
        setTimeout(() => {
            setIsSpinning(false);
            setResult(win);
            
            if (win.type === 'char') {
                if (unlockedCharacters.includes(win.id)) {
                    setIsDuplicate(true);
                    setBalance(prev => prev + 150);
                    sendAction('balance_add', '150');
                } else {
                    onUnlock(win.id);
                }
            } else if (win.type === 'coin') {
                setBalance(prev => prev + win.amount);
                sendAction('balance_add', win.amount.toString());
            }
        }, 4050); 
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            
            <button onClick={onClose} disabled={isSpinning} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '2px solid white', color: 'white', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: isSpinning ? 'not-allowed' : 'pointer' }}>✖</button>

            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', fontSize: '20px', fontWeight: 'bold', border: '2px solid #f1c40f', color: '#f1c40f' }}>
                💰 {balance}
            </div>

            <h1 style={{ color: 'white', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 20px rgba(255,255,255,0.5)', marginBottom: '30px' }}>
                Поиск Персонажа
            </h1>

            <div style={{ width: '90%', maxWidth: '500px', height: '140px', background: '#2c3e50', borderRadius: '20px', border: '4px solid #34495e', overflow: 'hidden', position: 'relative', boxShadow: '0 15px 30px rgba(0,0,0,0.8)' }}>
                
                <div style={{ position: 'absolute', top: 0, left: '50%', width: '4px', height: '100%', background: '#e74c3c', zIndex: 10, transform: 'translateX(-50%)', boxShadow: '0 0 15px #e74c3c' }} />
                
                {/* --- НОВАЯ ЖЕЛЕЗОБЕТОННАЯ АНИМАЦИЯ --- */}
                <div style={{ 
                    display: 'flex', height: '100%', alignItems: 'center', gap: '10px', 
                    paddingLeft: 'calc(50% - 60px)', // Идеально центрует нулевой элемент
                    transform: `translateX(-${offset}px)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
                }}>
                    {strip.map((item, index) => (
                        <div key={index} style={{ 
                            minWidth: '120px', height: '120px', background: 'linear-gradient(135deg, #34495e, #2c3e50)', 
                            borderRadius: '15px', border: `2px solid ${item.color}`, display: 'flex', flexDirection: 'column', 
                            justifyContent: 'center', alignItems: 'center', boxShadow: `inset 0 0 20px ${item.color}30` 
                        }}>
                            <div style={{ fontSize: '50px' }}>{item.icon}</div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleSpin} disabled={isSpinning || balance < SPIN_COST}
                style={{
                    marginTop: '40px', padding: '15px 50px', fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase',
                    background: isSpinning ? '#7f8c8d' : (balance >= SPIN_COST ? 'linear-gradient(180deg, #9b59b6 0%, #8e44ad 100%)' : '#7f8c8d'),
                    color: 'white', border: '4px solid rgba(255,255,255,0.2)', borderRadius: '40px',
                    cursor: (isSpinning || balance < SPIN_COST) ? 'not-allowed' : 'pointer',
                    boxShadow: isSpinning ? 'none' : '0 10px 20px rgba(142, 68, 173, 0.5)',
                    transform: isSpinning ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.2s ease'
                }}
            >
                {isSpinning ? 'Открываем...' : `Открыть (${SPIN_COST} 💰)`}
            </button>

            <div style={{ height: '100px', marginTop: '20px', display: 'flex', alignItems: 'center' }}>
                {result && !isSpinning && (
                    <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '15px 40px', borderRadius: '20px', border: `2px solid ${result.color}` }}>
                        <div style={{ fontSize: '30px', fontWeight: 'bold', color: result.color, textShadow: `0 0 15px ${result.color}80` }}>
                            {result.icon} {result.name}
                        </div>
                        {isDuplicate && <div style={{ color: '#f1c40f', marginTop: '5px', fontWeight: 'bold' }}>Уже есть! Компенсация: +150 💰</div>}
                        {result.type === 'char' && !isDuplicate && <div style={{ color: '#2ecc71', marginTop: '5px', fontWeight: 'bold' }}>НОВЫЙ ПЕРСОНАЖ!</div>}
                    </div>
                )}
            </div>

            <style>{`@keyframes popIn { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}