import * as PIXI from 'pixi.js';
import { audio } from './audio.js';

/**
 * PIXEL BLAST - Pixi.js HTML5 Edition
 * Faithful Block Blast mechanics with 8-bit / 16-bit Pixel Art visual juice.
 * Built for HTML5 game portals (Poki, CrazyGames, GameDistribution, itch.io).
 */

(() => {
  'use strict';

  // --- 1. CONFIG & PALETTES ---
  const GRID_SIZE = 8;
  const STORAGE_KEY_BEST = 'pixel_blast_best_score';
  const FINGER_OFFSET_Y = 72; // pixels offset above pointer during drag

  // Authentic 16-bit retro color palette for blocks
  const PALETTES = [
    { name: 'cyan',    base: 0x00d2ff, hi: 0x80eaff, sh: 0x0077b6, hex: '#00d2ff' },
    { name: 'yellow',  base: 0xffcc00, hi: 0xffea70, sh: 0xcc9900, hex: '#ffcc00' },
    { name: 'pink',    base: 0xff2a85, hi: 0xff80b7, sh: 0xb3004b, hex: '#ff2a85' },
    { name: 'green',   base: 0x00e676, hi: 0x80ffbd, sh: 0x009944, hex: '#00e676' },
    { name: 'orange',  base: 0xff7700, hi: 0xffaa55, sh: 0xb34400, hex: '#ff7700' },
    { name: 'purple',  base: 0x9d4edd, hi: 0xc77dff, sh: 0x5a189a, hex: '#9d4edd' },
    { name: 'red',     base: 0xff3333, hi: 0xff8888, sh: 0xaa1111, hex: '#ff3333' },
    { name: 'blue',    base: 0x2979ff, hi: 0x82b1ff, sh: 0x0d47a1, hex: '#2979ff' },
  ];

  // Polyomino Shapes Catalog
  const SHAPE_DEFINITIONS = [
    // 1x1 Dot
    { matrix: [[1]], weight: 6 },

    // 2x1 Domino
    { matrix: [[1, 1]], weight: 7 },
    { matrix: [[1], [1]], weight: 7 },

    // 3x1 Tromino
    { matrix: [[1, 1, 1]], weight: 8 },
    { matrix: [[1], [1], [1]], weight: 8 },

    // 4x1 Tetromino
    { matrix: [[1, 1, 1, 1]], weight: 6 },
    { matrix: [[1], [1], [1], [1]], weight: 6 },

    // 5x1 Pentomino (Special line clearer)
    { matrix: [[1, 1, 1, 1, 1]], weight: 4 },
    { matrix: [[1], [1], [1], [1], [1]], weight: 4 },

    // 2x2 Square
    { matrix: [[1, 1], [1, 1]], weight: 9 },

    // 3x3 Square
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 3 },

    // Small Corner 2x2 (3 blocks)
    { matrix: [[1, 0], [1, 1]], weight: 7 },
    { matrix: [[0, 1], [1, 1]], weight: 7 },
    { matrix: [[1, 1], [1, 0]], weight: 7 },
    { matrix: [[1, 1], [0, 1]], weight: 7 },

    // Big Corner 3x3 (5 blocks)
    { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], weight: 5 },
    { matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], weight: 5 },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], weight: 5 },
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], weight: 5 },

    // L-Shapes (3x2, 4 blocks)
    { matrix: [[1, 0], [1, 0], [1, 1]], weight: 6 },
    { matrix: [[0, 1], [0, 1], [1, 1]], weight: 6 },
    { matrix: [[1, 1], [1, 0], [1, 0]], weight: 6 },
    { matrix: [[1, 1], [0, 1], [0, 1]], weight: 6 },
    { matrix: [[1, 1, 1], [1, 0, 0]], weight: 6 },
    { matrix: [[1, 1, 1], [0, 0, 1]], weight: 6 },
    { matrix: [[1, 0, 0], [1, 1, 1]], weight: 6 },
    { matrix: [[0, 0, 1], [1, 1, 1]], weight: 6 },

    // T-Shapes (3x2, 4 blocks)
    { matrix: [[1, 1, 1], [0, 1, 0]], weight: 6 },
    { matrix: [[0, 1, 0], [1, 1, 1]], weight: 6 },
    { matrix: [[1, 0], [1, 1], [1, 0]], weight: 6 },
    { matrix: [[0, 1], [1, 1], [0, 1]], weight: 6 },

    // Z and S Shapes
    { matrix: [[1, 1, 0], [0, 1, 1]], weight: 5 },
    { matrix: [[0, 1, 1], [1, 1, 0]], weight: 5 },
    { matrix: [[1, 0], [1, 1], [0, 1]], weight: 5 },
    { matrix: [[0, 1], [1, 1], [1, 0]], weight: 5 },

    // Plus Shape (Cross, 5 blocks)
    { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], weight: 3 },

    // Diagonal 2
    { matrix: [[1, 0], [0, 1]], weight: 3 },
    { matrix: [[0, 1], [1, 0]], weight: 3 },
  ];

  // --- 2. GAME STATE & DOM ---
  const scoreEl = document.getElementById('score-display');
  const bestScoreEl = document.getElementById('best-score-display');
  const comboEl = document.getElementById('combo-display');
  const comboBoxEl = document.getElementById('combo-box');
  const gameOverModal = document.getElementById('game-over-modal');
  const finalScoreEl = document.getElementById('final-score');
  const finalBestEl = document.getElementById('final-best');
  const newRecordBadge = document.getElementById('new-record-badge');
  const btnRestart = document.getElementById('btn-restart');
  const btnSound = document.getElementById('btn-sound');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnRevive = document.getElementById('btn-revive');
  const pixiMount = document.getElementById('pixi-view');

  let score = 0;
  let bestScore = parseInt(localStorage.getItem(STORAGE_KEY_BEST) || '0', 10);
  let combo = 0;
  let isGameOver = false;

  // Board logical state: 8x8 matrix; null or colorIdx (0-7)
  const board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

  // Trauma for screen shake
  let trauma = 0;

  // --- 3. PIXI APPLICATION & SCENE GRAPH ---
  let app;
  let rootStage;
  let gridBgGraphics;
  let previewGraphics;
  let boardContainer;
  let ghostContainer;
  let trayContainer;
  let dragContainer;
  let particleContainer;
  let textContainer;

  // Pre-rendered block textures (base texture size = 48x48)
  const BLOCK_TEXTURE_SIZE = 48;
  const blockTextures = [];

  // Board sprites: 8x8 array of PIXI.Sprite
  const boardSprites = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

  // Ghost sprites pool (max 9 blocks for 3x3)
  const ghostSprites = [];

  // Tray Pieces: 3 slots
  let trayPieces = [null, null, null];

  // Dragging state
  let draggingPiece = null;
  let currentPointerPos = { x: 0, y: 0 };
  let targetGridPos = null;
  let previewClears = { rows: [], cols: [] };

  // Particles & Floating Text pool
  const particles = [];
  const floatingTexts = [];

  // Layout metrics
  const layout = {
    viewWidth: 0,
    viewHeight: 0,
    cellSize: 0,
    gridWidth: 0,
    gridX: 0,
    gridY: 0,
    trayY: 0,
    trayHeight: 0,
    slotWidth: 0,
  };

  // --- 4. TEXTURE GENERATION (PIXEL ART TILES) ---
  function generateBlockTextures() {
    for (let i = 0; i < PALETTES.length; i++) {
      const p = PALETTES[i];
      const g = new PIXI.Graphics();
      const s = BLOCK_TEXTURE_SIZE;
      const bevel = 6;

      // Outer black pixel border
      g.beginFill(0x06070a);
      g.drawRect(0, 0, s, s);
      g.endFill();

      // Main face
      g.beginFill(p.base);
      g.drawRect(bevel, bevel, s - bevel * 2, s - bevel * 2);
      g.endFill();

      // Highlight bevel (top & left)
      g.beginFill(p.hi);
      g.drawRect(2, 2, s - 4, bevel);
      g.drawRect(2, 2, bevel, s - 4);
      g.endFill();

      // Shadow bevel (bottom & right)
      g.beginFill(p.sh);
      g.drawRect(2, s - bevel - 2, s - 4, bevel);
      g.drawRect(s - bevel - 2, 2, bevel, s - 4);
      g.endFill();

      // Specular glint (top-left shiny pixel)
      g.beginFill(0xffffff);
      g.drawRect(bevel + 2, bevel + 2, 4, 4);
      g.endFill();

      const texture = app.renderer.generateTexture(g);
      blockTextures.push(texture);
      g.destroy(true);
    }
  }

  // --- 5. INITIALIZATION ---
  function init() {
    updateMuteButtonUI();
    updateBestScoreUI();

    const rect = pixiMount.getBoundingClientRect();
    const initWidth = Math.max(300, Math.floor(rect.width));
    const initHeight = Math.max(400, Math.floor(rect.height));

    app = new PIXI.Application({
      width: initWidth,
      height: initHeight,
      backgroundColor: 0x12141f,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: false,
    });

    pixiMount.appendChild(app.view);

    // Create scene graph hierarchy
    rootStage = new PIXI.Container();
    app.stage.addChild(rootStage);

    gridBgGraphics = new PIXI.Graphics();
    previewGraphics = new PIXI.Graphics();
    boardContainer = new PIXI.Container();
    ghostContainer = new PIXI.Container();
    trayContainer = new PIXI.Container();
    dragContainer = new PIXI.Container();
    particleContainer = new PIXI.Container();
    textContainer = new PIXI.Container();

    rootStage.addChild(gridBgGraphics);
    rootStage.addChild(previewGraphics);
    rootStage.addChild(boardContainer);
    rootStage.addChild(ghostContainer);
    rootStage.addChild(trayContainer);
    rootStage.addChild(dragContainer);
    rootStage.addChild(particleContainer);
    rootStage.addChild(textContainer);

    generateBlockTextures();
    createBoardSprites();
    setupEvents();
    resize();

    window.addEventListener('resize', resize);

    // Start game
    startNewGame();

    // Game loop ticker
    app.ticker.add((delta) => {
      const dt = delta / 60; // Delta time in seconds
      update(dt);
    });
  }

  function createBoardSprites() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const sprite = new PIXI.Sprite(blockTextures[0]);
        sprite.visible = false;
        sprite.anchor.set(0);
        boardContainer.addChild(sprite);
        boardSprites[r][c] = sprite;
      }
    }

    // Pre-create 9 pooled ghost sprites (Zero GC hot path)
    for (let i = 0; i < 9; i++) {
      const gs = new PIXI.Sprite(blockTextures[0]);
      gs.visible = false;
      gs.alpha = 0.55;
      ghostContainer.addChild(gs);
      ghostSprites.push(gs);
    }
  }

  function resize() {
    const rect = pixiMount.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    app.renderer.resize(w, h);
    layout.viewWidth = w;
    layout.viewHeight = h;

    // Responsive grid calculations
    const hPadding = 16;
    const maxGridByWidth = w - hPadding * 2;
    const maxGridByHeight = h * 0.58;

    const targetGridWidth = Math.min(maxGridByWidth, maxGridByHeight);
    layout.cellSize = Math.floor(targetGridWidth / GRID_SIZE);
    layout.gridWidth = layout.cellSize * GRID_SIZE;
    layout.gridX = Math.floor((w - layout.gridWidth) / 2);

    layout.trayHeight = Math.max(90, layout.cellSize * 3.0);
    const totalContentHeight = layout.gridWidth + 24 + layout.trayHeight;
    const verticalRemainder = h - totalContentHeight;

    layout.gridY = Math.max(12, Math.floor(verticalRemainder * 0.35));
    layout.trayY = layout.gridY + layout.gridWidth + 20;
    layout.slotWidth = Math.floor(w / 3);

    renderGridBackground();
    updateBoardSprites();
    updateTrayPiecePositions();
  }

  function renderGridBackground() {
    gridBgGraphics.clear();

    const gx = layout.gridX;
    const gy = layout.gridY;
    const cs = layout.cellSize;
    const gw = layout.gridWidth;
    const pad = 6;

    // Outer retro border
    gridBgGraphics.beginFill(0x1c1f33);
    gridBgGraphics.drawRect(gx - pad, gy - pad, gw + pad * 2, gw + pad * 2);
    gridBgGraphics.endFill();

    // Board floor
    gridBgGraphics.beginFill(0x0e101c);
    gridBgGraphics.drawRect(gx, gy, gw, gw);
    gridBgGraphics.endFill();

    // Grid sockets
    const cellGap = 2;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cx = gx + c * cs;
        const cy = gy + r * cs;

        // Socket base
        gridBgGraphics.beginFill(0x141724);
        gridBgGraphics.drawRect(cx + cellGap, cy + cellGap, cs - cellGap * 2, cs - cellGap * 2);
        gridBgGraphics.endFill();

        // Socket inner shadow
        gridBgGraphics.beginFill(0x0a0b12);
        gridBgGraphics.drawRect(cx + cellGap, cy + cellGap, cs - cellGap * 2, 2);
        gridBgGraphics.drawRect(cx + cellGap, cy + cellGap, 2, cs - cellGap * 2);
        gridBgGraphics.endFill();
      }
    }
  }

  function updateBoardSprites() {
    const cs = layout.cellSize;
    const scale = cs / BLOCK_TEXTURE_SIZE;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const sprite = boardSprites[r][c];
        const cell = board[r][c];

        if (cell !== null) {
          sprite.texture = blockTextures[cell];
          sprite.x = layout.gridX + c * cs;
          sprite.y = layout.gridY + r * cs;
          sprite.scale.set(scale);
          sprite.visible = true;
        } else {
          sprite.visible = false;
        }
      }
    }
  }

  function updateMuteButtonUI() {
    btnSound.textContent = audio.isMuted ? '🔇' : '🔊';
  }

  function updateBestScoreUI() {
    bestScoreEl.textContent = bestScore;
  }

  // --- 6. GAMEPLAY & LOGIC ---
  function startNewGame() {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        board[r][c] = null;
      }
    }

    score = 0;
    combo = 0;
    isGameOver = false;
    trauma = 0;
    draggingPiece = null;
    targetGridPos = null;
    previewClears = { rows: [], cols: [] };

    clearGhostPreview();
    previewGraphics.clear();
    clearParticles();
    clearFloatingTexts();

    scoreEl.textContent = '0';
    comboEl.textContent = '0';
    gameOverModal.classList.add('hidden');
    newRecordBadge.classList.add('hidden');

    updateBoardSprites();
    spawnNewTrayPieces();
  }

  function getRandomPieceDefinition() {
    const totalWeight = SHAPE_DEFINITIONS.reduce((acc, def) => acc + def.weight, 0);
    let r = Math.random() * totalWeight;
    for (const def of SHAPE_DEFINITIONS) {
      if (r < def.weight) return def;
      r -= def.weight;
    }
    return SHAPE_DEFINITIONS[0];
  }

  function createPieceObject(definition, slotIdx) {
    const matrix = definition.matrix;
    const height = matrix.length;
    const width = matrix[0].length;
    let blockCount = 0;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (matrix[r][c] === 1) blockCount++;
      }
    }

    const colorIdx = Math.floor(Math.random() * PALETTES.length);

    // Build Pixi container for the piece
    const container = new PIXI.Container();
    const baseScale = (layout.cellSize / BLOCK_TEXTURE_SIZE) * 0.56;

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (matrix[r][c] === 1) {
          const sprite = new PIXI.Sprite(blockTextures[colorIdx]);
          sprite.x = c * BLOCK_TEXTURE_SIZE;
          sprite.y = r * BLOCK_TEXTURE_SIZE;
          container.addChild(sprite);
        }
      }
    }

    trayContainer.addChild(container);

    return {
      id: Math.random().toString(36).substring(2, 9),
      matrix,
      colorIdx,
      width,
      height,
      blockCount,
      slotIdx,
      container,
      x: 0,
      y: 0,
      origX: 0,
      origY: 0,
      scale: 0.56,
      targetScale: 0.56,
      inTray: true,
      canFit: true,
    };
  }

  function spawnNewTrayPieces() {
    // Clear old containers if any
    for (let i = 0; i < 3; i++) {
      if (trayPieces[i] && trayPieces[i].container) {
        trayPieces[i].container.destroy({ children: true });
      }
      trayPieces[i] = null;
    }

    for (let slot = 0; slot < 3; slot++) {
      let candidate = null;
      let attempts = 0;

      while (attempts < 20) {
        const def = getRandomPieceDefinition();
        const p = createPieceObject(def, slot);
        if (slot === 0) {
          if (canPieceFitAnywhere(p)) {
            candidate = p;
            break;
          } else {
            p.container.destroy({ children: true });
          }
        } else {
          candidate = p;
          break;
        }
        attempts++;
      }

      if (!candidate) {
        candidate = createPieceObject(getRandomPieceDefinition(), slot);
      }

      trayPieces[slot] = candidate;
    }

    updateTrayPiecePositions();
    checkPossibleMoves();
  }

  function updateTrayPiecePositions() {
    for (let i = 0; i < 3; i++) {
      const piece = trayPieces[i];
      if (!piece) continue;

      const slotCenterX = layout.slotWidth * i + layout.slotWidth / 2;
      const slotCenterY = layout.trayY + layout.trayHeight / 2;

      const visualWidth = piece.width * layout.cellSize * piece.scale;
      const visualHeight = piece.height * layout.cellSize * piece.scale;

      piece.origX = slotCenterX - visualWidth / 2;
      piece.origY = slotCenterY - visualHeight / 2;

      if (piece.inTray) {
        piece.x = piece.origX;
        piece.y = piece.origY;
        piece.container.x = piece.x;
        piece.container.y = piece.y;
        const s = (layout.cellSize / BLOCK_TEXTURE_SIZE) * piece.scale;
        piece.container.scale.set(s);
      }
    }
  }

  function canPlacePiece(piece, gridCol, gridRow) {
    if (!piece) return false;
    const m = piece.matrix;
    for (let r = 0; r < piece.height; r++) {
      for (let c = 0; c < piece.width; c++) {
        if (m[r][c] === 1) {
          const br = gridRow + r;
          const bc = gridCol + c;
          if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) return false;
          if (board[br][bc] !== null) return false;
        }
      }
    }
    return true;
  }

  function canPieceFitAnywhere(piece) {
    if (!piece) return false;
    for (let r = 0; r <= GRID_SIZE - piece.height; r++) {
      for (let c = 0; c <= GRID_SIZE - piece.width; c++) {
        if (canPlacePiece(piece, c, r)) return true;
      }
    }
    return false;
  }

  function checkPossibleMoves() {
    let anyMovePossible = false;
    for (let i = 0; i < 3; i++) {
      const piece = trayPieces[i];
      if (piece) {
        piece.canFit = canPieceFitAnywhere(piece);
        piece.container.alpha = piece.canFit ? 1.0 : 0.35;
        if (piece.canFit) anyMovePossible = true;
      }
    }

    const remaining = trayPieces.filter(Boolean).length;
    if (remaining === 0) {
      spawnNewTrayPieces();
      return;
    }

    if (!anyMovePossible) {
      triggerGameOver();
    }
  }

  function placePiece(piece, gridCol, gridRow) {
    const m = piece.matrix;
    for (let r = 0; r < piece.height; r++) {
      for (let c = 0; c < piece.width; c++) {
        if (m[r][c] === 1) {
          board[gridRow + r][gridCol + c] = piece.colorIdx;
          spawnPuffParticles(
            layout.gridX + (gridCol + c + 0.5) * layout.cellSize,
            layout.gridY + (gridRow + r + 0.5) * layout.cellSize,
            PALETTES[piece.colorIdx].base,
            5
          );
        }
      }
    }

    addScore(piece.blockCount);
    audio.playPlace();
    addTrauma(0.12);

    updateBoardSprites();

    // Destroy placed piece container
    piece.container.destroy({ children: true });
    trayPieces[piece.slotIdx] = null;
    draggingPiece = null;
    targetGridPos = null;
    previewClears = { rows: [], cols: [] };
    clearGhostPreview();
    previewGraphics.clear();

    resolveLineClears();

    const remaining = trayPieces.filter(Boolean).length;
    if (remaining === 0) {
      spawnNewTrayPieces();
    } else {
      checkPossibleMoves();
    }
  }

  function calculateLinesToClear() {
    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (board[r].every(v => v !== null)) fullRows.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (board[r][c] === null) { full = false; break; }
      }
      if (full) fullCols.push(c);
    }

    return { rows: fullRows, cols: fullCols };
  }

  function resolveLineClears() {
    const { rows, cols } = calculateLinesToClear();
    const totalLines = rows.length + cols.length;

    if (totalLines > 0) {
      combo++;
      audio.playClear(totalLines, combo);
      addTrauma(0.25 + totalLines * 0.1);

      let linePoints = 0;
      if (totalLines === 1) linePoints = 10;
      else if (totalLines === 2) linePoints = 30;
      else if (totalLines === 3) linePoints = 60;
      else if (totalLines === 4) linePoints = 100;
      else linePoints = 150 + (totalLines - 5) * 60;

      const comboMultiplier = combo > 1 ? combo : 1;
      const gainedScore = linePoints * comboMultiplier;
      addScore(gainedScore);

      const clearedCells = new Set();
      rows.forEach(r => {
        for (let c = 0; c < GRID_SIZE; c++) clearedCells.add(`${r},${c}`);
      });
      cols.forEach(c => {
        for (let r = 0; r < GRID_SIZE; r++) clearedCells.add(`${r},${c}`);
      });

      clearedCells.forEach(coord => {
        const [r, c] = coord.split(',').map(Number);
        const colorIdx = board[r][c];
        if (colorIdx !== null) {
          const px = layout.gridX + (c + 0.5) * layout.cellSize;
          const py = layout.gridY + (r + 0.5) * layout.cellSize;
          spawnBlockShatter(px, py, PALETTES[colorIdx]);
          board[r][c] = null;
        }
      });

      updateBoardSprites();

      const centerX = layout.viewWidth / 2;
      const centerY = layout.gridY + layout.gridWidth / 2;

      let calloutText = `+${gainedScore}`;
      if (combo >= 2) {
        calloutText = `COMBO x${combo}! +${gainedScore}`;
        comboBoxEl.classList.remove('highlight');
        void comboBoxEl.offsetWidth;
        comboBoxEl.classList.add('highlight');
      }

      spawnFloatingText(centerX, centerY - 20, calloutText, '#ffbe0b', combo >= 2 ? 18 : 14);

      if (totalLines >= 3) {
        audio.playComboFanfare(combo);
        const praise = totalLines >= 4 ? '✨ UNBELIEVABLE! ✨' : '🔥 AMAZING! 🔥';
        spawnFloatingText(centerX, centerY + 25, praise, '#00f0ff', 16);
      }

      let isAllClear = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (board[r][c] !== null) { isAllClear = false; break; }
        }
        if (!isAllClear) break;
      }

      if (isAllClear) {
        addScore(300);
        spawnFloatingText(centerX, centerY - 60, '⭐ ALL CLEAR! +300 ⭐', '#ff007f', 20);
        audio.playComboFanfare(10);
        addTrauma(0.5);
      }
    } else {
      combo = 0;
    }

    comboEl.textContent = combo;
  }

  function addScore(pts) {
    score += pts;
    scoreEl.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(STORAGE_KEY_BEST, bestScore);
      updateBestScoreUI();
    }
  }

  function triggerGameOver() {
    isGameOver = true;
    audio.playGameOver();
    addTrauma(0.4);

    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;

    if (score > 0 && score >= bestScore) {
      newRecordBadge.classList.remove('hidden');
      audio.playNewRecord();
    } else {
      newRecordBadge.classList.add('hidden');
    }

    setTimeout(() => {
      gameOverModal.classList.remove('hidden');
    }, 450);
  }

  // --- 7. VFX, PARTICLES & GHOST PREVIEW ---
  function addTrauma(amount) {
    trauma = Math.min(1.0, trauma + amount);
  }

  function clearGhostPreview() {
    for (let i = 0; i < ghostSprites.length; i++) {
      ghostSprites[i].visible = false;
    }
  }

  function updateGhostPreview() {
    clearGhostPreview();
    if (!draggingPiece || !targetGridPos || !targetGridPos.valid) return;

    const cs = layout.cellSize;
    const gx = layout.gridX;
    const gy = layout.gridY;
    const m = draggingPiece.matrix;
    const scale = cs / BLOCK_TEXTURE_SIZE;
    let spriteIdx = 0;

    for (let r = 0; r < draggingPiece.height; r++) {
      for (let c = 0; c < draggingPiece.width; c++) {
        if (m[r][c] === 1 && spriteIdx < ghostSprites.length) {
          const sprite = ghostSprites[spriteIdx++];
          sprite.texture = blockTextures[draggingPiece.colorIdx];
          sprite.x = gx + (targetGridPos.col + c) * cs;
          sprite.y = gy + (targetGridPos.row + r) * cs;
          sprite.scale.set(scale);
          sprite.alpha = 0.55;
          sprite.visible = true;
        }
      }
    }
  }

  function updatePreviewClearHighlights() {
    previewGraphics.clear();
    if (previewClears.rows.length === 0 && previewClears.cols.length === 0) return;

    const cs = layout.cellSize;
    const gx = layout.gridX;
    const gy = layout.gridY;
    const gw = layout.gridWidth;

    const pulse = 0.35 + Math.sin(performance.now() * 0.012) * 0.15;
    previewGraphics.beginFill(0xffffff, pulse);

    previewClears.rows.forEach(r => {
      previewGraphics.drawRect(gx, gy + r * cs, gw, cs);
    });
    previewClears.cols.forEach(c => {
      previewGraphics.drawRect(gx + c * cs, gy, cs, gw);
    });

    previewGraphics.endFill();
  }

  function spawnBlockShatter(cx, cy, palette) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const s = Math.floor(Math.random() * 5 + 4);
      const colors = [palette.hi, palette.base, palette.sh, 0xffffff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      g.beginFill(color);
      g.drawRect(-s / 2, -s / 2, s, s);
      g.endFill();

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 80;

      g.x = cx + (Math.random() - 0.5) * layout.cellSize * 0.8;
      g.y = cy + (Math.random() - 0.5) * layout.cellSize * 0.8;

      particleContainer.addChild(g);

      particles.push({
        displayObject: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 90,
        gravity: 600,
        life: 0,
        maxLife: Math.random() * 0.35 + 0.45,
      });
    }
  }

  function spawnPuffParticles(cx, cy, color, count = 4) {
    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const s = Math.floor(Math.random() * 3 + 3);
      g.beginFill(color);
      g.drawRect(-s / 2, -s / 2, s, s);
      g.endFill();

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 30;

      g.x = cx;
      g.y = cy;
      particleContainer.addChild(g);

      particles.push({
        displayObject: g,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 80,
        life: 0,
        maxLife: 0.25,
      });
    }
  }

  function clearParticles() {
    for (const p of particles) {
      p.displayObject.destroy(true);
    }
    particles.length = 0;
  }

  function spawnFloatingText(x, y, textStr, fillHex, fontSize = 14) {
    const textStyle = new PIXI.TextStyle({
      fontFamily: "'Press Start 2P', monospace",
      fontSize: fontSize,
      fill: fillHex,
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    });

    const pixiText = new PIXI.Text(textStr, textStyle);
    pixiText.anchor.set(0.5);
    pixiText.x = x;
    pixiText.y = y;
    pixiText.scale.set(1.4);

    textContainer.addChild(pixiText);

    floatingTexts.push({
      displayObject: pixiText,
      vy: -70,
      life: 0,
      maxLife: 0.9,
    });
  }

  function clearFloatingTexts() {
    for (const ft of floatingTexts) {
      ft.displayObject.destroy(true);
    }
    floatingTexts.length = 0;
  }

  // --- 8. INPUT HANDLING & GAMEDISTRIBUTION ADS ---
  function setupEvents() {
    // GameDistribution global event listener
    window.onGameDistributionEvent = function (event) {
      if (!event) return;
      switch (event.name) {
        case "SDK_GAME_PAUSE":
          if (app && app.ticker) app.ticker.stop();
          audio.setMutedByAd(true);
          break;
        case "SDK_GAME_START":
          if (app && app.ticker) app.ticker.start();
          audio.setMutedByAd(false);
          break;
        case "SDK_REWARDED_WATCH_COMPLETE":
          handleReviveSuccess();
          break;
      }
    };

    btnRestart.addEventListener('click', () => {
      audio.init();
      showInterstitialAd(() => {
        startNewGame();
      });
    });

    btnPlayAgain.addEventListener('click', () => {
      audio.init();
      showInterstitialAd(() => {
        startNewGame();
      });
    });

    btnRevive.addEventListener('click', () => {
      audio.init();
      showRewardedAd();
    });

    btnSound.addEventListener('click', () => {
      audio.init();
      const isMuted = audio.toggleMute();
      btnSound.textContent = isMuted ? '🔇' : '🔊';
    });

    // Pixi stage level pointer tracking
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    app.stage.on('pointerdown', handlePointerDown);
    app.stage.on('pointermove', handlePointerMove);
    app.stage.on('pointerup', handlePointerUp);
    app.stage.on('pointerupoutside', handlePointerUp);
  }

  function showInterstitialAd(callback) {
    if (typeof window.gdsdk !== 'undefined' && typeof window.gdsdk.showAd === 'function') {
      window.gdsdk.showAd()
        .then(() => { if (callback) callback(); })
        .catch((err) => {
          console.warn("GD Interstitial notice:", err);
          if (callback) callback();
        });
    } else {
      if (callback) callback();
    }
  }

  let isRewardedActive = false;
  function showRewardedAd() {
    if (isRewardedActive) return;
    isRewardedActive = true;

    if (typeof window.gdsdk !== 'undefined' && typeof window.gdsdk.showAd === 'function') {
      window.gdsdk.showAd('rewarded')
        .then(() => {
          isRewardedActive = false;
        })
        .catch((err) => {
          console.warn("GD Rewarded notice:", err);
          isRewardedActive = false;
        });
    } else {
      // Dev fallback outside GameDistribution environment
      console.log("GameDistribution SDK not loaded in local environment: granting test revive");
      isRewardedActive = false;
      handleReviveSuccess();
    }
  }

  function handleReviveSuccess() {
    isGameOver = false;
    gameOverModal.classList.add('hidden');
    audio.playRevive();
    addTrauma(0.4);

    // Clear board with satisfying shatter particles
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] !== null) {
          const px = layout.gridX + (c + 0.5) * layout.cellSize;
          const py = layout.gridY + (r + 0.5) * layout.cellSize;
          spawnBlockShatter(px, py, PALETTES[board[r][c]]);
          board[r][c] = null;
        }
      }
    }

    updateBoardSprites();

    const centerX = layout.viewWidth / 2;
    const centerY = layout.gridY + layout.gridWidth / 2;
    spawnFloatingText(centerX, centerY - 30, "✨ REVIVED! ✨", "#00ff66", 20);

    // Provide 3 fresh playable pieces
    spawnNewTrayPieces();
  }

  function handlePointerDown(e) {
    if (isGameOver) return;
    audio.init();

    const { x, y } = e.global;
    currentPointerPos.x = x;
    currentPointerPos.y = y;

    for (let i = 0; i < 3; i++) {
      const piece = trayPieces[i];
      if (!piece) continue;

      const visualWidth = piece.width * layout.cellSize * piece.scale;
      const visualHeight = piece.height * layout.cellSize * piece.scale;
      const hitPadding = 18;

      if (
        x >= piece.x - hitPadding &&
        x <= piece.x + visualWidth + hitPadding &&
        y >= piece.y - hitPadding &&
        y <= piece.y + visualHeight + hitPadding
      ) {
        draggingPiece = piece;
        draggingPiece.inTray = false;
        draggingPiece.targetScale = 1.0;

        // Move to dragContainer so it renders above all other elements
        dragContainer.addChild(piece.container);

        audio.playPickup();
        updateDragPlacementPreview();
        break;
      }
    }
  }

  function handlePointerMove(e) {
    if (!draggingPiece) return;
    const { x, y } = e.global;
    currentPointerPos.x = x;
    currentPointerPos.y = y;

    updateDragPlacementPreview();
  }

  function updateDragPlacementPreview() {
    if (!draggingPiece) return;

    const fullWidth = draggingPiece.width * layout.cellSize;
    const fullHeight = draggingPiece.height * layout.cellSize;

    const anchorX = currentPointerPos.x - fullWidth / 2;
    const anchorY = currentPointerPos.y - fullHeight / 2 - FINGER_OFFSET_Y;

    const visualBlockSize = layout.cellSize * draggingPiece.scale;
    const visualWidth = draggingPiece.width * visualBlockSize;
    const visualHeight = draggingPiece.height * visualBlockSize;

    draggingPiece.x = anchorX + (fullWidth - visualWidth) / 2;
    draggingPiece.y = anchorY + (fullHeight - visualHeight) / 2;

    draggingPiece.container.x = draggingPiece.x;
    draggingPiece.container.y = draggingPiece.y;
    draggingPiece.container.scale.set((layout.cellSize / BLOCK_TEXTURE_SIZE) * draggingPiece.scale);

    const relX = anchorX - layout.gridX;
    const relY = anchorY - layout.gridY;

    const col = Math.round(relX / layout.cellSize);
    const row = Math.round(relY / layout.cellSize);

    if (canPlacePiece(draggingPiece, col, row)) {
      targetGridPos = { col, row, valid: true };

      const simulatedBoard = board.map(r => [...r]);
      const m = draggingPiece.matrix;
      for (let r = 0; r < draggingPiece.height; r++) {
        for (let c = 0; c < draggingPiece.width; c++) {
          if (m[r][c] === 1) simulatedBoard[row + r][col + c] = 1;
        }
      }

      const simFullRows = [];
      const simFullCols = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (simulatedBoard[r].every(v => v !== null)) simFullRows.push(r);
      }
      for (let c = 0; c < GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (simulatedBoard[r][c] === null) { full = false; break; }
        }
        if (full) simFullCols.push(c);
      }

      previewClears = { rows: simFullRows, cols: simFullCols };
    } else {
      targetGridPos = null;
      previewClears = { rows: [], cols: [] };
    }

    updateGhostPreview();
    updatePreviewClearHighlights();
  }

  function handlePointerUp() {
    if (!draggingPiece) return;

    if (targetGridPos && targetGridPos.valid) {
      placePiece(draggingPiece, targetGridPos.col, targetGridPos.row);
    } else {
      audio.playCancel();
      returnPieceToTray(draggingPiece);
      draggingPiece = null;
      targetGridPos = null;
      previewClears = { rows: [], cols: [] };
      clearGhostPreview();
      previewGraphics.clear();
    }
  }

  function returnPieceToTray(piece) {
    piece.inTray = true;
    piece.targetScale = 0.56;
    trayContainer.addChild(piece.container);
  }

  // --- 9. TICKER UPDATE ---
  function update(dt) {
    // Screen Shake Trauma decay
    if (trauma > 0) {
      trauma = Math.max(0, trauma - 1.8 * dt);
      const shake = trauma * trauma;
      rootStage.x = (Math.random() * 2 - 1) * 14 * shake;
      rootStage.y = (Math.random() * 2 - 1) * 14 * shake;
    } else {
      rootStage.x = 0;
      rootStage.y = 0;
    }

    // Lerp Tray Pieces scale & position
    for (let i = 0; i < 3; i++) {
      const p = trayPieces[i];
      if (p) {
        p.scale += (p.targetScale - p.scale) * (1 - Math.exp(-24 * dt));
        if (p.inTray) {
          p.x += (p.origX - p.x) * (1 - Math.exp(-24 * dt));
          p.y += (p.origY - p.y) * (1 - Math.exp(-24 * dt));
          p.container.x = p.x;
          p.container.y = p.y;
          p.container.scale.set((layout.cellSize / BLOCK_TEXTURE_SIZE) * p.scale);
        }
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.displayObject.destroy(true);
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.displayObject.x += p.vx * dt;
      p.displayObject.y += p.vy * dt;
      p.displayObject.alpha = 1 - p.life / p.maxLife;
    }

    // Update Floating Text
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.life += dt;
      if (ft.life >= ft.maxLife) {
        ft.displayObject.destroy(true);
        floatingTexts.splice(i, 1);
        continue;
      }
      ft.displayObject.y += ft.vy * dt;
      const progress = ft.life / ft.maxLife;
      ft.displayObject.alpha = 1 - progress * progress;
      const s = Math.max(1.0, 1.4 - progress * 0.4);
      ft.displayObject.scale.set(s);
    }

    // Pulse preview clear highlights if any
    if (previewClears.rows.length > 0 || previewClears.cols.length > 0) {
      updatePreviewClearHighlights();
    }
  }

  // --- BOOTSTRAP ---
  window.addEventListener('DOMContentLoaded', init);
})();
