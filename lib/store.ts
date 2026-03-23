import { create } from 'zustand';
import type {
  GamePhase,
  TowerInstance,
  EnemyInstance,
  ProjectileInstance,
  Vec2,
  SpawnState,
} from './types';
import { TOWER_DEFS } from './towerDefs';
import { ENEMY_DEFS } from './enemyDefs';
import { WAVES } from './waves';
import { ALL_PATHS } from './pathData';
import { distance } from './mapUtils';

// ── ID generator ───────────────────────────────────────────────────────
let _nextId = 0;
function uid(): string {
  return `e${++_nextId}`;
}

// ── Store interface ────────────────────────────────────────────────────
interface GameStore {
  // State
  phase: GamePhase;
  money: number;
  lives: number;
  wave: number;
  gameTime: number;
  towers: TowerInstance[];
  enemies: EnemyInstance[];
  projectiles: ProjectileInstance[];
  selectedTowerDef: string | null;
  spawnStates: SpawnState[];

  // Actions
  startGame: () => void;
  startWave: () => void;
  placeTower: (defId: string, position: Vec2) => boolean;
  selectTowerDef: (defId: string | null) => void;
  tick: (delta: number) => void;
}

// ── Constants ──────────────────────────────────────────────────────────
const STARTING_MONEY = 150;
const STARTING_LIVES = 20;
const PROJECTILE_HIT_RADIUS = 0.6;
const AOE_RADIUS = 4;
const SLOW_DURATION = 2.0;
const SLOW_FACTOR = 0.5;
const MIN_TOWER_SPACING = 2.5;

// ── Pure helper functions ──────────────────────────────────────────────

function moveEnemy(enemy: EnemyInstance, delta: number): boolean {
  const def = ENEMY_DEFS[enemy.defId];
  const path = ALL_PATHS[enemy.pathIndex];

  // Already past the end
  if (enemy.waypointIndex >= path.length) return true;

  // Calculate speed (apply slow debuff)
  const speed = def.speed * (enemy.slowTimer > 0 ? SLOW_FACTOR : 1.0);
  const target = path[enemy.waypointIndex];
  const dx = target.x - enemy.position.x;
  const dz = target.z - enemy.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const step = speed * delta;

  if (step >= dist) {
    // Reached waypoint
    enemy.position = { x: target.x, z: target.z };
    enemy.waypointIndex++;
    // Check if past end after advancing
    if (enemy.waypointIndex >= path.length) return true;
  } else {
    // Move toward waypoint
    enemy.position = {
      x: enemy.position.x + (dx / dist) * step,
      z: enemy.position.z + (dz / dist) * step,
    };
  }

  // Tick slow timer
  if (enemy.slowTimer > 0) {
    enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
  }

  return false;
}

function findTarget(
  tower: TowerInstance,
  enemies: EnemyInstance[]
): EnemyInstance | null {
  const def = TOWER_DEFS[tower.defId];
  let best: EnemyInstance | null = null;
  let bestProgress = -1;

  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dist = distance(tower.position, enemy.position);
    if (dist > def.range) continue;

    // "First" targeting: pick enemy furthest along path
    const progress = enemy.waypointIndex * 10000 - dist;
    if (progress > bestProgress) {
      bestProgress = progress;
      best = enemy;
    }
  }

  return best;
}

function moveProjectile(
  proj: ProjectileInstance,
  enemies: EnemyInstance[],
  delta: number
): 'hit' | 'miss' | 'moving' {
  const target = enemies.find((e) => e.id === proj.targetEnemyId);
  if (!target || target.hp <= 0) return 'miss';

  const dx = target.position.x - proj.position.x;
  const dz = target.position.z - proj.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < PROJECTILE_HIT_RADIUS) return 'hit';

  const step = proj.speed * delta;
  if (step >= dist) return 'hit';

  proj.position = {
    x: proj.position.x + (dx / dist) * step,
    z: proj.position.z + (dz / dist) * step,
  };

  return 'moving';
}

// ── Store ──────────────────────────────────────────────────────────────
export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  money: STARTING_MONEY,
  lives: STARTING_LIVES,
  wave: 0,
  gameTime: 0,
  towers: [],
  enemies: [],
  projectiles: [],
  selectedTowerDef: null,
  spawnStates: [],

  startGame: () => {
    _nextId = 0;
    set({
      phase: 'between-waves',
      money: STARTING_MONEY,
      lives: STARTING_LIVES,
      wave: 0,
      gameTime: 0,
      towers: [],
      enemies: [],
      projectiles: [],
      selectedTowerDef: 'scratchingPost',
      spawnStates: [],
    });
  },

  startWave: () => {
    const { wave } = get();
    if (wave >= WAVES.length) {
      set({ phase: 'victory' });
      return;
    }

    const waveConfig = WAVES[wave];
    const spawnStates: SpawnState[] = waveConfig.entries.map(() => ({
      entryIndex: 0,
      spawned: 0,
      timer: 0,
    }));

    set({ phase: 'playing', spawnStates, gameTime: 0 });
  },

  placeTower: (defId: string, position: Vec2) => {
    const state = get();
    const def = TOWER_DEFS[defId];
    if (!def) return false;
    if (state.money < def.cost) return false;
    if (state.phase !== 'playing' && state.phase !== 'between-waves') return false;

    // Check spacing from other towers
    for (const t of state.towers) {
      if (distance(position, t.position) < MIN_TOWER_SPACING) return false;
    }

    const tower: TowerInstance = {
      id: uid(),
      defId,
      position: { x: position.x, z: position.z },
      lastFireTime: -100,
      targetEnemyId: null,
    };

    set({
      towers: [...state.towers, tower],
      money: state.money - def.cost,
    });

    return true;
  },

  selectTowerDef: (defId: string | null) => {
    set({ selectedTowerDef: defId });
  },

  tick: (delta: number) => {
    const state = get();
    if (state.phase !== 'playing') return;

    const gameTime = state.gameTime + delta;
    const waveConfig = WAVES[state.wave];
    if (!waveConfig) return;

    // Clone mutable state
    let lives = state.lives;
    let money = state.money;
    const enemies = state.enemies.map((e) => ({ ...e, position: { ...e.position } }));
    const projectiles = state.projectiles.map((p) => ({ ...p, position: { ...p.position } }));
    const towers = state.towers.map((t) => ({ ...t }));
    const newSpawnStates = state.spawnStates.map((s) => ({ ...s }));

    // ── 1. Spawn enemies ──────────────────────────────────────────
    for (let i = 0; i < waveConfig.entries.length; i++) {
      const entry = waveConfig.entries[i];
      const ss = newSpawnStates[i];
      if (ss.spawned >= entry.count) continue;

      ss.timer += delta;

      if (ss.timer >= entry.startDelay) {
        const elapsed = ss.timer - entry.startDelay;
        const shouldHaveSpawned = Math.min(
          entry.count,
          Math.floor(elapsed / entry.spawnInterval) + 1
        );

        while (ss.spawned < shouldHaveSpawned) {
          const path = ALL_PATHS[entry.pathIndex];
          if (!path || path.length === 0) { ss.spawned++; continue; }

          const enemyDef = ENEMY_DEFS[entry.enemyDefId];
          if (!enemyDef) { ss.spawned++; continue; }

          enemies.push({
            id: uid(),
            defId: entry.enemyDefId,
            hp: enemyDef.maxHp,
            maxHp: enemyDef.maxHp,
            pathIndex: entry.pathIndex,
            waypointIndex: 1,
            position: { x: path[0].x, z: path[0].z },
            slowTimer: 0,
          });

          ss.spawned++;
        }
      }
    }

    // ── 2. Move enemies ───────────────────────────────────────────
    const reachedEnd = new Set<string>();
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;
      const reached = moveEnemy(enemy, delta);
      if (reached) {
        reachedEnd.add(enemy.id);
        lives--;
      }
    }

    // ── 3. Tower targeting & firing ───────────────────────────────
    const aliveEnemies = enemies.filter(
      (e) => e.hp > 0 && !reachedEnd.has(e.id)
    );

    for (const tower of towers) {
      const def = TOWER_DEFS[tower.defId];
      const target = findTarget(tower, aliveEnemies);
      tower.targetEnemyId = target?.id ?? null;

      if (target && gameTime - tower.lastFireTime >= 1 / def.fireRate) {
        tower.lastFireTime = gameTime;
        projectiles.push({
          id: uid(),
          towerId: tower.id,
          targetEnemyId: target.id,
          position: { x: tower.position.x, z: tower.position.z },
          damage: def.damage,
          speed: def.projectileSpeed,
          special: def.special,
        });
      }
    }

    // ── 4. Move projectiles & handle hits ─────────────────────────
    const projectilesToRemove = new Set<string>();
    for (const proj of projectiles) {
      const result = moveProjectile(proj, aliveEnemies, delta);

      if (result === 'miss') {
        projectilesToRemove.add(proj.id);
      } else if (result === 'hit') {
        projectilesToRemove.add(proj.id);

        const target = aliveEnemies.find((e) => e.id === proj.targetEnemyId);
        if (target) {
          target.hp -= proj.damage;

          if (proj.special === 'slow') {
            target.slowTimer = SLOW_DURATION;
          }

          if (proj.special === 'aoe') {
            for (const other of aliveEnemies) {
              if (other.id === target.id) continue;
              if (distance(target.position, other.position) < AOE_RADIUS) {
                other.hp -= proj.damage * 0.5;
              }
            }
          }
        }
      }
    }

    // ── 5. Remove dead enemies & grant rewards ────────────────────
    const survivingEnemies: EnemyInstance[] = [];
    for (const enemy of enemies) {
      if (reachedEnd.has(enemy.id)) continue;
      if (enemy.hp <= 0) {
        money += ENEMY_DEFS[enemy.defId].reward;
      } else {
        survivingEnemies.push(enemy);
      }
    }

    const survivingProjectiles = projectiles.filter(
      (p) => !projectilesToRemove.has(p.id)
    );

    // ── 6. Check phase transitions ────────────────────────────────
    const allSpawned = newSpawnStates.every(
      (ss, i) => ss.spawned >= waveConfig.entries[i].count
    );
    const waveComplete = allSpawned && survivingEnemies.length === 0;

    let newPhase: GamePhase = 'playing';
    let newWave = state.wave;

    if (lives <= 0) {
      newPhase = 'gameover';
      lives = 0;
    } else if (waveComplete) {
      newWave = state.wave + 1;
      newPhase = newWave >= WAVES.length ? 'victory' : 'between-waves';
    }

    set({
      gameTime,
      enemies: survivingEnemies,
      projectiles: survivingProjectiles,
      towers,
      money,
      lives,
      spawnStates: newSpawnStates,
      phase: newPhase,
      wave: newWave,
    });
  },
}));
