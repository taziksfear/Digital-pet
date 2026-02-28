import React from 'react';
import { ToggleSwitch } from './SharedUI';

export function SettingsModal({ onClose, l, colors, theme, setTheme, language, setLanguage, city, setCity, fetchWeather, isDark, isDevMode, setIsDevMode }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '320px', color: colors.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>{l.settings}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', fontSize: '18px', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.theme}:</span><ToggleSwitch isOn={isDark} onToggle={() => setTheme(isDark ? 'lgt' : 'drk')} iconOn="🌙" iconOff="☀️" isDark={isDark} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.lang}:</span><ToggleSwitch isOn={language === 'en'} onToggle={() => setLanguage(language === 'ru' ? 'en' : 'ru')} iconOn="EN" iconOff="RU" isDark={isDark} /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold' }}>{l.city}:</span><input type="text" value={city} onChange={e => setCity(e.target.value)} onBlur={fetchWeather} style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', border: `1px solid ${colors.border}`, color: colors.text, padding: '8px', borderRadius: '12px', width: '100px', textAlign: 'center' }} /></div>
                </div>
                <hr style={{ margin: '25px 0', borderColor: colors.border }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)', padding: '10px 15px', borderRadius: '15px', border: `1px solid ${colors.border}` }}>
                    <span style={{ fontWeight: 'bold', color: '#ff7675' }}>🛠 {l.devMode}</span><ToggleSwitch isOn={isDevMode} onToggle={() => setIsDevMode(!isDevMode)} iconOn="ON" iconOff="OFF" isDark={isDark} />
                </div>
            </div>
        </div>
    );
}

export function ShopModal({ onClose, l, colors, handlePurchase }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, boxShadow: colors.shadow, padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '650px', color: colors.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>{l.shop}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', width: '140px', textAlign: 'center' }}>
                        <h3 style={{ margin: '10px 0 5px' }}>Горсть</h3>
                        <p>100 {l.coins}</p>
                        <button onClick={() => handlePurchase(100)} style={{ background: '#8ac6d1', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', width: '100%' }}>{l.buy}</button>
                    </div>
                    <div style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', width: '140px', textAlign: 'center' }}>
                        <h3 style={{ margin: '10px 0 5px' }}>Мешок</h3>
                        <p>500 {l.coins}</p>
                        <button onClick={() => handlePurchase(500)} style={{ background: '#8ac6d1', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', width: '100%' }}>{l.buy}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function GamesModal({ onClose, l, colors, handleGameSelect, openSlots }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '350px', color: colors.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.gamesModalTitle}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div 
                        onClick={openSlots} 
                        style={{ background: 'linear-gradient(135deg, #f39c12, #d35400)', border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(211, 84, 0, 0.4)' }}
                    >
                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '18px' }}>🎰 Денежные Слоты</span>
                    </div>

                    
                </div>
            </div>
        </div>
    );
}
export function QuestsModal({ onClose, l, colors, quests, claimQuestReward, claimingQuestId }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '500px', color: colors.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.questsModalTitle}</h2>
                    <button onClick={onClose} style={{ background: colors.border, border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {quests.map(q => (
                        <div key={q.id} style={{ background: colors.glassBg, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '15px', opacity: q.claimed ? 0.6 : 1, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>{l[q.titleKey]}</h3>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}>{q.progress}/{q.target}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 5px', color: '#ffaa00' }}>+{q.reward}💰</p>
                                {q.completed && !q.claimed && (
                                    <button onClick={() => claimQuestReward(q.id)} disabled={claimingQuestId === q.id} style={{ background: '#8ac6d1', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer' }}>{l.claim}</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function VoiceModal({ onClose, l, colors, isRecording, startRecording, stopRecording, audioUrl, sendRecording, isSending, restartRecording, cancelRecording }) {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: colors.modalBg, backdropFilter: 'blur(20px)', border: `1px solid ${colors.border}`, padding: '25px', borderRadius: '25px', width: '85%', maxWidth: '400px', color: colors.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{l.voiceModalTitle}</h2>
                    <button onClick={cancelRecording} style={{ background: colors.border, border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: colors.text, cursor: 'pointer' }}>✖</button>
                </div>
                {!audioUrl ? (
                    <div style={{ textAlign: 'center' }}>
                        {isRecording ? (
                            <div>
                                <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>{l.recording}</p>
                                <button onClick={stopRecording} style={{ margin: '10px', padding: '10px 20px', background: '#ff6b6b', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.stopRecord}</button>
                            </div>
                        ) : (
                            <button onClick={startRecording} style={{ padding: '10px 20px', background: '#8ac6d1', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.startRecord}</button>
                        )}
                    </div>
                ) : (
                    <div>
                        <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '15px' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={sendRecording} disabled={isSending} style={{ padding: '10px 20px', background: '#4caf50', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.send}</button>
                            <button onClick={restartRecording} style={{ padding: '10px 20px', background: '#ffaa00', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>{l.restart}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}