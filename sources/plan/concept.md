# Tower Defense Chaos - Game Concept

## Overview

**Tower Defense Chaos** is a 3D tower defense game built with Babylon.js. Players defend against waves of orc invaders by strategically placing towers along a winding path. The game features a charming voxel art style, satisfying visual effects, and escalating difficulty that challenges players to optimize their tower placement and resource management.

### Genre
- Tower Defense
- Strategy
- Single-player

### Platform
- Web browser (WebGL)
- Desktop-focused (keyboard + mouse)

### Engine & Tech Stack
- Babylon.js 7.x (WebGL rendering)
- Vanilla JavaScript (no framework)
- Vite build system
- pnpm package manager

### Babylon.js Import Notes
When using modular Babylon.js imports (tree-shaking), you must import side-effect modules for certain features:

```javascript
// Required side-effect imports
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'  // For shadows
import '@babylonjs/core/Rendering/edgesRenderer'                       // For edge rendering
import '@babylonjs/core/Meshes/thinInstanceMesh'                       // For thin instances
import '@babylonjs/core/Culling/ray'                                   // For scene.pick() raycasting

// Common gotchas:
// - Use Mesh.MergeMeshes(), NOT MeshBuilder.MergeMeshes()
// - Import { Mesh } from '@babylonjs/core/Meshes/mesh' for MergeMeshes
// - Thin instances require the thinInstanceMesh side-effect import
// - scene.pick() requires the ray side-effect import
```

### Commands
```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (http://localhost:5173)
pnpm build      # Build for production
pnpm preview    # Preview production build
```

### Project Structure
```
src/
├── index.js          # Game loop, scene setup, environment
├── store.js          # State management (Zustand-style)
├── settings.js       # All game constants
├── path.js           # Path waypoints and interpolation
├── input.js          # Tower placement input handling
├── camera.js         # Camera setup and controls
├── managers/
│   ├── EnemyManager.js      # Enemy spawning, movement, thin instances
│   ├── TowerManager.js      # Tower targeting, firing, animations
│   ├── ProjectileManager.js # Projectile physics, collisions
│   ├── EffectsManager.js    # Particles, ragdolls, visual effects
│   ├── UIManager.js         # HUD overlay
│   └── MinimapManager.js    # Canvas minimap
└── models/
    ├── orc.js         # Orc mesh construction, getPartMatrix()
    ├── tower.js       # Tower mesh construction
    └── projectile.js  # Projectile mesh construction
```

### Entry Point
```javascript
// src/index.js exports:
init(canvas, container, onBack)  // Returns cleanup function
```

---

## Story & Theme

### Setting
A peaceful floating island in the sky is under siege. Waves of armored orcs march relentlessly along the ancient stone path that winds through the island, seeking to reach the sacred heart at the path's end.

### The Conflict
The orcs emerge from a dark portal at the edge of the island, armed with axes and protected by crude armor. They follow the only path across the island - a snake-like trail carved into the grass. Each orc that reaches the end chips away at the island's protective magic.

### The Defense
Ancient tower pedestals dot the island, remnants of a forgotten civilization. Players can activate these pedestals to summon defensive towers powered by the elements:
- **Arrow Towers**: Manned by spectral archers, precise and deadly
- **Flame Towers**: Volcanic cores that lob balls of molten fire
- **Frost Towers**: Crystalline spires that freeze enemies in their tracks
- **Lightning Towers**: Tesla coils crackling with chain lightning

### Tone
Light-hearted and arcade-like. The violence is cartoonish (orcs shatter into voxel cubes), and the aesthetic is bright and colorful rather than grim. Think "Warcraft meets tabletop miniatures."

---

## Art Style

### Visual Direction
- **Voxel/Low-poly aesthetic**: Chunky, blocky characters and effects
- **Diorama presentation**: The map appears as a floating island, like a tabletop game piece
- **Bright, saturated colors**: Vibrant greens, warm oranges, cool blues
- **Cartoon-friendly**: No realistic violence, enemies burst into colorful cubes

### Color Palette
| Element | Primary Color | Description |
|---------|--------------|-------------|
| Grass | #5CB85C | Vibrant medium green |
| Orc Skin | #7cb342 | Warcraft-inspired green |
| Fire/Flame | #FF7043 | Warm orange |
| Ice/Frost | #4FC3F7 | Bright cyan |
| Lightning | #7C4DFF | Electric purple |
| Sky | RGB(0.53, 0.81, 0.92) | Cheerful blue |

### Influences
- Warcraft III (orc design, color palette)
- Clash Royale (chunky characters, bright colors)
- Tabletop miniature games (diorama presentation)
- Classic tower defense games (Kingdom Rush, Bloons TD)

---

## Target Audience

- **Primary**: Casual strategy gamers who enjoy tower defense
- **Secondary**: Developers/tech enthusiasts interested in WebGL/Babylon.js
- **Age**: All ages (cartoon violence only)
- **Session Length**: 5-15 minutes per run

---

## Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│   │  BUILD  │───▶│  WAVE   │───▶│ REWARD  │───┐       │
│   │  PHASE  │    │  PHASE  │    │  GOLD   │   │       │
│   └─────────┘    └─────────┘    └─────────┘   │       │
│        ▲                                       │       │
│        └───────────────────────────────────────┘       │
│                                                         │
│   If lives > 0: Continue to next wave                  │
│   If lives = 0: GAME OVER                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Build Phase
1. Player surveys the map and available gold
2. Select tower type (1-4 keys or click buttons)
3. Position ghost tower preview on valid tiles
4. Click to place tower (gold deducted)
5. Repeat until satisfied or out of gold
6. Press START to begin wave

### Wave Phase
1. Enemies spawn at path start, staggered by 0.5s
2. Orcs march along the snake path toward the exit
3. Towers automatically target and fire at enemies in range
4. Killed enemies drop gold and explode into voxels
5. Enemies that reach the exit cost 1 life
6. Wave ends when all enemies are dead or escaped

### Progression
- Each wave: +100 enemies, +20% HP, +5% speed
- Gold accumulates between waves for more towers
- No explicit win condition - survive as long as possible

---

## Design Philosophy

### Chaos & Spectacle
The game prioritizes visual chaos and spectacle over precision strategy. When dozens of orcs are on screen with fireballs arcing through the air, lightning chaining between targets, and frost explosions blooming - the screen should feel alive and exciting. This is "tower defense as fireworks show."

### Accessibility
- Simple controls (WASD + mouse + number keys)
- Clear visual feedback (color-coded towers, obvious effects)
- Forgiving early waves for learning
- No complex upgrade trees or tech requirements

### Performance
- Optimized for 100+ enemies at 60fps
- Thin instances for efficient rendering
- Object pooling for particles and effects
- No frame drops even during peak chaos

### Replayability
- Endless waves with exponential scaling
- Different tower combinations encourage experimentation
- High score potential (waves survived)

---

## Detailed Specifications

---

## Tower Types

### Arrow Tower (Key: 1)
- **Cost**: 50 gold
- **Range**: 6 units
- **Fire Rate**: 2.0/sec
- **Damage**: 33 HP
- **Projectile Speed**: 20 units/sec
- **Special**: 15% crit chance, 2x crit multiplier (66 damage on crit)
- **Visual**: Stone gray base (#78909C), wood turret (#A1887F), pointed roof
- **Ghost Preview**: Green (#00ff88)

### Flame Tower (Key: 2)
- **Cost**: 100 gold
- **Range**: 30 units
- **Fire Rate**: 0.3/sec (3.33s cooldown)
- **Damage**: 17 HP (AOE)
- **AOE Radius**: 2.5 units
- **Projectile Speed**: 10 units/sec
- **Gravity**: 9.8 (ballistic arc trajectory)
- **Visual**: Brown base (#6D4C41), glowing lava orb (#FF7043 with #FF5722 emissive, alpha 0.9)
- **Ghost Preview**: Orange (#ff8800)

### Frost Tower (Key: 3)
- **Cost**: 120 gold
- **Range**: 5 units
- **Fire Rate**: 0.8/sec
- **Damage**: 10 HP (AOE)
- **AOE Radius**: 2.0 units
- **Slow Multiplier**: 0.5x (50% speed)
- **Slow Duration**: 2.5 seconds
- **Visual**: Ice blue base (#B3E5FC), crystal pillar and top (#4FC3F7 with emissive glow), alpha 0.85, specularity 0.6-0.8
- **Ghost Preview**: Cyan (#66ccff)

### Lightning Tower (Key: 4)
- **Cost**: 150 gold
- **Range**: 7 units
- **Fire Rate**: 1.0/sec
- **Damage**: 33 HP per target
- **Chain Count**: 4 additional targets
- **Chain Range**: 3 units between targets
- **Visual**: Indigo base (#5C6BC0), purple coil body (#7C4DFF with #651FFF emissive), 3 torus rings, energy orb top (#B388FF with #7C4DFF emissive), specularity 0.6
- **Ghost Preview**: Purple (#8844ff)

### Tower Animations (BUILD phase)
- **Flame**: Lava orb pulsing (sine wave scale)
- **Lightning**: Energy orb flickering (dual sine waves)
- **Frost**: Crystal bobbing with glow pulse
- **Scale**: All towers use TOWER_SCALE = 1.3x

---

## Enemy System (Orcs)

### Base Stats
- **HP**: 500
- **Speed**: 2.0 units/sec

### Wave Scaling
- **HP Multiplier**: 1.2x per wave (wave N: 500 × 1.2^(N-1))
- **Speed Multiplier**: 1.05x per wave (wave N: 2.0 × 1.05^(N-1))

### Movement
- **Jitter Amplitude**: 0.25 units (wandering perpendicular to path)
- **Jitter Frequency**: 2.0 Hz

### Body Parts
| Part | Dimensions (w×h×d) | Position Y |
|------|-------------------|------------|
| Torso | 0.55×0.6×0.35 | center |
| Head | 0.4×0.4×0.4 | 1.35 |
| Left Arm | 0.15×0.4×0.15 | - |
| Right Arm | 0.15×0.4×0.15 | - |
| Left Leg | 0.18×0.5×0.18 | - |
| Right Leg | 0.18×0.5×0.18 | - |
| Left Tusk | 0.05×0.12×0.05 | - |
| Right Tusk | 0.05×0.12×0.05 | - |
| Left Shoulder | 0.22×0.12×0.18 | - |
| Right Shoulder | 0.22×0.12×0.18 | - |
| Belt | 0.6×0.1×0.38 | - |
| Helmet | 0.44×0.2×0.44 | - |
| Axe Handle | 0.06×0.5×0.06 | - |
| Axe Blade | 0.06×0.2×0.25 | - |

### Normal Orc Colors
| Part | Color |
|------|-------|
| Skin (torso/head) | #7cb342 (vibrant green) |
| Limbs | #689f38 (darker green) |
| Tusks | #e8d4b8 (ivory) |
| Armor (shoulders/belt) | #8b5a2b (brown leather) |
| Metal (helmet/axe blade) | #708090 (gray steel) |
| Wood (axe handle) | #6b4423 (brown) |

### Frosted Orc Colors (when slowed)
| Part | Color | Emissive |
|------|-------|----------|
| Skin | #5a8aaa | #223344 |
| Limbs | #4a7899 | #1a2a3a |

### Walk Animation
- Left leg: sin(angle) × 0.3 swing
- Right leg: sin(angle + π) × 0.3 (opposite phase)
- Left arm: sin(angle + π) × 0.25
- Right arm: sin(angle) × 0.25 (swings with axe)
- Axe rotates with right arm

---

## Projectiles

### Arrow
- **Shape**: Cylinder shaft (0.8h × 0.05d) + cone tip
- **Shaft Color**: #8b5a2b (brown wood)
- **Tip Color**: #888888 (metallic)
- **Fletching**: 3 red feathers (#ff4444) arranged radially
- **Behavior**: Homing, tracks target by ID

### Fireball
- **Shape**: Sphere (0.5 diameter)
- **Color**: #ff4400 (orange)
- **Emissive**: #ff6600 (brighter orange)
- **Specularity**: #ffff00 (yellow highlights)
- **Behavior**: Ballistic arc with gravity, uses calculateBallisticVelocity()

### Frost Shard
- **Shape**: Rotated cone (0.5h) with trailing crystal
- **Color**: #aaddff (icy blue)
- **Emissive**: #66aaff (cyan glow)
- **Alpha**: 0.85
- **Specularity**: 0.8

---

## Visual Effects

### Voxel Shatter (Death)
- **Cube Count**: 12
- **Cube Size**: 0.12 units
- **Colors**: #4a7c3f / #3d6633 (alternating green)
- **Lifetime**: 0.8 seconds
- **Ejection Speed**: 5 units/sec
- Burst upward with spin and gravity

### Ragdolls
- **Lifetime**: 2.0 seconds
- **Fade Start**: 1.5 seconds
- **Knockback Force**: 2.0 units
- Full orc mesh with physics (velocity, angular velocity, ground collision)

### Death Light
- **Color**: #ff6600 (orange)
- **Duration**: 0.12 seconds
- **Intensity**: 2.0
- **Max Active**: 5

### Muzzle Flash
- **Color**: #ffff00 (yellow) with #ffaa00 emissive
- **Duration**: 0.08 seconds
- **Scale**: 0.4 units
- **Max Active**: 15

### Critical Hit
- **Flash Color**: #ffd700 (gold) with #ffaa00 emissive
- Expanding golden flash effect

### Frost Explosion
- **Color**: #aaddff (cyan) with #66aaff emissive
- **Duration**: 400ms expansion

### Lightning Arc
- **Core**: White tube (#ffffff), 0.08 radius
- **Glow**: Blue tube (#4c9ff), 0.45 radius, alpha 0.3
- **Jitter Points**: 10 interpolated points between targets
- **Timing**: 100ms per target + 60ms pause at each
- **Pulsing**: Brightness pulses during 300ms hold phase

### Lightning Impact
- **Flash**: White sphere, 1.2 diameter
- **Particles**: 8-12 cyan boxes (#aaeeff) burst outward

### Scorch Marks
- **Shape**: Disc on ground
- **Color**: #2266ff with #3388ff emissive
- **Radius**: 0.8 units

### Realistic Explosion (Fireball Impact)
- **Fire Particles**: 20, orange (#ff6600), burst upward
- **Smoke Particles**: 15, dark gray (#333333), alpha 0.6, rising
- **Debris Particles**: 12, brown boxes (#8b4513), physics with spin
- **Shockwave**: Orange torus (#ffaa00), expands 5x over 400ms
- Fire gets 0.3x gravity

### Fireball Trail
- **Color**: #ff6600 (orange) with #ff3300 emissive
- **Duration**: 400ms shrink and fade

### Gold Popups
- **Color**: Yellow text
- **Duration**: 1.0 second (then fades)
- Shows "+X" gold amount floating upward

---

## Trail Particles

### Arrow Trail
- **Colors**: #ffaa00 / #ff6600 (yellow/orange)
- **Shape**: Small cubes

### Fireball Trail
- **Color**: #333333 (dark smoke) with #ff4400 ember tint
- **Shape**: Expanding spheres

### Settings
- **Lifetime**: 0.15 seconds
- **Spawn Interval**: 0.02 seconds
- **Max Particles**: 300

---

## Wave System

- **Base Enemy Count**: 200 (wave 1)
- **Increment Per Wave**: +100
- **Spawn Delay**: 0.5 seconds between enemies
- **Formula**: Wave N has (200 + (N-1) × 100) enemies

---

## Economy

- **Starting Gold**: 3000
- **Gold Per Kill**: 10
- **Starting Lives**: 20

---

## Map & Environment

### Dimensions
- **Width**: 80 units
- **Depth**: 48 units
- **Tile Size**: 1 unit

### Diorama Island
- Floating island style
- **Grass Top**: #5CB85C (medium green)
- **Dirt Sides**: Brown earth

### Path Waypoints
```
[-36, 16] → [-12, 16] → [-12, -16] → [12, -16] → [12, 16] → [36, 16]
```
Snake pattern, 5-tile-wide collision zone

### Decorations
- **Trees**: 80, 3 cone layers per tree, TREE_SCALE = 2.0x
- **Small Rocks**: Scattered randomly
- **Big Rock Formations**: Clusters of 3-5 rocks at fixed spots
- **Flowers**: 60, colored with emissive glow

### Grid Overlay
- **Color**: White, 10% opacity
- Visible only during tower placement (ghost tower active)

### Fog
- **Mode**: Exponential
- **Density**: 0.0018
- **Color**: #808880

---

## Lighting & Post-Processing

### Hemispheric Light
- **Intensity**: 0.35
- **Ground Color**: #445544

### Directional Sun
- **Intensity**: 1.0
- **Position**: (20, 40, 20)
- **Color**: #fffef0 (warm white)

### Shadow Map
- **Resolution**: 2048px
- **Blur**: Enabled

### Post-Processing Pipeline
- **FXAA**: Enabled
- **Bloom**: Threshold 0.7, Weight 0.3, Kernel 64

### Image Processing
- **Contrast**: 1.1
- **Exposure**: 0.92
- **Saturation**: +20

### SSAO (Ambient Occlusion)
- **Radius**: 1.5
- **Strength**: 1.0
- **Samples**: 16

### Sky
- Background color: RGB (0.53, 0.81, 0.92) - sky blue

---

## Camera

### Type
- Babylon.js ArcRotateCamera (isometric style)

### Angles
- **Alpha (horizontal)**: 0°
- **Beta (vertical)**: 45°

### Distance
- **Default**: 50 units
- **Height**: 25 units

### Zoom
- **Min**: 20 units
- **Max**: 80 units
- **Speed**: 5 units/scroll

### Pan
- **Speed**: 25 units/sec
- **Controls**: WASD keys
- Clamped to map bounds

### Input
- All default Babylon camera inputs disabled
- Custom WASD + scroll only

---

## UI

### HUD Layout
- **Top-left**: Gold (💰) + Lives (❤️)
- **Top-right**: Phase indicator text
- **Top-right (70px down)**: START / TRY AGAIN button
- **Bottom-center**: Tower selection bar (BUILD phase only)

### Tower Selection
- **Buttons**: 4 with emojis (🏹 🔥 ❄️ ⚡)
- **Keyboard**: 1, 2, 3, 4 keys
- **Selected State**: Green border (#4ade80) + glow
- **Disabled State**: Opacity 0.4 (insufficient gold)

### Phase Display
- **BUILD**: Green text, "BUILD PHASE"
- **WAVE**: Orange text, "WAVE N - X/Y" (alive/total)
- **GAME_OVER**: Red text, button becomes "TRY AGAIN"

---

## Minimap

### Position
- Bottom-right corner

### Dimensions
- **Width**: 150px
- **Height**: Scaled by MAP_WIDTH/MAP_DEPTH ratio

### Background
- **Color**: #1a472a (dark green)

### Elements
| Element | Visual |
|---------|--------|
| Path | Brown stroke (#8B7355), lineWidth 6, green start, red end |
| Arrow Tower | Purple dot (#a78bfa), 3px radius |
| Flame Tower | Orange dot (#f97316), 3px radius |
| Frost Tower | Light blue dot (#66ccff), 3px radius |
| Lightning Tower | Purple dot (#8844ff), 3px radius |
| Enemies | Red dots, 2px radius |
| Viewport | White rectangle |

### Interaction
- Click to pan camera to location

### Coordinate Transform
- World X → Minimap Y
- World Z → Minimap X
- (Rotated to match camera view)

---

## Physics

- **Gravity**: -20
- **Projectile Prediction Time**: 0.4 seconds
- **Projectile Launch Angle**: 0.6 radians

---

## Entity Pools

| Pool | Max Count |
|------|-----------|
| Enemies | 500 |
| Projectiles | 100 |
| Particles | 200 |
| Ragdolls | 20 |
| Trail Particles | 300 |
| Muzzle Flashes | 15 |
| Death Lights | 5 |

Oldest entities removed when pool exceeds limit (FIFO).

---

## Game Flow

1. **BUILD Phase**: Place towers, select type (1-4 or buttons)
2. **Start Wave**: Click START button
3. **WAVE Phase**: Enemies spawn staggered, towers auto-target and fire
4. **Wave Complete**: All enemies dead/escaped → Return to BUILD
5. **Game Over**: Lives reach 0

### Win Condition
- Survive all waves (no explicit limit)

### Lose Condition
- Lives ≤ 0

---

## Technical Implementation

### Rendering
- Babylon.js Thin Instances for 100+ enemies at 60fps
- Pre-allocated Float32Array buffers per body part (maxInstances × 16 floats)
- Separate frosted mesh set for slowed enemies
- Buffer set via `thinInstanceSetBuffer` with stride 16

### State Management
- Custom Zustand-style reactive store (no React)
- All mutations through store actions
- Pub-sub pattern for UI updates

### State Structure
```javascript
{
  phase: 'BUILD' | 'WAVE' | 'GAME_OVER',
  currentWave: number,
  gold: number,
  lives: number,
  waveTime: number,
  towers: [{ id, type, position, lastFireTime }],
  enemies: [{ id, spawnDelay, spawned, pathProgress, hp, maxHp, speed, dying, deathTime, jitterSeed, frostedUntil }],
  projectiles: [],
  ragdolls: [],
  particles: [],
  goldPopups: [],
  selectedTowerType: 'arrow' | 'flame' | 'frost' | 'lightning',
  ghostPosition: { x, y, z } | null
}
```

### Store Actions
- `addTower(position, type)`: Deducts gold, random lastFireTime offset (-1000 to 0)
- `startWave()`: Creates enemy array with spawn delays and wave-scaled stats
- `updateWaveTime(dt)`: Increments waveTime
- `spawnEnemy(id)`: Marks spawned=true
- `updateEnemy(id, updates)`: Merges updates
- `damageEnemy(id, damage)`: Returns if dying, triggers death at HP≤0, adds gold
- `removeEnemy(id)`: Filters from array
- `enemyPassed(id)`: Decrements lives, GAME_OVER if ≤0
- `checkWaveComplete()`: Returns true when all spawned and none active
- `spawnRagdoll/Particles/GoldPopup`: Pool-limited spawning

### Manager Pattern
- EnemyManager → TowerManager → ProjectileManager → EffectsManager
- Updated each frame in sequence

---

## Diorama Environment Construction

### Ground Surface
- `CreateGround` with MAP_WIDTH × MAP_DEPTH (80×48)
- PBR material: grass color #5CB85C, roughness 0.9, metallic 0.0
- Receives shadows

### Earth Sides (Floating Island Effect)
- 4 separate boxes for front/back/left/right edges
- Thickness: 0.5 units
- Height (groundDepth): 4 units
- Color: #8B6B4A (brown dirt)
- Bottom cap: separate ground mesh at Y=-4

### Path Tiles
- Generated between waypoints
- Width: 4 units (5-tile collision zone)
- Height: 0.05 units (slightly raised)
- Material: brown dirt
- Algorithm: For each segment, interpolate every 0.5 tiles, mark 5×5 area

---

## Decoration System

### Seeded Random Number Generator
- Linear congruential generator
- Seed: 12345 (deterministic placement)
- Formula: `(seed * 1103515245 + 12345) & 0x7fffffff`

### Trees (80 attempts)
- **Trunk**: Cylinder
  - Height: 1.5 × scale
  - Diameter top: 0.25 × scale
  - Diameter bottom: 0.4 × scale
  - Tessellation: 6
  - Color: #8B5A2B (brown)
- **Leaf Layers**: 3 cones per tree
  - Heights: [1.6, 2.2, 2.7] × scale
  - Diameters: [1.6, 1.3, 0.9] × scale
  - Colors: #4A7C3F, #2D5A27, #3D6B32, #4A7C3F (random per tree)
- **Scale Variation**: 0.7-1.3 × TREE_SCALE (2.0)
- **Placement**: Random within bounds, rejected if on path

### Small Rocks
- IcoSphere geometry
- Radius: 0.4-0.9
- Y scale: 0.6-0.9 (flattened)
- Color: #78909C (gray-blue)

### Big Rock Formations (7 fixed locations)
- 3-5 rocks per cluster
- Offset: -3 to +3 in X/Z
- Scale: 1.5-3.5
- Rotation: X 0-0.3, Y 0-2π, Z 0-0.3
- Materials: #78909C or #607D8B (alternating)

### Flowers (60 total)
- Sphere geometry
- Diameter: 0.15-0.25
- Segments: 6
- Position: Y=0.1 (just above ground)
- Colors: #FF7043, #FFCA28, #EC407A, #AB47BC, #42A5F5
- Emissive: diffuseColor × 0.2

---

## Grid Overlay System

- LineSystem with 1-unit spacing
- Color: RGB(0.3, 0.3, 0.3), alpha 0.3
- Visibility: Only when ghostPosition is not null (tower placement active)
- Covers entire map bounds

---

## Tower Model Construction

### Arrow Tower
| Part | Geometry | Dimensions | Position Y | Color |
|------|----------|------------|------------|-------|
| Base | Cylinder | H=0.8×s, D=0.6-0.8, tess=8 | 0.4×s | #78909C |
| Body | Cylinder | H=1.5×s, D=0.4-0.5 | 1.55×s | #78909C |
| Turret | Cylinder | H=0.3×s, D=0.45-0.5 | 2.45×s | #A1887F |
| Roof | Cone | H=0.5×s, D=0.05-0.55 | 2.85×s | #A1887F |
| Fire Point | - | - | 2.5×s | - |

### Flame Tower
| Part | Geometry | Dimensions | Position Y | Color |
|------|----------|------------|------------|-------|
| Base | Cylinder | H=2.5×s, D=2.0-2.5 | 1.25×s | #6D4C41 |
| Lava Orb | Sphere | D=1.6×s | 3.0×s | #FF7043, emissive #FF5722 |
| Fire Point | - | - | 3.2×s | - |

### Frost Tower
| Part | Geometry | Dimensions | Position Y | Color |
|------|----------|------------|------------|-------|
| Base | Cylinder | H=0.6×s, D=0.9-1.0 | 0.3×s | #B3E5FC |
| Pillar | Cylinder | H=1.2×s, D=0.3-0.5 | 1.2×s | #4FC3F7, emissive |
| Crystal | Cone | H=0.8×s, D=0.05-0.35 | 2.2×s | #4FC3F7, emissive, α=0.85 |
| Fire Point | - | - | 2.2×s | - |

### Lightning Tower
| Part | Geometry | Dimensions | Position Y | Color |
|------|----------|------------|------------|-------|
| Base | Cylinder | H=0.5×s, D=0.8-0.9 | 0.25×s | #5C6BC0 |
| Body | Cylinder | H=1.4×s, D=0.35-0.5 | 1.2×s | #7C4DFF, emissive #651FFF |
| Coil Ring 1 | Torus | D=0.5×s, tube=0.06×s | 0.8×s | metal |
| Coil Ring 2 | Torus | D=0.5×s, tube=0.06×s | 1.2×s | metal |
| Coil Ring 3 | Torus | D=0.5×s, tube=0.06×s | 1.6×s | metal |
| Orb | Sphere | D=0.35×s | 2.1×s | #B388FF, emissive #7C4DFF |
| Fire Point | - | - | 2.1×s | - |

*Note: s = TOWER_SCALE (1.3)*

---

## Tower Animation Formulas

### Flame Tower Lava Orb (per frame)
```javascript
pulse = 1 + sin(time * 2) * 0.1
wobble = sin(time * 4) * 0.04
scale = (pulse + wobble, pulse - wobble*0.5, pulse + wobble)
emissiveIntensity = 0.8 + sin(time * 3) * 0.2
```

### Lightning Tower Orb (per frame)
```javascript
pulse = 1 + sin(time * 4) * 0.15
flicker = 0.7 + sin(time * 8) * 0.2 + sin(time * 13) * 0.1
emissiveRGB = (0.49 * flicker, 0.3 * flicker, flicker)
```

### Frost Tower Crystal (per frame)
```javascript
bob = sin(time * 2) * 0.03
positionY = 2.2 * TOWER_SCALE + bob
glow = 0.7 + sin(time * 2.5) * 0.3
emissiveRGB = (0.16 * glow, 0.71 * glow, 0.96 * glow)
```

---

## Targeting Algorithm

```javascript
function findTarget(towerPosition, range) {
  let nearest = null
  let nearestDist = Infinity

  for (enemy of enemies) {
    if (!enemy.spawned || enemy.dying) continue

    // 2D distance (horizontal plane)
    dx = enemy.position.x - towerPosition.x
    dz = enemy.position.z - towerPosition.z
    dist = sqrt(dx*dx + dz*dz)

    if (dist <= range && dist < nearestDist) {
      nearest = enemy
      nearestDist = dist
    }
  }
  return nearest
}
```

---

## Fire Timing System

- Cooldown: `1000 / fireRate` milliseconds
- Initial offset: `-Math.random() * 1000` (staggered startup)
- Check: `now - lastFireTime >= cooldown`
- After fire: `lastFireTime = now`

---

## Projectile Model Construction

### Arrow
- **Shaft**: Cylinder, H=0.8, D=0.05, color #8B5A2B
- **Tip**: Cone, H=0.15, D=0.08, color #888888 (metallic)
- **Fletching**: 3 boxes (0.02×0.15×0.08), color #FF4444, arranged radially at 120°

### Fireball
- **Shape**: Sphere, D=0.5
- **Material**: color #FF4400, emissive #FF6600, specular #FFFF00

### Frost Shard
- **Shape**: Cone, H=0.5
- **Trail Crystal**: Small cone behind
- **Material**: color #AADDFF, emissive #66AAFF, alpha 0.85, specularity 0.8

---

## Projectile Physics

### Homing (Arrow, Frost)
```javascript
targetPos = enemyPosition + (0, 0.8, 0)  // Aim at chest height
direction = normalize(targetPos - projectilePos)
projectilePos += direction * speed * dt

// Orientation
pitch = asin(-velocity.y / speed)
yaw = atan2(velocity.x, velocity.z)
```

### Ballistic (Fireball)
```javascript
// Initial velocity calculation
horizontalDist = sqrt((targetX-startX)² + (targetZ-startZ)²)
baseFallTime = sqrt(2 * startY / gravity)
flightTime = baseFallTime * 1.2

velocityX = (targetX - startX) / flightTime
velocityZ = (targetZ - startZ) / flightTime
velocityY = (0.5 * gravity * flightTime² - startY) / flightTime

// Per frame update
velocity.y -= FLAME_GRAVITY * dt  // 9.8 m/s²
position += velocity * dt
```

### Collision Detection
```javascript
hitRadius = (type == 'arrow') ? 0.6 : 0.8
gracePeriod = 100  // ms

if (age >= gracePeriod) {
  for (enemy of enemies) {
    dist = distance3D(projectile, enemy)
    if (dist < hitRadius) {
      // Hit!
    }
  }
}
```

---

## Lightning Chain Algorithm

```javascript
function fireChainLightning(tower, primaryTarget) {
  hitTargets = [primaryTarget]
  currentPos = primaryTarget.position

  for (i = 0; i < CHAIN_COUNT - 1; i++) {
    nearest = null
    nearestDist = Infinity

    for (enemy of enemies) {
      if (hitTargets.includes(enemy)) continue
      if (enemy.dying || !enemy.spawned) continue

      dist = distance(currentPos, enemy.position)
      if (dist <= CHAIN_RANGE && dist < nearestDist) {
        nearest = enemy
        nearestDist = dist
      }
    }

    if (!nearest) break
    hitTargets.push(nearest)
    currentPos = nearest.position
  }

  // Apply damage to all
  for (target of hitTargets) {
    damageEnemy(target.id, LIGHTNING_DAMAGE)
  }

  // Spawn visual arc
  spawnLightningArc(hitTargets)
}
```

---

## Orc Model Construction

### Body Part Specifications
| Part | Dimensions (W×H×D) | Offset (X, Y, Z) | Pivot Y | Color |
|------|-------------------|------------------|---------|-------|
| Torso | 0.55×0.6×0.35 | 0, 0.8, 0 | - | #7CB342 |
| Head | 0.4×0.4×0.4 | 0, 1.35, 0 | - | #7CB342 |
| Left Arm | 0.15×0.4×0.15 | -0.38, 0.9, 0 | 0.2 | #689F38 |
| Right Arm | 0.15×0.4×0.15 | 0.38, 0.9, 0 | 0.2 | #689F38 |
| Left Leg | 0.18×0.5×0.18 | -0.14, 0.25, 0 | 0.25 | #689F38 |
| Right Leg | 0.18×0.5×0.18 | 0.14, 0.25, 0 | 0.25 | #689F38 |
| Left Tusk | 0.05×0.12×0.05 | -0.12, 1.25, 0.18 | - | #E8D4B8 |
| Right Tusk | 0.05×0.12×0.05 | 0.12, 1.25, 0.18 | - | #E8D4B8 |
| Left Shoulder | 0.22×0.12×0.18 | -0.4, 1.05, 0 | - | #8B5A2B |
| Right Shoulder | 0.22×0.12×0.18 | 0.4, 1.05, 0 | - | #8B5A2B |
| Belt | 0.6×0.1×0.38 | 0, 0.55, 0 | - | #8B5A2B |
| Helmet | 0.44×0.2×0.44 | 0, 1.55, 0 | - | #708090 |
| Axe Handle | 0.06×0.5×0.06 | 0.38, 0.55, 0 | 0.35 | #6B4423 |
| Axe Blade | 0.06×0.2×0.25 | 0.38, 0.35, 0.15 | 0.35 | #708090 |

### Material Specularity
| Material | Specularity |
|----------|-------------|
| Skin | 0.15 |
| Limb | 0.15 |
| Tusk | 0.3 |
| Armor | 0.2 |
| Metal | 0.5 |
| Wood | 0.1 |

### Matrix Transformation Order
1. Scale (if specified)
2. Translate to pivot (-pivotY)
3. Apply rotation (limb swing)
4. Translate from pivot (+pivotY)
5. Apply part offset
6. Apply body Y rotation (facing)
7. Apply world position

### Walk Animation
```javascript
walkCycle += dt * speed * 0.8  // 0-1 progress
angle = walkCycle * 2 * PI

leftLegRotation = sin(angle) * 0.3
rightLegRotation = sin(angle + PI) * 0.3
leftArmRotation = sin(angle + PI) * 0.25
rightArmRotation = sin(angle) * 0.25
axeRotation = rightArmRotation  // Follows right arm
```

---

## Health Bar Construction

- **Dimensions**: 0.8 × 0.1 (width × height)
- **Background**: Plane, color #333333, emissive #222222
- **Foreground**: Plane, Z offset -0.01
- **Billboard Mode**: 7 (always face camera)
- **Visibility**: Only shown when enemy HP < maxHP (after taking damage)
- **Position**: Enemy position + (0, 2.0, 0)

### Color Thresholds
| HP % | Color |
|------|-------|
| >50% | #00FF00 (green) |
| 25-50% | #FFFF00 (yellow) |
| <25% | #FF0000 (red) |

### Scale Formula
```javascript
foregroundScaleX = currentHP / maxHP
foregroundOffsetX = -(1 - foregroundScaleX) * 0.4  // Anchor left
```

---

## Enemy Spawn System

### Per-Wave Calculations
```javascript
enemyCount = BASE_ENEMY_COUNT + (wave - 1) * ENEMY_INCREMENT_PER_WAVE
// = 200 + (wave - 1) * 100

enemyHP = BASE_HP * pow(ENEMY_HP_SCALE, wave - 1)
// = 500 * pow(1.2, wave - 1)

enemySpeed = BASE_SPEED * pow(ENEMY_SPEED_SCALE, wave - 1)
// = 2.0 * pow(1.05, wave - 1)
```

### Spawn Timing
- Spawn delay per enemy: `index * SPAWN_DELAY` (0.5s)
- Check each frame: `if (waveTime >= enemy.spawnDelay && !enemy.spawned)`

### Jitter System
```javascript
jitterSeed = random() * 1000  // Per enemy

// Per frame
jitterX = sin(time * JITTER_FREQUENCY + jitterSeed) * JITTER_AMPLITUDE
jitterZ = sin(time * JITTER_FREQUENCY * 1.3 + jitterSeed + 100) * JITTER_AMPLITUDE * 0.5

// Rotate by heading to stay perpendicular to path
perpX = jitterX * cos(heading) - jitterZ * sin(heading)
perpZ = jitterX * sin(heading) + jitterZ * cos(heading)
```

---

## Death Animation

- **Dying Flag**: Set immediately when HP ≤ 0
- **Death Duration**: 500ms before removal
- **Effects Triggered**:
  1. Ragdoll spawned at death position
  2. Voxel shatter particles
  3. Death light flash
  4. Gold popup

---

## Path System Details

### Waypoints
```javascript
PATH_WAYPOINTS = [
  { x: -36, z: 16 },
  { x: -12, z: 16 },
  { x: -12, z: -16 },
  { x: 12, z: -16 },
  { x: 12, z: 16 },
  { x: 36, z: 16 }
]
```

### Segment Lengths
| Segment | From | To | Length |
|---------|------|-----|--------|
| 0 | (-36, 16) | (-12, 16) | 24 |
| 1 | (-12, 16) | (-12, -16) | 32 |
| 2 | (-12, -16) | (12, -16) | 24 |
| 3 | (12, -16) | (12, 16) | 32 |
| 4 | (12, 16) | (36, 16) | 24 |
| **Total** | | | **136** |

### Progress to Position
```javascript
function getEnemyPosition(progress) {
  distance = progress * totalPathLength  // 0-136

  cumulative = 0
  for (i = 0; i < segments.length; i++) {
    if (cumulative + segmentLength[i] >= distance) {
      t = (distance - cumulative) / segmentLength[i]
      return lerp(waypoints[i], waypoints[i+1], t)
    }
    cumulative += segmentLength[i]
  }
}
```

### Progress Speed
```javascript
progressPerSecond = speed / totalPathLength
// e.g., 2.0 / 136 = 0.0147 progress/sec
```

---

## Effects System Details

### Voxel Shatter
```javascript
count = 12
size = 0.12
colors = ['#4A7C3F', '#3D6633']  // Alternating
lifetime = 800  // ms
ejectionSpeed = 5

for (i = 0; i < count; i++) {
  angle = random() * 2 * PI
  velocity = {
    x: cos(angle) * ejectionSpeed * (0.5 + random() * 0.5),
    y: ejectionSpeed * (0.8 + random() * 0.4),
    z: sin(angle) * ejectionSpeed * (0.5 + random() * 0.5)
  }
  angularVelocity = {
    x: (random() - 0.5) * 20,
    y: (random() - 0.5) * 20,
    z: (random() - 0.5) * 20
  }
}

// Per frame
velocity.y += GRAVITY * dt
position += velocity * dt
rotation += angularVelocity * dt
if (position.y < size/2) {
  position.y = size/2
  velocity.y *= -0.3  // Bounce
}
alpha = 1 - max(0, (age - lifetime*0.6) / (lifetime*0.4))
```

### Ragdoll Physics
```javascript
lifetime = 2000  // ms
fadeStart = 1500
knockbackForce = 2.0

initialVelocity = {
  x: (random() - 0.5) * knockbackForce,
  y: knockbackForce * 0.5,
  z: (random() - 0.5) * knockbackForce
}
angularVelocity = random per axis

// Per frame
velocity.y += GRAVITY * dt
position += velocity * dt
rotation += angularVelocity * dt
if (position.y < 0.5) {
  position.y = 0.5
  velocity.y *= -0.2
  angularVelocity *= 0.5
}
```

### Lightning Arc Construction
```javascript
segmentTravelTime = 100  // ms per target
pauseDuration = 60  // ms at each target
holdDuration = 300  // ms after complete
fadeDuration = 150  // ms

// Jagged path between targets
function generateArcPath(from, to) {
  points = []
  numPoints = 10
  for (i = 0; i <= numPoints; i++) {
    t = i / numPoints
    basePos = lerp(from, to, t)
    jitter = sin(t * PI) * 0.4 * (1 - t*0.5)
    points.push(basePos + randomOffset * jitter)
  }
  return points
}

// Tube meshes
coreTube = CreateTube(path, radius=0.08, color=#FFFFFF)
glowTube = CreateTube(path, radius=0.45, color=#4C9FF, alpha=0.3)
```

### Realistic Explosion
```javascript
// Fire core
coreExpansion = 3.0  // Final scale
coreDuration = 800
coreScale = 1 + (age/coreDuration)^3 * (coreExpansion - 1)

// Fire particles (20)
fireGravity = GRAVITY * 0.3  // Reduced gravity
fireLifetime = 800

// Smoke particles (15)
smokeDrag = 0.98
smokeExpansion = 1 to 3
smokeLifetime = 1500
smokeAlpha = 0.6

// Debris (12)
debrisLifetime = 2000
debrisBounce = 0.3

// Shockwave
shockwaveExpansion = 5.0
shockwaveDuration = 400
```

---

## Input System

### Grid Snapping
```javascript
function snapToGrid(worldPoint) {
  return {
    x: floor(worldPoint.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2,
    z: floor(worldPoint.z / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2
  }
}
```

### Placement Validation
```javascript
function isValidPlacement(x, z) {
  // Check path collision (with tolerance)
  if (isPathTile(x, z, tolerance=0.2)) return false

  // Check occupied
  key = `${floor(x)},${floor(z)}`
  if (occupiedTiles.has(key)) return false

  // Check bounds
  halfW = MAP_WIDTH / 2
  halfD = MAP_DEPTH / 2
  if (abs(x) > halfW || abs(z) > halfD) return false

  return true
}
```

### Ghost Tower Appearance
```javascript
validAlpha = 0.6
invalidAlpha = 0.4

colors = {
  arrow: '#00FF88',
  flame: '#FF8800',
  frost: '#66CCFF',
  lightning: '#8844FF'
}
invalidColor = '#FF0000'
```

---

## Camera System

### Setup
```javascript
camera = new ArcRotateCamera(
  alpha: 0,  // Horizontal angle (radians)
  beta: PI/4,  // 45° vertical
  radius: 50,  // Distance
  target: Vector3.Zero()
)

// Disable all default inputs
camera.inputs.clear()
```

### WASD Movement
```javascript
// Direction vectors (relative to camera angle)
forward = { x: -cos(alpha), z: -sin(alpha) }
right = { x: sin(alpha), z: -cos(alpha) }

// Per frame
movement = { x: 0, z: 0 }
if (keys.W) movement += forward
if (keys.S) movement -= forward
if (keys.A) movement -= right
if (keys.D) movement += right

// Normalize diagonal
if (length(movement) > 0) {
  movement = normalize(movement)
}

// Apply
camera.target.x += movement.x * CAMERA_SPEED * dt
camera.target.z += movement.z * CAMERA_SPEED * dt

// Clamp to bounds
camera.target.x = clamp(camera.target.x, -MAP_WIDTH/2, MAP_WIDTH/2)
camera.target.z = clamp(camera.target.z, -MAP_DEPTH/2, MAP_DEPTH/2)
```

### Zoom
```javascript
onWheel(delta) {
  camera.radius -= delta * CAMERA_ZOOM_SPEED
  camera.radius = clamp(camera.radius, CAMERA_ZOOM_MIN, CAMERA_ZOOM_MAX)
}
```

---

## UI Layout Specifications

### HUD Container
- Position: Fixed overlay
- Font: System sans-serif
- Text shadow: 2px 2px 4px rgba(0,0,0,0.5)

### Top Left Stats
```
💰 {gold}    ❤️ {lives}
Font size: 20px
Color: white
```

### Top Right Phase Display
```
BUILD phase: "BUILD PHASE" (green #4ADE80)
WAVE phase: "WAVE {n} - {alive}/{total}" (orange #FB923C)
GAME_OVER: "GAME OVER" (red #F87171)
```

### Tower Selection Bar (Bottom Center)
```
┌──────────────────────────────────────┐
│  [🏹]  [🔥]  [❄️]  [⚡]  [START]    │
│   1     2     3     4                │
└──────────────────────────────────────┘

Button size: 56×56 px
Border: 2px solid
Selected: green border (#4ADE80), green glow, green bg (20% opacity)
Disabled: 40% opacity
Hidden during WAVE phase
```

### Start Button States
- BUILD: "START" (green gradient)
- GAME_OVER: "TRY AGAIN" (red gradient)
- WAVE: Hidden

---

## Minimap Implementation

### Canvas Setup
```javascript
width = 150
height = width * (MAP_DEPTH / MAP_WIDTH)  // Maintain aspect ratio
position = bottom-right corner
background = '#1A472A'
```

### Coordinate Transform
```javascript
// World to minimap (rotated to match camera view)
function worldToMinimap(worldX, worldZ) {
  minimapX = (worldZ + MAP_DEPTH/2) / MAP_DEPTH * width
  minimapY = (worldX + MAP_WIDTH/2) / MAP_WIDTH * height
  return { x: minimapX, y: minimapY }
}
```

### Drawing Elements
```javascript
// Path
ctx.strokeStyle = '#8B7355'
ctx.lineWidth = 6
ctx.beginPath()
for (waypoint of PATH_WAYPOINTS) {
  pos = worldToMinimap(waypoint.x, waypoint.z)
  ctx.lineTo(pos.x, pos.y)
}
ctx.stroke()

// Start marker (green circle)
// End marker (red circle)

// Towers (colored dots, radius 3)
towerColors = {
  arrow: '#A78BFA',
  flame: '#F97316',
  frost: '#66CCFF',
  lightning: '#8844FF'
}

// Enemies (red dots, radius 2)
// Only if spawned && !dying

// Viewport rectangle (white stroke)
viewWidth = camera.radius * 1.5 * scaleX
viewHeight = camera.radius * 1.2 * scaleZ
```

### Click to Pan
```javascript
onClick(canvasX, canvasY) {
  worldX = (canvasY / height) * MAP_WIDTH - MAP_WIDTH/2
  worldZ = (canvasX / width) * MAP_DEPTH - MAP_DEPTH/2
  camera.target = { x: worldX, y: 0, z: worldZ }
}
```

---

## Critical Constants Summary

### Balance
| Constant | Value |
|----------|-------|
| STARTING_GOLD | 3000 |
| STARTING_LIVES | 20 |
| GOLD_PER_KILL | 10 |
| BASE_ENEMY_COUNT | 200 |
| ENEMY_INCREMENT | 100 |
| BASE_HP | 500 |
| HP_SCALE | 1.2 |
| BASE_SPEED | 2.0 |
| SPEED_SCALE | 1.05 |

### Physics
| Constant | Value |
|----------|-------|
| GRAVITY | -20 |
| FLAME_GRAVITY | 9.8 |
| KNOCKBACK | 2.0 |
| JITTER_AMPLITUDE | 0.25 |
| JITTER_FREQUENCY | 2.0 |

### Pools
| Pool | Max |
|------|-----|
| Enemies | 500 |
| Projectiles | 100 |
| Particles | 200 |
| Ragdolls | 20 |
| Trail Particles | 300 |
| Muzzle Flashes | 15 |
| Death Lights | 5 |

### Effect Lifetimes (ms)
| Effect | Duration |
|--------|----------|
| Voxel Shatter | 800 |
| Gold Popup | 1000 |
| Ragdoll | 2000 |
| Trail Particle | 150 |
| Muzzle Flash | 80 |
| Death Light | 120 |
| Crit Flash | 250 |
| Frost Explosion | 400 |
| Lightning Arc | ~600 |
| Scorch Mark | 800 |
