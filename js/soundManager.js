export class SoundManger {
    constructor() {
        this.audioElements = new Map();
        this.isPlaying = false;
        console.log("SoundManger created");
    }

    // Load a sound file
    loadSound(soundId, filePath){
        console.log(`Loading sound: ${soundId} from ${filePath}`);
        return true;
    }
}