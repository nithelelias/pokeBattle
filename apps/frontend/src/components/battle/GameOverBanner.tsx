import React from 'react';

interface GameOverBannerProps {
    isWinner: boolean;
}

export function GameOverBanner({ isWinner }: GameOverBannerProps) {
    const titleBaseClasses = "text-8xl font-black uppercase tracking-tighter drop-shadow-2xl mb-6";
    const titleColorClass = isWinner ? "text-amber-400" : "text-slate-500";
    const titleClasses = `${titleBaseClasses} ${titleColorClass}`;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in pointer-events-none">
            <div className="text-center">
                <h1 className={titleClasses}>
                    {isWinner ? 'YOU WIN!' : 'DEFEATED'}
                </h1>
                <p className="text-xl font-bold text-white/50 animate-pulse">
                    Returning to lobby...
                </p>
            </div>
        </div>
    );
}
