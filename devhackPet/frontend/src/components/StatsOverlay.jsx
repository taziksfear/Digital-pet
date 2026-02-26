import React from 'react';

export default function StatsOverlay({ stats, text }) {
    return (
        <div className="st-ovl vis">
            <div className="st-grp">
                <div className="st-hdr">
                    <span>🍗 {text.hng}</span>
                    <span>{Math.round(stats.hunger)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-hng" style={{ width: `${stats.hunger}%` }}></div>
                </div>
            </div>

            <div className="st-grp">
                <div className="st-hdr">
                    <span>⚡ {text.eng}</span>
                    <span>{Math.round(stats.energy)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-eng" style={{ width: `${stats.energy}%` }}></div>
                </div>
            </div>

            <div className="st-grp">
                <div className="st-hdr">
                    <span>💖 {text.md}</span>
                    <span>{Math.round(stats.mood)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-md" style={{ width: `${stats.mood}%` }}></div>
                </div>
            </div>
        </div>
    );
}