# 🌾 Stardew Valley Clone

A 2D farming simulation game inspired by Stardew Valley, built with Phaser 3 and TypeScript.

![Game Version](https://img.shields.io/badge/version-0.0.0-blue)
![Phaser](https://img.shields.io/badge/Phaser-3.80.1-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)

## 🎮 [Play Now!](https://yoshiokaarthur2904.github.io/Clone/)

**Try the game online** - No installation required! Click the link above to play directly in your browser.

## 🚀 Quick Start

Get the game running in 3 simple steps:

```bash
# 1. Clone the repository
git clone https://github.com/yoshiokaarthur2904/Clone.git
cd Clone

# 2. Install dependencies
npm install

# 3. Start the game
npm run dev
```

Then open your browser to `http://localhost:5173` and start playing! 🎮

> **Prerequisites**: Make sure you have [Node.js](https://nodejs.org/) (v14+) installed.

## 🎮 Features

### Current Implementation
- **Player Movement**: Smooth 8-directional movement with WASD/Arrow keys
- **Running**: Hold Shift to run faster
- **Animations**: Walking animations for all four directions (up, down, left, right)
- **Procedural World**: 50x50 tile map with multiple terrain types:
  - Grass and grass variations
  - Water bodies with collision
  - Farmable soil areas
  - Dirt and stone paths
- **NPCs**: Three wandering NPCs with random movement patterns
- **Combat System**: 
  - Attack (Left Click) - Attack tiles in front of you
  - Defend (Right Click) - Shield effect
  - Eat (E Key) - Eating animation
- **Smart Cursor**: Selection cursor that only appears when targeting valid tiles within range and field of view
- **Camera System**: Smooth camera follow with zoom
- **Collision Detection**: Player and NPCs collide with water tiles and each other
- **Depth Sorting**: Proper sprite layering based on Y position

## 🛠️ Tech Stack

- **Game Engine**: [Phaser 3](https://phaser.io/) - Fast, free, and fun HTML5 game framework
- **Language**: TypeScript - Type-safe JavaScript
- **Build Tool**: Vite - Next generation frontend tooling
- **Physics**: Arcade Physics (built into Phaser)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone https://github.com/yoshiokaarthur2904/clone.git
cd clone
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

## 🎯 Controls

| Action | Key/Input |
|--------|-----------|
| Move | WASD or Arrow Keys |
| Run | Hold Shift while moving |
| Attack | Left Click (on highlighted tile) |
| Defend | Right Click |
| Eat | E Key |

## 🏗️ Project Structure

```
stardew-clone/
├── src/
│   ├── main.ts          # Main game logic and scene
│   └── style.css        # Global styles
├── public/
│   └── assets/          # Game assets (sprites, tiles)
├── index.html           # Entry point
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # This file
```

## 🎨 Game Architecture

### Player States
- `IDLE` - Standing still
- `WALK` - Normal movement
- `RUN` - Fast movement (with Shift)
- `ATTACK` - Attacking animation
- `EAT` - Eating animation
- `DEFEND` - Defending with shield

### Tile Types
- Grass (with variations)
- Dirt paths
- Farmable soil
- Stone paths
- Water (with collision)
- Wood
- Empty

## 🚀 Build for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## 🔮 Future Features

- [ ] Farming mechanics (planting, watering, harvesting)
- [ ] Inventory system
- [ ] Tool system (hoe, watering can, axe, pickaxe)
- [ ] Day/night cycle
- [ ] NPC dialogue system
- [ ] Crafting system
- [ ] Building interiors
- [ ] Save/load game functionality
- [ ] Sound effects and music
- [ ] Seasonal changes
- [ ] Fishing mechanics
- [ ] Mining system

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is for educational purposes. Stardew Valley is a trademark of ConcernedApe.

## 👨‍💻 Author

**yoshiokaarthur2904**

- GitHub: [@yoshiokaarthur2904](https://github.com/yoshiokaarthur2904)

## 🙏 Acknowledgments

- Inspired by [Stardew Valley](https://www.stardewvalley.net/) by ConcernedApe
- Built with [Phaser 3](https://phaser.io/)
- Powered by [Vite](https://vitejs.dev/)

---

⭐ Star this repository if you found it helpful!
