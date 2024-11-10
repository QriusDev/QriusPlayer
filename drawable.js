const DRAWABLE_DEFAULT_NAME = "DEFAULT";
const QPDrawList = [];
class Drawable
{
    #x = 0;
    #y = 0;
    #width = 0;
    #height = 0;
    #context = null;
    #color = "black";
    visible = true;
    #boundingBox = new BoundingBox();
    
    #hovered = false;

    image = undefined;
    imageLoaded = false;
    imageRatio = 1;
    imageRatioConstraint = true;

    canvas = undefined;
    name = "DEFAULT";
    DEBUG_DrawBoundingBox = false;
    DEBUG_FillBoundingBox = false;
    DEBUG_DrawNameTag = false;
    DEBUG_LineWidth = 1;
    DEBUG_HoverLineWidth = 3;
    DEBUG_TextSize = 10;
    DEBUG_HoverTextSize = 13;

    static ALL_FLAGS = "fbb,nt,sbb";

    constructor(canvas, name, color, x, y, width, height)
    {
        this.name = name || "DEFAULT";
        this.canvas = canvas;
        if (!canvas)
        {
            console.error(`A Drawable{${this.name}} is being built without a canvas.`);
        }
        else
        {
            this.setTransform(0, 0, 0, 0);
            this.color = color || "";
            this.context = this.canvas.getContext('2d');
            this.#boundingBox = BoundingBox.convertToBounds(this.x, this.y, this.width, this.height);
            QPDrawList.push(this);
            console.log(QPDrawList);
        }
    }

    draw()
    {
        this.#boundingBox = BoundingBox.convertToBounds(this.x, this.y, this.width, this.height);
        
        if (this.DEBUG_DrawBoundingBox)
        {
            this.#context.lineWidth = (this.#hovered) ? this.DEBUG_HoverLineWidth : this.DEBUG_LineWidth;

            if (this.DEBUG_FillBoundingBox)
            {
                this.#context.strokeStyle = "black";
                this.#context.fillRect(this.x, this.y, this.width, this.height);
            }

            this.#context.strokeStyle = "black";
            this.#context.strokeRect(this.x, this.y, this.width, this.height);

            if (this.DEBUG_DrawNameTag)
            {
                this.#context.fillStyle = "green";
                this.#context.textAlign = "center";
                var textSize = (this.#hovered) ? this.DEBUG_HoverTextSize : this.DEBUG_TextSize;
                this.#context.font = `${textSize}px serif`;
                this.#context.fillText(this.name, this.x + (this.#width/2), this.y - 3);
            }
        }
        
        if (this.visible)
        {
            this.context.save();
            if (this.imageLoaded)
            {
                this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
            }
            else
            {
                this.drawFunction();
            }
            this.context.restore();
        }
    }

    /**
     * Check whether the image's ratio is constrained
     * @returns whether this drawable's image's ratio is constrained
     */
    shouldConstrainRatio()
    {
        return this.imageRatioConstraint;
    }

    /**
     * Update the image's size based on its ratio.
     * @param {number} [threshold=0] the margin of error for the ratio check
     * @param {bool} [keepWidth=true] whether to keep width size and constrain the height or vice versa
     */
    constrainImageRatio(threshold=0, keepWidth=true)
    {
        if (this.imageLoaded && this.shouldConstrainRatio())
        {
            var originalRatio = this.imageRatio;
            var newWidth = this.width;
            var newHeight = this.height;

            var updatedWidth = false;
            if (this.height && !keepWidth && !Drawable.withinRatio(1 / originalRatio, this.width, this.height, threshold)) 
                        // width/height = ratio. Turn ratio to width. Turn ratio to height
                        // width = ratio*height; height = ratio/width;
                        // 500w:250h = 2 ratio (2:1) => 500w / 2 = 250h => 250h * 2 = 500w
                        // w:h = w/h ratio => w / ratio = h => h * ratio = w
            {
                newWidth = originalRatio * this.height;
                console.warn(`Image updated to constrain ratio: ow:${this.width} nw:${newWidth} rat:${originalRatio} eh:${newWidth / originalRatio} h:${this.height}`);
            }

            // Check that we have not resized yet since the re-ratio is already done.
            if (this.width && keepWidth && !Drawable.withinRatio(originalRatio, this.height, this.width, threshold))
            {
                newHeight = this.width / originalRatio;
                console.warn(`Image updated to constrain ratio: oh:${this.height} nh:${newHeight} rat:${originalRatio} ew:${newHeight * originalRatio} w: ${this.width}`);
            }
            
            // HACK: I have no clue why it keeps trying to re-ratio the image with a large threshold.
            // for now, I'll just assume it ratio's correctly the first time. For optimization.
            this.setShouldConstrainRatio(false);

            // Update new values
            this.width = newWidth;
            this.height = newHeight;
        }
    }

    /**
     * Check if a value falls within the ratio of another value
     * Note: assumes value to be the numerator position. Dividing ratio by 1 will reverse it
     * @param {number} ratio ratio to check
     * @param {number} value value to check
     * @param {number} known known value to check against
     * @param {number} threshold +/- threshold for non-exact checks (Default: 0)
     * @returns whether this value completes the ratio
     */
    static withinRatio(ratio, value, known, threshold=0)
    {
        var expectedKnown = ratio * value;
        return (known-threshold) <= expectedKnown && (known + threshold) >= expectedKnown;
    }

    /**
     * Update imageConstraint property. This will stop the drawable's image from resizing
     * when not given a well ratio'd width/height
     * @param {bool} value 
     */
    setShouldConstrainRatio(value)
    {
        this.imageRatioConstraint = value;
    }

    setImage(url, constrain)
    {
        if (url == '')
        {
            console.error(`Error: Attempted to set image to an empty string`)
            return;
        }

        if (!this.image)
        {
            this.image = new Image();
        }

        this.image.src = url;
        this.image.addEventListener('load', (ev) => {
            // Keep track of ratio so we can keep when given ambiguous height/width 
            this.imageRatio = this.image.width / this.image.height;
            if (this.width == 0)
            {
                this.width = this.image.width;
            }
            if (this.height == 0)
            {
                this.height = this.image.height;
            }
            this.imageLoaded = true;

            this.setShouldConstrainRatio(constrain);
        });
    }

    removeImage()
    {
        this.image.src = '';
        this.imageLoaded = false;
    }

    drawFunction()
    {
        this.context.fillStyle = this.#color;
        this.context.fillRect(this.x, this.y, this.width, this.height);

        return this;
    }

    enableDebugSettings(flags = Drawable.ALL_FLAGS)
    {
        if (flags)
        {
            var splitFlags = flags.split(',');
            for (const flag of splitFlags)
            {
                this.setDebugFlag(flag, true);
            }
        }
    }

    disableDebugSettings(flags = Drawable.ALL_FLAGS)
    {
        if (flags)
        {
            var splitFlags = flags.split(',');
            for (const flag of splitFlags)
            {
                this.setDebugFlag(flag, false);
            }
        }
    }

    setTransform(x, y, width, height)
    {
        this.x = x || this.x;
        this.y = y || this.y;
        this.width = width || this.width;
        this.height = height || this.height;

        this.constrainImageRatio(1);
    }

    // Set the debug flag
    //
    setDebugFlag(flag, newVal)
    {
        // activate flag
        switch(flag)
        {
            case 'fbb':
            {
                this.DEBUG_FillBoundingBox = newVal;
                console.debug(`[${this.name}] Set debug FillBoundingBox to ${newVal}`);
                break;
            }

            case 'sbb':
            {
                this.DEBUG_DrawBoundingBox = newVal;
                console.debug(`[${this.name}] Set debug DrawBoundingBox to ${newVal}`);
                break;
            }

            case 'nt':
            {
                this.DEBUG_DrawNameTag = newVal;
                console.debug(`[${this.name}] Set debug DrawNameTag to ${newVal}`);
                break;
            }

            default:
            {
                console.error('ERR: No such flag exists.');
                break;
            }
        }
    }

    onHover()
    {

    }

    setHovered(value)
    {
        this.hovered = value;
    }

    get hovered()
    {
        return this.#hovered;
    }

    set hovered(value)
    {
        this.#hovered = value;
    }

    get color()
    {
        return this.#color;
    }

    set color(value)
    {
        this.#color = value;
    }

    get width() 
    {
        return this.#width;
    }

    set width(width)
    {
        this.#width = width;
    }

    get height()
    {
        return this.#height;
    }

    set height(height)
    {
        this.#height = height;
    }

    get x()
    {
        return this.#x;
    }

    set x(value)
    {
        this.#x = value;
    }

    get y()
    {
        return this.#y;
    }

    set y(value)
    {
        this.#y = value;
    }

    get context()
    {
        return this.#context;
    }

    set context(value)
    {
        this.#context = value;
    }

    get boundingBox()
    {
        return this.#boundingBox;
    }

    set boundingBox(value)
    {
        this.#boundingBox = value;
    }
}

class Point
{
    x = 0;
    y = 0;

    constructor(x, y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }
}

class BoundingBox
{
    #topleft = new Point(); 
    #topright = new Point();
    #bottomleft = new Point();
    #bottomright = new Point();

    constructor(topleft, topright, bottomleft, bottomright)
    {
        this.#topleft = topleft || new Point();
        this.#topright = topright || new Point();
        this.#bottomleft = bottomleft || new Point();
        this.#bottomright = bottomright || new Point();
    }

    static convertToBounds(x, y, width, height)
    {
        var bounds = new BoundingBox();
        bounds.topleft = {x, y};
        bounds.topright = {x: x+width, y};
        bounds.bottomleft = {x, y: y+height};
        bounds.bottomright = {x: x+width, y: y+height};
        return bounds;
    }

    collidesWith(other)
    {
        return this.isOverlapping(other.topleft.x, other.topleft.y) ||
            this.isOverlapping(other.bottomright.x, other.bottomright.y) ||
            this.isOverlapping(other.topright.x, other.topright.y) ||
            this.isOverlapping(other.bottomleft.x, other.bottomleft.y);
    }

    // Returns whether this point is within our bounding box
    isOverlapping(x, y)
    {
        return (this.topleft.x <= x && this.topleft.y <= y) &&
                (this.bottomright.x >= x && this.bottomright.y >= y);
    }

    get topleft()
    {
        return this.#topleft;
    }

    set topleft(value)
    {
        this.#topleft = value;
    }

    get topright()
    {
        return this.#topright;
    }

    set topright(value)
    {
        this.#topright = value;
    }

    get bottomleft()
    {
        return this.#bottomleft;
    }

    set bottomleft(value)
    {
        this.#bottomleft = value;
    }

    get bottomright()
    {
        return this.#bottomright;
    }

    set bottomright(value)
    {
        this.#bottomright = value;
    }
}