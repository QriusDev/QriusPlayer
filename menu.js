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
    }

    openContextMenu()
    {
        this.loadMenu();

        var bnds = this.canvas.getBoundingClientRect();
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