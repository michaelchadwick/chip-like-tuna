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
  //var SOUND_FILE_PATH = 'assets/audio/chip_like_tuna.mp3';
  var SOUND_FILE_PATH = 'assets/audio/snd00.mp3';
  var PLAYER_ELEMENT = document.querySelector('.player');

  function SoundPlayer ( soundPath, el ) {
    this.ac = new ( window.AudioContext || webkitAudioContext )();
    this.gainNode = this.ac.createGain();
    this.url = soundPath;
    this.el = el;
    this.button = el.querySelector('.button');
    this.track = el.querySelector('.track');
    this.progress = el.querySelector('.progress');
    this.progressStatus = el.querySelector('.progressStatus');
    this.scrubber = el.querySelector('.scrubber');
    this.message = el.querySelector('.message');
    this.rngVolume = el.querySelector('.rngVolume');
    this.lblVolume = el.querySelector('.lblVolume');
    var initVol = this.rngVolume.value;
    if (initVol < 100) initVol = "0" + initVol;
    if (initVol < 10) initVol = "0" + initVol;
    this.lblVolume.innerText = initVol;
    this.bindEvents();
    this.fetch();
  }

  SoundPlayer.prototype.bindEvents = function() {
    this.button.addEventListener('click', this.toggle.bind(this));
    this.scrubber.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.rngVolume.addEventListener('input', this.changeVolume.bind(this));
    this.rngVolume.addEventListener('change', this.changeVolumeLabel.bind(this));
    window.addEventListener('mousemove', this.onDrag.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
  };

  SoundPlayer.prototype.messageUpdate = function( msg ) {
    this.message.innerHTML = msg;
  }

  SoundPlayer.prototype.fetch = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onloadstart = function() {
      this.messageUpdate(SND_STATUS_LOADING);
    }.bind(this);
    xhr.onload = function() {
      this.decode(xhr.response);
    }.bind(this);
    xhr.send();
  };

  SoundPlayer.prototype.decode = function( arrayBuffer ) {
    this.ac.decodeAudioData(arrayBuffer, function( audioBuffer ) {
      this.buffer = audioBuffer;
      this.messageUpdate(SND_STATUS_LOADED);
      this.draw();
      //this.play();
    }.bind(this));
  };

  SoundPlayer.prototype.connect = function() {
    if ( this.playing ) {
      this.pause();
    }
    this.source = this.ac.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = false;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.ac.destination);
  };

  SoundPlayer.prototype.play = function( position ) {
    this.connect();
    this.position = typeof position === 'number' ? position : this.position || 0;
    this.startTime = this.ac.currentTime - ( this.position || 0 );
    this.source.start(this.ac.currentTime, this.position);
    this.playing = true;
    this.messageUpdate(SND_STATUS_PLAYING);
    var soundPlayer = this;
    
    this.source.onended = function() {
      var pauseOrStopStatus = soundPlayer.paused ? SND_STATUS_PAUSED : SND_STATUS_STOPPED;
      if (pauseOrStopStatus == SND_STATUS_STOPPED) {
        soundPlayer.stopped = true;
        soundPlayer.paused = false;
        soundPlayer.playing = false;
      }
      soundPlayer.messageUpdate(pauseOrStopStatus);
    };
  };

  SoundPlayer.prototype.pause = function() {
    if ( this.source ) {
      this.source.stop(0);
      this.source = null;
      this.position = this.ac.currentTime - this.startTime;
      this.playing = false;
      this.paused = true;
      this.messageUpdate(SND_STATUS_PAUSED);
    }
  };

  SoundPlayer.prototype.seek = function( time ) {
    if ( this.playing ) {
      this.play(time);
    }
    else {
      this.position = time;
    }
  };

  SoundPlayer.prototype.changeVolume = function( el ) {
    var volume = el.srcElement.value;
    var volumeMax = el.srcElement.max;
    var fraction = parseInt(volume) / parseInt(volumeMax);

    this.gainNode.gain.value = fraction * fraction;
  };

  SoundPlayer.prototype.changeVolumeLabel = function( el ) {
    var rangeVolN = el.srcElement;
    var newVol = rangeVolN.value;
    if (newVol < 100) newVol = "0" + newVol;
    if (newVol < 10) newVol = "0" + newVol;
    this.lblVolume.innerText = newVol;
  }

  SoundPlayer.prototype.positionUpdate = function() {
    this.position = this.playing ? this.ac.currentTime - this.startTime : this.position;
    if ( this.position >= this.buffer.duration ) {
      this.position = this.buffer.duration;
      this.pause();
    }
    return this.position;
  };

  SoundPlayer.prototype.toggle = function() {
    if ( !this.playing ) {
      this.play();
    }
    else {
      this.pause();
    }
  };

  SoundPlayer.prototype.onMouseDown = function( e ) {
    this.dragging = true;
    this.startX = e.pageX;
    this.startLeft = parseInt(this.scrubber.style.left || 0, 10);
  };

  SoundPlayer.prototype.onDrag = function( e ) {
    var width, position;
    if ( !this.dragging ) {
      return;
    }
    width = this.track.offsetWidth;
    position = this.startLeft + ( e.pageX - this.startX );
    position = Math.max(Math.min(width, position), 0);
    this.scrubber.style.left = position + 'px';
  };

  SoundPlayer.prototype.onMouseUp = function() {
    var width, left, time;
    if ( this.dragging ) {
      width = this.track.offsetWidth;
      left = parseInt(this.scrubber.style.left || 0, 10);
      time = left / width * this.buffer.duration;
      this.seek(time);
      this.dragging = false;
    }
  };

  SoundPlayer.prototype.draw = function() {
    var progress = ( this.positionUpdate() / this.buffer.duration ),
      width = this.track.offsetWidth;
    if ( this.playing ) {
      this.button.classList.add('fa-pause');
      this.button.classList.remove('fa-play');
      this.progressStatus.innerText = Math.round(progress * 100) + '%';
    } else {
      this.button.classList.add('fa-play');
      this.button.classList.remove('fa-pause');
    }
    this.progress.style.width = ( progress * width ) + 'px';
    if ( !this.dragging ) {
      this.scrubber.style.left = ( progress * width ) + 'px';
    }
    requestAnimationFrame(this.draw.bind(this));
  };

  // create a new instance of the SoundPlayer and get things started
  window.SoundPlayer = new SoundPlayer(SOUND_FILE_PATH, PLAYER_ELEMENT);
});
