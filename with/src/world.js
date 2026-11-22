import * as THREE from 'three';
import { P } from './palette.js';
import * as TX from './textures.js';
import { toStone, rep } from './assets.js';

export const SEG = 24, NSEG = 9, ZONE_SEGS = 10, HALF = 4.0;
export const ZONES = ['The Sunken Road', 'Hall of Embers'];
const C = h => new THREE.Color(h);

export function createWorld(scene, A) {
  const flames = [], world = { blend: 0, zone: 0 };

  // ---------- photo materials, tinted from the palette ----------
  const stone = toStone(A.brick);
  const std = o => new THREE.MeshStandardMaterial(o);
  const masonry = (rx, ry, tint, extra = {}) => std({ map: rep(stone, rx, ry), bumpMap: rep(A.brickBump, rx, ry, false), bumpScale: 3, roughnessMap: rep(A.brickRough, rx, ry, false), roughness: 1, color: tint, ...extra });
  const glyphs = TX.glyphBand(), glow = TX.glowSprite(), flameT = TX.flameSprite(), shaftT = TX.shaftTexture();
  const M = {
    paving: masonry(1.2, 3.4, P.sand),
    block: masonry(1, 1, P.sand),
    column: masonry(2, 3, P.sand),
    wall: masonry(6, 3, P.stone),
    wallBig: masonry(7, 2.5, P.stone),
    ground: std({ map: rep(A.grass, 26, 9), color: P.mossTint, roughness: 1 }),
    moss: std({ map: rep(A.grass, 1, 1), color: P.moss, roughness: 1 }),
    wood: std({ map: rep(A.wood, 1, 3), bumpMap: rep(A.woodBump, 1, 3, false), bumpScale: 2, roughnessMap: rep(A.woodRough, 1, 3, false), color: P.leather }),
    charred: std({ map: rep(A.wood, 3, 1), color: P.stoneDark, emissive: P.ember, emissiveMap: rep(A.lava, 3, 0.4), emissiveIntensity: 0.8, roughness: 0.9 }),
    iron: std({ color: P.stoneDark, metalness: 0.9, roughness: 0.45 }),
    glyphGold: std({ color: P.stoneDark, emissive: P.sunGold, emissiveMap: glyphs, emissiveIntensity: 0.9, roughness: 0.9 }),
    glyphTeal: std({ color: P.nightBlue, emissive: P.glyphTeal, emissiveMap: glyphs, emissiveIntensity: 0.9, roughness: 0.9 }),
    teal: std({ color: P.glyphTeal, emissive: P.glyphTeal, emissiveIntensity: 3 }),
    lava: std({ color: P.stoneDark, emissive: P.ember, emissiveMap: rep(A.lava, 1, 9), emissiveIntensity: 1.2, roughness: 0.8 }),
    shaftSun: new THREE.MeshBasicMaterial({ map: shaftT, color: P.daySun, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    shaftMoon: new THREE.MeshBasicMaterial({ map: shaftT, color: P.hallMoon, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    pool: new THREE.MeshBasicMaterial({ map: glow, color: P.ember, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    flame: new THREE.SpriteMaterial({ map: flameT, color: P.white, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
    halo: new THREE.SpriteMaterial({ map: glow, color: P.ember, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  };
  M.flame.color.multiplyScalar(2.2);
  world.M = M; world.tex = { glow, flameT };

  const rockGeo = new THREE.IcosahedronGeometry(1, 3);
  { const p = rockGeo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.22 * Math.sin(v.x * 3.1 + v.y * 2.3) * Math.cos(v.z * 2.7 + v.x) + 0.1 * Math.sin(v.y * 7 + v.z * 5); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); }
    rockGeo.computeVertexNormals(); }
  const G = {
    box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
    rock: rockGeo,
    trunk: new THREE.CylinderGeometry(0.28, 0.5, 1, 7),
    column: new THREE.CylinderGeometry(0.55, 0.64, 1, 20),
    plane: new THREE.PlaneGeometry(1, 1),
  };
  const mesh = (geo, mat, x, y, z, cast = false, recv = false) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = recv; return o; };
  const R = (a, b) => a + Math.random() * (b - a);

  function torch(g, x, y, z, big = 1) {
    g.add(mesh(G.box(0.12 * big, 0.6 * big, 0.12 * big), M.iron, x, y - 0.1 * big, z));
    const f = new THREE.Sprite(M.flame); f.position.set(x, y + 0.5 * big, z); f.scale.set(0.7 * big, 1.2 * big, 1); f.userData.base = big; g.add(f); flames.push(f);
    const hl = new THREE.Sprite(M.halo); hl.position.set(x, y + 0.45 * big, z); hl.scale.setScalar(4 * big); g.add(hl);
  }

  // ---------- one road segment, dressed for both zones ----------
  function buildSegment() {
    const seg = new THREE.Group();
    seg.add(mesh(G.box(HALF * 2 + 0.6, 1.2, SEG), M.paving, 0, -0.6, 0, false, true));
    const field = new THREE.Group(), hall = new THREE.Group(), gate = new THREE.Group(), portal = new THREE.Group();
    seg.add(field, hall, gate, portal);

    // --- bright zone: a stone causeway across open grassland at sunrise ---
    for (const s of [-1, 1]) {
      field.add(mesh(G.box(0.3, 0.16, SEG), M.block, s * (HALF + 0.1), 0.86, 0, true, true));
      for (let z = -SEG / 2 + 2; z < SEG / 2; z += 4) field.add(mesh(G.box(0.5, 1.0, 0.5), M.block, s * (HALF + 0.1), 0.5, z, true, true));
      field.add(mesh(G.box(70, 1, SEG), M.ground, s * (HALF + 35.3), -1.7, 0, false, true));
      const bank = mesh(G.box(3.4, 1.6, SEG), M.ground, s * (HALF + 1.5), -1.35, 0, false, true); bank.rotation.z = s * 0.45; field.add(bank);
      for (let i = 0; i < 3; i++) { // weathered boulders in the grass
        const r = mesh(G.rock, M.block, s * R(7, 30), -1.25, R(-SEG / 2, SEG / 2), true, true);
        r.scale.set(R(0.6, 2.2), R(0.4, 1.2), R(0.6, 2)); r.rotation.set(R(0, 3), R(0, 3), R(0, 3)); field.add(r);
      }
      if (Math.random() < 0.75) { // a standing ruin column, far from the lanes
        const h = R(4, 8), x = s * R(12, 26), z = R(-SEG / 2, SEG / 2);
        const c = mesh(G.column, M.column, x, -1.2 + h / 2, z, true, true); c.scale.set(1.3, h, 1.3); field.add(c);
        field.add(mesh(G.box(2.1, 0.4, 2.1), M.block, x, -1.2 + h + 0.2, z, true));
        field.add(mesh(G.box(2.3, 0.5, 2.3), M.block, x, -1.0, z, true, true));
      }
      if (Math.random() < 0.5) { // a toppled drum
        const c = mesh(G.column, M.column, s * R(8.5, 11), -0.75, R(-SEG / 2, SEG / 2), true, true);
        c.scale.set(1, R(1.5, 3), 1); c.rotation.set(R(-0.2, 0.2), R(0, 3), Math.PI / 2); field.add(c);
      }
    }
    for (let i = 0; i < 2; i++) { // faint light shafts in the haze
      const sh = mesh(G.plane, M.shaftSun, (i ? 1 : -1) * R(5, 10), 6, R(-SEG / 2, SEG / 2)); sh.scale.set(R(3, 6), 24, 1);
      sh.rotation.set(0, R(-0.4, 0.4), R(0.5, 0.75)); field.add(sh);
    }

    // --- arch gate over the road (bright zone, every third segment) ---
    for (const s of [-1, 1]) {
      const c = mesh(G.column, M.column, s * 5.3, 3.4, 0, true, true); c.scale.set(1.25, 6.8, 1.25); gate.add(c);
      gate.add(mesh(G.box(1.9, 0.6, 1.9), M.block, s * 5.3, 0.3, 0, true, true));
      gate.add(mesh(G.box(1.8, 0.4, 1.8), M.block, s * 5.3, 6.9, 0, true));
    }
    gate.add(mesh(G.box(13.2, 1.3, 1.7), M.wall, 0, 7.75, 0, true));
    const band = mesh(G.plane, M.glyphGold, 0, 7.75, 0.86); band.scale.set(11, 0.9, 1); gate.add(band);

    // --- dark zone: torch hall with fire channels ---
    for (const s of [-1, 1]) {
      hall.add(mesh(G.box(1.2, 12, SEG), M.wall, s * 6.6, 4, 0, false, true));
      const gb = mesh(G.plane, M.glyphTeal, s * 5.98, 5.2, 0); gb.scale.set(SEG, 1.1, 1); gb.rotation.y = -s * Math.PI / 2; hall.add(gb);
      const lv = mesh(G.plane, M.lava, s * 5.15, -0.5, 0); lv.scale.set(1.7, SEG, 1); lv.rotation.x = -Math.PI / 2; hall.add(lv);
      hall.add(mesh(G.box(5, 0.6, SEG), M.wall, s * 4.2, 10.2, 0));
      for (const z of [-8, 0, 8]) {
        const c = mesh(G.column, M.column, s * 5.9, 4, z, true, true); c.scale.set(1, 12, 1); hall.add(c);
        torch(hall, s * 5.2, 3.05, z);
        const pl = mesh(G.plane, M.pool, s * 3.0, 0.02, z); pl.rotation.x = -Math.PI / 2; pl.scale.setScalar(7); hall.add(pl);
        const pw = mesh(G.plane, M.pool, s * 5.96, 3.3, z); pw.rotation.y = -s * Math.PI / 2; pw.scale.setScalar(6); hall.add(pw);
      }
    }
    for (const z of [-9, -3, 3, 9]) hall.add(mesh(G.box(14, 0.9, 1.1), M.wood, 0, 9.6, z, true));
    for (let i = 0; i < 2; i++) {
      const sh = mesh(G.plane, M.shaftMoon, (i ? 1 : -1) * R(2.2, 3.4), 5, R(-SEG / 2, SEG / 2)); sh.scale.set(R(1.5, 2.6), 12, 1); sh.rotation.z = R(-0.12, 0.12); hall.add(sh);
    }

    // --- the wall with a doorway between zones ---
    for (const s of [-1, 1]) portal.add(mesh(G.box(60, 22, 2.4), M.wallBig, s * (6 + 30), 9, 0, true, true));
    portal.add(mesh(G.box(12.2, 9, 2.4), M.wall, 0, 15.5, 0, true));
    for (const s of [-1, 1]) { torch(portal, s * 6.6, 3.2, 1.6, 1.4); torch(portal, s * 6.6, 3.2, -1.6, 1.4); }
    const pb = mesh(G.plane, M.glyphGold, 0, 11.8, 1.22); pb.scale.set(12, 1.2, 1); portal.add(pb);
    const pb2 = mesh(G.plane, M.glyphGold, 0, 11.8, -1.22); pb2.scale.set(12, 1.2, 1); pb2.rotation.y = Math.PI; portal.add(pb2);
    portal.position.z = SEG / 2;

    seg.userData = { field, hall, gate, portal, index: 0 };
    return seg;
  }
  const zoneOf = i => Math.floor(i / ZONE_SEGS) % 2;
  function dress(seg) {
    const u = seg.userData, z = zoneOf(u.index);
    u.field.visible = z === 0; u.hall.visible = z === 1;
    u.gate.visible = z === 0 && u.index % 3 === 1;
    u.portal.visible = u.index > 0 && zoneOf(u.index - 1) !== z;
  }
  const segs = [];
  for (let i = 0; i < NSEG; i++) {
    const s = buildSegment(); s.userData.index = i; s.position.z = -i * SEG + SEG * 0.5; dress(s); scene.add(s); segs.push(s);
  }

  // ---------- real sky: a sunrise photo lights the whole scene ----------
  scene.background = A.sky; scene.environment = A.sky;
  const SKY_TURN = 2.547;                       // puts the photo's sun ahead and to the left of the road
  scene.backgroundRotation.y = SKY_TURN; scene.environmentRotation.y = SKY_TURN;
  const far = new THREE.Group(); scene.add(far);
  const hazeMat = new THREE.MeshBasicMaterial({ fog: false });
  const zig = new THREE.Group(); // a stepped temple on the horizon, always ahead
  for (let i = 0; i < 6; i++) zig.add(mesh(G.box(110 - i * 17, 13, 60), hazeMat, 0, 6 + i * 13, 0));
  zig.position.set(60, -2, -330); far.add(zig);

  const sun = new THREE.DirectionalLight(P.daySun, 3);
  sun.position.set(-9, 6.5, -24); sun.target.position.set(0, 0, -6); scene.add(sun, sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -14, near: 1, far: 70 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  const fire = new THREE.PointLight(P.ember, 0, 30, 1.5); fire.position.set(0, 2.6, -4); scene.add(fire);
  const fire2 = new THREE.PointLight(P.ember, 0, 30, 1.5); fire2.position.set(0, 2.6, -22); scene.add(fire2);
  const rim = new THREE.DirectionalLight(P.hallMoon, 0); rim.position.set(3, 6, 10); scene.add(rim);
  scene.fog = new THREE.FogExp2(P.dayFog, 0.011);

  // ---------- dust in the light (embers inside) ----------
  const NM = 420, mp = new Float32Array(NM * 3);
  for (let i = 0; i < NM; i++) { mp[i * 3] = R(-13, 13); mp[i * 3 + 1] = R(0.2, 9); mp[i * 3 + 2] = R(-60, 6); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const motes = new THREE.Points(mg, new THREE.PointsMaterial({ map: glow, size: 0.1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  motes.frustumCulled = false; scene.add(motes);

  // look of each zone; everything in between is a blend
  const LOOK = [
    { fog: C(P.dayFog), dens: 0.0115, sunC: C(P.daySun), sunI: 3.2, env: 0.85, bg: 0.55, haze: C(P.ridgeFar), mote: C(P.daySun), moteO: 0.5, exp: 0.82 },
    { fog: C(P.hallFog), dens: 0.02, sunC: C(P.hallMoon), sunI: 0.0, env: 0.05, bg: 0.01, haze: C(P.hallFog), mote: C(P.ember), moteO: 0.9, exp: 1.0 },
  ];
  const L = THREE.MathUtils.lerp;
  world.update = (move, dt, time, renderer) => {
    for (const s of segs) {
      s.position.z += move;
      if (s.position.z > SEG * 1.5) { s.position.z -= SEG * NSEG; s.userData.index += NSEG; dress(s); }
      if (Math.abs(s.position.z) <= SEG / 2) world.zone = zoneOf(s.userData.index);
      if (Math.abs(s.position.z + 30) <= SEG / 2) world.zoneAhead = zoneOf(s.userData.index);
    }
    world.blend = L(world.blend, world.zoneAhead ?? world.zone, Math.min(1, dt * 3));
    const k = world.blend, a = LOOK[0], b = LOOK[1];
    scene.fog.color.lerpColors(a.fog, b.fog, k); scene.fog.density = L(a.dens, b.dens, k);
    sun.color.lerpColors(a.sunC, b.sunC, k); sun.intensity = L(a.sunI, b.sunI, k);
    scene.environmentIntensity = L(a.env, b.env, k); scene.backgroundIntensity = L(a.bg, b.bg, k);
    hazeMat.color.lerpColors(a.haze, b.haze, k);
    motes.material.color.lerpColors(a.mote, b.mote, k); motes.material.opacity = L(a.moteO, b.moteO, k);
    renderer.toneMappingExposure = L(a.exp, b.exp, k);
    const fl = 1 + Math.sin(time * 17) * 0.08 + Math.sin(time * 31) * 0.05;
    fire.intensity = k * 26 * fl; fire2.intensity = k * 20 * (2 - fl);
    rim.intensity = k * 0.9;
    M.lava.emissiveMap.offset.y = time * 0.05;
    for (const f of flames) { const w = 1 + Math.sin(time * 19 + f.position.z * 3) * 0.12 + Math.sin(time * 33 + f.position.x) * 0.08; f.scale.set(0.7 * f.userData.base * (2 - w), 1.2 * f.userData.base * w, 1); }
    const p = mg.attributes.position.array;
    for (let i = 0; i < NM; i++) {
      p[i * 3 + 2] += move * 0.85; p[i * 3 + 1] += (k > 0.5 ? 0.9 : Math.sin(time + i) * 0.15) * dt; p[i * 3] += Math.sin(time * 0.7 + i * 1.3) * dt * 0.3;
      if (p[i * 3 + 2] > 7) p[i * 3 + 2] -= 66; if (p[i * 3 + 1] > 9.2) p[i * 3 + 1] = 0.2;
    }
    mg.attributes.position.needsUpdate = true;
  };
  world.G = G; world.mesh = mesh;
  return world;
}
