/**
 * Build enemy paths from ACTUAL OSM road coordinates.
 * Chains Ringvägen → Rosenlundsgatan → Hornsgatan using real geometry.
 */
import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/data/sodermalm.json', 'utf-8'));

function dist(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);
}

function chainSegments(segments, maxGap = 1.5) {
  const used = new Set();
  const chains = [];
  for (let si = 0; si < segments.length; si++) {
    if (used.has(si)) continue;
    let chain = [...segments[si].coords];
    used.add(si);
    let changed = true;
    while (changed) {
      changed = false;
      for (let sj = 0; sj < segments.length; sj++) {
        if (used.has(sj)) continue;
        const seg = segments[sj];
        const ce = chain[chain.length - 1];
        const cs = chain[0];
        const ss = seg.coords[0];
        const se = seg.coords[seg.coords.length - 1];
        if (dist(ce, ss) < maxGap) { chain.push(...seg.coords.slice(1)); used.add(sj); changed = true; }
        else if (dist(ce, se) < maxGap) { chain.push(...[...seg.coords].reverse().slice(1)); used.add(sj); changed = true; }
        else if (dist(cs, se) < maxGap) { chain = [...seg.coords.slice(0, -1), ...chain]; used.add(sj); changed = true; }
        else if (dist(cs, ss) < maxGap) { chain = [...[...seg.coords].reverse().slice(0, -1), ...chain]; used.add(sj); changed = true; }
      }
    }
    chains.push(chain);
  }
  return chains;
}

// Get segments for each street
const ringSegs = data.roads.filter(r => r.name === 'Ringvägen');
const rosenSegs = data.roads.filter(r => r.name === 'Rosenlundsgatan');
const hornSegs = data.roads.filter(r => r.name === 'Hornsgatan');

const ringChains = chainSegments(ringSegs);
const rosenChains = chainSegments(rosenSegs);
const hornChains = chainSegments(hornSegs);

// Find the best Ringvägen chain from Skanstull
const skanstull = [9, 37];
let bestRing = ringChains.reduce((best, c) => {
  const d = Math.min(dist(skanstull, c[0]), dist(skanstull, c[c.length-1]));
  return d < (best.d || Infinity) ? { chain: c, d } : best;
}, { chain: null, d: Infinity }).chain;

// Orient: start at Skanstull
if (bestRing && dist(bestRing[bestRing.length-1], skanstull) < dist(bestRing[0], skanstull)) {
  bestRing.reverse();
}

// Find longest Rosenlundsgatan chain
let bestRosen = rosenChains.reduce((best, c) => c.length > (best?.length || 0) ? c : best, null);
// Orient: start at Ringvägen end (high z = south), end at Hornsgatan (low z = north)
if (bestRosen && bestRosen[0][1] < bestRosen[bestRosen.length-1][1]) {
  bestRosen.reverse();
}

// Find best Hornsgatan chain near Hornstull
const hornstull = [-53, -9];
let bestHorn = hornChains.reduce((best, c) => {
  const d = Math.min(dist(hornstull, c[0]), dist(hornstull, c[c.length-1]));
  return d < (best.d || Infinity) ? { chain: c, d } : best;
}, { chain: null, d: Infinity }).chain;

// Orient: end at Hornstull
if (bestHorn && dist(bestHorn[0], hornstull) < dist(bestHorn[bestHorn.length-1], hornstull)) {
  bestHorn.reverse();
}

console.log('Ringvägen:', bestRing?.length, 'pts');
console.log('Rosenlundsgatan:', bestRosen?.length, 'pts');
console.log('Hornsgatan:', bestHorn?.length, 'pts');

// Build the complete path: Ringvägen → interpolate → Rosenlundsgatan → interpolate → Hornsgatan
function simplifyPath(coords, targetPoints) {
  if (coords.length <= targetPoints) return coords;
  const step = (coords.length - 1) / (targetPoints - 1);
  const result = [];
  for (let i = 0; i < targetPoints - 1; i++) {
    result.push(coords[Math.round(i * step)]);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

// Simplify each section
const ringSimp = simplifyPath(bestRing || [], 15);
const rosenSimp = simplifyPath(bestRosen || [], 12);
const hornSimp = simplifyPath(bestHorn || [], 8);

// Build full path with interpolated connections
const fullPath = [];

// Ringvägen section
for (const p of ringSimp) fullPath.push(p);

// Interpolate from Ringvägen end to Rosenlundsgatan start
if (ringSimp.length > 0 && rosenSimp.length > 0) {
  const re = ringSimp[ringSimp.length - 1];
  const rs = rosenSimp[0];
  const steps = 4;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    fullPath.push([re[0] + (rs[0] - re[0]) * t, re[1] + (rs[1] - re[1]) * t]);
  }
}

// Rosenlundsgatan section
for (const p of rosenSimp) fullPath.push(p);

// Interpolate from Rosenlundsgatan end to Hornsgatan start
if (rosenSimp.length > 0 && hornSimp.length > 0) {
  const re = rosenSimp[rosenSimp.length - 1];
  const hs = hornSimp[0];
  const steps = 3;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    fullPath.push([re[0] + (hs[0] - re[0]) * t, re[1] + (hs[1] - re[1]) * t]);
  }
}

// Hornsgatan section
for (const p of hornSimp) fullPath.push(p);

console.log(`\nTotal path: ${fullPath.length} waypoints\n`);

// Output as TypeScript
let output = `import type { Vec2 } from './types';

// Path coordinates built from actual OSM road data
// Route: Skanstull → Ringvägen → Rosenlundsgatan → Hornsgatan → Hornstull
// Generated by scripts/build-paths.mjs

export const PATH_MAIN: Vec2[] = [\n`;

for (const [x, z] of fullPath) {
  output += `  { x: ${x.toFixed(2)}, z: ${z.toFixed(2)} },\n`;
}
output += `];\n\n`;

// Create two variants with slight offsets
output += `// Variant A: offset +1 unit perpendicular to path\n`;
output += `export const PATH_VARIANT_A: Vec2[] = [\n`;
for (let i = 0; i < fullPath.length; i++) {
  const [x, z] = fullPath[i];
  // Calculate perpendicular offset
  let nx = 0, nz = 0;
  if (i < fullPath.length - 1) {
    const dx = fullPath[i+1][0] - x;
    const dz = fullPath[i+1][1] - z;
    const len = Math.sqrt(dx*dx + dz*dz);
    if (len > 0) { nx = -dz/len * 1.2; nz = dx/len * 1.2; }
  } else if (i > 0) {
    const dx = x - fullPath[i-1][0];
    const dz = z - fullPath[i-1][1];
    const len = Math.sqrt(dx*dx + dz*dz);
    if (len > 0) { nx = -dz/len * 1.2; nz = dx/len * 1.2; }
  }
  output += `  { x: ${(x + nx).toFixed(2)}, z: ${(z + nz).toFixed(2)} },\n`;
}
output += `];\n\n`;

output += `// Variant B: offset -1 unit perpendicular to path\n`;
output += `export const PATH_VARIANT_B: Vec2[] = [\n`;
for (let i = 0; i < fullPath.length; i++) {
  const [x, z] = fullPath[i];
  let nx = 0, nz = 0;
  if (i < fullPath.length - 1) {
    const dx = fullPath[i+1][0] - x;
    const dz = fullPath[i+1][1] - z;
    const len = Math.sqrt(dx*dx + dz*dz);
    if (len > 0) { nx = dz/len * 1.2; nz = -dx/len * 1.2; }
  } else if (i > 0) {
    const dx = x - fullPath[i-1][0];
    const dz = z - fullPath[i-1][1];
    const len = Math.sqrt(dx*dx + dz*dz);
    if (len > 0) { nx = dz/len * 1.2; nz = -dx/len * 1.2; }
  }
  output += `  { x: ${(x + nx).toFixed(2)}, z: ${(z + nz).toFixed(2)} },\n`;
}
output += `];\n\n`;

output += `export const ALL_PATHS: Vec2[][] = [\n  PATH_MAIN,\n  PATH_VARIANT_A,\n  PATH_VARIANT_B,\n];\n`;

writeFileSync('lib/pathData.ts', output);
console.log('Written to lib/pathData.ts');
