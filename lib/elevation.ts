// Terrain elevation grid for Södermalm (90 points from Open-Meteo API)
// Elevation in meters above sea level. 0 = water.

const GRID: { x: number; z: number; e: number }[] = [
  { x: -44.6, z: 40.9, e: 17 }, { x: -35.1, z: 40.9, e: 13 }, { x: -25.7, z: 40.9, e: 0 },
  { x: -16.2, z: 40.9, e: 0 }, { x: -6.8, z: 40.9, e: 0 }, { x: 2.7, z: 40.9, e: 0 },
  { x: 12.2, z: 40.9, e: 24 }, { x: 21.6, z: 40.9, e: 29 }, { x: 31.1, z: 40.9, e: 27 },
  { x: 40.5, z: 40.9, e: 16 },
  { x: -44.6, z: 31.8, e: 41 }, { x: -35.1, z: 31.8, e: 13 }, { x: -25.7, z: 31.8, e: 0 },
  { x: -16.2, z: 31.8, e: 4 }, { x: -6.8, z: 31.8, e: 0 }, { x: 2.7, z: 31.8, e: 42 },
  { x: 12.2, z: 31.8, e: 30 }, { x: 21.6, z: 31.8, e: 30 }, { x: 31.1, z: 31.8, e: 36 },
  { x: 40.5, z: 31.8, e: 35 },
  { x: -44.6, z: 22.7, e: 5 }, { x: -35.1, z: 22.7, e: 8 }, { x: -25.7, z: 22.7, e: 0 },
  { x: -16.2, z: 22.7, e: 4 }, { x: -6.8, z: 22.7, e: 24 }, { x: 2.7, z: 22.7, e: 41 },
  { x: 12.2, z: 22.7, e: 37 }, { x: 21.6, z: 22.7, e: 34 }, { x: 31.1, z: 22.7, e: 31 },
  { x: 40.5, z: 22.7, e: 26 },
  { x: -44.6, z: 13.6, e: 5 }, { x: -35.1, z: 13.6, e: 10 }, { x: -25.7, z: 13.6, e: 0 },
  { x: -16.2, z: 13.6, e: 36 }, { x: -6.8, z: 13.6, e: 40 }, { x: 2.7, z: 13.6, e: 36 },
  { x: 12.2, z: 13.6, e: 24 }, { x: 21.6, z: 13.6, e: 38 }, { x: 31.1, z: 13.6, e: 39 },
  { x: 40.5, z: 13.6, e: 31 },
  { x: -44.6, z: 4.5, e: 6 }, { x: -35.1, z: 4.5, e: 0 }, { x: -25.7, z: 4.5, e: 5 },
  { x: -16.2, z: 4.5, e: 22 }, { x: -6.8, z: 4.5, e: 33 }, { x: 2.7, z: 4.5, e: 31 },
  { x: 12.2, z: 4.5, e: 35 }, { x: 21.6, z: 4.5, e: 28 }, { x: 31.1, z: 4.5, e: 41 },
  { x: 40.5, z: 4.5, e: 47 },
  { x: -44.6, z: -4.5, e: 0 }, { x: -35.1, z: -4.5, e: 21 }, { x: -25.7, z: -4.5, e: 22 },
  { x: -16.2, z: -4.5, e: 29 }, { x: -6.8, z: -4.5, e: 31 }, { x: 2.7, z: -4.5, e: 30 },
  { x: 12.2, z: -4.5, e: 38 }, { x: 21.6, z: -4.5, e: 40 }, { x: 31.1, z: -4.5, e: 41 },
  { x: 40.5, z: -4.5, e: 40 },
  { x: -44.6, z: -13.6, e: 25 }, { x: -35.1, z: -13.6, e: 16 }, { x: -25.7, z: -13.6, e: 32 },
  { x: -16.2, z: -13.6, e: 43 }, { x: -6.8, z: -13.6, e: 38 }, { x: 2.7, z: -13.6, e: 25 },
  { x: 12.2, z: -13.6, e: 35 }, { x: 21.6, z: -13.6, e: 39 }, { x: 31.1, z: -13.6, e: 39 },
  { x: 40.5, z: -13.6, e: 0 },
  { x: -44.6, z: -22.7, e: 13 }, { x: -35.1, z: -22.7, e: 7 }, { x: -25.7, z: -22.7, e: 9 },
  { x: -16.2, z: -22.7, e: 0 }, { x: -6.8, z: -22.7, e: 15 }, { x: 2.7, z: -22.7, e: 12 },
  { x: 12.2, z: -22.7, e: 24 }, { x: 21.6, z: -22.7, e: 8 }, { x: 31.1, z: -22.7, e: 0 },
  { x: 40.5, z: -22.7, e: 0 },
  { x: -44.6, z: -31.8, e: 0 }, { x: -35.1, z: -31.8, e: 19 }, { x: -25.7, z: -31.8, e: 18 },
  { x: -16.2, z: -31.8, e: 0 }, { x: -6.8, z: -31.8, e: 0 }, { x: 2.7, z: -31.8, e: 0 },
  { x: 12.2, z: -31.8, e: 0 }, { x: 21.6, z: -31.8, e: 3 }, { x: 31.1, z: -31.8, e: 0 },
  { x: 40.5, z: -31.8, e: 0 },
];

// Scale: 47m real → about 15 game units (dramatic hills)
const ELEV_SCALE = 8 / 47;

/**
 * Get interpolated terrain elevation at a game coordinate.
 * Returns elevation in game units (0 = sea level).
 */
export function getElevation(x: number, z: number): number {
  // Find the 4 nearest grid points and bilinear interpolate
  // Grid spacing: x every ~9.5 units, z every ~9.1 units
  const gridXs = [-44.6, -35.1, -25.7, -16.2, -6.8, 2.7, 12.2, 21.6, 31.1, 40.5];
  const gridZs = [40.9, 31.8, 22.7, 13.6, 4.5, -4.5, -13.6, -22.7, -31.8];

  // Find bounding grid cell
  let xi = 0;
  for (let i = 0; i < gridXs.length - 1; i++) {
    if (x >= gridXs[i] && x <= gridXs[i + 1]) { xi = i; break; }
    if (x < gridXs[0]) { xi = 0; break; }
    if (x > gridXs[gridXs.length - 1]) { xi = gridXs.length - 2; break; }
  }

  let zi = 0;
  for (let i = 0; i < gridZs.length - 1; i++) {
    if (z <= gridZs[i] && z >= gridZs[i + 1]) { zi = i; break; }
    if (z > gridZs[0]) { zi = 0; break; }
    if (z < gridZs[gridZs.length - 1]) { zi = gridZs.length - 2; break; }
  }

  // Get 4 corner elevations
  const get = (gxi: number, gzi: number) => {
    const idx = gzi * 10 + gxi;
    return idx >= 0 && idx < GRID.length ? GRID[idx].e : 0;
  };

  const e00 = get(xi, zi);
  const e10 = get(xi + 1, zi);
  const e01 = get(xi, zi + 1);
  const e11 = get(xi + 1, zi + 1);

  // Bilinear interpolation
  const tx = gridXs[xi + 1] !== gridXs[xi]
    ? (x - gridXs[xi]) / (gridXs[xi + 1] - gridXs[xi])
    : 0;
  const tz = gridZs[zi + 1] !== gridZs[zi]
    ? (z - gridZs[zi]) / (gridZs[zi + 1] - gridZs[zi])
    : 0;

  const txc = Math.max(0, Math.min(1, tx));
  const tzc = Math.max(0, Math.min(1, tz));

  const e = e00 * (1 - txc) * (1 - tzc) + e10 * txc * (1 - tzc) + e01 * (1 - txc) * tzc + e11 * txc * tzc;

  return e * ELEV_SCALE;
}
