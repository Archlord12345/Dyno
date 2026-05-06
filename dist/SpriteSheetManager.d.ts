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
export declare class SpriteSheetManager {
    private static instance;
    private spriteSheets;
    private loaded;
    static getInstance(): SpriteSheetManager;
    loadSpriteSheets(): Promise<void>;
    private loadSpriteSheet;
    getSprite(sheetName: string, frameName: string): SpriteFrame | null;
    getSpriteSheet(sheetName: string): SpriteSheet | null;
    drawSprite(ctx: CanvasRenderingContext2D, sheetName: string, frameName: string, x: number, y: number, width?: number, height?: number): void;
    isLoaded(): boolean;
}
//# sourceMappingURL=SpriteSheetManager.d.ts.map