import React, { useState } from 'react';
import Room3D from '../components/Room3D';

const ALL_ANIMATIONS = ['idle', 'sleep', 'joy_jump', 'hello', 'fall', 'sick', 'eat'];

export default function DevView({ character = 'twilight' }) {
    const [activeAnim, setActiveAnim] = useState('idle');

    return (
        <div style={{ width: '100%', height: '100vh', background: '#261738', position: 'relative' }}>
            <Room3D 
                url={`/models/${character}/${activeAnim}.glb`} 
                posY={-3.0} 
                loop={activeAnim !== 'fall' && activeAnim !== 'hello'} 
            />

            <div style={{
                position: 'absolute', top: '10%', left: '5%', right: '5%',
                background: 'rgba(0,0,0,0.7)', padding: '15px', borderRadius: '15px',
                zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center'
            }}>
                <h3 style={{ width: '100%', textAlign: 'center', color: 'white', margin: '0 0 10px 0' }}>
                    🛠 DEV MODE: Тест анимаций
                </h3>
                {ALL_ANIMATIONS.map(anim => (
                    <button 
                        key={anim}
                        onClick={() => setActiveAnim(anim)}
                        style={{
                            padding: '8px 12px', borderRadius: '8px', border: 'none',
                            background: activeAnim === anim ? '#3498db' : '#555',
                            color: 'white', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        {anim}
                    </button>
                ))}
            </div>
        </div>
    );
}