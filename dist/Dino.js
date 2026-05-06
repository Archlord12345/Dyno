import { AvatarManager } from './AvatarManager.js';
export class Dino {
    x = 50;
    y = 150;
    width = 60;
    height = 60;
    velocityY = 0;
    jumpForce = -14;
    grounded = true;
    ducking = false;
    normalHeight = 44;
    duckHeight = 25;
    gravity = 0.8;
    runFrame = 0;
    frameTimer = 0;
    currentAnimation = 'idle';
    animationFrame = 0;
    animationTimer = 0;
    sprites = {};
    currentAvatarPath = '';
    imagesLoaded = false;
    imageCache = new Map();
    constructor() {
        this.loadSprites();
    }
    async loadSprites() {
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
        }
        catch (e) {
            console.log('Failed to load avatar sprites:', e);
        }
    }
    jump() {
        if (this.grounded) {
            this.velocityY = this.jumpForce;
            this.grounded = false;
        }
    }
    duck(active) {
        this.ducking = active;
        if (active) {
            this.height = this.duckHeight;
            // La position Y sera gérée par la classe Game
        }
        else {
            this.height = this.normalHeight;
            // La position Y sera gérée par la classe Game
        }
    }
    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        // Gestion des animations
        let newAnimation = this.currentAnimation;
        if (!this.grounded) {
            newAnimation = 'jump';
        }
        else if (this.grounded && !this.ducking) {
            newAnimation = 'run';
        }
        else if (this.ducking) {
            newAnimation = 'duck';
        }
        else {
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
    draw(ctx) {
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
    reset() {
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
//# sourceMappingURL=Dino.js.map