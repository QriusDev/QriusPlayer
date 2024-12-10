const CANVAS_ID = "QriusPlayer";
const FILE_IMPORT_ID = "QImportMedia";
const PLAYLIST_COOKIE_KEY = "playlist_path";

// Our main handle. Keep it here!
const canvas = document.getElementById(CANVAS_ID);

/**
 * These should be moved to a constants.js or something
 */
const SETTINGS = "Settings";
const SETTINGS_QUALITY = "Quality";
const SETTINGS_SPEED = "Speed";
const SETTINGS_DOWNLOAD = "Download";
const SETTINGS_TOGGLE_DEBUG_MODE = "Debug";
const MENU_BACK = "Back"; // I suspect we might have different types of parent menus

// Create the media player
const QPlayer = new MediaPlayer(canvas);

// Set the image of the seeker
QPlayer.setSeekerImage('/assets/shield.png', 500, 500, true);

QPlayer.BeginDraw();