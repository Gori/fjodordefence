'use client';

import { useGameStore } from '@/lib/store';

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      {/* Cat */}
      <div
        className="anim-fadeIn d1"
        style={{
          marginBottom: 48,
          animation: 'fadeIn 0.8s ease-out both, breathe 5s ease-in-out 1s infinite',
        }}
      >
        <svg width="160" height="160" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="38" rx="18" ry="15" fill="#FFD666" />
          <polygon points="16,28 11,8 27,23" fill="#FFD666" />
          <polygon points="19,25 15,13 26,23" fill="#111" opacity="0.3" />
          <polygon points="48,28 53,8 37,23" fill="#FFD666" />
          <polygon points="45,25 49,13 38,23" fill="#111" opacity="0.3" />
          <ellipse cx="25" cy="35" rx="3.5" ry="4" fill="#2a5a2e" />
          <ellipse cx="39" cy="35" rx="3.5" ry="4" fill="#2a5a2e" />
          <ellipse cx="25" cy="34" rx="1.5" ry="2.2" fill="#111" />
          <ellipse cx="39" cy="34" rx="1.5" ry="2.2" fill="#111" />
          <ellipse cx="25.8" cy="33" rx="0.7" ry="0.7" fill="#fff" opacity="0.9" />
          <ellipse cx="39.8" cy="33" rx="0.7" ry="0.7" fill="#fff" opacity="0.9" />
          <polygon points="32,40 29.5,43 34.5,43" fill="#e88" />
          <line x1="6" y1="37" x2="22" y2="39" stroke="#FFD666" strokeWidth="1.2" opacity="0.5" />
          <line x1="6" y1="42" x2="22" y2="42" stroke="#FFD666" strokeWidth="1.2" opacity="0.5" />
          <line x1="58" y1="37" x2="42" y2="39" stroke="#FFD666" strokeWidth="1.2" opacity="0.5" />
          <line x1="58" y1="42" x2="42" y2="42" stroke="#FFD666" strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="anim-slideUp d2 text-center uppercase"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(80px, 14vw, 160px)',
          lineHeight: 0.88,
          color: '#fff',
        }}
      >
        FJODOR&apos;S<br />DEFENCE
      </h1>

      {/* Location */}
      <p
        className="anim-fadeIn d3 uppercase"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '0.3em',
          color: '#aaa',
          marginTop: 28,
        }}
      >
        Södermalm · Stockholm
      </p>

      {/* Play */}
      <button
        onClick={startGame}
        className="anim-scaleIn d4 uppercase cursor-pointer"
        style={{
          marginTop: 56,
          padding: '22px 72px',
          fontSize: 18,
          fontWeight: 500,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.2em',
          color: '#111',
          background: '#FFD666',
          border: 'none',
          borderRadius: 14,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.boxShadow = '0 0 48px rgba(255,214,102,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Play Now
      </button>

      {/* Controls */}
      <p
        className="anim-fadeIn d5"
        style={{
          marginTop: 48,
          fontSize: 15,
          fontWeight: 400,
          color: '#999',
        }}
      >
        Click to place · Right-drag to pan · Scroll to zoom
      </p>
    </div>
  );
}
