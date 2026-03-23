'use client';

import { useGameStore } from '@/lib/store';
import { TOWER_DEFS } from '@/lib/towerDefs';
import { getElevation } from '@/lib/elevation';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

// ── Scratching Post ──────────────────────────────────────────────────
function ScratchingPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Wide base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.0, 1.15, 0.2, 16]} />
        <meshStandardMaterial color="#5a4230" roughness={0.9} />
      </mesh>
      {/* Post body */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 1.5, 12]} />
        <meshStandardMaterial color="#c4a672" roughness={0.95} />
      </mesh>
      {/* Rope wrapping (thicker rings) */}
      {[0.35, 0.55, 0.75, 0.95, 1.15, 1.35].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, y * 2]}>
          <torusGeometry args={[0.32, 0.04, 6, 16]} />
          <meshStandardMaterial color="#d4b896" roughness={1} />
        </mesh>
      ))}
      {/* Top platform */}
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 0.12, 16]} />
        <meshStandardMaterial color="#5a4230" roughness={0.85} />
      </mesh>
      {/* Cushion on top */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c4443b" roughness={0.7} />
      </mesh>
      {/* Small toy dangling */}
      <mesh position={[0.5, 1.2, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#e8c840" emissive="#e8c840" emissiveIntensity={0.2} />
      </mesh>
      {/* String to toy */}
      <mesh position={[0.35, 1.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
    </group>
  );
}

// ── Yarn Launcher ────────────────────────────────────────────────────
function YarnLauncher({ position }: { position: [number, number, number] }) {
  const ballRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ballRef.current) {
      ballRef.current.rotation.y += delta * 0.5;
      ballRef.current.position.y = 1.0 + Math.sin(Date.now() * 0.002) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Base bowl */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.4, 12]} />
        <meshStandardMaterial color="#4a3a2e" roughness={0.85} />
      </mesh>
      {/* Inner rim */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.8, 0.08, 8, 16]} />
        <meshStandardMaterial color="#6a5a4e" roughness={0.8} />
      </mesh>
      {/* Yarn ball (animated) */}
      <group ref={ballRef} position={[0, 1.0, 0]}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 12]} />
          <meshStandardMaterial color="#e85d75" roughness={0.6} />
        </mesh>
        {/* Yarn wrap lines */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[i * 0.8, i * 1.2, i * 0.5]}>
            <torusGeometry args={[0.55, 0.04, 6, 16]} />
            <meshStandardMaterial color="#ff8fa0" roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* Trailing yarn strand */}
      <mesh position={[0.4, 0.5, 0.3]} rotation={[0.3, 0.5, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 4]} />
        <meshStandardMaterial color="#e85d75" />
      </mesh>
    </group>
  );
}

// ── Laser Pointer ────────────────────────────────────────────────────
function LaserPointerTower({ position }: { position: [number, number, number] }) {
  const emitterRef = useRef<Mesh>(null);

  useFrame(() => {
    if (emitterRef.current) {
      emitterRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Tech base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Base ring */}
      <mesh position={[0, 0.28, 0]}>
        <torusGeometry args={[0.8, 0.05, 6, 16]} />
        <meshStandardMaterial color="#444" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 1.3, 8]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Tech rings on pillar */}
      {[0.5, 0.8, 1.1].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[0.22, 0.03, 6, 12]} />
          <meshStandardMaterial color="#555" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      {/* Emitter head (rotates) */}
      <group ref={emitterRef} position={[0, 1.7, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshStandardMaterial
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
        {/* Lens flare rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.03, 6, 16]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.02, 6, 16]} />
          <meshStandardMaterial color="#cc0000" emissive="#ff0000" emissiveIntensity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ── Catnip Bomb ──────────────────────────────────────────────────────
function CatnipBombTower({ position }: { position: [number, number, number] }) {
  const leavesRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (leavesRef.current) {
      leavesRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Terracotta pot */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 0.7, 12]} />
        <meshStandardMaterial color="#8b5a35" roughness={0.9} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[0.58, 0.06, 6, 12]} />
        <meshStandardMaterial color="#9a6a45" roughness={0.85} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.68, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 12]} />
        <meshStandardMaterial color="#3a2a1a" roughness={1} />
      </mesh>
      {/* Stems */}
      {[0, 1.2, 2.4, 3.6, 4.8].map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.15, 1.1, Math.sin(angle) * 0.15]}
          rotation={[Math.cos(angle) * 0.15, 0, Math.sin(angle) * 0.15]}
        >
          <cylinderGeometry args={[0.03, 0.04, 0.9, 4]} />
          <meshStandardMaterial color="#2a6a20" roughness={0.9} />
        </mesh>
      ))}
      {/* Leaf clusters (animated rotation) */}
      <group ref={leavesRef} position={[0, 1.4, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i * 1.05) * 0.35,
              Math.sin(i * 1.5) * 0.15,
              Math.sin(i * 1.05) * 0.35,
            ]}
            rotation={[i * 0.37, i * 1.05, 0]}
          >
            <sphereGeometry args={[0.22, 8, 6]} />
            <meshStandardMaterial
              color="#4ade80"
              emissive="#4ade80"
              emissiveIntensity={0.12}
              roughness={0.75}
            />
          </mesh>
        ))}
      </group>
      {/* Green glow particles */}
      {[0, 1.5, 3].map((a) => (
        <mesh key={`p${a}`} position={[Math.cos(a) * 0.6, 1.6 + Math.sin(a) * 0.2, Math.sin(a) * 0.6]}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

const TOWER_COMPONENTS: Record<string, React.FC<{ position: [number, number, number] }>> = {
  scratchingPost: ScratchingPost,
  yarnLauncher: YarnLauncher,
  laserPointer: LaserPointerTower,
  catnipBomb: CatnipBombTower,
};

function TowerMesh({ tower }: { tower: { id: string; defId: string; position: { x: number; z: number } } }) {
  const def = TOWER_DEFS[tower.defId];
  const Component = TOWER_COMPONENTS[tower.defId];
  const terrainY = getElevation(tower.position.x, tower.position.z);
  const pos: [number, number, number] = [tower.position.x, terrainY, tower.position.z];

  return (
    <group>
      {Component ? (
        <Component position={pos} />
      ) : (
        <mesh position={[pos[0], 0.5, pos[2]]}>
          <cylinderGeometry args={[0.6, 0.8, 1, 8]} />
          <meshStandardMaterial color={def.color} />
        </mesh>
      )}
      {/* Range ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[tower.position.x, terrainY + 0.06, tower.position.z]}>
        <ringGeometry args={[def.range - 0.15, def.range, 48]} />
        <meshBasicMaterial color={def.color} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

export function Towers() {
  const towers = useGameStore((s) => s.towers);
  return (
    <>
      {towers.map((tower) => (
        <TowerMesh key={tower.id} tower={tower} />
      ))}
    </>
  );
}
