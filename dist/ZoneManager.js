export class ZoneManager {
    static instance;
    zones = [];
    currentZone = 0;
    totalDistance = 0;
    zoneChangeDistance = 2000; // Distance avant de changer de zone
    nextZoneAtScore = 100; // Score auquel la prochaine zone sera déclenchée
    static getInstance() {
        if (!ZoneManager.instance) {
            ZoneManager.instance = new ZoneManager();
        }
        return ZoneManager.instance;
    }
    constructor() {
        this.initializeZones();
    }
    initializeZones() {
        // Zone 1: Village calme
        this.zones.push({
            id: 0,
            name: "Village Calme",
            backgroundTile: 'assets/map/Backgrounds/tile_0001.png',
            groundTile: 'assets/map/Tiles/tile_0000.png',
            houses: [
                { x: 300, y: 200, width: 128, height: 128, type: 'medium', color: 'beige', roofColor: 'red' },
                { x: 800, y: 220, width: 64, height: 64, type: 'small', color: 'gray', roofColor: 'grey' }
            ],
            distanceToNext: 1500,
            obstacles: ['ladybug']
        });
        // Zone 2: Banlieue
        this.zones.push({
            id: 1,
            name: "Banlieue",
            backgroundTile: 'assets/map/Backgrounds/tile_0002.png',
            groundTile: 'assets/map/Tiles/tile_0001.png',
            houses: [
                { x: 200, y: 150, width: 192, height: 192, type: 'large', color: 'dark', roofColor: 'yellow' },
                { x: 600, y: 200, width: 128, height: 128, type: 'medium', color: 'beige', roofColor: 'red' },
                { x: 1000, y: 220, width: 64, height: 64, type: 'small', color: 'gray', roofColor: 'grey' }
            ],
            distanceToNext: 2000,
            obstacles: ['ladybug', 'souris', 'falling', 'zombie']
        });
        // Zone 3: Zone industrielle
        this.zones.push({
            id: 2,
            name: "Zone Industrielle",
            backgroundTile: 'assets/map/Backgrounds/tile_0003.png',
            groundTile: 'assets/map/Tiles/tile_0002.png',
            houses: [
                { x: 300, y: 100, width: 256, height: 256, type: 'large', color: 'dark', roofColor: 'grey' },
                { x: 800, y: 100, width: 256, height: 256, type: 'large', color: 'gray', roofColor: 'grey' }
            ],
            distanceToNext: 2500,
            obstacles: ['ladybug', 'souris', 'falling', 'zombie', 'truck', 'sedan']
        });
        // Zone 4: Centre-ville
        this.zones.push({
            id: 3,
            name: "Centre-ville",
            backgroundTile: 'assets/map/Backgrounds/tile_0005.png',
            groundTile: 'assets/map/Tiles/tile_0004.png',
            houses: [
                { x: 100, y: 50, width: 320, height: 320, type: 'large', color: 'beige', roofColor: 'red' },
                { x: 600, y: 50, width: 320, height: 320, type: 'large', color: 'dark', roofColor: 'yellow' }
            ],
            distanceToNext: 3000,
            obstacles: ['souris', 'falling', 'zombie', 'police', 'taxi', 'sedan']
        });
    }
    getCurrentZone() {
        if (this.zones.length === 0) {
            throw new Error('No zones available');
        }
        if (this.currentZone >= 0 && this.currentZone < this.zones.length) {
            return this.zones[this.currentZone];
        }
        return this.zones[0];
    }
    updateDistance(distance) {
        this.totalDistance += distance;
    }
    /**
     * Vérifie si le score actuel déclenche un changement de zone (tous les 100 points).
     * @returns true si un changement de zone a eu lieu
     */
    updateScore(score) {
        if (score >= this.nextZoneAtScore) {
            this.nextZone();
            this.nextZoneAtScore += 100;
            return true;
        }
        return false;
    }
    nextZone() {
        if (this.currentZone < this.zones.length - 1) {
            this.currentZone++;
            this.totalDistance = 0;
            console.log(`Changement de zone: ${this.getCurrentZone().name}`);
        }
        else {
            // Revenir à la première zone en boucle
            this.currentZone = 0;
            this.totalDistance = 0;
            console.log(`Retour à la zone: ${this.getCurrentZone().name}`);
        }
    }
    getZoneProgress() {
        const currentZone = this.getCurrentZone();
        return (this.totalDistance / currentZone.distanceToNext) * 100;
    }
    reset() {
        this.currentZone = 0;
        this.totalDistance = 0;
        this.nextZoneAtScore = 100;
    }
    getAvailableObstacles() {
        return this.getCurrentZone().obstacles;
    }
    getHouseSpritePaths(house) {
        const colorPrefix = house.color === 'beige' ? 'houseBeige' :
            house.color === 'dark' ? 'houseDark' : 'houseGray';
        const roofPrefix = house.roofColor === 'red' ? 'roofRed' :
            house.roofColor === 'grey' ? 'roofGrey' : 'roofYellow';
        return {
            body: `assets/house/Tiles/${colorPrefix}.png`,
            roof: `assets/house/Tiles/${roofPrefix}Mid.png`
        };
    }
}
//# sourceMappingURL=ZoneManager.js.map