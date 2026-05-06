export class AvatarManager {
    static instance;
    avatars = [];
    selectedAvatar = 'adventurer'; // Par défaut
    static getInstance() {
        if (!AvatarManager.instance) {
            AvatarManager.instance = new AvatarManager();
        }
        return AvatarManager.instance;
    }
    constructor() {
        this.initializeAvatars();
    }
    initializeAvatars() {
        // Characters (Default - multiples couleurs)
        const colors = ['beige', 'green', 'pink', 'purple', 'yellow'];
        colors.forEach(color => {
            this.avatars.push({
                id: `character_${color}`,
                name: `Personnage ${color.charAt(0).toUpperCase() + color.slice(1)}`,
                category: 'character',
                path: `assets/personnages/Default`,
                sprites: {
                    idle: `character_${color}_idle.png`,
                    walk: [`character_${color}_walk_a.png`, `character_${color}_walk_b.png`],
                    jump: `character_${color}_jump.png`,
                    hurt: `character_${color}_hit.png`,
                    duck: `character_${color}_duck.png`
                }
            });
        });
        // Aventurier (utilisé comme défaut à la place de player)
        this.avatars.push({
            id: 'adventurer',
            name: 'Aventurier',
            category: 'adventurer',
            path: 'assets/personnages/Adventurer',
            sprites: {
                idle: 'adventurer_idle.png',
                walk: ['adventurer_walk1.png', 'adventurer_walk2.png'],
                jump: 'adventurer_jump.png',
                hurt: 'adventurer_hurt.png',
                duck: 'adventurer_duck.png'
            }
        });
        // Female
        this.avatars.push({
            id: 'female',
            name: 'Femme',
            category: 'female',
            path: 'assets/personnages/Female',
            sprites: {
                idle: 'female_idle.png',
                walk: ['female_walk1.png', 'female_walk2.png'],
                jump: 'female_jump.png',
                hurt: 'female_hurt.png',
                duck: 'female_duck.png'
            }
        });
        // Soldier
        this.avatars.push({
            id: 'soldier',
            name: 'Soldat',
            category: 'soldier',
            path: 'assets/personnages/Soldier',
            sprites: {
                idle: 'soldier_idle.png',
                walk: ['soldier_walk1.png', 'soldier_walk2.png'],
                jump: 'soldier_jump.png',
                hurt: 'soldier_hurt.png',
                duck: 'soldier_duck.png'
            }
        });
        // Robots
        const robotColors = ['blue', 'green', 'red', 'yellow'];
        robotColors.forEach(color => {
            this.avatars.push({
                id: `robot_${color}`,
                name: `Robot ${color.charAt(0).toUpperCase() + color.slice(1)}`,
                category: 'robot',
                path: 'assets/personnages/robot',
                sprites: {
                    idle: `robot_${color}Drive1.png`,
                    walk: [`robot_${color}Drive1.png`, `robot_${color}Drive2.png`],
                    jump: `robot_${color}Jump.png`,
                    hurt: `robot_${color}Hurt.png`,
                    duck: `robot_${color}Drive1.png` // Pas de sprite duck pour les robots
                }
            });
        });
    }
    getAvatars() {
        return this.avatars;
    }
    getAvatar(id) {
        return this.avatars.find(avatar => avatar.id === id);
    }
    selectAvatar(id) {
        if (this.getAvatar(id)) {
            this.selectedAvatar = id;
            localStorage.setItem('selected-avatar', id);
        }
    }
    getSelectedAvatar() {
        // Charger depuis localStorage ou utiliser le défaut
        const saved = localStorage.getItem('selected-avatar');
        if (saved) {
            const avatar = this.getAvatar(saved);
            if (avatar) {
                this.selectedAvatar = saved;
                return avatar;
            }
        }
        return this.getAvatar(this.selectedAvatar);
    }
    getAvatarsByCategory(category) {
        return this.avatars.filter(avatar => avatar.category === category);
    }
}
//# sourceMappingURL=AvatarManager.js.map