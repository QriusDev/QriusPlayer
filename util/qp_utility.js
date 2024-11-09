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