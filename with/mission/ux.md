# UX and visual review: The Sunken Road (mission temple-runner-01)

Unit: ux (ux-review, design-consistency). Cold review from screenshots and source only. No files changed, nothing run.

## Verdict

The game already passes the "is this a real game" glance: graded image, textured stone, a jointed hero, two clearly different zones, a styled HUD and a good-looking game-over card. What holds it back is **signal discipline**. The art direction says glow is reserved for things that matter, but scenery glows as hard as, or harder than, relics and hazards, and several decorations imitate collectibles or obstacles. At speed the eye is pulled to the wrong places. No blockers; 11 major, 12 minor.

## Evidence base and limits

- Viewed: `on_3`, `on_9`, `on_11`, `on_13`, `on_17`, `on_23` (1280x720), `on_p` (1080x1920). Also opened `on_16` / `on_22` (game-over overlay) and `on1` (a wide off-axis frame; treated as supplementary because its camera is not the gameplay camera).
- **UNVERIFIED: the burning beam (slide obstacle) is not clearly visible in any screenshot.** Everything said about it is from code.
- **UNVERIFIED: the first frame (t = 0) and the "The Sunken Road" toast** are not in any screenshot; the earliest frame is 49 m.
- Readability "at full speed" is judged from stills; the highest speed captured is around 452 m, well short of the 36 m/s cap (`main.js:146`).

## Key tasks walked

1. Open the page and understand what to do. 2. Read the next obstacle and pick jump / slide / dodge. 3. Spot and collect relics. 4. Track distance and relics. 5. Die, read the result, restart.

## Findings

Severity: blocker = task cannot be completed; major = clearly hurts the intent (finished look, readable at speed); minor = polish.

| # | Screen | Issue | User impact | Sev | Fix (file:line) |
|---|---|---|---|---|---|
| 1 | Bright zone (`on_3`, `on_9`, `on_11`) | The rail posts carry glowing gold octahedra with halos every 8 m. Same shape, color and glow as relics (`gem` + `M.gold` + `haloGold`). | The player sees two rows of "relics" that can never be collected; real relics stop standing out. Breaks "collectibles = gold relics". | major | `world.js:85-88`: remove the gem and halo, or replace with a non-gold, non-glowing stone finial. |
| 2 | Hall (`on_17`, `on_23`, `on_p`) | Lava channels, torch halos, floor glow pools and teal glyph bands are the brightest and largest things on screen. Lava clips to white-yellow. | Glow no longer means "this matters". At speed the bright, fast-moving edges of the screen pull the eye away from the lanes. | major | `world.js:52` lava gain `a*2.2` to about 1.2 and `b*...*3.0` to about 1.0; `world.js:32` glyphTeal `emissiveIntensity` 2.4 to about 1.1; `world.js:37` pool opacity 0.55 to about 0.3; `world.js:138` pool scale 7 to about 4 so it stays off the lanes. |
| 3 | Both zones (`on_p`, `on_23`, `on_11`) | Relics blow out to flat cream diamonds: emissive 1.1 + additive glow sprite + bloom. They lose the gold hue and the facets and look like paper cut-outs. In the bright zone they are cream on cream paving and sun haze; in the hall they match the lava highlights. | The one thing the player hunts for has the weakest color identity in the frame. | major | `main.js:57` `emissiveIntensity` 1.1 to about 0.45 so the saturated gold and the flat shading survive; `main.js:58` glow opacity 0.8 to about 0.4; optionally raise bloom threshold in `main.js:29`. |
| 4 | Both zones (`on_23`, `on_16`) | The low block (jump) is the only obstacle with no light signal. It uses `M.block`, the same texture as rail posts, gate pillars, columns and statues, and the same 1.0 height as the rail posts. In the hall it turns the same orange-brown as the floor (`on_23`, barely separable from the paving). | The jump obstacle is the hardest to see, and it gets worse as speed and darkness increase. Fails "tell jump, slide or dodge at a glance" for one of three kinds. | major | `main.js:67-69`: give it its own signature, e.g. a thick, bright moss cap overhanging the front edge (moss is the stated language for "jump") plus a pale sand top edge; make the cap material non-shared and lighter so it survives ember light. |
| 5 | Bright zone (`on_3`, `on_11`) | Roadside "broken columns" are a cylinder with a slab on top, built from `M.block`, 1.5 to 4.5 m tall, right beside the rail. The statue is a cylinder with a box head from `M.block`. Only the teal eyes differ. | False alarms: a tall grey totem beside the lane reads as a statue until the eyes are resolved. | major | `world.js:104-108`: drop the cap slab and break the top (tilted, jagged), push to x of at least 8, or cap the height below 1.5 m. |
| 6 | Bright zone gate (`on_9`) | Vines end in large green balls that hang as low as about 3.3 m, across all three lanes, as bare icosahedra on sticks. | Reads as an overhead hazard ("slide?") and as unfinished geometry: the weakest object in the bright zone. | major | `world.js:122-126`: limit length to about 0.5-1.6, keep x outside the lanes (abs(x) > 4.3), and flatten or cluster the leaf shape. |
| 7 | Hall exit (`on_23`) | The look blend follows only the zone the runner is standing in (`world.js:227-229`). Looking out of the hall, the jungle is rendered pitch black with gold sun shafts hanging in a black sky (shafts are additive with `fog:false`), then pops to daylight after the door. | Looks like a rendering bug at the most dramatic moment of the loop, twice per cycle. | major | `world.js:35-36` + update at `world.js:230`: set `M.shaftSun.opacity = 0.16*(1-k)` and `M.shaftMoon.opacity = 0.10*k`. Better: drive `blend` from distance to the next portal so the grade starts changing before the doorway. |
| 8 | Hall (`on_13`, `on_17`, `on_23`) | The hero is dark teal and leather on a dark floor with no rim light; the red scarf is red on ember orange. In `on_13` the legs nearly vanish; in `on_23` the slide pose is a dark lump. | The player loses track of their own character in the dark zone, most of all during slide and lane changes. | major | `hero.js:6-8`: add a small emissive lift, or add a cool rim light that follows the hero and scales with `world.blend` (next to the fire light at `world.js:207`). The art direction already asks for rim light. |
| 9 | Start (code) | No start state. `reset()` runs on load (`main.js:202`) and the run begins immediately at 16 m/s. No title beyond a 2.6 s toast, no control hint for keys or swipe. | A first-time visitor can hit the first obstacle (45 m, under 3 s) before knowing the controls. The first frame is a run in progress, not a game opening. | major | `main.js`: add a `started` flag; hold speed at 0 with the camera idling until the first input; show the title and a one-line hint ("Swipe or arrow keys: move, jump, slide") in `index.html` using the existing `#zone` styling. |
| 10 | Game over (code + `on_16`) | Any `touchend` restarts when dead (`main.js:136`), and Space / Enter restart at once (`main.js:130`). The swipe or jump press that was in flight when the hero died restarts the run. | The result card can vanish before it is read; on phones this will happen often. | major | `main.js:197` record time of death; in `act()` (`main.js:121`) ignore `restart` for about 0.6 s. |
| 11 | Phone (code) | Swipes fire on `touchend` (`main.js:134-139`), so the action waits for the finger to lift. | Input feels late exactly when speed is highest. | major | Fire in a `touchmove` handler as soon as the 24 px threshold is crossed, once per touch. |
| 12 | Phone portrait (`on_p`) | Horizon sits at about 45% of the height; the top third is ceiling and the hero is under 8% of screen height. Upcoming obstacles are small. | Less reading distance on the device where a runner is most likely played. | minor | `main.js:183-184`: in portrait raise the camera a little and pull the look-at target nearer and lower so the horizon lands near 33% from the top. |
| 13 | Both zones (`on_13`, `on_17`, `on_p`) | Additive light shafts stack along the center line (x in -1..1 in the hall, `world.js:143-145`), plus bloom, exactly at the vanishing point. In `on_p` the far center is a pale blob. | The spot where the next obstacle appears is the most washed-out part of the image. | minor | `world.js:144`: move hall shafts off the center lane or halve their number; `world.js:36` opacity 0.10 to 0.06. |
| 14 | Bright zone (`on_3`, `on_9`) | Trees and bushes are flat-color icosahedra on plain cylinders (`world.js:26-29`), next to fully textured stone. | The foliage is where the scene still looks like a prototype; it also misses definition of done #6 (no flat-color primitives). | minor | Give leaf and bark materials a map/bump (the `mossGround` texture is already available), and build crowns from 5-6 smaller blobs. |
| 15 | Bright zone (`on_3`, `on_9`) | Hero trousers use `P.sand`, the same family as the sunlit paving. | The lower body fades into the road; the run cycle is harder to read. | minor | `hero.js:7`: use `P.leather` or `P.cloth` for trousers. |
| 16 | All (`on_9`, `on_11` edges) | Chromatic fringe is visible at the frame edges and grows with speed (`main.js:35`). | Softens edge detail as speed rises, against "readable at full speed". | minor | Cap it: `0.0015 + speed * 0.003`. |
| 17 | Start toast (code, UNVERIFIED) | Zone toast is cream text with a gold glow at 16% from the top (`style.css:18-19`), which in the bright zone is pale haze sky. | The only title the game shows is likely low contrast on the first screen. | minor | Add a dark text shadow (`0 0 12px` night at about 0.8) or a soft night backdrop band. |
| 18 | Game over (`on_16`) | The card is centered over the hero and the obstacle that killed them. No hit feedback (no flash, shake or fall); the hero freezes mid-stride and the overlay appears with no transition (`style.css:22-23`). | The player cannot see what killed them; the ending feels abrupt. | minor | Offset the card upward (`align-items: flex-start` with top padding), fade `#over` in over about 0.3 s after a short delay, add a brief camera shake. |
| 19 | Game over (code) | No focus is moved to "Run again"; no hover or active state on the button; no "new best" cue; no restart hint for keyboard. | Small losses in clarity and keyboard flow. | minor | `main.js:200` call `$('again').focus()`; `style.css:28` add `:hover` / `:active`; highlight the Best row when beaten. |
| 20 | HUD (all) | Digits are proportional and the chips have no fixed width, so the distance chip changes width as the number ticks. | Slight jitter in the corner of the eye, constantly. | minor | `style.css:13`: `font-variant-numeric: tabular-nums`. |
| 21 | HUD phone (`on_p`, code) | Portrait HUD offset is a fixed `5u` (`style.css:9`) although the page declares `viewport-fit=cover`. | Wasted space on phones without a notch, possible overlap on phones with a deep one. | minor | Use `max(1.2u, env(safe-area-inset-top))` and the matching left / right insets. |
| 22 | All (code) | Font stack starts with Cinzel and Cardo, but neither is loaded (`style.css:3`, no `@font-face`). | The look depends on what is installed; most users get Georgia. | minor | Drop the unloaded names, or ship one font file locally. |
| 23 | Load (code) | three.js comes from a CDN (`index.html:9-10`) with no loading or failure state. | On a slow or offline connection the user sees a dark page with two empty counters. | minor | Hide the HUD until the first frame renders; show a one-line message on import failure. |

What already works (keep): HUD chips are legible on both the bright sky and the dark hall; the statue's teal eyes read from far away in both zones; the portal wall is a clear gate; the game-over card is on style; the button meets the 48 px touch size.

## Design consistency

### Tokens: colors outside `palette.js` (definition of done #2)

Scene code, `world.js`, 15 stray hex values:

- `:25` `0xb9c98a` (moss tint)
- `:174` `0x3d7fb8` (sky top)
- `:219` `0xe9b677`, `0x3f86c2`, `0xffd9a0`, `0xffd7a3`, `0xbfd8ff`, `0xc9a67c`, `0xa98a66`
- `:220` `0x0a1018`, `0x04070d`, `0x0f2230`, `0x6f9fd0`, `0x24405c`, `0x3a1206`
- Shader literals: `:52` `vec3(0.05,0.01,0.0)`; `:182` `vec3(1.0,0.75,0.4)`, `vec3(1.0,0.9,0.7)`
- `0xffffff` at `:38`, `:201`, `:202`, `:208` are neutral placeholders overwritten each frame; acceptable.

`textures.js`, near-misses of palette colors typed by hand:

- `:50` `rgba(95,130,50)` (close to moss, not moss); `:63` `rgba(120,165,60)`, `rgba(10,30,15)`
- `:31` `255,240,210`; `:35` `rgba(20,16,10)`; `:38` `rgba(15,12,8)`
- `:87` `rgba(255,200,110)` (sun gold is 255,199,107); `:98` `255,250,220` / `255,170,50` / `255,80,20` (ember is 255,106,31)
- Exempt: bump-map greys (`:24`, `:36`, `:38`) and black / white masks (`:72-73`, `:106-109`) are data, not color.

`style.css`:

- Non-token hex: `#fff3cf` and `#c9872a` (`:15`), `#fff3d6` (`:18`, `:27`).
- Tokens re-typed as raw rgba: night `rgba(11,21,34,..)` 5 times (`:11`, `:22`, `:24`), gold `rgba(255,199,107,..)` 7 times (`:11-13`, `:19`, `:24`), sand `rgba(217,185,138,..)` (`:26`).
- `--red` is never used; `--teal` is used once.
- CSS tokens are a hand copy of `palette.js`: two sources of truth.

`main.js` and `hero.js`: clean, every color comes from `P`.

Proposed standard: add the atmosphere colors to `palette.js` as named entries (for example `hazeWarm`, `skyDay`, `skyNight`, `fogNight`, `ridgeNear`, `ridgeFar`, `emberShadow`, `highlight`) and have `LOOK`, the shaders and `textures.js` read them through `P` / `css()`. In CSS, define `--gold-rgb`, `--night-rgb`, `--sand-rgb` once (or set the variables from `palette.js` at startup) and add `--highlight` for `#fff3d6`.

### Palette scope

The art direction allows nine colors. `palette.js` has fourteen: `stoneDark`, `jungleLight`, `skin`, `leather`, `cloth` are additions. Reasonable for the hero and for shading, but they should be written into the art direction. A day-sky blue (`0x3f86c2`) is used and is not in the direction at all.

### Glow semantics

- Gold glow: relics, rail gems, gate glyphs, portal glyphs, horizon beacon, hero buckle.
- Teal glow: statue eyes (hazard), wall glyph bands, portal bands, moon shafts.
- Ember glow: beam (hazard), torches, lava, floor pools, hall fill light.

Each color is shared between gameplay and decoration. Standardize: gameplay objects glow at full strength, decoration at roughly a third or less (findings 1, 2, 3).

### Materials

`M.block` is used for rails, posts, gate, columns, statues and low blocks. One stone for everything is consistent, but the obstacles need their own variant (finding 4).

### Typography

Six sizes (1.0, 1.1, 1.2, 1.7, 2.0, 2.3 x `--u`) and two letter-spacing styles. Acceptable; 1.0 / 1.1 / 1.2 could collapse to one. Fonts are not loaded (finding 22).

### States

Button has `:focus-visible` only; no hover, active or disabled. The overlay has no enter transition while the zone toast has one.

### Responsiveness

One breakpoint (`body.portrait`, set in JS). The layout holds in both captures. Safe-area insets are not used (finding 21).

## Top 3 changes: highest impact, lowest effort

1. **Give glow back to gameplay (findings 1, 2, 3).** Delete the rail gems (`world.js:85-88`), turn down lava, glyph bands and floor pools (`world.js:32`, `:37`, `:52`), and lower relic emissive and halo (`main.js:57-58`). Number changes only; fixes relic readability in both zones and calms the hall.
2. **Make every obstacle unmistakable and remove the look-alikes (findings 4, 5, 6).** A bright overhanging moss cap on the low block (`main.js:67-69`), no slab on roadside columns (`world.js:104-108`), short vines kept off the lanes (`world.js:122-126`). A few lines each.
3. **Fix the two ends of the run (findings 9, 10).** Wait for the first input before the run starts, with the title and a one-line control hint; ignore restart input for about 0.6 s after death (`main.js:121`, `:197`, `:202`). About ten lines.

Next in line if there is time: fade sun shafts by zone (finding 7, two lines) and a hero rim light in the hall (finding 8).

## Out-of-scope observations (one line each)

- `preserveDrawingBuffer: true` (`main.js:16`) and a 2048 shadow map have a frame cost; for engineering.
- No audio at all; a finished runner usually has at least pickup and hit sounds.
- No pause; a phone interruption ends the run.
- `aria-label` on plain `div`s (`index.html:14-15`) is not announced without a role.
