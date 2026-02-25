import React from 'react';

export default function StOvl({ sts, vis, l }) {
    return (
        <div className={`st-ovl ${vis ? 'vis' : ''}`}>
            
            <div className="st-grp">
                <div className="st-hdr">
                    <span>🍗 {l.hng}</span>
                    <span>{Math.round(sts.hng)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-hng" style={{ width: `${sts.hng}%` }}></div>
                </div>
            </div>

            <div className="st-grp">
                <div className="st-hdr">
                    <span>⚡ {l.eng}</span>
                    <span>{Math.round(sts.eng)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-eng" style={{ width: `${sts.eng}%` }}></div>
                </div>
            </div>

            <div className="st-grp">
                <div className="st-hdr">
                    <span>💖 {l.md}</span>
                    <span>{Math.round(sts.md)}%</span>
                </div>
                <div className="st-bar">
                    <div className="st-fl f-md" style={{ width: `${sts.md}%` }}></div>
                </div>
            </div>

        </div>
    );
}