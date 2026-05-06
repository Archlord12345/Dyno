export class Enemy {
    x;
    y;
    width = 60;
    height = 60;
    enemyType;
    animationFrame = 0;
    animationTimer = 0;
    sprites = {};
    imagesLoaded = false;
    currentAnimation = 'walk';
    imageCache = new Map();
    isJumping = false;
    jumpTimer = 0;
    JUMP_DURATION = 24; // ~0.4s at 60fps
    initialY;
    constructor(x, y, type = 'ladybug') {
        this.x = x;
        this.y = y;
        this.initialY = y;
        this.enemyType = type;
        this.loadSprites();
    }
    async loadSprites() {
        try {
            if (this.enemyType === 'ladybug') {
                this.sprites.walk = ['ladybug_walk_a', 'ladybug_walk_b'];
                this.sprites.idle = ['ladybug_idle'];
            }
            else if (this.enemyType === 'souris') {
                this.sprites.walk = ['mouse_walk_a', 'mouse_walk_b'];
                this.sprites.idle = ['souris_idle'];
            }
            else if (this.enemyType === 'zombie') {
                this.sprites.walk = ['zombie_walk1', 'zombie_walk2'];
                this.sprites.idle = ['zombie_idle'];
            }
            else if (this.enemyType === 'cars' || this.enemyType === 'ufo') {
                this.sprites.walk = ['default'];
                this.sprites.idle = ['default'];
            }
            const spritePaths = [];
            if (this.enemyType === 'ladybug') {
                spritePaths.push('assets/enemies/sol/ladybug/ladybug_idle.png', 'assets/enemies/sol/ladybug/ladybug_walk_a.png', 'assets/enemies/sol/ladybug/ladybug_walk_b.png');
            }
            else if (this.enemyType === 'souris') {
                spritePaths.push('assets/enemies/sol/souris/souris_idle.png', 'assets/enemies/sol/souris/mouse_walk_a.png', 'assets/enemies/sol/souris/mouse_walk_b.png');
            }
            else if (this.enemyType === 'zombie') {
                spritePaths.push('assets/enemies/sol/Zombie/Poses/zombie_idle.png', 'assets/enemies/sol/Zombie/Poses/zombie_walk1.png', 'assets/enemies/sol/Zombie/Poses/zombie_walk2.png');
            }
            for (const path of spritePaths) {
                const img = new Image();
                img.src = path;
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
                this.imageCache.set(path, img);
            }
            this.imagesLoaded = true;
        }
        catch (e) {
            console.log(`Failed to load ${this.enemyType} sprites:`, e);
        }
    }
    update(speed) {
        this.x -= speed;
        if (this.imagesLoaded) {
            this.animationTimer++;
            const animSpeed = this.isJumping ? 4 : 12;
            if (this.animationTimer > animSpeed) {
                const frames = this.sprites[this.currentAnimation];
                if (frames) {
                    this.animationFrame = (this.animationFrame + 1) % frames.length;
                }
                this.animationTimer = 0;
            }
        }
    }
    draw(ctx) {
        if (!this.imagesLoaded && !['cars', 'ufo'].includes(this.enemyType)) {
            return;
        }
        const currentSprites = this.sprites[this.currentAnimation];
        if (currentSprites && (currentSprites[this.animationFrame] || ['cars', 'ufo'].includes(this.enemyType))) {
            const spriteName = currentSprites[this.animationFrame];
            let imgPath = `assets/enemies/sol/${this.enemyType}/${spriteName}.png`;
            if (this.enemyType === 'zombie') {
                imgPath = `assets/enemies/sol/Zombie/Poses/${spriteName}.png`;
            }
            else if (this.enemyType === 'cars') {
                imgPath = `assets/enemies/sol/Cars/${spriteName}.png`;
            }
            else if (this.enemyType === 'ufo') {
                imgPath = `assets/enemies/airs/ovnie/${spriteName}.png`;
            }
            let img = this.imageCache.get(imgPath);
            if (!img) {
                img = new Image();
                img.src = imgPath;
                this.imageCache.set(imgPath, img);
            }
            if (img.complete && img.naturalWidth > 0) {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, Math.floor(this.x), Math.floor(this.y), this.width, this.height);
                ctx.imageSmoothingEnabled = true;
            }
        }
    }
}
//# sourceMappingURL=Enemy.js.map