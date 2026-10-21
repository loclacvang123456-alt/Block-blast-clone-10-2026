// Self-check test for Block Blast core mechanics
import assert from 'assert';

// 1. Grid & Clear logic test
const GRID_SIZE = 8;

function checkClears(board) {
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

function canPlace(board, matrix, gridCol, gridRow) {
  const h = matrix.length;
  const w = matrix[0].length;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (matrix[r][c] === 1) {
        const br = gridRow + r;
        const bc = gridCol + c;
        if (br < 0 || br >= GRID_SIZE || bc < 0 || bc >= GRID_SIZE) return false;
        if (board[br][bc] !== null) return false;
      }
    }
  }
  return true;
}

// Test 1: Empty board accepts piece
const board1 = Array.from({ length: 8 }, () => Array(8).fill(null));
assert.strictEqual(canPlace(board1, [[1, 1], [1, 1]], 0, 0), true, 'Should place 2x2 at (0,0)');
assert.strictEqual(canPlace(board1, [[1, 1], [1, 1]], 7, 7), false, 'Should reject 2x2 out of bounds at (7,7)');

// Test 2: Occupied board collision
board1[1][1] = 1;
assert.strictEqual(canPlace(board1, [[1, 1], [1, 1]], 0, 0), false, 'Should reject placement due to occupied cell');

// Test 3: Line clear detection
const board2 = Array.from({ length: 8 }, () => Array(8).fill(null));
for (let c = 0; c < 8; c++) board2[2][c] = 1; // row 2 full
for (let r = 0; r < 8; r++) board2[r][5] = 1; // col 5 full

const clears = checkClears(board2);
assert.deepStrictEqual(clears.rows, [2], 'Should detect row 2 full');
assert.deepStrictEqual(clears.cols, [5], 'Should detect col 5 full');

console.log('✅ All core logic assertions passed successfully!');
