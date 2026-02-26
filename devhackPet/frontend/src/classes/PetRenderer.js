export default class PRnd {
    constructor(cvs) {
        this.ctx = cvs.getContext('2d');
        this.tm = 0; this.st = 'brd'; this.cst = 'none'; this.chr = 'pig'; this.aId = null;
    }
    upd(st, cst, chr) { this.st = st; this.cst = cst; this.chr = chr; }
    srt() {
        const drw = () => {
            const c = this.ctx;
            c.clearRect(0, 0, 300, 300); this.tm += 0.05;
            c.shadowColor = 'rgba(0,0,0,0.15)'; c.shadowBlur = 10; c.shadowOffsetY = 5;

            let bY = 180 + Math.sin(this.tm)*2, hY = 120 + Math.sin(this.tm)*3;
            if (this.st === 'brd') hY += 10;
            else if (this.st === 'play') { bY -= Math.abs(Math.sin(this.tm*3)*15); hY = bY - 60; }

            // 1. СВИНКА
            if (this.chr === 'pig') {
                c.fillStyle = '#f5a4b5'; c.beginPath(); c.ellipse(150, bY, 45, 55, 0, 0, 2*Math.PI); c.fill(); 
                c.fillStyle = '#e08b9c'; c.beginPath(); c.ellipse(130, bY+50, 15, 20, 0, 0, 2*Math.PI); c.fill(); c.beginPath(); c.ellipse(170, bY+50, 15, 20, 0, 0, 2*Math.PI); c.fill(); 
                c.beginPath(); 
                if (this.st === 'brd') { c.ellipse(100, bY+10, 12, 35, 0.3, 0, 2*Math.PI); c.fill(); c.beginPath(); c.ellipse(200, bY+10, 12, 35, -0.3, 0, 2*Math.PI); c.fill(); }
                else if (this.st === 'play') { c.ellipse(90, bY-20, 12, 35, -0.8, 0, 2*Math.PI); c.fill(); c.beginPath(); c.ellipse(210, bY-20, 12, 35, 0.8, 0, 2*Math.PI); c.fill(); }
                else { c.ellipse(100, bY, 12, 30, 0.5, 0, 2*Math.PI); c.fill(); c.beginPath(); c.ellipse(200, bY, 12, 30, -0.5, 0, 2*Math.PI); c.fill(); }
                c.fillStyle = '#f28b9c'; c.beginPath(); c.ellipse(150, hY, 55, 50, 0, 0, 2*Math.PI); c.fill(); 
                c.fillStyle = '#e06b6b'; c.beginPath(); c.ellipse(150, hY+10, 18, 12, 0, 0, 2*Math.PI); c.fill(); 
                c.fillStyle = '#4a2a2a'; c.beginPath(); c.arc(143, hY+10, 3, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(157, hY+10, 3, 0, 2*Math.PI); c.fill();
                c.fillStyle = '#fff'; c.beginPath(); c.arc(125, hY-10, 12, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(175, hY-10, 12, 0, 2*Math.PI); c.fill(); 
                c.fillStyle = '#2d1e1e';
                if (this.st === 'brd') { c.beginPath(); c.arc(125, hY-10, 6, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(175, hY-10, 6, 0, 2*Math.PI); c.fill(); c.fillStyle='#f28b9c'; c.fillRect(110, hY-25, 30, 15); c.fillRect(160, hY-25, 30, 15); }
                else if (this.st === 'slp') { c.fillRect(115, hY-10, 20, 4); c.fillRect(165, hY-10, 20, 4); }
                else { c.beginPath(); c.arc(125, hY-10, 6, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(175, hY-10, 6, 0, 2*Math.PI); c.fill(); }
            } 
            // 2. ПУХЛЯШ
            else if (this.chr === 'fluffy') {
                c.fillStyle = '#ffd8b0'; c.beginPath(); c.ellipse(150, hY+20, 70, 75, 0, 0, 2*Math.PI); c.fill();
                c.fillStyle = '#f0b892'; c.save(); c.translate(95, hY-10); c.rotate(-0.2 + Math.sin(this.tm)*0.1); c.beginPath(); c.ellipse(0, 0, 15, 35, 0, 0, 2*Math.PI); c.fill(); c.restore();
                c.save(); c.translate(205, hY-10); c.rotate(0.2 + Math.cos(this.tm)*0.1); c.beginPath(); c.ellipse(0, 0, 15, 35, 0, 0, 2*Math.PI); c.fill(); c.restore();
                c.fillStyle = '#fff'; c.beginPath(); c.arc(115, hY+10, 14, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(185, hY+10, 14, 0, 2*Math.PI); c.fill();
                c.fillStyle = '#563e2c'; 
                if (this.st === 'slp') { c.fillRect(105, hY+10, 20, 4); c.fillRect(175, hY+10, 20, 4); }
                else { c.beginPath(); c.arc(115, hY+10, 7, 0, 2*Math.PI); c.fill(); c.beginPath(); c.arc(185, hY+10, 7, 0, 2*Math.PI); c.fill(); }
                c.strokeStyle = '#b14b4b'; c.lineWidth = 4; c.beginPath(); c.arc(150, hY+40, 20, 0.1, Math.PI-0.1); c.stroke();
            }
            // 3. ГЛАЗАСТИК
            else if (this.chr === 'eye') {
                const g = c.createRadialGradient(120, hY, 20, 150, hY, 100); g.addColorStop(0, '#9fd9d9'); g.addColorStop(0.6, '#349b9b');
                c.fillStyle = g; c.beginPath(); c.ellipse(150, hY+30, 80, 85, 0, 0, Math.PI*2); c.fill();
                c.fillStyle = '#fff'; c.beginPath(); c.ellipse(150, hY+10, 35, 38, 0, 0, 2*Math.PI); c.fill();
                c.fillStyle = '#1a2f3f'; 
                if (this.st === 'slp') { c.fillRect(115, hY+10, 70, 5); }
                else { c.beginPath(); c.arc(150 + Math.sin(this.tm*2)*10, hY+10, 18, 0, 2*Math.PI); c.fill(); }
            }

            // ШАПКА ДЛЯ ВСЕХ
            if (this.cst === 'snt') { 
                let sY = (this.chr === 'eye') ? hY - 30 : (this.chr === 'fluffy') ? hY - 35 : hY - 25;
                c.fillStyle = '#e63946'; c.beginPath(); c.moveTo(110, sY); c.lineTo(150, sY-60); c.lineTo(190, sY); c.fill();
                c.fillStyle = '#fff'; c.beginPath(); c.ellipse(150, sY, 45, 9, 0, 0, 2*Math.PI); c.fill(); 
                c.beginPath(); c.arc(150, sY-60, 12, 0, 2*Math.PI); c.fill(); 
            }
            this.aId = requestAnimationFrame(drw);
        }; drw();
    }
    stp() { if (this.aId) cancelAnimationFrame(this.aId); }
}