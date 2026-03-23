'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TREES } from '@/lib/trees';
import { getElevation } from '@/lib/elevation';

// Low-poly broadleaved tree: octahedron canopy on a cylinder trunk
// Low-poly conifer: cone canopy (2 stacked) on a cylinder trunk

const TRUNK_COLOR = new THREE.Color('#5a3a20');
const CANOPY_COLORS = [
  new THREE.Color('#2d6b1e'),
  new THREE.Color('#357a25'),
  new THREE.Color('#2a5a18'),
  new THREE.Color('#3d7a2a'),
  new THREE.Color('#286015'),
];

export function TreeMeshes() {
  const { trunkGeo, canopyGeo } = useMemo(() => {
    const trunks: THREE.BufferGeometry[] = [];
    const canopies: THREE.BufferGeometry[] = [];

    for (let i = 0; i < TREES.length; i++) {
      const tree = TREES[i];
      const elev = getElevation(tree.x, tree.z);

      // Scale based on height — varied defaults using position hash for randomness
      const hash = Math.abs(Math.sin(tree.x * 127.1 + tree.z * 311.7)) ;
      const h = tree.height > 0 ? tree.height : (6 + hash * 10); // 6-16m range
      const scale = (h / 20) * 0.6; // much smaller overall
      const trunkH = scale * (0.8 + hash * 0.6);
      const canopyR = scale * (0.6 + hash * 0.4);
      const canopyH = scale * (0.8 + hash * 0.5);

      // Trunk — low-poly cylinder (5 sides)
      const trunk = new THREE.CylinderGeometry(scale * 0.12, scale * 0.15, trunkH, 5);
      trunk.translate(tree.x, elev + trunkH / 2, tree.z);

      // Assign trunk color
      const tc = new Float32Array(trunk.attributes.position.count * 3);
      for (let j = 0; j < trunk.attributes.position.count; j++) {
        tc[j * 3] = TRUNK_COLOR.r;
        tc[j * 3 + 1] = TRUNK_COLOR.g;
        tc[j * 3 + 2] = TRUNK_COLOR.b;
      }
      trunk.setAttribute('color', new THREE.Float32BufferAttribute(tc, 3));
      trunks.push(trunk);

      // Canopy — pick color based on index
      const cc = CANOPY_COLORS[i % CANOPY_COLORS.length];

      if (tree.leafType === 'needleleaved') {
        // Conifer: 2 stacked cones
        const cone1 = new THREE.ConeGeometry(canopyR * 0.8, canopyH * 0.7, 5);
        cone1.translate(tree.x, elev + trunkH + canopyH * 0.35, tree.z);
        const cone2 = new THREE.ConeGeometry(canopyR * 0.6, canopyH * 0.6, 5);
        cone2.translate(tree.x, elev + trunkH + canopyH * 0.75, tree.z);

        for (const geo of [cone1, cone2]) {
          const colors = new Float32Array(geo.attributes.position.count * 3);
          for (let j = 0; j < geo.attributes.position.count; j++) {
            const darkFactor = 0.85 + Math.random() * 0.15;
            colors[j * 3] = cc.r * darkFactor;
            colors[j * 3 + 1] = cc.g * darkFactor;
            colors[j * 3 + 2] = cc.b * darkFactor;
          }
          geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
          canopies.push(geo);
        }
      } else {
        // Broadleaved: varied low-poly shapes
        const shapeType = i % 4;
        let canopy: THREE.BufferGeometry;
        if (shapeType === 0) {
          canopy = new THREE.OctahedronGeometry(canopyR, 1);
        } else if (shapeType === 1) {
          canopy = new THREE.IcosahedronGeometry(canopyR, 0);
        } else if (shapeType === 2) {
          canopy = new THREE.DodecahedronGeometry(canopyR, 0);
        } else {
          canopy = new THREE.OctahedronGeometry(canopyR, 0);
        }
        const squish = 0.6 + hash * 0.5;
        canopy.scale(1, squish, 1);
        canopy.translate(tree.x, elev + trunkH + canopyR * squish * 0.4, tree.z);

        const colors = new Float32Array(canopy.attributes.position.count * 3);
        for (let j = 0; j < canopy.attributes.position.count; j++) {
          const y = canopy.attributes.position.getY(j);
          const heightFactor = 0.85 + (y - (elev + trunkH)) / (canopyH + 0.01) * 0.15;
          colors[j * 3] = cc.r * heightFactor;
          colors[j * 3 + 1] = cc.g * heightFactor;
          colors[j * 3 + 2] = cc.b * heightFactor;
        }
        canopy.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        canopies.push(canopy);
      }
    }

    let trunkGeo: THREE.BufferGeometry | null = null;
    let canopyGeo: THREE.BufferGeometry | null = null;
    if (trunks.length > 0) try { trunkGeo = mergeGeometries(trunks, false); } catch { trunkGeo = trunks[0]; }
    if (canopies.length > 0) try { canopyGeo = mergeGeometries(canopies, false); } catch { canopyGeo = canopies[0]; }

    return { trunkGeo, canopyGeo };
  }, []);

  return (
    <group>
      {trunkGeo && (
        <mesh geometry={trunkGeo}>
          <meshStandardMaterial vertexColors roughness={0.9} />
        </mesh>
      )}
      {canopyGeo && (
        <mesh geometry={canopyGeo}>
          <meshStandardMaterial vertexColors roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}
