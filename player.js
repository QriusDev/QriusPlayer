/**
 * An media player
 */
class MediaPlayer extends QPCanvas
{
    context = undefined;
    fileInputElement = undefined;
    startingPosition = {};  // Starting transform info
    
    // Widgets/Controls
    background = {};    // Shown behind the player. I want it to be customizable
    background_scrim = {};  // Shown above the background as a design filter
    controls = {};
    timeline = {};
    settings = {};
    
    // Media
    playlist = []; // List of media objects to play
    playlistFile = './qplaylist.json';
    currentMedia = undefined;
    mediaNameTextField = {};
    mediaTimeTextField = {}
    
    // Settings
    isAutoplaying = true;
    isShuffling = false;
    isLoopingMedia = false;
    isLoopingPlaylist = true;
    
    // Delays/Timers
    mediaEndAutoplayDelay = undefined;
    mediaEndAutoplayDelayTime = 100;
    mediaSkipPlayDelay = undefined;
    mediaSkipPlayDelayTime = 1;

    // Debug
    forceDebugMode = false;
    inDebugMode = false;
    
    constructor(canvas, layerCount=10)
    {
        super(canvas, layerCount);

        this.context = this.handle.getContext('2d');
        
        this.timeline = new MediaTimeline(this.handle);
        
        this.controls = new MediaControls(this.handle);
        
        this.settings = new MediaSettings(this.handle, IDTag.getGenericIDTag('MediaSettingsObj'));
        this.background = new QPBackground('/assets/ThemeDefault_Build.png', this.handle, 'MediaPlayerBackground', 'rgba(0, 0, 0, 0.5)');
        this.settings.loadMenu();
        this.settings.menu.setExternalMenuFunction(SETTINGS_TOGGLE_DEBUG_MODE, this.toggleDebugMode.bind(this));
        
        this.startingPosition = {
            left: this.handle.style.left,
            top: this.handle.style.top,
            width: this.handle.style.width,
            height: this.handle.style.height
        }

        // Create playlist importer
        this.fileInputElement = document.createElement("input");
        this.fileInputElement.id = FILE_IMPORT_ID;
        this.fileInputElement.type = "file";
        this.fileInputElement.multiple = true;
        document.body.insertBefore(this.fileInputElement, this.handle);
        
        // Load the playlist
        this.LoadPlaylist();
        this.setDefaultStage();

        this.fileInputElement.addEventListener("change", this.onFileImport.bind(this), false);
        this.handle.addEventListener("mousemove", this.trackMousePosition.bind(this), false);
        this.handle.addEventListener("mouseenter", this.trackMousePosition.bind(this), false);
        this.handle.addEventListener("mouseleave", this.trackMousePosition.bind(this), false);
        
        this.handle.addEventListener("click", this.onClick.bind(this), false);
        this.handle.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.handle.addEventListener("mouseup", this.onMouseUp.bind(this), false);
        document.addEventListener("keyup", this.onKeypress.bind(this), false);
    }

    /**
     * Start the drawing process of all entities that are a part of the media player
     */
    BeginDraw()
    {
        if (this.handle)
        {
            this.context = this.handle.getContext('2d');
            this.timeline.connectPlayer(this);

            window.requestAnimationFrame(this.Animate.bind(this));
        }
        else
        {
            console.error(`Canvas or Media error`);
        }
    }

    /**
     * The actual draw function that describes the look of the MediaPlayer
     * Todo: make the process of adding something to be drawn use a registration list
     */
    Animate()
    {
        if (this.context)
        {
            this.context.clearRect(0, 0, this.handle.clientWidth, this.handle.clientHeight);
            this.draw();

            window.requestAnimationFrame(this.Animate.bind(this));
        }
        else
        {
            console.error('err: browser not supported or something else went wrong.');
        }
    }

    /**
     * 
     */
    setDefaultStage()
    {
        var timelineX = 75;

        // Background
        this.registerWidget(this.background, 1, () => {
            const backgroundY = this.calculateTimelineHeight(this.handle.clientHeight) - 30;
            this.background.context = this.context;
            this.background.setTransform(
                0,
                backgroundY - 50,
                this.handle.clientWidth,
                undefined
            );
            this.background.snapScrimToImage();
        });

        // Timeline and state function
        this.timeline.load();
        this.registerWidget(this.timeline, undefined, () => {
            this.timeline.context = this.context;
            this.timeline.setTransform(
                timelineX,
                this.calculateTimelineHeight(this.handle.clientHeight),
                this.calculateTimelineWidth(this.handle.clientWidth),
                10
            );
            this.timeline.color = "#b1b1b1";
        });

        // Seeker Tail
        // TODO: Remove these lines when the seeker tail class is made
        var seekerTail = {};
        seekerTail.visible = true;
        seekerTail.draw = () => {
            this.context.fillStyle = "#eaec70";
            this.context.fillRect(
                timelineX, 
                this.calculateTimelineHeight(this.handle.clientHeight), 
                this.timeline.seeker.x - timelineX + (this.timeline.seeker.width / 2), 
                this.calculateTimelineHeight(this.handle.clientHeight)
            );
        }
        this.registerWidget(seekerTail, undefined, ()=>{});
        this.registerWidget(this.timeline.seeker, undefined, ()=>{});

        // padding
        var paddingX = 10;
        var paddingY = 5;

        // Player Controls
        this.registerWidget(this.controls, this.getDefaultLayer()+1, () => {
            this.controls.context = this.context;
            this.controls.setTransform(
                this.timeline.x - 25 + (-paddingX),
                this.timeline.y - (this.controls.height / 2) + (-paddingY),
                25,
                25
            );
            this.controls.color = "black";
        });

        this.registerWidget(this.settings, this.getDefaultLayer()+1, () => {
            this.settings.context = this.context;
            this.settings.setTransform(
                this.timeline.x + this.timeline.width + paddingX,
                this.controls.y,
                this.controls.width,
                this.controls.height
            );
            this.settings.color = "orange";
        });
    }

    /**
     * Get media name and format to appropriate style
     * @param {string} mediaName the name to format
     * @returns the formatted name
     */
    formatMediaName(mediaName)
    {
        return `Now playing: ${mediaName}`;
    }

    /**
     * Get the media duration in an "HH:MM:SS/HH:MM:SS" formatted time string.
     * @param {number} currentTime The left side of the time string
     * @param {number} duration The right side of the time string
     * @returns the time string
     */
    formatMediaDuration(currentTime, duration)
    {
        return `${QPUtility.secondsToTimeString(currentTime)}/${QPUtility.secondsToTimeString(duration)}`;
    }

    /**
     * Set the image that displays as the seeker. Bubbling this up to make changes to the 
     * seeker much easier.
     * @param {string} url the path of the image
     * @param {number} width the width to make the image
     * @param {number} height the height to make the image
     * @param {bool} constrain Whether to constrain the image size with the Drawable's side
     */
    setSeekerImage(url, width, height, constrain=true)
    {
        this.timeline.setSeekerImage(url, width, height, constrain);
    }

    /**
     * Set the image that displays as the background
     * @param {string} url 
     */
    setBackgroundImage(url)
    {
        this.background.setImage(url);
    }

    /**
     * Set the image that displays as the settings control
     * @param {string} url 
     */
    setSettingsImage(url)
    {
        this.settings.setImage(url);
    }

    /**
     * Get mouse x and y {x, y}
     * @returns the mouse x and y in an object. Properties are named accordingly.
     */
    getMouse()
    {
        return {x: this.mouseX, y: this.mouseY};
    }

    /**
     * Based on the mouse position on the window, process where we are in our
     * canvas.
     * @param {Event} event the invoking event
     */
    trackMousePosition(event)
    {
        if (this.handle)
        {
            var rect = this.handle.getBoundingClientRect();
            this.mouseX = event.pageX - rect.left;
            this.mouseY = event.pageY - rect.top;
    
            this.reportHoverEvents(this.mouseX, this.mouseY);
        }
    }

    /**
     * Tell items that are drawn, whether they are being hovered by the mouse.
     * @param {number} mX mouse x
     * @param {number} mY mouse y
     */
    reportHoverEvents(mX, mY)
    {
        var itemsHovered = 0;
        for (const screenLayer of this.screen)
        {
            for (const item of screenLayer.drawArray)
            {
                var widget = item.widget;
                if (widget.boundingBox)
                {
                    let isHovering = widget.boundingBox.isOverlapping(mX, mY);
                    if (isHovering)
                    {
                        ++itemsHovered;
                        widget.setHovered(true);
                        console.debug(`[${widget.name}](${widget.x}, ${widget.y}) is hovered by mouse @(${mX}, ${mY})`);
                    }
                    else if (widget.hovered)
                    {
                        widget.setHovered(false);
                        console.debug(`[${widget.name}](${widget.x}, ${widget.y}) is hovered by mouse @(${mX}, ${mY})`);
                    }
                }
            }
        }

        if (itemsHovered > 0)
        {
            // Set pointer
            document.body.style.cursor = 'pointer';
        }
        else
        {
            // Reset pointer
            document.body.style.cursor = 'default';
        }
    }

    /**
     * On click for inside elements
     * @param {Event} event 
     */
    onClick(event)
    {
        var handled = false;
        if (this.timeline.hovered)
        {
            this.timeline.setSeekerPosition(this.mouseX);
            handled = true;
        }
        if (this.controls.hovered)
        {
            if (this.currentMedia != undefined)
            {
                this.controls.togglePause();
            }
            else
            {
                this.LoadPlaylist();
            }
            handled = true;
        }
        if (this.settings.hovered)
        {
            this.settings.menu.x = this.settings.x;
            this.settings.menu.y = this.settings.y - (this.settings.height * this.settings.settingsList.length);
            
            this.settings.menu.onContextMenu(event);
            handled = true;
        }

        if (!handled && this.settings.opened)
        {
            this.closeContextMenu();
        }
    }

    /**
     * On mouse down
     * @param {Event} event 
     */
    onMouseDown(event)
    {
        if (this.timeline.hovered)
        {
            if (this.mouseX)
            {
                this.timeline.seek(this.mouseX);
            }
        }
        if (this.timeline.seeker.hovered)
        {
            if (this.mouseX)
            {
                this.timeline.seek(this.mouseX);
                this.timeline.setSeekerDragging(true);
            }
        }
    }

    /**
     * On mouse up
     * @param {Event} event 
     */
    onMouseUp(event)
    {
        if (this.timeline.isSeekerDragging())
        {
            this.timeline.setSeekerDragging(false);
        }
    }

    /**
     * Define logic when the mouse leaves the canvas's extents
     * @param {Event} event 
     */
    onMouseLeave(event)
    {
        // Leaving the canvas, for now, is just like a mouse up event
        this.onMouseUp(event);
    }

    /**
     * What to do when a key is pressed
     * @param {KeyboardEvent} event the keyboard event 
     */
    onKeypress(event)
    {
        switch(event.key.toLowerCase())
        {
            // Play/pause toggle
            case " ":
            {
                if (this.currentMedia != undefined)
                {
                    this.currentMedia.togglePlayPause();
                }
                break;
            }

            // Next media item
            case "arrowright":
            {
                this.skipMedia();
                break;
            }

            // Previous media item
            case "arrowleft":
            {
                this.prevMedia();
                break;
            }

            // Toggle shuffling
            case "s":
            {
                this.isShuffling = !this.isShuffling;
                console.log(`Shuffling: ${this.isShuffling}`);
                break;
            }
        }
    }

    /**
     * Event when files have been selected
     * @param {Event} event 
     */
    onFileImport(event)
    {
        const files = event.target.files;
        const importedFiles = [];
        for (const file of files)
        {
            console.log(file);
            const jsonMediaObject = {
                Type: MediaObject.GetTypeFromString(file.type),
                Src: '/ignore/' + file.name,
                Domain: 'local',
                isFolder: false
            };

            importedFiles.push(jsonMediaObject);
        }

        this.processPlaylistFileContents(importedFiles);
        if (this.playlist.length > 0)
        {
            this.UpdatePlaylist(importedFiles);
            this.LoadPlaylist();
        }
    }

    /**
     * Tell the player to toggle debug mode, which activates all debug drawing
     * in the drawn items.
     */
    toggleDebugMode()
    {
        if (this.inDebugMode)
        {
            this.overrideDebugSettings(false);
            this.inDebugMode = false;
        }
        else
        {
            this.overrideDebugSettings(true);
            this.inDebugMode = true;
        }
    }

    /**
     * Loop through all drawn items and force their debug settings to change
     * @param {bool} enable whether to enable the debug setting
     * @param {string} value a comma separated string of flags to modify
     */
    overrideDebugSettings(enable, value = Drawable.ALL_FLAGS)
    {
        for (const item of QPDrawList)
        {
            if (enable)
            {
                item.enableDebugSettings(value);
            }
            else
            {
                item.disableDebugSettings(value);
            }
        }
    }

    /**
     * Based on the canvas width, make the timeline a bit smaller than that
     * Note: we need to make the timeline entirely customizable so users should be able to
     * change the timeline's width freely.
     * @param {number} canvasWidth 
     * @returns processed timeline width
     */
    calculateTimelineWidth(canvasWidth)
    {
        return canvasWidth * 0.75;
    }

    /**
     * Based on the canvas height, make the timeline a bit smaller than that
     * Note: we need to make the timeline entirely customizable so users should be able to
     * change the timeline's height freely.
     * @param {number} canvasHeight 
     * @returns processed timeline height
     */
    calculateTimelineHeight(canvasHeight)
    {
        return canvasHeight - 10; 
    }

    /**
     * Load the playlist file
     * @returns the resulting playlist
     */
    async LoadPlaylist()
    {
        // Check if we have cache
        var cache = QPUtility.getCookie(PLAYLIST_COOKIE_KEY);
        if (cache)
        {
            console.log(`Trying to load cached playlist {${cache}}`);
            this.playlistFile = cache;
        }
        else
        {
            console.log(`Loading default playlist {${this.playlistFile}}`);
        }

        const request = new Request(this.playlistFile);
        const response = await fetch(request);
        const json = await response.json();
        this.processPlaylistFileContents(json);
        this.loadMedia(0);
        return this.playlist;
    }

    /**
     * Get the playlist
     * @returns the playlist
     */
    getPlaylist()
    {
        return this.playlist;
    }

    /**
     * Get the currently loaded media
     * @returns The currently loaded media
     */
    getCurrentMedia()
    {
        return this.currentMedia;
    }

    /**
     * Load a new piece of media in the playlist
     * @param {int} playlistIndex which media item to load 
     * @returns whether it was successful
     */
    loadMedia(playlistIndex, forcePaused=false)
    {
        if (this.playlist.length <= playlistIndex)
        {
            console.log("Load requested, No media available.", this.playlist)
            return false;
        }

        // We had a video before, so remove.
        var oldMediaModified = false;
        if (this.currentMedia != undefined)
        {
            this.mediaNameTextField.Destroy();
            this.mediaTimeTextField.Destroy();

            let currentMediaSource = document.getElementById(this.currentMedia.element.id);
            this.controls.media = undefined;
            currentMediaSource.remove();
            oldMediaModified = true;
        }
        
        const mediaItem = this.playlist[playlistIndex];
        this.controls.media = mediaItem;
        this.controls.setState(true);
        
        // What to do when the media considers itself to have ended.
        mediaItem.onMediaEndedCallback = () => {
            if (this.isAutoplaying)
            {
                if (!this.mediaEndAutoplayDelay)
                {
                    this.songEndAutoplayDelay = setTimeout(() => {
                        this.skipMedia();
                        this.songEndAutoplayDelay = undefined;  // Reset after done
                    }, this.mediaEndAutoplayDelayTime);
                }
            }
        };

        mediaItem.onPlayCallback = (event) => {
            if (this.controls.media == mediaItem)
            {
                this.controls.setState(false);
            }
        }
        mediaItem.onPauseCallback = (event) => {
            if (this.controls.media == mediaItem)
            {
                this.controls.setState(true);
            }
        }

        mediaItem.attachToDOM();
        if (mediaItem.element.width)
        {
            this.handle.width = mediaItem.element.width;
            this.handle.height = mediaItem.element.height;
        }

        this.mediaNameTextField = new TextField(this.handle, this.formatMediaName(mediaItem.getMediaTitle()), undefined, 'white');
        this.mediaTimeTextField = new TextField(this.handle, undefined, '--:--/--:--', 'white');
        
        this.mediaTimeTextField.setFont('18px serif');
        this.mediaNameTextField.media = mediaItem;
        this.mediaTimeTextField.media = mediaItem;

        var textLayer = 3;
        // Media identifier text
        this.registerWidget(this.mediaNameTextField, textLayer, () => {
            this.mediaNameTextField.setTransform(
                this.timeline.x,
                this.timeline.y - 20,
                this.timeline.width - 100,
                50
            );
            this.mediaNameTextField.setLabel(this.formatMediaName(mediaItem.getMediaTitle()))
        });

        // Current time text
        this.registerWidget(this.mediaTimeTextField, textLayer, () => {
            this.mediaTimeTextField.setTransform(
                this.timeline.x + this.timeline.width - 130,
                this.timeline.y - 2,
                300,
                25
            );
            this.mediaTimeTextField.setLabel(this.formatMediaDuration(mediaItem.getCurrentTime(), mediaItem.getDuration()));
        });

        // Snap to video
        var mediaBounds = mediaItem.getMediaBoundingRect();
        this.handle.style.left = mediaBounds.left + "px";
        this.handle.style.top = mediaBounds.top + "px";
        this.handle.style.width = mediaBounds.width + "px";
        this.handle.style.height = mediaBounds.height + "px";

        // Setup current media property to keep track 
        this.currentMedia = mediaItem;
        this.currentMedia.index = playlistIndex;
        
        // If we're autoplaying and we've already loaded in before, play
        if (!forcePaused && this.currentMedia.playBeginning && this.isAutoplaying && oldMediaModified)
        {
            this.currentMedia.playBeginning();
        }
        return true;
    }

    /**
     * Skip current media and jump to a random one in the list
     * @returns whether this was a success
     */
    shuffleCurrentMediaItem()
    {
        // For now, pick a random number in the range of the playlist
        // later we'll have based on the history list and frequency forgiveness
        return this.loadMedia(Math.floor(Math.random()*100) % this.playlist.length);
    }

    /**
     * Skip media only if there's another piece of media to load up
     * @returns whether this was a success
     */
    skipCurrentMediaItem()
    {
        if (this.currentMedia.index < this.playlist.length - 1)
        {
            return this.loadMedia(this.currentMedia.index+1);
        }
        else
        {
            // If we're looping the playlist, wrap
            if (this.isLoopingPlaylist)
            {
                return this.loadMedia(0);
            }
        }
        return false;
    }

    /**
     * Skip the current media item in the playlist
     * if isLoopingPlaylist, wrap
     * @returns whether this was a success
     */
    skipMedia()
    {
        if (this.currentMedia != undefined)
        {
            if (this.isShuffling)
            {
                return this.shuffleCurrentMediaItem();
            }
            else
            {
                return this.skipCurrentMediaItem();
            }
        }
        return false;
    }

    /**
     * Go to the previous media item in the playlist
     * if isLoopingPlaylist, wrap
     * @returns whether this was a success
     */
    prevMediaItem()
    {
        if (this.currentMedia.index != 0)
        {
            this.loadMedia(this.currentMedia.index - 1);
            return true;
        }
        else if (this.isLoopingPlaylist)
        {
            this.loadMedia(this.playlist.length - 1);
            return true;
        }
        return false;
    }

    /**
     * Go to the previous media item in the playlist, if available
     * if isLoopingPlaylist, wrap
     * @returns whether this was a success
     */
    prevMedia()
    {
        return this.prevMediaItem();
    }

    /**
     * Process what we pull from the playlist file
     * @param {JSONObject} input 
     */
    processPlaylistFileContents(input)
    {
        this.clearPlaylist();
        for (const item of input)
        {
            var mediaObj = MediaObject.ConvertToType(item);
            if (mediaObj != undefined)
            {
                this.playlist.push(mediaObj);
            }
        }
    }

    /**
     * Clear the playlist
     */
    clearPlaylist()
    {
        this.playlist = [];
    }

    /**
     * Update the playlist json file
     */
    UpdatePlaylist(jsonMediaObjectList)
    {
        const playlistBlob = new Blob([JSON.stringify(jsonMediaObjectList, null, 2)], {type: 'application/json'});
        const downloadLocation = window.URL.createObjectURL(playlistBlob);

        // format: blob:http://127.0.0.1:5501/66532b4a-85a1-4417-b24d-9ec14973fc25
        MediaObject.InvokeDownload(downloadLocation, (event) => {
            var savedSrc = event.target.download;
            var newPath = savedSrc
                            .replace(/:|\//g, '_');
            this.playlistFile = `./${newPath}`;

            // Cache file location so we can refresh
            QPUtility.setCookie('playlist_path', this.playlistFile);
        });
    }
}