'use client';

import { useGameStore } from '@/lib/store';

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a3050 0%, #0c1828 70%)' }}>

      <div className="flex flex-col items-center">
        <div className="text-6xl mb-6">🐱</div>

        <h1 className="text-5xl font-black text-white tracking-tight mb-1">
          FJODOR&apos;S DEFENCE
        </h1>

        <p className="text-sm text-white/30 tracking-widest uppercase mb-10">
          S&ouml;dermalm &middot; Stockholm
        </p>

        <button
          onClick={startGame}
          className="rounded-xl px-12 py-3.5 text-lg font-bold uppercase tracking-wide text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e67e22, #d35400)',
            boxShadow: '0 4px 24px rgba(230,126,34,0.4)',
          }}
        >
          Play
        </button>

        <p className="mt-8 text-xs text-white/20 max-w-xs text-center leading-relaxed">
          Place towers along the streets of S&ouml;dermalm to defend against rats, pigeons, and dogs.
          Right-click to pan. Scroll to zoom.
        </p>
      </div>
    </div>
  );
}
