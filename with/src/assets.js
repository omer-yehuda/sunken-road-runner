import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Stock photo assets from the three.js examples (r170), loaded from a CDN. Nothing is copied into this repo.
const BASE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/';
const FILES = {
  brick: 'textures/brick_diffuse.jpg', brickBump: 'textures/brick_bump.jpg', brickRough: 'textures/brick_roughness.jpg',
  grass: 'textures/terrain/grasslight-big.jpg', lava: 'textures/lava/lavatile.jpg',
  wood: 'textures/hardwood2_diffuse.jpg', woodBump: 'textures/hardwood2_bump.jpg', woodRough: 'textures/hardwood2_roughness.jpg',
  goldNormal: 'textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png', smoke: 'textures/opengameart/smoke1.png',
};
export async function loadAssets(onProgress = () => {}) {
  const tl = new THREE.TextureLoader(), keys = Object.keys(FILES); let done = 0; const total = keys.length + 2;
  const tick = x => { onProgress(++done / total); return x; };
  const A = {};
  await Promise.all([
    ...keys.map(k => tl.loadAsync(BASE + FILES[k]).then(t => { A[k] = tick(t); })),
    new RGBELoader().loadAsync(BASE + 'textures/equirectangular/spruit_sunrise_1k.hdr').then(t => { t.mapping = THREE.EquirectangularReflectionMapping; A.sky = tick(t); }),
    new GLTFLoader().loadAsync(BASE + 'models/gltf/Soldier.glb').then(g => { A.runner = tick(g); }),
  ]);
  return A;
}

// Photo texture -> grey stone with the palette tint applied later by the material colour.
export function toStone(tex, contrast = 1.25) {
  const img = tex.image, c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    let l = (p[i] * 0.45 + p[i + 1] * 0.4 + p[i + 2] * 0.15) / 255;
    l = Math.min(1, Math.max(0, (l - 0.42) * contrast + 0.62));
    p[i] = p[i + 1] = p[i + 2] = l * 255;
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function rep(tex, x, y, srgb = null) {
  const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.anisotropy = 8;
  if (srgb !== null) t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.needsUpdate = true; return t;
}
