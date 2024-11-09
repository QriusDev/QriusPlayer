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
        
        var md = this.player.media;
        if (!md.isPaused())
        {
            this.seeker.x = this.x + ((md.getCurrentTime() / md.getDuration()) * this.width);
            this.seekX = this.x + ((md.getCurrentTime() / md.getDuration()) * this.width);
        }
        else
        {
            this.seeker.x = clamp(this.x, this.x + this.width, newSeekerPosition);
            this.seekX = clamp(this.x, this.x + this.width, newSeekerPosition); // Why does this exist?
        }

        if (this.isSeekerDragging())
        {
            this.seeker.x = clamp(this.x, this.x + this.width, this.player.getMouse().x);
            this.seekX = clamp(this.x, this.x + this.width, this.player.getMouse().x);
            this.seek(this.seeker.x);
        }

        this.seeker.y = this.y - (this.seekerHeight * 0.5);
        this.seeker.width = this.seekerWidth;
        this.seeker.height = this.seekerHeight;
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
            this.seekX = this.x;
            this.seekY = this.y;
            this.loaded = true;
            console.log("timeline loaded");
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
        console.log(this.player.media)
        this.player.media.skipTo(((processedDest - this.x) / this.width) * this.player.media.getDuration() - 1);
        this.setSeekerPosition(processedDest);
    }
}