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
    imagesLoaded = false;
    image = null;
    state = 'idle';
    constructor(x, y, groundY) {
        this.x = x;
        this.y = -100; // Start off-screen
        this.initialY = -100;
        this.targetY = groundY - 60;
        this.loadSprites();
    }
    async loadSprites() {
        this.image = new Image();
        this.image.src = 'assets/enemies/tombe/bloc/block_fall.png';
        await new Promise((resolve) => {
            this.image.onload = resolve;
            this.image.onerror = resolve;
        });
        this.imagesLoaded = this.image.complete && this.image.naturalWidth > 0;
    }
    update(speed) {
        this.x -= speed;
        // Trigger fall when close to player (player is around x=80)
        if (this.state === 'idle' && this.x < 500) {
            this.state = 'falling';
        }
        if (this.state === 'falling') {
            this.fallSpeed += this.gravity;
            this.y += this.fallSpeed;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.fallSpeed *= this.bounce;
                if (Math.abs(this.fallSpeed) < 1) {
                    this.state = 'resting';
                    this.fallSpeed = 0;
                    if (this.image)
                        this.image.src = 'assets/enemies/tombe/bloc/block_rest.png';
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
        else {
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
//# sourceMappingURL=FallingEnemy.js.map