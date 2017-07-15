$(function() {
  CLT.svgControls = $('#svgControls a');
  CLT.svgControls.click(CLT.svgUpdateScreen);
  $(window).on('load resize', function() {
    CLT.fixScreenDims();
  });
  CLT.fixScreenDims = function() {
    CLT.screen.height(CLT.screen.width() * 0.5625);
  }

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
    this.messageDebug = el.querySelector('.messageDebug');
    this.messageScreen = document.querySelector('.messageScreen');
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

  SoundPlayer.prototype.messageDebugUpdate = function( msg ) {
    this.messageDebug.innerHTML = msg;
  }
  SoundPlayer.prototype.messageScreenUpdate = function( msg ) {
    this.messageScreen.innerHTML = msg;
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
  SoundPlayer.prototype.fetch = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onloadstart = function() {
      this.messageDebugUpdate(SOUND_STATUS_LOADING);
      this.messageScreenUpdate(SOUND_STATUS_LOADING);
    }.bind(this);
    xhr.onload = function() {
      this.decode(xhr.response);
    }.bind(this);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) { }
    }.bind(this);
    var that = this;
    xhr.upload.onprogress = function(ev) {
      // this won't work until the server sends the file's content length
      if (ev.lengthComputable) {
        var percentComplete = ev.loaded / ev.total;
        //console.log('upload.onprogress percentComplete', percentComplete);
        //that.messageDebugUpdate('loading ' + percentComplete + '%');
      }
    }
    xhr.send();
  };
  SoundPlayer.prototype.decode = function( arrayBuffer ) {
    this.ac.decodeAudioData(arrayBuffer, function( audioBuffer ) {
      this.buffer = audioBuffer;
      this.messageDebugUpdate(SOUND_STATUS_LOADED);
      this.messageScreenUpdate('');
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
    this.messageDebugUpdate(SOUND_STATUS_PLAYING);
    this.triggerScreenEvent(this.startTime);
    var soundPlayer = this;

    this.source.onended = function() {
      var soundStatus = soundPlayer.paused ? SOUND_STATUS_PAUSED : (soundPlayer.playing ? SOUND_STATUS_PLAYING: SOUND_STATUS_STOPPED);
      if (soundStatus == SOUND_STATUS_STOPPED) {
        this.stopped = true;
        this.paused = false;
        this.playing = false;
      }
      soundPlayer.messageDebugUpdate(soundStatus);
    };
  };
  SoundPlayer.prototype.pause = function() {
    if ( this.source ) {
      this.source.stop(0);
      this.source = null;
      this.position = this.ac.currentTime - this.startTime;
      this.playing = false;
      this.paused = true;
      CLT.svgRemoveAnimation();
      this.messageDebugUpdate(SOUND_STATUS_PAUSED);
    }
  };
  SoundPlayer.prototype.seek = function( time ) {
    if ( this.playing ) {
      this.progressStatus.innerText = this.progPercent() + '%';
      this.play(time);
    }
    else {
      this.progressStatus.innerText = this.progPercent() + '%';
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
      this.progressStatus.innerText = this.progPercent() + ' %';
      this.triggerScreenEvent(this.progPercent());
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
      case
      p >= CLT.markers['logo']['start'] &&
      p < CLT.markers['logo']['end']:
        CLT.svgUpdateScreen('logo');
        CLT.svgAddAnimation('logo');
        break;

      case
      p >= CLT.markers['docking-intro']['start'] &&
      p < CLT.markers['docking-intro']['end']:
        CLT.svgUpdateScreen('docking');
        CLT.svgAddAnimation('docking-intro');
        break;
      case
      p >= CLT.markers['docking-riff1']['start'] &&
      p < CLT.markers['docking-riff1']['end']:
        CLT.svgAddAnimation('docking-riff1');
        break;
      case
      p >= CLT.markers['docking-verse']['start'] &&
      p < CLT.markers['docking-verse']['end']:
        CLT.svgAddAnimation('docking-verse');
        break;
      case
      p >= CLT.markers['docking-riff2']['start'] &&
      p < CLT.markers['docking-riff2']['end']:
        CLT.svgAddAnimation('docking-riff2');
        break;
      case
      p >= CLT.markers['docking-chorus']['start'] &&
      p < CLT.markers['docking-chorus']['end']:
        CLT.svgAddAnimation('docking-chorus');
        break;
      case
      p >= CLT.markers['docking-outro']['start'] &&
      p < CLT.markers['docking-outro']['end']:
        CLT.svgAddAnimation('docking-outro');
        break;

      case
      p >= CLT.markers['road-verse1']['start'] &&
      p < CLT.markers['road-verse1']['end']:
        CLT.svgUpdateScreen('road');
        CLT.svgAddAnimation('road-verse1');
        break;
      case
      p >= CLT.markers['road-chorus']['start'] &&
      p < CLT.markers['road-chorus']['end']:
        CLT.svgAddAnimation('road-chorus');
        break;
      case
      p >= CLT.markers['road-verse2']['start'] &&
      p < CLT.markers['road-verse2']['end']:
        CLT.svgAddAnimation('road-verse2');
        break;

      case
      p >= CLT.markers['charlotte-intro']['start'] &&
      p < CLT.markers['charlotte-intro']['end']:
        CLT.svgUpdateScreen('charlotte');
        CLT.svgAddAnimation('charlotte-intro');
        break;
      case
      p >= CLT.markers['charlotte-verse']['start'] &&
      p < CLT.markers['charlotte-verse']['end']:
        CLT.svgAddAnimation('charlotte-verse');
        break;
      case
      p >= CLT.markers['charlotte-chorus']['start'] &&
      p < CLT.markers['charlotte-chorus']['end']:
        CLT.svgAddAnimation('charlotte-chorus');
        break;

      case
      p >= CLT.markers['wondering-intro']['start'] &&
      p < CLT.markers['wondering-intro']['end']:
        CLT.svgUpdateScreen('wondering');
        CLT.svgAddAnimation('wondering-intro');
        break;
      case
      p >= CLT.markers['wondering-prechorus']['start'] &&
      p < CLT.markers['wondering-prechorus']['end']:
        CLT.svgAddAnimation('wondering-prechorus');
        break;
      case
      p >= CLT.markers['wondering-chorus']['start'] &&
      p < CLT.markers['wondering-chorus']['end']:
        CLT.svgAddAnimation('wondering-chorus');
        break;

      case
      p >= CLT.markers['ladder-intro']['start'] &&
      p < CLT.markers['ladder-intro']['end']:
        CLT.svgUpdateScreen('ladder');
        CLT.svgAddAnimation('ladder-intro');
        break;
      case
      p >= CLT.markers['ladder-riff1']['start'] &&
      p < CLT.markers['ladder-riff1']['end']:
        CLT.svgAddAnimation('ladder-riff1');
        break;
      case
      p >= CLT.markers['ladder-riff1to2']['start'] &&
      p < CLT.markers['ladder-riff1to2']['end']:
        CLT.svgAddAnimation('ladder-riff1to2');
        break;
      case
      p >= CLT.markers['ladder-riff2']['start'] &&
      p < CLT.markers['ladder-riff2']['end']:
        CLT.svgAddAnimation('ladder-riff2');
        break;

      case
      p >= CLT.markers['fudge-intro']['start'] &&
      p < CLT.markers['fudge-intro']['end']:
        CLT.svgUpdateScreen('fudge');
        CLT.svgAddAnimation('fudge-intro');
        break;
      case
      p >= CLT.markers['fudge-prechorus']['start'] &&
      p < CLT.markers['fudge-prechorus']['end']:
        CLT.svgAddAnimation('fudge-prechorus');
        break;
      case
      p >= CLT.markers['fudge-bridge']['start'] &&
      p < CLT.markers['fudge-bridge']['end']:
        CLT.svgAddAnimation('fudge-bridge');
        break;
      case
      p >= CLT.markers['fudge-outro']['start'] &&
      p < CLT.markers['fudge-outro']['end']:
        CLT.svgAddAnimation('fudge-outro');
        break;

      case
      p >= CLT.markers['tattoo-verse1']['start'] &&
      p < CLT.markers['tattoo-verse1']['end']:
        CLT.svgUpdateScreen('tattoo');
        CLT.svgAddAnimation('tattoo-verse1');
        break;
      case
      p >= CLT.markers['tattoo-chorus1']['start'] &&
      p < CLT.markers['tattoo-chorus1']['end']:
        CLT.svgAddAnimation('tattoo-chorus1');
        break;
      case
      p >= CLT.markers['tattoo-verse2']['start'] &&
      p < CLT.markers['tattoo-verse2']['end']:
        CLT.svgAddAnimation('tattoo-verse2');
        break;
      case
      p >= CLT.markers['tattoo-chorus2']['start'] &&
      p < CLT.markers['tattoo-chorus2']['end']:
        CLT.svgAddAnimation('tattoo-chorus2');
        break;

      case
      p >= CLT.markers['pinto-intro']['start'] &&
      p < CLT.markers['pinto-intro']['end']:
        CLT.svgUpdateScreen('pinto');
        CLT.svgAddAnimation('pinto-intro');
        break;
      case
      p >= CLT.markers['pinto-verse']['start'] &&
      p < CLT.markers['pinto-verse']['end']:
        CLT.svgAddAnimation('pinto-verse');
        break;
      case
      p >= CLT.markers['pinto-chorus']['start'] &&
      p < CLT.markers['pinto-chorus']['end']:
        CLT.svgAddAnimation('pinto-chorus');
        break;
      case
      p >= CLT.markers['pinto-solo']['start'] &&
      p < CLT.markers['pinto-solo']['end']:
        CLT.svgAddAnimation('pinto-solo');
        break;

      case
      p >= CLT.markers['scenes-verse1']['start'] &&
      p < CLT.markers['scenes-verse1']['end']:
        CLT.svgUpdateScreen('scenes');
        CLT.svgAddAnimation('scenes-verse1');
        break;
      case
      p >= CLT.markers['scenes-chorus']['start'] &&
      p < CLT.markers['scenes-chorus']['end']:
        CLT.svgAddAnimation('scenes-chorus');
        break;
      case
      p >= CLT.markers['scenes-verse2']['start'] &&
      p < CLT.markers['scenes-verse2']['end']:
        CLT.svgAddAnimation('scenes-verse2');
        break;

      case
      p >= CLT.markers['overjoyed-intro']['start'] &&
      p < CLT.markers['overjoyed-intro']['end']:
        CLT.svgUpdateScreen('overjoyed');
        CLT.svgAddAnimation('overjoyed-intro');
        break;
      case
      p >= CLT.markers['overjoyed-verse']['start'] &&
      p < CLT.markers['overjoyed-verse']['end']:
        CLT.svgAddAnimation('overjoyed-verse');
        break;
      case
      p >= CLT.markers['overjoyed-chorus']['start'] &&
      p < CLT.markers['overjoyed-chorus']['end']:
        CLT.svgAddAnimation('overjoyed-chorus');
        break;
      case
      p >= CLT.markers['overjoyed-outro']['start'] &&
      p < CLT.markers['overjoyed-outro']['end']:
        CLT.svgAddAnimation('overjoyed-outro');
        break;

      case
      p >= CLT.markers['beyond-verse']['start'] &&
      p < CLT.markers['beyond-verse']['end']:
        CLT.svgUpdateScreen('beyond');
        CLT.svgAddAnimation('beyond-verse');
        break;
      case
      p >= CLT.markers['beyond-riff']['start'] &&
      p < CLT.markers['beyond-riff']['end']:
        CLT.svgAddAnimation('beyond-riff');
        break;
      case
      p >= CLT.markers['beyond-prechorus']['start'] &&
      p < CLT.markers['beyond-prechorus']['end']:
        CLT.svgAddAnimation('beyond-prechorus');
        break;
      case
      p >= CLT.markers['beyond-chorus']['start'] &&
      p < CLT.markers['beyond-chorus']['end']:
        CLT.svgAddAnimation('beyond-chorus');
        break;
      case
      p >= CLT.markers['beyond-outro']['start'] &&
      p < CLT.markers['beyond-outro']['end']:
        CLT.svgAddAnimation('beyond-outro');
        break;

      // end
      case p >= 100.00:
        CLT.svgUpdateScreen('logo');
        CLT.svgRemoveAnimation();
        this.position = 0;
        break;
    }
  }
  SoundPlayer.prototype.progPercent = function() {
    var progress = ( this.positionUpdate() / this.buffer.duration );
    var progress_rounded = round(progress * 100, 2);
    return progress_rounded;
  };
  function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  // create a new instance of the SoundPlayer and get things started
  window.SoundPlayer = new SoundPlayer(SOUND_FILE_PATH, PLAYER_ELEMENT);
  CLT.fixScreenDims();
});
