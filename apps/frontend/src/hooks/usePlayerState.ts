import { useState, useEffect } from 'react';
import type { LocalPlayerState } from 'shared';

const DEFAULT_STATE: LocalPlayerState = {
    nickname: '',
    photoBase64: null,
    stats: { hp: 0, damage: 0, speed: 0 },
    isReady: false
};

const STORAGE_KEY = 'monopokebattle_player';

export function usePlayerState() {
    const [playerState, setPlayerState] = useState<LocalPlayerState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return DEFAULT_STATE;
            }
        }
        return DEFAULT_STATE;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playerState));
    }, [playerState]);

    const updateState = (updates: Partial<LocalPlayerState>) => {
        setPlayerState(prev => ({ ...prev, ...updates }));
    };

    const resetState = () => {
        setPlayerState(DEFAULT_STATE);
    };

    return { playerState, updateState, resetState };
}
