# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

This is a Three.js-based web game with no build system. To develop:

1. **Run the project**: Open `index.html` in a browser using a local web server (required for ES modules and asset loading)
   - Using VS Code: Install Live Server extension and click "Go Live"
   - Using Python: `python -m http.server 8000` then visit `http://localhost:8000`
   - Using Node.js: `npx serve` or `npx http-server`

2. **Development workflow**: 
   - Edit JavaScript files in the root directory (`main.js`, `camera.js`, `gameplay.js`, etc.)
   - Modify UI in `index.html` and styles in `css/style.css`
   - Assets (models, textures) are in the `assets/` directory
   - Changes take effect immediately upon page refresh (no build step)

## Code Architecture

The game follows a modular structure with separation of concerns:

### Core Modules
- **main.js**: Entry point - initializes Three.js scene, renderer, game loop, and connects all systems
- **camera.js**: Handles dual camera system (panoramic and third-person) with UI controls
- **gameplay.js**: Player controls, shooting mechanics, bullet/target collision, animations
- **lighting.js**: Scene lighting setup (ambient, directional, point lights) and muzzle flash effects
- **environment.js**: Creates game world (ground, walls, ceiling, targets, decorative objects, animated entities)

### Key Systems
- **Rendering**: Standard Three.js WebGL renderer with shadow mapping and antialiasing
- **Input**: Keyboard (WASD for movement, P to pause, 1/2 for camera switching) and mouse (pointer lock for aiming, click to shoot)
- **Animation**: Uses Three.js AnimationMixer for FBX model animations, plus custom animation loops for environmental elements
- **Physics**: Simple distance-based collision detection for bullets and targets
- **UI**: HTML/CSS overlay with controls for texture selection, camera position, lighting intensities, and score display

### Data Flow
1. `main.js` creates and connects all systems
2. Game loop in `main.js` calls `update()` on environment and gameplay systems
3. Systems modify Three.js objects (meshes, lights, cameras) directly
4. Renderer draws the scene each frame
5. UI elements update via event listeners on HTML controls

## Common Tasks

### Adding New Features
- **New weapon type**: Modify `spawnBullet()` in `gameplay.js` and add UI controls
- **New enemy/target**: Add to `createTarget()` or create new factory function in `environment.js`
- **New camera mode**: Extend `createCameras()` in `camera.js` and add UI switch
- **New visual effect**: Add to appropriate module (lighting.js for lights, environment.js for particles/models)

### Modifying Existing Systems
- **Adjust gameplay tuning**: Constants in `gameplay.js` (bullet speed, fire rate, move speed, etc.)
- **Change lighting**: Modify values in `lighting.js` or add UI controls in `main.js`
- **Update environment scale**: Adjust dimensions in `environment.js` (ground/walls/ceiling size)
- **Modify controls**: Update event listeners in `main.js` for keyboard/mouse handling

### Asset Management
- **3D models**: Place FBX files in `assets/models/` and load in `createPlayer()` (gameplay.js)
- **Textures**: Image files go in `assets/textures/` and are loaded via TextureLoader
- **Procedural textures**: Some textures (like grid) are generated programmatically in `environment.js`

## File Conventions
- All modules export functions using named exports
- Three.js objects are typically created and returned from factory functions
- Constants are defined at the top of files when used in multiple places
- Animation systems use delta time for frame-rate independence
- UI binding is done in `main.js` via direct DOM element references

## Debugging
- Browser developer tools for inspecting Three.js objects and performance
- Console.log statements can be added anywhere (no build step to remove them)
- Check network tab for asset loading issues (models/textures)
- Use Three.js editor or online GLTF/FBX viewers to inspect assets before use

## Notes
- The project uses Three.js r160 from CDN (specified in importmap in index.html)
- No transpilation or bundling - modern ES module syntax is used directly
- Responsive design is limited; game assumes desktop browser with mouse/keyboard
- Mobile touch controls would require significant input system changes