import { GameObject } from './Dino.js';
export declare class Bird implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    private wingFrame;
    private frameTimer;
    private imagesLoaded;
    constructor(x: number, y: number);
    update(speed: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    private drawFallback;
}
//# sourceMappingURL=Bird.d.ts.map