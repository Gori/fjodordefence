'use client';

import { GameCanvas } from './game/GameCanvas';
import { HUD } from './ui/HUD';
import { TowerSelector } from './ui/TowerSelector';
import { StartScreen } from './ui/StartScreen';
import { GameOverScreen } from './ui/GameOver';
import { useGameStore } from '@/lib/store';

export function GameClient() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c1828]">
      <GameCanvas />
      {phase === 'menu' && <StartScreen />}
      {(phase === 'playing' || phase === 'between-waves') && (
        <>
          <HUD />
          <TowerSelector />
        </>
      )}
      {(phase === 'gameover' || phase === 'victory') && <GameOverScreen />}
    </div>
  );
}
