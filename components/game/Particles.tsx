'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/lib/store';
import { getElevation } from '@/lib/elevation';
import * as THREE from 'three';

interface ParticleEffect {
  id: string;
  type: 'smoke' | 'explosion';
  position: THREE.Vector3;
  startTime: number;
  duration: number;
}

const SMOKE_DURATION = 600;
const EXPLOSION_DURATION = 400;

export function ParticleEffects() {
  const enemies = useGameStore((s) => s.enemies);
  const [effects, setEffects] = useState<ParticleEffect[]>([]);
  const prevEnemyIds = useRef<Set<string>>(new Set());

  // Track enemy spawns and deaths
  useEffect(() => {
    const currentIds = new Set(enemies.map(e => e.id));
    const now = Date.now();

    const newEffects: ParticleEffect[] = [];

    // New enemies → smoke puff
    for (const enemy of enemies) {
      if (!prevEnemyIds.current.has(enemy.id)) {
        const y = getElevation(enemy.position.x, enemy.position.z);
        newEffects.push({
          id: `smoke-${enemy.id}`,
          type: 'smoke',
          position: new THREE.Vector3(enemy.position.x, y + 0.5, enemy.position.z),
          startTime: now,
          duration: SMOKE_DURATION,
        });
      }
    }

    // Dead enemies → explosion
    for (const id of prevEnemyIds.current) {
      if (!currentIds.has(id)) {
        // Find last known position from previous frame (approximate with 0,0)
        // We'll store positions separately
        newEffects.push({
          id: `explode-${id}`,
          type: 'explosion',
          position: new THREE.Vector3(0, 1, 0), // placeholder, updated below
          startTime: now,
          duration: EXPLOSION_DURATION,
        });
      }
    }

    prevEnemyIds.current = currentIds;

    if (newEffects.length > 0) {
      setEffects(prev => [...prev.filter(e => now - e.startTime < e.duration), ...newEffects]);
    }
  }, [enemies]);

  // Store enemy positions for death effects
  const enemyPositions = useRef<Map<string, { x: number; z: number }>>(new Map());
  useEffect(() => {
    for (const e of enemies) {
      enemyPositions.current.set(e.id, { x: e.position.x, z: e.position.z });
    }
  }, [enemies]);

  // Clean up old effects
  useFrame(() => {
    const now = Date.now();
    setEffects(prev => {
      const filtered = prev.filter(e => now - e.startTime < e.duration);
      return filtered.length !== prev.length ? filtered : prev;
    });
  });

  return (
    <>
      {effects.map(effect => (
        <ParticleCloud key={effect.id} effect={effect} />
      ))}
    </>
  );
}

function ParticleCloud({ effect }: { effect: ParticleEffect }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<{ offset: THREE.Vector3; velocity: THREE.Vector3 }[]>([]);

  // Initialize particles once
  useEffect(() => {
    const count = effect.type === 'smoke' ? 12 : 16;
    particlesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = effect.type === 'explosion' ? 2 + Math.random() * 4 : 0.5 + Math.random() * 1.5;
      const upSpeed = effect.type === 'explosion' ? 1 + Math.random() * 3 : 1 + Math.random() * 2;
      return {
        offset: new THREE.Vector3(0, 0, 0),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          upSpeed,
          Math.sin(angle) * speed
        ),
      };
    });
  }, [effect.type]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const elapsed = Date.now() - effect.startTime;
    const t = elapsed / effect.duration;
    if (t >= 1) return;

    // Update particle positions
    for (const p of particlesRef.current) {
      p.offset.add(p.velocity.clone().multiplyScalar(delta));
      p.velocity.y -= delta * 3; // gravity
    }

    // Fade out
    groupRef.current.children.forEach((child, i) => {
      const p = particlesRef.current[i];
      if (!p) return;
      child.position.copy(p.offset);
      const mesh = child as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = (1 - t) * (effect.type === 'smoke' ? 0.5 : 0.8);
      }
      // Scale down over time
      const s = effect.type === 'smoke' ? 0.3 + t * 0.4 : 0.2 * (1 - t * 0.5);
      child.scale.setScalar(s);
    });
  });

  const color = effect.type === 'smoke' ? '#aaaaaa' : '#ff6622';
  const count = effect.type === 'smoke' ? 12 : 16;

  return (
    <group ref={groupRef} position={effect.position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
