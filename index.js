// Our main handle. Keep it here!
const canvas = document.getElementById("QriusPlayer");
const ctx = canvas.getContext('2d');
const vid = document.getElementById("QPVideo");
const contextMen = document.getElementById("QPContextMenu");

var forceDebugMode = true;
var inDebugMode = false;

function overrideDebugSettings(enable, value = Drawable.ALL_FLAGS)
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

ctx.save();

var seekerPosition = 0;
var seekerWidth = 25;
var seekerHeight = 25;

var seekerY = canvas.clientHeight - seekerHeight;
var seekerX = getTimelineWidth(canvas.clientWidth);

var mouseX = -1;
var mouseY = -1;
var dragging = false;

canvas.addEventListener("mousemove", setMousePosition, false);
canvas.addEventListener("mouseenter", setMousePosition, false);
canvas.addEventListener("mouseleave", setMousePosition, false);

canvas.addEventListener("click", checkClick, false);
canvas.addEventListener("contextmenu", onContextMenu, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);

class Seeker extends Drawable
{
    name = "Seeker Object";
    dragging = false;
}

class Timeline extends Drawable
{
    maxTime = 0;
    bufferTime = 0;

    seekTime = 0;
    seeker = new Seeker();
    seekX = 0;
    seekY = 0;
    loaded = false;

    name = "Timeline Object";

    drawFunction()
    {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw seeker
        var newSeekerPosition = clamp(this.x, this.x + this.width - seekerWidth, this.seekX);
        this.seeker.context = this.context;
        
        if (!vid.paused)
        {
            this.seeker.x = timeline.x + ((vid.currentTime / vid.duration) * timeline.width);
            this.seekX = timeline.x + ((vid.currentTime / vid.duration) * timeline.width);
        }
        else
        {
            this.seeker.x = clamp(timeline.x, timeline.x + timeline.width, newSeekerPosition);
            this.seekX = clamp(timeline.x, timeline.x + timeline.width, newSeekerPosition); // Why does this exist?
        }

        if (this.seeker.dragging)
        {
            this.seeker.x = clamp(timeline.x, timeline.x + timeline.width, mouseX);
            this.seekX = clamp(timeline.x, timeline.x + timeline.width, mouseX);
            this.seek(this.seeker.x);
        }

        this.seeker.y = this.y - (seekerHeight * 0.5);
        this.seeker.width = seekerWidth;
        this.seeker.height = seekerHeight;
        this.seeker.color = "#eaec70";
        this.seeker.draw();
    }

    load()
    {
        if (!this.loaded)
        {
            this.seekX = this.x;
            this.seekY = this.y;
            this.loaded = true;
            console.log(this.x, this.y, this.width, this.height);
            console.log("timeline loaded");
        }

    }

    setSeekerPosition(newPos)
    {
        this.seekX = newPos;
    }

    seek(destX)
    {
        var processedDest = clamp(timeline.x, timeline.x + timeline.width, destX);
        vid.currentTime = ((processedDest - timeline.x) / timeline.width) * vid.duration - 1;
        this.setSeekerPosition(processedDest);
    }
}
const timeline = new Timeline();

class VideoControls extends Drawable
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
const controls = new VideoControls();

const SETTINGS = "Settings";
const SETTINGS_QUALITY = "Quality";
const SETTINGS_SPEED = "Speed";
const SETTINGS_DOWNLOAD = "Download";
const SETTINGS_TOGGLE_DEBUG_MODE = "Debug";
const MENU_BACK = "Back"; // I suspect we might have different types of parent menus
class VideoSettings extends Drawable
{
    opened = false;
    settingsList = [ SETTINGS_TOGGLE_DEBUG_MODE, SETTINGS_QUALITY, SETTINGS_SPEED, SETTINGS_DOWNLOAD, MENU_BACK ];
}
const settings = new VideoSettings();

function getTimelineWidth(canvasWidth)
{
    return canvasWidth * 0.75;
}

function getTimelineHeight(canvasHeight)
{
    return canvasHeight - 10;
}

function draw()
{
    if (ctx)
    {
        //console.log('browser supported');

        var timelineX = 75;
        ctx.clearRect(0, 0, 640, 360);

        // Timeline
        timeline.load();
        timeline.context = ctx;
        timeline.x = timelineX;
        timeline.y = getTimelineHeight(canvas.clientHeight);
        timeline.width = getTimelineWidth(canvas.clientWidth);
        timeline.height = 10;
        timeline.color = "#b1b1b1";
        timeline.draw();

        // Seeker Tail
        ctx.fillStyle = "#eaec70";
        ctx.fillRect(timelineX, getTimelineHeight(canvas.clientHeight), timeline.seeker.x - timelineX, getTimelineHeight(canvas.clientHeight));

        //controls.load();
        controls.context = ctx;
        controls.width = 25;
        controls.height = 25;

        // padding
        var paddingX = 10;
        var paddingY = 5;

        controls.x = timeline.x - 25 + (-paddingX);
        controls.y = timeline.y - (controls.height / 2) + (-paddingY);
        controls.color = "black";
        controls.draw();

        settings.context = ctx;
        settings.x = timeline.x + timeline.width + paddingX;
        settings.y = controls.y;
        settings.width = controls.width;
        settings.height = controls.height;
        settings.color = "orange";
        settings.draw();

        window.requestAnimationFrame(draw);
    }
    else
    {
        console.error('err: browser not supported or something else went wrong.');
    }
}

var overlaying = false;
var startingPosition = {
    left: canvas.style.left,
    top: canvas.style.top,
    width: canvas.style.width,
    height: canvas.style.height
};
function toggleOverlay()
{
    if (!overlaying)
    {
        var vidlocation = vid.getBoundingClientRect();
        canvas.style.left = vidlocation.left + "px";
        canvas.style.top = vidlocation.top + "px";
        canvas.style.width = vidlocation.width + "px";
        canvas.style.height = vidlocation.height + "px";
        overlaying = true;
    }
    else
    {
        canvas.style.left = startingPosition.left;
        canvas.style.top = startingPosition.top;
        canvas.style.width = startingPosition.width;
        canvas.style.height = startingPosition.height;
        overlaying = false;
    }
    
    console.log("Overlay toggled");
}

function setMousePosition(event)
{
    var rect = canvas.getBoundingClientRect();
    mouseX = event.pageX - rect.left;
    mouseY = event.pageY - rect.top;

    QPDispatchHoverEvents(mouseX, mouseY);
}

function QPDispatchHoverEvents(mX, mY)
{
    var itemsHovered = 0;
    for (const item of QPDrawList)
    {
        let isHovering = item.boundingBox.residesWithin(mX, mY);
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

function checkClick(event)
{
    var handled = false;
    if (timeline.hovered)
    {
        timeline.setSeekerPosition(mouseX);
        handled = true;
    }
    if (controls.hovered)
    {
        controls.togglePause();
        console.log("controls: paused toggled");
        handled = true;
    }
    if (settings.hovered)
    {
        onContextMenu(event);
        handled = true;
    }

    if (!handled && settings.opened)
    {
        closeContextMenu();
    }
}

function onContextMenu(event)
{
    if (settings.opened)
    {
        closeContextMenu();
    }
    else
    {
        openContextMenu();
    }

    console.log(`Context menu toggled`);
}

function openContextMenu()
{
    loadContextMenu();

    var bnds = canvas.getBoundingClientRect();
    var itemCount = 4;
    contextMen.style.top = (bnds.top + (settings.y - settings.height * itemCount)) + "px";
    contextMen.style.left = bnds.left + settings.x +"px";
    contextMen.style.display = 'block';
    settings.opened = true;
}

function closeContextMenu()
{
    contextMen.style.display = 'none';
    settings.opened = false;
}

function onMouseDown(event)
{
    if (timeline.hovered)
    {
        timeline.seek(mouseX);
    }
    if (timeline.seeker.hovered)
    {
        timeline.seek(mouseX);
        timeline.seeker.dragging = true;
    }
}

function onMouseUp(event)
{
    timeline.seeker.dragging = false;
}


const menuBreadcrumbs = [SETTINGS];
function backtrack(count = 1)
{
    // remove from list
    menuBreadcrumbs.splice(menuBreadcrumbs.length - count);
    loadMenu();
}

function loadContextMenu()
{
    var list = contextMen.children[0];
    list.innerHTML = "";
    // Fill context menu with settings
    for (const setting of settings.settingsList)
    {
        var settingsItem = document.createElement("li");
        settingsItem.textContent = setting;
        settingsItem.classList.add("QPListItem");
        settingsItem.addEventListener('click', onContextMenuAction);
        list.appendChild(settingsItem);
    }

    // Hide error
    var errItem = document.getElementsByClassName("QPError")[0];
    if (errItem)
    {
        errItem.style.display = 'none';
    }
}

function loadQualityMenu()
{
    var list = contextMen.children[0];
    list.innerHTML = "";
    // Fill context menu with settings
    for (const setting of settings.settingsList)
    {
        var settingsItem = document.createElement("li");
        settingsItem.textContent = setting;
        settingsItem.classList.add("QPListItem");
        settingsItem.addEventListener('click', onContextMenuAction);
        list.appendChild(settingsItem);
    }

    var backItem = document.createElement("li");
    backItem.textContent = back;
    backItem.classList.add("QPListItem");
    backItem.addEventListener('click', )
    list.appendChild(backItem);
}

function onClickBackItem(event)
{
    if (menuBreadcrumbs.length < 2)
    {
        closeContextMenu();
        return;
        //backtrack();
    }

    var currentMenu = menuBreadcrumbs.pop();
    loadMenu();
}

function toggleDebugMode()
{
    console.log(inDebugMode);
    if (inDebugMode)
    {
        overrideDebugSettings(false);
        inDebugMode = false;
    }
    else
    {
        overrideDebugSettings(true);
        inDebugMode = true;
    }
    return;
}

function loadMenu()
{
    var menuChange = false;
    if (menuBreadcrumbs.length < 0)
    {
        console.error("Using breadcrumbs when a menu has not been loaded.")
        return;
    }
    switch (menuBreadcrumbs[menuBreadcrumbs.length - 1])
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
            var item = document.getElementById("QPVideo");
            var sourceItem = item.querySelector('source');
            var evoker = document.createElement('a');
            evoker.href = sourceItem.src;
            evoker.download = sourceItem.src;
            evoker.style.display = 'none';
            document.body.appendChild(evoker);
            evoker.click();
            document.body.removeChild(evoker);
            console.log('Downloading video');
            break;
        }
        case SETTINGS_TOGGLE_DEBUG_MODE:
        {
            toggleDebugMode();
            break;
        }

        case MENU_BACK:
        {
            onClickBackItem();
            break;
        }
    }

    return menuChange;
}

function onContextMenuAction(event)
{
    var item = event.srcElement;
    var action = item.textContent;
    var menuRequested = false;
    
    menuBreadcrumbs.push(action);
    menuRequested = loadMenu();
    console.log(menuRequested);
    
    // Close menu if we haven't asked for another one, for this action
    if (!menuRequested)
    {
        closeContextMenu();
    }
}

//function checkWithinBounds(instX, instY, )
//document.body.appendChild(controls.img);
//window.addEventListener('load', draw);
window.requestAnimationFrame(draw);
loadContextMenu();