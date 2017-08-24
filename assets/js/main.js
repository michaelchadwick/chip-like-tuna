/* main */
/* global CLT, $ */

$(function () {
  // if admin passed, show debug stuff
  if ($.QueryString.admin > 0) {
    $('.debug').show()
  }
  // CLT properties
  CLT.noiseControlsDiv = $('section#noiseControls')
  if ($.QueryString.noise <= 0) {
    CLT.noiseControlsDiv.hide()
  }
  CLT.btnNoiseStart = $('button#btnNoiseStart')
  CLT.btnNoiseStop = $('button#btnNoiseStop')
  CLT.btnPlayPause = $('button#btnPlayPause')

  CLT.fixScreenDims = function () {
    CLT.screen.height(CLT.screen.width() * 0.5625)
    $('div.player .playButton.superImposed').css('height', CLT.screen.height() + 'px')
  }

  $(window).on('load resize', function () {
    CLT.fixScreenDims()
  })

  // main html5 audio object
  function SoundPlayer (soundPath, el) {
    this.ac = new (window.AudioContext || window.webkitAudioContext)()
    this.gainNode = this.ac.createGain()
    this.url = soundPath
    this.el = el
    this.playButton = el.querySelector('.playButton')
    this.playButton.id = 'btnPlayPause'
    this.buttonElem = $('button#btnPlayPause')
    this.track = el.querySelector('.track')
    this.progress = el.querySelector('.progress')
    this.progressStatus = el.querySelector('#progressStatus')
    this.scrubber = el.querySelector('.scrubber')
    this.scrubberElem = $('.scrubber')
    this.messageDebug = el.querySelector('#messageDebug')
    this.messageScreen = document.querySelector('#messageScreen')
    this.rngVolume = el.querySelector('.rngVolume')
    this.lblVolume = el.querySelector('.lblVolume')
    var initVol = this.rngVolume.value
    if (initVol < 100) {
      initVol = '0' + initVol
      if (initVol < 10) initVol = '0' + initVol
    }
    this.lblVolume.innerText = initVol
    this.gainNode.gain.value = Math.pow((parseInt(initVol) / 100), 2)
    this.playing = false
    this.paused = false
    this.stopped = true
    this.bindEvents()
    this.fetch()
  }

  SoundPlayer.prototype.messageDebugUpdate = function (msg) {
    this.messageDebug.innerHTML = msg
  }
  SoundPlayer.prototype.messageScreenUpdate = function (msg) {
    this.messageScreen.innerHTML = msg
  }

  SoundPlayer.prototype.bindEvents = function () {
    if ($.QueryString.noise > 0) {
      CLT.btnNoiseStart.click(CLT.startTVNoise)
      CLT.btnNoiseStop.click(CLT.stopTVNoise)
    }
    this.playButton.addEventListener('click', this.toggle.bind(this))
    this.buttonElem.prop('disabled', true)
    this.scrubberElem.addClass('disabled')
    this.rngVolume.addEventListener('input', this.changeVolume.bind(this))
    this.rngVolume.addEventListener('change', this.changeVolumeLabel.bind(this))
    window.addEventListener('mousemove', this.onDrag.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
  }
  SoundPlayer.prototype.fetch = function () {
    var xhr = new window.XMLHttpRequest()
    xhr.open('GET', this.url, true)
    xhr.responseType = 'arraybuffer'
    xhr.onloadstart = function () {
      this.messageDebugUpdate(CLT.SOUND_STATUS_LOADING)
      this.messageScreenUpdate(CLT.SOUND_STATUS_LOADING)
    }.bind(this)
    xhr.onload = function (evt) {
      if (evt.total > 0) {
        this.decode(xhr.response)
      } else {
        this.messageDebugUpdate(`${CLT.SOUND_STATUS_ERROR}:${CLT.SOUND_FILE_PATH}`)
        this.messageScreenUpdate(CLT.SOUND_STATUS_I_AM_ERROR)
        CLT.screen.css('background', '#400')
      }
    }.bind(this)
    /* this won't work until the server sends the file's content length
    var that = this
    xhr.upload.onprogress = function (ev) {
      if (ev.lengthComputable) {
        var percentComplete = ev.loaded / ev.total
        that.messageDebugUpdate('loading ' + percentComplete + '%')
      }
    }
    */
    xhr.send()
  }
  SoundPlayer.prototype.decode = function (arrayBuffer) {
    this.ac.decodeAudioData(arrayBuffer, function (audioBuffer) {
      this.buffer = audioBuffer
      this.messageDebugUpdate(CLT.SOUND_STATUS_LOADED)
      this.messageScreenUpdate('')
      this.draw()
      this.buttonElem.prop('disabled', false)
      this.scrubberElem.removeClass('disabled')
      this.scrubber.addEventListener('mousedown', this.onMouseDown.bind(this))
      if ($.QueryString.noise > 0) { CLT.startTVNoise() }
    }.bind(this))
  }
  SoundPlayer.prototype.connect = function () {
    if (this.playing) {
      this.pause()
    }
    this.source = this.ac.createBufferSource()
    this.source.buffer = this.buffer
    this.source.loop = false
    this.source.connect(this.gainNode)
    this.gainNode.connect(this.ac.destination)
  }
  SoundPlayer.prototype.play = function (position) {
    this.connect()
    this.position = typeof position === 'number' ? position : this.position || 0
    this.startTime = this.ac.currentTime - (this.position || 0)
    this.source.start(this.ac.currentTime, this.position)
    this.playing = true
    this.paused = false
    if ($.QueryString.noise > 0) {
      CLT.stopTVNoise()
      CLT.noiseControlsDiv.hide()
    }
    this.messageDebugUpdate(CLT.SOUND_STATUS_PLAYING)
    this.triggerScreenEvent(this.startTime)
    var soundPlayer = this

    this.source.onended = function () {
      var soundStatus = soundPlayer.paused
        ? CLT.SOUND_STATUS_PAUSED
        : (soundPlayer.playing
          ? CLT.SOUND_STATUS_PLAYING
          : CLT.SOUND_STATUS_STOPPED)
      if (soundStatus === CLT.SOUND_STATUS_STOPPED) {
        this.stopped = true
        this.paused = false
        this.playing = false
        this.position = 0
      }
      soundPlayer.messageDebugUpdate(soundStatus)
    }
  }
  SoundPlayer.prototype.pause = function () {
    if (this.source) {
      this.source.stop(0)
      this.source = null
      this.position = this.ac.currentTime - this.startTime
      this.playing = false
      this.paused = true
      CLT.svgRemoveAnimation()
      this.messageDebugUpdate(CLT.SOUND_STATUS_PAUSED)
    }
  }
  SoundPlayer.prototype.seek = function (time) {
    if (this.playing) {
      this.play(time)
    } else {
      this.position = time
    }
    this.progressStatus.innerText = this.progPercent() + ' %'
  }
  SoundPlayer.prototype.changeVolume = function (el) {
    var volume = el.srcElement.value
    var volumeMax = el.srcElement.max
    var fraction = parseInt(volume) / parseInt(volumeMax)

    this.gainNode.gain.value = fraction * fraction
  }
  SoundPlayer.prototype.changeVolumeLabel = function (el) {
    var rangeVolN = el.srcElement
    var newVol = rangeVolN.value
    if (newVol < 100) {
      newVol = '0' + newVol
      if (newVol < 10) newVol = '0' + newVol
    }
    this.lblVolume.innerText = newVol
  }
  SoundPlayer.prototype.positionUpdate = function () {
    this.position = this.playing ? this.ac.currentTime - this.startTime : this.position
    if (this.position >= this.buffer.duration) {
      this.position = this.buffer.duration
      this.pause()
    }
    return this.position
  }
  SoundPlayer.prototype.toggle = function () {
    if (this.position === this.buffer.duration) {
      this.position = 0
    }
    if (!this.playing) {
      this.play()
    } else {
      this.pause()
    }
  }
  SoundPlayer.prototype.onMouseDown = function (e) {
    this.dragging = true
    this.startX = e.pageX
    this.startLeft = parseInt(this.scrubber.style.left || 0, 10)
  }
  SoundPlayer.prototype.onDrag = function (e) {
    var width, position
    if (!this.dragging) {
      return
    }
    width = this.track.offsetWidth
    position = this.startLeft + (e.pageX - this.startX)
    position = Math.max(Math.min(width, position), 0)
    this.scrubber.style.left = position + 'px'
  }
  SoundPlayer.prototype.onMouseUp = function () {
    var width, left, time
    if (this.dragging) {
      width = this.track.offsetWidth
      left = parseInt(this.scrubber.style.left || 0, 10)
      time = left / width * this.buffer.duration
      this.seek(time)
      this.dragging = false
    }
  }
  SoundPlayer.prototype.draw = function () {
    var progress = (this.positionUpdate() / this.buffer.duration)
    var width = this.track.offsetWidth
    if (this.playing) {
      this.playButton.classList.add('fa-pause')
      this.playButton.classList.remove('fa-play')
      this.triggerScreenEvent(this.progPercent())
      this.progressStatus.innerText = this.progPercent() + ' %'
    } else {
      this.playButton.classList.add('fa-play')
      this.playButton.classList.remove('fa-pause')
    }
    this.progress.style.width = (progress * width) + 'px'
    if (!this.dragging) {
      this.scrubber.style.left = (progress * width) + 'px'
    }
    window.requestAnimationFrame(this.draw.bind(this))
  }
  SoundPlayer.prototype.triggerScreenEvent = function (p) {
    switch (true) {
      case
      p >= CLT.markers['logo']['start'] &&
      p < CLT.markers['logo']['end']:
        CLT.svgUpdateScreen('logo')
        CLT.svgAddAnimation('logo')
        break

      case
      p >= CLT.markers['docking-intro']['start'] &&
      p < CLT.markers['docking-intro']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-intro')
        break
      case
      p >= CLT.markers['docking-riff1']['start'] &&
      p < CLT.markers['docking-riff1']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-riff1')
        break
      case
      p >= CLT.markers['docking-verse']['start'] &&
      p < CLT.markers['docking-verse']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-verse')
        break
      case
      p >= CLT.markers['docking-riff2']['start'] &&
      p < CLT.markers['docking-riff2']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-riff2')
        break
      case
      p >= CLT.markers['docking-chorus']['start'] &&
      p < CLT.markers['docking-chorus']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-chorus')
        break
      case
      p >= CLT.markers['docking-outro']['start'] &&
      p < CLT.markers['docking-outro']['end']:
        CLT.svgUpdateScreen('docking')
        CLT.svgAddAnimation('docking-outro')
        break

      case
      p >= CLT.markers['road-verse1']['start'] &&
      p < CLT.markers['road-verse1']['end']:
        CLT.svgUpdateScreen('road')
        CLT.svgAddAnimation('road-verse1')
        break
      case
      p >= CLT.markers['road-chorus']['start'] &&
      p < CLT.markers['road-chorus']['end']:
        CLT.svgUpdateScreen('road')
        CLT.svgAddAnimation('road-chorus')
        break
      case
      p >= CLT.markers['road-verse2']['start'] &&
      p < CLT.markers['road-verse2']['end']:
        CLT.svgUpdateScreen('road')
        CLT.svgAddAnimation('road-verse2')
        break

      case
      p >= CLT.markers['charlotte-intro']['start'] &&
      p < CLT.markers['charlotte-intro']['end']:
        CLT.svgUpdateScreen('charlotte')
        CLT.svgAddAnimation('charlotte-intro')
        break
      case
      p >= CLT.markers['charlotte-verse']['start'] &&
      p < CLT.markers['charlotte-verse']['end']:
        CLT.svgUpdateScreen('charlotte')
        CLT.svgAddAnimation('charlotte-verse')
        break
      case
      p >= CLT.markers['charlotte-chorus']['start'] &&
      p < CLT.markers['charlotte-chorus']['end']:
        CLT.svgUpdateScreen('charlotte')
        CLT.svgAddAnimation('charlotte-chorus')
        break

      case
      p >= CLT.markers['wondering-intro']['start'] &&
      p < CLT.markers['wondering-intro']['end']:
        CLT.svgUpdateScreen('wondering')
        CLT.svgAddAnimation('wondering-intro')
        break
      case
      p >= CLT.markers['wondering-prechorus']['start'] &&
      p < CLT.markers['wondering-prechorus']['end']:
        CLT.svgUpdateScreen('wondering')
        CLT.svgAddAnimation('wondering-prechorus')
        break
      case
      p >= CLT.markers['wondering-chorus']['start'] &&
      p < CLT.markers['wondering-chorus']['end']:
        CLT.svgUpdateScreen('wondering')
        CLT.svgAddAnimation('wondering-chorus')
        break

      case
      p >= CLT.markers['ladder-intro']['start'] &&
      p < CLT.markers['ladder-intro']['end']:
        CLT.svgUpdateScreen('ladder')
        CLT.svgAddAnimation('ladder-intro')
        break
      case
      p >= CLT.markers['ladder-riff1']['start'] &&
      p < CLT.markers['ladder-riff1']['end']:
        CLT.svgUpdateScreen('ladder')
        CLT.svgAddAnimation('ladder-riff1')
        break
      case
      p >= CLT.markers['ladder-riff1to2']['start'] &&
      p < CLT.markers['ladder-riff1to2']['end']:
        CLT.svgUpdateScreen('ladder')
        CLT.svgAddAnimation('ladder-riff1to2')
        break
      case
      p >= CLT.markers['ladder-riff2']['start'] &&
      p < CLT.markers['ladder-riff2']['end']:
        CLT.svgUpdateScreen('ladder')
        CLT.svgAddAnimation('ladder-riff2')
        break

      case
      p >= CLT.markers['fudge-intro']['start'] &&
      p < CLT.markers['fudge-intro']['end']:
        CLT.svgUpdateScreen('fudge')
        CLT.svgAddAnimation('fudge-intro')
        break
      case
      p >= CLT.markers['fudge-prechorus']['start'] &&
      p < CLT.markers['fudge-prechorus']['end']:
        CLT.svgUpdateScreen('fudge')
        CLT.svgAddAnimation('fudge-prechorus')
        break
      case
      p >= CLT.markers['fudge-bridge']['start'] &&
      p < CLT.markers['fudge-bridge']['end']:
        CLT.svgUpdateScreen('fudge')
        CLT.svgAddAnimation('fudge-bridge')
        break
      case
      p >= CLT.markers['fudge-outro']['start'] &&
      p < CLT.markers['fudge-outro']['end']:
        CLT.svgUpdateScreen('fudge')
        CLT.svgAddAnimation('fudge-outro')
        break

      case
      p >= CLT.markers['tattoo-verse1']['start'] &&
      p < CLT.markers['tattoo-verse1']['end']:
        CLT.svgUpdateScreen('tattoo')
        CLT.svgAddAnimation('tattoo-verse1')
        break
      case
      p >= CLT.markers['tattoo-chorus1']['start'] &&
      p < CLT.markers['tattoo-chorus1']['end']:
        CLT.svgUpdateScreen('tattoo')
        CLT.svgAddAnimation('tattoo-chorus1')
        break
      case
      p >= CLT.markers['tattoo-verse2']['start'] &&
      p < CLT.markers['tattoo-verse2']['end']:
        CLT.svgUpdateScreen('tattoo')
        CLT.svgAddAnimation('tattoo-verse2')
        break
      case
      p >= CLT.markers['tattoo-chorus2']['start'] &&
      p < CLT.markers['tattoo-chorus2']['end']:
        CLT.svgUpdateScreen('tattoo')
        CLT.svgAddAnimation('tattoo-chorus2')
        break

      case
      p >= CLT.markers['pinto-intro']['start'] &&
      p < CLT.markers['pinto-intro']['end']:
        CLT.svgUpdateScreen('pinto')
        CLT.svgAddAnimation('pinto-intro')
        break
      case
      p >= CLT.markers['pinto-verse']['start'] &&
      p < CLT.markers['pinto-verse']['end']:
        CLT.svgUpdateScreen('pinto')
        CLT.svgAddAnimation('pinto-verse')
        break
      case
      p >= CLT.markers['pinto-chorus']['start'] &&
      p < CLT.markers['pinto-chorus']['end']:
        CLT.svgUpdateScreen('pinto')
        CLT.svgAddAnimation('pinto-chorus')
        break
      case
      p >= CLT.markers['pinto-solo']['start'] &&
      p < CLT.markers['pinto-solo']['end']:
        CLT.svgUpdateScreen('pinto')
        CLT.svgAddAnimation('pinto-solo')
        break

      case
      p >= CLT.markers['scenes-verse1']['start'] &&
      p < CLT.markers['scenes-verse1']['end']:
        CLT.svgUpdateScreen('scenes')
        CLT.svgAddAnimation('scenes-verse1')
        break
      case
      p >= CLT.markers['scenes-chorus']['start'] &&
      p < CLT.markers['scenes-chorus']['end']:
        CLT.svgUpdateScreen('scenes')
        CLT.svgAddAnimation('scenes-chorus')
        break
      case
      p >= CLT.markers['scenes-verse2']['start'] &&
      p < CLT.markers['scenes-verse2']['end']:
        CLT.svgUpdateScreen('scenes')
        CLT.svgAddAnimation('scenes-verse2')
        break

      case
      p >= CLT.markers['overjoyed-intro']['start'] &&
      p < CLT.markers['overjoyed-intro']['end']:
        CLT.svgUpdateScreen('overjoyed')
        CLT.svgAddAnimation('overjoyed-intro')
        break
      case
      p >= CLT.markers['overjoyed-verse']['start'] &&
      p < CLT.markers['overjoyed-verse']['end']:
        CLT.svgUpdateScreen('overjoyed')
        CLT.svgAddAnimation('overjoyed-verse')
        break
      case
      p >= CLT.markers['overjoyed-chorus']['start'] &&
      p < CLT.markers['overjoyed-chorus']['end']:
        CLT.svgUpdateScreen('overjoyed')
        CLT.svgAddAnimation('overjoyed-chorus')
        break
      case
      p >= CLT.markers['overjoyed-outro']['start'] &&
      p < CLT.markers['overjoyed-outro']['end']:
        CLT.svgUpdateScreen('overjoyed')
        CLT.svgAddAnimation('overjoyed-outro')
        break

      case
      p >= CLT.markers['beyond-verse']['start'] &&
      p < CLT.markers['beyond-verse']['end']:
        CLT.svgUpdateScreen('beyond')
        CLT.svgAddAnimation('beyond-verse')
        break
      case
      p >= CLT.markers['beyond-riff']['start'] &&
      p < CLT.markers['beyond-riff']['end']:
        CLT.svgUpdateScreen('beyond')
        CLT.svgAddAnimation('beyond-riff')
        break
      case
      p >= CLT.markers['beyond-prechorus']['start'] &&
      p < CLT.markers['beyond-prechorus']['end']:
        CLT.svgUpdateScreen('beyond')
        CLT.svgAddAnimation('beyond-prechorus')
        break
      case
      p >= CLT.markers['beyond-chorus']['start'] &&
      p < CLT.markers['beyond-chorus']['end']:
        CLT.svgUpdateScreen('beyond')
        CLT.svgAddAnimation('beyond-chorus')
        break
      case
      p >= CLT.markers['beyond-outro']['start'] &&
      p < CLT.markers['beyond-outro']['end']:
        CLT.svgUpdateScreen('beyond')
        CLT.svgAddAnimation('beyond-outro')
        break

      // end
      case p >= 100.00:
        CLT.svgUpdateScreen('logo')
        CLT.svgRemoveAnimation()
        this.position = 0
        break
    }
  }
  SoundPlayer.prototype.progPercent = function () {
    var progress = (this.positionUpdate() / this.buffer.duration)
    var progressRounded = round(progress * 100, 2)
    return (isNaN(progressRounded)) ? 0 : progressRounded
  }

  // helper functions
  function round (value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }
  function hidePlayButton () {
    $('div.player .playButton').removeClass('visible')
    window.clearTimeout(playButtonTimeout)
  }

  // create a new instance of the SoundPlayer and get things started
  window.SoundPlayer = new SoundPlayer(CLT.SOUND_FILE_PATH, CLT.PLAYER_ELEMENT)

  if ($('button#btnPlayPause').hasClass('superImposed')) {
    var $button = $('div.player .playButton.superImposed')
    var playButtonTimeout

    $button.on('click', function (evt) {
      window.SoundPlayer.toggle()
    })
    $button.on('mouseenter mousemove', function (evt) {
      $(evt.target).css('cursor', 'pointer')
      $button.addClass('visible')
    })
    $button.on('mouseleave', function (evt) {
      hidePlayButton()
    })
  }

  // initial screen dim fix
  CLT.fixScreenDims()
})
