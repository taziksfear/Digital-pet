import React from 'react';

export default function BDock({ cSt, hAct, oMod, l, tStp }) {
    return (
        <div className="btm-isl">
            <button 
                id="btn-hm" 
                className={`d-btn ${cSt === 'idle' ? 'actv' : ''} ${tStp === 2 ? 't-hlt' : ''}`} 
                onClick={() => hAct('idle')}
                disabled={tStp > 0 && tStp !== 2}
            >
                <span className="icn">🏠</span>
                <span className="lbl">{l.hm}</span>
            </button>

            <button 
                id="btn-pl" 
                className={`d-btn ${cSt === 'play' ? 'actv' : ''} ${tStp === 1 ? 't-hlt' : ''}`} 
                onClick={() => hAct('play')}
                disabled={tStp > 0 && tStp !== 1}
            >
                <span className="icn">🎾</span>
                <span className="lbl">{l.pl}</span>
            </button>

            <button 
                id="btn-slp" 
                className={`d-btn ${cSt === 'slp' ? 'actv' : ''} ${tStp === 3 ? 't-hlt' : ''}`} 
                onClick={() => hAct('slp')}
                disabled={tStp > 0 && tStp !== 3}
            >
                <span className="icn">🌙</span>
                <span className="lbl">{l.slp}</span>
            </button>

            <button 
                id="btn-wrd" 
                className={`d-btn ${tStp === 4 ? 't-hlt' : ''}`} 
                onClick={() => oMod('wrd')}
                disabled={tStp > 0 && tStp !== 4}
            >
                <span className="icn">👕</span>
                <span className="lbl">{l.wrd}</span>
            </button>

            <button 
                className="d-btn" 
                onClick={() => oMod('stg')}
                disabled={tStp > 0}
            >
                <span className="icn">⚙️</span>
                <span className="lbl">{l.stg}</span>
            </button>
        </div>
    );
}