import { GameObject } from './Dino.js';

export class Enemy implements GameObject {
    x: number;
    y: number;
    width = 60;
    height = 60;
    private enemyType: 'frog' | 'ladybug' | 'souris' | 'zombie';
    private animationFrame = 0;
    private animationTimer = 0;
    private sprites: { [key: string]: string[] } = {};
    private imagesLoaded = false;
    private currentAnimation = 'walk';
    private imageCache: Map<string, HTMLImageElement> = new Map();

    private isJumping = false;
    private jumpTimer = 0;
    private readonly JUMP_DURATION = 24; // ~0.4s at 60fps
    private initialY: number;

    constructor(x: number, y: number, type: 'frog' | 'ladybug' | 'souris' | 'zombie' = 'frog') {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.enemyType = type;
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        try {
            if (this.enemyType === 'frog') {
                this.sprites.walk = ['frog_jump'];
                this.sprites.idle = ['frog_idle'];
            } else if (this.enemyType === 'ladybug') {
                this.sprites.walk = ['ladybug_walk_a', 'ladybug_walk_b'];
                this.sprites.idle = ['ladybug_idle'];
            } else if (this.enemyType === 'souris') {
                this.sprites.walk = ['mouse_walk_a', 'mouse_walk_b'];
                this.sprites.idle = ['souris_idle'];
            } else if (this.enemyType === 'zombie') {
                this.sprites.walk = ['zombie_walk1', 'zombie_walk2'];
                this.sprites.idle = ['zombie_idle'];
            }
            
            const spritePaths = [];
            if (this.enemyType === 'frog') {
                spritePaths.push(
                    'assets/enemies/sol/frog/frog_idle.png',
                    'assets/enemies/sol/frog/frog_jump.png'
                );
            } else if (this.enemyType === 'ladybug') {
                spritePaths.push(
                    'assets/enemies/sol/ladybug/ladybug_idle.png',
                    'assets/enemies/sol/ladybug/ladybug_walk_a.png',
                    'assets/enemies/sol/ladybug/ladybug_walk_b.png'
                );
            } else if (this.enemyType === 'souris') {
                spritePaths.push(
                    'assets/enemies/sol/souris/souris_idle.png',
                    'assets/enemies/sol/souris/mouse_walk_a.png',
                    'assets/enemies/sol/souris/mouse_walk_b.png'
                );
            } else if (this.enemyType === 'zombie') {
                spritePaths.push(
                    'assets/enemies/sol/Zombie/Poses/zombie_idle.png',
                    'assets/enemies/sol/Zombie/Poses/zombie_walk1.png',
                    'assets/enemies/sol/Zombie/Poses/zombie_walk2.png'
                );
            }

            for (const path of spritePaths) {
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                const key = path.split('/').pop()?.replace('.png', '') || '';
                this.imageCache.set(path, img);
            }
            
            this.imagesLoaded = true;
        } catch (e) {
            console.log(`Failed to load ${this.enemyType} sprites:`, e);
        }
    }

    update(speed: number): void {
        this.x -= speed;
        
        if (this.enemyType === 'frog') {
            if (!this.isJumping && Math.random() < 0.01) {
                this.isJumping = true;
                this.jumpTimer = 0;
            }

            if (this.isJumping) {
                this.jumpTimer++;
                const progress = this.jumpTimer / this.JUMP_DURATION;
                if (progress <= 1) {
                    const jumpHeight = Math.sin(progress * Math.PI) * 70;
                    this.y = this.initialY - jumpHeight;
                    this.currentAnimation = 'walk'; 
                } else {
                    this.isJumping = false;
                    this.y = this.initialY;
                    this.currentAnimation = 'idle';
                }
            }
        }

        if (this.imagesLoaded) {
            this.animationTimer++;
            const animSpeed = this.isJumping ? 4 : 12;
            if (this.animationTimer > animSpeed) {
                const frames = this.sprites[this.currentAnimation];
                if (frames) {
                    this.animationFrame = (this.animationFrame + 1) % frames.length;
                }
                this.animationTimer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imagesLoaded || !this.sprites[this.currentAnimation]) {
            this.drawFallback(ctx);
            return;
        }

        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && currentSprites[this.animationFrame]) {
            const spriteName = currentSprites[this.animationFrame];
            let imgPath = `assets/enemies/sol/${this.enemyType}/${spriteName}.png`;
            
            if (this.enemyType === 'zombie') {
                imgPath = `assets/enemies/sol/Zombie/Poses/${spriteName}.png`;
            }
            
            let img = this.imageCache.get(imgPath);
            
            if (!img) {
                img = new Image();
                img.src = imgPath;
                this.imageCache.set(imgPath, img);
            }
            
            if (img.complete && img.naturalWidth > 0) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, Math.floor(this.x), Math.floor(this.y), this.width, this.height);
                ctx.imageSmoothingEnabled = true;
            } else {
                this.drawFallback(ctx);
            }
            return;
        }
        this.drawFallback(ctx);
    }

    private drawFallback(ctx: CanvasRenderingContext2D): void {
        if (this.enemyType === 'frog') {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x + 10, this.y + 10, 40, 30);
        } else if (this.enemyType === 'ladybug') {
            ctx.fillStyle = '#F44336';
            ctx.fillRect(this.x + 15, this.y + 15, 30, 30);
        } else if (this.enemyType === 'zombie') {
            ctx.fillStyle = '#7B904B'; // Vert zombie
            ctx.fillRect(this.x + 10, this.y, 40, 60);
        } else {
            ctx.fillStyle = '#795548';
            ctx.fillRect(this.x + 10, this.y + 20, 40, 20);
        }
    }
}
