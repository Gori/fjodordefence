'use client';

import { useGameStore } from '@/lib/store';
import { WAVES } from '@/lib/waves';
import { ENEMY_DEFS } from '@/lib/enemyDefs';
import { useEffect, useCallback } from 'react';

export function HUD() {
  const money = useGameStore((s) => s.money);
  const lives = useGameStore((s) => s.lives);
  const wave = useGameStore((s) => s.wave);
  const phase = useGameStore((s) => s.phase);
  const enemies = useGameStore((s) => s.enemies);
  const startWave = useGameStore((s) => s.startWave);

  const maxLives = 20;
  const isLow = lives / maxLives <= 0.3;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'between-waves') {
        e.preventDefault();
        startWave();
      }
    },
    [phase, startWave],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const waveConfig = wave < WAVES.length ? WAVES[wave] : null;
  const waveEnemies =
    waveConfig?.entries.map((e) => ({
      name: ENEMY_DEFS[e.enemyDefId]?.name ?? e.enemyDefId,
      count: e.count,
      color: ENEMY_DEFS[e.enemyDefId]?.color ?? '#888',
    })) ?? [];

  const displayWave = phase === 'between-waves' ? wave + 1 : wave;

  return (
    <>
      {/* ─── LIVES — top left ─── */}
      <div
        className="absolute z-10 pointer-events-none anim-fadeIn d1 flex items-center"
        style={{
          top: 20,
          left: 20,
          gap: 10,
          background: 'rgba(10,14,17,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '10px 20px',
          border: `1.5px solid ${isLow ? 'rgba(255,71,87,0.4)' : 'rgba(255,107,129,0.25)'}`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <path
            d="M18 32s-13-8-13-18C5 8 8.5 4 12.5 4c2.5 0 4.5 1.3 5.5 3 1-1.7 3-3 5.5-3C27.5 4 31 8 31 14c0 10-13 18-13 18z"
            fill={isLow ? '#FF4757' : '#FF6B81'}
          />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1,
            color: isLow ? '#FF4757' : '#fff',
            ...(isLow ? { animation: 'pulse 1s ease-in-out infinite' } : {}),
          }}
        >
          {lives}
        </span>
      </div>

      {/* ─── MONEY — top right ─── */}
      <div
        className="absolute z-10 pointer-events-none anim-fadeIn d2 flex items-center"
        style={{
          top: 20,
          right: 20,
          gap: 10,
          background: 'rgba(10,14,17,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '10px 20px',
          border: '1.5px solid rgba(255,214,102,0.25)',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="14" fill="#FFD666" />
          <circle cx="17" cy="17" r="10" fill="#E8B830" />
          <text x="17" y="22.5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#8B6914">$</text>
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1,
            color: '#FFD666',
          }}
        >
          {money}
        </span>
      </div>

      {/* ─── WAVE — top center (during play) ─── */}
      {phase === 'playing' && (
        <div
          className="absolute z-10 pointer-events-none anim-fadeIn"
          style={{ top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}
        >
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <div
              className="flex items-center"
              style={{
                gap: 12,
                background: 'rgba(10,14,17,0.72)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 14,
                padding: '10px 24px',
                border: '1.5px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>
                Wave
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, lineHeight: 1, color: '#fff' }}>
                {displayWave}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, color: '#555' }}>
                / {WAVES.length}
              </span>
              <div className="flex items-center" style={{ gap: 5, marginLeft: 4 }}>
                {Array.from({ length: WAVES.length }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: i < wave ? '#2ED573' : i === wave ? '#FFD666' : 'rgba(255,255,255,0.15)',
                      boxShadow: i === wave ? '0 0 8px rgba(255,214,102,0.5)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </div>
            {enemies.length > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
                {enemies.length} {enemies.length === 1 ? 'enemy' : 'enemies'} remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── BETWEEN WAVES — top center banner ─── */}
      {phase === 'between-waves' && (
        <div
          className="absolute z-10 anim-slideDown"
          style={{ top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}
        >
          <div
            className="flex items-center pointer-events-auto"
            style={{
              gap: 28,
              background: 'rgba(10,14,17,0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 16,
              padding: '16px 36px',
              border: '1.5px solid rgba(255,214,102,0.2)',
            }}
          >
            {/* Wave title */}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1, color: '#fff' }}>
              WAVE {wave + 1}
            </span>

            {/* Divider */}
            <div style={{ width: 1.5, height: 40, background: 'rgba(255,255,255,0.12)' }} />

            {/* Enemies incoming */}
            <div className="flex items-center" style={{ gap: 16 }}>
              {waveEnemies.map((enemy, i) => (
                <div key={i} className="flex items-center" style={{ gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: enemy.color }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, color: '#ddd' }}>
                    {enemy.count}× {enemy.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ width: 1.5, height: 40, background: 'rgba(255,255,255,0.12)' }} />

            {/* Deploy */}
            <button
              onClick={startWave}
              className="uppercase cursor-pointer"
              style={{
                padding: '10px 32px',
                fontSize: 15,
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.2em',
                color: '#111',
                background: '#FFD666',
                border: 'none',
                borderRadius: 10,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(255,214,102,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Deploy
            </button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', color: '#666', textTransform: 'uppercase' }}>
              Space
            </span>
          </div>
        </div>
      )}
    </>
  );
}
