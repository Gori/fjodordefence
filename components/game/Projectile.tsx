'use client';

import { useGameStore } from '@/lib/store';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

function ProjectileMesh({ position, special }: { position: { x: number; z: number }; special?: 'slow' | 'aoe' }) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 10;
      ref.current.rotation.y += delta * 8;
    }
  });

  const color = special === 'slow' ? '#e85d75' : special === 'aoe' ? '#4ade80' : '#fbbf24';

  return (
    <mesh ref={ref} position={[position.x, 1.5, position.z]}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.3}
      />
    </mesh>
  );
}

export function Projectiles() {
  const projectiles = useGameStore((s) => s.projectiles);

  return (
    <>
      {projectiles.map((proj) => (
        <ProjectileMesh key={proj.id} position={proj.position} special={proj.special} />
      ))}
    </>
  );
}
