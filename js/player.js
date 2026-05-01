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
const SNAP_EPSILON = 0.001;

function moveTowards(value, target, maxStep) {
  const delta = target - value;

  if (Math.abs(delta) <= maxStep) {
    return target;
  }

  return value + Math.sign(delta) * maxStep;
}

function isCentered(value) {
  return Math.abs(value - Math.round(value)) <= CENTER_EPSILON;
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
    const cellX = Math.round(fromX);
    const cellY = Math.round(fromY);
    return !maze.isWall(cellX + vector.x, cellY + vector.y);
  }

  update(deltaSeconds, maze) {
    const wasMoving = this.direction !== null;
    const centerX = Math.round(this.position.x);
    const centerY = Math.round(this.position.y);
    const alignedX = isCentered(this.position.x);
    const alignedY = isCentered(this.position.y);

    if (alignedX) {
      this.position.x = centerX;
    }

    if (alignedY) {
      this.position.y = centerY;
    }

    if (this.queuedDirection && alignedX && alignedY) {
      if (this.canMove(this.queuedDirection, maze, centerX, centerY)) {
        this.direction = this.queuedDirection;
      }
    }

    if (!this.direction && this.queuedDirection && alignedX && alignedY) {
      if (this.canMove(this.queuedDirection, maze, centerX, centerY)) {
        this.direction = this.queuedDirection;
      }
    }

    if (!this.direction) {
      return;
    }

    const movingHorizontally =
      this.direction === "left" || this.direction === "right";
    const movingVertically = !movingHorizontally;

    if (movingHorizontally && !alignedY) {
      this.position.y = moveTowards(this.position.y, centerY, this.speed * deltaSeconds);
      return;
    }

    if (movingVertically && !alignedX) {
      this.position.x = moveTowards(this.position.x, centerX, this.speed * deltaSeconds);
      return;
    }

    if (!this.canMove(this.direction, maze, centerX, centerY)) {
      this.position.x = centerX;
      this.position.y = centerY;
      this.direction = null;
      return;
    }

    const vector = DIRECTION_VECTORS[this.direction];
    const step = this.speed * deltaSeconds;
    this.position.x += vector.x * step;
    this.position.y += vector.y * step;

    const nextCenterX = Math.round(this.position.x);
    const nextCenterY = Math.round(this.position.y);

    if (vector.x !== 0 && Math.abs(this.position.x - nextCenterX) <= SNAP_EPSILON) {
      this.position.x = nextCenterX;
    }

    if (vector.y !== 0 && Math.abs(this.position.y - nextCenterY) <= SNAP_EPSILON) {
      this.position.y = nextCenterY;
    }

    if (wasMoving || this.direction) {
      this.animationTime += deltaSeconds;
    }
  }

  draw(context, frame) {
    const pixelX = frame.offsetX + (this.position.x + 0.5) * frame.cellSize;
    const pixelY = frame.offsetY + (this.position.y + 0.5) * frame.cellSize;
    const radius = frame.cellSize * 0.42;
    const facing = this.direction ?? this.queuedDirection ?? "right";
    const baseAngle = DIRECTION_ANGLES[facing];
    const moving = this.direction !== null;
    const mouthAngle = moving
      ? 0.12 + ((Math.sin(this.animationTime * 18) + 1) / 2) * 0.55
      : 0.18;

    context.fillStyle = "#facc15";
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
