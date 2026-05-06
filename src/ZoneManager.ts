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
    background: {
        head: string[];
        body: string[];
        foot: string[];
    };
    platforms: string[];
    obstacles: string[];
    distanceToNext: number;
}

export class ZoneManager {
    private static instance: ZoneManager;
    private zones: Zone[] = [];
    private currentZone: number = 0;
    private totalDistance: number = 0;
    private zoneChangeDistance: number = 2000; // Distance avant de changer de zone
    private nextZoneAtScore: number = 100; // Score auquel la prochaine zone sera déclenchée

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
        // Zone 1: Zone Blanche (Village)
        this.zones.push({
            id: 0,
            name: "Zone Blanche",
            background: {
                head: ['assets/map/zones/white_head.png'],
                body: ['assets/map/zones/white_body.png'],
                foot: [
                    'assets/map/zones/white_foot1.png', 
                    'assets/map/zones/white_foot2.png',
                    'assets/map/zones/white_foot3.png',
                    'assets/map/zones/white_foot4.png'
                ]
            },
            platforms: ['assets/map/plateformes/white_p1.png', 'assets/map/plateformes/white_p2.png', 'assets/map/plateformes/white_p3.png'],
            obstacles: ['ladybug', 'mouse', 'barrier'],
            distanceToNext: 1500
        });

        // Zone 2: Zone Verte (Forêt)
        this.zones.push({
            id: 1,
            name: "Zone Verte",
            background: {
                head: ['assets/map/zones/green_head.png'],
                body: ['assets/map/zones/green_body.png'],
                foot: ['assets/map/zones/green_foot1.png', 'assets/map/zones/green_foot2.png']
            },
            platforms: ['assets/map/plateformes/green_p1.png', 'assets/map/plateformes/green_p2.png', 'assets/map/plateformes/green_p3.png'],
            obstacles: ['ladybug', 'souris', 'falling', 'zombie', 'barrier', 'block'],
            distanceToNext: 2000
        });

        // Zone 3: Zone Orange (Désert)
        this.zones.push({
            id: 2,
            name: "Zone Orange",
            background: {
                head: ['assets/map/zones/orange_head.png'],
                body: ['assets/map/zones/orange_body.png'],
                foot: ['assets/map/zones/orange_foot1.png', 'assets/map/zones/orange_foot2.png']
            },
            platforms: ['assets/map/plateformes/orange_p1.png', 'assets/map/plateformes/orange_p2.png', 'assets/map/plateformes/orange_p3.png'],
            obstacles: ['ladybug', 'souris', 'falling', 'zombie', 'truck', 'sedan', 'barrier', 'block', 'bus'],
            distanceToNext: 2500
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
    }

    /**
     * Vérifie si le score actuel déclenche un changement de zone (tous les 100 points).
     * @returns true si un changement de zone a eu lieu
     */
    updateScore(score: number): boolean {
        if (score >= this.nextZoneAtScore) {
            this.nextZone();
            this.nextZoneAtScore += 100;
            return true;
        }
        return false;
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
        this.nextZoneAtScore = 100;
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
