import React from 'react';

export default function BottomDock({ currentView, handleNavigation, text, tutStep }) {
    return (
        <div className="btm-isl">
            <button 
                id="btn-hm" 
                className={`d-btn ${currentView === 'home' ? 'actv' : ''} ${tutStep === 2 ? 't-hlt' : ''}`} 
                onClick={() => handleNavigation('home')}
                disabled={tutStep > 0 && tutStep !== 2}
            >
                <span className="icn">🏠</span>
                <span className="lbl">{text.hm}</span>
            </button>

            <button 
                id="btn-pl" 
                className={`d-btn ${currentView === 'play' ? 'actv' : ''} ${tutStep === 1 ? 't-hlt' : ''}`} 
                onClick={() => handleNavigation('play')}
                disabled={tutStep > 0 && tutStep !== 1}
            >
                <span className="icn">🎾</span>
                <span className="lbl">{text.pl}</span>
            </button>

            <button 
                id="btn-slp" 
                className={`d-btn ${currentView === 'sleep' ? 'actv' : ''} ${tutStep === 3 ? 't-hlt' : ''}`} 
                onClick={() => handleNavigation('sleep')}
                disabled={tutStep > 0 && tutStep !== 3}
            >
                <span className="icn">🌙</span>
                <span className="lbl">{text.slp}</span>
            </button>

            <button 
                id="btn-wrd" 
                className={`d-btn ${currentView === 'wardrobe' ? 'actv' : ''} ${tutStep === 4 ? 't-hlt' : ''}`} 
                onClick={() => handleNavigation('wardrobe')}
                disabled={tutStep > 0 && tutStep !== 4}
            >
                <span className="icn">👕</span>
                <span className="lbl">{text.wrd}</span>
            </button>

            <button 
                className={`d-btn ${currentView === 'settings' ? 'actv' : ''}`} 
                onClick={() => handleNavigation('settings')}
                disabled={tutStep > 0}
            >
                <span className="icn">⚙️</span>
                <span className="lbl">{text.stg}</span>
            </button>
        </div>
    );
}