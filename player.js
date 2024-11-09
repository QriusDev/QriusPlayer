class MediaPlayer 
{
    media = undefined;
    canvas = undefined;
    context = undefined;
    controls = {};
    timeline = {};
    settings = {};

    forceDebugMode = false;
    inDebugMode = false;

    overlaying = false;
    startingPosition = {};
    
    constructor(canvasHandle, media)
    {
        this.canvas = canvasHandle;
        this.media = media;
        this.context = this.canvas.getContext('2d');
        
        this.timeline = new MediaTimeline(this.canvas);
        this.controls = new MediaControls(this.canvas);
        this.settings = new MediaSettings(this.canvas, this.media, IDTag.getGenericIDTag('MediaSettingsObj'));
        this.settings.loadMenu();
        this.settings.menu.setExternalMenuFunction(SETTINGS_TOGGLE_DEBUG_MODE, this.toggleDebugMode.bind(this));
        
        this.startingPosition = {
            left: this.canvas.style.left,
            top: this.canvas.style.top,
            width: this.canvas.style.width,
            height: this.canvas.style.height
        }

        this.canvas.addEventListener("mousemove", this.trackMousePosition.bind(this), false);
        this.canvas.addEventListener("mouseenter", this.trackMousePosition.bind(this), false);
        this.canvas.addEventListener("mouseleave", this.trackMousePosition.bind(this), false);

        this.canvas.addEventListener("click", this.onClick.bind(this), false);
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    }

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

    Animate()
    {
        if (this.context)
        {
            var timelineX = 75;
            this.context.clearRect(0, 0, 640, 360);

            // Drawing Timeline
            this.timeline.load();
            this.timeline.context = this.context;
            this.timeline.setTransform(
                timelineX,
                this.calculateTimelineHeight(this.canvas.clientHeight),
                this.calculateTimelineWidth(this.canvas.clientWidth),
                10
            );
            this.timeline.color = "#b1b1b1";
            this.timeline.draw();

            // Seeker Tail
            this.context.fillStyle = "#eaec70";
            this.context.fillRect(
                timelineX, 
                this.calculateTimelineHeight(this.canvas.clientHeight), 
                this.timeline.seeker.x - timelineX, 
                this.calculateTimelineHeight(this.canvas.clientHeight)
            );

            // padding
            var paddingX = 10;
            var paddingY = 5;

            // Drawing Player Controls
            this.controls.context = this.context;
            this.controls.setTransform(
                this.timeline.x - 25 + (-paddingX),
                this.timeline.y - (this.controls.height / 2) + (-paddingY),
                25,
                25
            );
            this.controls.color = "black";
            this.controls.draw();

            this.settings.context = this.context;
            this.settings.setTransform(
                this.timeline.x + this.timeline.width + paddingX,
                this.controls.y,
                this.controls.width,
                this.controls.height
            );
            this.settings.color = "orange";
            this.settings.draw();

            window.requestAnimationFrame(this.Animate.bind(this));
        }
        else
        {
            console.error('err: browser not supported or something else went wrong.');
        }
    }

    getMouse()
    {
        return {x: this.mouseX, y: this.mouseY};
    }

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
                console.log(`[${item.name}](${item.x}, ${item.y}) is hovered by mouse @(${mX}, ${mY})`);
            }
            else if (item.hovered)
            {
                item.setHovered(false);
                console.log(`[${item.name}](${item.x}, ${item.y}) is hovered by mouse @(${mX}, ${mY})`);
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
            console.log("controls: paused toggled");
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

    toggleDebugMode()
    {
        console.log(this.inDebugMode);
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
        
        console.log("Overlay toggled");
    }

    overrideDebugSettings(enable, value = Drawable.ALL_FLAGS)
    {
        console.log(enable, value);
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

    calculateTimelineWidth(canvasWidth)
    {
        return canvasWidth * 0.75;
    }

    calculateTimelineHeight(canvasHeight)
    {
        return canvasHeight - 10; 
    }
}