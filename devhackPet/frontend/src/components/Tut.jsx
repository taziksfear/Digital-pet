import React, { useEffect, useState } from 'react';

export default function Tut({ stp }) {
    const [ps, setPs] = useState({ t: 0, lf: 0, s: false, tx: '' });

    useEffect(() => {
        let tId = '';
        let txt = '';
        let oY = -60;
        
        // Жестко задаем текст, чтобы избежать ошибки с "Уиии"
        switch (stp) {
            case 1: tId = 'btn-pl'; txt = 'Нажми сюда, чтобы поиграть со свинкой!'; break;
            case 2: tId = 'btn-hm'; txt = 'Она проголодалась! Нажми Домой и покорми её.'; break;
            case 3: tId = 'btn-slp'; txt = 'Свинка устала. Отправь её спать!'; break;
            case 4: tId = 'btn-wrd'; txt = 'Она хочет переодеться! Открой шкаф.'; break;
            case 5: tId = 'cst-snt'; txt = 'Примерь новогодний колпак!'; oY = -40; break;
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
    }, [stp]);

    if (!ps.s) return <div id="t-ovl" className="actv"></div>;
    
    return (
        <div id="t-ovl" className="actv">
            <div id="t-ptr" style={{ left: ps.lf - 25, top: ps.t }}>👇</div>
            <div id="t-msg" style={{ left: ps.lf - 125, top: ps.t - 60 }}>{ps.tx}</div>
        </div>
    );
}