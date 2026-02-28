import React, { useState } from 'react';

// Новые веса для денег (Сумма = 100%)
// payout - это сколько монет мы ВЫИГРЫВАЕМ
const RARITIES = [
    { id: 'nothing', name: 'Пусто...', color: '#e74c3c', icon: '❌', chance: 35, payout: 0 },
    { id: 'small', name: 'Горсть монет', color: '#bdc3c7', icon: '🪙', chance: 40, payout: 75 },
    { id: 'medium', name: 'Кошелек', color: '#3498db', icon: '💰', chance: 15, payout: 200 },
    { id: 'epic', name: 'Мешок золота', color: '#9b59b6', icon: '🛍️', chance: 7, payout: 500 },
    { id: 'jackpot', name: 'ДЖЕКПОТ!', color: '#f1c40f', icon: '💎', chance: 3, payout: 2500 }
];

const PLAYABLE_ICONS = ['🪙', '💰', '🛍️', '💎', '🍒', '🔔', '🍀', '🍓'];

export default function SlotsView({ balance, setBalance, sendAction }) {
    const SPIN_COST = 50; // Снизим цену спина до 50

    const [isSpinning, setIsSpinning] = useState(false);
    const [resultIcons, setResultIcons] = useState(['🎰', '🎰', '🎰']); 
    const [strips, setStrips] = useState([[], [], []]);
    const [result, setResult] = useState(null);

    const getWinRarity = () => {
        const roll = Math.random() * 100;
        let currentSum = 0;
        for (const rarity of RARITIES) {
            currentSum += rarity.chance;
            if (roll <= currentSum) return rarity;
        }
        return RARITIES[0];
    };

    const handleSpin = () => {
        if (balance < SPIN_COST || isSpinning) return;

        // Списываем плату за прокрутку
        setBalance(prev => prev - SPIN_COST);
        sendAction('balance_add', `-${SPIN_COST}`);
        
        setIsSpinning(true);
        setResult(null);

        const win = getWinRarity();

        let targetIcons;
        if (win.id === 'nothing') {
            const shuffled = [...PLAYABLE_ICONS].sort(() => 0.5 - Math.random());
            targetIcons = [shuffled[0], shuffled[1], shuffled[2]];
        } else {
            targetIcons = [win.icon, win.icon, win.icon];
        }

        const REEL_LENGTH = 30;
        const newStrips = [0, 1, 2].map(reelIdx => {
            const strip = [resultIcons[reelIdx]];
            for (let i = 1; i < REEL_LENGTH - 1; i++) {
                strip.push(PLAYABLE_ICONS[Math.floor(Math.random() * PLAYABLE_ICONS.length)]);
            }
            strip.push(targetIcons[reelIdx]);
            return strip;
        });

        setStrips(newStrips);

        setTimeout(() => {
            setIsSpinning(false);
            setResultIcons(targetIcons);
            setResult(win);
            
            // Если выиграли, начисляем приз!
            if (win.payout > 0) {
                setBalance(prev => prev + win.payout);
                sendAction('balance_add', win.payout.toString());
            }
        }, 3000); 
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle, #2c3e50 0%, #0f171e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
            
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', fontSize: '20px', fontWeight: 'bold', border: '2px solid #f1c40f', color: '#f1c40f', boxShadow: '0 4px 15px rgba(241, 196, 15, 0.3)' }}>
                💰 {balance}
            </div>

            <div style={{ background: 'linear-gradient(180deg, #d35400 0%, #c0392b 100%)', border: '8px solid #922b21', borderRadius: '40px 40px 20px 20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 10px 20px rgba(255,255,255,0.2)', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <h1 style={{ margin: '0 0 20px 0', textShadow: '0 0 15px #f1c40f', color: '#f1c40f', fontSize: '28px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Денежный Слот
                </h1>

                {/* Барабаны */}
                <div style={{ background: 'linear-gradient(180deg, #7f8c8d 0%, #34495e 100%)', padding: '15px', borderRadius: '20px', border: '4px solid #2c3e50', boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                        {[0, 1, 2].map((idx) => (
                            <div key={idx} style={{ flex: 1, height: '100px', background: 'linear-gradient(180deg, #fdfbfb 0%, #ebedee 100%)', borderRadius: '10px', overflow: 'hidden', border: '2px solid #bdc3c7', boxShadow: 'inset 0 10px 15px rgba(0,0,0,0.2)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.3) 100%)', zIndex: 10, pointerEvents: 'none' }} />
                                {isSpinning ? (
                                    <div style={{ animation: `spinReel ${2 + idx * 0.5}s cubic-bezier(0.15, 0.85, 0.15, 1) forwards` }}>
                                        {strips[idx].map((icon, i) => (
                                            <div key={i} style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', filter: 'blur(1px)' }}>{icon}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>{resultIcons[idx]}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ width: '40px', height: '10px', background: '#000', border: '2px solid #7f8c8d', borderRadius: '5px', marginTop: '20px', boxShadow: 'inset 0 5px 5px rgba(0,0,0,1)' }} />

                <button 
                    onClick={handleSpin} disabled={isSpinning || balance < SPIN_COST}
                    style={{
                        marginTop: '25px', padding: '15px 40px', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase',
                        background: isSpinning ? '#95a5a6' : (balance >= SPIN_COST ? 'linear-gradient(180deg, #f1c40f 0%, #f39c12 100%)' : '#7f8c8d'),
                        color: isSpinning ? '#bdc3c7' : '#8e44ad', border: '4px solid #fff', borderRadius: '40px',
                        cursor: (isSpinning || balance < SPIN_COST) ? 'not-allowed' : 'pointer',
                        boxShadow: isSpinning ? 'none' : '0 8px 0 #d35400, 0 15px 20px rgba(0,0,0,0.4)',
                        transform: isSpinning ? 'translateY(8px)' : 'none', transition: 'all 0.1s ease', width: '80%'
                    }}
                >
                    {isSpinning ? 'Крутим...' : `${SPIN_COST} 💰`}
                </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '20px', maxWidth: '400px', fontSize: '12px' }}>
                {RARITIES.map(r => (
                    <div key={r.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '15px', border: `1px solid ${r.color}` }}>
                        {r.icon} {r.name} {r.payout > 0 ? `(+${r.payout})` : ''}: {r.chance}%
                    </div>
                ))}
            </div>

            <div style={{ height: '80px', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                {result && !isSpinning && (
                    <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '10px 30px', borderRadius: '20px', border: `2px solid ${result.color}` }}>
                        <div style={{ fontSize: '14px', color: '#bdc3c7', marginBottom: '5px' }}>{result.id === 'nothing' ? 'Увы...' : 'ВЫИГРЫШ!'}</div>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: result.color, textShadow: `0 0 15px ${result.color}80` }}>
                            {result.name} {result.payout > 0 ? `+${result.payout}💰` : ''}
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes spinReel { 0% { transform: translateY(0); } 100% { transform: translateY(calc(-100% + 100px)); } }
                    @keyframes blink { 0%, 100% { background: #f1c40f; box-shadow: 0 0 15px #f1c40f; } 50% { background: #e74c3c; box-shadow: 0 0 15px #e74c3c; } }
                    @keyframes popIn { 0% { transform: scale(0.5) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                `}
            </style>
        </div>
    );
}