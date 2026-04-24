export const IMAGE_SIZE = 100;
export const MAX_STATS_POINTS = 5;

export interface PlayerStats {
    hp: number;
    damage: number;
    speed: number;
}

export interface Player {
    id: string; // Socket ID
    nickname: string;
    photoBase64: string; 
    stats: PlayerStats;
    position: { x: number, y: number };
}

export interface LocalPlayerState {
    nickname: string;
    photoBase64: string | null;
    stats: PlayerStats;
    isReady: boolean;
    wins: number;
    losses: number;
}

export interface MatchPlayer extends Player {
    currentHp: number;
    maxHp: number;
}

export interface Match {
    matchId: string;
    player1: MatchPlayer;
    player2: MatchPlayer;
    status: 'playing' | 'finished';
    winnerId?: string;
}

// Socket Events
export const EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_LOBBY: 'join_lobby',
    SEARCH_MATCH: 'search_match',
    MATCH_FOUND: 'match_found',
    PLAYER_MOVE: 'player_move',
    PLAYER_ATTACK: 'player_attack',
    MATCH_UPDATE: 'match_update',
    MATCH_END: 'match_end',
    QUEUE_UPDATE: 'queue_update'
};
