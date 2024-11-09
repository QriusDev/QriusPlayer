class MediaObject
{
    element = undefined;

    constructor(element)
    {
        this.element = element;
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
        var item = document.getElementById("QPVideo");
        var sourceItem = item.querySelector('source');
        var invoker = document.createElement('a');
        invoker.href = sourceItem.src;
        invoker.download = sourceItem.src;
        invoker.style.display = 'none';
        document.body.appendChild(invoker);
        invoker.click();
        document.body.removeChild(invoker);
        console.log('Downloading video');
    }

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

    skipTo(time)
    {
        switch(this.element.localName)
        {
            case 'video':
            {
                return this.element.currentTime = time;
            }
        }
    }

    isPaused()
    {
        return this.element.paused;
    }

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
}