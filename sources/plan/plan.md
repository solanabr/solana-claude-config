# Tower Defense Chaos - Implementation Plan

## Overview
Build a 3D tower defense game with Babylon.js featuring voxel-style orcs, 4 tower types, and spectacular visual effects. The project is greenfield - starting from scratch.

---

## Step 1: Project Setup & Core Environment

### What will be implemented:
- Initialize Vite project with pnpm and Babylon.js 7.x
- Create project structure (`src/`, managers, models folders)
- Build the diorama floating island (ground plane, earth sides, bottom cap)
- Render the snake path (brown tiles between waypoints)
- Set up ArcRotateCamera with custom WASD pan + scroll zoom
- Create basic state store (Zustand-style pub-sub pattern)
- Add sky background color and basic lighting

### Files to create:
- `package.json`, `vite.config.js`, `index.html`
- `src/index.js` - Entry point, scene setup
- `src/store.js` - State management
- `src/settings.js` - All game constants
- `src/path.js` - Path waypoints and interpolation
- `src/camera.js` - Camera setup and controls

### What to review:
- Camera controls feel (WASD speed, zoom limits)
- Floating island appearance and path visibility
- Map dimensions (80x48 units)

---

## Step 2: Enemy System (Orcs)

### What will be implemented:
- Orc voxel model with all body parts (torso, head, limbs, tusks, armor, axe)
- Walk animation (leg/arm swing cycles)
- Path following with progress-based positioning
- Jitter system for natural wandering
- Thin instances for rendering 100+ enemies at 60fps
- Health bar billboards above enemies
- Frosted appearance variant (blue tint when slowed)

### Files to create:
- `src/models/orc.js` - Orc mesh construction, `getPartMatrix()`
- `src/managers/EnemyManager.js` - Spawning, movement, thin instances

### What to review:
- Orc appearance (colors, proportions, armor details)
- Walk animation smoothness
- Performance with many enemies (spawn test batch)
- Health bar positioning and color thresholds

---

## Step 3: Tower System & Placement

### What will be implemented:
- All 4 tower models (Arrow, Flame, Frost, Lightning)
- Tower idle animations (lava orb pulsing, lightning flickering, crystal bobbing)
- Tower selection via keyboard (1-4) and click
- Ghost tower preview during placement
- Grid snapping to 1-unit tiles
- Placement validation (not on path, not occupied, within bounds)
- Grid overlay visible during placement mode

### Files to create:
- `src/models/tower.js` - Tower mesh construction for all types
- `src/managers/TowerManager.js` - Tower updates, animations
- `src/input.js` - Tower placement input handling

### What to review:
- Tower visual designs match concept art direction
- Ghost preview visibility and invalid placement feedback (red tint)
- Grid snapping accuracy
- Tower animations (pulsing, flickering effects)

---

## Step 4: Projectiles & Combat

### What will be implemented:
- Projectile models (arrow with fletching, fireball sphere, frost shard cone)
- Targeting algorithm (nearest enemy in range)
- Fire timing system with staggered cooldowns
- Homing projectiles (arrow, frost) - track target by ID
- Ballistic projectiles (fireball) - gravity arc trajectory
- Lightning chain algorithm (4 additional targets within chain range)
- Collision detection with hit radius
- Damage application, slow effect (frost), AOE damage (flame, frost)
- Critical hits for arrows (15% chance, 2x damage)

### Files to create:
- `src/models/projectile.js` - Projectile mesh construction
- `src/managers/ProjectileManager.js` - Physics, collisions, damage

### What to review:
- Projectile appearance and trail visibility
- Arrow homing feels accurate
- Fireball arc trajectory looks natural
- Lightning chains to correct number of targets
- Damage numbers feel balanced

---

## Step 5: Visual Effects System

### What will be implemented:
- Voxel shatter on enemy death (12 green cubes bursting)
- Ragdoll physics (full orc mesh tumbling with knockback)
- Muzzle flash at tower fire points
- Death light flash (orange glow)
- Critical hit golden flash
- Trail particles (arrow sparks, fireball smoke)
- Frost explosion (cyan expanding sphere)
- Realistic fireball explosion (fire particles, smoke, debris, shockwave)
- Lightning arc visualization (jagged tube with glow)
- Lightning impact flash and particles
- Scorch marks on ground
- Gold popup text floating upward

### Files to create:
- `src/managers/EffectsManager.js` - All particle systems, ragdolls, visual effects

### What to review:
- Death feels satisfying (shatter + ragdoll combo)
- Effects don't overwhelm visibility during chaos
- Performance with many simultaneous effects
- Lightning arc jaggedness and timing

---

## Step 6: Wave System & Game Flow

### What will be implemented:
- Game phases (BUILD, WAVE, GAME_OVER)
- Wave spawning with staggered delays (0.5s between enemies)
- Wave scaling (HP +20%, speed +5%, count +100 per wave)
- Economy system (starting gold 3000, 10 gold per kill)
- Lives system (20 starting, -1 per escaped enemy)
- Wave completion detection
- Enemy escape at path end (triggers life loss)
- Game over condition and reset capability

### Store actions to implement:
- `startWave()`, `checkWaveComplete()`, `enemyPassed()`
- `damageEnemy()`, `addTower()`, `reset()`

### What to review:
- Wave pacing feels good
- Difficulty scaling per wave
- Gold economy balance (can afford towers?)
- Game over triggers correctly

---

## Step 7: UI System

### What will be implemented:
- HUD overlay (HTML/CSS positioned over canvas)
- Top-left: Gold and Lives display with emoji icons
- Top-right: Phase indicator text (colored by phase)
- Start/Try Again button (changes based on phase)
- Tower selection bar at bottom (4 buttons with hotkey hints)
- Selected state styling (green border/glow)
- Disabled state for unaffordable towers
- Minimap canvas (bottom-right)
  - Path visualization with start/end markers
  - Tower dots (colored by type)
  - Enemy dots (red)
  - Camera viewport rectangle
  - Click-to-pan functionality

### Files to create:
- `src/managers/UIManager.js` - HUD elements
- `src/managers/MinimapManager.js` - Canvas minimap

### What to review:
- UI readability and positioning
- Tower buttons respond to keyboard 1-4
- Minimap accuracy and click-to-pan
- Phase transitions update UI correctly

---

## Step 8: Polish & Post-Processing

### What will be implemented:
- Hemispheric light (ambient) + Directional sun with shadows
- Shadow map (2048px resolution, blur enabled)
- Post-processing pipeline:
  - FXAA anti-aliasing
  - Bloom (threshold 0.7, weight 0.3)
  - SSAO (radius 1.5, 16 samples)
  - Image processing (contrast 1.1, exposure 0.92, saturation +20)
- Exponential fog (density 0.0018, gray color)
- Decorations:
  - 80 trees (3-cone layers, seeded random placement)
  - Small rocks scattered
  - 7 big rock formations at fixed spots
  - 60 flowers with emissive glow
- Final performance optimization pass

### What to review:
- Visual atmosphere and mood
- Shadows look correct on all objects
- Bloom on emissive materials (tower orbs, effects)
- Decorations don't block gameplay
- Solid 60fps with full chaos on screen

---

## Implementation Notes

- Each step builds on the previous - they should be done in order
- After each step, you'll have a playable/viewable milestone
- I'll pause after completing each step for your review
- Feedback can adjust the next steps before implementation
