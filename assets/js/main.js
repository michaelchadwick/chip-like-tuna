$(function() {
  CLT.svgControls = $('#svgControls a');
  CLT.svgControls.click(CLT.svgUpdateScreen);

  function SoundPlayer ( soundPath, el ) {
    this.ac = new ( window.AudioContext || webkitAudioContext )();
    this.gainNode = this.ac.createGain();
    this.url = soundPath;
    this.el = el;
    this.button = el.querySelector('.button');
    this.button.id = 'btnPlayPause';
    this.buttonElem = $('#btnPlayPause');
    this.track = el.querySelector('.track');
    this.progress = el.querySelector('.progress');
    this.progressStatus = el.querySelector('.progressStatus');
    this.scrubber = el.querySelector('.scrubber');
    this.scrubberElem = $('.scrubber');
    this.message = el.querySelector('.message');
    this.rngVolume = el.querySelector('.rngVolume');
    this.lblVolume = el.querySelector('.lblVolume');
    var initVol = this.rngVolume.value;
    if (initVol < 100) {
      initVol = "0" + initVol;
      if (initVol < 10) initVol = "0" + initVol;
    }
    this.lblVolume.innerText = initVol;
    this.playing = false;
    this.paused = false;
    this.stopped = true;
    this.bindEvents();
    this.fetch();
  }

  SoundPlayer.prototype.bindEvents = function() {
    this.button.addEventListener('click', this.toggle.bind(this));
    this.buttonElem.prop('disabled', true);
    this.scrubberElem.addClass('disabled');
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
      this.messageUpdate(SOUND_STATUS_LOADING);
    }.bind(this);
    xhr.onload = function() {
      this.decode(xhr.response);
    }.bind(this);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) { }
    }.bind(this);
    xhr.send();
  };

  SoundPlayer.prototype.decode = function( arrayBuffer ) {
    this.ac.decodeAudioData(arrayBuffer, function( audioBuffer ) {
      this.buffer = audioBuffer;
      this.messageUpdate(SOUND_STATUS_LOADED);
      this.draw();
      this.buttonElem.prop('disabled', false);
      this.scrubberElem.removeClass('disabled');
      this.scrubber.addEventListener('mousedown', this.onMouseDown.bind(this));
      CLT.startTVNoise();
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
    this.paused = false;
    CLT.stopTVNoise();
    this.messageUpdate(SOUND_STATUS_PLAYING);
    this.triggerScreenEvent(this.startTime);
    var soundPlayer = this;

    this.source.onended = function() {
      var soundStatus = soundPlayer.paused ? SOUND_STATUS_PAUSED : (soundPlayer.playing ? SOUND_STATUS_PLAYING: SOUND_STATUS_STOPPED);
      if (soundStatus == SOUND_STATUS_STOPPED) {
        this.stopped = true;
        this.paused = false;
        this.playing = false;
      }
      soundPlayer.messageUpdate(soundStatus);
    };
  };

  SoundPlayer.prototype.pause = function() {
    console.log('sound paused');
    if ( this.source ) {
      this.source.stop(0);
      this.source = null;
      this.position = this.ac.currentTime - this.startTime;
      this.playing = false;
      this.paused = true;
      CLT.svgRemoveAnimation();
      this.messageUpdate(SOUND_STATUS_PAUSED);
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
    if (newVol < 100) {
      newVol = "0" + newVol;
      if (newVol < 10) newVol = "0" + newVol;
    }
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
      var progPercent = Math.round(((progress * 100) * 10)) / 10;
      this.progressStatus.innerText = progPercent + '%';
      this.triggerScreenEvent(progPercent);
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

  SoundPlayer.prototype.triggerScreenEvent = function(p) {
    switch (true) {
      case p >= 0 && p < 0.6:
        CLT.svgUpdateScreen('intro');
        CLT.svgAddAnimation('intro');
        break;
      // docking
      case p >= 0.6 && p < 12.2:
        CLT.svgUpdateScreen('docking');
        CLT.svgAddAnimation('docking');
        break;
      // road
      case p >= 12.2 && p < 17.2:
        CLT.svgUpdateScreen('road');
        CLT.svgAddAnimation('road');
        break;
      // charlotte
      case p >= 17.2 && p < 25.5:
        CLT.svgUpdateScreen('charlotte');
        CLT.svgAddAnimation('charlotte');
        break;
      // wondering
      case p >= 25.5 && p < 35:
        CLT.svgUpdateScreen('wondering');
        CLT.svgAddAnimation('wondering');
        break;
      // ladder
      case p >= 35 && p < 44.1:
        CLT.svgUpdateScreen('ladder');
        CLT.svgAddAnimation('ladder');
        break;
      // fudge
      case p >= 44.1 && p < 52.6:
        CLT.svgUpdateScreen('fudge');
        CLT.svgAddAnimation('fudge');
        break;
      // tattoo
      case p >= 52.6 && p < 59.4:
        CLT.svgUpdateScreen('tattoo');
        CLT.svgAddAnimation('tattoo');
        break;
      // pinto
      case p >= 59.4 && p < 70.4:
        CLT.svgUpdateScreen('pinto');
        CLT.svgAddAnimation('pinto');
        break;
      // scenes
      case p >= 70.4 && p < 77.6:
        CLT.svgUpdateScreen('scenes');
        CLT.svgAddAnimation('scenes');
        break;
      // overjoyed
      case p >= 77.6 && p < 86.7:
        CLT.svgUpdateScreen('overjoyed');
        CLT.svgAddAnimation('overjoyed');
        break;
      // beyond
      case p>= 86.7 && p < 99.9:
        CLT.svgUpdateScreen('beyond');
        CLT.svgAddAnimation('beyond');
        break;
      // end
      case p >= 99.9:
        CLT.svgUpdateScreen('intro');
        CLT.svgRemoveAnimation();
        this.position = 0;
        break;
    }
  }

  // create a new instance of the SoundPlayer and get things started
  window.SoundPlayer = new SoundPlayer(SOUND_FILE_PATH, PLAYER_ELEMENT);
});
