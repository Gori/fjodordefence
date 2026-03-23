/**
 * Fetches real OpenStreetMap data for Södermalm, Stockholm
 * and processes it into game-ready JSON.
 *
 * Run with: node scripts/fetch-map-data.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';

// Södermalm bounding box
const BOUNDS = {
  south: 59.3040,
  west: 18.0180,
  north: 59.3260,
  east: 18.0920,
};

const WORLD_SIZE = 100;

function latLngToWorld(lat, lng) {
  const x =
    ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * WORLD_SIZE -
    WORLD_SIZE / 2;
  const z =
    -(
      ((lat - BOUNDS.south) / (BOUNDS.north - BOUNDS.south)) * WORLD_SIZE -
      WORLD_SIZE / 2
    );
  return [Math.round(x * 100) / 100, Math.round(z * 100) / 100];
}

async function fetchOSMData() {
  const query = `
    [out:json][timeout:120][maxsize:50000000];
    (
      way["building"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      relation["building"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|pedestrian|living_street|service"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["leisure"="park"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["landuse"="grass"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["landuse"="recreation_ground"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["natural"="coastline"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      way["natural"="water"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
      relation["natural"="water"](${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east});
    );
    out body;
    >;
    out skel qt;
  `.trim();

  console.log('Querying Overpass API...');
  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Received ${data.elements.length} elements`);
  return data;
}

function processData(data) {
  // Build node lookup table
  const nodes = new Map();
  for (const el of data.elements) {
    if (el.type === 'node') {
      nodes.set(el.id, [el.lat, el.lon]);
    }
  }

  const buildings = [];
  const roads = [];
  const parks = [];
  const coastlines = [];
  const waterAreas = [];

  // Build way lookup for relation processing
  const ways = new Map();
  for (const el of data.elements) {
    if (el.type === 'way') {
      ways.set(el.id, el);
    }
  }

  // Process relations — extract outer ways as buildings
  for (const el of data.elements) {
    if (el.type !== 'relation') continue;
    const tags = el.tags || {};
    if (!tags.building) continue;

    for (const member of el.members || []) {
      if (member.type === 'way' && member.role === 'outer') {
        const way = ways.get(member.ref);
        if (!way) continue;
        const rawCoords = way.nodes
          .map((nodeId) => nodes.get(nodeId))
          .filter(Boolean);
        if (rawCoords.length < 3) continue;
        const coords = rawCoords.map(([lat, lng]) => latLngToWorld(lat, lng));

        let height;
        if (tags['building:levels']) height = parseInt(tags['building:levels']) * 3.5;
        else if (tags['building:height']) height = parseFloat(tags['building:height']);
        else height = 10 + (el.id % 10) * 1.5;
        const gameHeight = Math.max(0.3, Math.min(3.5, height * 0.12));

        buildings.push({ id: el.id, coords, height: Math.round(gameHeight * 100) / 100 });
      }
    }
  }

  for (const el of data.elements) {
    if (el.type !== 'way') continue;

    const tags = el.tags || {};

    // Resolve node coordinates
    const rawCoords = el.nodes
      .map((nodeId) => nodes.get(nodeId))
      .filter(Boolean);

    if (rawCoords.length < 2) continue;

    const coords = rawCoords.map(([lat, lng]) => latLngToWorld(lat, lng));

    if (tags.building) {
      if (coords.length < 3) continue;

      // Determine building height
      let height;
      if (tags['building:levels']) {
        height = parseInt(tags['building:levels']) * 3.5;
      } else if (tags['building:height']) {
        height = parseFloat(tags['building:height']);
      } else {
        // Use building type for default heights
        switch (tags.building) {
          case 'church': height = 25; break;
          case 'industrial': height = 12; break;
          case 'garage': case 'shed': height = 4; break;
          case 'house': height = 9; break;
          case 'apartments': height = 18; break;
          default: height = 10 + (el.id % 10) * 1.5; break;
        }
      }

      // Scale to game world (buildings should be ~0.5-3 units tall in a 100-unit world)
      const gameHeight = Math.max(0.3, Math.min(3.5, height * 0.12));

      buildings.push({
        id: el.id,
        coords,
        height: Math.round(gameHeight * 100) / 100,
      });
    } else if (tags.highway) {
      // Road width based on type
      let width;
      let importance; // 0-3, higher = more important road
      switch (tags.highway) {
        case 'motorway': case 'trunk':
          width = 2.5; importance = 3; break;
        case 'primary':
          width = 2.0; importance = 3; break;
        case 'secondary':
          width = 1.6; importance = 2; break;
        case 'tertiary':
          width = 1.3; importance = 2; break;
        case 'residential': case 'unclassified': case 'living_street':
          width = 1.0; importance = 1; break;
        case 'pedestrian':
          width = 0.8; importance = 1; break;
        case 'service':
          width = 0.6; importance = 0; break;
        default:
          width = 0.8; importance = 0; break;
      }

      roads.push({
        coords,
        width: Math.round(width * 100) / 100,
        importance,
        name: tags.name || null,
      });
    } else if (tags.leisure === 'park' || tags.landuse === 'grass' || tags.landuse === 'recreation_ground') {
      if (coords.length >= 3) {
        parks.push({ coords });
      }
    } else if (tags.natural === 'coastline') {
      coastlines.push({ coords });
    } else if (tags.natural === 'water') {
      if (coords.length >= 3) {
        waterAreas.push({ coords });
      }
    }
  }

  return { buildings, roads, parks, coastlines, waterAreas };
}

async function main() {
  try {
    const data = await fetchOSMData();
    const processed = processData(data);

    console.log(`\nProcessed data:`);
    console.log(`  Buildings:   ${processed.buildings.length}`);
    console.log(`  Roads:       ${processed.roads.length}`);
    console.log(`  Parks:       ${processed.parks.length}`);
    console.log(`  Coastlines:  ${processed.coastlines.length}`);
    console.log(`  Water areas: ${processed.waterAreas.length}`);

    // Find named roads for debugging
    const namedRoads = processed.roads
      .filter((r) => r.name && r.importance >= 2)
      .map((r) => r.name);
    const uniqueNames = [...new Set(namedRoads)].sort();
    console.log(`\nMajor named roads: ${uniqueNames.join(', ')}`);

    mkdirSync('public/data', { recursive: true });
    writeFileSync(
      'public/data/sodermalm.json',
      JSON.stringify(processed)
    );

    const fileSize = (JSON.stringify(processed).length / 1024).toFixed(0);
    console.log(`\nSaved to public/data/sodermalm.json (${fileSize} KB)`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
