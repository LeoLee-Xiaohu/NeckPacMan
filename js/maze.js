const LAYOUT = [
  "111111111111111111111",
  "100000000010000000001",
  "101111011010111101101",
  "101000010000010000101",
  "101011110111011110101",
  "100010000101000010001",
  "111010111101111010111",
  "100010100000001010001",
  "101110101111101011101",
  "100000100000001000001",
  "111011101111101110111",
  "100010001000100010001",
  "101110111010111011101",
  "101000000010000000101",
  "101011111111111110101",
  "100010000010000010001",
  "111010111010111010111",
  "100000100000001000001",
  "101111101111101111101",
  "100000000000000000001",
  "111111111111111111111",
];

export class Maze {
  constructor(layout = LAYOUT) {
    this.grid = layout.map((row) => Array.from(row, (cell) => Number(cell)));
    this.height = this.grid.length;
    this.width = this.grid[0]?.length ?? 0;
  }

  isWall(cellX, cellY) {
    if (
      cellX < 0 ||
      cellY < 0 ||
      cellX >= this.width ||
      cellY >= this.height
    ) {
      return true;
    }

    return this.grid[cellY][cellX] === 1;
  }

  getCellSize(canvasWidth, canvasHeight) {
    return Math.floor(Math.min(canvasWidth / this.width, canvasHeight / this.height));
  }

  getFrame(canvasWidth, canvasHeight) {
    const cellSize = this.getCellSize(canvasWidth, canvasHeight);
    const width = cellSize * this.width;
    const height = cellSize * this.height;

    return {
      cellSize,
      offsetX: Math.floor((canvasWidth - width) / 2),
      offsetY: Math.floor((canvasHeight - height) / 2),
      width,
      height,
    };
  }

  draw(context, frame) {
    context.fillStyle = "#000000";
    context.fillRect(frame.offsetX, frame.offsetY, frame.width, frame.height);

    context.fillStyle = "#1d4ed8";
    for (let row = 0; row < this.height; row += 1) {
      for (let col = 0; col < this.width; col += 1) {
        if (!this.isWall(col, row)) {
          continue;
        }

        context.fillRect(
          frame.offsetX + col * frame.cellSize,
          frame.offsetY + row * frame.cellSize,
          frame.cellSize,
          frame.cellSize,
        );
      }
    }
  }
}

export const PLAYER_START = { x: 1, y: 1 };
