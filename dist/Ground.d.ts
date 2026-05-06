import { GameObject } from './Dino.js';
export declare class Ground implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    private decorX;
    private imageCache;
    private imagesLoaded;
    constructor();
    update(speed: number): void;
    private loadImages;
    draw(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Ground.d.ts.map