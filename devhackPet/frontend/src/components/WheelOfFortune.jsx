import React, { useState, useEffect, useRef } from 'react';

export default function WheelOfFortune({ isOpen, onClose, balance, setBalance, spinCost = 25, onWin, colors, l }) {
    const SECTORS_COUNT = 10;
    const SECTOR_COLORS = [
        "hsl(197, 30%, 43%)",
        "hsl(173, 58%, 39%)",
        "hsl(43, 74%, 66%)",
        "hsl(27, 87%, 67%)",
        "hsl(12, 76%, 61%)",
        "hsl(350, 60%, 52%)",
        "hsl(91, 43%, 54%)"
    ];

    const [prizes, setPrizes] = useState([]);
    const [gradientStyle, setGradientStyle] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [targetPrizeIndex, setTargetPrizeIndex] = useState(-1);
    const [currentWin, setCurrentWin] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const wheelRef = useRef(null);
    const spinnerRef = useRef(null);

    useEffect(() => {
        const newPrizes = [];
        for (let i = 0; i < SECTORS_COUNT; i++) {
            newPrizes.push({
                text: "???",
                color: SECTOR_COLORS[i % SECTOR_COLORS.length],
                probability: 1 / SECTORS_COUNT
            });
        }
        setPrizes(newPrizes);
    }, []);

    useEffect(() => {
        if (prizes.length === 0) return;
        const gradientParts = prizes.map(({ color }, i) => {
            const percent = (100 / prizes.length) * (prizes.length - i);
            return `${color} 0 ${percent}%`;
        }).reverse().join(', ');
        setGradientStyle(`conic-gradient(from -90deg, ${gradientParts})`);
    }, [prizes]);

    useEffect(() => {
        if (!spinnerRef.current || prizes.length === 0) return;
        const prizeSlice = 360 / SECTORS_COUNT;
        const prizeOffset = Math.floor(180 / SECTORS_COUNT);
        spinnerRef.current.innerHTML = '';
        prizes.forEach(({ text }, i) => {
            const rotation = ((prizeSlice * i) * -1) - prizeOffset;
            const div = document.createElement('div');
            div.className = 'prize';
            div.style.setProperty('--rotate', `${rotation}deg`);
            // Добавляем инлайновый стиль для черного текста
            div.innerHTML = `<div class="text" style="color: black; font-weight: bold;">${text}</div>`;
            spinnerRef.current.appendChild(div);
        });
    }, [prizes]);

    const getRandomPrizeIndex = () => Math.floor(Math.random() * SECTORS_COUNT);

    const handleSpin = () => {
        if (isSpinning || balance < spinCost) return;
        setIsSpinning(true);
        setBalance(prev => prev - spinCost);
        setShowModal(false);

        const prizeNodes = spinnerRef.current?.querySelectorAll('.prize');
        prizeNodes?.forEach(node => node.classList.remove('selected'));

        const targetIdx = getRandomPrizeIndex();
        setTargetPrizeIndex(targetIdx);

        const prizeSlice = 360 / SECTORS_COUNT;
        const targetRotation = targetIdx * prizeSlice + prizeSlice / 2;
        const newRotation = 360 * 8 + targetRotation;
        setRotation(newRotation);
    };

    const handleTransitionEnd = () => {
        if (!isSpinning) return;
        const winAmount = Math.floor(Math.random() * 10) + 1;
        setCurrentWin(winAmount);

        const prizeNodes = spinnerRef.current?.querySelectorAll('.prize');
        if (prizeNodes && targetPrizeIndex >= 0) {
            prizeNodes[targetPrizeIndex]?.classList.add('selected');
        }

        setTimeout(() => setShowModal(true), 500);

        setRotation(prev => prev % 360);
        setIsSpinning(false);
        setTargetPrizeIndex(-1);
    };

    const handleGetPrize = () => {
        if (currentWin > 0) {
            setBalance(prev => prev + currentWin);
            if (onWin) onWin(currentWin);
            setCurrentWin(0);
            setShowModal(false);
        }
    };

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
                border: `1px solid ${colors.border}`,
                boxShadow: colors.shadow,
                padding: '25px',
                borderRadius: '25px',
                width: '90%',
                maxWidth: '600px',
                color: colors.text,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.wheel || 'Колесо фортуны'}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>

                <div className="deal-wheel" ref={wheelRef} style={{
                    position: 'relative',
                    display: 'grid',
                    gridGap: 'calc(500px / 20)',
                    alignItems: 'center',
                    gridTemplateAreas: '"spinner" "trigger"',
                    fontSize: 'calc(500px / 21)',
                    margin: '0 auto',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    <div
                        ref={spinnerRef}
                        className="spinner"
                        style={{
                            position: 'relative',
                            display: 'grid',
                            alignItems: 'center',
                            gridTemplateAreas: '"spinner"',
                            width: '100%',
                            aspectRatio: '1/1',
                            transform: `rotate(${rotation}deg)`,
                            borderRadius: '50%',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            transition: isSpinning ? 'transform 3.5s cubic-bezier(0.1, 0.2, 0.35, 1)' : 'none',
                            background: gradientStyle,
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    />

                    <div className="ticker" style={{
                        position: 'relative',
                        left: 'calc(500px / -15)',
                        width: 'calc(500px / 10)',
                        height: 'calc(500px / 20)',
                        background: 'linear-gradient(hsl(0 3% 0%) 0 50%, hsl(0 3% 20%) 50% 100%)',
                        zIndex: 1,
                        clipPath: 'polygon(20% 0, 100% 50%, 20% 100%, 0% 50%)',
                        transformOrigin: 'center left',
                        gridArea: 'spinner',
                        justifySelf: 'center',
                        alignSelf: 'center',
                        animation: isSpinning ? 'tick 700ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
                    }} />

                    <button
                        className="btn-spin"
                        onClick={handleSpin}
                        disabled={isSpinning || balance < spinCost}
                        style={{
                            gridArea: 'trigger',
                            justifySelf: 'center',
                            color: 'white',
                            background: balance < spinCost ? '#666' : '#000',
                            border: 'none',
                            fontSize: 'inherit',
                            padding: '1rem 2.5rem',
                            borderRadius: '8px',
                            cursor: balance < spinCost ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.3s',
                            marginTop: '20px'
                        }}
                    >
                        {balance < spinCost ? 'Недостаточно средств' : `Крутить за ${spinCost}₽`}
                    </button>
                </div>

                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 2100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                        }}>
                            <h2 style={{ color: '#2ecc71', fontSize: '32px', marginBottom: '20px' }}>🎉 Поздравляем!</h2>
                            <p style={{ fontSize: '24px', marginBottom: '30px', color: '#333' }}>Вы выиграли:</p>
                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f1c40f', margin: '20px 0' }}>
                                {currentWin}₽
                            </div>
                            <button
                                onClick={handleGetPrize}
                                style={{
                                    background: '#2ecc71',
                                    color: 'white',
                                    border: 'none',
                                    padding: '15px 40px',
                                    fontSize: '20px',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Получить!
                            </button>
                        </div>
                    </div>
                )}

                <style>{`
                    .prize {
                        display: flex;
                        align-items: center;
                        padding: 0 calc(500px / 6) 0 calc(500px / 20);
                        width: 50%;
                        height: 50%;
                        transform-origin: center right;
                        transform: rotate(var(--rotate));
                        user-select: none;
                        grid-area: spinner;
                    }
                    .prize.selected .text {
                        color: white !important;
                        animation: selected 800ms ease;
                    }
                    @keyframes selected {
                        25% { transform: scale(1.25); text-shadow: 1vmin 1vmin 0 hsla(0 0% 0% / 0.1); }
                        40% { transform: scale(0.92); text-shadow: 0 0 0 hsla(0 0% 0% / 0.2); }
                        60% { transform: scale(1.02); text-shadow: 0.5vmin 0.5vmin 0 hsla(0 0% 0% / 0.1); }
                        75% { transform: scale(0.98); }
                        85% { transform: scale(1); }
                    }
                    @keyframes tick {
                        40% { transform: rotate(-12deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}