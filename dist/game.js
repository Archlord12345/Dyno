import { Dino } from './Dino.js';
import { Bird } from './Bird.js';
import { Ground } from './Ground.js';
import { Background } from './Background.js';
import { AudioManager, WeatherManager, NumberRenderer } from './Utils.js';
import { ZoneManager } from './ZoneManager.js';
import { Enemy } from './Enemy.js';
import { FallingEnemy } from './FallingEnemy.js';
export class Game {
    canvas;
    ctx;
    dino;
    ground;
    background;
    obstacles = [];
    gameSpeed = 6;
    score = 0;
    highScore = 0;
    isPlaying = false;
    isPaused = false;
    obstacleTimer = 0;
    obstacleInterval = 100;
    scoreElement;
    gameOverElement;
    audioManager;
    weatherManager;
    zoneManager;
    numberRenderer;
    lifeImages = [];
    health = 6;
    groundY = 0;
    scaleFactor = 1;
    totalDistance = 0;
    particles = [];
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.dino = new Dino();
        this.ground = new Ground();
        this.background = new Background();
        this.gameOverElement = document.getElementById('game-over');
        this.audioManager = new AudioManager();
        this.weatherManager = new WeatherManager();
        this.numberRenderer = new NumberRenderer();
        this.loadLifeImages();
        this.scoreElement = document.getElementById('score');
        this.zoneManager = ZoneManager.getInstance();
        this.setupInputs();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loadHighscore();
        this.gameLoop();
    }
    async loadLifeImages() {
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `assets/map/lifes/life${i}.png`;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            this.lifeImages.push(img);
        }
    }
    loadHighscore() {
        const saved = localStorage.getItem('dino-highscore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
    }
    setupInputs() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                if (!this.isPlaying) {
                    this.start();
                }
                else {
                    this.dino.jump();
                    this.audioManager.playJump();
                }
            }
            if (e.code === 'ArrowDown') {
                this.dino.duck(true);
            }
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            if (e.code === 'KeyR') {
                this.start();
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.dino.duck(false);
            }
        });
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isPlaying) {
                this.start();
            }
            else {
                this.dino.jump();
                this.audioManager.playJump();
            }
        });
        document.getElementById('toggle-time')?.addEventListener('click', () => {
            this.weatherManager.toggleTime();
        });
        document.getElementById('cycle-weather')?.addEventListener('click', () => {
            this.weatherManager.cycleWeather();
        });
        document.getElementById('restart-game')?.addEventListener('click', () => {
            this.start();
        });
        document.getElementById('restart-btn-gameover')?.addEventListener('click', () => {
            this.start();
        });
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.min(window.innerHeight, 400);
        this.scaleFactor = this.canvas.height / 400;
        this.groundY = this.canvas.height - 64;
    }
    start() {
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.health = 6;
        this.totalDistance = 0;
        this.obstacles = [];
        this.gameSpeed = 6 * this.scaleFactor;
        this.gameOverElement.classList.add('hidden');
        this.dino.reset();
        this.zoneManager.reset();
        this.background.updateZone();
        this.audioManager.playBackgroundMusic();
    }
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.audioManager.stopBackgroundMusic();
        }
        else {
            this.audioManager.playBackgroundMusic();
        }
    }
    spawnObstacle() {
        const x = this.canvas.width + 100;
        const availableObstacles = this.zoneManager.getAvailableObstacles();
        let obstacleType = availableObstacles[Math.floor(Math.random() * availableObstacles.length)] || 'ladybug';
        if (obstacleType === 'mouse')
            obstacleType = 'souris';
        if (Math.random() < 0.15) {
            this.spawnPlatform(x);
            return;
        }
        if (Math.random() < 0.20) {
            const isUFO = Math.random() < 0.5;
            if (isUFO) {
                const colors = ['Beige', 'Blue', 'Green', 'Pink', 'Yellow'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const ufo = new Enemy(x, this.groundY - 150 * this.scaleFactor, 'ufo');
                ufo.width = 64 * this.scaleFactor;
                ufo.height = 48 * this.scaleFactor;
                const spriteName = `ship${color}_manned`;
                ufo.sprites.walk = [spriteName];
                const img = new Image();
                img.src = `assets/enemies/airs/ufo/${spriteName}.png`;
                ufo.imageCache.set(spriteName, img);
                this.obstacles.push(ufo);
            }
            else {
                const bird = new Bird(x, this.groundY - 80 * this.scaleFactor);
                this.obstacles.push(bird);
            }
        }
        else {
            if (['sedan', 'police', 'taxi', 'truck', 'bus', 'ambulance', 'van'].includes(obstacleType)) {
                const car = new Enemy(x, this.groundY - 40 * this.scaleFactor, 'cars');
                car.width = 80 * this.scaleFactor;
                car.height = 40 * this.scaleFactor;
                if (obstacleType === 'truck' || obstacleType === 'bus') {
                    car.width = 100 * this.scaleFactor;
                    car.height = 64 * this.scaleFactor;
                    car.y = this.groundY - 64 * this.scaleFactor;
                }
                car.sprites.walk = [obstacleType];
                const img = new Image();
                img.src = `assets/enemies/sol/Cars/${obstacleType}.png`;
                car.imageCache.set(obstacleType, img);
                this.obstacles.push(car);
            }
            else if (obstacleType === 'block') {
                const block = new FallingEnemy(x, this.groundY, this.groundY);
                block.width = 60 * this.scaleFactor;
                block.height = 60 * this.scaleFactor;
                this.obstacles.push(block);
            }
            else if (obstacleType === 'barrier') {
                const barrier = new Enemy(x, this.groundY - 40 * this.scaleFactor, 'cars');
                barrier.width = 40 * this.scaleFactor;
                barrier.height = 40 * this.scaleFactor;
                barrier.sprites.walk = ['barrier'];
                const img = new Image();
                img.src = 'assets/enemies/sol/Props/barrier.png';
                barrier.imageCache.set('barrier', img);
                this.obstacles.push(barrier);
            }
            else {
                const enemy = new Enemy(x, this.groundY - 45 * this.scaleFactor, obstacleType);
                enemy.width = 45 * this.scaleFactor;
                enemy.height = 45 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
        }
    }
    spawnPlatform(x) {
        const zone = this.zoneManager.getCurrentZone();
        const height = this.groundY - (60 + Math.random() * 80) * this.scaleFactor;
        const length = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < length; i++) {
            let type = zone.platforms[1];
            if (i === 0)
                type = zone.platforms[0];
            if (i === length - 1)
                type = zone.platforms[2];
            if (!type)
                continue;
            const p = new Enemy(x + i * 64 * this.scaleFactor, height, 'platform');
            p.width = 64 * this.scaleFactor;
            p.height = 32 * this.scaleFactor;
            const spriteName = `platform_${i}_${Date.now()}`;
            p.sprites.walk = [spriteName];
            const img = new Image();
            img.src = type;
            p.imageCache.set(spriteName, img);
            this.obstacles.push(p);
        }
    }
    checkCollision(obj1, obj2) {
        const margin = 10 * this.scaleFactor;
        return (obj1.x + margin < obj2.x + obj2.width - margin &&
            obj1.x + obj1.width - margin > obj2.x + margin &&
            obj1.y + margin < obj2.y + obj2.height - margin &&
            obj1.y + obj1.height - margin > obj2.y + margin);
    }
    gameOver() {
        this.isPlaying = false;
        this.audioManager.playCollision();
        this.audioManager.stopBackgroundMusic();
        this.gameOverElement.classList.remove('hidden');
        document.getElementById('final-score').textContent = Math.floor(this.score).toString();
        document.getElementById('best-score').textContent = this.highScore.toString();
    }
    gameLoop() {
        if (this.isPlaying && !this.isPaused) {
            this.score += 0.1;
            this.totalDistance += this.gameSpeed / 60;
            if (this.zoneManager.updateScore(this.score)) {
                this.background.updateZone();
                this.weatherManager.fetchWeather();
            }
            this.obstacleTimer++;
            if (this.obstacleTimer > this.obstacleInterval) {
                this.spawnObstacle();
                this.obstacleTimer = 0;
                this.obstacleInterval = 60 + Math.random() * 80;
            }
            this.obstacles = this.obstacles.filter(obs => {
                obs.update(this.gameSpeed);
                return obs.x + obs.width > -100;
            });
            let onPlatform = false;
            for (let i = 0; i < this.obstacles.length; i++) {
                const obs = this.obstacles[i];
                if (this.checkCollision(this.dino, obs)) {
                    if (obs instanceof Enemy && obs.enemyType === 'platform') {
                        if (this.dino.velocityY > 0 && this.dino.y + this.dino.height < obs.y + 20) {
                            this.dino.y = obs.y - this.dino.height;
                            this.dino.velocityY = 0;
                            this.dino.grounded = true;
                            onPlatform = true;
                        }
                    }
                    else {
                        this.health -= 1;
                        this.obstacles.splice(i, 1);
                        this.audioManager.playCollision();
                        if (this.health <= 0) {
                            this.gameOver();
                        }
                    }
                    break;
                }
            }
            this.dino.update();
            if (!onPlatform) {
                if (this.dino.y > this.groundY - this.dino.height) {
                    this.dino.y = this.groundY - this.dino.height;
                    this.dino.velocityY = 0;
                    this.dino.grounded = true;
                }
            }
            this.background.update(this.gameSpeed);
            this.ground.update(this.gameSpeed);
            this.updateWeatherEffects();
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Ordre de rendu corrigé :
        // 1. Fond (Ciel + Corps)
        this.background.draw(this.ctx);
        // 2. Décor du Footer (Herbes en arrière-plan)
        this.background.drawFoot(this.ctx);
        // 3. Sol physique (Sol SVG)
        this.ground.draw(this.ctx);
        // 4. Joueur
        this.dino.draw(this.ctx);
        for (const obs of this.obstacles) {
            obs.draw(this.ctx);
        }
        this.drawUI();
        this.drawWeatherInfo();
        this.drawWeatherEffects();
        if (this.isPaused)
            this.drawPauseScreen();
        requestAnimationFrame(() => this.gameLoop());
    }
    updateWeatherEffects() {
        const weather = this.weatherManager.getWeatherData();
        if (!weather)
            return;
        const code = weather.weatherCode;
        const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
        const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
        const isStorming = [95, 96, 99].includes(code);
        if (isRaining || isSnowing || isStorming) {
            if (this.particles.length < 100) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10,
                    speed: (isRaining || isStorming ? 10 : 2) + Math.random() * 5,
                    length: isRaining || isStorming ? 15 : 5
                });
            }
        }
        this.particles.forEach(p => {
            p.y += p.speed;
            if (p.y > this.canvas.height) {
                p.y = -10;
                p.x = Math.random() * this.canvas.width;
            }
        });
    }
    drawWeatherEffects() {
        const weather = this.weatherManager.getWeatherData();
        if (!weather)
            return;
        const code = weather.weatherCode;
        const isRaining = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
        const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
        const isStorming = [95, 96, 99].includes(code);
        const isFoggy = [45, 48].includes(code);
        if (isFoggy) {
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.weatherManager.isNight) {
            this.ctx.fillStyle = 'rgba(26, 26, 46, 0.4)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.ctx.strokeStyle = isSnowing ? '#FFF' : '#AACCFF';
        this.ctx.lineWidth = isSnowing ? 2 : 1;
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x - (isRaining ? 2 : 0), p.y + p.length);
            this.ctx.stroke();
        });
        if (isStorming && Math.random() < 0.01) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    drawUI() {
        const scoreStr = Math.floor(this.score).toString().padStart(6, '0');
        this.numberRenderer.draw(this.ctx, scoreStr, 20 * this.scaleFactor, 20 * this.scaleFactor, 0.8 * this.scaleFactor);
        for (let i = 0; i < 3; i++) {
            let lifeImg;
            const heartValue = this.health - (i * 2);
            if (heartValue >= 2)
                lifeImg = this.lifeImages[0];
            else if (heartValue === 1)
                lifeImg = this.lifeImages[1];
            else
                lifeImg = this.lifeImages[2];
            if (lifeImg) {
                this.ctx.drawImage(lifeImg, 20 * this.scaleFactor + i * 40 * this.scaleFactor, 60 * this.scaleFactor, 32 * this.scaleFactor, 32 * this.scaleFactor);
            }
        }
    }
    drawWeatherInfo() {
        const weather = this.weatherManager.getWeatherData();
        if (!weather)
            return;
        const startX = 20 * this.scaleFactor;
        const startY = this.canvas.height - 80 * this.scaleFactor;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(startX - 5, startY - 5, 120 * this.scaleFactor, 60 * this.scaleFactor);
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = `bold ${14 * this.scaleFactor}px Arial`;
        this.ctx.fillText(weather.icon + " " + weather.temperature + "°C", startX, startY + 20 * this.scaleFactor);
        this.ctx.font = `${11 * this.scaleFactor}px Arial`;
        this.ctx.fillStyle = '#DDD';
        this.ctx.fillText(weather.description, startX, startY + 40 * this.scaleFactor);
    }
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
new Game();
//# sourceMappingURL=game.js.map