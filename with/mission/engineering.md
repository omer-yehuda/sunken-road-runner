# Engineering report: frame cost (definition of done #9)

Written after the inspector general failed item 9 on the first inspection (no frame cost report existed).

Measured with `renderer.info` on one frame, 1280x720, after 8 s (bright zone) and 16 s (dark zone) of an autopilot run. Headless Chrome with software WebGL (SwiftShader), so milliseconds are not meaningful here: real GPU frame time is UNVERIFIED.

| | Without (plain run) | With (bright zone) | With (dark zone) |
|---|---|---|---|
| Draw calls per frame | 123 | 709 | 747 |
| Triangles per frame | 6,856 | 54,971 | 49,843 |
| Textures in memory | 1 | 35 | 35 |
| Materials | 65 | 31 | 27 |
| Lights | 2 | 4 | 4 |

Known heavy items in the "with" version: one 2048 shadow map, a bloom pass, a grade pass, a rigged character (skinned mesh), about 1,190 scene objects that are not merged or instanced.
Cheapest wins if it needs to run faster: instance the rail posts and columns, merge each road segment's static stone into one mesh, halve the shadow map on phones.

Software render time in this session (not a real device): about 1 s per 1280x720 frame for the "with" version, about 0.2 s per 1920x1080 frame for the plain one.
