import React from 'react';
import Room3D from '../components/Room3D';

export default function SleepView({ character = 'twilight' }) {
    const modelUrl = `/models/${character}/sleep.glb`;

    return (
        <div style={{ 
            width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
            backgroundImage: 'url(/images/sleeproom_bg.png)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}>
            
            <Room3D 
                url={modelUrl} 
                position={[0, 0.5, 0]} 
                rotation={[Math.PI / 2, 10, 0]} 
                scale={1.5} 
                loop={true} 
                hideShadow={true} 
            />

            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(10, 15, 30, 0.83)', pointerEvents: 'none', zIndex: 10 }} />
            
            <div style={{ position: 'absolute', top: '20%', right: '25%', fontSize: '30px', color: '#fff', opacity: 0.8, zIndex: 11, animation: 'float 3s ease-in-out infinite' }}>
                ZzZ...
            </div>
        </div>
    );
}