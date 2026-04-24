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

let winTimer = null;

function drawBackdrop(message) {
  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#2b6aff";
  context.fillRect(48, 48, canvas.width - 96, canvas.height - 96);
  context.fillStyle = "#000000";
  context.fillRect(72, 72, canvas.width - 144, canvas.height - 144);
  context.fillStyle = "#f9d649";
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, 32, 0.25 * Math.PI, 1.75 * Math.PI);
  context.lineTo(canvas.width / 2, canvas.height / 2);
  context.closePath();
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "28px Trebuchet MS";
  context.textAlign = "center";
  context.fillText(message, canvas.width / 2, canvas.height - 120);
}

function clearWinTimer() {
  if (winTimer !== null) {
    window.clearTimeout(winTimer);
    winTimer = null;
  }
}

function resetDemo() {
  clearWinTimer();
  drawBackdrop("Press Start to begin");
}

ui.onStart(() => {
  clearWinTimer();
  drawBackdrop("Center your head for calibration");
});

ui.onPlaying(() => {
  ui.setScore(120);
  drawBackdrop("Gameplay preview");

  // Placeholder until gameplay logic is connected.
  winTimer = window.setTimeout(() => {
    ui.showWin(120);
    drawBackdrop("Round complete");
  }, 1800);
});

ui.onReset(() => {
  resetDemo();
});

resetDemo();
ui.init();
