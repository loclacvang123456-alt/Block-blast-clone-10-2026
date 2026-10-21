# PIXEL BLAST 🎮 (Pixi.js Block Blast Edition)

A high-fidelity **Block Blast** clone built with **Pixi.js (WebGL/Canvas)** in authentic **16-bit Pixel Art** style, complete with dynamic screen shake, particle debris physics, rising combo chimes, and retro chiptune SFX.

Engineered specifically for HTML5 web game portals (**Poki, CrazyGames, GameDistribution, itch.io, Y8**).

---

## 🌟 Key Features

1. **90%+ Authentic Block Blast Mechanics**:
   - Standard 8x8 sunken pixel grid sockets.
   - 3-piece bottom tray with smart spawning (prevents unfair early softlocks).
   - Responsive Touch (Mobile) and Pointer (Desktop) drag-and-drop.
   - **Finger Offset**: Pieces are dynamically hoisted 72px above thumb/cursor to prevent touch obstruction.
   - **Ghost Placement Preview**: Zero-allocation translucent sprite preview on valid cells.
   - **Line Clear Prediction**: Pulsing highlight on full rows & columns before releasing the block.
   - **Rising Combo Chimes**: Pentatonic scale frequency climb for consecutive clears (Combo x2, x3, x4...).
   - **Simultaneous Row & Column Clears** + **All Clear (+300 pts)** bonus.
   - Automatic game-over detection when no remaining tray pieces can fit.

2. **Pixel Art Visuals & VFX (Game Juice)**:
   - Chunky 16-bit arcade pixel tiles with 3D bevel shading and top-left specular glints.
   - 8 vibrant neon arcade palettes (Cyan, Yellow, Pink, Green, Orange, Purple, Red, Blue).
   - **Pixel Shatter Particles**: Blocks disintegrate into 14+ square pixel debris with velocities, gravity, and spin.
   - **Screen Shake (Trauma Model)**: Quadratic trauma decay on line explosions and heavy drops.
   - Bouncing floating text popups (`+30`, `COMBO x3!`, `AMAZING!`, `ALL CLEAR!`).

3. **Synthesized Web Audio Engine (SFX)**:
   - 100% self-contained Web Audio API synthesizer — **no external audio asset dependencies** that could fail to load or get blocked by CORS.
   - Pickup pop, snap drop thud, line-clear laser chimes, combo fanfare, game over cadence, and victory fanfare.
   - Audio mute toggle with persistent `localStorage` preference.

4. **HTML5 Portal Ready**:
   - Zero external runtime network requests (`pixi.min.js` bundled locally).
   - Runs cleanly offline or inside iframes.
   - Responsive canvas scaling across Mobile phones, Tablets, and Desktop screens.

---

## 📁 Project Structure

- `index.html` — Portal-friendly game shell with HUD scoreboard and modal dialogs.
- `style.css` — Retro arcade cabinet presentation with crisp pixel styling.
- `pixi.min.js` — Bundled Pixi.js v7 runtime (WebGL accelerated renderer).
- `audio.js` — Synthesized retro sound effects generator via Web Audio API.
- `game.js` — Scene graph, 8x8 grid logic, polyomino generation, input handling, and VFX.
- `test.js` — Runnable assertion suite for collision, placement, and line clear logic.

---

## 🚀 Running & Testing

### Option 1: Direct Browser Launch
Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
```bash
npx serve .
# or
python -m http.server 8080
```
Then visit `http://localhost:8080`.

### Option 3: Unit Self-Check
```bash
node test.js
```
