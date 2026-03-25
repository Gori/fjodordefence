'use client';

import { useGameStore } from '@/lib/store';
import { TOWER_DEFS } from '@/lib/towerDefs';
import { useEffect, useCallback, useState } from 'react';

const TOWER_LIST = Object.values(TOWER_DEFS);

const TOWER_DESCS: Record<string, string> = {
  scratchingPost: 'Fast attack',
  yarnLauncher: 'Slows enemies',
  laserPointer: 'Heavy hit, long range',
  catnipBomb: 'Area damage',
};

function TowerIcon({ id, size = 44 }: { id: string; size?: number }) {
  const s = size;
  switch (id) {
    case 'scratchingPost':
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="16" y="4" width="8" height="32" rx="2" fill="#c4873b" />
          <rect x="8" y="28" width="24" height="6" rx="2" fill="#a06a2c" />
          <rect x="14" y="8" width="12" height="4" rx="1" fill="#d9a05b" opacity="0.7" />
          <rect x="14" y="16" width="12" height="4" rx="1" fill="#d9a05b" opacity="0.7" />
          <rect x="14" y="24" width="12" height="4" rx="1" fill="#d9a05b" opacity="0.7" />
        </svg>
      );
    case 'yarnLauncher':
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" fill="#e85d75" />
          <circle cx="20" cy="20" r="9" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
          <circle cx="20" cy="20" r="4" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
          <path d="M20 6 Q28 14 20 20 Q12 26 20 34" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.4" />
        </svg>
      );
    case 'laserPointer':
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <rect x="8" y="16" width="24" height="8" rx="4" fill="#ff3333" />
          <circle cx="32" cy="20" r="3" fill="#ff6666" />
          <line x1="35" y1="20" x2="40" y2="20" stroke="#ff0000" strokeWidth="2" opacity="0.8" />
          <line x1="34" y1="14" x2="38" y2="10" stroke="#ff0000" strokeWidth="1.5" opacity="0.5" />
          <line x1="34" y1="26" x2="38" y2="30" stroke="#ff0000" strokeWidth="1.5" opacity="0.5" />
          <circle cx="32" cy="20" r="1.5" fill="#fff" opacity="0.9" />
        </svg>
      );
    case 'catnipBomb':
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="22" r="12" fill="#4ade80" />
          <circle cx="20" cy="22" r="7" fill="#22c55e" opacity="0.7" />
          <rect x="18" y="6" width="4" height="8" rx="2" fill="#999" />
          <path d="M22 8 Q28 4 26 8" stroke="#FF8C00" strokeWidth="2" fill="none" opacity="0.9" />
          <circle cx="20" cy="22" r="3" fill="#fff" opacity="0.3" />
        </svg>
      );
    default:
      return null;
  }
}

export function TowerSelector() {
  const selectedTowerDef = useGameStore((s) => s.selectedTowerDef);
  const selectTowerDef = useGameStore((s) => s.selectTowerDef);
  const money = useGameStore((s) => s.money);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectTowerDef(null);
        return;
      }
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < TOWER_LIST.length) {
        const def = TOWER_LIST[idx];
        if (money >= def.cost)
          selectTowerDef(selectedTowerDef === def.id ? null : def.id);
      }
    },
    [money, selectTowerDef, selectedTowerDef],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      className="absolute z-10 pointer-events-none anim-slideUp"
      style={{
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        className="pointer-events-auto flex items-end"
        style={{
          gap: 6,
          background: 'rgba(0,0,0,0.85)',
          borderRadius: 16,
          padding: 8,
        }}
      >
        {TOWER_LIST.map((def, i) => {
          const canAfford = money >= def.cost;
          const isSelected = selectedTowerDef === def.id;
          const isHovered = hoveredId === def.id;

          return (
            <div key={def.id} style={{ position: 'relative' }}>
              {/* Hover tooltip */}
              {isHovered && canAfford && (
                <div
                  className="anim-fadeIn"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 8,
                    background: 'rgba(10,14,17,0.92)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    border: `1px solid ${def.color}40`,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      fontWeight: 400,
                      color: '#ccc',
                    }}
                  >
                    {TOWER_DESCS[def.id]}
                  </span>
                  <div
                    className="flex items-center"
                    style={{
                      gap: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#999',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>DMG {def.damage}</span>
                    <span>·</span>
                    <span>RNG {def.range}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() =>
                  canAfford && selectTowerDef(isSelected ? null : def.id)
                }
                disabled={!canAfford}
                className={canAfford ? 'cursor-pointer' : 'cursor-not-allowed'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 16px 8px',
                  background: isSelected
                    ? `${def.color}28`
                    : 'rgba(255,255,255,0.05)',
                  border: isSelected
                    ? `1.5px solid ${def.color}`
                    : '1.5px solid transparent',
                  borderRadius: 12,
                  opacity: canAfford ? 1 : 0.35,
                  transition: 'all 0.15s',
                  position: 'relative',
                  ...(isSelected
                    ? { boxShadow: `0 0 16px ${def.color}30` }
                    : {}),
                }}
                onMouseEnter={() => {
                  setHoveredId(def.id);
                }}
                onMouseLeave={() => {
                  setHoveredId(null);
                }}
              >
                {/* Key badge — inline top-right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: isSelected ? def.color : '#666',
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </div>

                <TowerIcon id={def.id} size={32} />

                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.1,
                    color: isSelected ? '#fff' : '#ccc',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                  }}
                >
                  {def.name}
                </span>

                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: canAfford ? '#FFD666' : '#666',
                  }}
                >
                  ${def.cost}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
