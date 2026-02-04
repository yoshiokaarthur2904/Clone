import Phaser from 'phaser';
import './style.css';

enum PlayerState {
    IDLE,
    WALK,
    RUN,
    ATTACK,
    EAT,
    DEFEND
}

// Define Tile Constants matching actual PNG order
enum Tiles {
    GRASS = 0,
    GRASS_VAR = 1,
    DIRT = 2,
    SOIL = 3,
    EMPTY = 4,
    WOOD = 5,
    STONE = 6,
    WATER = 7
}

export class MainScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;
    private playerState: PlayerState = PlayerState.IDLE;
    private lastFacingDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 1); // Default down
    private selectionCursor!: Phaser.GameObjects.Graphics;
    private npcs: Phaser.Physics.Arcade.Sprite[] = [];

    constructor() {
        super('MainScene');
    }

    preload() {
        // Load player sprite
        this.load.spritesheet('player', 'assets/player_backup.png', {
            frameWidth: 256,
            frameHeight: 256
        });

        // Load tileset (8 tiles in a row, each 32x32)
        // Using v4 with cache buster
        const timestamp = Date.now();
        this.load.spritesheet('tiles', `assets/tiles_v4.png?v=${timestamp}`, {
            frameWidth: 32,
            frameHeight: 32
        });
    }

    create() {
        // Create tilemap - 50x50 tiles at 32px each = 1600x1600 world
        const mapWidth = 50;
        const mapHeight = 50;
        const tileSize = 32;

        // Generate map data with different terrain types
        const mapData: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            mapData[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                let tile = Tiles.GRASS; // Default grass

                // Water patches (Using Tiles.WATER = 7)
                if ((x > 10 && x < 15 && y > 10 && y < 20) ||
                    (x > 35 && x < 42 && y > 25 && y < 35)) {
                    tile = Tiles.WATER;
                }
                // Farmable soil area
                else if (x > 5 && x < 20 && y > 30 && y < 45) {
                    tile = Tiles.SOIL;
                }
                // Dirt paths
                else if (y === 25 || x === 25) {
                    tile = Tiles.DIRT;
                }
                // Stone path
                else if ((x > 20 && x < 30 && y > 5 && y < 10)) {
                    tile = Tiles.STONE;
                }
                // Grass variations
                else {
                    tile = Math.random() > 0.7 ? Tiles.GRASS_VAR : Tiles.GRASS;
                }

                mapData[y][x] = tile;
            }
        }

        // Create tilemap
        const map = this.make.tilemap({
            data: mapData,
            tileWidth: tileSize,
            tileHeight: tileSize
        });

        const tileset = map.addTilesetImage('tiles', 'tiles', tileSize, tileSize);
        const layer = map.createLayer(0, tileset!, 0, 0);

        // Set collision for water tiles using constant
        layer?.setCollision([Tiles.WATER]);

        // Set world bounds
        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

        // Create player
        this.player = this.physics.add.sprite(400, 300, 'player', 0);
        this.player.setScale(0.25);
        this.player.setDepth(10); // Ensure player renders above tiles

        // Add collision between player and layer
        this.physics.add.collider(this.player, layer!);

        if (this.player.body) {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            body.setCollideWorldBounds(true);
            body.setSize(100, 100);
            body.setOffset(78, 78);
        }

        // Create NPCs
        const npcData = [
            { x: 600, y: 400, tint: 0xffff00, name: 'Yellow NPC' },
            { x: 800, y: 600, tint: 0x00ffff, name: 'Cyan NPC' },
            { x: 1000, y: 800, tint: 0xff00ff, name: 'Pink NPC' }
        ];

        npcData.forEach((data) => {
            const npc = this.physics.add.sprite(data.x, data.y, 'player', 0);
            npc.setScale(0.25);
            npc.setTint(data.tint);
            npc.setDepth(10);
            npc.setData('name', data.name);
            npc.setData('moveTimer', 0);
            npc.setData('idleTimer', 0);

            if (npc.body) {
                const body = npc.body as Phaser.Physics.Arcade.Body;
                body.setCollideWorldBounds(true);
                body.setSize(100, 100);
                body.setOffset(78, 78);
            }

            this.npcs.push(npc);

            // Add collision between NPC and layer
            this.physics.add.collider(npc, layer!);
        });

        // Add collision between NPCs
        this.physics.add.collider(this.npcs, this.npcs);

        // Add collision between player and NPCs
        this.physics.add.collider(this.player, this.npcs);

        // Camera follow
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
        this.cameras.main.setZoom(2);

        // Animations
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'side',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            eat: Phaser.Input.Keyboard.KeyCodes.E
        });

        // UI Text
        this.add.text(10, 10, 'WASD: Move | Shift: Run | E: Eat | L-Click: Attack | R-Click: Defend', {
            fontSize: '16px',
            color: '#ffffff'
        }).setScrollFactor(0).setDepth(100);

        // Selection Cursor
        this.selectionCursor = this.add.graphics();
        this.selectionCursor.lineStyle(2, 0xffffff, 0.5);
        this.selectionCursor.strokeRect(0, 0, 32, 32);
        this.selectionCursor.setDepth(90);

        // Input Listeners
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
                this.performAttack();
            } else if (pointer.rightButtonDown()) {
                this.performDefend();
            }
        });

        // Force disable smoothing on context (if using Canvas renderer)
        const ctx = this.game.canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
        }

        // Round camera position to prevent sub-pixel blurring
        this.cameras.main.roundPixels = true;

        // DEBUG: Rendering valid tiles (0-7) for verification
        for (let i = 0; i < 8; i++) {
            this.add.image(
                40 + (i % 16) * 36,
                40 + Math.floor(i / 16) * 36,
                'tiles',
                i
            ).setScale(2).setScrollFactor(0).setDepth(200);
        }
    }

    update() {
        if (!this.cursors || !this.player.body) return;

        // Block movement if performing an action
        if (this.playerState === PlayerState.ATTACK || this.playerState === PlayerState.EAT || this.playerState === PlayerState.DEFEND) {
            // Check if animation is done, else return
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            return;
        }

        // Check for eat action (E key)
        if (Phaser.Input.Keyboard.JustDown(this.wasd.eat)) {
            this.performEat();
            return;
        }

        const baseSpeed = 200;
        const isRunning = this.cursors.shift?.isDown;
        const speed = isRunning ? baseSpeed * 1.75 : baseSpeed;

        // Update State based on movement
        this.playerState = isRunning ? PlayerState.RUN : PlayerState.WALK;

        const verticalSpeed = speed * 0.95;
        const body = this.player.body as Phaser.Physics.Arcade.Body;

        let moveX = 0;
        let moveY = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            moveX = 1;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            moveY = 1;
        }

        // Normalize diagonal movement
        const direction = new Phaser.Math.Vector2(moveX, moveY).normalize();
        body.setVelocity(direction.x * speed, direction.y * verticalSpeed);

        // Play animations
        if (moveX !== 0 || moveY !== 0) {
            // Update facing direction
            if (moveX !== 0 && moveY !== 0) {
                // Prioritize vertical facing if diagonal, or just keep it simple
                this.lastFacingDirection.set(moveX, moveY).normalize();
            } else {
                this.lastFacingDirection.set(moveX, moveY).normalize();
            }

            if (Math.abs(moveY) > Math.abs(moveX)) {
                // Vertical movement takes priority
                if (moveY < 0) {
                    this.player.play('up', true);
                } else {
                    this.player.play('down', true);
                }
            } else {
                // Horizontal movement
                this.player.play('side', true);
                // Flip sprite based on direction using raw moveX
                this.player.setFlipX(moveX < 0);
            }
        } else {
            this.player.anims.stop();
            this.playerState = PlayerState.IDLE;
        }

        // Update selection cursor position
        const tileSize = 32;
        const playerCenter = this.player.getCenter();
        const pointer = this.input.activePointer;
        const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

        // Calculate vector from player to mouse
        const toMouse = worldPoint.clone().subtract(playerCenter);
        const distance = toMouse.length();

        // Normalize for dot product
        toMouse.normalize();

        // Check angle: dot product >= 0.5 (cos 60deg) -> +/- 60deg -> 120deg Field of View
        const dot = this.lastFacingDirection.dot(toMouse);

        // Check range: < 50 pixels (allows reaching center of adjacent tile, which is 32px away)
        if (dot >= 0.5 && distance < 50) {
            this.selectionCursor.setVisible(true);

            // Snap to grid
            const cursorX = Math.floor(worldPoint.x / tileSize) * tileSize;
            const cursorY = Math.floor(worldPoint.y / tileSize) * tileSize;

            this.selectionCursor.setPosition(cursorX, cursorY);
        } else {
            this.selectionCursor.setVisible(false);
        }

        // Update NPCs
        this.npcs.forEach((npc) => {
            if (!npc.body) return;

            const body = npc.body as Phaser.Physics.Arcade.Body;
            const moveTimer = npc.getData('moveTimer') || 0;
            const currentTime = this.time.now;

            // Check if NPC should change direction
            if (currentTime > moveTimer) {
                // Random chance to idle or move
                if (Math.random() > 0.3) {
                    // Move in random direction
                    const directions = [
                        { x: -1, y: 0 },  // Left
                        { x: 1, y: 0 },   // Right
                        { x: 0, y: -1 },  // Up
                        { x: 0, y: 1 },   // Down
                        { x: 0, y: 0 }    // Idle
                    ];

                    const direction = Phaser.Utils.Array.GetRandom(directions);
                    const speed = 80;

                    body.setVelocity(direction.x * speed, direction.y * speed);

                    // Play animation based on direction
                    if (direction.x !== 0 || direction.y !== 0) {
                        if (Math.abs(direction.y) > Math.abs(direction.x)) {
                            npc.play(direction.y < 0 ? 'up' : 'down', true);
                        } else if (direction.x !== 0) {
                            npc.play('side', true);
                            npc.setFlipX(direction.x < 0);
                        }
                    } else {
                        npc.anims.stop();
                    }
                } else {
                    // Idle
                    body.setVelocity(0, 0);
                    npc.anims.stop();
                }

                // Set next move time (2-4 seconds)
                npc.setData('moveTimer', currentTime + Phaser.Math.Between(2000, 4000));
            }

            // Update depth based on Y position for proper layering
            npc.setDepth(10 + npc.y / 10000);
        });

        // Update player depth
        this.player.setDepth(10 + this.player.y / 10000);
    }

    private performAttack() {
        if (this.playerState === PlayerState.ATTACK || this.playerState === PlayerState.EAT || this.playerState === PlayerState.DEFEND) return;

        // Only attack if cursor is visible (valid target)
        if (!this.selectionCursor.visible) return;

        // Set state to attack
        this.playerState = PlayerState.ATTACK;
        this.player.body!.velocity.set(0, 0);

        // Visual feedback (flash red)
        this.player.setTint(0xff0000);

        // Create temporary hitbox at cursor position
        const hitbox = this.add.rectangle(
            this.selectionCursor.x + 16,
            this.selectionCursor.y + 16,
            32, 32,
            0xff0000, 0.3
        ).setDepth(100);

        // Reset after 300ms
        this.time.delayedCall(300, () => {
            this.player.clearTint();
            this.playerState = PlayerState.IDLE;
            hitbox.destroy();
        });
    }

    private performEat() {
        if (this.playerState === PlayerState.ATTACK || this.playerState === PlayerState.EAT || this.playerState === PlayerState.DEFEND) return;

        // Set state to eat
        this.playerState = PlayerState.EAT;
        this.player.body!.velocity.set(0, 0);

        // Visual feedback (flash green)
        this.player.setTint(0x00ff00);

        // Reset after 500ms
        this.time.delayedCall(500, () => {
            this.player.clearTint();
            this.playerState = PlayerState.IDLE;
        });
    }

    private performDefend() {
        if (this.playerState === PlayerState.ATTACK || this.playerState === PlayerState.EAT || this.playerState === PlayerState.DEFEND) return;

        // Set state to defend
        this.playerState = PlayerState.DEFEND;
        this.player.body!.velocity.set(0, 0);

        // Visual feedback (flash blue)
        this.player.setTint(0x0000ff);

        // Create shield visual effect around player
        const shield = this.add.circle(
            this.player.x,
            this.player.y,
            40,
            0x0000ff,
            0.3
        ).setDepth(9);

        // Reset after 400ms
        this.time.delayedCall(400, () => {
            this.player.clearTint();
            this.playerState = PlayerState.IDLE;
            shield.destroy();
        });
    }
}

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: '100%',
        height: '100%'
    },
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [MainScene],
};

new Phaser.Game(config);
