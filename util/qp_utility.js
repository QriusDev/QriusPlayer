/**
 * DEPRECATED
 * I was tired of putting in the transform values in every modified constructor
 * that extended from Drawable
 */
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

/**
 * Keep a number between a min and max value. If larger, jump to max value. If less, jump to min.
 * @param {number} min the lowest value we want to output
 * @param {number} max the highest value we want to output
 * @param {number} value the value we want to clamp
 * @returns value clamped between min and max
 */
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

/**
 * Convert a number of seconds into a time string that represents the seconds in
 * hours and minutes, depending on how long the time received.
 * @param {number} sec 
 * @returns formatted time string in format "HH:MM:SS"
 */
function secondsToTimeString(sec)
{
    var timeString = '';
    var currentTime = sec;
        
    // Respective timing in seconds
    var HOUR_TIME = 3600;
    var MINUTE_TIME = 60;

    var timer = [0, 0, 0]
    if (currentTime > HOUR_TIME)
    {
        var timeLeft = currentTime;
        while (timeLeft > HOUR_TIME)
        {
            timeLeft -= HOUR_TIME;
            ++timer[0];
        }

        currentTime -= HOUR_TIME * timer[0];    // Update the time we have left to check
    }
    if (currentTime > MINUTE_TIME)
    {
        var timeLeft = currentTime;
        while(timeLeft > MINUTE_TIME)
        {
            timeLeft -= MINUTE_TIME;
            ++timer[1];
        }
        
        currentTime -= MINUTE_TIME * timer[1];
    }
    timer[2] = currentTime // We should only have seconds now

    // finally, format text
    for (const count of timer)
    {
        if (count >= 10)
        {
            timeString += Math.floor(count);
        }
        else
        {
            timeString += '0' + Math.floor(count);
        }
        timeString += ':';
    }

    return timeString.slice(0, timeString.length - 1);
}