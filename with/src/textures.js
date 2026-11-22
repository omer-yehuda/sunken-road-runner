import * as THREE from 'three';
import { css } from './palette.js';

function canvas(size) { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; }
function tex(c, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function noise(g, size, n, alpha, light = true) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : 0;
    g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`;
    const s = 1 + Math.random() * 3;
    g.fillRect(Math.random() * size, Math.random() * size, s, s);
  }
}

// Paved stone: returns { map, bumpMap }
export function stoneTiles({ cols = 4, rows = 4, moss = 0.5, base = 'stone' } = {}) {
  const S = 512; const [c, g] = canvas(S); const [b, bg] = canvas(S);
  g.fillStyle = css(base); g.fillRect(0, 0, S, S);
  bg.fillStyle = '#808080'; bg.fillRect(0, 0, S, S);
  const tw = S / cols, th = S / rows;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const off = (r % 2) * tw * 0.5;
    for (const dx of [0, -S]) {
      const x = q * tw + off + dx, y = r * th;
      const shade = Math.floor((Math.random() - 0.5) * 46);
      g.fillStyle = `rgba(${shade > 0 ? 255 : 0},${shade > 0 ? 240 : 0},${shade > 0 ? 210 : 0},${Math.abs(shade) / 255})`;
      g.fillRect(x + 3, y + 3, tw - 6, th - 6);
      const h = 128 + Math.floor((Math.random() - 0.5) * 50);
      bg.fillStyle = `rgb(${h},${h},${h})`; bg.fillRect(x + 4, y + 4, tw - 8, th - 8);
      g.strokeStyle = 'rgba(20,16,10,0.75)'; g.lineWidth = 5; g.strokeRect(x + 1, y + 1, tw - 2, th - 2);
      bg.strokeStyle = '#202020'; bg.lineWidth = 7; bg.strokeRect(x + 1, y + 1, tw - 2, th - 2);
      if (Math.random() < 0.45) { // crack
        g.strokeStyle = 'rgba(15,12,8,0.6)'; g.lineWidth = 1.5; bg.strokeStyle = '#303030'; bg.lineWidth = 2;
        let cx = x + Math.random() * tw, cy = y + 4;
        g.beginPath(); g.moveTo(cx, cy); bg.beginPath(); bg.moveTo(cx, cy);
        for (let k = 0; k < 6; k++) { cx += (Math.random() - 0.5) * 22; cy += th / 7; g.lineTo(cx, cy); bg.lineTo(cx, cy); }
        g.stroke(); bg.stroke();
      }
    }
  }
  noise(g, S, 9000, 0.10, true); noise(g, S, 9000, 0.16, false); noise(bg, S, 5000, 0.2, false);
  for (let i = 0; i < 26 * moss; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 20 + Math.random() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(95,130,50,0.75)'); gr.addColorStop(1, 'rgba(95,130,50,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return { map: tex(c), bumpMap: tex(b, 1, 1, false) };
}

export function mossGround() {
  const S = 512; const [c, g] = canvas(S);
  g.fillStyle = css('jungle'); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 6 + Math.random() * 26;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() < 0.5;
    gr.addColorStop(0, light ? 'rgba(120,165,60,0.5)' : 'rgba(10,30,15,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return tex(c, 6, 6);
}

// Invented glyphs (spirals, rays, dots). White on black, used as emissive map.
export function glyphBand() {
  const W = 1024, H = 256; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 28); g.lineTo(W, 28); g.moveTo(0, H - 28); g.lineTo(W, H - 28); g.stroke();
  for (let i = 0; i < 8; i++) {
    const cx = 64 + i * 128, cy = H / 2, k = Math.floor(Math.random() * 4);
    g.beginPath();
    if (k === 0) { for (let a = 0; a < 14; a += 0.2) { const r = 4 + a * 3.6; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } }
    else if (k === 1) { for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; g.moveTo(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16); g.lineTo(cx + Math.cos(a) * 46, cy + Math.sin(a) * 46); } g.moveTo(cx + 8, cy); g.arc(cx, cy, 8, 0, 7); }
    else if (k === 2) { g.moveTo(cx - 40, cy + 36); g.lineTo(cx, cy - 40); g.lineTo(cx + 40, cy + 36); g.closePath(); g.moveTo(cx + 10, cy + 8); g.arc(cx, cy + 8, 10, 0, 7); }
    else { g.rect(cx - 36, cy - 36, 72, 72); g.moveTo(cx - 18, cy); g.lineTo(cx + 18, cy); g.moveTo(cx, cy - 18); g.lineTo(cx, cy + 18); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function glowSprite(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,200,110,0.45)') {
  const S = 128; const [c, g] = canvas(S);
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, mid); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function flameSprite() {
  const S = 128; const [c, g] = canvas(S);
  const gr = g.createRadialGradient(S / 2, S * 0.68, 2, S / 2, S * 0.6, S * 0.5);
  gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.3, 'rgba(255,170,50,0.9)'); gr.addColorStop(0.7, 'rgba(255,80,20,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(S / 2, 4); g.bezierCurveTo(S * 0.95, S * 0.45, S * 0.85, S * 0.98, S / 2, S * 0.98); g.bezierCurveTo(S * 0.15, S * 0.98, S * 0.05, S * 0.45, S / 2, 4); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function shaftTexture() {
  const W = 64, H = 256; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, W, 0);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const gv = g.createLinearGradient(0, 0, 0, H);
  gv.addColorStop(0, 'rgba(0,0,0,0)'); gv.addColorStop(0.2, 'rgba(0,0,0,1)'); gv.addColorStop(0.8, 'rgba(0,0,0,1)'); gv.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = gv; g.fillRect(0, 0, W, H);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function leafSpeckle() {
  const S = 256; const [c, g] = canvas(S);
  g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 700; i++) {
    const v = Math.random() < 0.5 ? 255 : 40; g.fillStyle = `rgba(${v},${v},${v},${0.10 + Math.random() * 0.25})`;
    const x = Math.random() * S, y = Math.random() * S, r = 3 + Math.random() * 9;
    g.beginPath(); g.ellipse(x, y, r, r * 0.5, Math.random() * 3, 0, 7); g.fill();
  }
  return tex(c, 3, 3);
}
export function bark() {
  const S = 256; const [c, g] = canvas(S);
  g.fillStyle = css('leather'); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.35)' : 'rgba(255,220,170,0.14)'; g.lineWidth = 1 + Math.random() * 3;
    let x = Math.random() * S; g.beginPath(); g.moveTo(x, 0);
    for (let y = 0; y <= S; y += 32) { x += (Math.random() - 0.5) * 10; g.lineTo(x, y); } g.stroke();
  }
  return tex(c, 2, 1);
}
