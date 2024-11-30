// Implementation for HTML video elements
class QPHTMLVideoMediaSource extends QPMediaMap {
  element = undefined;
  source = "";

  constructor(videoElement) {
    super(videoElement);

    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new Error("QHTMLVideoMediaSource requires an HTMLVideoElement");
    }

    this.element = videoElement;

    console.log(videoElement);
    // Extract source value for name, for now.
    let item = videoElement;
    let sourceItem = item.querySelector("source");
    this.source = sourceItem.src;
  }

  /**
   * Get bounding rectangle info based on the type of media
   * Note: media with ambiguous bounds (ex. Sound) will be given default bounds
   * @returns bounding rectangle based on the type of media
   */
  getMediaBoundingRect() {
    switch (this.element.localName) {
      case "video": {
        return this.element.getBoundingClientRect();
      }
    }
  }

  /**
   * Download the media connected to the player
   */
  downloadMedia() {
    var item = this.element;
    var sourceItem = item.querySelector("source");
    var invoker = document.createElement("a");
    invoker.href = sourceItem.src;
    invoker.download = sourceItem.src;
    invoker.style.display = "none";
    document.body.appendChild(invoker);
    invoker.click();
    document.body.removeChild(invoker);
    console.debug("Downloading video");
  }

  getDuration() {
    return this.handle.duration;
  }

  getCurrentTime() {
    return this.handle.currentTime;
  }

  /**
   * Get the last section of a filepath
   * (which is usually the file name. hacky but whatever)
   * @param {String} filepath
   * @returns Last section of a filepath
   */
  getLocalFilename(filepath) {
    var fileParts = filepath.split("/");
    return fileParts[fileParts.length - 1];
  }

  /**
   * Get appropriate media title based on type
   * @returns the string best associated with src
   */
  getMediaTitle() {
    switch (this.element.localName) {
      case "video": {
        return this.getLocalFilename(this.source);
      }
    }
  }

  getType() {
    return QP_Media_Type.VIDEO;
  }

  isPaused() {
    return this.handle.paused;
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

  /**
   * Set the source of the media
   * @param {string} newSrc the new source to set the media to
   */
  setSource(newSrc) {
    if (this.element) {
      var sourceItem = this.element.querySelector("source");
      sourceItem.src = newSrc;
      this.source = newSrc;
    } else {
      console.error(`Error: Attempting to set source of an invalid element.`);
    }
  }

  /**
   * Skip the media to a specific time
   * @param {number} time the time (in secs) to jump to
   */
  skipTo(time) {
    switch (this.element.localName) {
      case "video": {
        this.element.currentTime = time;
      }
    }
  }

  stop() {
    this.handle.pause();
    this.handle.currentTime = 0;
  }
}

// Example usage:
/*
  const videoElement = document.createElement('video');
  videoElement.src = 'example.mp4';
  const videoSource = new QHTMLVideoMediaSource(videoElement);
  
  // Use in QPlayer
  videoSource.play();
  console.log(videoSource.getDuration());
  videoSource.setCurrentTime(30);
  videoSource.setPaused(true);
  */
