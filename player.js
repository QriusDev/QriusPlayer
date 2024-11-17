/**
 * An media player
 */
class MediaPlayer extends QPCanvas
{
    media = undefined;
    canvas = undefined;
    context = undefined;
    controls = {};
    timeline = {};
    settings = {};

    // For media text
    mediaName = {};
    mediaTime = {}
    
    background = {};    // Shown behind the player. I want it to be customizable
    background_scrim = {};  // Shown above the background as a design filter

    forceDebugMode = false;
    inDebugMode = false;

    overlaying = false;
    startingPosition = {};
    
    constructor(canvasHandle, media, layerCount=10)
    {
        super(canvasHandle, layerCount);

        this.canvas = canvasHandle;
        this.media = media;
        this.context = this.canvas.getContext('2d');
        
        this.timeline = new MediaTimeline(this.canvas);
        
        this.controls = new MediaControls(this.canvas);
        this.controls.setMedia(this.media);

        this.settings = new MediaSettings(this.canvas, this.media, IDTag.getGenericIDTag('MediaSettingsObj'));
        this.background = new QPBackground('/assets/ThemeDefault_Build.png', this.canvas, 'MediaPlayerBackground', 'rgba(0, 0, 0, 0.5)');
        this.settings.loadMenu();
        this.settings.menu.setExternalMenuFunction(SETTINGS_TOGGLE_DEBUG_MODE, this.toggleDebugMode.bind(this));
        
        this.mediaName = new TextField(this.canvas, this.formatMediaName(this.media.getMediaTitle()), undefined, 'white');
        this.mediaTime = new TextField(this.canvas, undefined, '--:--/--:--', 'white');
        this.mediaTime.setFont('18px serif');

        this.startingPosition = {
            left: this.canvas.style.left,
            top: this.canvas.style.top,
            width: this.canvas.style.width,
            height: this.canvas.style.height
        }

        this.setDefaultStage();

        this.canvas.addEventListener("mousemove", this.trackMousePosition.bind(this), false);
        this.canvas.addEventListener("mouseenter", this.trackMousePosition.bind(this), false);
        this.canvas.addEventListener("mouseleave", this.trackMousePosition.bind(this), false);

        this.canvas.addEventListener("click", this.onClick.bind(this), false);
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    }

    /**
     * Start the drawing process of all entities that are a part of the media player
     */
    BeginDraw()
    {
        if (this.canvas && this.media)
        {
            this.context = this.canvas.getContext('2d');
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
            this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
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
            const backgroundY = this.calculateTimelineHeight(this.canvas.clientHeight) - 30;
            this.background.context = this.context;
            this.background.setTransform(
                0,
                backgroundY - 50,
                this.canvas.clientWidth,
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
                this.calculateTimelineHeight(this.canvas.clientHeight),
                this.calculateTimelineWidth(this.canvas.clientWidth),
                10
            );
            this.timeline.color = "#b1b1b1";
        });

        // Seeker Tail
        // HACK: until we have the seeker tail checked in
        var seekerTail = {};
        seekerTail.visible = true;
        seekerTail.draw = () => {
            this.context.fillStyle = "#eaec70";
            this.context.fillRect(
                timelineX, 
                this.calculateTimelineHeight(this.canvas.clientHeight), 
                this.timeline.seeker.x - timelineX + (this.timeline.seeker.width / 2), 
                this.calculateTimelineHeight(this.canvas.clientHeight)
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

        var textLayer = 3;
        // Media identifier text
        this.registerWidget(this.mediaName, textLayer, () => {
            this.mediaName.setTransform(
                this.timeline.x,
                this.timeline.y - 20,
                this.timeline.width - 100,
                50
            );
            this.mediaName.setLabel(this.formatMediaName(this.media.getMediaTitle()))
        });

        // Current time text
        this.registerWidget(this.mediaTime, textLayer, () => {
            this.mediaTime.setTransform(
                this.timeline.x + this.timeline.width - 130,
                this.timeline.y - 2,
                300,
                25
            );
            this.mediaTime.setLabel(this.formatMediaDuration(this.media.getCurrentTime(), this.media.getDuration()));
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
        if (this.canvas)
        {
            var rect = this.canvas.getBoundingClientRect();
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
        for (const item of QPDrawList)
        {
            let isHovering = item.boundingBox.isOverlapping(mX, mY);
            if (isHovering)
            {
                ++itemsHovered;
                item.setHovered(true);
                console.debug(`[${item.name}](${item.x}, ${item.y}) is hovered by mouse @(${mX}, ${mY})`);
            }
            else if (item.hovered)
            {
                item.setHovered(false);
                console.debug(`[${item.name}](${item.x}, ${item.y}) is hovered by mouse @(${mX}, ${mY})`);
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
            this.controls.togglePause();
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
     * DEBUG ONLY: Tell the player to move to a certain position on screen to overlay.
     */
    toggleOverlay()
    {
        if (!this.overlaying)
        {
            var vidlocation = this.media.getMediaBoundingRect();
            this.canvas.style.left = vidlocation.left + "px";
            this.canvas.style.top = vidlocation.top + "px";
            this.canvas.style.width = vidlocation.width + "px";
            this.canvas.style.height = vidlocation.height + "px";
            this.overlaying = true;
        }
        else
        {
            this.canvas.style.left = this.startingPosition.left;
            this.canvas.style.top = this.startingPosition.top;
            this.canvas.style.width = this.startingPosition.width;
            this.canvas.style.height = this.startingPosition.height;
            this.overlaying = false;
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
}