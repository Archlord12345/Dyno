export class AudioManager {
    audioContext = null;
    backgroundMusic = null;
    jumpSound = null;
    collisionSound = null;
    isMuted = false;
    soundsAvailable = false;
    async loadSounds() {
        try {
            const soundFiles = [
                { name: 'jump', path: 'assets/Sounds/sfx_jump.ogg' },
                { name: 'collision', path: 'assets/Sounds/sfx_hurt.ogg' }
            ];
            let availableSounds = 0;
            for (const sound of soundFiles) {
                try {
                    const response = await fetch(sound.path, { method: 'HEAD' });
                    if (response.ok) {
                        availableSounds++;
                        const audio = new Audio(sound.path);
                        audio.volume = 0.3;
                        if (sound.name === 'jump') {
                            this.jumpSound = audio;
                        }
                        else if (sound.name === 'collision') {
                            this.collisionSound = audio;
                            this.collisionSound.volume = 0.6;
                        }
                    }
                }
                catch (e) {
                    // Fichier non trouvé, continuer sans ce son
                }
            }
            this.soundsAvailable = availableSounds > 0;
            if (availableSounds === 0) {
                console.log('Aucun fichier audio trouvé - jeu sans son');
            }
            else {
                console.log(`${availableSounds} fichiers audio chargés`);
            }
        }
        catch (e) {
            console.log('Erreur lors du chargement des sons - jeu sans son');
            this.soundsAvailable = false;
        }
    }
    playJump() {
        if (this.soundsAvailable && !this.isMuted && this.jumpSound) {
            this.jumpSound.currentTime = 0;
            this.jumpSound.play().catch(() => {
                // Silencieux - pas d'erreur dans la console
            });
        }
    }
    playCollision() {
        if (this.soundsAvailable && !this.isMuted && this.collisionSound) {
            this.collisionSound.currentTime = 0;
            this.collisionSound.play().catch(() => {
                // Silencieux - pas d'erreur dans la console
            });
        }
    }
    playBackgroundMusic() {
        if (this.soundsAvailable && !this.isMuted && this.backgroundMusic) {
            this.backgroundMusic.play().catch(() => {
                // Silencieux - pas d'erreur dans la console
            });
        }
    }
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        else if (this.soundsAvailable) {
            this.playBackgroundMusic();
        }
    }
}
export class WeatherManager {
    weatherData = null;
    lastUpdate = 0;
    UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes
    isNight = false;
    manualWeatherIndex = -1;
    manualTimeOverride = false;
    weatherCodes = [0, 3, 45, 61, 71, 95]; // Clear, Cloudy, Fog, Rain, Snow, Thunderstorm
    async fetchWeather() {
        if (this.manualWeatherIndex !== -1 && this.manualTimeOverride)
            return;
        const now = Date.now();
        if (now - this.lastUpdate < this.UPDATE_INTERVAL && this.weatherData) {
            return;
        }
        try {
            // Tenter d'obtenir la position de l'utilisateur
            let lat = 48.8566;
            let lon = 2.3522;
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                }
                catch (e) {
                    console.log('Geolocation access denied or timeout - using default');
                }
            }
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();
            if (this.manualWeatherIndex === -1) {
                this.weatherData = {
                    temperature: Math.round(data.current_weather.temperature),
                    weatherCode: data.current_weather.weathercode,
                    description: this.getWeatherDescription(data.current_weather.weathercode),
                    icon: this.getWeatherIcon(data.current_weather.weathercode)
                };
            }
            // Mettre à jour isNight basé sur is_day si pas d'override manuel
            if (!this.manualTimeOverride) {
                this.isNight = data.current_weather.is_day === 0;
            }
            this.lastUpdate = now;
        }
        catch (e) {
            console.log('Failed to fetch weather data');
            if (!this.weatherData) {
                this.weatherData = {
                    temperature: 20,
                    weatherCode: 0,
                    description: 'Ensoleillé',
                    icon: '☀️'
                };
            }
        }
    }
    toggleTime() {
        this.isNight = !this.isNight;
        this.manualTimeOverride = true;
    }
    cycleWeather() {
        this.manualWeatherIndex = (this.manualWeatherIndex + 1) % this.weatherCodes.length;
        const code = this.weatherCodes[this.manualWeatherIndex];
        this.weatherData = {
            temperature: this.weatherData?.temperature || 20,
            weatherCode: code,
            description: this.getWeatherDescription(code),
            icon: this.getWeatherIcon(code)
        };
    }
    getWeatherDescription(code) {
        const descriptions = {
            0: 'Ensoleillé',
            1: 'Principalement clair',
            2: 'Partiellement nuageux',
            3: 'Nuageux',
            45: 'Brouillard',
            48: 'Brouillard givrant',
            51: 'Bruine légère',
            53: 'Bruine modérée',
            55: 'Bruine dense',
            61: 'Pluie légère',
            63: 'Pluie modérée',
            65: 'Pluie forte',
            71: 'Neige légère',
            73: 'Neige modérée',
            75: 'Neige forte',
            80: 'Averses légères',
            81: 'Averses modérées',
            82: 'Averses violentes',
            95: 'Orage',
            96: 'Orage avec grêle légère',
            99: 'Orage avec grêle forte'
        };
        return descriptions[code] || 'Inconnu';
    }
    getWeatherIcon(code) {
        if (code === 0)
            return '☀️';
        if (code <= 3)
            return '⛅';
        if (code <= 48)
            return '🌫️';
        if (code <= 65)
            return '🌧️';
        if (code <= 75)
            return '❄️';
        if (code <= 99)
            return '⛈️';
        return '🌤️';
    }
    getWeatherData() {
        return this.weatherData;
    }
    getBackgroundColor() {
        if (this.isNight)
            return '#1a1a2e'; // Deep midnight blue for night
        if (!this.weatherData)
            return '#FFFACD';
        const code = this.weatherData.weatherCode;
        if (code === 0)
            return '#FFFACD'; // Ensoleillé - jaune pâle
        if (code <= 3)
            return '#FFDAB9'; // Nuageux - orange clair
        if (code <= 48)
            return '#F5F5DC'; // Brouillard - blanc cassé
        if (code <= 65)
            return '#8FBC8F'; // Pluie - vert doux
        if (code <= 75)
            return '#E8F4F8'; // Neige - bleu très clair
        if (code <= 99)
            return '#8B4513'; // Orage - marron terreux
        return '#FFFACD';
    }
    getIsNight() {
        return this.isNight;
    }
    getManualTimeOverride() {
        return this.manualTimeOverride;
    }
    getManualWeatherOverride() {
        return this.manualWeatherIndex !== -1;
    }
}
//# sourceMappingURL=Utils.js.map