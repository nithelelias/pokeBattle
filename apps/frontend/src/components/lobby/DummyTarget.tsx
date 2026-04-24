import React from 'react';
import { Target } from 'lucide-react';
import { IMAGE_SIZE } from 'shared';

interface DummyTargetProps {
    position: { x: number; y: number };
    onClick: (e: React.MouseEvent) => void;
}

export function DummyTarget({ position, onClick }: DummyTargetProps) {
    return (
        <div 
            onClick={onClick}
            className="absolute transition-transform active:scale-95 group cursor-pointer"
            style={{ 
                left: position.x, 
                top: position.y, 
                width: IMAGE_SIZE, 
                height: IMAGE_SIZE,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
            }}
        >
            <div className="w-full h-full rounded-full border-4 border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-center group-hover:border-rose-500/50 group-hover:bg-rose-500/5 transition-all">
                <Target className="w-12 h-12 text-slate-700 group-hover:text-rose-500 group-hover:animate-spin-slow" />
            </div>
            <div className="absolute -top-10 left-0 w-full text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dummy</span>
            </div>
        </div>
    );
}
