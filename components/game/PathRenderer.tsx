'use client';

import { ALL_PATHS } from '@/lib/pathData';
import { useMemo } from 'react';

const PATH_COLORS = ['#ff9f43', '#ee5a24', '#18dcff'];

export function PathRenderer() {
  const markers = useMemo(() => {
    const result: { x: number; z: number; angle: number; pathIdx: number }[] = [];

    ALL_PATHS.forEach((path, pathIdx) => {
      if (pathIdx !== 0) return; // Only show arrows on main path to reduce clutter

      // Place arrows every 3rd segment
      for (let i = 0; i < path.length - 1; i += 3) {
        const curr = path[i];
        const next = path[Math.min(i + 1, path.length - 1)];
        const midX = (curr.x + next.x) / 2;
        const midZ = (curr.z + next.z) / 2;
        const dx = next.x - curr.x;
        const dz = next.z - curr.z;
        const angle = Math.atan2(dx, dz);
        result.push({ x: midX, z: midZ, angle, pathIdx });
      }
    });

    return result;
  }, []);

  return (
    <group>
      {/* Start markers (entry point) */}
      {ALL_PATHS.map((path, i) => (
        <group key={`start-${i}`}>
          <mesh position={[path[0].x, 0.5, path[0].z]}>
            <sphereGeometry args={[0.8, 12, 8]} />
            <meshStandardMaterial
              color={PATH_COLORS[i]}
              emissive={PATH_COLORS[i]}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* End markers (exit point) */}
      <mesh position={[ALL_PATHS[0][ALL_PATHS[0].length - 1].x, 0.5, ALL_PATHS[0][ALL_PATHS[0].length - 1].z]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      {/* Direction arrows (main path only) */}
      {markers.map((m, i) => (
        <mesh
          key={`arrow-${i}`}
          position={[m.x, 0.25, m.z]}
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
