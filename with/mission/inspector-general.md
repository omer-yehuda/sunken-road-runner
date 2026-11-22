# Inspector General report: temple-runner-01

Verdict: **RED** (one definition-of-done item fails: no frame cost report exists). The game itself runs, plays and looks strong.

Inspected cold: `/home/claude/cmp/with/` (index.html, style.css, src/*.js, fonts/). Nothing in the deliverables was edited.
Evidence screenshots: `/home/claude/cap/ig/` (`land-*` 1280x720, `dark-*` 1280x720, `phone-*` 390x844 at DPR 3). Harness used: `/home/claude/cap/cap.mjs` plus my own multi-still wrappers `/home/claude/cap/ig/igcap.mjs` and `igcap2.mjs` (same autopilot, real key and touch events added).

## FAIL items first

### F1. DoD 9: frame cost is measured and reported: FAIL
- No frame cost figure exists anywhere in the deliverables or the mission folder. `mission/` holds only `opord.md` and `ux.md`. A text search of `/home/claude/cmp` and `/home/claude/cap` for "frame cost", "ms per frame", "draw calls" finds only the requirement itself (`opord.md:18`, `:23`) and one remark in `ux.md:121` that says frame cost is "for engineering".
- No in-game counter or log either (no `performance` timing or `renderer.info` output in `src/`).
- Fixed looks like: a short engineering note in `mission/` with ms per frame (or fps) on a named device and resolution, draw calls and triangles per zone, and the cost of the known heavy items (2048 shadow map, bloom, `preserveDrawingBuffer: true` at `main.js:16`, pixel ratio up to 2).
- I could not measure it myself in a meaningful way: only software WebGL is available here. UNVERIFIED on real hardware.

## Checklist

| # | Requirement | Verdict | Evidence |
|---|---|---|---|
| 1 | Three lanes, jump, slide, coins, three obstacle kinds, speed rises; 60 s autopilot run without a crash | PASS | `node cap.mjs ... 0 60` returned `alive:true, score 1536 m, coins 369, speed 35.2`. No page errors. Lanes -1/0/1 (`main.js:117-118`), jump and slide (`:119-120`), relics (`main.js:83`), kinds low/high/tall (`main.js:61-80`), speed 16 rising 0.32 per second (`main.js:144`). Note: speed is capped at 36, reached after about 62 s, so it stops rising from then on. |
| 2 | One art direction, written down first; named palette used by every material; no stray hex in scene code | PARTIAL (minor) | Art direction is in `opord.md:29-35` (file time 20:22, before `src/` at 20:25). `main.js`, `world.js`, `hero.js` contain zero hex colors; all go through `P` in `palette.js`. But: (a) the opord says nine colors are "the only colors allowed" and `palette.js` defines about 30 (skin, leather, cloth, stoneDark, jungleLight, mossTint, 13 sky and light colors); (b) `textures.js` paints with literal colors outside the palette (`:50` moss `rgba(95,130,50)`, `:63`, `:98` flame colors, `:87` glow `rgba(255,200,110)`); (c) `style.css:17,20,35` use `#fff3cf`, `#c9872a`, `#fff3d6`. |
| 3 | Sun with soft shadows, haze, glow on bright things, graded final image | PASS | `PCFSoftShadowMap` (`main.js:18`), directional sun with 2048 shadow map (`world.js:186-190`), `FogExp2` (`world.js:193`), bloom pass (`main.js:29`), grade pass with split tone, vignette and grain plus ACES tone mapping (`main.js:30-43`). Seen in `land-02-bright.jpg`: long shadows toward the camera, warm haze, glowing relics and eyes. |
| 4 | Two zones that look different, with a visible gate | PASS | Bright jungle causeway (`land-02-bright.jpg`) and dark torch hall with lava channels and teal glyphs (`dark-11-dark-low.jpg`). Gate wall with doorway, torches and glyph pillars is clearly visible on approach (`land-03-jump.jpg`, `dark-05-gate-approach.jpg`). Zone name toast fires on entry. |
| 5 | Hero is a jointed figure with run, jump and slide poses | PASS | Hips, torso, head, two-part arms and legs, five-link scarf (`hero.js:14-48`). Run (`land-11-low.jpg`), jump with arms up and knee tucked (`land-03-jump.jpg`, `dark-12-dark-high.jpg`), slide leaning back under the beam (`land-13-fast.jpg`, `dark-04-slide.jpg`). |
| 6 | No bare primitive with a flat color | PASS (note) | Paving, blocks, walls, ground, bark and leaves are all textured with bump maps. Relics are faceted with a glow. Note: the hero's parts are untextured single-color capsules and boxes (`hero.js:7`); it reads as a deliberate toy-like figure, but it is the least finished surface on screen. |
| 7 | Obstacles readable at speed, own silhouette each | PASS (note) | Low mossy slab with teal stripe = jump (`land-12-high.jpg` foreground); wide beam with hanging flames and ember glyphs = slide (`land-10-tall.jpg`); tall statue with lit teal eyes = dodge (`land-11-low.jpg`). All three stay distinct in the dark zone and on a phone (`phone-11-dark-low.jpg`). Note: the decorative arch in the bright zone carries the same glyph band motif as the slide beam; scale keeps them apart. |
| 8 | HUD: distance and relics, styled, at most two counters, readable on a phone | PASS | Exactly two chips (`index.html:13-16`), Cardo serif, gold on night blue, tabular digits. On a 390x844 phone the digits compute to 23.8 CSS px (`phone-02-bright.jpg`). Bundled font loads (`document.fonts.check` true). |
| 9 | Frame cost measured and reported | **FAIL** | See F1. |

## Mission and briefing requirements

| Requirement | Verdict | Evidence |
|---|---|---|
| Plays in the browser, no errors | PASS | No console errors or page errors in any run. Start card, game-over card and restart all work (`land-00-start.jpg`, `land-14-over.jpg`; Enter restarted to `alive:true, score 0`). |
| Keyboard | PASS | Real key events: first key starts; ArrowLeft lane 0 to -1; second ArrowLeft stays at -1; KeyD back to 0; ArrowUp y = 1.06; ArrowDown sliding = 0.68. |
| Swipe | PASS | Synthetic touch events: swipe right lane 1, left lane 0, up y = 1.06, down accepted. 24 px threshold, one action per touch (`main.js:128-135`). Not tested on a real phone: UNVERIFIED there. |
| Runs from static files, three.js only | PARTIAL | Only three.js and its addons are used. But three.js is not in the deliverable: `index.html:8-10` imports it from `https://unpkg.com/three@0.170.0/`. My run made 12 requests to unpkg.com (served from a local copy by the harness). Offline, or if the CDN is down, the page is a dark screen with a start card and no game. Fixed looks like: copy the three.js module and the six addon files into the folder and point the import map at them. |
| Original look and names | PASS (UNVERIFIED on the web) | Names "The Sunken Road", "Hall of Embers", "relics"; invented glyphs drawn in code (`textures.js:68-85`); all textures are generated; font is Cardo with its OFL licence included. No network was allowed, so no name search was done. |
| "Make it look amazing" | PASS | Both zones are atmospheric and coherent. See minor issues below. |

## Minor issues (not blocking)

1. Zone toast text is cream on the brightest part of the sky and is hard to read in the bright zone (`land-04-slide.jpg`, `phone-02-bright.jpg`).
2. Relics render pale cream rather than gold in the bright zone, so the thing to collect has weak color identity (`land-10-tall.jpg`).
3. Dying within about 2.6 s of a zone change leaves the zone toast on top of the game-over card (`land-14-over.jpg`).
4. Restart does not reset the world: `reset()` (`main.js:104-110`) clears obstacles and relics but not the segment index, so a new run starts wherever the last one ended, possibly inside the hall, and zone distances no longer match the distance counter.
5. After a hit the hero freezes standing inside the obstacle; there is no hit reaction (`land-14-over.jpg`).
6. Each statue creates a new `SpriteMaterial` that is never disposed (`main.js:78`): slow growth on long sessions.
7. On a 390 px wide phone the start card runs edge to edge with no margin (`phone-00-start.jpg`).
8. Speed cap of 36 is reached after about 62 s; "keeps rising" ends there.

## Commands run

- `node cap.mjs /home/claude/cmp/with ig/t60.jpg 1280 720 0 60`
- `node ig/igcap.mjs 1280 720 land` (input tests, obstacle stills, death and restart)
- `node ig/igcap2.mjs 1280 720 dark` and `node ig/igcap2.mjs 390 844 phone 3`
- Text searches for hex colors and for any frame cost report.

## Embedded instructions found in data

None.
