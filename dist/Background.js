import { ZoneManager } from './ZoneManager.js';
export class Background {
    tileImages = new Map();
    houseImages = new Map();
    loaded = false;
    canvasWidth;
    canvasHeight;
    zoneManager;
    offsetX = 0;
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoneManager = ZoneManager.getInstance();
        this.loadBackground();
    }
    async loadBackground() {
        try {
            const currentZone = this.zoneManager.getCurrentZone();
            const allPaths = [
                ...currentZone.background.head,
                ...currentZone.background.body,
                ...currentZone.background.foot
            ];
            for (const path of allPaths) {
                if (this.tileImages.has(path))
                    continue;
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                this.tileImages.set(path, img);
            }
            this.loaded = true;
        }
        catch (e) {
            console.log('Failed to load background:', e);
        }
    }
    draw(ctx) {
        if (!this.loaded) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            return;
        }
        const currentZone = this.zoneManager.getCurrentZone();
        const tileSize = 64;
        const bgSpeed = 0.5;
        ctx.imageSmoothingEnabled = false;
        const headPath = currentZone.background.head[0];
        const bodyPath = currentZone.background.body[0];
        const headImg = headPath ? this.tileImages.get(headPath) : undefined;
        const bodyImg = bodyPath ? this.tileImages.get(bodyPath) : undefined;
        const footTiles = currentZone.background.foot;
        const startX = -(this.offsetX * bgSpeed) % (tileSize * footTiles.length);
        for (let x = startX - tileSize; x < this.canvasWidth + tileSize; x += tileSize) {
            const tileIndex = Math.floor(Math.abs((x - startX) / tileSize)) % footTiles.length;
            const footPath = footTiles[tileIndex];
            const footImg = footPath ? this.tileImages.get(footPath) : undefined;
            if (headImg)
                ctx.drawImage(headImg, x, 0, tileSize, tileSize);
            if (bodyImg) {
                for (let y = tileSize; y < this.canvasHeight - tileSize; y += tileSize) {
                    ctx.drawImage(bodyImg, x, y, tileSize, tileSize);
                }
            }
            if (footImg)
                ctx.drawImage(footImg, x, this.canvasHeight - tileSize, tileSize, tileSize);
        }
        ctx.imageSmoothingEnabled = true;
    }
    update(speed) {
        if (this.loaded) {
            this.offsetX += speed;
        }
    }
    updateZone() {
        this.loadBackground();
    }
}
//# sourceMappingURL=Background.js.map