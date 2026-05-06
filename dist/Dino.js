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
            // Dessin de secours en pixel art si les images ne sont pas chargées
            this.drawFallback(ctx);
            return;
        }
        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && currentSprites[this.animationFrame]) {
            const spriteName = currentSprites[this.animationFrame];
            // Ajuster la taille et position selon l'animation
            let drawWidth = this.width;
            let drawHeight = this.height;
            let drawY = this.y;
            if (this.ducking) {
                drawHeight = this.duckHeight;
                drawY = this.y + (this.normalHeight - this.duckHeight);
            }
            // Utiliser le cache d'images pour éviter de recharger à chaque frame
            const imgPath = `${this.currentAvatarPath}/${spriteName}.png`;
            let img = this.imageCache.get(imgPath);
            if (!img) {
                img = new Image();
                img.src = imgPath;
                this.imageCache.set(imgPath, img);
            }
            // Dessiner le sprite
            if (img.complete) {
                ctx.drawImage(img, this.x, drawY, drawWidth, drawHeight);
            }
            else {
                img.onload = () => {
                    ctx.drawImage(img, this.x, drawY, drawWidth, drawHeight);
                };
            }
            return;
        }
        // Fallback si le sprite n'est pas disponible
        this.drawFallback(ctx);
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
    drawFallback(ctx) {
        // Dessin de secours original en pixel art
        ctx.fillStyle = '#2F4F4F';
        // Tête (carré pixelisé)
        ctx.fillRect(this.x + 18, this.y, 16, 16);
        // Museau
        ctx.fillRect(this.x + 34, this.y + 4, 6, 8);
        // Œil (pixel unique)
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(this.x + 32, this.y + 4, 2, 2);
        ctx.fillStyle = '#2F4F4F';
        // Corps (rectangle pixelisé)
        ctx.fillRect(this.x + 10, this.y + 12, 20, 16);
        // Ventre
        ctx.fillRect(this.x + 12, this.y + 20, 16, 8);
        // Queue (pixelisée)
        ctx.fillRect(this.x + 2, this.y + 18, 10, 6);
        ctx.fillRect(this.x, this.y + 20, 6, 4);
        if (this.ducking) {
            ctx.fillRect(this.x + 14, this.y + 28, 6, 6);
            ctx.fillRect(this.x + 24, this.y + 28, 6, 6);
        }
        else if (this.grounded) {
            if (this.runFrame === 0) {
                ctx.fillRect(this.x + 12, this.y + 28, 6, 8);
                ctx.fillRect(this.x + 24, this.y + 26, 6, 10);
            }
            else {
                ctx.fillRect(this.x + 12, this.y + 26, 6, 10);
                ctx.fillRect(this.x + 24, this.y + 28, 6, 8);
            }
        }
        else {
            ctx.fillRect(this.x + 12, this.y + 28, 6, 8);
            ctx.fillRect(this.x + 24, this.y + 24, 6, 6);
        }
    }
}
//# sourceMappingURL=Dino.js.map