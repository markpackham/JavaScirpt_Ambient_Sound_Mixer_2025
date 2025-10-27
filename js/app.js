import { sounds, defaultPresets } from "./soundData.js";
import { SoundManger } from "./soundManager.js";

class AmbientMixer {
  // Init the dependencies & default state
  constructor() {
    this.soundManger = new SoundManger();
    this.ui = null;
    this.presetManger = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }

  init() {
    try {
      this.soundManger.loadSound("rain", "audio/rain.mp3");
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to init app: " + error);
    }
  }
}

// Init app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
