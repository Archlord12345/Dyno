export class FallingEnemy {
    x;
    y;
    width = 60;
    height = 60;
    initialY;
    targetY;
    isFalling = false;
    fallSpeed = 0;
    gravity = 0.5;
    bounce = -0.3;
    images = new Map();
    image = null;
    imagesLoaded = false;
    state = 'idle';
    constructor(x, y, groundY) {
        this.x = x;
        this.y = -100; // Start off-screen
        this.initialY = -100;
        this.targetY = groundY; // Sera ajusté avec la hauteur
        this.loadSprites();
    }
    async asyncLoadImage(src) {
        const img = new Image();
        img.src = src;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        return img;
    }
    async loadSprites() {
        try {
            const idleImg = await this.asyncLoadImage('assets/enemies/tombe/bloc/block_idle.png');
            const fallImg = await this.asyncLoadImage('assets/enemies/tombe/bloc/block_fall.png');
            const restImg = await this.asyncLoadImage('assets/enemies/tombe/bloc/block_rest.png');
            this.images.set('idle', idleImg);
            this.images.set('falling', fallImg);
            this.images.set('resting', restImg);
            this.image = idleImg;
            this.imagesLoaded = true;
        }
        catch (e) {
            console.log('Failed to load FallingEnemy sprites');
        }
    }
    update(speed) {
        this.x -= speed;
        // Trigger fall when close to player (player is around x=80)
        // On déclenche un peu avant pour que ça tombe DEVANT le joueur
        const triggerDistance = 450;
        if (this.state === 'idle' && this.x < triggerDistance) {
            this.state = 'falling';
            this.image = this.images.get('falling') || this.image;
        }
        if (this.state === 'falling') {
            this.fallSpeed += this.gravity * 1.5; // Plus rapide pour être plus dangereux
            this.y += this.fallSpeed;
            // Ajuster targetY selon la hauteur actuelle
            const actualTargetY = this.targetY - this.height;
            if (this.y >= actualTargetY) {
                this.y = actualTargetY;
                this.fallSpeed *= this.bounce;
                if (Math.abs(this.fallSpeed) < 1) {
                    this.state = 'resting';
                    this.fallSpeed = 0;
                    this.image = this.images.get('resting') || this.image;
                }
            }
        }
    }
    draw(ctx) {
        if (this.imagesLoaded && this.image) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, Math.floor(this.x), Math.floor(this.y), this.width, this.height);
            ctx.imageSmoothingEnabled = true;
        }
    }
}
//# sourceMappingURL=FallingEnemy.js.map