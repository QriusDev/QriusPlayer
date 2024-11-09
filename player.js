function clamp(min, max, value)
{
    if (value > max)
    {
        value = max;
    }
    else if (value < min)
    {
        value = min;
    }

    return value;
}

class Seeker extends Drawable
{
    name = "Seeker Object";
    dragging = false;
}

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

class MediaControls extends Drawable
{
    isPaused = true;
    playImg = "assets/play.png";
    pauseImg = "assets/pause.png";
    img = new Image();

    name = "Video Controls Object";

    drawFunction()
    {
        this.img.context = this.context;
        this.img.src = (this.isPaused) ? this.playImg : this.pauseImg;
        this.img.width = this.width;
        this.img.height = this.height;
        this.context.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    togglePause()
    {
        this.isPaused = !this.isPaused;
        if (this.isPaused)
        {
            vid.pause();
        }
        else
        {
            vid.play();
        }
    }
}

class IDTag
{
    name = '';
    color = '';
    x = 0; 
    y = 0;
    width = 0;
    height = 0;

    constructor(name, color, x, y, width, height)
    {
        this.name = name;
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static getGenericIDTag(name, color, x, y, width, height)
    {
        return new IDTag(
            name || 'DEFAULT',
            color || 'black',
            x || 0, 
            y || 0, 
            width || 0, 
            height || 0
        );
    }
}

class MediaSettings extends Drawable
{
    opened = false;
    menu = undefined;
    canvas = undefined;
    settingsList = [ SETTINGS_TOGGLE_DEBUG_MODE, SETTINGS_QUALITY, SETTINGS_SPEED, SETTINGS_DOWNLOAD, MENU_BACK ];

    constructor(canvas, media, idTag)
    {
        super(canvas, idTag.name, idTag.color, idTag.x, idTag.y, idTag.width, idTag.height)
        this.canvas = canvas;
        this.x = idTag.x;
        this.y = idTag.y;
        this.menu = new Menu(this.canvas, undefined, media, this.x, this.y);
    }

    loadMenu()
    {
        if (!this.canvas)
        {
            console.error('Canvas not loaded in MediaSettings object');
            return;
        }
        if (this.menu)
        {
            var list = this.menu.element.children[0];
            list.innerHTML = "";

            // Fill context menu with settings
            for (const setting of this.settingsList)
            {
                var settingsItem = document.createElement("li");
                settingsItem.textContent = setting;
                settingsItem.classList.add("QPListItem");
                settingsItem.addEventListener('click', this.menu.onContextMenuAction.bind(this.menu));
                list.appendChild(settingsItem);
            }
    
            // Hide error
            var errItem = document.getElementsByClassName("QPError")[0];
            if (errItem)
            {
                errItem.style.display = 'none';
            }
        }
    }

    setTransform(x, y, width, height)
    {
        super.setTransform(x, y, width, height);

        if (this.menu)
        {
            this.menu.x = x;
            this.menu.y = y;
        }
    }
}

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

class Menu
{
    canvas = undefined;
    element = undefined;
    media = null;
    opened = false;
    breadCrumbs = [SETTINGS];
    propertyCallbackMap = {};
    x = 0;
    y = 0;

    constructor(canvas, element, media, x, y)
    {
        this.media = media;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.element = element || this.getDefaultElement();
    }

    getDefaultElement()
    {
        if (!this.element)
        {
            var buildMenu = document.createElement('div');
            buildMenu.id = 'QPSettingsMenu';
    
            // Create list
            var l = document.createElement('ul');
            l.classList.add('QPSettingsMenuList');
    
            // Add default item
            var listItem = document.createElement('li');
            listItem.classList.add('QPError');
            listItem.classList.add('QPListItem');
            listItem.innerHTML = `<b>Cannot load QPItems</b>`;
    
            l.appendChild(listItem);
            buildMenu.appendChild(l);

            var doc = document.getElementById('QriusPlayer');
            doc.after(buildMenu);
            return buildMenu;
        }
        return this.element;
    }

    /**
     * Update menu to next menu type in the list
     */
    loadMenu()
    {
        var menuChange = false;
        if (this.breadCrumbs.length < 0)
        {
            console.error("Using breadcrumbs when a menu has not been loaded.")
            return;
        }
        switch (this.breadCrumbs[this.breadCrumbs.length - 1])
        {
            case SETTINGS:  // Mainly for back button
            {
                break;
            }
            case SETTINGS_SPEED:
            {
                menuChange = true;
                break;
            }
            case SETTINGS_QUALITY:
            {
                menuChange = true;
                break;
            }
            case SETTINGS_DOWNLOAD:
            {
                if (this.media)
                {
                    this.media.downloadMedia();
                }
                break;
            }
            case SETTINGS_TOGGLE_DEBUG_MODE:
            {
                if (this.propertyCallbackMap[SETTINGS_TOGGLE_DEBUG_MODE])
                {
                    this.propertyCallbackMap[SETTINGS_TOGGLE_DEBUG_MODE]();
                }
                break;
            }

            case MENU_BACK:
            {
                this.onClickBackItem();
                break;
            }
        }

        return menuChange;
    }

    setExternalMenuFunction(settingName, settingFunction)
    {
        this.propertyCallbackMap[settingName] = settingFunction;
    }

    onContextMenuAction(event)
    {
        var item = event.srcElement;
        var action = item.textContent;
        var menuRequested = false;
        
        this.breadCrumbs.push(action);
        menuRequested = this.loadMenu();
        console.log(menuRequested);
        
        // Close menu if we haven't asked for another one, for this action
        if (!menuRequested)
        {
            this.closeContextMenu();
        }
    }

    onClickBackItem(event)
    {
        if (this.breadCrumbs.length < 2)
        {
            this.closeContextMenu();
            return;
        }

        var currentMenu = this.backtrack();
    }

    backtrack(count = 1)
    {
        // remove from list
        var menusPassed = this.breadCrumbs.splice(this.breadCrumbs.length - count);
        this.loadMenu();
        return menusPassed;
    }

    loadQualityMenu()
    {
        var list = this.element.children[0];
        list.innerHTML = "";
        // Fill context menu with settings
        for (const setting of settings.settingsList)
        {
            var settingsItem = document.createElement("li");
            settingsItem.textContent = setting;
            settingsItem.classList.add("QPListItem");
            settingsItem.addEventListener('click', this.onContextMenuAction.bind(this));
            list.appendChild(settingsItem);
        }

        var backItem = document.createElement("li");
        backItem.textContent = back;
        backItem.classList.add("QPListItem");
        backItem.addEventListener('click', )
        list.appendChild(backItem);
    }

    onContextMenu(event)
    {
        if (this.opened)
        {
            this.closeContextMenu();
        }
        else
        {
            this.openContextMenu();
        }

        console.log(`Context menu toggled`);
    }

    openContextMenu()
    {
        this.loadMenu();

        var bnds = this.canvas.getBoundingClientRect();
        console.log(bnds);
        this.element.style.top = (bnds.top + this.y) + "px";
        this.element.style.left = (bnds.left + this.x) +"px";
        this.element.style.display = 'block';
        this.opened = true;
        
        // Push menu name 
        this.breadCrumbs.push(SETTINGS);
    }

    closeContextMenu()
    {
        this.element.style.display = 'none';
        this.opened = false;
        this.breadCrumbs = [];   // Reset menu history
    }
}