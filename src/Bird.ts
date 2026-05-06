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
    private birdType: 'mouche' | 'bee' | 'ovnie';
    private ovnieColor: string = 'Blue';

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const rand = Math.random();
        if (rand < 0.4) this.birdType = 'mouche';
        else if (rand < 0.8) this.birdType = 'bee';
        else this.birdType = 'ovnie';

        if (this.birdType === 'ovnie') {
            const colors = ['Beige', 'Blue', 'Green', 'Pink', 'Yellow'];
            this.ovnieColor = colors[Math.floor(Math.random() * colors.length)]!;
        }
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        if (this.birdType === 'ovnie') {
            const img = new Image();
            img.src = `assets/enemies/airs/ovnie/ship${this.ovnieColor}_manned.png`;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            this.imageCache.push(img);
        } else {
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
        }
        this.imagesLoaded = this.imageCache.every(img => img.complete && img.naturalWidth > 0);
    }

    update(speed: number): void {
        this.x -= speed * 1.2; // Les ennemis aériens vont un peu plus vite

        if (this.birdType !== 'ovnie') {
            this.frameTimer++;
            if (this.frameTimer > 8) {
                this.wingFrame = (this.wingFrame + 1) % 2;
                this.frameTimer = 0;
            }
        } else {
            // Flottement pour l'OVNI
            this.y += Math.sin(Date.now() / 200) * 0.5;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.imagesLoaded && this.imageCache[this.wingFrame]) {
            const img = this.imageCache[this.wingFrame]!;
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    }
}

