const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Expected #game-canvas to be an HTMLCanvasElement.");
}

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("2D canvas context is unavailable.");
}

const GRID_SIZE = 21;
const WALL = 1;
const PATH = 0;
const WALL_COLOR = "#1f5eff";
const DOT_COLOR = "#f5f5f5";
const BACKGROUND_COLOR = "#000000";
const MAZE_LAYOUT = [
  "#####################",
  "#.........#.........#",
  "#.###.###.#.###.###.#",
  "#.#.....#.#.#.....#.#",
  "#.#.###.#.#.#.###.#.#",
  "#...................#",
  "#.###.#.#####.#.###.#",
  "#.....#...#...#.....#",
  "#####.###.#.###.#####",
  "#...#.....#.....#...#",
  "#.#.#.###...###.#.#.#",
  "#.#.....#.#.#.....#.#",
  "#.#####.#.#.#.#####.#",
  "#.......#...#.......#",
  "#.###.#####.#####.#.#",
  "#...#...........#...#",
  "###.#.#.#####.#.#.###",
  "#.....#...#...#.....#",
  "#.#######.#.#######.#",
  "#.........#.........#",
  "#####################",
];

function createMazeGrid(layout) {
  if (layout.length !== GRID_SIZE) {
    throw new Error(`Expected ${GRID_SIZE} rows in maze layout.`);
  }

  return layout.map((row) => {
    if (row.length !== GRID_SIZE) {
      throw new Error(`Expected ${GRID_SIZE} columns in maze layout.`);
    }

    return row.split("").map((cell) => (cell === "#" ? WALL : PATH));
  });
}

function drawMaze(ctx, mazeGrid) {
  const playableSize = Math.min(canvas.width, canvas.height) - 12;
  const cellSize = Math.floor(playableSize / GRID_SIZE);
  const mazeSize = cellSize * GRID_SIZE;
  const offsetX = Math.floor((canvas.width - mazeSize) / 2);
  const offsetY = Math.floor((canvas.height - mazeSize) / 2);
  const dotRadius = Math.max(2, Math.floor(cellSize * 0.16));

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  mazeGrid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const x = offsetX + columnIndex * cellSize;
      const y = offsetY + rowIndex * cellSize;

      if (cell === WALL) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x, y, cellSize, cellSize);
        return;
      }

      ctx.fillStyle = DOT_COLOR;
      ctx.beginPath();
      ctx.arc(
        x + cellSize / 2,
        y + cellSize / 2,
        dotRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  });
}

const mazeGrid = createMazeGrid(MAZE_LAYOUT);

drawMaze(context, mazeGrid);
