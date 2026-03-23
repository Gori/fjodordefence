/**
 * Extract actual road coordinates from OSM data for enemy paths.
 * Run: node scripts/extract-paths.mjs
 */

import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/data/sodermalm.json', 'utf-8'));

const targetStreets = ['Ringvägen', 'Rosenlundsgatan', 'Hornsgatan', 'Götgatan', 'Folkungagatan', 'Torkel Knutssonsgatan'];

for (const street of targetStreets) {
  const segments = data.roads.filter(r => r.name === street);
  if (segments.length === 0) {
    console.log(`\n${street}: NOT FOUND`);
    continue;
  }

  console.log(`\n${street}: ${segments.length} segments`);

  // Show coordinate ranges
  let allCoords = [];
  for (const seg of segments) {
    allCoords.push(...seg.coords);
  }

  const xs = allCoords.map(c => c[0]);
  const zs = allCoords.map(c => c[1]);
  console.log(`  X range: ${Math.min(...xs).toFixed(1)} to ${Math.max(...xs).toFixed(1)}`);
  console.log(`  Z range: ${Math.min(...zs).toFixed(1)} to ${Math.max(...zs).toFixed(1)}`);
  console.log(`  Importance: ${segments[0].importance}`);

  // Print first segment coords for reference
  if (segments.length > 0) {
    console.log(`  First segment (${segments[0].coords.length} points):`);
    for (const [x, z] of segments[0].coords.slice(0, 5)) {
      console.log(`    [${x}, ${z}]`);
    }
    if (segments[0].coords.length > 5) console.log(`    ... (${segments[0].coords.length - 5} more)`);
  }

  // Try to chain segments into a continuous path
  // Find segments that connect end-to-end
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
        const chainEnd = chain[chain.length - 1];
        const chainStart = chain[0];
        const segStart = seg.coords[0];
        const segEnd = seg.coords[seg.coords.length - 1];

        const dist = (a, b) => Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2);

        if (dist(chainEnd, segStart) < 0.5) {
          chain.push(...seg.coords.slice(1));
          used.add(sj);
          changed = true;
        } else if (dist(chainEnd, segEnd) < 0.5) {
          chain.push(...seg.coords.slice(0, -1).reverse());
          used.add(sj);
          changed = true;
        } else if (dist(chainStart, segEnd) < 0.5) {
          chain = [...seg.coords.slice(0, -1), ...chain];
          used.add(sj);
          changed = true;
        } else if (dist(chainStart, segStart) < 0.5) {
          chain = [...seg.coords.reverse().slice(0, -1), ...chain];
          used.add(sj);
          changed = true;
        }
      }
    }

    chains.push(chain);
  }

  console.log(`  Chains: ${chains.length}`);
  for (let ci = 0; ci < Math.min(chains.length, 3); ci++) {
    const c = chains[ci];
    console.log(`  Chain ${ci}: ${c.length} points, from [${c[0][0].toFixed(1)}, ${c[0][1].toFixed(1)}] to [${c[c.length-1][0].toFixed(1)}, ${c[c.length-1][1].toFixed(1)}]`);

    // Simplify: output every Nth point
    const step = Math.max(1, Math.floor(c.length / 12));
    const simplified = [];
    for (let i = 0; i < c.length; i += step) {
      simplified.push(c[i]);
    }
    if (simplified[simplified.length-1] !== c[c.length-1]) {
      simplified.push(c[c.length-1]);
    }

    console.log(`  Simplified (${simplified.length} points):`);
    for (const [x, z] of simplified) {
      console.log(`    { x: ${x}, z: ${z} },`);
    }
  }
}
