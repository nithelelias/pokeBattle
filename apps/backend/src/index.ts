import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { EVENTS, Player, Match, MatchPlayer } from 'shared';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 3001;

// State
const players = new Map<string, Player>();
let matchmakingQueue: string[] = [];
const activeMatches = new Map<string, Match>();
const playerToMatch = new Map<string, string>(); // Maps socketId -> matchId

const COOLDOWN_MS = 500; // Fixed cooldown per attack
const playerCooldowns = new Map<string, number>();

function createMatchPlayer(p: Player): MatchPlayer {
    const hp = 10 + (p.stats.hp * 5);
    return { ...p, currentHp: hp, maxHp: hp };
}

io.on(EVENTS.CONNECTION, (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on(EVENTS.DISCONNECT, () => {
        console.log(`User disconnected: ${socket.id}`);
        players.delete(socket.id);
        matchmakingQueue = matchmakingQueue.filter(id => id !== socket.id);
        
        // If they were in a match, auto-surrender
        const matchId = playerToMatch.get(socket.id);
        if (matchId) {
            const match = activeMatches.get(matchId);
            if (match && match.status === 'playing') {
                match.status = 'finished';
                match.winnerId = match.player1.id === socket.id ? match.player2.id : match.player1.id;
                io.to(matchId).emit(EVENTS.MATCH_END, match);
                activeMatches.delete(matchId);
                playerToMatch.delete(match.player1.id);
                playerToMatch.delete(match.player2.id);
            }
        }
    });

    socket.on(EVENTS.JOIN_LOBBY, (playerData: Omit<Player, 'id' | 'position'>) => {
        const newPlayer: Player = {
            id: socket.id,
            nickname: playerData.nickname,
            photoBase64: playerData.photoBase64,
            stats: playerData.stats,
            position: { x: 500, y: 500 }
        };
        players.set(socket.id, newPlayer);
    });

    socket.on(EVENTS.SEARCH_MATCH, () => {
        const player = players.get(socket.id);
        if (!player) return;

        if (!matchmakingQueue.includes(socket.id)) {
            matchmakingQueue.push(socket.id);
        }

        // Try to form a match
        if (matchmakingQueue.length >= 2) {
            const id1 = matchmakingQueue.shift()!;
            const id2 = matchmakingQueue.shift()!;

            const p1 = players.get(id1);
            const p2 = players.get(id2);

            if (p1 && p2) {
                const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                
                // Spawn locations logic will be handled by the frontend interpolator,
                // but we set initial mirrored boundaries.
                p1.position = { x: 300, y: 500 };
                p2.position = { x: 1000, y: 500 };

                const match: Match = {
                    matchId,
                    player1: createMatchPlayer(p1),
                    player2: createMatchPlayer(p2),
                    status: 'playing'
                };

                activeMatches.set(matchId, match);
                playerToMatch.set(id1, matchId);
                playerToMatch.set(id2, matchId);

                // Join them to a room
                const sock1 = io.sockets.sockets.get(id1);
                const sock2 = io.sockets.sockets.get(id2);
                if (sock1) sock1.join(matchId);
                if (sock2) sock2.join(matchId);

                // Start
                io.to(matchId).emit(EVENTS.MATCH_FOUND, match);
            }
        }
    });

    socket.on(EVENTS.PLAYER_MOVE, (pos: { x: number, y: number }) => {
        const player = players.get(socket.id);
        if (player) {
            player.position = pos;
            const matchId = playerToMatch.get(socket.id);
            if (matchId) {
                // Broadcast move to opponent
                socket.to(matchId).emit(EVENTS.PLAYER_MOVE, { id: socket.id, position: pos });
            }
        }
    });

    socket.on(EVENTS.PLAYER_ATTACK, ({ target }: { target: string }) => {
        const player = players.get(socket.id);
        if (!player) return;
        
        // Cooldown Check
        const now = Date.now();
        const lastAttack = playerCooldowns.get(socket.id) || 0;
        if (now - lastAttack < COOLDOWN_MS) {
            return; // Spam blocked
        }
        playerCooldowns.set(socket.id, now);

        const matchId = playerToMatch.get(socket.id);
        if (matchId) {
            const match = activeMatches.get(matchId);
            if (match && match.status === 'playing') {
                const isPlayer1 = match.player1.id === socket.id;
                const targetPlayer = isPlayer1 ? match.player2 : match.player1;
                
                // Verify the target they tried to attack is indeed their opponent
                if (target === targetPlayer.id) {
                    const damage = player.stats.damage > 0 ? player.stats.damage * 2 : 1;
                    targetPlayer.currentHp -= damage;
                    
                    if (targetPlayer.currentHp <= 0) {
                        targetPlayer.currentHp = 0;
                        match.status = 'finished';
                        match.winnerId = socket.id;
                        io.to(matchId).emit(EVENTS.MATCH_END, match);
                        activeMatches.delete(matchId);
                        playerToMatch.delete(match.player1.id);
                        playerToMatch.delete(match.player2.id);
                    } else {
                        io.to(matchId).emit(EVENTS.MATCH_UPDATE, match);
                    }
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
