import { sounds, defaultPresets } from "./soundData.js";
import { SoundManger } from "./soundManager.js";
import { UI } from "./ui.js";

class AmbientMixer {
  // Init the dependencies & default state
  constructor() {
    this.soundManger = new SoundManger();
    this.ui = new UI();
    this.presetManger = null;
    this.timer = null;
    this.currentSoundState = {};
    this.isInitialized = false;
  }

  init() {
    try {
      // Init UI
      this.ui.init();

      // Render sound cards using our sound data
      this.ui.renderSoundCards(sounds);

      this.setupEventListeners();

      // Load all sound files
      this.loadAllSounds();

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to init app: " + error);
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    // Handle all clicks with event delegation
    document.addEventListener("click", (e) => {
      // Check if play button was clicked
      if (e.target.closest(".play-btn")) {
        const soundId = e.target.closest(".play-btn").dataset.sound;
      }
    });
  }

  // Load all sound files
  loadAllSounds() {
    sounds.forEach((sound) => {
      const audioUrl = `audio/${sound.file}`;
      const success = this.soundManger.loadSound(sound.id, audioUrl);

      if (!success) {
        console.warn(`Could not load sound: ${sound.name} from ${audioUrl}`);
      }
    });
  }
}

// Init app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
