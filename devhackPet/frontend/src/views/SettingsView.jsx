import React from 'react';

export default function SettingsView({ text, theme, setTheme, lang, setLang, city, setCity, fetchWeather }) {
    return (
        <div className="v-scrn">
            <div className="m-hdr"><h3>{text.stg}</h3></div>
            <div className="m-cnt" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="s-row">
                    <span>{text.th_t}</span>
                    <label className="swch"><input type="checkbox" checked={theme === 'drk'} onChange={() => setTheme(theme === 'lgt' ? 'drk' : 'lgt')} /><span className="swch-sld"></span></label>
                </div>
                <div className="s-row">
                    <span>{text.ln_t}</span>
                    <label className="swch"><input type="checkbox" checked={lang === 'en'} onChange={() => setLang(lang === 'ru' ? 'en' : 'ru')} /><span className="swch-sld"></span></label>
                </div>
                <div className="s-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span>{text.cty}</span><input className="c-inp" value={city} onChange={e => setCity(e.target.value)} onBlur={fetchWeather} />
                </div>
            </div>
        </div>
    );
}