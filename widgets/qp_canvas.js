/**
 * This class defines a canvas and how it will draw its components
 */
class QPCanvas
{
    handle = undefined;
    width = 0;
    height = 0;
    screen = [];    // Array<QPCanvasLayer> A representation of the screen filled with a list of QPCanvasLayers

    constructor(canvas, layerCount=10)
    {
        if (canvas)
        {
            this.handle = canvas;
            this.width = this.handle.clientWidth;
            this.height = this.handle.clientHeight;
        }

        // Initialize the screen with some layers
        for (var i=0; i < layerCount; ++i)
        {
            this.screen.push(new QPCanvasLayer());
        }
    }

    /**
     * Add a widget to desired layer.
     * NOTE: layer is 1-indexed, as its more intuitive imo.
     * @param {Drawable} widget the widget to add to the screen.
     * @param {number} layer the layer to add the widget to.
     * @param {Function} stateFunction the function that handles the state of the widget.
     */
    registerWidget(widget, layer=5, stateFunction)
    {
        if (layer <= this.screen.length && widget.draw)
        {
            if (!this.screen[layer-1].addWidget(widget, stateFunction))
            {
                console.error(`Layer{${layer}} is unavailable. Try to add to another layer.`);
            }
        }
        else
        {
            console.error('Invalid inputs. widget must have the draw function and layer must be with range of the layer count.')
        }
    }

    /**
     * Get the amount of layers canvas is currently managing.
     * @returns layer count
     */
    getLayerCount()
    {
        return this.screen.length;
    }

    /**
     * Get the canvas element handle
     * @returns handle to the canvas element
     */
    getCanvas()
    {
        return this.handle;
    }

    /**
     * Draw all layers in the screen list
     */
    draw()
    {
        if (this.handle)
        {
            for (const layer of this.screen)
            {
                layer.draw();
            }
        }
        else 
        {
            console.error('Tried to draw but no canvas handle has been received')
        }
    }

    /**
     * Get the layer at the very top
     * @returns 1-indexed last layer in the screen
     */
    getTopLayer()
    {
        return this.screen.length;
    }

    /**
     * Get the default layer
     * @returns 1-index default layer
     */
    getDefaultLayer()
    {
        return Math.floor(this.screen.length / 2);
    }
}

/**
 * A layer in the canvas
 */
class QPCanvasLayer
{
    drawArray = []; // The items to draw in this layer
    
    /**
     * Draw whatever is in the draw array
     */
    draw()
    {
        for (const tuple of this.drawArray)
        {
            if (tuple.widget.visible)
            {
                tuple.stateFunction(); // State function
                tuple.widget.draw();
            }
        }
    }

    /**
     * Add a widget to the drawArray
     * @param {Function} stateFunction what properties to specify. Animation should be able to be done here
     * @param {Drawable} widget a drawable
     * @returns whether the widget was successfully added
     */
    addWidget(widget, stateFunction)
    {
        // Check that its the right kind of object
        if (widget.draw)
        {
            var widgetInfo = {widget, stateFunction};
            this.drawArray.push(widgetInfo);
            // Tag with a destroy function
            widget.Destroy = () => {
                widget.visible = false;
                this.drawArray.splice(this.drawArray.length - 1);
            };
            return true;
        }
        else
        {
            return false;
        }
    }
}