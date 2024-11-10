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
        var newSeekerPosition = clamp(this.x, this.x + this.width - this.seekerWidth, this.seeker.x);
        this.seeker.context = this.context;
        
        // Get correct x value for seeker
        var md = this.player.media;
        if (!md.isPaused())
        {
            this.seekX = this.x + ((md.getCurrentTime() / md.getDuration()) * this.width);
        }
        else
        {
            this.seekX = clamp(this.x, this.x + this.width, newSeekerPosition);
        }

        if (this.isSeekerDragging())
        {
            this.seekX = clamp(this.x, this.x + this.width, this.player.getMouse().x);
            this.seek(this.seekX);
        }

        this.seeker.setTransform(
            this.seekX, 
            this.y - (this.seekerHeight * 0.5),
            this.seekerWidth, 
            this.seekerHeight
        );

        this.seeker.color = this.seekerColor;
        this.seeker.draw();
    }

    connectPlayer(player)
    {
        this.player = player;
        this.load();
    }

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

    isSeekerDragging()
    {
        return this.seeker.dragging;
    }

    setSeekerDragging(value)
    {
        this.seeker.dragging = value;
    }

    setSeekerPosition(newPos)
    {
        this.seekX = newPos;
    }

    updateMousePositionInfo(mX, mY)
    {
        this.mouseX = mX;
        this.mouseY = mY;
    }

    seek(destX)
    {
        var processedDest = clamp(this.x, this.x + this.width, destX);
        this.player.media.skipTo(((processedDest - this.x) / this.width) * this.player.media.getDuration() - 1);
        this.setSeekerPosition(processedDest);
    }
}