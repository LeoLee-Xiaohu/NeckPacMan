const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const DIRECTION_ANGLES = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

const CENTER_EPSILON = 0.08;

function getGridValue(maze, row, col) {
  if (Array.isArray(maze)) {
    return maze[row]?.[col];
  }

  return maze.grid?.[row]?.[col];
}

function getCellCenter(value) {
  return Math.floor(value) + 0.5;
}

function isCentered(value) {
  return Math.abs(value - getCellCenter(value)) <= CENTER_EPSILON;
}

export class Player {
  constructor({ x, y, speed = 4 } = {}) {
    this.position = { x, y };
    this.direction = null;
    this.queuedDirection = null;
    this.speed = speed;
    this.animationTime = 0;
  }

  setDirection(direction) {
    if (!DIRECTION_VECTORS[direction]) {
      return;
    }

    this.queuedDirection = direction;
  }

  reset({ x, y }) {
    this.position.x = x;
    this.position.y = y;
    this.direction = null;
    this.queuedDirection = null;
    this.animationTime = 0;
  }

  canMove(direction, maze, fromX = this.position.x, fromY = this.position.y) {
    if (!direction) {
      return false;
    }

    const vector = DIRECTION_VECTORS[direction];
    const row = Math.floor(fromY);
    const col = Math.floor(fromX);
    return getGridValue(maze, row + vector.y, col + vector.x) === 0;
  }

  update(deltaSeconds, maze) {
    const alignedX = isCentered(this.position.x);
    const alignedY = isCentered(this.position.y);

    if (alignedX) {
      this.position.x = getCellCenter(this.position.x);
    }

    if (alignedY) {
      this.position.y = getCellCenter(this.position.y);
    }

    if (alignedX && alignedY) {
      if (this.canMove(this.queuedDirection, maze)) {
        this.direction = this.queuedDirection;
      } else if (!this.canMove(this.direction, maze)) {
        this.direction = null;
      }
    }

    if (!this.direction) {
      return;
    }

    const vector = DIRECTION_VECTORS[this.direction];
    this.position.x += vector.x * this.speed * deltaSeconds;
    this.position.y += vector.y * this.speed * deltaSeconds;

    if (isCentered(this.position.x)) {
      this.position.x = getCellCenter(this.position.x);
    }

    if (isCentered(this.position.y)) {
      this.position.y = getCellCenter(this.position.y);
    }

    this.animationTime += deltaSeconds;
  }

  draw(context, frame) {
    const pixelX = frame.offsetX + this.position.x * frame.cellSize;
    const pixelY = frame.offsetY + this.position.y * frame.cellSize;
    const radius = frame.cellSize * 0.38;
    const facing = this.direction ?? this.queuedDirection ?? "right";
    const baseAngle = DIRECTION_ANGLES[facing];
    const moving = this.direction !== null;
    const mouthAngle = moving
      ? 0.12 + ((Math.sin(this.animationTime * 18) + 1) / 2) * 0.55
      : 0.18;

    context.fillStyle = "#f9d649";
    context.beginPath();
    context.moveTo(pixelX, pixelY);
    context.arc(
      pixelX,
      pixelY,
      radius,
      baseAngle + mouthAngle,
      baseAngle - mouthAngle + Math.PI * 2,
      false,
    );
    context.closePath();
    context.fill();
  }
}
