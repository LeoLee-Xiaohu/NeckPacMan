import { MAZE_GRID, PLAYER_START, getMazeLayoutMetrics, renderMaze } from "./maze.js";
import { Player } from "./player.js";
import { UIController } from "./ui.js";
import { PoseTracker } from "./tracker.js";

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
let mediaStream = null;
let faceMesh = null;
let faceMeshReady = false;
let isCameraReady = false;
let faceMeshLoopStarted = false;

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
  renderGame();
  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "28px Trebuchet MS";
  context.textAlign = "center";
  context.fillText(message, canvas.width / 2, canvas.height - 72);
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
  stopGameLoop();
  resetGameState();
  drawBackdrop("Center your head for calibration");
});

ui.onPlaying(() => {
  tracker.calibrate();
  resetGameState();
  startGameLoop();
});

ui.onReset(() => {
  stopGameLoop();
  tracker.neutralPose = null;
  resetGameState();
  drawBackdrop("Press Start to begin");
});

resetGameState();
drawBackdrop("Press Start to begin");
drawDebugPlaceholder("Waiting for webcam");
ui.init();
