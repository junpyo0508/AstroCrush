# 🚀 Astro Crush  
**A Space Debris Cleanup Game Set in the Near Future**

[🌐 Play the Game](https://junpyo0508.github.io/AstroCrush/)  
[📁 GitHub Repository](https://github.com/junpyo0508/AstroCrush.git)

<img width="w-full" alt="image" src="https://github.com/user-attachments/assets/f635318c-a992-4e65-8a62-23f2e3e73ba6" />

---

## Game Background

In the near future, the orbit of planets has become crowded with space debris and meteor fragments.  
Space janitors are now deployed to clean up these orbits.

You play as **Kael**, one such janitor who detects debris using sensors and destroys it with energy weapons.  
One day, Kael discovers and restores a high-performance ship: **Stellar Blade**. With this new power, he expands into deeper sectors of space—only to face unknown anomalies.

---

## Gameplay Overview

- Choose your **difficulty**: Easy / Medium / Hard  
- You have **5 lives**  
- The game runs for **1 minute**, or until all lives are lost  
- The goal: survive, shoot asteroids, and score as high as possible

---

## Core Implementation

### `Starfield.jsx`
- Creates a **tube geometry** as the base of the starfield
- Loads models: spaceship, meteors, and background rocks
- Rocks (55 total) are randomly placed along the spline path with invisible `BoxGeometry` hitboxes
- **Laser mechanics**:  
  - Laser starts from camera position  
  - Travels in camera-facing Z direction  
  - When it hits a `rock` hitbox, the corresponding model is removed

---

### `Story.jsx`
- Main game **UI and difficulty selection**
- Loads and animates spaceship model
- Connects to the **story page** for game background

---

### `Spline.js`
- Defines a **CatmullRomCurve3** path using pre-processed vector list
- Smooth curve path determines the **camera’s movement** through the game

---

### `getStarfield.js`
- Generates stars using **spherical coordinates** with `phi` and `theta`
- Stars are randomly distributed and colored to create a dynamic space background

---

### Sound System
- `explodeSound.js`, `laserSound.js`, `spaceCrashSound.js`: Handles sound loading and playback
- **BGM Composed in Ableton**
  - 2 original tracks created using samples and beat-making
  - Background music loops seamlessly to maintain immersion

---

## Background Music (Original)

| Version | Description |
|--------|-------------|
| **Ver. 1** | Pulsing synth rhythm, used during gameplay |
| **Ver. 2** | Ambient atmospheric layer, used in menus |

---

## Planned Updates

- Add **fragmentation animations** for meteor destruction by manually editing GLSL shader code
- Refactor and optimize **laser collision logic**
- Implement power-ups and more spaceship variations
- Extend game duration and increase level variety
- Introduce **boss encounters** and alien threats

---

## Built With

- **Framework**: Three.js, React Three Fiber  
- **Tools**: GLSL, JavaScript, HTML/CSS  
- **Sound**: Ableton Live (Original Composition)  
- **3D Modeling**: Blender / external .glb assets  
- **Deployment**: GitHub Pages

---

## Contributors

- 홍준표  

---

> Astro Crush was developed as a creative coding project to explore procedural 3D environments, spatial audio design, and WebGL-based game mechanics.
