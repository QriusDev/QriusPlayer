/**
 * A storage object that represents a media element and methods to retrieve data.
 */
class MediaObject
{
    element = undefined;
    source = '';
    index = 0;  // All media will be a playlist item. Let everything know where it is.
    
    // Callbacks
    onMediaEndedCallback = undefined;
    onPlayCallback = undefined;
    onPauseCallback = undefined;
    onLoadedDataCallback = undefined;

    constructor(element)
    {
        this.element = element;

        // Extract source value for name, for now.
        var item = this.element;
        var sourceItem = item.querySelector('source');
        this.source = sourceItem.src;
    }

    /**
     * Convert the json version of a media object into the appropriate
     * media object in code.
     * @param {MediaJSONObject} data JSON response to qplaylist.json
     * @returns a media object to play/stop/get duration/etc...
     */
    static ConvertToType(data)
    {
        let mediaElement;
        switch(data.Type)
        {
            case "AUDIO":
            {
                mediaElement = document.createElement('img');
                mediaElement.id = "QPImage";
                mediaElement.src = data.Src;
                
                return new MediaObject(mediaElement);
            }
            case "VIDEO":
            {
                mediaElement = document.createElement('video');
                mediaElement.id = "QPVideo";
                mediaElement.width = data.Width || 1920;
                mediaElement.height =  data.Height || 1080;
                let srcElement = document.createElement('source');
                srcElement.src = data.Src;
                srcElement.type = "video/mp4";
                mediaElement.appendChild(srcElement);
                
                // The domain would be used here to determine further the appropriate object
                
                const mediaObject = new MediaObject(mediaElement);
                // Set up listeners
                mediaElement.addEventListener('ended', mediaObject.onMediaEnded.bind(mediaObject));
                mediaElement.addEventListener('play', mediaObject.onPlay.bind(mediaObject));
                mediaElement.addEventListener('pause', mediaObject.onPause.bind(mediaObject));
                return mediaObject;
            }
            case "AUDIO":
            {
                break;
            }
        }

        return undefined;
    }

    /**
     * Convert a third-party type string to a type we support
     * @param {string} typeString the type string
     */
    static GetTypeFromString(typeString)
    {
        var retType = "unknown";
        switch (typeString)
        {
            case "video/mp4":
            {
                retType = "VIDEO";
                break;
            }

            default:
            {
                console.warn(`Attempting to get type from invalid element ${element} or skipType ${skipType}`)
                break;
            }
        }
        return retType;
    }

    /**
     * Invoke a browser download for href
     * @param {string} href Location of download
     * @param {Function} callback What to do on click
     */
    static InvokeDownload(href, callback)
    {
        var invoker = document.createElement('a');
        invoker.href = href;
        invoker.download = href;
        invoker.style.display = 'none';
        document.body.appendChild(invoker);
        invoker.onclick = (event) => {
            callback(event);
        };
        invoker.click();
        document.body.removeChild(invoker);
        console.debug('Downloading video');
    }

    /**
     * Attach this element to the dom
     */
    attachToDOM()
    {
        let dupeCheck = document.getElementById(this.element.id);
        if (!dupeCheck && this.element != undefined)
        {
            var cv = document.getElementById(CANVAS_ID);
            document.body.insertBefore(this.element, cv);
        }
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
        MediaObject.InvokeDownload(sourceItem.src);
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
     * Set the media current time to zero and other cleanup
     */
    start()
    {
        this.skipTo(0);
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
     * Toggle pause state
     */
    togglePlayPause()
    {
        if (this.element.play && this.element.pause)
        {
            if (this.element.paused)
            {
                this.element.play();
            }
            else
            {
                this.element.pause();
            }
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
     * Play the beginning of the media
     */
    playBeginning()
    {
        this.start();
        this.play();
    }

    /**
     * Event when the end of playback has been reached
     * @param {Event} event
     */
    onMediaEnded(event)
    {
        if (this.onMediaEndedCallback != undefined)
        {
            this.onMediaEndedCallback(event);
        }
    }

    /**
     * Event when media plays
     * @param {Event} event
     */
    onPlay(event)
    {
        if (this.onPlayCallback)
        {
            this.onPlayCallback(event);
        }
    }

    /**
     * Event when media paused
     * @param {Event} event
     */
    onPause(event)
    {
        if (this.onPauseCallback)
        {
            this.onPauseCallback(event);
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