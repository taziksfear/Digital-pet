import React, { useEffect, useRef } from 'react';
import PRnd from '../classes/PRnd';

export default function MScrn({ st, cstm, clk }) {
    const cRef = useRef(null);
    const pRef = useRef(null);

    useEffect(() => {
        pRef.current = new PRnd(cRef.current);
        pRef.current.srt();
        return () => pRef.current.stp();
    }, []);

    useEffect(() => { if (pRef.current) pRef.current.upd(st, cstm); }, [st, cstm]);

    return (
        <div className="p-stg" onClick={clk}>
            <canvas ref={cRef} width="300" height="300"></canvas>
        </div>
    );
}