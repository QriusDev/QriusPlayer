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
 * Utility class
 */
class QPUtility
{
    /**
     * Keep a number between a min and max value. If larger, jump to max value. If less, jump to min.
     * @param {number} min the lowest value we want to output
     * @param {number} max the highest value we want to output
     * @param {number} value the value we want to clamp
     * @returns value clamped between min and max
     */
    static clamp(min, max, value)
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
    static secondsToTimeString(sec)
    {
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = sec % 60;
  
      let hrs = Math.floor(h) > 0 ? Math.floor(h) + ":" : "";
      let mins = 
          Math.floor(h) > 0 
              ? Math.floor(m).toString().padStart(2, "0")
              : Math.floor(m).toString().padStart(1, "0");
      let secs = Math.floor(s).toString().padStart(2, "0");
  
      return `${hrs}${mins}:${secs}`;
    }

    /**
     * Set a cookie
     * Yoinked from: https://www.w3schools.com/js/js_cookies.asp
     * @param {string} cname cookie name
     * @param {string} cvalue cookie value
     * @param {number} exdays how many days for expiry
     */
    static setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      let expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    /**
     * Get a cookie
     * Yoinked from: https://www.w3schools.com/js/js_cookies.asp
     * @param {string} cname cookie name
     * @returns cookie value
     */
    static getCookie(cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
}