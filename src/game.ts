import { Dino, GameObject } from './Dino.js';
import { Bird } from './Bird.js';
import { Ground } from './Ground.js';
import { Background } from './Background.js';
import { AudioManager, WeatherManager, NumberRenderer } from './Utils.js';
import { ZoneManager } from './ZoneManager.js';
import { Enemy } from './Enemy.js';
import { FallingEnemy } from './FallingEnemy.js';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dino: Dino;
    private ground: Ground;
    private background: Background;
    private obstacles: GameObject[] = [];
    private gameSpeed = 6;
    private score = 0;
    private highScore = 0;
    private isPlaying = false;
    private isPaused = false;
    private obstacleTimer = 0;
    private obstacleInterval = 100;
    private scoreElement: HTMLElement;
    private gameOverElement: HTMLElement;
    private audioManager: AudioManager;
    private weatherManager: WeatherManager;
    private zoneManager: ZoneManager;
    private numberRenderer: NumberRenderer;
    private lifeImages: HTMLImageElement[] = [];
    private health = 6; // 3 coeurs * 2
    private groundY = 350;
    private scaleFactor = 1;
    private totalDistance = 0;
    private particles: {x: number, y: number, speed: number, length: number}[] = [];

    constructor() {
        this.canvas = document.getElementById('game') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.dino = new Dino();
        this.ground = new Ground();
        this.background = new Background(this.canvas.width, this.canvas.height);
        this.gameOverElement = document.getElementById('game-over')!;
        this.audioManager = new AudioManager();
        this.weatherManager = new WeatherManager();
        this.numberRenderer = new NumberRenderer();
        this.loadLifeImages();
        this.scoreElement = document.getElementById('score')!;
        this.zoneManager = ZoneManager.getInstance();

        this.setupInputs();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.loadHighscore();
        this.gameLoop();
    }

    private async loadLifeImages(): Promise<void> {
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

    private loadHighscore(): void {
        const saved = localStorage.getItem('dino-highscore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
    }

    private setupInputs(): void {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                if (!this.isPlaying) {
                    this.start();
                } else {
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
            } else {
                this.dino.jump();
                this.audioManager.playJump();
            }
        });
    }

    private resize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.min(window.innerHeight, 400);
        this.scaleFactor = this.canvas.height / 400;
        this.groundY = this.canvas.height - 50 * this.scaleFactor;
    }

    private start(): void {
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

    private togglePause(): void {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.audioManager.stopBackgroundMusic();
        } else {
            this.audioManager.playBackgroundMusic();
        }
    }

    private spawnObstacle(): void {
        const x = this.canvas.width + 100;
        const availableObstacles = this.zoneManager.getAvailableObstacles();
        let obstacleType = availableObstacles[Math.floor(Math.random() * availableObstacles.length)] || 'ladybug';
        
        if (obstacleType === 'mouse') obstacleType = 'souris';

        if (Math.random() < 0.20) {
            const isUFO = Math.random() < 0.5;
            if (isUFO) {
                const colors = ['Beige', 'Blue', 'Green', 'Pink', 'Yellow'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const ufo = new Enemy(x, this.groundY - 180 * this.scaleFactor, 'ufo');
                ufo.width = 80 * this.scaleFactor;
                ufo.height = 60 * this.scaleFactor;
                (ufo as any).sprites.walk = [`ship${color}_manned`];
                this.obstacles.push(ufo);
            } else {
                const bird = new Bird(x, this.groundY - 100 * this.scaleFactor);
                this.obstacles.push(bird);
            }
        } else {
            if (['sedan', 'police', 'taxi', 'truck', 'bus', 'ambulance', 'van'].includes(obstacleType)) {
                const car = new Enemy(x, this.groundY - 50 * this.scaleFactor, 'cars');
                car.width = 80 * this.scaleFactor;
                car.height = 50 * this.scaleFactor;
                if (obstacleType === 'truck') {
                    car.width = 120 * this.scaleFactor;
                    car.height = 80 * this.scaleFactor;
                    car.y = this.groundY - 80 * this.scaleFactor;
                }
                (car as any).sprites.walk = [obstacleType];
                this.obstacles.push(car);
            } else if (obstacleType === 'block') {
                const block = new FallingEnemy(x, this.groundY, this.groundY);
                block.width = 60 * this.scaleFactor;
                block.height = 60 * this.scaleFactor;
                this.obstacles.push(block);
            } else if (obstacleType === 'barrier') {
                const barrier = new Enemy(x, this.groundY - 40 * this.scaleFactor, 'cars');
                barrier.width = 50 * this.scaleFactor;
                barrier.height = 40 * this.scaleFactor;
                (barrier as any).sprites.walk = ['barrier'];
                const img = new Image();
                img.src = 'assets/enemies/sol/Props/barrier.png';
                (barrier as any).imageCache.set('barrier', img);
                this.obstacles.push(barrier);
            } else {
                const enemy = new Enemy(x, this.groundY - 45 * this.scaleFactor, obstacleType as any);
                enemy.width = 45 * this.scaleFactor;
                enemy.height = 45 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
        }
    }

    private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
        const margin = 10 * this.scaleFactor;
        return (
            obj1.x + margin < obj2.x + obj2.width - margin &&
            obj1.x + obj1.width - margin > obj2.x + margin &&
            obj1.y + margin < obj2.y + obj2.height - margin &&
            obj1.y + obj1.height - margin > obj2.y + margin
        );
    }

    private gameOver(): void {
        this.isPlaying = false;
        this.audioManager.playCollision();
        this.audioManager.stopBackgroundMusic();
        this.gameOverElement.classList.remove('hidden');
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dino-highscore', this.highScore.toString());
        }
    }

    private gameLoop(): void {
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

            for (let i = 0; i < this.obstacles.length; i++) {
                if (this.checkCollision(this.dino, this.obstacles[i]!)) {
                    this.health -= 1;
                    this.obstacles.splice(i, 1);
                    this.audioManager.playCollision();
                    if (this.health <= 0) {
                        this.gameOver();
                    }
                    break;
                }
            }

            this.dino.update();
            this.background.update(this.gameSpeed);
            this.ground.update(this.gameSpeed);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.background.draw(this.ctx);
        this.ground.draw(this.ctx);
        this.dino.draw(this.ctx);

        for (const obs of this.obstacles) {
            obs.draw(this.ctx);
        }

        this.drawUI();
        this.drawWeather();
        
        if (this.isPaused) this.drawPauseScreen();

        requestAnimationFrame(() => this.gameLoop());
    }

    private drawUI(): void {
        const scoreStr = Math.floor(this.score).toString().padStart(6, '0');
        this.numberRenderer.draw(this.ctx, scoreStr, 20 * this.scaleFactor, 20 * this.scaleFactor, 0.8 * this.scaleFactor);

        // Dessiner les vies (modular life system)
        // 6 HP total. 3 emplacements de coeurs.
        for (let i = 0; i < 3; i++) {
            let lifeImg: HTMLImageElement | undefined;
            const heartValue = this.health - (i * 2);
            
            if (heartValue >= 2) lifeImg = this.lifeImages[0]; // Plein
            else if (heartValue === 1) lifeImg = this.lifeImages[1]; // Moitié
            else lifeImg = this.lifeImages[2]; // Vide
            
            if (lifeImg) {
                this.ctx.drawImage(lifeImg, 20 * this.scaleFactor + i * 40 * this.scaleFactor, 60 * this.scaleFactor, 32 * this.scaleFactor, 32 * this.scaleFactor);
            }
        }
    }

    private drawWeather(): void {
        const weather = this.weatherManager.getWeatherData();
        if (!weather) return;

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

    private drawPauseScreen(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
