import React, { useEffect, useRef } from 'react';
import PetRenderer from '../classes/PetRenderer';

export default function MainScreen({ state, costume, character }) {
    const canvasRef = useRef(null);
    const petRef = useRef(null);

    useEffect(() => {
        petRef.current = new PetRenderer(canvasRef.current);
        petRef.current.srt(); 
        return () => petRef.current.stp();
    }, []);

    useEffect(() => {
        if (petRef.current) {
            petRef.current.upd(state, costume, character);
        }
    }, [state, costume, character]);

    return (
        <div className="p-stg">
            <canvas ref={canvasRef} width="300" height="300"></canvas>
        </div>
    );
}