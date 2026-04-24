const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Expected #game-canvas to be an HTMLCanvasElement.");
}

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("2D canvas context is unavailable.");
}

context.fillStyle = "#000000";
context.fillRect(0, 0, canvas.width, canvas.height);
