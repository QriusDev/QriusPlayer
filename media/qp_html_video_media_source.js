import QPMediaMap from "./qp_media_map.js";
import QP_Media_Type from "./qp_types.js";

// Implementation for HTML video elements
class QPHTMLVideoMediaSource extends QPMediaMap {
  constructor(videoElement) {
    super(videoElement);

    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new Error("QHTMLVideoMediaSource requires an HTMLVideoElement");
    }
  }

  getDuration() {
    return this.handle.duration;
  }

  getCurrentTime() {
    return this.handle.currentTime;
  }

  getType() {
    return QP_Media_Type.VIDEO;
  }

  isPlaying() {
    return !this.handle.paused && !this.handle.ended;
  }

  play() {
    return this.handle.play().catch((error) => {
      console.error("Error playing video:", error);
    });
  }

  setPaused(shouldPause) {
    if (shouldPause) {
      this.handle.pause();
    } else {
      this.handle.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }

  setCurrentTime(time) {
    // Ensure time is within valid range
    const clampedTime = Math.max(0, Math.min(time, this.getDuration()));
    this.handle.currentTime = clampedTime;
  }

  stop() {
    this.handle.pause();
    this.handle.currentTime = 0;
  }
}
