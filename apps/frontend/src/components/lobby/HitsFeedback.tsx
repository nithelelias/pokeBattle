import React from 'react';

export interface HitEvent {
    id: number;
    x: number;
    y: number;
    damage: number;
}

interface HitsFeedbackProps {
    hits: HitEvent[];
}

export function HitsFeedback({ hits }: HitsFeedbackProps) {
    return (
        <div className="pointer-events-none z-50">
            {hits.map(hit => (
                <div 
                    key={hit.id}
                    className="absolute text-2xl font-black text-rose-500 animate-bounce pointer-events-none drop-shadow-md"
                    style={{ left: hit.x, top: hit.y, transform: 'translate(-50%, -50%)' }}
                >
                    {`-${hit.damage}`}
                </div>
            ))}
        </div>
    );
}
