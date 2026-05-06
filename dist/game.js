import { Dino } from './Dino.js';
import { Enemy } from './Enemy.js';
import { Bird } from './Bird.js';
import { Ground } from './Ground.js';
import { Background } from './Background.js';
import { AudioManager, WeatherManager } from './Utils.js';
import { ZoneManager } from './ZoneManager.js';
import { FallingEnemy } from './FallingEnemy.js';
class Game {
    canvas;
    ctx;
    dino;
    obstacles = [];
    ground;
    background;
    zoneManager;
    score = 0;
    highScore = 0;
    gameSpeed = 6;
    isGameOver = false;
    isPlaying = false;
    isPaused = false;
    leaderboard = [];
    obstacleTimer = 0;
    obstacleInterval = 100;
    scoreElement;
    gameOverElement;
    keys = {};
    audioManager;
    weatherManager;
    canvasWidth = 900;
    canvasHeight = 400;
    groundY = 350;
    scaleFactor = 1;
    totalDistance = 0;
    lastZoneCheck = 0;
    particles = [];
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('game-over');
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
    async initializeGame() {
        // Initialiser les objets directement (plus besoin de spritesheets)
        this.dino = new Dino();
        this.ground = new Ground();
        this.background = new Background(this.canvasWidth, this.canvasHeight);
        // Configurer le canvas après l'initialisation des objets
        this.setupCanvas();
        this.gameLoop();
    }
    setupCanvas() {
        // Obtenir les dimensions de la fenêtre
        const container = document.getElementById('game-container');
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
    updateGamePositions() {
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
        // Les positions sont mises à jour, la logique de zone est gérée dans gameLoop
    }
    setupInputs() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (!this.isPlaying && this.isGameOver) {
                    this.reset();
                }
                else if (this.isPlaying) {
                    this.dino.jump();
                    this.audioManager.playJump();
                }
                else if (!this.isPlaying && !this.isGameOver) {
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
        // Gestion des boutons de modification
        const toggleTimeBtn = document.getElementById('toggle-time');
        const cycleWeatherBtn = document.getElementById('cycle-weather');
        if (toggleTimeBtn) {
            toggleTimeBtn.addEventListener('click', () => {
                this.weatherManager.toggleTime();
                const isNight = this.weatherManager.getIsNight();
                toggleTimeBtn.textContent = isNight ? '☀️' : '🌙';
                // Forcer la mise à jour immédiate de la couleur de fond
                document.body.style.backgroundColor = this.weatherManager.getBackgroundColor();
            });
        }
        if (cycleWeatherBtn) {
            cycleWeatherBtn.addEventListener('click', () => {
                this.weatherManager.cycleWeather();
                // Forcer la mise à jour immédiate
                document.body.style.backgroundColor = this.weatherManager.getBackgroundColor();
            });
        }
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ArrowDown') {
                this.dino.duck(false);
            }
        });
    }
    start() {
        this.isPlaying = true;
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
    reset() {
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
    updateScore() {
        const currentZone = this.zoneManager.getCurrentZone();
        this.scoreElement.textContent = `Score: ${Math.floor(this.score).toString().padStart(5, '0')} | Zone: ${currentZone.name}`;
    }
    loadHighScore() {
        const saved = localStorage.getItem('dino-highscore');
        if (saved) {
            this.highScore = parseInt(saved);
        }
        const savedLeaderboard = localStorage.getItem('dino-leaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }
    saveToLeaderboard() {
        this.leaderboard.push(Math.floor(this.score));
        this.leaderboard.sort((a, b) => b - a);
        this.leaderboard = this.leaderboard.slice(0, 5); // Garder top 5
        localStorage.setItem('dino-leaderboard', JSON.stringify(this.leaderboard));
    }
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dino-highscore', this.highScore.toString());
        }
        this.saveToLeaderboard();
    }
    spawnObstacle() {
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
        if (!obstacleType)
            return;
        // Probabilité d'apparition : 25% oiseau, 75% ennemi au sol
        if (Math.random() < 0.25) {
            const height = Math.random();
            let y;
            // Trois hauteurs différentes pour les oiseaux
            if (height < 0.33) {
                y = this.groundY - 140 * this.scaleFactor; // Haut (sautable ou passer dessous)
            }
            else if (height < 0.66) {
                y = this.groundY - 90 * this.scaleFactor; // Milieu (doit s'accroupir)
            }
            else {
                y = this.groundY - 50 * this.scaleFactor; // Bas (doit sauter)
            }
            const bird = new Bird(x, y);
            bird.width = 35 * this.scaleFactor;
            bird.height = 30 * this.scaleFactor;
            this.obstacles.push(bird);
        }
        else {
            if (obstacleType === 'frog') {
                const enemy = new Enemy(x, this.groundY - 50 * this.scaleFactor, 'frog');
                enemy.width = 50 * this.scaleFactor;
                enemy.height = 40 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
            else if (obstacleType === 'ladybug') {
                const enemy = new Enemy(x, this.groundY - 45 * this.scaleFactor, 'ladybug');
                enemy.width = 45 * this.scaleFactor;
                enemy.height = 45 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
            else if (obstacleType === 'souris') {
                const enemy = new Enemy(x, this.groundY - 35 * this.scaleFactor, 'souris');
                enemy.width = 50 * this.scaleFactor;
                enemy.height = 30 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
            else if (obstacleType === 'falling') {
                const enemy = new FallingEnemy(x, -100, this.groundY);
                enemy.width = 60 * this.scaleFactor;
                enemy.height = 60 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
            else if (obstacleType === 'zombie') {
                const enemy = new Enemy(x, this.groundY - 80 * this.scaleFactor, 'zombie');
                enemy.width = 60 * this.scaleFactor;
                enemy.height = 80 * this.scaleFactor;
                this.obstacles.push(enemy);
            }
            else if (['sedan', 'police', 'taxi', 'truck'].includes(obstacleType)) {
                // Utiliser la classe Enemy avec un hack temporaire ou créer une nouvelle classe
                // Pour faire simple, on utilise Enemy mais on change le chemin d'image
                const enemy = new Enemy(x, this.groundY - 50 * this.scaleFactor, 'frog'); // On triche sur le type
                enemy.width = 80 * this.scaleFactor;
                enemy.height = 50 * this.scaleFactor;
                // On surcharge le chargement d'image pour les voitures
                const carImg = new Image();
                let carPath = 'assets/enemies/sol/Cars/sedan.png';
                if (obstacleType === 'police')
                    carPath = 'assets/enemies/sol/Cars/police.png';
                if (obstacleType === 'taxi')
                    carPath = 'assets/enemies/sol/Cars/taxi.png';
                if (obstacleType === 'truck') {
                    carPath = 'assets/enemies/sol/Cars/truck.png';
                    enemy.width = 100 * this.scaleFactor;
                    enemy.height = 60 * this.scaleFactor;
                    enemy.y = this.groundY - 60 * this.scaleFactor;
                }
                carImg.src = carPath;
                // Utilisation de any pour accéder aux propriétés privées pour ce hack rapide
                enemy.imageCache.set(carPath, carImg);
                enemy.sprites.walk = [carPath.split('/').pop()?.replace('.png', '')];
                enemy.enemyType = 'cars'; // Pour le path dans draw
                this.obstacles.push(enemy);
            }
        }
    }
    checkCollision(obj1, obj2) {
        const margin = 6; // Marge pour collision plus juste
        return (obj1.x + margin < obj2.x + obj2.width - margin &&
            obj1.x + obj1.width - margin > obj2.x + margin &&
            obj1.y + margin < obj2.y + obj2.height - margin &&
            obj1.y + obj1.height - margin > obj2.y + margin);
    }
    gameOver() {
        this.isGameOver = true;
        this.isPlaying = false;
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playCollision();
        this.saveHighScore();
        this.gameOverElement.style.display = 'block';
    }
    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        if (this.isPlaying && !this.isPaused) {
            // Mise à jour du score et de la distance
            this.score += 0.1;
            this.totalDistance += this.gameSpeed / 60;
            this.zoneManager.updateDistance(this.gameSpeed / 60);
            this.updateScore();
            // Changement de zone tous les 100 points
            if (this.zoneManager.updateScore(this.score)) {
                this.background.updateZone();
                this.ground.reset();
                this.weatherManager.fetchWeather();
                console.log(`Nouvelle zone: ${this.zoneManager.getCurrentZone().name}`);
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
            }
            else if (this.dino.grounded) {
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
        // Affichage météo et effets
        this.drawWeather();
        this.drawWeatherEffects();
        // Overlay de nuit
        if (this.weatherManager.getIsNight()) {
            this.ctx.fillStyle = 'rgba(26, 26, 46, 0.4)';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        requestAnimationFrame(() => this.gameLoop());
    }
    drawWeatherEffects() {
        const weather = this.weatherManager.getWeatherData();
        if (!weather)
            return;
        const code = weather.weatherCode;
        // Initialiser les particules si nécessaire
        if (this.particles.length === 0 && (code >= 61 || code === 45)) {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: Math.random() * this.canvasWidth,
                    y: Math.random() * this.canvasHeight,
                    speed: 5 + Math.random() * 10,
                    length: 10 + Math.random() * 15
                });
            }
        }
        if (code >= 61 && code <= 65) { // Pluie
            this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.8)';
            this.ctx.lineWidth = 3; // Plus épais (était 1)
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.length * 2); // Plus long (était x1)
                this.ctx.stroke();
                p.y += p.speed;
                if (p.y > this.canvasHeight) {
                    p.y = -p.length;
                    p.x = Math.random() * this.canvasWidth;
                }
            });
        }
        else if (code >= 71 && code <= 75) { // Neige
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); // Plus gros (était 2)
                this.ctx.fill();
                p.y += p.speed * 0.3;
                p.x += Math.sin(p.y / 20) * 1;
                if (p.y > this.canvasHeight) {
                    p.y = -5;
                    p.x = Math.random() * this.canvasWidth;
                }
            });
        }
        else if (code >= 95) { // Orage
            if (Math.random() > 0.98) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            }
            // Ajouter de la pluie fine pour l'orage
            this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.4)';
            this.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + p.length);
                this.ctx.stroke();
                p.y += p.speed * 1.5;
                if (p.y > this.canvasHeight)
                    p.y = -p.length;
            });
        }
        else if (code === 45 || code === 48) { // Brouillard
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        else {
            // Nettoyer les particules si le temps est clair
            if (this.particles.length > 0)
                this.particles = [];
        }
    }
    drawPauseScreen() {
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
    drawLeaderboard() {
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
    drawWeather() {
        const weather = this.weatherManager.getWeatherData();
        if (!weather)
            return;
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
        this.ctx.fillText(this.weatherManager.getManualWeatherOverride() ? 'Mode Manuel' : 'Position Locale', startX, startY + 40 * this.scaleFactor);
        // Mettre à jour l'icône du bouton si pas d'override manuel
        const toggleTimeBtn = document.getElementById('toggle-time');
        if (toggleTimeBtn && !this.weatherManager.getManualTimeOverride()) {
            const isNight = this.weatherManager.getIsNight();
            toggleTimeBtn.textContent = isNight ? '☀️' : '🌙';
        }
        // Changer la couleur de fond selon la météo
        document.body.style.backgroundColor = this.weatherManager.getBackgroundColor();
    }
}
// Démarrage du jeu
new Game();
//# sourceMappingURL=game.js.map