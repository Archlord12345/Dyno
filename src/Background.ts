import { ZoneManager, House } from './ZoneManager.js';

export class Background {
    private backgroundImage: HTMLImageElement | null = null;
    private tileImages: Map<string, HTMLImageElement> = new Map();
    private houseImages: Map<string, HTMLImageElement> = new Map();
    private loaded = false;
    private canvasWidth: number;
    private canvasHeight: number;
    private zoneManager: ZoneManager;
    private offsetX = 0;

    constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.zoneManager = ZoneManager.getInstance();
        this.loadBackground();
    }

    private async loadBackground(): Promise<void> {
        try {
            const currentZone = this.zoneManager.getCurrentZone();
            const bgImg = new Image();
            bgImg.src = currentZone.backgroundTile;
            
            await new Promise((resolve) => {
                bgImg.onload = resolve;
                bgImg.onerror = resolve;
            });
            this.backgroundImage = bgImg;

            const tilePaths = [
                'assets/map/Tiles/tile_0000.png',
                'assets/map/Tiles/tile_0001.png',
                'assets/map/Tiles/tile_0002.png',
                'assets/map/Tiles/tile_0003.png',
                'assets/map/Tiles/tile_0004.png'
            ];

            for (const path of tilePaths) {
                if (this.tileImages.has(path)) continue;
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                this.tileImages.set(path, img);
            }

            await this.loadHouseSprites();
            this.loaded = true;
        } catch (e) {
            console.log('Failed to load background:', e);
        }
    }

    private async loadHouseSprites(): Promise<void> {
        const tiles = [
            'houseBeige', 'houseBeigeBottomLeft', 'houseBeigeBottomMid', 'houseBeigeBottomRight',
            'houseBeigeMidLeft', 'houseBeigeMidRight', 'houseBeigeTopLeft', 'houseBeigeTopMid', 'houseBeigeTopRight',
            'houseDark', 'houseDarkBottomLeft', 'houseDarkBottomMid', 'houseDarkBottomRight',
            'houseDarkMidLeft', 'houseDarkMidRight', 'houseDarkTopLeft', 'houseDarkTopMid', 'houseDarkTopRight',
            'houseGray', 'houseGrayBottomLeft', 'houseGrayBottomMid', 'houseGrayBottomRight',
            'houseGrayMidLeft', 'houseGrayMidRight', 'houseGrayTopLeft', 'houseGrayTopMid', 'houseGrayTopRight',
            'roofRedLeft', 'roofRedMid', 'roofRedRight',
            'roofGreyLeft', 'roofGreyMid', 'roofGreyRight',
            'roofYellowLeft', 'roofYellowMid', 'roofYellowRight',
            'doorOpen', 'window'
        ];

        for (const tile of tiles) {
            if (this.houseImages.has(tile)) continue;
            const img = new Image();
            img.src = `assets/house/Tiles/${tile}.png`;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            this.houseImages.set(tile, img);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.loaded) {
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            return;
        }

        if (this.backgroundImage && this.backgroundImage.complete) {
            const bgSpeed = 0.5;
            const x = -(this.offsetX * bgSpeed) % this.canvasWidth;
            ctx.drawImage(this.backgroundImage, x, 0, this.canvasWidth, this.canvasHeight);
            ctx.drawImage(this.backgroundImage, x + this.canvasWidth, 0, this.canvasWidth, this.canvasHeight);
        }

        this.drawHouses(ctx);
    }

    private drawHouses(ctx: CanvasRenderingContext2D): void {
        const currentZone = this.zoneManager.getCurrentZone();
        const houseSpeed = 1.0;
        
        currentZone.houses.forEach(house => {
            const x = (house.x - (this.offsetX * houseSpeed)) % (this.canvasWidth + 200);
            const drawX = x < -200 ? x + (this.canvasWidth + 400) : x;
            this.drawHouse(ctx, house, drawX);
        });
    }

    private drawHouse(ctx: CanvasRenderingContext2D, house: House, x: number): void {
        const color = house.color.charAt(0).toUpperCase() + house.color.slice(1);
        const roofColor = house.roofColor.charAt(0).toUpperCase() + house.roofColor.slice(1);
        const tileSize = 64; 

        ctx.imageSmoothingEnabled = false;

        const cols = Math.ceil(house.width / tileSize);
        const rows = Math.ceil(house.height / tileSize);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let tileKey = `house${color}`;
                if (r === rows - 1) {
                    if (c === 0) tileKey += 'BottomLeft';
                    else if (c === cols - 1) tileKey += 'BottomRight';
                    else tileKey += 'BottomMid';
                } else if (r === 0) {
                    if (c === 0) tileKey += 'TopLeft';
                    else if (c === cols - 1) tileKey += 'TopRight';
                    else tileKey += 'TopMid';
                } else {
                    if (c === 0) tileKey += 'MidLeft';
                    else if (c === cols - 1) tileKey += 'MidRight';
                }

                const tileImg = this.houseImages.get(tileKey) || this.houseImages.get(`house${color}`);
                if (tileImg && tileImg.complete) {
                    ctx.drawImage(tileImg, x + c * tileSize, house.y + r * tileSize, tileSize, tileSize);
                }
            }
        }

        for (let c = 0; c < cols; c++) {
            let roofKey = `roof${roofColor}`;
            if (c === 0) roofKey += 'Left';
            else if (c === cols - 1) roofKey += 'Right';
            else roofKey += 'Mid';

            const roofImg = this.houseImages.get(roofKey);
            if (roofImg && roofImg.complete) {
                ctx.drawImage(roofImg, x + c * tileSize, house.y - tileSize, tileSize, tileSize);
            }
        }

        const doorImg = this.houseImages.get('doorOpen');
        if (doorImg && doorImg.complete) {
            const doorX = x + (house.width - tileSize) / 2;
            const doorY = house.y + house.height - tileSize;
            ctx.drawImage(doorImg, doorX, doorY, tileSize, tileSize);
        }

        const windowImg = this.houseImages.get('window');
        if (windowImg && windowImg.complete) {
            if (cols > 1) {
                ctx.drawImage(windowImg, x + tileSize * 0.2, house.y + tileSize * 0.5, tileSize * 0.6, tileSize * 0.6);
            }
            if (cols > 2) {
                ctx.drawImage(windowImg, x + house.width - tileSize * 0.8, house.y + tileSize * 0.5, tileSize * 0.6, tileSize * 0.6);
            }
        }

        ctx.imageSmoothingEnabled = true;
    }

    update(speed: number): void {
        if (this.loaded) {
            this.offsetX += speed;
        }
    }

    updateZone(): void {
        this.loadBackground();
    }
}
