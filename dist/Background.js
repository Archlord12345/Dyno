import { ZoneManager } from './ZoneManager.js';
export class Background {
    tileImages = new Map();
    loaded = false;
    zoneManager;
    offsetX = 0;
    constructor() {
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
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        if (!this.loaded)
            return;
        const currentZone = this.zoneManager.getCurrentZone();
        const tileSize = 64;
        const bgSpeed = 0.5;
        ctx.imageSmoothingEnabled = false;
        const headPath = currentZone.background.head[0];
        const bodyPath = currentZone.background.body[0];
        const headImg = headPath ? this.tileImages.get(headPath) : undefined;
        const bodyImg = bodyPath ? this.tileImages.get(bodyPath) : undefined;
        const startX = -(this.offsetX * bgSpeed) % tileSize;
        for (let x = startX - tileSize; x < canvasWidth + tileSize; x += tileSize) {
            if (headImg)
                ctx.drawImage(headImg, x, 0, tileSize, tileSize);
            if (bodyImg) {
                for (let y = tileSize; y < canvasHeight - tileSize; y += tileSize) {
                    ctx.drawImage(bodyImg, x, y, tileSize, tileSize);
                }
            }
        }
        ctx.imageSmoothingEnabled = true;
    }
    drawFoot(ctx) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        if (!this.loaded)
            return;
        const currentZone = this.zoneManager.getCurrentZone();
        const tileSize = 64;
        const footTiles = currentZone.background.foot;
        const bgSpeed = 0.7;
        ctx.imageSmoothingEnabled = false;
        const patternWidth = tileSize * footTiles.length;
        const startX = -(this.offsetX * bgSpeed) % patternWidth;
        const groundY = canvasHeight - 64;
        for (let x = startX - patternWidth; x < canvasWidth + patternWidth; x += tileSize) {
            const index = Math.floor(Math.abs((x - startX) / tileSize)) % footTiles.length;
            const footPath = footTiles[index];
            const img = footPath ? this.tileImages.get(footPath) : undefined;
            if (img) {
                // On dessine le pied (herbe/décor) juste AU DESSUS du niveau du sol
                // pour qu'il soit visible derrière le joueur
                ctx.drawImage(img, x, groundY - 32, tileSize, tileSize);
            }
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