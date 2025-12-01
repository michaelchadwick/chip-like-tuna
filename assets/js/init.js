/* init */
/* set up main JS object */
/* global $ */

// main object
var CLT = {}

// CLT properties
CLT.url = ''
CLT.screen = $('section#screen')
CLT.ajaxImgRequest = null
CLT.tvNoiseCycleId = null
/* eslint-disable key-spacing */
CLT.audioPaths = {
  misc: {
    mp3: {
      'test30s-1': 'assets/audio/misc/mp3/testsong-30s-1.mp3',
      'test30s-2': 'assets/audio/misc/mp3/testsong-30s-2.mp3',
      'test30s-3': 'assets/audio/misc/mp3/testsong-30s-3.mp3',
      test2m: 'assets/audio/misc/mp3/testsong-2m.mp3',
      test4m: 'assets/audio/misc/mp3/testsong-4m.mp3',
    },
  },
  noise: {
    mp3: 'assets/audio/noise/mp3/noise.mp3',
    ogg: 'assets/audio/noise/ogg/noise.ogg',
    wav: 'assets/audio/noise/wav/noise.wav',
  },
  scenes: {
    mp3: {
      16: 'assets/audio/scenes/mp3/clt-16-abr.mp3',
      24: 'assets/audio/scenes/mp3/clt-24-abr.mp3',
      32: 'assets/audio/scenes/mp3/clt-32-abr.mp3',
      64: 'assets/audio/scenes/mp3/clt-64-abr.mp3',
      128: 'assets/audio/scenes/mp3/clt-128-abr.mp3',
      192: 'assets/audio/scenes/mp3/clt-192-abr.mp3',
      '192vbr': 'assets/audio/scenes/mp3/clt-192-vbr.mp3',
    },
    ogg: {
      1: 'assets/audio/scenes/ogg/clt-q1.ogg',
      2: 'assets/audio/scenes/ogg/clt-q2.ogg',
      3: 'assets/audio/scenes/ogg/clt-q3.ogg',
      4: 'assets/audio/scenes/ogg/clt-q4.ogg',
      5: 'assets/audio/scenes/ogg/clt-q5.ogg',
    },
    opus: {
      20: 'assets/audio/scenes/opus/clt-20-cvbr.opus',
      24: 'assets/audio/scenes/opus/clt-24-cvbr.opus',
      32: 'assets/audio/scenes/opus/clt-32-cvbr.opus',
      48: 'assets/audio/scenes/opus/clt-48-cvbr.opus',
      56: 'assets/audio/scenes/opus/clt-56-cvbr.opus',
      64: 'assets/audio/scenes/opus/clt-64-cvbr.opus',
      96: 'assets/audio/scenes/opus/clt-96-cvbr.opus',
    },
    wav: 'assets/audio/scenes/wav/clt.wav',
  },
  unwound: {
    mp3: {
      16: 'assets/audio/unwound/mp3/clt-16-abr.mp3',
      24: 'assets/audio/unwound/mp3/clt-24-abr.mp3',
      32: 'assets/audio/unwound/mp3/clt-32-abr.mp3',
      64: 'assets/audio/unwound/mp3/clt-64-abr.mp3',
      128: 'assets/audio/unwound/mp3/clt-128-abr.mp3',
      192: 'assets/audio/unwound/mp3/clt-192-abr.mp3',
      '192vbr': 'assets/audio/unwound/mp3/clt-192-vbr.mp3',
    },
    ogg: {
      1: 'assets/audio/unwound/ogg/clt-q1.ogg',
      2: 'assets/audio/unwound/ogg/clt-q2.ogg',
      3: 'assets/audio/unwound/ogg/clt-q3.ogg',
      4: 'assets/audio/unwound/ogg/clt-q4.ogg',
      5: 'assets/audio/unwound/ogg/clt-q5.ogg',
    },
    opus: {
      20: 'assets/audio/unwound/opus/clt-20-cvbr.opus',
      24: 'assets/audio/unwound/opus/clt-24-cvbr.opus',
      32: 'assets/audio/unwound/opus/clt-32-cvbr.opus',
      48: 'assets/audio/unwound/opus/clt-48-cvbr.opus',
      56: 'assets/audio/unwound/opus/clt-56-cvbr.opus',
      64: 'assets/audio/unwound/opus/clt-64-cvbr.opus',
      96: 'assets/audio/unwound/opus/clt-96-cvbr.opus',
    },
    wav: 'assets/audio/unwound/wav/clt.wav',
  },
}
/* eslint-disable key-spacing */

// status messages
CLT.SOUND_STATUS_PLAYING = 'playing'
CLT.SOUND_STATUS_STOPPED = 'stopped/finished'
CLT.SOUND_STATUS_PAUSED = 'paused'
CLT.SOUND_STATUS_UNLOADED = 'unloaded'
CLT.SOUND_STATUS_LOADING = 'loading...'
CLT.SOUND_STATUS_LOADED = 'loaded and ready'
CLT.SOUND_STATUS_ERROR = 'error decoding file'
CLT.SOUND_STATUS_I_AM_ERROR = 'i am error'
CLT.NOISE_WIDTH_DEFAULT = 200
CLT.NOISE_HEIGHT_DEFAULT = 150

// file paths
CLT.SOUND_FILE_PATH = CLT.audioPaths.scenes.opus['48']
//CLT.SOUND_FILE_PATH = CLT.audioPaths.misc.mp3['test2m']

// html elements
CLT.PLAYER_ELEMENT = document.querySelector('.player')

// jQuery extension to get class names from an element
$.fn.classList = function () {
  return this[0].className.split(/\s+/)
}
// jQuery extension to parse url querystring
$.QueryString = (function (a) {
  if (a === '') return {}
  var b = {}
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split('=', 2)
    if (p.length !== 2) {
      continue
    }
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '))
  }
  return b
})(window.location.search.substr(1).split('&'))
