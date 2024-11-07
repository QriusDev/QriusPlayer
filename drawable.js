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
    #boundingBox = new BoundingBox();
    
    #hovered = false;
    name = "DEFAULT";
    DEBUG_DrawBoundingBox = false;
    DEBUG_FillBoundingBox = false;
    DEBUG_DrawNameTag = false;
    DEBUG_LineWidth = 1;
    DEBUG_HoverLineWidth = 3;
    DEBUG_TextSize = 10;
    DEBUG_HoverTextSize = 13;

    static ALL_FLAGS = "fbb,nt,sbb";

    constructor(name, context, color)
    {
        this.name = name || "DEFAULT";
        this.setTransform(0, 0, 0, 0);
        this.color = color || "";
        this.context = context || undefined;
        this.#boundingBox = BoundingBox.convertToBounds(this.x, this.y, this.width, this.height);
        QPDrawList.push(this);
        console.log(QPDrawList);
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
        
        this.context.save();
        this.drawFunction();
        this.context.restore();
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
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
                console.log(`[${this.name}] Set debug FillBoundingBox to ${newVal}`);
                break;
            }

            case 'sbb':
            {
                this.DEBUG_DrawBoundingBox = newVal;
                console.log(`[${this.name}] Set debug DrawBoundingBox to ${newVal}`);
                break;
            }

            case 'nt':
            {
                this.DEBUG_DrawNameTag = newVal;
                console.log(`[${this.name}] Set debug DrawNameTag to ${newVal}`);
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
        return this.residesWithin(other.topleft.x, other.topleft.y) ||
            this.residesWithin(other.bottomright.x, other.bottomright.y) ||
            this.residesWithin(other.topright.x, other.topright.y) ||
            this.residesWithin(other.bottomleft.x, other.bottomleft.y);
    }

    // Returns whether this point is within our bounding box
    residesWithin(x, y)
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