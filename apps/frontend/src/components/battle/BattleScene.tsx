import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../../socket';
import { EVENTS } from 'shared';
import type { Match } from 'shared';
import { PlayerStatsCard } from '../lobby/PlayerStatsCard';
import { HealthBarsOverlay } from './HealthBarsOverlay';
import { GameOverBanner } from './GameOverBanner';
import { bootGame, destroyGame, getGameScene } from '../../game/GameManager';

interface BattleSceneProps {
    match: Match;
    onClose: (result?: 'win' | 'loss') => void;
}

export function BattleScene({ match: initialMatch, onClose }: BattleSceneProps) {
    const [match, setMatch] = useState<Match>(initialMatch);
    const [gameOver, setGameOver] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isPlayer1 = match.player1.id === socket.id;
    const localPlayer = isPlayer1 ? match.player1 : match.player2;
    const opponent = isPlayer1 ? match.player2 : match.player1;

    // Boot Phaser Game
    useEffect(() => {
        if (!containerRef.current) return;

        bootGame('phaser-game-container', {
            localPlayer,
            opponent,
            onLocalMove: (position) => {
                if (!gameOver) {
                    socket.emit(EVENTS.PLAYER_MOVE, position);
                }
            },
            onLocalAttack: (targetId) => {
                if (!gameOver) {
                    socket.emit(EVENTS.PLAYER_ATTACK, { target: targetId });
                }
            }
        });

        return () => {
            destroyGame();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const lastHpRef = useRef(localPlayer.currentHp);

    useEffect(() => {
        if (localPlayer.currentHp < lastHpRef.current) {
            const scene = getGameScene();
            if (scene) {
                scene.triggerDamageEffect();
            }
        }
        lastHpRef.current = localPlayer.currentHp;
    }, [localPlayer.currentHp]);

    // Socket listeners for Match updates
    useEffect(() => {
        const onMatchUpdate = (updatedMatch: Match) => {
            setMatch(updatedMatch);
        };

        const onPlayerMove = ({ id, position }: { id: string, position: { x: number, y: number } }) => {
            if (id === opponent.id) {
                const scene = getGameScene();
                if (scene) {
                    scene.setOpponentPosition(position.x, position.y);
                }
            }
        };

        const onMatchEnd = (finalMatch: Match) => {
            setMatch(finalMatch);
            setGameOver(true);
            const isWinnerNow = finalMatch.winnerId === socket.id;
            setWinnerId(finalMatch.winnerId || null);
            
            const scene = getGameScene();
            if (scene) {
                scene.handleMatchEnd(isWinnerNow);
            }

            setTimeout(() => {
                onClose(isWinnerNow ? 'win' : 'loss');
            }, 5000);
        };

        socket.on(EVENTS.MATCH_UPDATE, onMatchUpdate);
        socket.on(EVENTS.PLAYER_MOVE, onPlayerMove);
        socket.on(EVENTS.MATCH_END, onMatchEnd);

        return () => {
            socket.off(EVENTS.MATCH_UPDATE, onMatchUpdate);
            socket.off(EVENTS.PLAYER_MOVE, onPlayerMove);
            socket.off(EVENTS.MATCH_END, onMatchEnd);
        };
    }, [opponent.id, onClose]);

    const isWinner = winnerId === socket.id;

    return (
        <div className="fixed inset-0 bg-slate-950 overflow-hidden cursor-default select-none">
            {/* Phaser Game Container Container */}
            <div 
                id="phaser-game-container" 
                ref={containerRef}
                className="w-full h-full absolute inset-0 z-0 flex items-center justify-center bg-slate-950"
            />

            <PlayerStatsCard stats={localPlayer.stats} />

            {/* Health Bars Overlay */}
            <HealthBarsOverlay localPlayer={localPlayer} opponent={opponent} />

            {/* Game Over Banner */}
            {gameOver && <GameOverBanner isWinner={isWinner} />}
        </div>
    );
}
