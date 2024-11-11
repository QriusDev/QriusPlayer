// Our main handle. Keep it here!
const canvas = document.getElementById("QriusPlayer");
const vid = document.getElementById("QPVideo");

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
const QPlayer = new MediaPlayer(canvas, new MediaObject(vid));

// Set the image of the seeker
QPlayer.setSeekerImage('/assets/shield.png', 500, 500, true);

// Get the overlay toggle in this demo and bind the toggle method with it
const overlayToggle = document.getElementById('debug_toggle');
overlayToggle.addEventListener('click', QPlayer.toggleOverlay.bind(QPlayer));

QPlayer.BeginDraw();