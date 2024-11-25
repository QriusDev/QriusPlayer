/**
 * The play and pause control for a piece of media
 * Todo: Enhance this to be any type of control that has some action function
 */
class MediaControls extends Drawable
{
    isPaused = true;
    playImg = "assets/play.png";
    pauseImg = "assets/pause.png";
    img = new Image();
    media = undefined;

    name = "Video Controls Object";

    //override
    drawFunction()
    {
        if (this.media)
        {
            this.img.context = this.context;
            this.img.width = this.width;
            this.img.height = this.height;
            this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
            this.setState(this.isPaused);
        }
    }

    /**
     * Toggle the pause state of the media
     */
    togglePause()
    {
        if (!this.media)
        {
            console.error('Media object not set in controls.')
            return;
        }

        this.media.togglePlayPause();
        this.setState(this.media.element.paused);
    }

    /**
     * Update the controls image based on supoplied paused state
     * @param {bool} isPaused  
     */
    setState(isPaused)
    {
        this.isPaused = isPaused;
        this.img.src = (this.isPaused) ? this.playImg : this.pauseImg;
    }

    /**
     * Set the monitored media object
     * @param {MediaObject} media the monitored media object 
     */
    setMedia(media)
    {
        this.media = media;
    }
}