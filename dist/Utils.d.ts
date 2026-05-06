export interface WeatherData {
    temperature: number;
    weatherCode: number;
    description: string;
    icon: string;
}
export declare class AudioManager {
    private audioContext;
    private backgroundMusic;
    private jumpSound;
    private collisionSound;
    private isMuted;
    private soundsAvailable;
    loadSounds(): Promise<void>;
    playJump(): void;
    playCollision(): void;
    playBackgroundMusic(): void;
    stopBackgroundMusic(): void;
    toggleMute(): void;
}
export declare class WeatherManager {
    private weatherData;
    private lastUpdate;
    private readonly UPDATE_INTERVAL;
    fetchWeather(): Promise<void>;
    private getWeatherDescription;
    private getWeatherIcon;
    getWeatherData(): WeatherData | null;
    getBackgroundColor(): string;
}
//# sourceMappingURL=Utils.d.ts.map