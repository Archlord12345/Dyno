export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    update(speed?: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export declare class Dino implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityY: number;
    private gravity;
    private jumpForce;
    grounded: boolean;
    ducking: boolean;
    normalHeight: number;
    duckHeight: number;
    private runFrame;
    private frameTimer;
    private currentAnimation;
    private animationFrame;
    private animationTimer;
    private sprites;
    private imagesLoaded;
    private imageCache;
    constructor();
    private loadSprites;
    jump(): void;
    duck(active: boolean): void;
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
    private drawFallback;
}
//# sourceMappingURL=Dino.d.ts.map