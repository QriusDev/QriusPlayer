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