class MediaControls extends Drawable
{
    isPaused = true;
    playImg = "assets/play.png";
    pauseImg = "assets/pause.png";
    img = new Image();

    name = "Video Controls Object";

    drawFunction()
    {
        this.img.context = this.context;
        this.img.src = (this.isPaused) ? this.playImg : this.pauseImg;
        this.img.width = this.width;
        this.img.height = this.height;
        this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    togglePause()
    {
        this.isPaused = !this.isPaused;
        if (this.isPaused)
        {
            vid.pause();
        }
        else
        {
            vid.play();
        }
    }
}