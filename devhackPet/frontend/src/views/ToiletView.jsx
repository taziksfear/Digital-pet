import React, { useEffect } from 'react';
import Room3D from '../components/Room3D';

export default function ToiletView({ character = 'twilight', stats, setStats, sendAction }) {
    const modelUrl = `/models/${character}/toilet.glb`;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'url(/images/toilet_bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Room3D
                url={modelUrl}
                position={[0, -2.5, 0]}
                scale={2.2}
                loop={true}
            />
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.9)',
                padding: '10px 20px',
                borderRadius: '30px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                zIndex: 10
            }}>
                🚽 Туалет: {Math.round(stats.tl || 50)}%
            </div>
        </div>
    );
}