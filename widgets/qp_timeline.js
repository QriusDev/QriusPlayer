/**
 * A media control that connects to the media and reports timing changes
 */
class MediaTimeline extends Drawable
{
    maxTime = 0;
    bufferTime = 0;

    player = null;

    seekTime = 0;
    seekerWidth = 25;
    seekerHeight = 25;
    seeker = undefined;
    seekerColor = "#eaec70";
    seekX = 0;
    seekY = 0;
    seekerImageUrl = '';
    loaded = false;

    name = "Timeline Object";

    // override
    drawFunction()
    {
        if (this.player == null)
        {
            console.error(`MediaTimeline is not connected to the MediaPlayer!`);
            return;
        }

        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw seeker
        var newSeekerPosition = QPUtility.clamp(this.x, this.x + this.width - this.seekerWidth, this.seeker.x);
        this.seeker.context = this.context;
        
        // Get correct x value for seeker
        var md = this.player.currentMedia;
        if (md != undefined && !md.isPaused())
        {
            this.seekX = this.x + ((md.getCurrentTime() / md.getDuration()) * this.width);
        }
        else
        {
            this.seekX = QPUtility.clamp(this.x, this.x + this.width, newSeekerPosition);
        }

        if (this.isSeekerDragging())
        {
            this.seekX = QPUtility.clamp(this.x, this.x + this.width, this.player.getMouse().x);
            this.seek(this.seekX);
        }

        this.seeker.setTransform(
            this.seekX, 
            this.y - (this.seekerHeight * 0.5),
            this.seekerWidth, 
            this.seekerHeight
        );

        this.seeker.color = this.seekerColor;
    }

    /**
     * Connect the timeline to a media player and load important information.
     * @param {MediaPlayer} player the player parent to receive media info from 
     */
    connectPlayer(player)
    {
        this.player = player;
        this.load();
    }

    /**
     * Load the seeker if this is not already loaded
     */
    load()
    {
        if (!this.loaded)
        {
            this.seeker = new Seeker(this.canvas, "MediaTimelineSeeker", undefined, this.x, this.y);
            if (this.seekerImageUrl)
            {
                this.seeker.setImage(this.seekerImageUrl);
            }
            this.seekX = this.x;
            this.seekY = this.y;
            this.loaded = true;
            console.debug("timeline loaded");
        }
    }

    /**
     * Set the displayed image of the Seeker Drawable
     * @param {String} url 
     * @param {number} width 
     * @param {number} height 
     * @param {bool} constrain
     */
    setSeekerImage(url, width, height, constrain)
    {
        if (!url)
        {
            console.error('Error: Attempting to set the seeker image with an invalid url ' + url);
            return;
        }
        if (this.loaded)
        {
            this.seekerImageUrl = url;
            this.seeker.setImage(this.seekerImageUrl, constrain);

            this.seeker.width = width ? width : this.seeker.width;
            this.seeker.height = height ? height : this.seeker.height;
        }
        else
        {
            this.seekerImageUrl = url;
        }
        
    }

    /**
     * Check whether the seeker is being dragged
     * @returns Whether the seeker is in the dragging state
     */
    isSeekerDragging()
    {
        return this.seeker.dragging;
    }

    /**
     * Set the seeker's drag state
     * @param {bool} value 
     */
    setSeekerDragging(value)
    {
        this.seeker.dragging = value;
    }

    /**
     * Set the seeker's X position
     * Note: this method does not calculate based on currentTime
     * @param {number} newPos 
     */
    setSeekerPosition(newPos)
    {
        this.seeker.x = newPos;
        this.seekX = newPos;
    }

    /**
     * Track the mouse locally
     * @param {number} mX 
     * @param {number} mY 
     */
    updateMousePositionInfo(mX, mY)
    {
        this.mouseX = mX;
        this.mouseY = mY;
    }

    /**
     * Seek to destX on timeline or clamp to the ends
     * Note: This method also includes conversion from X to time
     * Todo: Extract this conversion into its own method. It will probably be used a lot.
     * @param {number} destX 
     */
    seek(destX)
    {
        var currentMedia = this.player.getCurrentMedia();
        if (currentMedia != undefined)
        {
            var processedDest = QPUtility.clamp(this.x, this.x + this.width, destX);
            currentMedia.skipTo(((processedDest - this.x) / this.width) * currentMedia.getDuration() - 1);
            this.setSeekerPosition(processedDest);
        }
        else
        {
            console.error('Tried to seek when no video is loaded.')
        }
    }
}