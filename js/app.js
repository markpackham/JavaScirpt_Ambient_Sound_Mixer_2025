import { sounds, defaultPresets } from "./soundData.js";
import { soundManager } from "./soundManager.js";
import { UI } from "./ui.js";

class AmbientMixer {
  // Init the dependencies & default state
  constructor() {
    this.soundManager = new soundManager();
    this.ui = new UI();
    this.presetManger = null;
    this.timer = null;
    this.currentSoundState = {};
    this.masterVolume = 100;
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

      // Init sound states after loading sounds
      sound.forEach((sound) => {
        this.currentSoundState[sound.id] = 0;
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to init app: " + error);
    }
  }

  //////// Start of Event Listeners

  // Setup all event listeners
  setupEventListeners() {
    // Handle all clicks with event delegation
    document.addEventListener("click", async (e) => {
      // Check if play button was clicked
      if (e.target.closest(".play-btn")) {
        const soundId = e.target.closest(".play-btn").dataset.sound;
        await this.toggleSound(soundId);
      }

      // Check if a default present button was clicked
      if (e.target.closest(".preset-btn")) {
        const presetKey = e.target.closest(".preset-btn").dataset.preset;
        await this.loadPreset(presetKey);
      }
    });

    // Handle volume slider changes
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("volume-slider")) {
        const soundId = e.target.dataset.sound;
        const volume = parseInt(e.target.value);
        this.setSoundVolume(soundId, volume);
      }
    });

    // Handle master volume slider
    const masterVolumeSlider = document.getElementById("masterVolume");
    if (masterVolumeSlider) {
      masterVolumeSlider.addEventListener("input", (e) => {
        const volume = parseInt(e.target.value);
        this.setMasterVolume(volume);
      });
    }

    // Handle master play/pause button
    if (this.ui.playPauseButton) {
      this.ui.playPauseButton.addEventListener("click", () => {
        this.toggleAllSounds();
      });
    }

    // Handle reset button
    if (this.ui.resetButton) {
      this.ui.resetButton.addEventListener("click", () => {
        this.resetAll();
      });
    }
  }

  //////// END of Event Listeners

  // Load all sound files
  loadAllSounds() {
    sounds.forEach((sound) => {
      const audioUrl = `audio/${sound.file}`;
      const success = this.soundManager.loadSound(sound.id, audioUrl);

      if (!success) {
        console.warn(`Could not load sound: ${sound.name} from ${audioUrl}`);
      }
    });
  }

  // Toggle individual sound
  async toggleSound(soundId) {
    const audio = this.soundManager.audioElements.get(soundId);

    if (!audio) {
      console.error(`Sound ${soundId} not found`);
      return false;
    }

    if (audio.paused) {
      // Get current sound slider value
      const card = document.querySelector(`[data-sound="${soundId}"]`);
      const slider = card.querySelector(".volume-slider");
      let volume = parseInt(slider.value);

      // If slider is at 0 default to 50%
      if (volume === 0) {
        volume = 50;
        this.ui.updateVolumeDisplay(soundId, volume);
      }

      // Sound is off, turn it on
      this.soundManager.setVolume(soundId, volume);
      await this.soundManager.playSound(soundId);
      this.ui.updateSoundPlayButton(soundId, true);
    } else {
      // Sound is on, shut it off
      this.soundManager.pauseSound(soundId);
      this.ui.updateSoundPlayButton(soundId, false);
    }

    // Update main play button state
    this.updateMainPlayButtonState();
  }

  // Toggle all sounds
  toggleAllSounds() {
    if (this.soundManager.isPlaying) {
      // Toggle sounds off
      this.soundManager.pauseAll();
      this.ui.updateMainPlayButton(false);
      sounds.forEach((sound) => {
        this.ui.updateSoundPlayButton(sound.id, false);
      });
    } else {
      // Toggle sounds on
      for (const [soundId, audio] of this.soundManager.audioElements) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const slider = card?.querySelector(".volume-slider");

        if (slider) {
          let volume = parseInt(slider.value);

          if (volume === 0) {
            volume = 50;
            slider.value = 50;
            this.ui.updateVolumeDisplay(soundId, 50);
          }

          this.currentSoundState[soundId] = volume;

          const effectiveVolume = (volume * this.masterVolume) / 100;
          audio.volume = effectiveVolume / 100;
          this.ui.updateSoundPlayButton(soundId, true);
        }
      }

      // Play all sounds
      this.soundManager.playAll();

      this.ui.updateMainPlayButton(true);
    }
  }

  // Set sound volume
  setSoundVolume(soundId, volume) {
    // Set sound volume in state
    this.currentSoundState[soundId] = volume;

    // Calculate effective volume with master volume
    const effectiveVolume = (volume * this.masterVolume) / 100;

    // Update the sound volume with the scaled volume
    const audio = this.soundManager.audioElements.get(soundId);

    if (audio) {
      audio.volume = effectiveVolume / 100;
    }

    // Update the visual display
    this.ui.updateVolumeDisplay(soundId, volume);

    // Sync sounds
    this.updateMainPlayButtonState();
  }

  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = volume;

    // Update the display
    const masterVolumeValue = document.getElementById("masterVolumeValue");
    if (masterVolumeValue) {
      masterVolumeValue.textContent = `${volume}%`;
    }

    // Apply master volume to all currently playing sounds
    this.applyMasterVolumeToAll();
  }

  // Apply master volume to all playing sounds
  applyMasterVolumeToAll() {
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);
        const slider = card?.querySelector(".volume-slider");

        if (slider) {
          const individualVolume = parseInt(slider.value);
          // Calculate effective volume (individual volume * master volume / 100)
          const effectiveVolume = (individualVolume * this.masterVolume) / 100;

          // Apply to the actual audio element
          audio.volume = effectiveVolume / 100;
        }
      }
    }
  }

  // Update main play button based on individual sounds
  updateMainPlayButtonState() {
    // Check if any sounds are playing
    let anySoundsPlaying = false;
    for (const [soundId, audio] of this.soundManager.audioElements) {
      if (!audio.paused) {
        anySoundsPlaying = true;
        break;
      }
    }

    // Update the main button and the internal state
    this.soundManager.isPlaying = anySoundsPlaying;
    this.ui.updateMainPlayButton(anySoundsPlaying);
  }

  // Reset everything to default state
  resetAll() {
    // Stop all sounds & reset back to 0
    this.soundManager.stopAll();

    // Reset master volume
    this.masterVolume = 100;

    // Reset sound states
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
    });

    // Reset UI
    this.ui.resetUI();
  }

  // Load a preset config eg "sleep" related sounds
  loadPreset(presetKey) {
    const preset = defaultPresets[presetKey];

    if (!preset) {
      console.error(`Preset ${presetKey} does not exist`);
      return;
    }

    // First stop all sounds
    this.soundManager.stopAll();

    // Reset all volumes to 0
    sounds.forEach((sound) => {
      this.currentSoundState[sound.id] = 0;
      this.ui.updateVolumeDisplay(sound.id, 0);
      this.ui.updateSoundPlayButton(sound.id, false);
    });

    // Apply the preset volumes
    for (const [soundId, volume] of Object.entries(preset.sounds)) {
      // Set volume state
      this.currentSoundState[soundId] = volume;

      // Update UI
      this.ui.updateVolumeDisplay(soundId, volume);

      // Calculate effective volume (take into account master volume)
      const effectiveVolume = (volume * this.masterVolume) / 100;

      // Get audio element & set the value
      const audio = this.soundManager.audioElements.get(soundId);

      if (audio) {
        audio.volume = effectiveVolume / 100;

        // Play sound
        audio.play();
        this.ui.updateSoundPlayButton(soundId, true);
      }
    }

    // Update main play button & state
    this.soundManager.isPlaying = true;
    this.ui.updateMainPlayButton(true);
  }
}

// Init app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new AmbientMixer();
  app.init();
});
