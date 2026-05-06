export interface House {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'small' | 'medium' | 'large';
    color: 'beige' | 'dark' | 'gray';
    roofColor: 'red' | 'grey' | 'yellow';
}

export interface Zone {
    id: number;
    name: string;
    backgroundTile: string;
    groundTile: string;
    houses: House[];
    distanceToNext: number;
    obstacles: string[];
}

export class ZoneManager {
    private static instance: ZoneManager;
    private zones: Zone[] = [];
    private currentZone: number = 0;
    private totalDistance: number = 0;
    private zoneChangeDistance: number = 2000; // Distance avant de changer de zone

    static getInstance(): ZoneManager {
        if (!ZoneManager.instance) {
            ZoneManager.instance = new ZoneManager();
        }
        return ZoneManager.instance;
    }

    constructor() {
        this.initializeZones();
    }

    private initializeZones(): void {
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
            obstacles: ['frog', 'ladybug']
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
            obstacles: ['frog', 'ladybug', 'souris', 'falling', 'zombie']
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
            obstacles: ['ladybug', 'souris', 'falling', 'zombie']
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
            obstacles: ['frog', 'souris', 'falling', 'zombie']
        });
    }

    getCurrentZone(): Zone {
        if (this.zones.length === 0) {
            throw new Error('No zones available');
        }
        if (this.currentZone >= 0 && this.currentZone < this.zones.length) {
            return this.zones[this.currentZone]!;
        }
        return this.zones[0]!;
    }

    updateDistance(distance: number): void {
        this.totalDistance += distance;
        
        // Vérifier si on doit changer de zone
        const currentZone = this.getCurrentZone();
        if (this.totalDistance >= currentZone.distanceToNext) {
            this.nextZone();
        }
    }

    private nextZone(): void {
        if (this.currentZone < this.zones.length - 1) {
            this.currentZone++;
            this.totalDistance = 0;
            console.log(`Changement de zone: ${this.getCurrentZone().name}`);
        } else {
            // Revenir à la première zone en boucle
            this.currentZone = 0;
            this.totalDistance = 0;
            console.log(`Retour à la zone: ${this.getCurrentZone().name}`);
        }
    }

    getZoneProgress(): number {
        const currentZone = this.getCurrentZone();
        return (this.totalDistance / currentZone.distanceToNext) * 100;
    }

    reset(): void {
        this.currentZone = 0;
        this.totalDistance = 0;
    }

    getAvailableObstacles(): string[] {
        return this.getCurrentZone().obstacles;
    }

    getHouseSpritePaths(house: House): { body: string, roof: string } {
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
