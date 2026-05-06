import { GameObject } from './Dino.js';

export class FallingEnemy implements GameObject {
    x: number;
    y: number;
    width = 60;
    height = 60;
    private initialY: number;
    private targetY: number;
    private isFalling = false;
    private fallSpeed = 0;
    private gravity = 0.5;
    private bounce = -0.3;
    private images: Map<string, HTMLImageElement> = new Map();
    private image: HTMLImageElement | null = null;
    private imagesLoaded = false;
    private state: 'idle' | 'falling' | 'resting' = 'idle';

    constructor(x: number, y: number, groundY: number) {
        this.x = x;
        this.y = -100; // Start off-screen
        this.initialY = -100;
        this.targetY = groundY; // Sera ajusté avec la hauteur
        this.loadSprites();
    }

    private async asyncLoadImage(src: string): Promise<HTMLImageElement> {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        return img;
    }

    private async loadSprites(): Promise<void> {
        try {
            const fallImg = await this.asyncLoadImage('assets/enemies/tombe/bloc/block_fall.png');
            const restImg = await this.asyncLoadImage('assets/enemies/tombe/bloc/block_rest.png');
            
            this.images.set('falling', fallImg);
            this.images.set('resting', restImg);
            
            this.image = fallImg;
            this.imagesLoaded = true;
        } catch (e) {
            console.log('Failed to load FallingEnemy sprites');
        }
    }

    update(speed: number): void {
        this.x -= speed;

        // Trigger fall when close to player (player is around x=80)
        if (this.state === 'idle' && this.x < 500) {
            this.state = 'falling';
        }

        if (this.state === 'falling') {
            this.fallSpeed += this.gravity;
            this.y += this.fallSpeed;

            // Ajuster targetY selon la hauteur actuelle
            const actualTargetY = this.targetY - this.height;

            if (this.y >= actualTargetY) {
                this.y = actualTargetY;
                this.fallSpeed *= this.bounce;
                
                if (Math.abs(this.fallSpeed) < 1) {
                    this.state = 'resting';
                    this.fallSpeed = 0;
                    this.image = this.images.get('resting') || this.image;
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.imagesLoaded && this.image) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, Math.floor(this.x), Math.floor(this.y), this.width, this.height);
            ctx.imageSmoothingEnabled = true;
        } else {
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
