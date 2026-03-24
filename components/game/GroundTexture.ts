import * as THREE from 'three';

interface MapData {
  buildings: { coords: [number, number][]; type: string }[];
  roads: { coords: [number, number][]; width: number; importance: number; name: string | null }[];
  parks: { coords: [number, number][] }[];
}

interface LandZone { type: string; coords: [number, number][]; }
interface Pitch { name: string | null; sport: string | null; surface: string | null; coords: [number, number][]; }

const TEX_SIZE = 2048;
// Must cover full data extent (buildings go to ±57, roads to ±57)
const WORLD_MIN = -60;
const WORLD_MAX = 60;
const WORLD_RANGE = WORLD_MAX - WORLD_MIN;

function worldToTex(x: number, z: number): [number, number] {
  const tx = ((x - WORLD_MIN) / WORLD_RANGE) * TEX_SIZE;
  const ty = ((WORLD_MAX - z) / WORLD_RANGE) * TEX_SIZE; // flip z
  return [tx, ty];
}

function fillPolygon(ctx: CanvasRenderingContext2D, coords: [number, number][], color: string) {
  if (coords.length < 3) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  const [sx, sy] = worldToTex(coords[0][0], coords[0][1]);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < coords.length; i++) {
    const [tx, ty] = worldToTex(coords[i][0], coords[i][1]);
    ctx.lineTo(tx, ty);
  }
  ctx.closePath();
  ctx.fill();
}

function drawRoad(ctx: CanvasRenderingContext2D, coords: [number, number][], width: number, color: string) {
  if (coords.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = (width / WORLD_RANGE) * TEX_SIZE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const [sx, sy] = worldToTex(coords[0][0], coords[0][1]);
  ctx.moveTo(sx, sy);
  for (let i = 1; i < coords.length; i++) {
    const [tx, ty] = worldToTex(coords[i][0], coords[i][1]);
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();
}

const ZONE_COLORS: Record<string, string> = {
  park: '#3a6a2a',
  grass: '#4a7a35',
  forest: '#2a5520',
  scrub: '#3a6028',
  allotments: '#4a6a3a',
  cemetery: '#2a4a28',
  playground: '#8a7a5a',
  pitch: '#4a8a3a',
  rock: '#7a7570',
  beach: '#c8b888',
  residential: '#606060',
  commercial: '#585858',
  railway: '#4a4540',
  construction: '#7a7060',
};

const SURFACE_COLORS: Record<string, string> = {
  artificial_turf: '#3a8a30',
  grass: '#3a7a2a',
  asphalt: '#505050',
  concrete: '#606060',
  gravel: '#8a8070',
  fine_gravel: '#8a8070',
  sand: '#c8b888',
  rubber: '#6a4a3a',
  tartan: '#8a4a3a',
  paving_stones: '#707068',
  plastic: '#3a8a30',
};

export function createGroundTexture(
  mapData: MapData,
  landZones: LandZone[],
  pitches: Pitch[]
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // 1. Base: water color
  ctx.fillStyle = '#1a3060';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // 2. Land zones (parks, forests, etc.)
  for (const zone of landZones) {
    const color = ZONE_COLORS[zone.type];
    if (color) fillPolygon(ctx, zone.coords, color);
  }

  // 3. Parks from main data
  for (const park of mapData.parks) {
    fillPolygon(ctx, park.coords, '#3a6a2a');
  }

  // 4. Sports pitches
  for (const pitch of pitches) {
    const color = (pitch.surface && SURFACE_COLORS[pitch.surface]) || '#4a8a3a';
    fillPolygon(ctx, pitch.coords, color);
  }

  // 5. Roads — draw minor first, then major on top
  // Minor roads
  for (const road of mapData.roads) {
    if (road.importance <= 1) {
      const w = road.width * 0.8;
      drawRoad(ctx, road.coords, w, '#555555');
    }
  }
  // Major roads (wider, lighter)
  for (const road of mapData.roads) {
    if (road.importance >= 2) {
      const w = road.width * 1.2;
      drawRoad(ctx, road.coords, w, '#6a6a6a');
    }
  }

  // 6. Building footprints (subtle dark outline)
  for (const building of mapData.buildings) {
    if (building.coords.length >= 3) {
      fillPolygon(ctx, building.coords, '#484848');
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  return texture;
}
