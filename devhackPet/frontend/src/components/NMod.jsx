import React, { useState } from 'react';

export default function NMod({ l, sNm }) {
    const [v, setV] = useState('');

    return (
        <div className="modl opn" style={{ zIndex: 2000 }}>
            <div className="m-hdr">
                <h3>{l.nm_q}</h3>
            </div>
            
            <div className="m-cnt" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
                <input 
                    className="n-inp" 
                    value={v} 
                    onChange={e => setV(e.target.value)} 
                    placeholder="Name..." 
                />
                
                <button 
                    className="d-btn-lg" 
                    onClick={() => { if (v) sNm(v); }}
                >
                    {l.sv}
                </button>
            </div>
        </div>
    );
}