import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadAssets } from './assets.js';
import { P } from './palette.js';
import { createWorld, ZONES, HALF } from './world.js';
import { createHero } from './hero.js';

const LANE = 2.4, SPAWN_Z = -170;
const $ = id => document.getElementById(id);

// ---------- renderer and final image ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);
const A = await loadAssets(p => { $('load').style.width = (p * 100) + '%'; }).catch(e => { $('go').textContent = 'Could not load the art. Check the connection and reload.'; throw e; });
$('go').textContent = 'Press any key or tap to run';
const world = createWorld(scene, A);
const hero = createHero(A.runner); scene.add(hero.root);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.05, 0.5, 1.0); composer.addPass(bloom);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, speed: { value: 0 }, time: { value: 0 }, warm: { value: 1 } },
  vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float speed; uniform float time; uniform float warm; varying vec2 v;
    void main(){ vec2 c = v - 0.5; float r2 = dot(c, c);
      float ab = 0.0008 + speed * 0.0012;                       // lens fringe grows with speed
      vec3 col = vec3(texture2D(tDiffuse, v + c * r2 * ab * 4.).r, texture2D(tDiffuse, v).g, texture2D(tDiffuse, v - c * r2 * ab * 4.).b);
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(l), col, 1.06);                             // a little more color
      col += (l - 0.35) * mix(vec3(-0.02, 0.0, 0.03), vec3(0.03, 0.01, -0.03), warm) ; // cool shadows, warm lights
      col *= smoothstep(0.95, 0.25, sqrt(r2) * 1.05) * 0.5 + 0.5; // vignette
      col += (fract(sin(dot(v * 800. + time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.03;
      gl_FragColor = vec4(col, 1.); }`,
});
composer.addPass(grade); composer.addPass(new OutputPass());

let portrait = false;
function resize() {
  const w = innerWidth, h = innerHeight; portrait = h > w;
  renderer.setSize(w, h); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  document.body.classList.toggle('portrait', portrait);
}
addEventListener('resize', resize); resize();

// ---------- relics and obstacles ----------
const M = world.M, mesh = world.mesh;
const relicGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.07, 40).rotateX(Math.PI / 2);
const gn = A.goldNormal.clone(); gn.wrapS = gn.wrapT = THREE.RepeatWrapping; gn.repeat.set(0.5, 0.5); gn.needsUpdate = true;
const relicMat = new THREE.MeshStandardMaterial({ color: P.sunGold, metalness: 1, roughness: 0.22, normalMap: gn, normalScale: new THREE.Vector2(0.6, 0.6), emissive: P.sunGold, emissiveIntensity: 0.12, envMapIntensity: 1.6 });
const relicGlow = new THREE.SpriteMaterial({ map: world.tex.glow, color: P.sunGold, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
const obstacles = [], relics = [], bursts = [];
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const geo = { block: B(1.9, 1.0, 1.15), cap: B(2.25, 0.2, 1.5), stripe: B(1.94, 0.12, 0.05), rubble: world.G.rock, beam: B(HALF * 2 + 0.9, 0.6, 0.75), post: B(0.55, 2.4, 0.75),
  base: B(1.6, 0.45, 1.6), body: new THREE.CylinderGeometry(0.55, 0.75, 2.3, 20), headB: B(1.15, 1.05, 1.0), brow: B(1.3, 0.2, 1.1), eye: new THREE.SphereGeometry(0.11, 8, 8) };

function makeObstacle(type, lane, z) {
  const g = new THREE.Group(); g.position.set(lane * LANE, 0, z);
  if (type === 'low') {          // fallen mossy block: jump
    const b = mesh(geo.block, M.block, 0, 0.5, 0, true, true); b.rotation.y = (Math.random() - 0.5) * 0.3; g.add(b);
    const c = mesh(geo.cap, M.moss, 0, 1.08, 0, true); c.rotation.y = b.rotation.y; g.add(c);
    const st = mesh(geo.stripe, M.teal, 0, 0.5, 0.6); st.rotation.y = b.rotation.y; g.add(st);
    for (const s of [-1, 1]) { const r = mesh(geo.rubble, M.block, s * 1.1, 0.15, 0.45, true); r.scale.set(0.34, 0.24, 0.3); r.rotation.y = s; g.add(r); }
  } else if (type === 'high') {  // burning beam: slide
    g.position.x = 0;
    g.add(mesh(geo.beam, M.charred, 0, 2.15, 0, true));
    for (const s of [-1, 1]) g.add(mesh(geo.post, M.wood, s * (HALF + 0.15), 1.2, 0, true));
    for (let i = -3; i <= 3; i++) {
      const f = new THREE.Sprite(M.flame); f.position.set(i * 1.15, 1.72, 0.1); f.scale.set(0.7, -0.95, 1); g.add(f);
    }
    const hl = new THREE.Sprite(M.halo); hl.position.set(0, 1.9, 0.2); hl.scale.set(10, 3, 1); g.add(hl);
  } else {                        // statue with lit eyes: dodge
    g.add(mesh(geo.base, M.block, 0, 0.22, 0, true, true));
    g.add(mesh(geo.body, M.column, 0, 1.55, 0, true));
    g.add(mesh(geo.headB, M.block, 0, 3.15, 0, true));
    g.add(mesh(geo.brow, M.block, 0, 3.55, 0.05, true));
    for (const s of [-1, 1]) g.add(mesh(geo.eye, M.teal, s * 0.27, 3.2, 0.52));
    const hl = new THREE.Sprite(new THREE.SpriteMaterial({ map: world.tex.glow, color: P.glyphTeal, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    hl.position.set(0, 3.2, 0.6); hl.scale.setScalar(2.2); g.add(hl);
  }
  g.userData.type = type; scene.add(g); obstacles.push(g);
}
function makeRelic(lane, z, y) {
  const g = new THREE.Group(); g.position.set(lane * LANE, y, z);
  const m = new THREE.Mesh(relicGeo, relicMat); m.castShadow = true; g.add(m);
  const s = new THREE.Sprite(relicGlow); s.scale.setScalar(1.0); g.add(s);
  scene.add(g); relics.push(g);
}
function spawnRow(z) {
  const r = Math.random(), lanes = [-1, 0, 1], blocked = [];
  let arcLane = null;
  if (r < 0.34) { const l = lanes[Math.floor(Math.random() * 3)]; makeObstacle('low', l, z); arcLane = l; if (Math.random() < 0.4) { const l2 = lanes.filter(x => x !== l)[Math.floor(Math.random() * 2)]; makeObstacle('low', l2, z); } }
  else if (r < 0.58) makeObstacle('high', 0, z);
  else if (r < 0.84) { const l = lanes[Math.floor(Math.random() * 3)]; makeObstacle('tall', l, z); blocked.push(l); }
  else { makeObstacle('tall', -1, z); makeObstacle('tall', 1, z); blocked.push(-1, 1); }
  const free = lanes.filter(l => !blocked.includes(l));
  const cl = arcLane !== null && Math.random() < 0.6 ? arcLane : free[Math.floor(Math.random() * free.length)];
  for (let i = -3; i <= 3; i++) {
    const dz = i * 1.7, y = cl === arcLane ? 1.0 + Math.max(0, 1.9 - dz * dz * 0.16) : 1.0;
    makeRelic(cl, z + dz + (cl === arcLane ? 0 : 7), y);
  }
}

// ---------- game state ----------
let started = false, deadAt = 0, lane, y, vy, sliding, speed, dist, got, alive, time, sinceRow, vx, shown, best = 0, lastZone = -1, toastT = 0;
function reset() {
  for (const o of obstacles) scene.remove(o); obstacles.length = 0;
  for (const c of relics) scene.remove(c); relics.length = 0;
  lane = 0; y = 0; vy = 0; sliding = 0; speed = 16; dist = 0; got = 0; alive = true; time = 0; vx = 0; shown = 0;
  hero.root.position.x = 0; sinceRow = 0;
  for (let z = -45; z > SPAWN_Z; z -= 20) spawnRow(z);
  $('over').classList.remove('on');
}
function start() { if (!started) { started = true; $('start').classList.remove('on'); } }
function act(a) {
  if (!started) return start();
  if (!alive) { if (a === 'restart' && time - deadAt > 0.6) reset(); return; }
  if (a === 'left' && lane > -1) lane--;
  if (a === 'right' && lane < 1) lane++;
  if (a === 'jump' && y === 0) { vy = 10.2; sliding = 0; }
  if (a === 'slide' && y === 0) sliding = 0.75;
}
addEventListener('keydown', e => {
  const k = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', ArrowDown: 'slide', KeyS: 'slide' }[e.code];
  if (k) { act(k); e.preventDefault(); }
  if (e.code === 'Space' || e.code === 'Enter') { act(alive ? 'jump' : 'restart'); e.preventDefault(); }
});
let tx = 0, ty = 0, swiped = true;
addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; swiped = false; if (!started) start(); }, { passive: true });
addEventListener('touchmove', e => {   // act as soon as the finger has travelled far enough, once per touch
  if (swiped || !alive) return;
  const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  swiped = true;
  if (Math.abs(dx) > Math.abs(dy)) act(dx > 0 ? 'right' : 'left'); else act(dy > 0 ? 'slide' : 'jump');
}, { passive: true });
$('again').addEventListener('click', () => act('restart'));

const fmt = n => Math.floor(n).toLocaleString('en-US');
function update(dt) {
  time += dt;
  if (alive && started) {
    speed = Math.min(36, speed + dt * 0.32);
    const move = speed * dt; dist += move;
    const px = hero.root.position.x, nx = px + (lane * LANE - px) * Math.min(1, dt * 13);
    vx = (nx - px) / dt;
    vy -= 27 * dt; y += vy * dt; if (y < 0) { y = 0; vy = 0; }
    if (sliding > 0) sliding -= dt;
    world.update(move, dt, time, renderer);
    hero.update(dt, { x: nx, y, vx, sliding, speed });

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i]; o.position.z += move;
      if (Math.abs(o.position.z) < 0.75) {
        const t = o.userData.type, same = t === 'high' || Math.abs(o.position.x - nx) < 1.15;
        if (same && ((t === 'low' && y < 0.95) || (t === 'high' && sliding <= 0) || t === 'tall')) die();
      }
      if (o.position.z > 12) { scene.remove(o); obstacles.splice(i, 1); }
    }
    for (let i = relics.length - 1; i >= 0; i--) {
      const c = relics[i]; c.position.z += move; c.rotation.y += dt * 3.2; c.children[0].position.y = Math.sin(time * 4 + c.position.z) * 0.06;
      if (Math.abs(c.position.z) < 0.8 && Math.abs(c.position.x - nx) < 0.95 && Math.abs(c.position.y - (y + 1)) < 1.2) {
        got++; burst(c.position); scene.remove(c); relics.splice(i, 1); continue;
      }
      if (c.position.z > 10) { scene.remove(c); relics.splice(i, 1); }
    }
    sinceRow += move;
    const gap = Math.min(28, Math.max(17, speed * 0.95));
    if (sinceRow >= gap) { sinceRow = 0; spawnRow(SPAWN_Z); }
    if (world.zone !== lastZone) { lastZone = world.zone; $('zone').textContent = ZONES[world.zone]; toastT = 2.6; }
  } else world.update(0, dt, time, renderer);

  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.userData.t += dt * 4; b.scale.setScalar(1 + b.userData.t * 3.5); b.material.opacity = 1 - b.userData.t; b.position.z += speed * dt * 0.6;
    if (b.userData.t >= 1) { scene.remove(b); bursts.splice(i, 1); }
  }
  // camera: sits behind the runner, leans into lane changes, widens with speed
  const k = (speed - 16) / 20, hx = hero.root.position.x;
  camera.fov = (portrait ? 78 : 60) + k * 9; camera.updateProjectionMatrix();
  camera.position.set(hx * 0.62, (portrait ? 5.0 : 3.5) + y * 0.32 + Math.sin(time * 9) * 0.03, portrait ? 7.6 : 6.6);
  camera.lookAt(hx * 0.85, portrait ? 0.6 : 1.9, -14);
  camera.rotation.z += -THREE.MathUtils.clamp(vx, -12, 12) * 0.0022 * (alive ? 1 : 0);
  grade.uniforms.speed.value = k; grade.uniforms.time.value = time % 10; grade.uniforms.warm.value = 1 - world.blend;
  bloom.strength = 0.05 + world.blend * 0.3;

  shown += (got - shown) * Math.min(1, dt * 10);
  $('dist').textContent = fmt(dist); $('relics').textContent = Math.round(shown);
  toastT -= dt; $('zone').classList.toggle('on', toastT > 0);
}
function burst(p) {
  const s = new THREE.Sprite(relicGlow.clone()); s.position.copy(p); s.userData.t = 0; scene.add(s); bursts.push(s);
  $('relicBox').classList.remove('pop'); void $('relicBox').offsetWidth; $('relicBox').classList.add('pop');
}
function die() {
  alive = false; deadAt = time; const isBest = dist > best; best = Math.max(best, dist);
  $('bestRow').classList.toggle('new', isBest); setTimeout(() => $('again').focus(), 650);
  $('finalDist').textContent = fmt(dist) + ' m'; $('finalRelics').textContent = got; $('bestDist').textContent = fmt(best) + ' m';
  $('over').classList.add('on');
}
reset();

// same test hook as the plain version (used by the capture script)
window.__game = { start, update, act, render: () => composer.render(), renderer, scene,
  state: () => ({ alive, y, sliding, lane, x: hero.root.position.x, speed, score: dist, coins: got, laneWidth: LANE, zone: world.zone,
    obstacles: obstacles.map(o => ({ z: o.position.z, x: o.position.x, type: o.userData.type })),
    coins3d: relics.map(c => ({ z: c.position.z, x: c.position.x })) }) };

let last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!window.__manual) { update(dt); composer.render(); }
});
