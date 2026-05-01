import { MAZE_GRID, PLAYER_START, getMazeLayoutMetrics, renderMaze } from "./maze.js";
import { Player } from "./player.js";
import { UIController } from "./ui.js";
import { PoseTracker } from "./tracker.js";

const GRID = [
  "111111111111111111111",
  "100000000010000000001",
  "101111011010111101101",
  "100001010000010100001",
  "111101011111010101111",
  "100001000010000100001",
  "101111111010111111101",
  "100000001000100000001",
  "111101101111101101111",
  "100100000000000001001",
  "100101111101111101001",
  "100100000000000001001",
  "111101101111101101111",
  "100000001000100000001",
  "101111111010111111101",
  "100001000010000100001",
  "111101011111010101111",
  "100001010000010100001",
  "101111011010111101101",
  "100000000010000000001",
  "111111111111111111111",
];

const CELL_SIZE = 24;
const PLAYER_SPEED = 4;
const SCORE_PER_DOT = 10;
const DIRECTIONS = {
  left: { x: -1, y: 0, angle: Math.PI },
  right: { x: 1, y: 0, angle: 0 },
  up: { x: 0, y: -1, angle: -Math.PI / 2 },
  down: { x: 0, y: 1, angle: Math.PI / 2 },
};
const KEY_TO_DIRECTION = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};
const TURN_EPSILON = 0.08;

const canvas = document.getElementById("game-canvas");
const uiRoot = document.getElementById("ui-root");
const cameraPreview = document.getElementById("camera-preview");
const cameraVideo = document.getElementById("camera-video");
const debugCanvas = document.getElementById("debug-canvas");
const cameraStatus = document.getElementById("camera-status");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Expected #game-canvas to be an HTMLCanvasElement.");
}

if (!(uiRoot instanceof HTMLDivElement)) {
  throw new Error("Expected #ui-root to be an HTMLDivElement.");
}

if (!(cameraPreview instanceof HTMLDivElement)) {
  throw new Error("Expected #camera-preview to be an HTMLDivElement.");
}

if (!(cameraVideo instanceof HTMLVideoElement)) {
  throw new Error("Expected #camera-video to be an HTMLVideoElement.");
}

if (!(debugCanvas instanceof HTMLCanvasElement)) {
  throw new Error("Expected #debug-canvas to be an HTMLCanvasElement.");
}

if (!(cameraStatus instanceof HTMLSpanElement)) {
  throw new Error("Expected #camera-status to be an HTMLSpanElement.");
}

const context = canvas.getContext("2d");
const debugContext = debugCanvas.getContext("2d");

if (!context) {
  throw new Error("2D canvas context is unavailable.");
}

if (!debugContext) {
  throw new Error("Debug canvas 2D context is unavailable.");
}

const ui = new UIController({
  root: uiRoot,
  preview: cameraPreview,
});
const tracker = new PoseTracker();

<<<<<<< HEAD
const DOT_RADIUS = 3;
const PLAYER_SPEED = 4;

const INPUT_TO_DIRECTION = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const POSE_DIRECTION_VECTORS = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  DOWN: "down",
};
let animationFrameId = null;
let lastFrameTime = 0;
let winTimer = null;
let mediaStream = null;
let faceMesh = null;
let faceMeshReady = false;
let isCameraReady = false;

const gameState = {
  running: false,
  score: 0,
  dots: new Set(),
  player: createPlayer(),
};

function createPlayer() {
  return new Player({
    ...PLAYER_START,
    speed: PLAYER_SPEED,
  });
}

function isPathCell(row, col) {
  return MAZE_GRID[row]?.[col] === 0;
}

function createDotKey(row, col) {
  return `${row}:${col}`;
}

function seedDots() {
  const dots = new Set();
  const startRow = Math.floor(PLAYER_START.y);
  const startCol = Math.floor(PLAYER_START.x);

  for (let row = 0; row < MAZE_GRID.length; row += 1) {
    for (let col = 0; col < MAZE_GRID[row].length; col += 1) {
      if (!isPathCell(row, col)) {
        continue;
      }

      if (row === startRow && col === startCol) {
        continue;
      }

      dots.add(createDotKey(row, col));
    }
  }

  return dots;
}

function collectDotAtPlayer() {
  const row = Math.floor(gameState.player.position.y);
  const col = Math.floor(gameState.player.position.x);
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
  gameState.player.update(deltaSeconds, MAZE_GRID);
  collectDotAtPlayer();
}

function drawDots(frame) {
  context.fillStyle = "#ffffff";

  for (const dotKey of gameState.dots) {
    const [row, col] = dotKey.split(":").map(Number);
    const x = frame.offsetX + col * frame.tileSize + frame.tileSize / 2;
    const y = frame.offsetY + row * frame.tileSize + frame.tileSize / 2;

    context.beginPath();
    context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
    context.fill();
  }
}

function renderGame() {
  const frame = getMazeLayoutMetrics(canvas);

  renderMaze(context, canvas);
  drawDots(frame);
  gameState.player.draw(context, {
    cellSize: frame.tileSize,
    offsetX: frame.offsetX,
    offsetY: frame.offsetY,
  });
}

function frame(timestamp) {
  if (!gameState.running) {
    return;
  }

  const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.1);
  lastFrameTime = timestamp;
=======
const board = createBoard();
const gameState = {
  animationFrameId: null,
  lastFrameTime: null,
  phase: "idle",
  score: 0,
  remainingDots: 0,
  pellets: new Set(),
  player: createPlayer(),
};

canvas.width = GRID[0].length * CELL_SIZE;
canvas.height = GRID.length * CELL_SIZE;

window.addEventListener("keydown", handleKeydown);

function createBoard() {
  return GRID.map((row) => row.split("").map((cell) => Number(cell)));
}

function createPlayer() {
  return {
    x: 10,
    y: 10,
    direction: "left",
    queuedDirection: "left",
    mouthPhase: 0,
  };
}

function createPellets() {
  const pellets = new Set();

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      if (board[row][column] === 0 && !(column === 10 && row === 10)) {
        pellets.add(getCellKey(column, row));
      }
    }
  }

  return pellets;
}

function getCellKey(column, row) {
  return `${column},${row}`;
}

function handleKeydown(event) {
  const direction = KEY_TO_DIRECTION[event.key];

  if (!direction || gameState.phase !== "playing") {
    return;
  }

  event.preventDefault();
  gameState.player.queuedDirection = direction;
}

function resetToStartScreen() {
  stopGameLoop();
  gameState.phase = "idle";
  gameState.score = 0;
  gameState.remainingDots = 0;
  gameState.pellets = new Set();
  gameState.player = createPlayer();
  drawBackdrop("Press Start to begin");
}

function startGame() {
  stopGameLoop();
  gameState.phase = "playing";
  gameState.score = 0;
  gameState.pellets = createPellets();
  gameState.remainingDots = gameState.pellets.size;
  gameState.player = createPlayer();
  ui.setScore(0);
  collectDotAtCurrentCell();
  renderGame();
  gameState.lastFrameTime = null;
  gameState.animationFrameId = window.requestAnimationFrame(runFrame);
}

function stopGameLoop() {
  if (gameState.animationFrameId !== null) {
    window.cancelAnimationFrame(gameState.animationFrameId);
    gameState.animationFrameId = null;
  }

  gameState.lastFrameTime = null;
}

function runFrame(timestamp) {
  if (gameState.phase !== "playing") {
    gameState.animationFrameId = null;
    return;
  }

  if (gameState.lastFrameTime === null) {
    gameState.lastFrameTime = timestamp;
  }

  const deltaSeconds = Math.min((timestamp - gameState.lastFrameTime) / 1000, 0.05);
  gameState.lastFrameTime = timestamp;
>>>>>>> 27366e9 (Implement game loop and win condition logic)

  updatePlayer(deltaSeconds);
  renderGame();

<<<<<<< HEAD
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
=======
  if (gameState.phase === "playing") {
    gameState.animationFrameId = window.requestAnimationFrame(runFrame);
  } else {
    gameState.animationFrameId = null;
  }
}

function updatePlayer(deltaSeconds) {
  const { player } = gameState;
  const queuedVector = DIRECTIONS[player.queuedDirection];
  const centeredColumn = Math.round(player.x);
  const centeredRow = Math.round(player.y);
  const isCentered =
    Math.abs(player.x - centeredColumn) < TURN_EPSILON &&
    Math.abs(player.y - centeredRow) < TURN_EPSILON;

  if (isCentered) {
    player.x = centeredColumn;
    player.y = centeredRow;

    if (canMove(centeredColumn, centeredRow, queuedVector)) {
      player.direction = player.queuedDirection;
    }
  }

  const activeVector = DIRECTIONS[player.direction];

  if (!canMove(player.x, player.y, activeVector)) {
    collectDotAtCurrentCell();
    return;
  }

  const distance = PLAYER_SPEED * deltaSeconds;
  player.x += activeVector.x * distance;
  player.y += activeVector.y * distance;
  player.mouthPhase += deltaSeconds * 10;

  const nextColumn = clamp(player.x, 1, board[0].length - 2);
  const nextRow = clamp(player.y, 1, board.length - 2);
  player.x = nextColumn;
  player.y = nextRow;

  collectDotAtCurrentCell();
}

function canMove(x, y, vector) {
  const targetColumn = Math.round(x) + vector.x;
  const targetRow = Math.round(y) + vector.y;

  if (targetRow < 0 || targetRow >= board.length) {
    return false;
  }

  if (targetColumn < 0 || targetColumn >= board[targetRow].length) {
    return false;
  }

  return board[targetRow][targetColumn] === 0;
}

function collectDotAtCurrentCell() {
  const column = Math.round(gameState.player.x);
  const row = Math.round(gameState.player.y);
  const key = getCellKey(column, row);

  if (!gameState.pellets.has(key)) {
    return;
  }

  gameState.pellets.delete(key);
  gameState.remainingDots -= 1;
  gameState.score += SCORE_PER_DOT;
  ui.setScore(gameState.score);

  if (gameState.remainingDots === 0) {
    gameState.phase = "win";
    stopGameLoop();
    renderGame();
    ui.showWin(gameState.score);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
>>>>>>> 27366e9 (Implement game loop and win condition logic)
}

function drawBackdrop(message) {
  renderGame();
  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "28px Trebuchet MS";
  context.textAlign = "center";
  context.fillText(message, canvas.width / 2, canvas.height - 72);
}

function renderGame() {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const x = column * CELL_SIZE;
      const y = row * CELL_SIZE;

      if (board[row][column] === 1) {
        context.fillStyle = "#1734b9";
        context.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        continue;
      }

      if (gameState.pellets.has(getCellKey(column, row))) {
        context.fillStyle = "#f7f7f7";
        context.beginPath();
        context.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE * 0.12, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  drawPlayer();
}

<<<<<<< HEAD
function resetDemo() {
  clearWinTimer();
  tracker.neutralPose = null;
  resetGameState();
  drawBackdrop("Press Start to begin");
=======
function drawPlayer() {
  const { player } = gameState;
  const centerX = player.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = player.y * CELL_SIZE + CELL_SIZE / 2;
  const mouthOpen = 0.18 + ((Math.sin(player.mouthPhase) + 1) / 2) * 0.22;
  const facingAngle = DIRECTIONS[player.direction].angle;

  context.fillStyle = "#f9d649";
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(
    centerX,
    centerY,
    CELL_SIZE * 0.42,
    facingAngle + mouthOpen,
    facingAngle - mouthOpen + Math.PI * 2,
    false,
  );
  context.closePath();
  context.fill();
>>>>>>> 27366e9 (Implement game loop and win condition logic)
}

function drawDebugPlaceholder(message) {
  debugContext.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
  debugContext.fillStyle = "#070b16";
  debugContext.fillRect(0, 0, debugCanvas.width, debugCanvas.height);
  debugContext.strokeStyle = "rgba(255, 255, 255, 0.12)";
  debugContext.strokeRect(8, 8, debugCanvas.width - 16, debugCanvas.height - 16);
  debugContext.fillStyle = "rgba(255, 255, 255, 0.82)";
  debugContext.font = "14px Trebuchet MS";
  debugContext.textAlign = "center";
  debugContext.fillText(message, debugCanvas.width / 2, debugCanvas.height / 2);
}

function updateCameraStatus(message, tone = "idle") {
  cameraStatus.textContent = message;
  cameraStatus.dataset.tone = tone;
  ui.setCameraStatus(message, tone);
}

function stopMediaStream() {
  if (!mediaStream) {
    return;
  }

  for (const track of mediaStream.getTracks()) {
    track.stop();
  }

  mediaStream = null;
  isCameraReady = false;
  cameraVideo.srcObject = null;
}

function getMediaPipeApi() {
  const api = {
    FaceMesh: window.FaceMesh,
    FACEMESH_TESSELATION: window.FACEMESH_TESSELATION,
    drawConnectors: window.drawConnectors,
  };

  if (!api.FaceMesh || !api.FACEMESH_TESSELATION || !api.drawConnectors) {
    throw new Error("MediaPipe Face Mesh CDN assets did not load.");
  }

  return api;
}

async function ensureFaceMesh() {
  if (faceMeshReady) {
    return;
  }

  const { FaceMesh, FACEMESH_TESSELATION, drawConnectors } = getMediaPipeApi();

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults((results) => {
    const landmarksList = results.multiFaceLandmarks ?? [];

    debugContext.save();
    debugContext.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    debugContext.drawImage(results.image, 0, 0, debugCanvas.width, debugCanvas.height);

    if (landmarksList.length > 0) {
      const landmarks = landmarksList[0];
      drawConnectors(debugContext, landmarks, FACEMESH_TESSELATION, {
        color: "#30d5c8",
        lineWidth: 1,
      });

      tracker.updateLandmarks(landmarks);

      if (gameState.running) {
        const poseDirection = tracker.getDirection();

        if (poseDirection) {
          gameState.player.setDirection(POSE_DIRECTION_VECTORS[poseDirection]);
        }
      }

      updateCameraStatus(`Tracking ${landmarks.length} landmarks`, "ready");
    } else {
      updateCameraStatus("Face detected intermittently. Center your head in frame.", "idle");
    }

    debugContext.restore();
  });

  faceMeshReady = true;
}

async function ensureCameraStream() {
  if (isCameraReady && mediaStream) {
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support webcam access.");
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  });

  cameraVideo.srcObject = mediaStream;
  await cameraVideo.play();
  isCameraReady = true;
}

function startFaceMeshLoop() {
  const tick = async () => {
    if (!faceMesh || !isCameraReady || cameraVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      window.requestAnimationFrame(tick);
      return;
    }

    try {
      await faceMesh.send({ image: cameraVideo });
    } catch (error) {
      console.error("Face mesh processing failed.", error);
      updateCameraStatus("Face mesh processing paused.", "error");
    }

    window.requestAnimationFrame(tick);
  };

  window.requestAnimationFrame(tick);
}

let faceMeshLoopStarted = false;

async function initializeTracking() {
  ui.setError("");
  updateCameraStatus("Requesting webcam access...", "loading");
  drawDebugPlaceholder("Requesting webcam");

  try {
    await ensureFaceMesh();
    await ensureCameraStream();

    cameraVideo.hidden = true;
    updateCameraStatus("Webcam connected. Looking for a face...", "loading");

    if (!faceMeshLoopStarted) {
      startFaceMeshLoop();
      faceMeshLoopStarted = true;
    }

    return true;
  } catch (error) {
    console.error("Unable to initialize face tracking.", error);

    const message =
      error instanceof DOMException && error.name === "NotAllowedError"
        ? "Camera access was denied. Allow webcam permission and try again."
        : error instanceof DOMException && error.name === "NotFoundError"
          ? "No webcam was found on this device."
          : error instanceof Error
            ? error.message
            : "Unable to access the webcam.";

    stopMediaStream();
    ui.setError(message);
    updateCameraStatus("Webcam unavailable", "error");
    drawDebugPlaceholder("Webcam unavailable");
    return false;
  }
}

function handleDirectionInput(event) {
  const direction = INPUT_TO_DIRECTION[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  gameState.player.setDirection(direction);
}

window.addEventListener("keydown", handleDirectionInput);

ui.onBeforeStart(initializeTracking);
ui.onStart(() => {
<<<<<<< HEAD
  clearWinTimer();
  stopGameLoop();
  resetGameState();
=======
  stopGameLoop();
>>>>>>> 27366e9 (Implement game loop and win condition logic)
  drawBackdrop("Center your head for calibration");
});

ui.onPlaying(() => {
<<<<<<< HEAD
  tracker.calibrate();
  resetGameState();
  startGameLoop();
});

ui.onReset(() => {
  stopGameLoop();
  resetDemo();
});

resetDemo();
drawDebugPlaceholder("Waiting for webcam");
=======
  startGame();
});

ui.onReset(() => {
  resetToStartScreen();
});

resetToStartScreen();
>>>>>>> 27366e9 (Implement game loop and win condition logic)
ui.init();
