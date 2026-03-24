import type { WaveConfig } from './types';

export const WAVES: WaveConfig[] = [
  {
    // Wave 1: Simple intro
    entries: [
      { enemyDefId: 'rat', count: 6, pathIndex: 0, spawnInterval: 1.2, startDelay: 0 },
    ],
  },
  {
    // Wave 2: More rats
    entries: [
      { enemyDefId: 'rat', count: 10, pathIndex: 0, spawnInterval: 1.0, startDelay: 0 },
    ],
  },
  {
    // Wave 3: Rats and pigeons
    entries: [
      { enemyDefId: 'rat', count: 8, pathIndex: 0, spawnInterval: 0.8, startDelay: 0 },
      { enemyDefId: 'pigeon', count: 4, pathIndex: 0, spawnInterval: 1.5, startDelay: 3 },
    ],
  },
  {
    // Wave 4: Mixed
    entries: [
      { enemyDefId: 'rat', count: 10, pathIndex: 0, spawnInterval: 0.7, startDelay: 0 },
      { enemyDefId: 'pigeon', count: 6, pathIndex: 0, spawnInterval: 1.2, startDelay: 2 },
    ],
  },
  {
    // Wave 5: The big one
    entries: [
      { enemyDefId: 'rat', count: 12, pathIndex: 0, spawnInterval: 0.5, startDelay: 0 },
      { enemyDefId: 'pigeon', count: 6, pathIndex: 0, spawnInterval: 1.0, startDelay: 1 },
      { enemyDefId: 'dog', count: 3, pathIndex: 0, spawnInterval: 2.5, startDelay: 4 },
    ],
  },
];
