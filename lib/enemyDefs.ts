import type { EnemyDef } from './types';

export const ENEMY_DEFS: Record<string, EnemyDef> = {
  rat: {
    id: 'rat',
    name: 'Rat',
    maxHp: 30,
    speed: 4,
    reward: 10,
    color: '#8b7355',
  },
  pigeon: {
    id: 'pigeon',
    name: 'Pigeon',
    maxHp: 60,
    speed: 4.5,
    reward: 20,
    color: '#9ca3af',
    flying: true,
  },
  dog: {
    id: 'dog',
    name: 'Dog',
    maxHp: 150,
    speed: 2.5,
    reward: 40,
    color: '#92400e',
  },
};
