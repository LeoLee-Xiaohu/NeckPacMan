import { Game } from "./game.js";
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
const game = new Game({ canvas, context, ui });

function resetDemo() {
  game.reset();
}

ui.onStart(() => {
  game.stop();
  game.render();
});

ui.onPlaying(() => {
  game.start();
});

ui.onReset(() => {
  resetDemo();
});

resetDemo();
game.init();
ui.init();
