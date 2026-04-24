import React from 'react';
import { Shield, Swords, Zap } from 'lucide-react';
import type { PlayerStats } from 'shared';

interface PlayerStatsCardProps {
    stats: PlayerStats;
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
    return (
        <div className="absolute top-8 right-8 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-2xl z-50 animate-fade-in pointer-events-none">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3 border-b border-slate-700/50 pb-2">
                Combat Stats
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between space-x-6">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300 font-bold text-sm">HP</span>
                    </div>
                    <span className="text-white font-black">{stats.hp}</span>
                </div>
                
                <div className="flex items-center justify-between space-x-6">
                    <div className="flex items-center space-x-2">
                        <Swords className="w-4 h-4 text-rose-400" />
                        <span className="text-slate-300 font-bold text-sm">Damage</span>
                    </div>
                    <span className="text-white font-black">{stats.damage}</span>
                </div>

                <div className="flex items-center justify-between space-x-6">
                    <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-slate-300 font-bold text-sm">Speed</span>
                    </div>
                    <span className="text-white font-black">{stats.speed}</span>
                </div>
            </div>
        </div>
    );
}
