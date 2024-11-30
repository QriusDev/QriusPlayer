// Abstract MediaMap class that defines the interface for media sources
class QPMediaMap {
  constructor(handle) {
    if (this.constructor === QPMediaMap) {
      throw new Error(
        "QPMediaMap is an abstract class and cannot be instantiated directly."
      );
    }
    this.handle = handle;
  }

  // Duration in seconds
  getDuration() {
    throw new Error("getDuration() must be implemented");
  }

  // Current playback position in seconds
  getCurrentTime() {
    throw new Error("getCurrentTime() must be implemented");
  }

  // Returns the media type (e.g., "video", "audio", "image"). Types should be stored in media/types.js
  getType() {
    throw new Error("getType() must be implemented");
  }

  // Returns boolean indicating if media is currently paused
  isPaused() {
    throw new Error("isPaused() must be implemented");
  }

  // Returns boolean indicating if media is currently playing
  isPlaying() {
    throw new Error("isPlaying() must be implemented");
  }

  // Starts or resumes playback
  play() {
    throw new Error("play() must be implemented");
  }

  // Pauses or unpauses the media
  setPaused(shouldPause) {
    throw new Error("setPaused() must be implemented");
  }

  // Sets the current playback position in seconds
  setCurrentTime(time) {
    throw new Error("setCurrentTime() must be implemented");
  }

  // Stops playback and resets to beginning
  stop() {
    throw new Error("stop() must be implemented");
  }
}
