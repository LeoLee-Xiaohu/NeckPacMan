import { UIController } from "./ui.js";
import { renderMaze } from "./maze.js";

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
  renderMaze(context, canvas);

  context.fillStyle = "rgba(0, 0, 0, 0.72)";
  context.fillRect(170, canvas.height - 168, canvas.width - 340, 72);
  context.fillStyle = "#ffffff";
  context.font = "28px Trebuchet MS";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(message, canvas.width / 2, canvas.height - 132);
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
