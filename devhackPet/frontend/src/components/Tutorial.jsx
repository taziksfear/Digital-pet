import React, { useEffect, useState } from 'react';

export default function Tutorial({ tutStep, text }) {
    const [ps, setPs] = useState({ t: 0, lf: 0, s: false, tx: '' });

    useEffect(() => {
        let tId = '';
        let txt = '';
        let oY = -60;
        
        switch (tutStep) {
            case 1: tId = 'btn-pl'; txt = text.t1; break;
            case 2: tId = 'btn-hm'; txt = text.t2; break;
            case 3: tId = 'btn-slp'; txt = text.t3; break;
            case 4: tId = 'btn-wrd'; txt = text.t4; break;
            case 5: tId = 'cst-snt'; txt = text.t5; oY = -40; break;
            default: return;
        }

        const tmr = setTimeout(() => {
            const el = document.getElementById(tId);
            if (el) {
                const rct = el.getBoundingClientRect();
                setPs({ 
                    s: true, 
                    lf: rct.left + rct.width / 2, 
                    t: rct.top + oY, 
                    tx: txt 
                });
            }
        }, 100);

        return () => clearTimeout(tmr);
    }, [tutStep, text]);

    if (!ps.s) return <div id="t-ovl" className="actv"></div>;
    
    return (
        <div id="t-ovl" className="actv">
            <div id="t-ptr" style={{ left: ps.lf - 25, top: ps.t }}>👇</div>
            <div id="t-msg" style={{ left: ps.lf - 125, top: ps.t - 60 }}>{ps.tx}</div>
        </div>
    );
}