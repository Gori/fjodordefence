'use client';

import { ALL_PATHS } from '@/lib/pathData';
import { getElevation } from '@/lib/elevation';
import { useMemo } from 'react';

const PATH_COLORS = ['#ff9f43', '#ee5a24', '#18dcff'];

export function PathRenderer() {
  const markers = useMemo(() => {
    const result: { x: number; z: number; y: number; angle: number }[] = [];

    const path = ALL_PATHS[0];
    if (!path) return result;

    for (let i = 0; i < path.length - 1; i += 3) {
      const curr = path[i];
      const next = path[Math.min(i + 1, path.length - 1)];
      const midX = (curr.x + next.x) / 2;
      const midZ = (curr.z + next.z) / 2;
      const dx = next.x - curr.x;
      const dz = next.z - curr.z;
      const angle = Math.atan2(dx, dz);
      const y = getElevation(midX, midZ) + 0.5;
      result.push({ x: midX, z: midZ, y, angle });
    }

    return result;
  }, []);

  const path = ALL_PATHS[0];
  if (!path) return null;

  const startY = getElevation(path[0].x, path[0].z) + 0.5;
  const endPt = path[path.length - 1];
  const endY = getElevation(endPt.x, endPt.z) + 0.5;

  return (
    <group>
      {/* Start marker */}
      <mesh position={[path[0].x, startY, path[0].z]}>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshStandardMaterial color={PATH_COLORS[0]} emissive={PATH_COLORS[0]} emissiveIntensity={0.6} />
      </mesh>

      {/* End marker */}
      <mesh position={[endPt.x, endY, endPt.z]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      {/* Direction arrows */}
      {markers.map((m, i) => (
        <mesh
          key={`arrow-${i}`}
          position={[m.x, m.y, m.z]}
          rotation={[-Math.PI / 2, 0, -m.angle]}
        >
          <coneGeometry args={[0.4, 1.0, 3]} />
          <meshStandardMaterial
            color={PATH_COLORS[0]}
            emissive={PATH_COLORS[0]}
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
