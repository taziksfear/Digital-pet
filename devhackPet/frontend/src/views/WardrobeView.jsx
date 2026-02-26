import React, { useState } from 'react';

export default function WardrobeView({ text, character, costume, handleAction, tutStep }) {
    const [wTb, setWTb] = useState('chr');

    return (
        <div className="v-scrn">
            <div className="m-hdr"><h3>{text.wrd}</h3></div>
            <div className="tbs">
                <button className={`tb ${wTb === 'chr' ? 'act' : ''}`} onClick={() => setWTb('chr')}>{text.tb_c}</button>
                <button className={`tb ${wTb === 'cst' ? 'act' : ''}`} onClick={() => setWTb('cst')}>{text.tb_s}</button>
            </div>
            
            {wTb === 'chr' && (
                <div className="m-cnt">
                    <div className={`i-crd ${character === 'pig' ? 'sel' : ''}`} onClick={() => handleAction('set_char', 'pig')}><div className="i-icn">🐷</div><div className="i-nm">{text.p_pg}</div></div>
                    <div className={`i-crd ${character === 'fluffy' ? 'sel' : ''}`} onClick={() => handleAction('set_char', 'fluffy')}><div className="i-icn">🐾</div><div className="i-nm">{text.p_fl}</div></div>
                    <div className={`i-crd ${character === 'eye' ? 'sel' : ''}`} onClick={() => handleAction('set_char', 'eye')}><div className="i-icn">👁️</div><div className="i-nm">{text.p_ey}</div></div>
                </div>
            )}
            {wTb === 'cst' && (
                <div className="m-cnt">
                    <div id="cst-snt" className={`i-crd ${tutStep === 5 ? 't-hlt' : ''} ${costume === 'snt' || costume === 'santa' ? 'sel' : ''}`} onClick={() => handleAction('equip_santa')} style={{ opacity: (tutStep > 0 && tutStep !== 5) ? 0.4 : 1, pointerEvents: (tutStep > 0 && tutStep !== 5) ? 'none' : 'auto' }}><div className="i-icn">🎅</div><div className="i-nm">Колпак</div></div>
                    <div className={`i-crd ${costume === 'none' ? 'sel' : ''}`} onClick={() => handleAction('equip_none')}><div className="i-icn">❌</div><div className="i-nm">{text.rmv}</div></div>
                </div>
            )}
        </div>
    );
}