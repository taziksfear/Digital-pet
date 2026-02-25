import React, { useState, useEffect, useRef } from 'react';
import PRnd from './classes/PRnd';
import BDock from './components/BDock';
import StOvl from './components/StOvl';
import Tut from './components/Tut';
import WxOvl from './components/WxOvl';
import NMod from './components/NMod';
import { getPSt, sndAct } from './utils/api';
import { loc } from './loc';
import './index.css';

function MScrn({ st, cstm, char, clk }) {
    const cRef = useRef(null), pRef = useRef(null);
    useEffect(() => { pRef.current = new PRnd(cRef.current); pRef.current.srt(); return () => pRef.current.stp(); }, []);
    useEffect(() => { if (pRef.current) pRef.current.upd(st, cstm, char); }, [st, cstm, char]);
    return <div className="p-stg" onClick={clk}><canvas ref={cRef} width="300" height="300"></canvas></div>;
}

export default function App() {
    // Состояния питомца
    const [sts, setSts] = useState({ hng: 50, eng: 80, md: 10 });
    const [pSt, setPSt] = useState('brd'); 
    const [cstm, setCstm] = useState('none');
    const [char, setChar] = useState('pig'); 
    const [pNm, setPNm] = useState(''); 
    
    // Настройки интерфейса (грузим из памяти браузера)
    const [th, setTh] = useState(localStorage.getItem('pet_th') || 'lgt'); 
    const [lng, setLng] = useState(localStorage.getItem('pet_lng') || 'ru'); 
    const [cty, setCty] = useState(localStorage.getItem('pet_cty') || 'Moscow'); 
    const [wx, setWx] = useState('clr'); 
    
    // Состояние окон и UI
    const [nMVis, setNMVis] = useState(false); 
    const [sVis, setSVis] = useState(false); 
    const [txt, setTxt] = useState('');
    const [aMod, setAMod] = useState(null); 
    const [wTb, setWTb] = useState('chr'); 
    
    // Туториал
    const [tStp, setTStp] = useState(1); 
    const [tPsd, setTPsd] = useState(false); 

    const l = loc[lng]; 

    const shwTxt = (msg) => { setTxt(msg); setTimeout(() => setTxt(''), 3000); };
    const shwSts = () => { setSVis(true); setTimeout(() => setSVis(false), 4000); };

    // Синхронизация с сервером
    const syncApi = async () => {
        const d = await getPSt();
        if (d) {
            setSts({ hng: d.hng, eng: d.eng, md: d.md });
            if (d.nm) setPNm(d.nm);
            if (d.char) setChar(d.char);
            if (d.cstm) setCstm(d.cstm);
            
            // Если туториал в БД пройден (tut === 0), выключаем его
            if (d.tut === 0) {
                setTStp(0);
                setPSt(d.st); 
            }
        }
    };

    const fchWx = () => setWx(['clr', 'rn', 'snw'][Math.floor(Math.random() * 3)]);
    const nxStp = (nx) => { setTPsd(true); setTimeout(() => { setTStp(nx); setTPsd(false); }, 2500); };

    const hAct = (act, pLd = '') => {
        if (tPsd) return; 

        if (tStp > 0) {
            if (tStp === 1 && act !== 'play') return;
            if (tStp === 2 && act !== 'idle') return;
            if (tStp === 3 && act !== 'slp') return;
            if (tStp === 5 && act !== 'eq_snt') return;
        }

        let sAct = act;
        if (act === 'play') sAct = 'pl';
        if (act === 'idle') sAct = 'fd';
        if (act === 'set_chr') { setChar(pLd); sAct = 'set_char'; }
        if (act === 'eq_snt') { setCstm('snt'); sAct = 'eq_snt'; }
        if (act === 'eq_non') { setCstm('none'); sAct = 'eq_non'; }

        // Мгновенный отклик интерфейса (оптимистичный UI)
        setSts(p => {
            let n = { ...p };
            if (sAct === 'fd') { n.hng = Math.min(100, n.hng + 25); n.eng = Math.max(0, n.eng - 5); }
            if (sAct === 'pl') { n.md = Math.min(100, n.md + 30); n.eng = Math.max(0, n.eng - 15); }
            if (sAct === 'slp') { n.eng = Math.min(100, n.eng + 20); }
            return n;
        });

        // Отправляем на бэкенд
        sndAct(sAct, pLd).then(d => { if (d) setSts({ hng: d.hng, eng: d.eng, md: d.md }); }).catch(()=>{});

        switch (act) {
            case 'play': setPSt('play'); shwTxt(l.pl_t); if (tStp === 1) nxStp(2); break;
            case 'idle': setPSt('idle'); shwTxt(l.fd_t); if (tStp === 2) nxStp(3); break;
            case 'slp': setPSt('slp'); shwTxt(l.slp_t); if (tStp === 3) nxStp(4); break;
            case 'eq_snt': 
                setAMod(null); 
                if (tStp === 5) { 
                    setTStp(0); 
                    sndAct('tut_dn'); 
                    shwTxt(l.tut_dn); 
                    setTimeout(() => { if (!pNm) setNMVis(true); }, 2000); 
                } 
                break;
            case 'eq_non': setAMod(null); break;
            default: break;
        }
        shwSts();
    };

    const oMod = (t) => {
        if (tPsd || (tStp > 0 && tStp !== 4)) return; 
        setAMod(t);
        if (tStp === 4 && t === 'wrd') { setPSt('idle'); setWTb('cst'); setTStp(5); }
    };

    // Сохраняем настройки в localStorage при их изменении
    useEffect(() => { localStorage.setItem('pet_th', th); }, [th]);
    useEffect(() => { localStorage.setItem('pet_lng', lng); }, [lng]);
    useEffect(() => { localStorage.setItem('pet_cty', cty); }, [cty]);

    useEffect(() => { document.documentElement.className = `t-${th}`; }, [th]);
    useEffect(() => { document.body.classList.toggle('t-on', tStp > 0 && !tPsd); }, [tStp, tPsd]);
    useEffect(() => { fchWx(); }, [cty]);
    
    useEffect(() => { syncApi(); const i = setInterval(syncApi, 3000); return () => clearInterval(i); }, []);

    // Вычисляем текущий фон
    let bgCls = 'bg-hm'; 
    if (pSt === 'play') bgCls = 'bg-pl'; 
    if (aMod === 'wrd') bgCls = 'bg-wrd'; 

    return (
        <div className={`app-cnt ${bgCls}`}>
            <WxOvl wx={wx} />
            {pNm && <div className="p-nm-lbl">{pNm}</div>}

            <MScrn st={pSt} cstm={cstm} char={char} clk={() => { if (tStp === 0) shwSts(); }} />
            
            <div className={`st-txt ${txt ? 'vis' : ''}`}>{txt}</div>
            <StOvl sts={sts} vis={sVis} l={l} />
            <BDock cSt={pSt} hAct={hAct} oMod={oMod} l={l} tStp={tStp} />

            <div className={`modl ${aMod ? 'opn' : ''}`}>
                <div className="m-hdr">
                    <h3>{aMod === 'wrd' ? l.wrd : l.stg}</h3>
                    <button className="c-btn" onClick={() => setAMod(null)}>✖</button>
                </div>
                
                {aMod === 'wrd' && (
                    <div className="wrd-wrp">
                        <div className="tbs">
                            <button className={`tb ${wTb === 'chr' ? 'act' : ''}`} onClick={() => setWTb('chr')}>{l.tb_c}</button>
                            <button className={`tb ${wTb === 'cst' ? 'act' : ''}`} onClick={() => setWTb('cst')}>{l.tb_s}</button>
                        </div>
                        
                        {wTb === 'chr' && (
                            <div className="m-cnt">
                                <div className={`i-crd ${char==='pig'?'sel':''}`} onClick={()=>hAct('set_chr','pig')}><div className="i-icn">🐷</div><div className="i-nm">{l.p_pg}</div></div>
                                <div className={`i-crd ${char==='fluffy'?'sel':''}`} onClick={()=>hAct('set_chr','fluffy')}><div className="i-icn">🐾</div><div className="i-nm">{l.p_fl}</div></div>
                                <div className={`i-crd ${char==='eye'?'sel':''}`} onClick={()=>hAct('set_chr','eye')}><div className="i-icn">👁️</div><div className="i-nm">{l.p_ey}</div></div>
                            </div>
                        )}
                        {wTb === 'cst' && (
                            <div className="m-cnt">
                                <div id="cst-snt" className={`i-crd ${tStp === 5 ? 't-hlt' : ''} ${cstm==='snt'?'sel':''}`} onClick={() => hAct('eq_snt')} style={{ opacity: (tStp > 0 && tStp !== 5) ? 0.4 : 1, pointerEvents: (tStp > 0 && tStp !== 5) ? 'none' : 'auto' }}><div className="i-icn">🎅</div><div className="i-nm">Колпак</div></div>
                                <div className={`i-crd ${cstm==='none'?'sel':''}`} onClick={() => hAct('eq_non')}><div className="i-icn">❌</div><div className="i-nm">{l.rmv}</div></div>
                            </div>
                        )}
                    </div>
                )}

                {aMod === 'stg' && (
                    <div className="m-cnt" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="s-row">
                            <span>{l.th_t}</span>
                            <label className="swch"><input type="checkbox" checked={th === 'drk'} onChange={() => setTh(th === 'lgt' ? 'drk' : 'lgt')} /><span className="swch-sld"></span></label>
                        </div>
                        <div className="s-row">
                            <span>{l.ln_t}</span>
                            <label className="swch"><input type="checkbox" checked={lng === 'en'} onChange={() => setLng(lng === 'ru' ? 'en' : 'ru')} /><span className="swch-sld"></span></label>
                        </div>
                        <div className="s-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span>{l.cty}</span><input className="c-inp" value={cty} onChange={e => setCty(e.target.value)} onBlur={fchWx} />
                        </div>
                    </div>
                )}
            </div>

            {nMVis && <NMod l={l} sNm={(nm) => { sndAct('set_nm', nm).catch(()=>{}); setPNm(nm); setNMVis(false); }} />}
            {tStp > 0 && !tPsd && <Tut stp={tStp} l={l} />}
        </div>
    );
}