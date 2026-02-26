import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// Предзагрузка файлов для мгновенного переключения
useGLTF.preload('/models/idle.glb');
useGLTF.preload('/models/sleep.glb');
useGLTF.preload('/models/joy_jump.glb');
useGLTF.preload('/models/hello.glb');
useGLTF.preload('/models/fall.glb');
useGLTF.preload('/models/sick.glb');
useGLTF.preload('/models/eat.glb');

function PetModel({ url, loop = true, posY = -3.0, onInteract }) {
    // Добавили ref для группы, чтобы анимации знали, где искать кости
    const group = useRef();
    const { scene, animations } = useGLTF(url);
    
    // 🔥 МАГИЯ ЗДЕСЬ: Правильное клонирование со скелетом!
    const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    
    // Привязываем анимации к нашей группе
    const { actions, mixer } = useAnimations(animations, group);

    useLayoutEffect(() => {
        // Надежный способ: берем самую первую анимацию из файла (как делает твой тиммейт)
        if (!animations || animations.length === 0) return;
        
        const clipName = animations[0].name;
        const action = actions[clipName];

        if (action) {
            action.reset();
            
            // Настройка зацикливания
            if (!loop) {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true; // Замереть в конце (для падения)
            } else {
                action.setLoop(THREE.LoopRepeat, Infinity);
            }
            
            action.play();
            
            // Мгновенно применяем позу до того, как браузер нарисует картинку
            mixer.update(0);
        }

        return () => {
            if (action) action.stop();
        };
    }, [url, actions, mixer, loop, animations]);

    return (
        <group ref={group} dispose={null} onClick={onInteract}>
            <primitive object={clonedScene} position={[0, posY, 0]} rotation={[0, 0, 0]} scale={2.2} />
        </group>
    );
}

// === ВЕСЬ ОСТАЛЬНОЙ КОД ОСТАЕТСЯ БЕЗ ИЗМЕНЕНИЙ ===
export default function MainScreen({ currentView, stats, isEating, isGreeting }) {
    const [isPetting, setIsPetting] = useState(false);

    // Логика переключения: теперь мы просто возвращаем ПУТЬ К ФАЙЛУ (url)
    const getAnimationState = () => {
        if (isGreeting) return { url: '/models/hello.glb', loop: false, posY: -3.0 };

        let criticalCount = 0;
        if (stats?.hunger <= 15) criticalCount++;
        if (stats?.energy <= 15) criticalCount++;
        if (stats?.mood <= 15) criticalCount++;

        if (currentView !== 'wardrobe' && currentView !== 'sleep') {
            if (criticalCount >= 2) return { url: '/models/fall.glb', loop: false, posY: -3.0 };
            if (criticalCount === 1) return { url: '/models/sick.glb', loop: true, posY: -3.0 };
        }

        switch (currentView) {
            case 'sleep': return { url: '/models/sleep.glb', loop: true, posY: -1.8 };
            case 'wardrobe': return { url: '/models/idle.glb', loop: true, posY: -3.0 };
            case 'play': return { url: isPetting ? '/models/joy_jump.glb' : '/models/idle.glb', loop: true, posY: -3.0 };
            case 'home': return { url: isEating ? '/models/eat.glb' : '/models/idle.glb', loop: true, posY: -3.0 };
            default: return { url: '/models/idle.glb', loop: true, posY: -3.0 };
        }
    };

    const animState = getAnimationState();

    const handleInteract = (e) => {
        e.stopPropagation();
        if (currentView === 'play' && animState.url !== '/models/fall.glb') {
            setIsPetting(true);
            setTimeout(() => setIsPetting(false), 2000);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 5 }}>
            <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />

                <PetModel url={animState.url} loop={animState.loop} posY={animState.posY} onInteract={handleInteract} />

                {currentView !== 'sleep' && (
                    <ContactShadows position={[0, -3.0, 0]} opacity={0.4} scale={5} blur={2} />
                )}
                
                <OrbitControls target={[0, 0, 0]} enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}