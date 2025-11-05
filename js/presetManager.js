export class PresetManger {
  constructor() {
    this.customPresets = this.loadCustomPresets();
  }

  // Load presets from localStorage
  loadCustomPresets() {
    const stored = localStorage.getItem("ambientMixerPresets");
    return stored ? JSON.parse(stored) : {};
  }

  // Load custom preset by ID
  loadPreset(presetId) {
    return this.customPresets[presetId] || null;
  }

  // Save custom presets to localStorage
  saveCustomPresets() {
    localStorage.setItem(
      "ambientMixerPresets",
      JSON.stringify(this.customPresets)
    );
  }

  // Save current mix as preset
  savePreset(name, soundStates) {
    // Get unique id
    //const presetId = `custom-${Date.now()}`
    const presetId = `custom-${self.crypto.randomUUID()}`;

    // Create preset object with only active sounds
    const preset = {
      name,
      sounds: {},
    };

    for (const [soundId, volume] of Object.entries(soundStates)) {
      if (volume > 0) {
        preset.sounds[soundId] = volume;
      }
    }

    this.customPresets[presetId] = preset;
    // Save to localStorage
    this.saveCustomPresets();

    return presetId;
  }

  // Check if preset name already exists
  presetNameExists(name) {
    return Object.values(this.customPresets).some(
      (preset) => preset.name === name
    );
  }
}
