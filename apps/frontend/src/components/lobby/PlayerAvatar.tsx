import React from 'react';
import { IMAGE_SIZE } from 'shared';
import type { PlayerStats } from 'shared';

interface PlayerAvatarProps {
    playerState: {
        nickname: string;
        photoBase64: string | null;
        stats: PlayerStats;
    };
    position: { x: number; y: number };
    isDragging?: boolean;
}

export function PlayerAvatar({ playerState, position, isDragging = false }: PlayerAvatarProps) {
    return (
        <div 
            className={`absolute rounded-full transition-shadow duration-300 ${isDragging ? 'shadow-[0_0_40px_rgba(59,130,246,0.6)]' : 'shadow-xl'}`}
            style={{ 
                left: position.x, 
                top: position.y, 
                width: IMAGE_SIZE, 
                height: IMAGE_SIZE,
                transform: 'translate(-50%, -50%)',
                zIndex: 20
            }}
        >
            <div className="relative w-full h-full rounded-full border-4 border-primary overflow-hidden bg-slate-800 pointer-events-none">
                {playerState.photoBase64 ? (
                    <img 
                        src={playerState.photoBase64} 
                        alt={playerState.nickname} 
                        className="w-full h-full object-cover pointer-events-none" 
                        draggable={false} 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold pointer-events-none">?</div>
                )}
            </div>
            
            {/* Stats indicators around circle */}
            <div className="absolute -bottom-8 left-0 w-full flex justify-center space-x-0.5 pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < playerState.stats.speed ? 'bg-amber-400' : 'bg-slate-700/50'}`}></div>
                ))}
            </div>
            
            {/* Nickname Title */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white font-black text-sm drop-shadow-md whitespace-nowrap pointer-events-none">
                {playerState.nickname}
            </div>
        </div>
    );
}
