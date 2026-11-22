# Operation order: temple runner (Army mission)

**Mission (the prompt, unchanged):** Build a Temple Run style endless runner that plays in the browser. Three lanes, jump, slide, coins, obstacles, speed that keeps rising. Focus on the graphics: make it look amazing.

**Commander's intent:** someone opens the page and the first frame already looks like a real game, not a prototype. The run stays readable at full speed.

**Briefing answers:** realistic look, not cartoon (owner's answer); original names only (no art, names or layouts from any existing game); runs from static files, three.js only; keyboard and swipe.

## Definition of done (testable)
1. Three lanes, jump, slide, coins, three obstacle kinds, speed rises. A 60 second autopilot run finishes without a crash.
2. One art direction, written down before any code: a palette of named colors, used by every material (no stray hex values in scene code).
3. Light does the work: sun with soft shadows, haze, glow on bright things, a graded final image.
4. Two zones that look different (a bright one and a dark one), with a visible gate between them.
5. The hero is a jointed human figure with a real run cycle, a jump and a slide. No box-on-legs.
6. Nothing on screen is a bare primitive with a flat color: every surface has a texture or a deliberate shape.
7. Obstacles are readable at speed: each kind has its own silhouette and the player can tell jump, slide or dodge at a glance.
8. HUD: distance and relics, styled to the world, at most two counters, readable on a phone.
9. Frame cost is measured and reported.

**Tier:** operation, lean mode. Two phases: build, then review and fix (one loop).

## Units and reasons
- engineering (builder, optimizer): builds the game, measures frame cost.
- ux (ux-review, design-consistency): reviews screenshots of the running game cold. The mission is about looks, so this unit carries the weight.
- inspector-general: judges the result cold against the definition of done.
- history: lessons file.
- Left out: defense (static page, no input beyond keys, no network, no storage), legal beyond the originality constraint above, growth, treasury, sales, intel.

## Art direction (ux, before engineering starts)
"Sunken causeway": a stone road across open grassland at sunrise that dives into a torch-lit hall. Realistic: a real photo sky lights the scene, photo stone and grass, a rigged human runner, metal relics that reflect the sky. (First pass was stylized low-poly; replaced after the briefing answer.)
- Sun low and in front of the runner, so everything is rim-lit and shadows fall toward the camera.
- Palette: every tint in scene code comes from named colors in `src/palette.js` (sand, stone, moss, sun gold, ember, glyph teal, night blue and the sky and haze tones sampled from the sunrise photo).
- Bright zone = warm haze, long shadows, light shafts, gold dust. Dark zone = night blue shadows, ember light from below, teal glyphs.
- Glow is reserved for things that matter: relics, fire, glyphs.
- Obstacle language: low and mossy = jump; a burning beam overhead = slide; a tall statue = dodge.
