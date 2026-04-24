import { UIController } from "./ui.js";

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

let winTimer = null;
let mediaStream = null;
let faceMesh = null;
let faceMeshReady = false;
let isCameraReady = false;

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

      console.debug("[FaceMesh] landmarks", landmarks);
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

ui.onBeforeStart(initializeTracking);
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
drawDebugPlaceholder("Waiting for webcam");
ui.init();
