import { GameObject } from './Dino.js';

export class Enemy implements GameObject {
    x: number;
    y: number;
    width = 60;
    height = 60;
    public enemyType: 'ladybug' | 'souris' | 'zombie' | 'cars' | 'ufo' | 'platform';
    private animationFrame = 0;
    private animationTimer = 0;
    public sprites: { [key: string]: string[] } = {};
    private imagesLoaded = false;
    private currentAnimation = 'walk';
    public imageCache: Map<string, HTMLImageElement> = new Map();

    private isJumping = false;
    private jumpTimer = 0;
    private readonly JUMP_DURATION = 24;
    private initialY: number;

    constructor(x: number, y: number, type: 'ladybug' | 'souris' | 'zombie' | 'cars' | 'ufo' | 'platform' = 'ladybug') {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.enemyType = type;
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        try {
            if (this.enemyType === 'ladybug') {
                this.sprites.walk = ['ladybug_walk_a', 'ladybug_walk_b'];
                this.sprites.idle = ['ladybug_idle'];
            } else if (this.enemyType === 'souris') {
                this.sprites.walk = ['souris_walk_a', 'souris_walk_b'];
                this.sprites.idle = ['souris_idle'];
            } else if (this.enemyType === 'zombie') {
                this.sprites.walk = ['zombie_walk_a', 'zombie_walk_b'];
                this.sprites.idle = ['zombie_idle'];
            } else if (this.enemyType === 'ufo' || this.enemyType === 'cars' || this.enemyType === 'platform') {
                this.imagesLoaded = true;
                return;
            }
            
            const spritePaths = [];
            if (this.enemyType === 'ladybug') {
                spritePaths.push(
                    'assets/enemies/sol/ladybug/ladybug_idle.png',
                    'assets/enemies/sol/ladybug/ladybug_walk_a.png',
                    'assets/enemies/sol/ladybug/ladybug_walk_b.png'
                );
            } else if (this.enemyType === 'souris') {
                spritePaths.push(
                    'assets/enemies/sol/souris/souris_idle.png',
                    'assets/enemies/sol/souris/souris_walk_a.png',
                    'assets/enemies/sol/souris/souris_walk_b.png'
                );
            } else if (this.enemyType === 'zombie') {
                spritePaths.push(
                    'assets/enemies/sol/zombie/zombie_idle.png',
                    'assets/enemies/sol/zombie/zombie_walk_a.png',
                    'assets/enemies/sol/zombie/zombie_walk_b.png'
                );
            }

            for (const path of spritePaths) {
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                const name = path.split('/').pop()?.replace('.png', '') || '';
                this.imageCache.set(name, img);
            }
            this.imagesLoaded = true;
        } catch (e) {
            console.log('Failed to load enemy sprites:', e);
        }
    }

    update(speed: number): void {
        this.x -= speed;

        if (this.enemyType === 'ufo') {
            this.y = this.initialY + Math.sin(Date.now() / 200) * 20;
        }

        if ((this.enemyType === 'ladybug' || this.enemyType === 'souris') && !this.isJumping && Math.random() < 0.01) {
            this.isJumping = true;
            this.jumpTimer = 0;
        }

        if (this.isJumping) {
            this.jumpTimer++;
            const jumpHeight = 50;
            this.y = this.initialY - Math.sin((this.jumpTimer / this.JUMP_DURATION) * Math.PI) * jumpHeight;
            if (this.jumpTimer >= this.JUMP_DURATION) {
                this.isJumping = false;
                this.y = this.initialY;
            }
        }

        this.animationTimer++;
        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && currentSprites.length > 1) {
            if (this.animationTimer > 10) {
                this.animationFrame = (this.animationFrame + 1) % currentSprites.length;
                this.animationTimer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imagesLoaded) return;

        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && currentSprites[this.animationFrame]) {
            const spriteName = currentSprites[this.animationFrame];
            if (!spriteName) return;
            const img = this.imageCache.get(spriteName);
            // Vérification robuste pour éviter InvalidStateError (broken images)
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, Math.floor(this.x), Math.floor(this.y), this.width, this.height);
                ctx.imageSmoothingEnabled = true;
            }
        }
    }
}
