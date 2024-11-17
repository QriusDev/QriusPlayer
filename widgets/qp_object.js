/**
 * A storage object that represents a media element and methods to retrieve data.
 */
class MediaObject
{
    element = undefined;
    source = '';

    constructor(element)
    {
        this.element = element;

        // Extract source value for name, for now.
        var item = this.element;
        var sourceItem = item.querySelector('source');
        this.source = sourceItem.src;
    }

    /**
     * Get bounding rectangle info based on the type of media
     * Note: media with ambiguous bounds (ex. Sound) will be given default bounds
     * @returns bounding rectangle based on the type of media
     */
    getMediaBoundingRect()
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                return this.element.getBoundingClientRect();
            }
        }
    }

    /**
     * Download the media connected to the player
     */
    downloadMedia()
    {
        var item = this.element;
        var sourceItem = item.querySelector('source');
        var invoker = document.createElement('a');
        invoker.href = sourceItem.src;
        invoker.download = sourceItem.src;
        invoker.style.display = 'none';
        document.body.appendChild(invoker);
        invoker.click();
        document.body.removeChild(invoker);
        console.debug('Downloading video');
    }

    /**
     * Get the duratin of this media object
     * @returns the total duration of the media
     */
    getDuration()
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                return this.element.duration;
            }
        }
    }

    /**
     * Skip the media to a specific time
     * @param {number} time the time (in secs) to jump to
     */
    skipTo(time)
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                this.element.currentTime = time;
            }
        }
    }

    /**
     * Pause the media
     */
    pause()
    {
        if (this.element.pause)
        {
            this.element.pause();
        }
    }

    /**
     * Play the media, if playable.
     */
    play()
    {
        if (this.element.play)
        {
            this.element.play();
        }
    }

    /**
     * Get is the media paused
     * @returns whether the media is paused
     */
    isPaused()
    {
        return this.element.paused;
    }

    /**
     * Get the current time of the media
     * @returns current time in media
     */
    getCurrentTime()
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                return this.element.currentTime;
            }
        }
    }

    /**
     * Set the source of the media
     * @param {string} newSrc the new source to set the media to
     */
    setSource(newSrc)
    {
        if (this.element)
        {
            var sourceItem = this.element.querySelector('source');
            sourceItem.src = newSrc;
            this.source = newSrc;
        }
        else
        {
            console.error(`Error: Attempting to set source of an invalid element.`);
        }
    }

    /**
     * Get appropriate media title based on type
     * @returns the string best associated with src
     */
    getMediaTitle()
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                return this.getLocalFilename(this.source);
            }
        }
    }

    /**
     * Get the last section of a filepath 
     * (which is usually the file name. hacky but whatever)
     * @param {String} filepath 
     * @returns Last section of a filepath
     */
    getLocalFilename(filepath)
    {
        var fileParts = filepath.split('/');
        return fileParts[fileParts.length-1];
    }
}