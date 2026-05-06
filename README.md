# Dino Game - Jeu du Dinosaure en TypeScript

Jeu du dinosaure Google recréé en TypeScript avec des fonctionnalités supplémentaires.

## 🚀 Créer ce projet depuis zéro

Ce guide vous explique comment créer ce projet Dino Game étape par étape.

### Étape 1: Initialisation du projet

Commencez par créer un nouveau dossier pour votre projet et initialisez-le :

```bash
mkdir dino-game
cd dino-game

# 1. Initialiser Node.js (crée le fichier package.json)
npm init -y
```

**À quoi sert `npm init -y` ?**
Cette commande prépare votre dossier pour accueillir des bibliothèques externes en créant un fichier `package.json` avec les informations par défaut du projet.

### Étape 2: Installation de TypeScript

```bash
# 2. Installer TypeScript (en tant que dépendance de développement)
npm install --save-dev typescript
```

**À quoi sert cette commande ?**
Elle télécharge le compilateur TypeScript localement dans votre projet pour garantir que tout le monde utilise la même version et que le projet reste portable.

### Étape 3: Configuration de TypeScript

```bash
# 3. Initialiser la configuration TypeScript (crée le fichier tsconfig.json)
npx tsc --init
```

**À quoi sert `npx tsc --init` ?**
Cette commande génère un fichier de configuration `tsconfig.json` indispensable pour définir comment votre code doit être transformé en JavaScript (version cible, dossier de sortie, etc.).

### Étape 4: Configuration personnalisée

Modifiez votre `tsconfig.json` pour correspondre aux besoins du projet :

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ES2015",
    "target": "esnext",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "jsx": "react-jsx",
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

### Étape 5: Installation des dépendances de développement

```bash
# Installer les outils pour le développement
npm install --save-dev concurrently
```

### Étape 6: Configuration des scripts

Modifiez la section `"scripts"` de votre `package.json` :

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "concurrently \"tsc --watch\" \"npx serve . -p 8081\"",
    "start": "npx serve . -p 8081",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Étape 7: Structure des fichiers

Créez la structure de dossiers suivante :

```bash
mkdir src
mkdir songs
```

### Étape 8: Création des fichiers

1. **Créez `src/game.ts`** : Le code source principal du jeu en TypeScript
2. **Créez `index.html`** : La page web qui contiendra le jeu
3. **Ajoutez les fichiers audio** (optionnel) dans le dossier `songs/` :
   - `background.mp3` : Musique de fond
   - `jump.mp3` : Son de saut  
   - `collision.mp3` : Son de collision

### Étape 9: Compilation et lancement

```bash
# Compiler le code TypeScript en JavaScript
npm run build

# Lancer le jeu en mode développement (avec rechargement automatique)
npm run dev

# Lancer uniquement le serveur
npm start
```

Le jeu sera accessible sur http://localhost:8081

### Résumé des commandes

Voici l'ensemble des commandes pour créer le projet :

```bash
# Création et initialisation
mkdir dino-game && cd dino-game
npm init -y

# Installation des dépendances
npm install --save-dev typescript concurrently

# Configuration TypeScript
npx tsc --init

# Création des dossiers
mkdir src songs

# Lancement du développement
npm run dev
```

## Fonctionnalités

- **Gameplay classique** : Sauter et s'accroupir pour éviter les obstacles
- **Pause** : Appuyez sur P pour mettre en pause/reprendre
- **Leaderboard** : Sauvegarde des 5 meilleurs scores
- **Support audio** : Musique de fond et sons de collision
- **Météo en temps réel** : Affichage de la météo actuelle de Paris
- **Fond dynamique** : La couleur de fond change selon la météo

## Contrôles

- `ESPACE` ou `↑` : Sauter
- `↓` : S'accroupir (pour éviter les oiseaux)
- `P` : Pause/Reprendre
- `M` : Mute/Unmute

## Installation et Lancement

```bash
# Installer les dépendances
npm install

# Lancer le jeu en mode développement (avec rechargement automatique)
npm run dev

# Compiler uniquement
npm run build

# Lancer uniquement le serveur
npm start
```

Le jeu sera accessible sur http://localhost:8081

## Fichiers Audio (Optionnel)

Pour activer les sons, ajoutez les fichiers MP3 suivants dans le dossier `songs/` :

- `background.mp3` : Musique de fond (jouée en boucle)
- `jump.mp3` : Son de saut
- `collision.mp3` : Son de collision

Si les fichiers ne sont pas présents, le jeu fonctionnera sans son.

## Météo

Le jeu utilise l'API Open-Meteo (gratuite, sans clé API) pour récupérer la météo en temps réel de Paris. La météo est mise à jour toutes les 10 minutes.

## 🎨 Sources des Sprites et Assets

### Sprites du Dinosaure
Les sprites du dinosaure utilisés dans ce jeu proviennent de collections gratuites d'assets pour jeux vidéo :

**Sites recommandés pour télécharger des sprites :**
- **OpenGameArt.org** : https://opengameart.org/ - Milliers de sprites libres de droits
- **Kenney.nl** : https://kenney.nl/assets - Assets de haute qualité gratuits
- **Itch.io** : https://itch.io/game-assets/free - Plateforme avec nombreux assets gratuits
- **Craftpix.net** : https://craftpix.net/free-assets/ - Sprites pixel art gratuits

### Structure des Sprites dans le projet
```
sprite/
└── dino/
    ├── Idle (1).png ... Idle (10).png     # Animation immobile (10 frames)
    ├── Run (1).png ... Run (8).png        # Animation de course (8 frames)
    ├── Walk (1).png ... Walk (10).png     # Animation de marche (10 frames)
    ├── Jump (1).png ... Jump (12).png     # Animation de saut (12 frames)
    └── Dead (1).png ... Dead (8).png      # Animation de mort (8 frames)
```

### Intégration des Sprites
Le jeu charge automatiquement les sprites depuis le dossier `sprite/dino/` et les intègre avec :
- Système d'animation fluide
- Fallback en pixel art si les sprites ne chargent pas
- Redimensionnement automatique
- Gestion des états (idle, run, jump, dead)

### Termes de recherche recommandés
Pour trouver des sprites similaires :
- "pixel art dinosaur sprite sheet"
- "platformer character sprites"
- "dino game assets"
- "free dinosaur game sprites"

### Autres Sprites du Jeu
Les autres sprites utilisés dans ce jeu (ennemis, oiseaux, etc.) proviennent de :

**Source principale :**
- **Kenney.nl** : https://kenney.nl/assets/category:2D - Assets 2D de haute qualité gratuits

**Catégories utilisées :**
- **Ennemis au sol** : Poulets et kiwis animés
- **Oiseaux volants** : Ptérodactyles pour les obstacles aériens
- **Effets visuels** : Éléments décoratifs et animations

**Pourquoi Kenney.nl ?**
- Assets de qualité professionnelle
- Licences libres pour utilisation commerciale
- Large variété de styles (pixel art, cartoons, etc.)
- Mises à jour régulières et nouvelles collections

### Licences à vérifier
Toujours vérifier les licences des sprites :
- **CC0** : Domaine public (utilisation libre)
- **MIT** : Utilisation libre avec attribution
- **GPL** : Utilisation libre avec partage des modifications
- **Kenney License** : Utilisation libre avec attribution pour les assets Kenney

## Structure du Projet

```
Dyno/
├── src/
│   └── game.ts          # Code source TypeScript
├── dist/
│   └── game.js          # JavaScript compilé
├── sprite/
│   └── dino/            # Sprites du dinosaure
├── songs/               # Dossier pour les fichiers audio
├── index.html           # Page HTML du jeu
├── package.json         # Dépendances et scripts
├── tsconfig.json        # Configuration TypeScript
└── README.md            # Ce fichier
```

## Technologies

- TypeScript
- HTML5 Canvas
- API Web Audio
- Open-Meteo API (météo)
