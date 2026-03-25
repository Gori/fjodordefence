'use client';

import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getElevation } from '@/lib/elevation';

// ── Landmark manifest ───────────────────────────────────────────────
// Each entry maps a GLB file to a position in game-world coordinates.
// After running the grabber, fill this in with the captured models.
//
// Coordinates use the same system as Map.tsx:
//   x = ((lng - 18.018) / (18.115 - 18.018)) * 100 - 50
//   z = -(((lat - 59.304) / (59.326 - 59.304)) * 100 - 50)
//
// You can also specify lat/lng and let the component convert.

interface LandmarkDef {
  name: string;
  file: string;           // path relative to /public/models/landmarks/
  lat?: number;           // geographic position (preferred)
  lng?: number;
  x?: number;             // or direct game-world position
  z?: number;
  rotationY?: number;     // rotation around Y axis in radians
  scale?: number;         // uniform scale factor
  elevationOffset?: number; // extra Y offset above terrain
}

// ── Known Södermalm landmarks ───────────────────────────────────────
// These are the landmark positions. Update the 'file' field once you've
// downloaded and identified the models from Mapbox.
const LANDMARKS: LandmarkDef[] = [
  // {
  //   name: 'Katarina kyrka',
  //   file: 'katarina_kyrka.glb',
  //   lat: 59.3178, lng: 18.0756,
  //   rotationY: 0,
  //   scale: 1,
  //   elevationOffset: 0,
  // },
  // {
  //   name: 'Sofia kyrka',
  //   file: 'sofia_kyrka.glb',
  //   lat: 59.3148, lng: 18.0855,
  //   rotationY: 0,
  //   scale: 1,
  //   elevationOffset: 0,
  // },
  // {
  //   name: 'Maria Magdalena kyrka',
  //   file: 'maria_magdalena.glb',
  //   lat: 59.3191, lng: 18.0634,
  //   rotationY: 0,
  //   scale: 1,
  //   elevationOffset: 0,
  // },
  // {
  //   name: 'Katarinahissen / Gondolen',
  //   file: 'katarinahissen.glb',
  //   lat: 59.3203, lng: 18.0726,
  //   rotationY: 0,
  //   scale: 1,
  //   elevationOffset: 0,
  // },
];

// ── Coordinate conversion (matches mapUtils.ts) ─────────────────────
const BOUNDS = { minLat: 59.3040, maxLat: 59.3260, minLng: 18.0180, maxLng: 18.1150 };
const WORLD_SIZE = 100;

function latLngToWorld(lat: number, lng: number): { x: number; z: number } {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WORLD_SIZE - WORLD_SIZE / 2;
  const z = -(((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * WORLD_SIZE - WORLD_SIZE / 2);
  return { x, z };
}

// ── Individual landmark component ───────────────────────────────────
function Landmark({ def }: { def: LandmarkDef }) {
  const gltf = useLoader(GLTFLoader, `/models/landmarks/${def.file}`);

  const { position, rotation, scale } = useMemo(() => {
    let x: number, z: number;
    if (def.lat !== undefined && def.lng !== undefined) {
      const pos = latLngToWorld(def.lat, def.lng);
      x = pos.x;
      z = pos.z;
    } else {
      x = def.x ?? 0;
      z = def.z ?? 0;
    }

    const elev = getElevation(x, z);
    const y = elev + (def.elevationOffset ?? 0);

    return {
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Euler(0, def.rotationY ?? 0, 0),
      scale: def.scale ?? 1,
    };
  }, [def]);

  // Clone the scene so each landmark instance is independent
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    // Ensure materials render nicely in our lighting setup
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.isMeshStandardMaterial) {
            mat.roughness = Math.max(mat.roughness, 0.4);
            mat.envMapIntensity = 0.5;
          }
        }
      }
    });
    return clone;
  }, [gltf]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// ── Main Landmarks component ────────────────────────────────────────
export function Landmarks() {
  // Only render landmarks that have files defined
  const activeLandmarks = LANDMARKS.filter(l => l.file);

  if (activeLandmarks.length === 0) return null;

  return (
    <group>
      {activeLandmarks.map((def) => (
        <Landmark key={def.name} def={def} />
      ))}
    </group>
  );
}

// ── Export for building exclusion ───────────────────────────────────
// Map.tsx can use this to exclude landmark buildings from the regular
// extruded building set (so they don't z-fight with the GLB models).
export function getLandmarkBuildingIds(): Set<number> {
  // TODO: populate this with OSM building IDs that correspond to landmarks
  // so Map.tsx can skip them during buildBuildings()
  return new Set([
    // e.g., 12345, 67890
  ]);
}
