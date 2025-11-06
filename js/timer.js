export class Timer {
  constructor(onComplete, onTick) {
    this.duration = 0;
    this.remaining = 0;
    this.intervalId = null;
    this.onComplete = onComplete;
    this.onTick = onTick;
    this.isRunning = false;
  }

  // Start timer with duration in minutes
  start(minutes) {
    if (minutes <= 0) {
      this.stop();
      return;
    }

    // Convert to seconds
    this.duration = minutes * 60;
    this.remaining = this.duration;
    this.isRunning = true;

    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Update display
    this.updateDisplay();

    // Start countdown - 1000 milliseconds is 1 second
    this.intervalId = setInterval(() => {
      this.remaining--;
      this.updateDisplay();

      if (this.remaining <= 0) {
        this.complete();
      }
    }, 1000);
  }

  // Stop timer
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.duration = 0;
    this.remaining = 0;
    this.isRunning = false;
    this.updateDisplay();
  }
}
