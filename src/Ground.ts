import { ZoneManager } from './ZoneManager.js';

export class Ground {
    private x = 0;
    private groundImages: Map<string, HTMLImageElement> = new Map();
    private loaded = false;
    private zoneManager: ZoneManager;

    constructor() {
        this.zoneManager = ZoneManager.getInstance();
        this.loadImages();
    }

    private async loadImages(): Promise<void> {
        const grounds = [
            'assets/map/sol/white_zone.svg',
            'assets/map/sol/green_zone.svg',
            'assets/map/sol/orange_zone.svg'
        ];

        for (const path of grounds) {
            const img = new Image();
            img.src = path;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            this.groundImages.set(path, img);
        }
        this.loaded = true;
    }

    update(speed: number): void {
        this.x -= speed;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.loaded) return;

        const currentZone = this.zoneManager.getCurrentZone();
        const groundPath = currentZone.ground;
        const img = this.groundImages.get(groundPath);

        if (!img) return;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const groundHeight = 64; // Hauteur standard du sol
        const groundY = canvasHeight - groundHeight;

        // On dessine le sol en boucle
        const imgWidth = img.naturalWidth || 64;
        const startX = this.x % imgWidth;

        for (let i = startX - imgWidth; i < canvasWidth + imgWidth; i += imgWidth) {
            ctx.drawImage(img, i, groundY, imgWidth, groundHeight);
        }
    }

    reset(): void {
        this.x = 0;
    }
}
