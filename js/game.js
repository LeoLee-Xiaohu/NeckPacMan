import { Maze, PLAYER_START } from "./maze.js";
import { Player } from "./player.js";

const INPUT_TO_DIRECTION = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export class Game {
  constructor({ canvas, context, ui }) {
    this.canvas = canvas;
    this.context = context;
    this.ui = ui;
    this.maze = new Maze();
    this.player = new Player({ ...PLAYER_START, speed: 4 });
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.running = false;

    this.handleKeydown = this.handleKeydown.bind(this);
    this.tick = this.tick.bind(this);
  }

  init() {
    window.addEventListener("keydown", this.handleKeydown);
    this.render();
  }

  start() {
    this.stop();
    this.player.reset(PLAYER_START);
    this.ui.setScore(0);
    this.running = true;
    this.lastFrameTime = performance.now();
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  reset() {
    this.stop();
    this.player.reset(PLAYER_START);
    this.render();
  }

  stop() {
    this.running = false;

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  handleKeydown(event) {
    const direction = INPUT_TO_DIRECTION[event.key];

    if (!direction || !this.running) {
      return;
    }

    event.preventDefault();
    this.player.setDirection(direction);
  }

  tick(frameTime) {
    if (!this.running) {
      return;
    }

    const deltaSeconds = Math.min((frameTime - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = frameTime;

    this.player.update(deltaSeconds, this.maze);
    this.render();
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const frame = this.maze.getFrame(this.canvas.width, this.canvas.height);
    this.maze.draw(this.context, frame);
    this.player.draw(this.context, frame);
  }
}
