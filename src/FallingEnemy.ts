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
    private imagesLoaded = false;
    private image: HTMLImageElement | null = null;
    private state: 'idle' | 'falling' | 'resting' = 'idle';

    constructor(x: number, y: number, groundY: number) {
        this.x = x;
        this.y = -100; // Start off-screen
        this.initialY = -100;
        this.targetY = groundY - 60;
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        this.image = new Image();
        this.image.src = 'assets/enemies/tombe/bloc/block_fall.png';
        await new Promise((resolve) => {
            this.image!.onload = resolve;
            this.image!.onerror = resolve;
        });
        this.imagesLoaded = this.image.complete && this.image.naturalWidth > 0;
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

            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.fallSpeed *= this.bounce;
                
                if (Math.abs(this.fallSpeed) < 1) {
                    this.state = 'resting';
                    this.fallSpeed = 0;
                    if (this.image) this.image.src = 'assets/enemies/tombe/bloc/block_rest.png';
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
