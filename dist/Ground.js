import { ZoneManager } from './ZoneManager.js';
export class Ground {
    x = 0;
    groundImages = new Map();
    loaded = false;
    zoneManager;
    constructor() {
        this.zoneManager = ZoneManager.getInstance();
        this.loadImages();
    }
    async loadImages() {
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
    update(speed) {
        this.x -= speed;
    }
    draw(ctx) {
        if (!this.loaded)
            return;
        const currentZone = this.zoneManager.getCurrentZone();
        const groundPath = currentZone.ground;
        const img = this.groundImages.get(groundPath);
        if (!img)
            return;
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
    reset() {
        this.x = 0;
    }
}
//# sourceMappingURL=Ground.js.map