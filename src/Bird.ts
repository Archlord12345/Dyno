import { GameObject } from './Dino.js';

export class Bird implements GameObject {
    x: number;
    y: number;
    width = 60;
    height = 60;
    private wingFrame = 0;
    private frameTimer = 0;
    private imagesLoaded = false;
    private imageCache: HTMLImageElement[] = [];
    private birdType: 'mouche' | 'bee';

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.birdType = Math.random() > 0.5 ? 'mouche' : 'bee';
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        const path = this.birdType === 'mouche' ? 'assets/enemies/airs/mouche/fly' : 'assets/enemies/airs/bee/bee';
        const frames = ['_a.png', '_b.png'];
        
        for (const frame of frames) {
            const img = new Image();
            img.src = `${path}${frame}`;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            this.imageCache.push(img);
        }
        this.imagesLoaded = this.imageCache.every(img => img.complete && img.naturalWidth > 0);
    }

    update(speed: number): void {
        this.x -= speed * 1.2; // Les oiseaux vont un peu plus vite
        this.frameTimer++;
        if (this.frameTimer > 8) {
            this.wingFrame = (this.wingFrame + 1) % 2;
            this.frameTimer = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.imagesLoaded && this.imageCache[this.wingFrame]) {
            ctx.drawImage(this.imageCache[this.wingFrame] as HTMLImageElement, this.x, this.y, this.width, this.height);
        } else {
            this.drawFallback(ctx);
        }
    }

    private drawFallback(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.birdType === 'mouche' ? '#2F4F4F' : '#FFD700';
        // Corps
        ctx.fillRect(this.x + 15, this.y + 20, 30, 20);
        // Ailes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        if (this.wingFrame === 0) {
            ctx.fillRect(this.x + 5, this.y + 15, 20, 10);
            ctx.fillRect(this.x + 35, this.y + 15, 20, 10);
        } else {
            ctx.fillRect(this.x + 5, this.y + 25, 20, 10);
            ctx.fillRect(this.x + 35, this.y + 25, 20, 10);
        }
    }
}

