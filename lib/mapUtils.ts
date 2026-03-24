import type { Vec2 } from './types';

// MUST match scripts/fetch-map-data.mjs bounds exactly
const BOUNDS = {
  minLat: 59.3040,
  maxLat: 59.3260,
  minLng: 18.0180,
  maxLng: 18.1150,
};

export const WORLD_SIZE = 100;

export function latLngToWorld(lat: number, lng: number): Vec2 {
  const x =
    ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WORLD_SIZE -
    WORLD_SIZE / 2;
  const z =
    -(
      ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * WORLD_SIZE -
      WORLD_SIZE / 2
    );
  return { x, z };
}

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function isValidPlacement(
  pos: Vec2,
  towers: { position: Vec2 }[],
  minTowerDist = 2.5
): boolean {
  for (const t of towers) {
    if (distance(pos, t.position) < minTowerDist) return false;
  }
  return true;
}

export function snapToGrid(pos: Vec2, gridSize = 2): Vec2 {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    z: Math.round(pos.z / gridSize) * gridSize,
  };
}
