// Our main handle. Keep it here!
const canvas = document.getElementById("QriusPlayer");
const vid = document.getElementById("QPVideo");

const SETTINGS = "Settings";
const SETTINGS_QUALITY = "Quality";
const SETTINGS_SPEED = "Speed";
const SETTINGS_DOWNLOAD = "Download";
const SETTINGS_TOGGLE_DEBUG_MODE = "Debug";
const MENU_BACK = "Back"; // I suspect we might have different types of parent menus

const QPlayer = new MediaPlayer(canvas, new MediaObject(vid));
QPlayer.setSeekerImage('/assets/shield.png', 500, 500, true);

const overlayToggle = document.getElementById('debug_toggle');
overlayToggle.addEventListener('click', QPlayer.toggleOverlay.bind(QPlayer));

QPlayer.BeginDraw();