'use client';

import { useGameStore } from '@/lib/store';

export function GameOverScreen() {
  const phase = useGameStore((s) => s.phase);
  const wave = useGameStore((s) => s.wave);
  const startGame = useGameStore((s) => s.startGame);
  const isVictory = phase === 'victory';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center"
      style={{ background: 'rgba(12,24,40,0.9)' }}>

      <div className="flex flex-col items-center">
        <div className="text-6xl mb-6">{isVictory ? '🏆' : '😿'}</div>

        <h2 className="text-5xl font-black text-white tracking-tight mb-2">
          {isVictory ? 'VICTORY' : 'DEFEATED'}
        </h2>

        <p className="text-sm text-white/40 mb-10">
          {isVictory
            ? 'Fjodor defended Södermalm!'
            : `Fell at wave ${wave + 1}`}
        </p>

        <button
          onClick={startGame}
          className="rounded-xl px-12 py-3.5 text-lg font-bold uppercase tracking-wide text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e67e22, #d35400)',
            boxShadow: '0 4px 24px rgba(230,126,34,0.4)',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
