import { GameObject } from './Dino.js';
export declare class Enemy implements GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    private enemyType;
    private animationFrame;
    private animationTimer;
    private sprites;
    private imagesLoaded;
    private currentAnimation;
    private imageCache;
    constructor(x: number, y: number, type?: 'frog' | 'ladybug' | 'souris');
    private loadSprites;
    update(speed: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    private drawFallback;
}
//# sourceMappingURL=Enemy.d.ts.map