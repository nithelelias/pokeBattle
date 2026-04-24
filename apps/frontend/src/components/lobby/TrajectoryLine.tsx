import React from 'react';
import { Flag } from 'lucide-react';

interface TrajectoryLineProps {
    playerPos: { x: number; y: number };
    destination: { x: number; y: number };
    previewPos: { x: number; y: number };
    isDragging: boolean;
}

export function TrajectoryLine({ playerPos, destination, previewPos, isDragging }: TrajectoryLineProps) {
    const showDestination = !isDragging && Math.hypot(playerPos.x - destination.x, playerPos.y - destination.y) > 10;

    return (
        <>
            {/* SVG Layer for Dotted Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Movement Path (Active Drag) */}
                {isDragging && (
                    <line 
                        x1={playerPos.x} y1={playerPos.y} 
                        x2={previewPos.x} y2={previewPos.y} 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        strokeDasharray="10,10"
                        className="animate-[dash_2s_linear_infinite]"
                    />
                )}
                {/* Path to Destination (While moving) */}
                {showDestination && (
                    <line 
                        x1={playerPos.x} y1={playerPos.y} 
                        x2={destination.x} y2={destination.y} 
                        stroke="#1e293b" 
                        strokeWidth="2" 
                        strokeDasharray="5,5"
                    />
                )}
            </svg>

            {/* Destination Flag */}
            {(isDragging || showDestination) && (
                <div 
                    className="absolute text-emerald-400 opacity-60 animate-pulse z-0 pointer-events-none"
                    style={{ 
                        left: isDragging ? previewPos.x : destination.x, 
                        top: isDragging ? previewPos.y : destination.y,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <Flag className="w-8 h-8" />
                </div>
            )}
        </>
    );
}
