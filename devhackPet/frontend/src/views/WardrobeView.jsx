import React from 'react';
import Room3D from '../components/Room3D';

export default function WardrobeView({ character = 'twilight' }) {
    const modelUrl = `/models/${character}/idle.glb`;

    return (
        <div style={{ 
            width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
            backgroundImage: 'url(/images/dressroom_bg.png)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        }}>
            
            <Room3D 
                url={modelUrl} 
                posY={-3.0}
                scale={2.2}
                loop={true} 
            />

            <div style={{ position: 'absolute', top: '10%', width: '100%', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
                <span style={{ backgroundColor: '#fff', color: '#8ca6db', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    ✨ Гардероб
                </span>
            </div>
        </div>
    );
}