import { SpriteSheetManager } from './SpriteSheetManager.js';
import { AvatarManager } from './AvatarManager.js';

export interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    update(speed?: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

export class Dino implements GameObject {
    x = 50;
    y = 150;
    width = 60;
    height = 60;
    public velocityY = 0;
    public jumpForce = -14;
    public grounded = true;
    public ducking = false;
    public normalHeight = 44;
    public duckHeight = 25;
    public gravity = 0.8;
    private runFrame = 0;
    private frameTimer = 0;
    private currentAnimation = 'idle';
    private animationFrame = 0;
    private animationTimer = 0;
    private sprites: { [key: string]: string[] } = {};
    private currentAvatarPath = '';
    private imagesLoaded = false;
    private imageCache: Map<string, HTMLImageElement> = new Map();

    constructor() {
        this.loadSprites();
    }

    private async loadSprites(): Promise<void> {
        try {
            const avatarManager = AvatarManager.getInstance();
            const selectedAvatar = avatarManager.getSelectedAvatar();
            this.currentAvatarPath = selectedAvatar.path;
            
            // Utiliser les sprites de l'avatar sélectionné
            this.sprites.idle = [selectedAvatar.sprites.idle.replace('.png', '')];
            this.sprites.run = selectedAvatar.sprites.walk.map(sprite => sprite.replace('.png', ''));
            this.sprites.jump = [selectedAvatar.sprites.jump.replace('.png', '')];
            this.sprites.dead = [selectedAvatar.sprites.hurt.replace('.png', '')];
            this.sprites.duck = [selectedAvatar.sprites.duck.replace('.png', '')];
            
            // Précharger les images
            const spritePaths = [
                `${this.currentAvatarPath}/${selectedAvatar.sprites.idle}`,
                ...selectedAvatar.sprites.walk.map(sprite => `${this.currentAvatarPath}/${sprite}`),
                `${this.currentAvatarPath}/${selectedAvatar.sprites.jump}`,
                `${this.currentAvatarPath}/${selectedAvatar.sprites.hurt}`,
                `${this.currentAvatarPath}/${selectedAvatar.sprites.duck}`
            ];

            for (const path of spritePaths) {
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve; // Continue même si erreur
                });
            }
            
            this.imagesLoaded = true;
            console.log(`Loaded avatar: ${selectedAvatar.name}`);
        } catch (e) {
            console.log('Failed to load avatar sprites:', e);
        }
    }

    jump(): void {
        if (this.grounded) {
            this.velocityY = this.jumpForce;
            this.grounded = false;
        }
    }

    duck(active: boolean): void {
        this.ducking = active;
        if (active) {
            this.height = this.duckHeight;
            // La position Y sera gérée par la classe Game
        } else {
            this.height = this.normalHeight;
            // La position Y sera gérée par la classe Game
        }
    }

    update(): void {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Gestion des animations
        let newAnimation = this.currentAnimation;
        if (!this.grounded) {
            newAnimation = 'jump';
        } else if (this.grounded && !this.ducking) {
            newAnimation = 'run';
        } else if (this.ducking) {
            newAnimation = 'duck';
        } else {
            newAnimation = 'idle';
        }

        // Reset frame if animation changed
        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation = newAnimation;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        // Update frames
        this.animationTimer++;
        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && currentSprites.length > 1) {
            const frameDelay = this.currentAnimation === 'run' ? 8 : 10;
            if (this.animationTimer > frameDelay) {
                this.animationFrame = (this.animationFrame + 1) % currentSprites.length;
                this.animationTimer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.imagesLoaded || !this.sprites[this.currentAnimation]) {
            return;
        }

        const currentSprites = this.sprites[this.currentAnimation];
        
        if (currentSprites && currentSprites[this.animationFrame]) {
            const spriteName = currentSprites[this.animationFrame];
            
            let drawWidth = this.width;
            let drawHeight = this.height;
            let drawY = this.y;

            if (this.ducking) {
                drawHeight = this.duckHeight;
                drawY = this.y + (this.normalHeight - this.duckHeight);
            }

            const imgPath = `${this.currentAvatarPath}/${spriteName}.png`;
            let img = this.imageCache.get(imgPath);
            
            if (!img) {
                img = new Image();
                img.src = imgPath;
                this.imageCache.set(imgPath, img);
            }
            
            if (img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, this.x, drawY, drawWidth, drawHeight);
            }
        }
    }

    reset(): void {
        this.x = 50;
        this.y = 150;
        this.velocityY = 0;
        this.grounded = true;
        this.ducking = false;
        this.currentAnimation = 'idle';
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
}
