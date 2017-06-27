/* bootstrap */
/* set up main JS object */

var CLT = {};
CLT.url = '';
CLT.ajaxImgRequest = null;

var SND_STATUS_PLAYING = 'playing';
var SND_STATUS_STOPPED = 'stopped/finished';
var SND_STATUS_PAUSED = 'paused';
var SND_STATUS_UNLOADED = 'unloaded';
var SND_STATUS_LOADING = 'loading...';
var SND_STATUS_LOADED = 'loaded and ready';
var SND_STATUS_ERROR = 'error decoding file';
var SOUND_FILE_PATH = 'assets/audio/chip_like_tuna.mp3';
var PLAYER_ELEMENT = document.querySelector('.player');

$.fn.classList = function() {return this[0].className.split(/\s+/);};
