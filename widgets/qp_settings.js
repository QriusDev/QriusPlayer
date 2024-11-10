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