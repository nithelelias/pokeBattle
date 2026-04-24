import React from 'react';
import type { MatchPlayer } from 'shared';
import { Swords } from 'lucide-react';

interface HealthBarsOverlayProps {
    localPlayer: MatchPlayer;
    opponent: MatchPlayer;
}

export function HealthBarsOverlay({ localPlayer, opponent }: HealthBarsOverlayProps) {
    const localHpPercent = `${Math.max(0, (localPlayer.currentHp / localPlayer.maxHp) * 100)}%`;
    const opponentHpPercent = `${Math.max(0, (opponent.currentHp / opponent.maxHp) * 100)}%`;

    return (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-50">
            {/* Local Player Health */}
            <div className="w-1/3">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-white text-lg drop-shadow-md">{localPlayer.nickname}</span>
                    <span className="font-bold text-slate-300 text-sm">
                        {Math.max(0, localPlayer.currentHp)} / {localPlayer.maxHp}
                    </span>
                </div>
                <div className="h-6 w-full bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                        style={{ width: localHpPercent }}
                    />
                </div>
            </div>

            <div className="mx-4 mt-2">
                <Swords className="w-12 h-12 text-rose-500 opacity-50" />
            </div>

            {/* Opponent Health */}
            <div className="w-1/3 text-right">
                <div className="flex justify-between items-center mb-2 flex-row-reverse">
                    <span className="font-black text-white text-lg drop-shadow-md">{opponent.nickname}</span>
                    <span className="font-bold text-slate-300 text-sm">
                        {Math.max(0, opponent.currentHp)} / {opponent.maxHp}
                    </span>
                </div>
                <div className="h-6 w-full bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden flex justify-end">
                    <div 
                        className="h-full bg-gradient-to-l from-rose-500 to-rose-400 transition-all duration-300"
                        style={{ width: opponentHpPercent }}
                    />
                </div>
            </div>
        </div>
    );
}
