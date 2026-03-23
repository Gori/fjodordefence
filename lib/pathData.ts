import type { Vec2 } from './types';

// Full-resolution path from actual OSM road geometry (106→~85 pts after cleaning)
// Route: Skanstull → Ringvägen → Rosenlundsgatan → Hornsgatan → Hornstull

export const PATH_MAIN: Vec2[] = [
  // Ringvägen from Skanstull (18 pts)
  { x: 26.54, z: 34.16 },
  { x: 25.98, z: 33.85 },
  { x: 25.46, z: 33.93 },
  { x: 24.17, z: 34.13 },
  { x: 22.54, z: 34.17 },
  { x: 22.25, z: 34.12 },
  { x: 21.06, z: 33.90 },
  { x: 20.12, z: 33.65 },
  { x: 19.46, z: 33.41 },
  { x: 18.08, z: 32.70 },
  { x: 17.24, z: 32.21 },
  { x: 16.18, z: 31.05 },
  // Transition to Rosenlundsgatan
  { x: 13.26, z: 28.33 },
  { x: 10.34, z: 25.61 },
  { x: 7.41, z: 22.88 },
  // Rosenlundsgatan (full resolution, cleaned)
  { x: 4.49, z: 20.16 },
  { x: 4.68, z: 19.70 },
  { x: 4.84, z: 19.16 },
  { x: 4.84, z: 19.02 },
  { x: 4.82, z: 18.70 },
  { x: 4.80, z: 18.51 },
  { x: 4.47, z: 16.20 },
  { x: 4.40, z: 15.72 },
  { x: 4.22, z: 14.45 },
  { x: 4.18, z: 14.13 },
  { x: 4.01, z: 12.95 },
  { x: 4.00, z: 12.86 },
  { x: 3.80, z: 11.46 },
  { x: 3.68, z: 10.64 },
  { x: 3.45, z: 9.01 },
  { x: 3.07, z: 6.38 },
  { x: 2.89, z: 5.17 },
  { x: 2.58, z: 2.87 },
  { x: 2.41, z: 1.75 },
  { x: 1.99, z: -1.12 },
  { x: 1.52, z: -4.35 },
  { x: 1.11, z: -7.20 },
  { x: 0.72, z: -9.80 },
  { x: 0.30, z: -12.79 },
  { x: 0.19, z: -13.60 },
  // Transition to Hornsgatan
  { x: -4.00, z: -11.00 },
  { x: -10.00, z: -8.00 },
  { x: -16.00, z: -5.50 },
  // Hornsgatan heading west (cleaned, no backtracking)
  { x: -19.48, z: -5.19 },
  { x: -23.00, z: -3.69 },
  { x: -23.95, z: -3.29 },
  { x: -24.57, z: -2.66 },
  { x: -26.71, z: -1.75 },
  { x: -27.92, z: -1.17 },
  { x: -29.31, z: -0.98 },
  { x: -31.13, z: -0.23 },
  { x: -31.49, z: 0.38 },
  { x: -31.61, z: 0.68 },
];

// Offset variants (perpendicular to path direction)
function makeVariant(main: Vec2[], offset: number): Vec2[] {
  return main.map((p, i, arr) => {
    const prev = arr[Math.max(i - 1, 0)];
    const next = arr[Math.min(i + 1, arr.length - 1)];
    const ref = i === arr.length - 1 ? prev : p;
    const refN = i === arr.length - 1 ? p : next;
    const dx = refN.x - ref.x, dz = refN.z - ref.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) return { ...p };
    return { x: p.x + (-dz / len) * offset, z: p.z + (dx / len) * offset };
  });
}

export const PATH_VARIANT_A: Vec2[] = makeVariant(PATH_MAIN, 1.0);
export const PATH_VARIANT_B: Vec2[] = makeVariant(PATH_MAIN, -1.0);

export const ALL_PATHS: Vec2[][] = [
  PATH_MAIN,
  PATH_VARIANT_A,
  PATH_VARIANT_B,
];
