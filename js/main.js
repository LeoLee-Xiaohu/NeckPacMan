import { UIController } from "./ui.js";

const canvas = document.getElementById("game-canvas");
const uiRoot = document.getElementById("ui-root");
const cameraPreview = document.getElementById("camera-preview");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Expected #game-canvas to be an HTMLCanvasElement.");
}

if (!(uiRoot instanceof HTMLDivElement)) {
  throw new Error("Expected #ui-root to be an HTMLDivElement.");
}

if (!(cameraPreview instanceof HTMLDivElement)) {
  throw new Error("Expected #camera-preview to be an HTMLDivElement.");
}

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("2D canvas context is unavailable.");
}

const ui = new UIController({
  root: uiRoot,
  preview: cameraPreview,
});

const MAZE = [
  "111111111111111111111",
  "100000000010000000001",
  "101111011010110111101",
  "100001000000000100001",
  "101101011111110101101",
  "100000010000010000001",
  "111101110111011101111",
  "100100000101000001001",
  "101101110101110110101",
  "100000010000010000001",
  "101111011111110111101",
  "100001000000000100001",
  "111101011011010101111",
  "100000010000010000001",
  "101101110111011101101",
  "100100000101000001001",
  "101111110101011111101",
  "100000000000000000001",
  "101111011111110111101",
  "100000010000010000001",
  "111111111111111111111",
];

const CELL_SIZE = 24;
const DOT_RADIUS = 3;
const PACMAN_RADIUS = CELL_SIZE * 0.38;
const WALL_COLOR = "#2b6aff";
const PATH_COLOR = "#000000";
const DOT_COLOR = "#ffffff";
const PACMAN_COLOR = "#f9d649";
const PLAYER_SPEED = 4;
const TURN_TOLERANCE = 0.08;
const START_CELL = { row: 17, col: 10 };

const DIRECTION_VECTORS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const BOARD_WIDTH = MAZE[0].length * CELL_SIZE;
const BOARD_HEIGHT = MAZE.length * CELL_SIZE;
const BOARD_OFFSET_X = (canvas.width - BOARD_WIDTH) / 2;
const BOARD_OFFSET_Y = (canvas.height - BOARD_HEIGHT) / 2;

let animationFrameId = null;
let lastFrameTime = 0;

const gameState = {
  running: false,
  score: 0,
  dots: new Set(),
  player: createPlayer(),
};

function createPlayer() {
  return {
    x: START_CELL.col + 0.5,
    y: START_CELL.row + 0.5,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
  };
}

function isPathCell(row, col) {
  return MAZE[row]?.[col] === "0";
}

function createDotKey(row, col) {
  return `${row}:${col}`;
}

function seedDots() {
  const dots = new Set();

  for (let row = 0; row < MAZE.length; row += 1) {
    for (let col = 0; col < MAZE[row].length; col += 1) {
      if (!isPathCell(row, col)) {
        continue;
      }

      if (row === START_CELL.row && col === START_CELL.col) {
        continue;
      }

      dots.add(createDotKey(row, col));
    }
  }

  return dots;
}

function isAlignedToCell(value) {
  const center = Math.floor(value) + 0.5;
  return Math.abs(value - center) <= TURN_TOLERANCE;
}

function snapToCellCenter(player) {
  if (isAlignedToCell(player.x)) {
    player.x = Math.floor(player.x) + 0.5;
  }

  if (isAlignedToCell(player.y)) {
    player.y = Math.floor(player.y) + 0.5;
  }
}

function canMoveInDirection(player, direction) {
  if (direction.x === 0 && direction.y === 0) {
    return false;
  }

  const row = Math.floor(player.y);
  const col = Math.floor(player.x);
  return isPathCell(row + direction.y, col + direction.x);
}

function collectDotAtPlayer() {
  const row = Math.floor(gameState.player.y);
  const col = Math.floor(gameState.player.x);
  const dotKey = createDotKey(row, col);

  if (!gameState.dots.has(dotKey)) {
    return;
  }

  gameState.dots.delete(dotKey);
  gameState.score += 10;
  ui.setScore(gameState.score);

  if (gameState.dots.size === 0) {
    stopGameLoop();
    gameState.running = false;
    ui.showWin(gameState.score);
  }
}

function updatePlayer(deltaSeconds) {
  const { player } = gameState;

  if (isAlignedToCell(player.x) && isAlignedToCell(player.y)) {
    snapToCellCenter(player);

    if (canMoveInDirection(player, player.nextDirection)) {
      player.direction = { ...player.nextDirection };
    } else if (!canMoveInDirection(player, player.direction)) {
      player.direction = { x: 0, y: 0 };
    }
  }

  if (player.direction.x === 0 && player.direction.y === 0) {
    collectDotAtPlayer();
    return;
  }

  const nextX = player.x + player.direction.x * PLAYER_SPEED * deltaSeconds;
  const nextY = player.y + player.direction.y * PLAYER_SPEED * deltaSeconds;

  if (player.direction.x !== 0) {
    player.x = nextX;
  }

  if (player.direction.y !== 0) {
    player.y = nextY;
  }

  if (isAlignedToCell(player.x) && isAlignedToCell(player.y)) {
    snapToCellCenter(player);
  }

  collectDotAtPlayer();
}

function drawBoard() {
  context.fillStyle = PATH_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < MAZE.length; row += 1) {
    for (let col = 0; col < MAZE[row].length; col += 1) {
      const x = BOARD_OFFSET_X + col * CELL_SIZE;
      const y = BOARD_OFFSET_Y + row * CELL_SIZE;

      if (MAZE[row][col] === "1") {
        context.fillStyle = WALL_COLOR;
        context.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function drawDots() {
  context.fillStyle = DOT_COLOR;

  for (const dotKey of gameState.dots) {
    const [row, col] = dotKey.split(":").map(Number);
    const x = BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
    const y = BOARD_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2;

    context.beginPath();
    context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
    context.fill();
  }
}

function getPlayerAngle() {
  const { direction, nextDirection } = gameState.player;
  const facing = direction.x !== 0 || direction.y !== 0 ? direction : nextDirection;

  if (facing.x === 1) {
    return 0;
  }

  if (facing.x === -1) {
    return Math.PI;
  }

  if (facing.y === -1) {
    return -Math.PI / 2;
  }

  return Math.PI / 2;
}

function drawPlayer() {
  const angle = getPlayerAngle();
  const x = BOARD_OFFSET_X + gameState.player.x * CELL_SIZE;
  const y = BOARD_OFFSET_Y + gameState.player.y * CELL_SIZE;
  const mouthAngle = Math.PI / 4;

  context.fillStyle = PACMAN_COLOR;
  context.beginPath();
  context.moveTo(x, y);
  context.arc(x, y, PACMAN_RADIUS, angle + mouthAngle / 2, angle - mouthAngle / 2 + Math.PI * 2);
  context.closePath();
  context.fill();
}

function renderGame() {
  drawBoard();
  drawDots();
  drawPlayer();
}

function frame(timestamp) {
  if (!gameState.running) {
    return;
  }

  const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
  lastFrameTime = timestamp;

  updatePlayer(deltaSeconds);
  renderGame();

  if (gameState.running) {
    animationFrameId = window.requestAnimationFrame(frame);
  }
}

function startGameLoop() {
  stopGameLoop();
  gameState.running = true;
  lastFrameTime = performance.now();
  renderGame();
  animationFrameId = window.requestAnimationFrame(frame);
}

function stopGameLoop() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resetGameState() {
  gameState.running = false;
  gameState.score = 0;
  gameState.dots = seedDots();
  gameState.player = createPlayer();
  ui.setScore(0);
  renderGame();
}

function drawBackdrop(message) {
  drawBoard();
  drawDots();
  drawPlayer();
  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "28px Trebuchet MS";
  context.textAlign = "center";
  context.fillText(message, canvas.width / 2, canvas.height - 72);
}

function handleDirectionInput(event) {
  const direction = DIRECTION_VECTORS[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  gameState.player.nextDirection = { ...direction };
}

window.addEventListener("keydown", handleDirectionInput);

ui.onStart(() => {
  stopGameLoop();
  resetGameState();
  drawBackdrop("Center your head for calibration");
});

ui.onPlaying(() => {
  resetGameState();
  startGameLoop();
});

ui.onReset(() => {
  stopGameLoop();
  resetGameState();
  drawBackdrop("Press Start to begin");
});

resetGameState();
drawBackdrop("Press Start to begin");
ui.init();
