import type { WaveConfig } from './types';

export const WAVES: WaveConfig[] = [
  {
    // Wave 1: Simple intro - rats on Götgatan only
    entries: [
      { enemyDefId: 'rat', count: 6, pathIndex: 0, spawnInterval: 1.2, startDelay: 0 },
    ],
  },
  {
    // Wave 2: Rats on two paths
    entries: [
      { enemyDefId: 'rat', count: 5, pathIndex: 0, spawnInterval: 1.0, startDelay: 0 },
      { enemyDefId: 'rat', count: 5, pathIndex: 1, spawnInterval: 1.0, startDelay: 2 },
    ],
  },
  {
    // Wave 3: More rats, faster, all paths
    entries: [
      { enemyDefId: 'rat', count: 6, pathIndex: 0, spawnInterval: 0.8, startDelay: 0 },
      { enemyDefId: 'rat', count: 4, pathIndex: 1, spawnInterval: 0.8, startDelay: 1 },
      { enemyDefId: 'rat', count: 4, pathIndex: 2, spawnInterval: 0.8, startDelay: 3 },
    ],
  },
  {
    // Wave 4: Introduce pigeons
    entries: [
      { enemyDefId: 'rat', count: 8, pathIndex: 0, spawnInterval: 0.7, startDelay: 0 },
      { enemyDefId: 'pigeon', count: 4, pathIndex: 1, spawnInterval: 1.5, startDelay: 2 },
    ],
  },
  {
    // Wave 5: The big one - mixed enemies, all paths
    entries: [
      { enemyDefId: 'rat', count: 8, pathIndex: 0, spawnInterval: 0.6, startDelay: 0 },
      { enemyDefId: 'pigeon', count: 5, pathIndex: 1, spawnInterval: 1.2, startDelay: 1 },
      { enemyDefId: 'dog', count: 2, pathIndex: 2, spawnInterval: 3.0, startDelay: 4 },
    ],
  },
];
