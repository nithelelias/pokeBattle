import * as Phaser from 'phaser';
import { GameScene } from './GameScene';
import type { GameSceneData } from './GameScene';

let gameInstance: Phaser.Game | null = null;

export const bootGame = (containerId: string, initialData: GameSceneData): Phaser.Game => {
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerId,
        width: 1280,
        height: 720,
        backgroundColor: '#000000', // Black bars
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [GameScene],
        physics: {
            default: 'arcade',
            arcade: {
                debug: false
            }
        }
    };

    gameInstance = new Phaser.Game(config);

    // Pass data into the scene when it starts
    gameInstance.scene.start('GameScene', initialData);

    return gameInstance;
};

export const getGameScene = (): GameScene | null => {
    if (!gameInstance) return null;
    const scene = gameInstance.scene.getScene('GameScene') as GameScene;
    return scene;
};

export const destroyGame = () => {
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }
};
