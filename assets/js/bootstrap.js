/* bootstrap */
/* set up main JS object */

var CLT = {};
CLT.url = '';
CLT.screen = $('section#screen');
CLT.ajaxImgRequest = null;
CLT.tvNoiseCycleId = null;

// status messages
var SOUND_STATUS_PLAYING    = 'playing';
var SOUND_STATUS_STOPPED    = 'stopped/finished';
var SOUND_STATUS_PAUSED     = 'paused';
var SOUND_STATUS_UNLOADED   = 'unloaded';
var SOUND_STATUS_LOADING    = 'loading...';
var SOUND_STATUS_LOADED     = 'loaded and ready';
var SOUND_STATUS_ERROR      = 'error decoding file';
var NOISE_WIDTH_DEFAULT     = 200;
var NOISE_HEIGHT_DEFAULT    = 150;

// file paths
var SOUND_FILE_PATH         = 'assets/audio/chip_like_tuna.mp3';

// html elements
var PLAYER_ELEMENT          = document.querySelector('.player');

// jQuery extension to get class names from an element
$.fn.classList = function() {return this[0].className.split(/\s+/);};
