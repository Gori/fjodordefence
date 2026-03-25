'use client';

import { GameCanvas } from './game/GameCanvas';
import { HUD } from './ui/HUD';
import { TowerSelector } from './ui/TowerSelector';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOver';
import { useGameStore } from '@/lib/store';

export function GameClient() {
  const phase = useGameStore((s) => s.phase);
  const selectedTowerDef = useGameStore((s) => s.selectedTowerDef);
  const isPlaying = phase === 'playing' || phase === 'between-waves';

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${isPlaying && selectedTowerDef ? 'placing' : ''}`}
      style={{ background: '#111' }}
    >
      <GameCanvas />
      {phase === 'menu' && <StartScreen />}
      {isPlaying && (
        <>
          <HUD />
          <TowerSelector />
        </>
      )}
      {(phase === 'gameover' || phase === 'victory') && <GameOverScreen />}
    </div>
  );
}
