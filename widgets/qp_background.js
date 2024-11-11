/**
 * A class that defines the background of the player. I want this to be
 * fairly customizable.
 */
class QPBackground extends Drawable
{
    imgBackground = {}; // Image background can be moved around/positioned.
    scrimBackground = {}; // Filter background focused on color or transparency

    constructor(url, canvas, name, color, x, y, width, height)
    {
        super(canvas, name, color, x, y, width, height);
        this.imgBackground = new Drawable(
            this.canvas, 
            this.name + "_BACK", 
            undefined, 
            this.x, this.y, 
            this.width, this.height
        );
        this.setImage(url, true);

        this.scrimBackground = new Drawable(
            this.canvas,
            this.name + "_SCRIM",
            this.color,
            this.x, this.y,
            this.width, this.height
        );
    }

    //override
    drawFunction()
    {
        if (this.imgBackground && this.scrimBackground)
        {
            this.imgBackground.draw();
            this.scrimBackground.draw();
        }
    }

    //override
    setImage(url, constrain)
    {
        this.imgBackground.setImage(url, constrain);
    }

    //override
    setTransform(x, y, width, height)
    {
        super.setTransform(x, y, width, height);
        if (this.imgBackground && this.imgBackground.imageLoaded)
        {
            this.imgBackground.setTransform(this.x, this.y, this.width, this.height);
            this.width = this.imgBackground.width;
            this.height = this.imgBackground.height;
        }
    }

    /**
     * Set scrim to size and position for image
     */
    snapScrimToImage()
    {
        this.scrimBackground.setTransform(this.x, this.y, this.width, this.height);
    }

    /**
     * Set the scrim to a color. Also, change alpha here, for now.
     * @param {string} color A valid css color string 
     */
    setScrimColor(color)
    {
        this.scrimBackground.color = color;
    }

    /**
     * Set whether the image should be constrained{true} or not{false}
     * @param {bool} value 
     */
    setImageConstrainRatio(value)
    {
        this.imgBackground.setRatioConstraint(value);
    }

    /**
     * Get a handle to the scrim of the background
     * Note: A scrim is a layer above another used as a dark 
     * transparent background to overlay like text and stuff.
     * @returns a handle to the scrim of this background obj
     */
    getScrimBackground()
    {
        return this.scrimBackground;
    }

    /**
     * 
     * @returns a handle to the Image Drawable.
     * Note: Preferably this should only be used for customization purposes.
     * Default images should work by DEFAULT!
     */
    getImageBackground()
    {
        return this.imgBackground;
    }

    /**
     * Get the bounding box of the image set for this background.
     * @returns the bounding box of the image
     */
    getImageBounds()
    {
        return this.imgBackground.boundingBox;
    }
}