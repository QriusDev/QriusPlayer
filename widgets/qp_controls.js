/**
 * The play and pause control for a piece of media
 * Todo: Enhance this to be any type of control that has some action function
 */
class MediaControls extends Drawable {
  isPaused = true;
  playImg = "assets/play.png";
  pauseImg = "assets/pause.png";
  img = new Image();
  media = undefined;

  name = "Video Controls Object";

  //override
  drawFunction() {
    this.img.context = this.context;
    this.img.src = this.isPaused ? this.playImg : this.pauseImg;
    this.img.width = this.width;
    this.img.height = this.height;
    this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Toggle the pause state of the media
   */
  togglePause() {
    if (!this.media) {
      console.error("Media object not set in controls.");
      return;
    }

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.media.setPaused(true);
    } else {
      this.media.play();
    }
  }

  setMedia(media) {
    this.media = media;
  }
}
