import { Dino, GameObject } from './Dino.js';
import { Enemy } from './Enemy.js';
import { Bird } from './Bird.js';
import { Ground } from './Ground.js';
import { Background } from './Background.js';
import { AudioManager, WeatherManager } from './Utils.js';
import { ZoneManager } from './ZoneManager.js';
import { FallingEnemy } from './FallingEnemy.js';

class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dino!: Dino;
    private obstacles: GameObject[] = [];
    private ground!: Ground;
    private background!: Background;
    private zoneManager: ZoneManager;
    private score = 0;
    private highScore = 0;
    private gameSpeed = 6;
    private isGameOver = false;
    private isPlaying = false;
    private isPaused = false;
    private leaderboard: number[] = [];
    private obstacleTimer = 0;
    private obstacleInterval = 100;
    private scoreElement: HTMLElement;
    private gameOverElement: HTMLElement;
    private keys: { [key: string]: boolean } = {};
    private audioManager: AudioManager;
    private weatherManager: WeatherManager;
    private canvasWidth = 900;
    private canvasHeight = 400;
    private groundY = 350;
    private scaleFactor = 1;
    private totalDistance = 0;
    private lastZoneCheck = 0;

    constructor() {
        this.canvas = document.getElementById('game') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.scoreElement = document.getElementById('score')!;
        this.gameOverElement = document.getElementById('game-over')!;
        this.audioManager = new AudioManager();
        this.weatherManager = new WeatherManager();
        this.zoneManager = ZoneManager.getInstance();

        this.setupInputs();
        this.loadHighScore();
        this.audioManager.loadSounds();
        this.weatherManager.fetchWeather();
        
        // Charger les spritesheets avant d'initialiser les objets
        this.initializeGame();
        
        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => this.setupCanvas());
    }

    private async initializeGame(): Promise<void> {
        // Initialiser les objets directement (plus besoin de spritesheets)
        this.dino = new Dino();
        this.ground = new Ground();
        this.background = new Background(this.canvasWidth, this.canvasHeight);
        
        // Configurer le canvas après l'initialisation des objets
        this.setupCanvas();
        
        this.gameLoop();
    }

    private setupCanvas(): void {
        // Obtenir les dimensions de la fenêtre
        const container = document.getElementById('game-container')!;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Définir les dimensions de base du jeu
        const baseWidth = 900;
        const baseHeight = 400;
        
        // Calculer le facteur d'échelle pour maintenir le ratio
        const scaleX = containerWidth / baseWidth;
        const scaleY = containerHeight / baseHeight;
        this.scaleFactor = Math.min(scaleX, scaleY, 2); // Limiter à 2x pour éviter les pixels trop gros
        
        // Calculer les dimensions réelles du canvas
        this.canvasWidth = baseWidth * this.scaleFactor;
        this.canvasHeight = baseHeight * this.scaleFactor;
        this.groundY = 350 * this.scaleFactor;
        
        // Définir les dimensions du canvas
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Mettre à jour les positions des éléments de jeu
        this.updateGamePositions();
    }

    private updateGamePositions(): void {
        // Mettre à jour la position du personnage avec des tailles optimisées pour le saut
        this.dino.x = 80 * this.scaleFactor; 
        this.dino.y = this.groundY - 60 * this.scaleFactor; 
        this.dino.width = 60 * this.scaleFactor; 
        this.dino.height = 60 * this.scaleFactor;
        this.dino.normalHeight = 60 * this.scaleFactor;
        this.dino.duckHeight = 30 * this.scaleFactor;
        
        this.dino.jumpForce = -16 * this.scaleFactor; 
        this.dino.gravity = 0.9; 
        
        this.ground.y = this.groundY;
        
        if (this.isPlaying) {
            const currentZone = this.zoneManager.getCurrentZone();
            
            if (this.totalDistance - this.lastZoneCheck >= currentZone.distanceToNext) {
                this.lastZoneCheck = this.totalDistance;
                this.background.updateZone();
                this.ground.reset(); // On reset le sol pour la nouvelle zone
                this.weatherManager.fetchWeather();
                console.log(`Nouvelle zone: ${this.zoneManager.getCurrentZone().name}`);
            }
        }
    }

    private setupInputs(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (!this.isPlaying && this.isGameOver) {
                    this.reset();
                } else if (this.isPlaying) {
                    this.dino.jump();
                    this.audioManager.playJump();
                } else if (!this.isPlaying && !this.isGameOver) {
                    this.start();
                }
            }
            
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                if (this.isPlaying) {
                    this.dino.duck(true);
                }
            }
            
            if (e.code === 'KeyP') {
                e.preventDefault();
                if (this.isPlaying) {
                    this.togglePause();
                }
            }
            
            if (e.code === 'KeyM') {
                e.preventDefault();
                this.audioManager.toggleMute();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            
            if (e.code === 'ArrowDown') {
                this.dino.duck(false);
            }
        });
    }

    private start(): void {
        this.isPlaying = true;
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

    private reset(): void {
        this.score = 0;
        this.isGameOver = false;
        this.isPlaying = false;
        this.obstacles = [];
        this.gameSpeed = 6;
        this.obstacleTimer = 0;
        this.totalDistance = 0;
        this.lastZoneCheck = 0;
        this.zoneManager.reset();
        this.background.updateZone();
        this.dino.reset();
        this.ground.reset();
        this.updateGamePositions(); // S'assurer que les positions sont correctes après le reset
        this.gameOverElement.style.display = 'none';
        this.audioManager.playBackgroundMusic();
    }

    private updateScore(): void {
        const currentZone = this.zoneManager.getCurrentZone();
        this.scoreElement.textContent = `Score: ${Math.floor(this.score).toString().padStart(5, '0')} | Zone: ${currentZone.name}`;
    }

    private loadHighScore(): void {
        const saved = localStorage.getItem('dino-highscore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
        
        const savedLeaderboard = localStorage.getItem('dino-leaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }

    private saveToLeaderboard(): void {
        this.leaderboard.push(Math.floor(this.score));
        this.leaderboard.sort((a, b) => b - a);
        this.leaderboard = this.leaderboard.slice(0, 5); // Garder top 5
        localStorage.setItem('dino-leaderboard', JSON.stringify(this.leaderboard));
    }

    private saveHighScore(): void {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dino-highscore', this.highScore.toString());
        }
        this.saveToLeaderboard();
    }

    private spawnObstacle(): void {
        const x = this.canvas.width + 200; 
        
        // Séparation minimale entre TOUS les obstacles
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (lastObstacle) {
                // La distance minimale augmente avec la vitesse pour laisser le temps de réagir
                const minDistance = (200 + this.gameSpeed * 12) * this.scaleFactor;
                if (x - (lastObstacle.x + lastObstacle.width) < minDistance) {
                    return; // Trop proche, on attend le prochain cycle
                }
            }
        }

        const availableObstacles = this.zoneManager.getAvailableObstacles();
        const obstacleType = availableObstacles[Math.floor(Math.random() * availableObstacles.length)] || '';
        
        if (!obstacleType) return;

        // Probabilité d'apparition : 25% oiseau, 75% ennemi au sol
        if (Math.random() < 0.25) {
            const height = Math.random();
            let y: number;
            // Trois hauteurs différentes pour les oiseaux
            if (height < 0.33) {
                y = this.groundY - 140 * this.scaleFactor; // Haut (sautable ou passer dessous)
            } else if (height < 0.66) {
                y = this.groundY - 90 * this.scaleFactor;  // Milieu (doit s'accroupir)
            } else {
                y = this.groundY - 50 * this.scaleFactor;  // Bas (doit sauter)
            }
            const bird = new Bird(x, y);
            bird.width = 35 * this.scaleFactor;
            bird.height = 30 * this.scaleFactor;
            this.obstacles.push(bird);
        } else {
            if (obstacleType === 'frog') {
                const enemy = new Enemy(x, this.groundY - 50 * this.scaleFactor, 'frog');
                enemy.width = 50 * this.scaleFactor;
                enemy.height = 40 * this.scaleFactor;
                this.obstacles.push(enemy);
            } else if (obstacleType === 'ladybug') {
                const enemy = new Enemy(x, this.groundY - 45 * this.scaleFactor, 'ladybug');
                enemy.width = 45 * this.scaleFactor;
                enemy.height = 45 * this.scaleFactor;
                this.obstacles.push(enemy);
            } else if (obstacleType === 'souris') {
                const enemy = new Enemy(x, this.groundY - 35 * this.scaleFactor, 'souris');
                enemy.width = 50 * this.scaleFactor;
                enemy.height = 30 * this.scaleFactor;
                this.obstacles.push(enemy);
            } else if (obstacleType === 'falling') {
                const enemy = new FallingEnemy(x, -100, this.groundY);
                enemy.width = 60 * this.scaleFactor;
                enemy.height = 60 * this.scaleFactor;
                this.obstacles.push(enemy);
            } else if (obstacleType === 'zombie') {
                const enemy = new Enemy(x, this.groundY - 80 * this.scaleFactor, 'zombie');
                enemy.width = 60 * this.scaleFactor;
                enemy.height = 80 * this.scaleFactor;
                this.obstacles.push(enemy);
            } else if (['sedan', 'police', 'taxi', 'truck'].includes(obstacleType)) {
                // Utiliser la classe Enemy avec un hack temporaire ou créer une nouvelle classe
                // Pour faire simple, on utilise Enemy mais on change le chemin d'image
                const enemy = new Enemy(x, this.groundY - 50 * this.scaleFactor, 'frog'); // On triche sur le type
                enemy.width = 80 * this.scaleFactor;
                enemy.height = 50 * this.scaleFactor;
                
                // On surcharge le chargement d'image pour les voitures
                const carImg = new Image();
                let carPath = 'assets/enemies/sol/Cars/sedan.png';
                if (obstacleType === 'police') carPath = 'assets/enemies/sol/Cars/police.png';
                if (obstacleType === 'taxi') carPath = 'assets/enemies/sol/Cars/taxi.png';
                if (obstacleType === 'truck') {
                    carPath = 'assets/enemies/sol/Cars/truck.png';
                    enemy.width = 100 * this.scaleFactor;
                    enemy.height = 60 * this.scaleFactor;
                    enemy.y = this.groundY - 60 * this.scaleFactor;
                }
                carImg.src = carPath;
                
                // Utilisation de any pour accéder aux propriétés privées pour ce hack rapide
                (enemy as any).imageCache.set(carPath, carImg);
                (enemy as any).sprites.walk = [carPath.split('/').pop()?.replace('.png', '')];
                (enemy as any).enemyType = 'cars'; // Pour le path dans draw
                this.obstacles.push(enemy);
            }
        }
    }

    private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
        const margin = 6; // Marge pour collision plus juste
        return (
            obj1.x + margin < obj2.x + obj2.width - margin &&
            obj1.x + obj1.width - margin > obj2.x + margin &&
            obj1.y + margin < obj2.y + obj2.height - margin &&
            obj1.y + obj1.height - margin > obj2.y + margin
        );
    }

    private gameOver(): void {
        this.isGameOver = true;
        this.isPlaying = false;
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playCollision();
        this.saveHighScore();
        this.gameOverElement.style.display = 'block';
    }

    private gameLoop(): void {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        if (this.isPlaying && !this.isPaused) {
            // Mise à jour du score et de la distance
            this.score += 0.1;
            this.totalDistance += this.gameSpeed / 60; // Distance basée sur la vitesse
            this.zoneManager.updateDistance(this.gameSpeed / 60);
            this.updateScore();

            // Vérifier le changement de zone
            const currentZone = this.zoneManager.getCurrentZone();
            if (this.totalDistance - this.lastZoneCheck >= currentZone.distanceToNext / 10) { // Ajusté pour la démo
                this.lastZoneCheck = this.totalDistance;
                this.background.updateZone();
                this.ground.reset();
                this.weatherManager.fetchWeather();
                console.log(`Nouvelle zone: ${currentZone.name}`);
            }

            // Augmentation progressive de la vitesse
            if (this.score > 0 && Math.floor(this.score) % 100 === 0) {
                this.gameSpeed = Math.min(6 + Math.floor(this.score / 100) * 0.5, 15) * this.scaleFactor;
            }

            // Spawn des obstacles
            this.obstacleTimer++;
            if (this.obstacleTimer > this.obstacleInterval) {
                this.spawnObstacle();
                this.obstacleTimer = 0;
                this.obstacleInterval = 60 + Math.random() * 80;
            }

            // Mise à jour des obstacles
            this.obstacles = this.obstacles.filter(obs => {
                obs.update(this.gameSpeed);
                return obs.x + obs.width > -50;
            });

            // Vérification des collisions
            for (const obs of this.obstacles) {
                if (this.checkCollision(this.dino, obs)) {
                    this.gameOver();
                    break;
                }
            }

            // Mise à jour du dino, du sol et du background
            this.dino.update();
            this.background.update(this.gameSpeed);
            
            // Gérer la physique du dinosaure avec les dimensions dynamiques
            if (this.dino.y >= this.groundY - this.dino.height) {
                this.dino.y = this.groundY - this.dino.height;
                this.dino.velocityY = 0;
                this.dino.grounded = true;
            }
            
            // Gérer l'accroupissement
            if (this.dino.ducking) {
                this.dino.height = this.dino.duckHeight * this.scaleFactor;
                this.dino.y = this.groundY - this.dino.height;
            } else if (this.dino.grounded) {
                this.dino.height = this.dino.normalHeight * this.scaleFactor;
                this.dino.y = this.groundY - this.dino.height;
            }
            
            this.ground.update(this.gameSpeed);
        }

        // Dessin
        this.background.draw(this.ctx);
        this.ground.draw(this.ctx);
        this.dino.draw(this.ctx);
        
        for (const obs of this.obstacles) {
            obs.draw(this.ctx);
        }

        // Affichage "Appuyez sur espace pour commencer"
        if (!this.isPlaying && !this.isGameOver) {
            this.ctx.fillStyle = '#2F4F4F';
            this.ctx.font = `${16 * this.scaleFactor}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Appuyez sur ESPACE pour commencer', this.canvasWidth / 2, this.canvasHeight / 3);
            this.ctx.textAlign = 'left';
        }

        // Affichage PAUSE
        if (this.isPaused) {
            this.drawPauseScreen();
        }

        // Affichage LEADERBOARD sur game over
        if (this.isGameOver) {
            this.drawLeaderboard();
        }

        // Affichage météo
        this.drawWeather();

        requestAnimationFrame(() => this.gameLoop());
    }

    private drawPauseScreen(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Fond pour le texte de pause
        const pauseWidth = 300 * this.scaleFactor;
        const pauseHeight = 150 * this.scaleFactor;
        const pauseX = (this.canvasWidth - pauseWidth) / 2;
        const pauseY = (this.canvasHeight - pauseHeight) / 2;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(pauseX, pauseY, pauseWidth, pauseHeight);
        
        this.ctx.strokeStyle = '#2F4F4F';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(pauseX, pauseY, pauseWidth, pauseHeight);
        
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.font = `bold ${36 * this.scaleFactor}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSE', this.canvasWidth / 2, this.canvasHeight / 2 - 10 * this.scaleFactor);
        
        this.ctx.font = `${18 * this.scaleFactor}px Arial`;
        this.ctx.fillText('Appuyez sur P pour reprendre', this.canvasWidth / 2, this.canvasHeight / 2 + 30 * this.scaleFactor);
        this.ctx.textAlign = 'left';
    }

    private drawLeaderboard(): void {
        const startX = this.canvasWidth - 200 * this.scaleFactor;
        const startY = 40 * this.scaleFactor;
        const boxWidth = 180 * this.scaleFactor;
        const boxHeight = 160 * this.scaleFactor;
        
        // Fond du leaderboard
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(startX - 10 * this.scaleFactor, startY - 25 * this.scaleFactor, boxWidth, boxHeight);
        
        // Bordure
        this.ctx.strokeStyle = '#2F4F4F';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX - 10 * this.scaleFactor, startY - 25 * this.scaleFactor, boxWidth, boxHeight);
        
        // Titre
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.font = `bold ${16 * this.scaleFactor}px Arial`;
        this.ctx.fillText('🏆 TOP SCORES', startX, startY);
        
        // Scores
        this.ctx.font = `${14 * this.scaleFactor}px Arial`;
        for (let i = 0; i < this.leaderboard.length; i++) {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
            this.ctx.fillText(`${medal} ${this.leaderboard[i]}`, startX, startY + 30 * this.scaleFactor + i * 25 * this.scaleFactor);
        }
        
        if (this.leaderboard.length === 0) {
            this.ctx.fillStyle = '#999';
            this.ctx.fillText('Aucun score', startX, startY + 35 * this.scaleFactor);
        }
    }

    private drawWeather(): void {
        const weather = this.weatherManager.getWeatherData();
        if (!weather) return;

        const startX = 20 * this.scaleFactor;
        const startY = 40 * this.scaleFactor;
        const boxWidth = 160 * this.scaleFactor;
        const boxHeight = 80 * this.scaleFactor;
        
        // Fond météo
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(startX - 10 * this.scaleFactor, startY - 25 * this.scaleFactor, boxWidth, boxHeight);
        
        // Bordure
        this.ctx.strokeStyle = '#2F4F4F';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX - 10 * this.scaleFactor, startY - 25 * this.scaleFactor, boxWidth, boxHeight);
        
        // Informations météo
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.font = `bold ${16 * this.scaleFactor}px Arial`;
        this.ctx.fillText(`${weather.icon} ${weather.temperature}°C`, startX, startY);
        
        this.ctx.font = `${12 * this.scaleFactor}px Arial`;
        this.ctx.fillText(weather.description, startX, startY + 20 * this.scaleFactor);
        
        this.ctx.font = `${11 * this.scaleFactor}px Arial`;
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('Paris, FR', startX, startY + 40 * this.scaleFactor);

        // Changer la couleur de fond selon la météo
        document.body.style.backgroundColor = this.weatherManager.getBackgroundColor();
    }
}

// Démarrage du jeu
new Game();
