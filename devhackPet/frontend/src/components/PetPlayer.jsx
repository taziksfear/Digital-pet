import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export default function PetPlayer({ url, position = [0, -3.0, 0], rotation = [0, 0, 0], scale = 2.2, loop = true, onInteract }) {
    const group = useRef();
    const { scene, animations } = useGLTF(url);
    const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { actions, mixer } = useAnimations(animations, group);

    useLayoutEffect(() => {
        if (!animations || animations.length === 0) return;

        const actionName = animations[0].name;
        const action = actions[actionName];

        if (action) {
            action.reset();
            if (!loop) {
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
            } else {
                action.setLoop(THREE.LoopRepeat, Infinity);
            }
            
            action.play();
            mixer.update(0);
        }

        return () => {
            if (action) action.stop();
        };
    }, [url, actions, mixer, loop, animations]);

    return (
        <group ref={group} dispose={null} onClick={onInteract}>
            <primitive object={clonedScene} position={position} rotation={rotation} scale={scale} />
        </group>
    );
}