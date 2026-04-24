import * as Phaser from 'phaser';
import type { MatchPlayer } from 'shared';
import { IMAGE_SIZE } from 'shared';

export interface GameSceneData {
    localPlayer: MatchPlayer;
    opponent: MatchPlayer;
    onLocalMove: (position: { x: number, y: number }) => void;
    onLocalAttack: (targetId: string) => void;
}

export class GameScene extends Phaser.Scene {
    private localPlayer!: MatchPlayer;
    private opponent!: MatchPlayer;
    private onLocalMove!: (position: { x: number, y: number }) => void;
    private onLocalAttack!: (targetId: string) => void;

    private localSprite!: Phaser.GameObjects.Sprite;
    private opponentSprite!: Phaser.GameObjects.Sprite;
    private localBorder!: Phaser.GameObjects.Arc;
    private opponentBorder!: Phaser.GameObjects.Arc;
    private targetFlag!: Phaser.GameObjects.Text;
    private dottedLine!: Phaser.GameObjects.Graphics;

    private isDragging = false;
    private destination = { x: 0, y: 0 };
    private opponentTargetPos = { x: 0, y: 0 };
    private localSpeedPxPerFrame = 2; // Default

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: GameSceneData) {
        this.localPlayer = data.localPlayer;
        this.opponent = data.opponent;
        this.onLocalMove = data.onLocalMove;
        this.onLocalAttack = data.onLocalAttack;

        this.destination = { ...this.localPlayer.position };
        this.opponentTargetPos = { ...this.opponent.position };

        // Translate stats to movement speed (match our React physics)
        this.localSpeedPxPerFrame = 2 + (this.localPlayer.stats.speed * 4);
    }

    preload() {
        // Load Base64 Strings as textures if available
        if (this.localPlayer.photoBase64) {
            this.load.image('localPlayerTex', this.localPlayer.photoBase64);
        }
        if (this.opponent.photoBase64) {
            this.load.image('opponentTex', this.opponent.photoBase64);
        }
    }

    create() {
        const { width, height } = this.scale;

        // Draw Arena Grid Background
        const bg = this.add.grid(width / 2, height / 2, width, height, 100, 100, 0x1e293b, 1, 0x334155, 0.5);

        // Graphics for the dashed line
        this.dottedLine = this.add.graphics();

        // Flag text for destination
        this.targetFlag = this.add.text(0, 0, '🚩', { fontSize: '32px' })
            .setOrigin(0.5, 1)
            .setVisible(false);

        // Create player sprites
        const localTex = this.textures.exists('localPlayerTex') ? 'localPlayerTex' : undefined;
        const oppTex = this.textures.exists('opponentTex') ? 'opponentTex' : undefined;

        this.opponentSprite = this.add.sprite(this.opponent.position.x, this.opponent.position.y, oppTex as string)
            .setDisplaySize(IMAGE_SIZE, IMAGE_SIZE)
            .setInteractive();

        this.localSprite = this.add.sprite(this.localPlayer.position.x, this.localPlayer.position.y, localTex as string)
            .setDisplaySize(IMAGE_SIZE, IMAGE_SIZE);

        // Circular outlines as borders
        this.localBorder = this.add.circle(this.localSprite.x, this.localSprite.y, (IMAGE_SIZE / 2) + 5, 0x10b981, 0.2)
            .setStrokeStyle(4, 0x10b981);
        
        this.opponentBorder = this.add.circle(this.opponentSprite.x, this.opponentSprite.y, (IMAGE_SIZE / 2) + 5, 0xef4444, 0.2)
            .setStrokeStyle(4, 0xef4444);

        // Depth ordering
        this.localBorder.setDepth(10);
        this.opponentBorder.setDepth(10);
        this.localSprite.setDepth(20);
        this.opponentSprite.setDepth(20);

        // Inputs for local movement
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.localSprite.x, this.localSprite.y);
            if (dist < IMAGE_SIZE / 2) {
                this.isDragging = true;
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                this.drawTrajectory(pointer.x, pointer.y);
                this.targetFlag.setPosition(pointer.x, pointer.y).setVisible(true);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                this.isDragging = false;
                // Clamp coordinates to specific limits if needed, here we use virtual boundaries
                this.destination = {
                    x: Phaser.Math.Clamp(pointer.x, 0, width),
                    y: Phaser.Math.Clamp(pointer.y, 0, height)
                };
                this.targetFlag.setPosition(this.destination.x, this.destination.y).setVisible(true);
            }
        });

        // Click Opponent to Attack
        this.opponentSprite.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation(); // Stop reaching the scene's pointerdown
            this.onLocalAttack(this.opponent.id);
            this.showDamageText(this.opponentSprite.x, this.opponentSprite.y, this.localPlayer.stats.damage > 0 ? this.localPlayer.stats.damage * 2 : 1);
        });

        // Sync local position to React roughly 30 times a second
        this.time.addEvent({
            delay: 30,
            callback: () => {
                this.onLocalMove({ x: this.localSprite.x, y: this.localSprite.y });
            },
            loop: true
        });
    }

    update() {
        // Move Local Player
        if (Phaser.Math.Distance.Between(this.localSprite.x, this.localSprite.y, this.destination.x, this.destination.y) > this.localSpeedPxPerFrame) {
            const angle = Phaser.Math.Angle.Between(this.localSprite.x, this.localSprite.y, this.destination.x, this.destination.y);
            this.localSprite.x += Math.cos(angle) * this.localSpeedPxPerFrame;
            this.localSprite.y += Math.sin(angle) * this.localSpeedPxPerFrame;
            if (!this.isDragging) {
                this.drawTrajectory(this.destination.x, this.destination.y);
            }
        } else {
            this.localSprite.x = this.destination.x;
            this.localSprite.y = this.destination.y;
            if (!this.isDragging) {
                this.dottedLine.clear();
                this.targetFlag.setVisible(false);
            }
        }

        // Sync Borders
        this.localBorder.setPosition(this.localSprite.x, this.localSprite.y);
        this.opponentBorder.setPosition(this.opponentSprite.x, this.opponentSprite.y);

        // Interpolate Opponent smoothly
        if (Phaser.Math.Distance.Between(this.opponentSprite.x, this.opponentSprite.y, this.opponentTargetPos.x, this.opponentTargetPos.y) > 2) {
            // Lerp is great for opponent smoothing since socket updates jump
            this.opponentSprite.x = Phaser.Math.Linear(this.opponentSprite.x, this.opponentTargetPos.x, 0.2);
            this.opponentSprite.y = Phaser.Math.Linear(this.opponentSprite.y, this.opponentTargetPos.y, 0.2);
        }
    }

    // Exposed to React to push new data
    public setOpponentPosition(x: number, y: number) {
        this.opponentTargetPos = { x, y };
    }

    public triggerDamageEffect() {
        // Shake: duration 150ms, intensity 0.01
        this.cameras.main.shake(150, 0.01);
        
        // Flash: duration 200ms, red color
        this.cameras.main.flash(200, 255, 0, 0);
    }

    // --- Helpers ---
    private drawTrajectory(targetX: number, targetY: number) {
        this.dottedLine.clear();
        this.dottedLine.lineStyle(2, 0x3b82f6, 1);

        // Simulating a dashed line in basic Phaser Graphics
        const dist = Phaser.Math.Distance.Between(this.localSprite.x, this.localSprite.y, targetX, targetY);
        const angle = Phaser.Math.Angle.Between(this.localSprite.x, this.localSprite.y, targetX, targetY);

        const gap = 15;
        let pDist = gap;
        while (pDist < dist) {
            const x1 = this.localSprite.x + Math.cos(angle) * pDist;
            const y1 = this.localSprite.y + Math.sin(angle) * pDist;
            pDist += gap / 2;
            const x2 = this.localSprite.x + Math.cos(angle) * pDist;
            const y2 = this.localSprite.y + Math.sin(angle) * pDist;

            this.dottedLine.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));
            pDist += gap;
        }
    }

    private showDamageText(x: number, y: number, damage: number) {
        // Red, bold, stroke text floating up randomly
        const xOffset = Phaser.Math.Between(-30, 30);
        const text = this.add.text(x + xOffset, y - 40, `-${damage}`, { fontSize: '28px', fontStyle: 'bold', color: '#ff0000', stroke: '#ffffff', strokeThickness: 4 })
            .setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }
}
