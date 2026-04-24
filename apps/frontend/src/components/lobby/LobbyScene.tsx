import React, { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { IMAGE_SIZE, EVENTS } from 'shared';
import type { LocalPlayerState } from 'shared';
import { PlayerAvatar } from './PlayerAvatar';
import { DummyTarget } from './DummyTarget';
import { TrajectoryLine } from './TrajectoryLine';
import { HitsFeedback } from './HitsFeedback';
import type { HitEvent } from './HitsFeedback';
import { PlayerStatsCard } from './PlayerStatsCard';

interface LobbySceneProps {
    playerState: LocalPlayerState;
    queueSize: number;
}

export function LobbyScene({ playerState, queueSize }: LobbySceneProps) {
    const [playerPos, setPlayerPos] = useState({ x: 200, y: window.innerHeight / 2 });
    const [destination, setDestination] = useState({ x: 200, y: window.innerHeight / 2 });
    const [previewPos, setPreviewPos] = useState({ x: 200, y: window.innerHeight / 2 });
    const [isDragging, setIsDragging] = useState(false);
    
    // Dummy logic
    const [dummyPos] = useState({ x: window.innerWidth - 200, y: window.innerHeight / 2 });
    const [hits, setHits] = useState<HitEvent[]>([]);

    const [isSearching, setIsSearching] = useState(false);

    // Physics Loop (Constant Linear Velocity)
    useEffect(() => {
        let frameId: number;
        // Speed 0: 2 px/frame (Sluggish tank)
        // Speed 1: 6 px/frame
        // Speed 3: 14 px/frame (More than double Speed 1)
        // Speed 5: 22 px/frame (Lightning fast)
        const pixelsPerFrame = 2 + (playerState.stats.speed * 4);

        const animate = () => {
            setPlayerPos(prev => {
                const dx = destination.x - prev.x;
                const dy = destination.y - prev.y;
                const distance = Math.hypot(dx, dy);
                
                // Snap if close enough to avoid jitter
                if (distance <= pixelsPerFrame) {
                    return destination;
                }

                // Constant direction vector
                return { 
                    x: prev.x + (dx / distance) * pixelsPerFrame, 
                    y: prev.y + (dy / distance) * pixelsPerFrame 
                };
            });
            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [destination, playerState.stats.speed]);

    // Send position to server
    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit(EVENTS.PLAYER_MOVE, playerPos);
        }, 100);
        return () => clearInterval(interval);
    }, [playerPos]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const dist = Math.hypot(e.clientX - playerPos.x, e.clientY - playerPos.y);
        if (dist < IMAGE_SIZE / 2) {
            setIsDragging(true);
            setPreviewPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPreviewPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isDragging) {
            setDestination({ x: e.clientX, y: e.clientY });
            setIsDragging(false);
        }
    };

    const handleDummyAttack = (e: React.MouseEvent) => {
        e.stopPropagation();
        const damage = playerState.stats.damage || 1;
        const newHit = { id: Date.now(), x: e.clientX, y: e.clientY - 30, damage };
        setHits(prev => [...prev, newHit]);
        setTimeout(() => setHits(prev => prev.filter(h => h.id !== newHit.id)), 800);
        socket.emit(EVENTS.PLAYER_ATTACK, { target: 'dummy' });
    };

    const handleSearchMatch = () => {
        setIsSearching(true);
        socket.emit(EVENTS.SEARCH_MATCH);
    };

    return (
        <div 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="fixed inset-0 bg-slate-950 overflow-hidden cursor-default select-none"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

            <TrajectoryLine 
                playerPos={playerPos} 
                destination={destination} 
                previewPos={previewPos} 
                isDragging={isDragging} 
            />

            <DummyTarget 
                position={dummyPos} 
                onClick={handleDummyAttack} 
            />

            <PlayerAvatar 
                playerState={playerState} 
                position={playerPos} 
                isDragging={isDragging} 
            />

            <HitsFeedback hits={hits} />

            <PlayerStatsCard stats={playerState.stats} />

            {/* UI Header / Info */}
            <div className="absolute top-10 left-0 w-full flex flex-col items-center pointer-events-none z-50">
                <h2 className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Practice Arena</h2>
                <div className="flex space-x-4 mb-4">
                    <div className="bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
                        <span className="text-emerald-400 font-bold mr-2">{queueSize}</span>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Online Players</span>
                    </div>
                </div>
                <div className="flex space-x-4 mb-4">
                    <div className="bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800 flex space-x-3">
                        <div className="flex items-center">
                            <span className="text-blue-400 font-bold mr-1">{playerState.wins || 0}</span>
                            <span className="text-slate-500 text-[8px] font-bold uppercase">Wins</span>
                        </div>
                        <div className="w-[1px] h-3 bg-slate-800 self-center"></div>
                        <div className="flex items-center">
                            <span className="text-rose-400 font-bold mr-1">{playerState.losses || 0}</span>
                            <span className="text-slate-500 text-[8px] font-bold uppercase">Losses</span>
                        </div>
                    </div>
                </div>
                <p className="text-slate-600 text-[10px] font-bold">DRAG YOUR PHOTO TO SET DESTINATION | CLICK DUMMY TO ATTACK</p>
            </div>

            {/* Search Match Button */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
                <button 
                    onClick={!isSearching ? handleSearchMatch : undefined}
                    className={`px-10 py-4 font-black rounded-2xl shadow-lg transition-all ${
                        isSearching 
                        ? 'bg-amber-500 hover:bg-amber-400 text-white animate-pulse cursor-wait' 
                        : 'bg-primary hover:bg-blue-400 text-white hover:-translate-y-1 active:translate-y-0'
                    }`}
                >
                    {isSearching ? 'SEARCHING FOR OPPONENT...' : 'MATCHMAKING'}
                </button>
            </div>

            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
