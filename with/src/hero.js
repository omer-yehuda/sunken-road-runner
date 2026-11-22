import * as THREE from 'three';

// A realistic human runner: a rigged model playing a real run cycle.
export function createHero(gltf) {
  const root = new THREE.Group(), tilt = new THREE.Group(); root.add(tilt);
  const model = gltf.scene; tilt.add(model);
  model.scale.setScalar(1.08);
  model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
  const mixer = new THREE.AnimationMixer(model);
  const run = mixer.clipAction(gltf.animations.find(a => a.name === 'Run')); run.play();
  let slideK = 0, airK = 0;
  const L = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
  function update(dt, s) {
    slideK = L(slideK, s.sliding > 0 ? 1 : 0, Math.min(1, dt * 14));
    airK = L(airK, s.y > 0.05 ? 1 : 0, Math.min(1, dt * 12));
    run.timeScale = (0.95 + s.speed * 0.022) * (1 - airK * 0.55) * (1 - slideK * 0.85);
    mixer.update(dt);
    root.position.set(s.x, s.y, 0);
    root.rotation.z = -clamp(s.vx, -12, 12) * 0.016;
    tilt.rotation.x = slideK * 1.22 - airK * 0.12;      // lean back into the slide, tuck forward in the air
    tilt.position.y = slideK * 0.28;
    tilt.position.z = -slideK * 0.5;
  }
  return { root, update };
}
