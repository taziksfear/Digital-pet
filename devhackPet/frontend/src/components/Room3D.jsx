import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import PetPlayer from './PetPlayer';

export default function Room3D({ url, position, rotation, scale, posY = -3.0, loop = true, onInteract, hideShadow = false }) {
    const finalPos = position || [0, posY, 0];
    const finalRot = rotation || [0, 0, 0];

    const finalScale = scale || 2.2; 

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 5 }}>
            <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />

                <Suspense fallback={null}>
                    <PetPlayer 
                        key={url} 
                        url={url} 
                        position={finalPos} 
                        rotation={finalRot} 
                        scale={finalScale}
                        loop={loop} 
                        onInteract={onInteract} 
                    />
                </Suspense>

                {!hideShadow && (
                    <ContactShadows position={[0, -3.0, 0]} opacity={0.4} scale={5} blur={2} />
                )}
                
                <OrbitControls enableRotate={false} target={[0, 0, 0]} enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}