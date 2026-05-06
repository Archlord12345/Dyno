export interface SpriteFrame {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SpriteSheet {
    image: HTMLImageElement;
    frames: Map<string, SpriteFrame>;
}

export class SpriteSheetManager {
    private static instance: SpriteSheetManager;
    private spriteSheets: Map<string, SpriteSheet> = new Map();
    private loaded = false;

    static getInstance(): SpriteSheetManager {
        if (!SpriteSheetManager.instance) {
            SpriteSheetManager.instance = new SpriteSheetManager();
        }
        return SpriteSheetManager.instance;
    }

    async loadSpriteSheets(): Promise<void> {
        const sheetConfigs = [
            {
                name: 'characters',
                imagePath: 'Spritesheets/spritesheet-characters-default.png',
                xmlPath: 'Spritesheets/spritesheet-characters-default.xml'
            },
            {
                name: 'enemies',
                imagePath: 'Spritesheets/spritesheet-enemies-default.png',
                xmlPath: 'Spritesheets/spritesheet-enemies-default.xml'
            },
            {
                name: 'tiles',
                imagePath: 'Spritesheets/spritesheet-tiles-default.png',
                xmlPath: 'Spritesheets/spritesheet-tiles-default.xml'
            }
        ];

        for (const config of sheetConfigs) {
            try {
                await this.loadSpriteSheet(config.name, config.imagePath, config.xmlPath);
            } catch (error) {
                console.log(`Failed to load spritesheet ${config.name}:`, error);
            }
        }

        this.loaded = true;
        console.log('All sprite sheets loaded');
    }

    private async loadSpriteSheet(name: string, imagePath: string, xmlPath: string): Promise<void> {
        // Charger l'image
        const image = new Image();
        const imagePromise = new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
        });
        image.src = imagePath;

        // Charger le XML
        const response = await fetch(xmlPath);
        if (!response.ok) {
            throw new Error(`Failed to load XML: ${xmlPath}`);
        }
        const xmlText = await response.text();

        // Parser le XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const subTextures = xmlDoc.querySelectorAll('SubTexture');

        const frames = new Map<string, SpriteFrame>();
        subTextures.forEach(subTexture => {
            const name = subTexture.getAttribute('name');
            const x = parseInt(subTexture.getAttribute('x') || '0');
            const y = parseInt(subTexture.getAttribute('y') || '0');
            const width = parseInt(subTexture.getAttribute('width') || '0');
            const height = parseInt(subTexture.getAttribute('height') || '0');

            if (name) {
                frames.set(name, { name, x, y, width, height });
            }
        });

        await imagePromise;

        this.spriteSheets.set(name, {
            image,
            frames
        });
    }

    getSprite(sheetName: string, frameName: string): SpriteFrame | null {
        const sheet = this.spriteSheets.get(sheetName);
        if (!sheet) {
            return null;
        }
        return sheet.frames.get(frameName) || null;
    }

    getSpriteSheet(sheetName: string): SpriteSheet | null {
        return this.spriteSheets.get(sheetName) || null;
    }

    drawSprite(ctx: CanvasRenderingContext2D, sheetName: string, frameName: string, x: number, y: number, width?: number, height?: number): void {
        const sheet = this.spriteSheets.get(sheetName);
        if (!sheet) {
            return;
        }

        const frame = sheet.frames.get(frameName);
        if (!frame) {
            return;
        }

        const drawWidth = width || frame.width;
        const drawHeight = height || frame.height;

        ctx.drawImage(
            sheet.image,
            frame.x, frame.y, frame.width, frame.height,
            x, y, drawWidth, drawHeight
        );
    }

    isLoaded(): boolean {
        return this.loaded;
    }
}
