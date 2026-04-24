const CALIBRATION_SECONDS = 3;

export class UIController {
  constructor({ root, preview }) {
    if (!(root instanceof HTMLElement)) {
      throw new Error("Expected a valid UI root element.");
    }

    if (!(preview instanceof HTMLElement)) {
      throw new Error("Expected a valid camera preview element.");
    }

    this.root = root;
    this.preview = preview;
    this.state = "start";
    this.score = 0;
    this.countdown = CALIBRATION_SECONDS;
    this.calibrationTimer = null;
    this.listeners = {
      start: [],
      playing: [],
      reset: [],
    };
  }

  init() {
    this.preview.hidden = false;
    this.render();
  }

  onStart(listener) {
    this.listeners.start.push(listener);
  }

  onPlaying(listener) {
    this.listeners.playing.push(listener);
  }

  onReset(listener) {
    this.listeners.reset.push(listener);
  }

  setScore(score) {
    this.score = score;

    if (this.state === "playing" || this.state === "win") {
      this.render();
    }
  }

  showWin(score = this.score) {
    this.clearCalibrationTimer();
    this.score = score;
    this.state = "win";
    this.render();
  }

  reset() {
    this.clearCalibrationTimer();
    this.state = "start";
    this.score = 0;
    this.countdown = CALIBRATION_SECONDS;
    this.emit("reset");
    this.render();
  }

  emit(eventName) {
    for (const listener of this.listeners[eventName]) {
      listener();
    }
  }

  startCalibration() {
    this.clearCalibrationTimer();
    this.state = "calibrating";
    this.countdown = CALIBRATION_SECONDS;
    this.emit("start");
    this.render();

    this.calibrationTimer = window.setInterval(() => {
      this.countdown -= 1;

      if (this.countdown <= 0) {
        this.clearCalibrationTimer();
        this.state = "playing";
        this.render();
        this.emit("playing");
        return;
      }

      this.render();
    }, 1000);
  }

  clearCalibrationTimer() {
    if (this.calibrationTimer !== null) {
      window.clearInterval(this.calibrationTimer);
      this.calibrationTimer = null;
    }
  }

  render() {
    this.root.className = `ui-root ui-root--${this.state}`;
    this.root.innerHTML = this.getMarkup();

    const startButton = this.root.querySelector("[data-action='start']");
    if (startButton instanceof HTMLButtonElement) {
      startButton.addEventListener("click", () => this.startCalibration());
    }

    const playAgainButton = this.root.querySelector("[data-action='reset']");
    if (playAgainButton instanceof HTMLButtonElement) {
      playAgainButton.addEventListener("click", () => this.reset());
    }
  }

  getMarkup() {
    if (this.state === "start") {
      return `
        <section class="overlay-card">
          <p class="eyebrow">NeckPac</p>
          <h1>Exercise your neck, eat the dots.</h1>
          <p class="overlay-copy">
            Start a short session, grant camera access when prompted, and guide Pac-Man with head movement.
          </p>
          <button class="overlay-button" type="button" data-action="start">Start</button>
        </section>
      `;
    }

    if (this.state === "calibrating") {
      return `
        <section class="overlay-card overlay-card--compact">
          <p class="eyebrow">Calibration</p>
          <h2>Look straight at the camera</h2>
          <p class="overlay-copy">
            Hold still while we capture your neutral head position.
          </p>
          <p class="countdown">${this.countdown}</p>
        </section>
      `;
    }

    if (this.state === "playing") {
      return `
        <section class="hud">
          <p class="hud__score">Score: ${this.score}</p>
        </section>
      `;
    }

    return `
      <section class="overlay-card overlay-card--compact">
        <p class="eyebrow">Session Complete</p>
        <h2>You Win!</h2>
        <p class="overlay-copy">Final score: ${this.score}</p>
        <button class="overlay-button" type="button" data-action="reset">Play Again</button>
      </section>
    `;
  }
}
