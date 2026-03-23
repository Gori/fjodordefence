/**
 * Traces the exact route: Skanstull → Ringvägen → Rosenlundsgatan → Hornsgatan → Hornstull
 * by finding actual road segment coordinates from OSM data.
 */
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/data/sodermalm.json', 'utf-8'));

// Find all segments for target streets
function getStreetSegments(name) {
  return data.roads.filter(r => r.name === name);
}

// Distance between two points
function dist(a, b) {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);
}

// Chain segments into continuous paths
function chainSegments(segments) {
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

        if (dist(ce, ss) < 1.0) {
          chain.push(...seg.coords.slice(1));
          used.add(sj); changed = true;
        } else if (dist(ce, se) < 1.0) {
          chain.push(...[...seg.coords].reverse().slice(1));
          used.add(sj); changed = true;
        } else if (dist(cs, se) < 1.0) {
          chain = [...seg.coords.slice(0, -1), ...chain];
          used.add(sj); changed = true;
        } else if (dist(cs, ss) < 1.0) {
          chain = [...[...seg.coords].reverse().slice(0, -1), ...chain];
          used.add(sj); changed = true;
        }
      }
    }
    chains.push(chain);
  }

  return chains;
}

// Get all chains for each street
const ringvagen = chainSegments(getStreetSegments('Ringvägen'));
const rosenlund = chainSegments(getStreetSegments('Rosenlundsgatan'));
const hornsgatan = chainSegments(getStreetSegments('Hornsgatan'));

console.log('=== RINGVÄGEN ===');
for (let i = 0; i < ringvagen.length; i++) {
  const c = ringvagen[i];
  console.log(`Chain ${i}: ${c.length} pts, [${c[0][0].toFixed(1)},${c[0][1].toFixed(1)}] → [${c[c.length-1][0].toFixed(1)},${c[c.length-1][1].toFixed(1)}]`);
}

console.log('\n=== ROSENLUNDSGATAN ===');
for (let i = 0; i < rosenlund.length; i++) {
  const c = rosenlund[i];
  console.log(`Chain ${i}: ${c.length} pts, [${c[0][0].toFixed(1)},${c[0][1].toFixed(1)}] → [${c[c.length-1][0].toFixed(1)},${c[c.length-1][1].toFixed(1)}]`);
}

console.log('\n=== HORNSGATAN ===');
for (let i = 0; i < hornsgatan.length; i++) {
  const c = hornsgatan[i];
  console.log(`Chain ${i}: ${c.length} pts, [${c[0][0].toFixed(1)},${c[0][1].toFixed(1)}] → [${c[c.length-1][0].toFixed(1)},${c[c.length-1][1].toFixed(1)}]`);
}

// Now find the best connected path from Skanstull to Hornstull
// Skanstull is at roughly x:9, z:37 (east)
// Hornstull is at roughly x:-53, z:-9 (west)

// Find Ringvägen chain closest to Skanstull
const skanstull = [9, 37];
let bestRing = null, bestRingDist = Infinity;
for (const chain of ringvagen) {
  for (const end of [chain[0], chain[chain.length-1]]) {
    const d = dist(skanstull, end);
    if (d < bestRingDist) {
      bestRingDist = d;
      bestRing = chain;
    }
  }
}
console.log(`\nBest Ringvägen chain for Skanstull: ${bestRing?.length} pts, starts at [${bestRing?.[0]?.[0]?.toFixed(1)},${bestRing?.[0]?.[1]?.toFixed(1)}]`);

// Find Rosenlundsgatan chain
const bestRosen = rosenlund.reduce((best, c) => c.length > (best?.length || 0) ? c : best, null);
console.log(`Best Rosenlundsgatan chain: ${bestRosen?.length} pts`);

// Find Hornsgatan chain closest to Hornstull
const hornstull = [-53, -9];
let bestHorn = null, bestHornDist = Infinity;
for (const chain of hornsgatan) {
  for (const end of [chain[0], chain[chain.length-1]]) {
    const d = dist(hornstull, end);
    if (d < bestHornDist) {
      bestHornDist = d;
      bestHorn = chain;
    }
  }
}
console.log(`Best Hornsgatan chain for Hornstull: ${bestHorn?.length} pts, ends near [${bestHorn?.[bestHorn.length-1]?.[0]?.toFixed(1)},${bestHorn?.[bestHorn.length-1]?.[1]?.toFixed(1)}]`);

// Output the complete route
console.log('\n=== COMPLETE ROUTE (simplified) ===');

function simplify(coords, maxPoints) {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const result = [];
  for (let i = 0; i < maxPoints - 1; i++) {
    result.push(coords[Math.round(i * step)]);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

// Orient chains so they flow from Skanstull to Hornstull
if (bestRing) {
  // Make sure Ringvägen starts at Skanstull end
  if (dist(bestRing[bestRing.length-1], skanstull) < dist(bestRing[0], skanstull)) {
    bestRing.reverse();
  }
  const simplified = simplify(bestRing, 10);
  console.log('\nRingvägen section:');
  for (const [x, z] of simplified) {
    console.log(`  { x: ${x.toFixed(2)}, z: ${z.toFixed(2)} },`);
  }
}

if (bestRosen) {
  // Make Rosenlundsgatan flow from south to north (toward Hornsgatan)
  // Hornsgatan is at roughly z:-11, so the end closest to z:-15 should be last
  if (bestRosen[0][1] < bestRosen[bestRosen.length-1][1]) {
    bestRosen.reverse();
  }
  const simplified = simplify(bestRosen, 10);
  console.log('\nRosenlundsgatan section:');
  for (const [x, z] of simplified) {
    console.log(`  { x: ${x.toFixed(2)}, z: ${z.toFixed(2)} },`);
  }
}

if (bestHorn) {
  // Make Hornsgatan flow toward Hornstull
  if (dist(bestHorn[0], hornstull) < dist(bestHorn[bestHorn.length-1], hornstull)) {
    bestHorn.reverse();
  }
  const simplified = simplify(bestHorn, 10);
  console.log('\nHornsgatan section:');
  for (const [x, z] of simplified) {
    console.log(`  { x: ${x.toFixed(2)}, z: ${z.toFixed(2)} },`);
  }
}
