const MAZE_BLUEPRINT = [
  "111111111111111111111",
  "100000000010000000001",
  "101111011010110111101",
  "101000010000010000101",
  "101011110111011110101",
  "101000000101000000101",
  "101110111101111011101",
  "100010100000001010001",
  "111010101111101010111",
  "100000001000100000001",
  "101111101000101111101",
  "100000001000100000001",
  "111010101111101010111",
  "100010100000001010001",
  "101110111101111011101",
  "101000000101000000101",
  "101011110111011110101",
  "101000010000010000101",
  "101111011010110111101",
  "100000000010000000001",
  "111111111111111111111",
];

export const MAZE_SIZE = 21;
export const MAZE_GRID = MAZE_BLUEPRINT.map((row) =>
  Array.from(row, (cell) => Number(cell)),
);

if (
  MAZE_GRID.length !== MAZE_SIZE ||
  !MAZE_GRID.every((row) => row.length === MAZE_SIZE)
) {
  throw new Error("Maze grid must be a 21x21 layout.");
}

export function getMazeLayoutMetrics(canvas, maze = MAZE_GRID) {
  const rowCount = maze.length;
  const columnCount = maze[0].length;
  const tileSize = Math.floor(
    Math.min(canvas.width / columnCount, canvas.height / rowCount),
  );
  const mazeWidth = columnCount * tileSize;
  const mazeHeight = rowCount * tileSize;

  return {
    columnCount,
    mazeHeight,
    mazeWidth,
    offsetX: Math.floor((canvas.width - mazeWidth) / 2),
    offsetY: Math.floor((canvas.height - mazeHeight) / 2),
    rowCount,
    tileSize,
  };
}

export function renderMaze(context, canvas, maze = MAZE_GRID) {
  const { offsetX, offsetY, tileSize } = getMazeLayoutMetrics(canvas, maze);

  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let rowIndex = 0; rowIndex < maze.length; rowIndex += 1) {
    const row = maze[rowIndex];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (row[columnIndex] !== 1) {
        continue;
      }

      context.fillStyle = "#2b6aff";
      context.fillRect(
        offsetX + columnIndex * tileSize,
        offsetY + rowIndex * tileSize,
        tileSize,
        tileSize,
      );
    }
  }
}
