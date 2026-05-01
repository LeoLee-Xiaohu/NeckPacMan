import { UIController } from "./ui.js";
import { createDebugLandmarks, PoseTracker } from "./tracker.js";

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
const tracker = new PoseTracker();

let winTimer = null;
let previewFrame = null;
let isPlaying = false;
let debugAngles = { yaw: 0, pitch: 0 };

function getPreviewFrame() {
  if (previewFrame instanceof HTMLDivElement) {
    return previewFrame;
  }

  const nextFrame = cameraPreview.querySelector(".camera-preview__frame");
  if (!(nextFrame instanceof HTMLDivElement)) {
    throw new Error("Expected .camera-preview__frame to exist.");
  }

  previewFrame = nextFrame;
  return previewFrame;
}

function renderTrackingState(message = "Move within the preview to simulate head pose.") {
  const pose = tracker.currentPose;
  const delta = tracker.getPoseDelta();
  const direction = tracker.getDirection();
  const frame = getPreviewFrame();
  const yaw = pose ? pose.yaw.toFixed(1) : "--";
  const pitch = pose ? pose.pitch.toFixed(1) : "--";
  const yawDelta = delta ? delta.yaw.toFixed(1) : "--";
  const pitchDelta = delta ? delta.pitch.toFixed(1) : "--";

  frame.innerHTML = `
    <div>
      <strong>${message}</strong><br />
      Yaw: ${yaw}&deg; (${yawDelta}&deg;)<br />
      Pitch: ${pitch}&deg; (${pitchDelta}&deg;)<br />
      Direction: ${direction ?? "NEUTRAL"}
    </div>
  `;
}

function updateDebugPose() {
  tracker.updateLandmarks(createDebugLandmarks(debugAngles));

  if (isPlaying) {
    drawBackdrop(`Direction: ${tracker.getDirection() ?? "NEUTRAL"}`);
  }

  renderTrackingState(
    isPlaying
      ? "Directional tracking active."
      : "Hold a neutral pose here during calibration.",
  );
}

function setDebugPoseFromPointer(event) {
  const frame = getPreviewFrame();
  const bounds = frame.getBoundingClientRect();
  const normalizedX = (event.clientX - bounds.left) / bounds.width;
  const normalizedY = (event.clientY - bounds.top) / bounds.height;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  debugAngles = {
    yaw: clamp((normalizedX - 0.5) * 70, -30, 30),
    pitch: clamp((normalizedY - 0.5) * 50, -20, 20),
  };

  updateDebugPose();
}

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
  isPlaying = false;
  tracker.neutralPose = null;
  debugAngles = { yaw: 0, pitch: 0 };
  updateDebugPose();
  drawBackdrop("Press Start to begin");
}

ui.onStart(() => {
  clearWinTimer();
  isPlaying = false;
  updateDebugPose();
  drawBackdrop("Center your head for calibration");
});

ui.onPlaying(() => {
  tracker.calibrate();
  isPlaying = true;
  ui.setScore(120);
  updateDebugPose();
  drawBackdrop(`Direction: ${tracker.getDirection() ?? "NEUTRAL"}`);

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
getPreviewFrame().addEventListener("pointermove", setDebugPoseFromPointer);
getPreviewFrame().addEventListener("pointerleave", () => {
  debugAngles = { yaw: 0, pitch: 0 };
  updateDebugPose();
});
