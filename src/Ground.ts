import { GameObject } from './Dino.js';
import { SpriteSheetManager } from './SpriteSheetManager.js';

export class Ground implements GameObject {
    x = 0;
    y = 350;
    width = 900;
    height = 50;
    private decorX = 0;
    private imageCache: Map<string, HTMLImageElement> = new Map();
    private imagesLoaded = false;

    constructor() {
        this.loadImages();
    }

    update(speed: number): void {
        this.x -= speed;
        if (this.x <= -70) { // Largeur d'un bloc de terre
            this.x = 0;
        }

        this.decorX -= speed * 0.5; // Défilement parallaxe pour le décor
        if (this.decorX <= -900) {
            this.decorX = 0;
        }
    }

    reset(): void {
        this.x = 0;
        this.decorX = 0;
    }

    private async loadImages(): Promise<void> {
        const imageConfigs = [
            { name: 'sky', path: 'assets/map/Backgrounds/tile_0001.png' },
            { name: 'cloud', path: 'assets/map/Tiles/tile_0000.png' },
            { name: 'hill', path: 'assets/map/Tiles/tile_0002.png' },
            { name: 'bush', path: 'assets/map/Tiles/tile_0003.png' },
            { name: 'groundTop', path: 'assets/map/Tiles/tile_0004.png' },
            { name: 'groundCenter', path: 'assets/map/Tiles/tile_0005.png' }
        ];

        try {
            for (const config of imageConfigs) {
                const img = new Image();
                img.src = config.path;
                await new Promise((resolve) => {
                    img.onload = () => {
                        this.imageCache.set(config.name, img);
                        resolve(null);
                    };
                    img.onerror = resolve;
                });
            }
            this.imagesLoaded = true;
        } catch (e) {
            console.log('Failed to load ground images');
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imagesLoaded) return;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        const tileSize = 70;

        // 0. Dessiner le ciel (fond complet)
        const skyImg = this.imageCache.get('sky');
        if (skyImg) {
            ctx.drawImage(skyImg, 0, 0, canvasWidth, canvasHeight);
        }

        // 1. Dessiner les nuages de fond
        const cloudImg = this.imageCache.get('cloud');
        if (cloudImg) {
            for (let i = 0; i < 2; i++) {
                ctx.drawImage(cloudImg, this.decorX * 0.2 + i * 900 + 200, 50, 120, 60);
                ctx.drawImage(cloudImg, this.decorX * 0.2 + i * 900 + 600, 120, 120, 60);
            }
        }

        // 2. Dessiner le décor de fond (Hills/Bushes)
        const hillImg = this.imageCache.get('hill');
        const bushImg = this.imageCache.get('bush');
        for (let i = 0; i < 2; i++) {
            if (hillImg) ctx.drawImage(hillImg, this.decorX + i * 900 + 100, this.y - 90, 180, 90);
            if (bushImg) ctx.drawImage(bushImg, this.decorX + i * 900 + 500, this.y - 60, 60, 60);
        }

        // 3. Dessiner les tuiles du sol
        const groundTopImg = this.imageCache.get('groundTop');
        const groundCenterImg = this.imageCache.get('groundCenter');
        if (groundTopImg && groundCenterImg) {
            for (let i = this.x; i < canvasWidth + tileSize; i += tileSize) {
                ctx.drawImage(groundTopImg, i, this.y, tileSize, tileSize);
                for (let y = this.y + tileSize; y < canvasHeight; y += tileSize) {
                    ctx.drawImage(groundCenterImg, i, y, tileSize, tileSize);
                }
            }
        }
    }
}
