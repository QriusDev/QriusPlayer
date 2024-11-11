/**
 * A text drawable used to create and manipulate on-screen text.
 */
class TextField extends Drawable
{
    label = ''; // What will the textfield show
    font = '20px serif';
    isTextFilled = true;

    constructor(canvas, label, name, color, x, y, width, height)
    {
        super(canvas, name, color, x, y, width, height);
        this.label = label;
    }

    //override
    drawFunction()
    {
        if (this.context && this.label)
        {
            this.context.font = this.font;
            this.context.fillStyle = this.color;
            if (this.isTextFilled)
            {
                this.context.fillText(this.label, this.x, this.y, this.width);
            }
            else
            {
                this.context.strokeText(this.label, this.x, this.y, this.width);
            }
        }
    }

    /**
     * Set whether the text is drawn filled in.
     * @param {bool} value whether the text should be drawn filled in or not 
     */
    setTextFillType(value)
    {
        this.isTextFilled = value;
    }

    /**
     * Set the font color
     * @param {string} color a valid css color string 
     */
    setFontColor(color)
    {
        this.color = color;
    }

    /**
     * Set the font
     * @param {string} font a valid css font string
     */
    setFont(font)
    {
        this.font = font;
    }

    /**
     * Set what appears for text
     * @param {string} value 
     */
    setLabel(value)
    {
        this.label = value;
    }

    /**
     * Get the text this textfield will display
     * @returns the text being shown by this textfield
     */
    getLabel()
    {
        return this.label;
    }
}