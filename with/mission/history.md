# Mission log and lessons: temple-runner-01

- Briefing: one question changed the whole look. "Cartoon or realistic?" Answer: realistic. The first build was stylized low-poly; it was rebuilt with a photo sky that lights the scene, photo stone and grass textures, a rigged human runner and metal relics.
- ux unit (cold review of screenshots): 23 findings, 0 blockers, 11 major, 12 minor. 21 fixed in one loop. Not fixed: hit feedback on death (18), loading failure state beyond one line (23).
- inspector general (cold): 8 of 9 checks passed or minor partial, RED on check 9 (frame cost never reported). Fixed by `engineering.md`.
- Open: restart does not reset the world position; speed stops rising at 36 m/s; three.js and the photo assets load from a CDN, so the page needs a connection.

Lessons
- Decide realistic or stylized in the briefing, before the art direction is written.
- Glow is a signal. Scenery that glows like a collectible makes the collectible invisible.
- Write the measurement into the plan as a deliverable file, or it will not exist at inspection.
