$(function() {
  /*******************
    Global Constants
  ********************/
  var SND_STATUS_PLAYING = 'playing';
  var SND_STATUS_STOPPED = 'stopped/finished';
  var SND_STATUS_PAUSED = 'paused';
  var SND_STATUS_UNLOADED = 'unloaded';
  var SND_STATUS_LOADING = 'loading...';
  var SND_STATUS_LOADED = 'loaded and ready';
  var SND_STATUS_ERROR = 'error decoding file';
  var SONG_FILE_PATH = 'assets/audio/chip_like_tuna.mp3';

  /* main JS object for app */
  var ChipLikeTuna = (function () {
    // private
    var _soundPlayerArray = []; // holds all the existing SPs
    var _audioContext = function() {
      var ac = null;
      if ( !window.AudioContext && !window.webkitAudioContext ) {
        console.warn('Web Audio API not supported in this browser');
      } else {
        ac = new ( window.AudioContext || window.webkitAudioContext )();
      }
      return function() {
        return ac;
      };
    }();
    var _getSoundChannelsMin = function(sndArr) {
      var sndChannelsArr = [];
        sndArr.forEach(function(snd) {
          sndChannelsArr.push(snd.audioBuffer.numberOfChannels);
      });
      return Math.min.apply(Math, sndChannelsArr);
    }

    // public
    var getAudioContext = function() {
      return _audioContext();
    }

    return {
      getAudioContext: getAudioContext
    }
  })();

  var SoundPlayer = function() {
    //// Variables
    var curSP = this;
    this.soundId = 'chipLikeTuna';
    this.audioContext = ChipLikeTuna.getAudioContext();
    this.gainNode = this.audioContext.createGain();
    this.audioBuffer = null;
    this.source = null;
    this.startTime = 0;
    this.startOffset = 0;
    this.isPaused = false;
    this.isStopped = true;
    this.isPlaying = false;

    //// Methods

    // change the internal gain node value
    var changeVolume = function(element) {
      var volume = element.srcElement.value;
      var volumeMax = element.srcElement.max;
      var fraction = parseInt(volume) / parseInt(volumeMax);

      curSP.gainNode.gain.value = fraction * fraction;
    };

    // initialize the volume to the range element's value
    var initVolume = function(element) {
      var volume = element.value;
      var volumeMax = element.max;
      var fraction = parseInt(volume) / parseInt(volumeMax);

      curSP.gainNode.gain.value = fraction * fraction;
    }

    // update the volume label
    var updateVolumeLabel = function(e) {
      var rangeVolN = e.srcElement;
      var sId = this.id.split("rngVolume")[1];
      var lblVolumeId = "lblVolume".concat(sId);
      var lblVolumeN = document.getElementById(lblVolumeId);
      var newVol = rangeVolN.value;
      if (newVol < 100) newVol = "0" + newVol;
      if (newVol < 10) newVol = "0" + newVol;
      lblVolumeN.innerText = newVol;
    };

    // update the current sound status label
    var updateSoundStatus = function(sId, status) {
      var curSoundStatusId = "soundStatus".concat(sId);
      var curSoundStatusN = document.getElementById(curSoundStatusId);
      curSoundStatusN.innerText = status;
      var curSoundStatus = document.getElementById("sound" + sId);
      if (status == SND_STATUS_LOADING) {
        curSoundStatus.className = '';
        curSoundStatus.classList.add('loading');
      } else if (status == SND_STATUS_PAUSED || status == SND_STATUS_STOPPED) {
        curSoundStatus.className = '';
        curSoundStatus.classList.add("loaded");
      } else if (status == SND_STATUS_PLAYING) {
        curSoundStatus.className = '';
        curSoundStatus.classList.add("playing");
      } else if (status == SND_STATUS_LOADED) {
        curSoundStatus.className = '';
        curSoundStatus.classList.add("loaded");
      }
    };

    // play the sound from a specific startOffset
    var playSound = function(snd) {
      snd.startTime = snd.audioContext.currentTime;

      if(!snd.audioContext.createGain) {
        snd.audioContext.createGain = snd.audioContext.createGainNode;
      }
      snd.gainNode = snd.audioContext.createGain();
      initVolume(snd.rngVolume);

      snd.source = snd.audioContext.createBufferSource();
      snd.source.buffer = snd.audioBuffer;

      var soundPlayerN = snd;
      snd.source.onended = function() {
        var pauseOrStopStatus = soundPlayerN.isPaused ? SND_STATUS_PAUSED : SND_STATUS_STOPPED;
        if (pauseOrStopStatus == SND_STATUS_STOPPED) {
          soundPlayerN.isStopped = true;
          soundPlayerN.isPaused = false;
          soundPlayerN.isPlaying = false;
          soundPlayerN.startOffset = 0;
        }
        updateSoundStatus(soundPlayerN.soundId, pauseOrStopStatus);
      };

      snd.source.connect(snd.gainNode);
      snd.gainNode.connect(snd.audioContext.destination);
      snd.source.loop = false;

      snd.source.start(0, snd.startOffset % snd.audioBuffer.duration);

      snd.isStopped = false;
      snd.isPaused = false;

      updateSoundStatus(snd.soundId, SND_STATUS_PLAYING);
    };

    // pause the sound and record its currentTime
    var pauseSound = function(snd) {
      snd.source.stop();
      snd.isPaused = true;
      snd.startOffset += snd.audioContext.currentTime - snd.startTime;

      updateSoundStatus(snd.soundId, SND_STATUS_PAUSED);
    };

    // stop playing the sound
    var stopSound = function() {
      curSP.startOffset = 0;
      curSP.source.stop();
      curSP.isPlaying = false;
      curSP.isPaused = false;
      curSP.isStopped = true;

      updateSoundStatus(curSP.soundId, SND_STATUS_STOPPED);
    };

    // when the play/pause button is pressed, toggle the current sound's status
    var togglePlayState = function() {
      // if playing, pause and capture currentTime; if not, then play from startOffset
      curSP.isPlaying ? pauseSound(curSP) : playSound(curSP);
      // flip playing mode status
      curSP.isPlaying = !curSP.isPlaying;
    };

    // load audio data into buffer
    var loadAudioData = function() {
      var audioCtx = curSP.audioContext;
      var source = curSP.audioContext.createBufferSource();
      var sId = curSP.soundId;
      var request = new XMLHttpRequest();
      request.open('GET', SONG_FILE_PATH, true);
      request.responseType = 'arraybuffer';

      request.onloadstart = function() {
        updateSoundStatus(curSP.soundId, SND_STATUS_LOADING);
      },
      request.onload = function() {
        var audioData = request.response;
        audioCtx.decodeAudioData(audioData, function(buffer) {
          //source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.loop = false;
          curSP.audioBuffer = buffer;
          var btnP = document.getElementById("btnPlay" + sId);
          var btnS = document.getElementById("btnStop" + sId);
          btnP.disabled = false;
          btnS.disabled = false;
          updateSoundStatus(sId, SND_STATUS_LOADED);
        },
        function(e) {
          console.error("Error with decoding audio data" + e.err);
        });
      }
      request.send();
    }

    /*******************
    ** User Interface **
    *******************/
    this.soundDiv = document.createElement('div');
    this.soundHeader = document.createElement('div');
    this.soundStatus = document.createElement('div');
    this.rngVolume = document.createElement('input');
    this.lblVolume = document.createElement('label');
    this.btnDiv = document.createElement('div');
    this.btnPlay = document.createElement('button');
    this.btnStop = document.createElement('button');

    this.soundDiv.classList.add('sound');
    this.soundDiv.id = "sound" + this.soundId;
    this.soundHeader.classList.add("sound-header");
    this.soundHeader.innerText = this.soundId;
    this.soundStatus.id = "soundStatus" + this.soundId;
    this.soundStatus.classList.add('sound-status');
    this.soundStatus.innerText = SND_STATUS_UNLOADED;

    this.rngVolume.id = "rngVolume" + this.soundId;
    this.rngVolume.type = "range";
    this.rngVolume.min = 0;
    this.rngVolume.max = 100;
    this.rngVolume.value = 75;
    this.rngVolume.addEventListener('input', changeVolume);
    this.rngVolume.addEventListener('change', updateVolumeLabel);

    this.lblVolume.id = "lblVolume" + this.soundId;
    var initVol = this.rngVolume.value;
    if (initVol < 100) initVol = "0" + initVol;
    if (initVol < 10) initVol = "0" + initVol;
    this.lblVolume.innerText = initVol;

    this.btnPlay.id = "btnPlay" + this.soundId;
    this.btnPlay.innerText = "> / ||";
    this.btnPlay.addEventListener('click', togglePlayState);
    this.btnPlay.disabled = true;

    this.btnStop.id = "btnStop" + this.soundId;
    this.btnStop.innerText = " [] ";
    this.btnStop.addEventListener('click', stopSound);
    this.btnStop.disabled = true;

    var divSong = document.getElementById("song");
    divSong.appendChild(this.soundDiv);
    this.soundDiv.appendChild(this.soundHeader);
    this.soundDiv.appendChild(this.soundStatus);
    this.soundDiv.appendChild(this.rngVolume);
    this.soundDiv.appendChild(this.lblVolume);
    this.btnDiv.appendChild(this.btnPlay);
    this.btnDiv.appendChild(this.btnStop);
    this.soundDiv.appendChild(this.btnDiv);

    loadAudioData();
  };

  window.onload = function() {
    var sp = new SoundPlayer();
  }
});
