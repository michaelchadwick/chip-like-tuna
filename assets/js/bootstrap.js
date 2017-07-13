/* bootstrap */
/* set up main JS object */

var CLT = {};
CLT.url = '';
CLT.screen = $('section#screen');
CLT.ajaxImgRequest = null;
CLT.tvNoiseCycleId = null;
CLT.audioPaths = {
  'mp3': {
    'clt': {
      '16':         'assets/audio/mp3/clt-16-abr.mp3',
      '24':         'assets/audio/mp3/clt-24-abr.mp3',
      '32':         'assets/audio/mp3/clt-32-abr.mp3',
      '64':         'assets/audio/mp3/clt-64-abr.mp3',
      '128':        'assets/audio/mp3/clt-128-abr.mp3',
      '192':        'assets/audio/mp3/clt-192-abr.mp3',
      '192vbr':     'assets/audio/mp3/clt-192-vbr.mp3'
    },
    'misc': {
      'test30s-1':  'assets/audio/mp3/testsong-30s-1.mp3',
      'test30s-2':  'assets/audio/mp3/testsong-30s-2.mp3',
      'test30s-3':  'assets/audio/mp3/testsong-30s-3.mp3',
      'test2m':     'assets/audio/mp3/testsong-2m.mp3',
      'test4m':     'assets/audio/mp3/testsong-4m.mp3'
    },
    'noise':        'assets/audio/mp3/noise.mp3'
  },
  'ogg': {
    'clt': {
      '1':          'assets/audio/ogg/clt-q1.ogg',
      '2':          'assets/audio/ogg/clt-q2.ogg',
      '3':          'assets/audio/ogg/clt-q3.ogg',
      '4':          'assets/audio/ogg/clt-q4.ogg',
      '5':          'assets/audio/ogg/clt-q5.ogg'
    },
    'noise':        'assets/audio/ogg/noise.ogg'
  },
  'opus': {
    'clt': {
      '20':           'assets/audio/opus/clt-20-cvbr.opus',
      '24':           'assets/audio/opus/clt-24-cvbr.opus',
      '32':           'assets/audio/opus/clt-32-cvbr.opus',
      '48':           'assets/audio/opus/clt-48-cvbr.opus',
      '56':           'assets/audio/opus/clt-56-cvbr.opus',
      '64':           'assets/audio/opus/clt-64-cvbr.opus',
      '96':           'assets/audio/opus/clt-96-cvbr.opus'
    }
  },
  'wav': {
    'clt':          'assets/audio/wav/clt.wav',
    'noise':        'assets/audio/wav/noise.wav'
  }
};

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
var SOUND_FILE_PATH         = CLT.audioPaths.opus.clt['48'];

// html elements
var PLAYER_ELEMENT          = document.querySelector('.player');

// jQuery extension to get class names from an element
$.fn.classList = function() {return this[0].className.split(/\s+/);};
