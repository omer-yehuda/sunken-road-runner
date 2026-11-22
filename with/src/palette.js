// The whole look comes from these named colors (opord: definition of done #2).
export const P = {
  sand: 0xd9b98a,
  stone: 0x8f8572,
  stoneDark: 0x4d473d,
  moss: 0x6f8f3a,
  jungle: 0x1f4d2b,
  jungleLight: 0x4f8a35,
  sunGold: 0xffc76b,
  ember: 0xff6a1f,
  glyphTeal: 0x35e0c8,
  nightBlue: 0x0b1522,
  scarfRed: 0xd8362b,
  skin: 0xe2a877,
  leather: 0x5b3a22,
  cloth: 0x2f6f73,
  white: 0xffffff,
  mossTint: 0x8a8558,
  // sky, haze and light for the bright zone
  dayFog: 0xb9b4a6, daySkyTop: 0x3f86c2, daySkyLow: 0xffd9a0, daySun: 0xffd7a3, daySkyLight: 0xbfd8ff, ridgeFar: 0xa6a59c, ridgeNear: 0xa98a66,
  // and for the dark zone
  hallFog: 0x0a1018, hallSkyTop: 0x04070d, hallSkyLow: 0x0f2230, hallMoon: 0x6f9fd0, hallSkyLight: 0x24405c, hallBounce: 0x3a1206,
};
export const css = n => '#' + P[n].toString(16).padStart(6, '0');
