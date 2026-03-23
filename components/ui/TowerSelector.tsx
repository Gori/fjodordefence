'use client';

import { useGameStore } from '@/lib/store';
import { TOWER_DEFS } from '@/lib/towerDefs';
import { useEffect, useCallback } from 'react';

const TOWER_LIST = Object.values(TOWER_DEFS);

export function TowerSelector() {
  const selectedTowerDef = useGameStore((s) => s.selectedTowerDef);
  const selectTowerDef = useGameStore((s) => s.selectTowerDef);
  const money = useGameStore((s) => s.money);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { selectTowerDef(null); return; }
    const idx = parseInt(e.key) - 1;
    if (idx >= 0 && idx < TOWER_LIST.length) {
      const def = TOWER_LIST[idx];
      if (money >= def.cost) selectTowerDef(selectedTowerDef === def.id ? null : def.id);
    }
  }, [money, selectTowerDef, selectedTowerDef]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="absolute left-3 top-14 pointer-events-none z-10">
      <div className="pointer-events-auto rounded-xl overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}>

        {TOWER_LIST.map((def, i) => {
          const canAfford = money >= def.cost;
          const isSelected = selectedTowerDef === def.id;

          return (
            <button
              key={def.id}
              onClick={() => canAfford && selectTowerDef(isSelected ? null : def.id)}
              className={`flex items-center gap-2 px-3 py-2 transition-all text-left w-full border-b border-white/5 last:border-0
                ${isSelected ? '' : 'hover:bg-white/5'}
                ${canAfford ? 'cursor-pointer' : 'opacity-30 cursor-not-allowed'}
              `}
              style={{ background: isSelected ? `${def.color}25` : undefined }}
              disabled={!canAfford}
            >
              <div className="w-6 h-6 rounded shrink-0" style={{ background: def.color }} />
              <span className="text-xs font-bold text-white flex-1">{def.name}</span>
              <span className={`text-xs font-bold tabular-nums ${canAfford ? 'text-yellow-400' : 'text-white/20'}`}>{def.cost}</span>
              <span className="text-[9px] text-white/20 font-mono w-3">{i + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
