'use client';

import { useGameStore } from '@/lib/store';
import { WAVES } from '@/lib/waves';

export function HUD() {
  const money = useGameStore((s) => s.money);
  const lives = useGameStore((s) => s.lives);
  const wave = useGameStore((s) => s.wave);
  const phase = useGameStore((s) => s.phase);
  const enemies = useGameStore((s) => s.enemies);
  const startWave = useGameStore((s) => s.startWave);

  return (
    <>
      {/* Top bar — large, readable */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)', padding: '12px 16px' }}>
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-6">
            {/* Lives */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-500" />
              <span className="text-2xl font-black tabular-nums text-white">{lives}</span>
            </div>
            {/* Money */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-500" />
              <span className="text-2xl font-black tabular-nums text-yellow-400">{money}</span>
            </div>
          </div>

          {/* Wave */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Wave</span>
            <span className="text-2xl font-black tabular-nums text-white">
              {wave + 1}<span className="text-lg text-white/30">/{WAVES.length}</span>
            </span>
            {phase === 'playing' && enemies.length > 0 && (
              <span className="text-lg font-bold text-white/30 tabular-nums">· {enemies.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Wave start — big centered button */}
      {phase === 'between-waves' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <button
            onClick={startWave}
            className="pointer-events-auto rounded-2xl px-14 py-5 text-2xl font-black uppercase tracking-wider text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #e67e22, #d35400)',
              boxShadow: '0 6px 32px rgba(230,126,34,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
          >
            Send Wave {wave + 1}
          </button>
        </div>
      )}
    </>
  );
}
