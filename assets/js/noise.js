/* noise.js */
/* fancy noise pattern on the tv */
/* global CLT */

var NOISE_FILE_PATH = CLT.audioPaths.ogg.noise

CLT.supportsCanvas = !!document.createElement('canvas').getContext
if (CLT.supportsCanvas) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  var noise = document.createElement('audio')
}

CLT.generateTVNoise = function (opacity, density) {
  if (!CLT.supportsCanvas) { return false }

  var x
  var y
  var number

  density = Math.floor(density) || 1

  canvas.width = 200
  canvas.height = 150

  for (x = 0; x < canvas.width; x += density) {
    for (y = 0; y < canvas.height; y += density) {
      number = Math.floor(Math.random() * 256)
      ctx.fillStyle = 'rgba(' + number + ',' + number + ',' + number + ',' + opacity + ')'
      ctx.fillRect(x, y, 1, 1)
    }
  }
  CLT.screen.css(
    'background', 'url(' + canvas.toDataURL('image/png') + ') center center repeat #' + '888'
  )
  if (typeof applyTVNoise === 'function') {
    CLT.applyTVNoise()
  }
}

CLT.applyTVNoise = function () {
  var realNoise = new window.Image()
  realNoise.src = canvas.toDataURL('image/png')

  realNoise.onload = function () {
    var tempCanvas = document.createElement('canvas')
    var tempctx = tempCanvas.getContext('2d')

    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    tempctx.drawImage(realNoise, 0, 0)
  }
}

CLT.bringInDaTVNoise = function () {
  CLT.generateTVNoise(0.35, 0.001)
  CLT.applyTVNoise()
}

CLT.startTVNoise = function () {
  CLT.tvNoiseCycleId = setInterval(CLT.bringInDaTVNoise, 140)
  noise.src = NOISE_FILE_PATH
  noise.autoplay = true
  noise.controls = false
  noise.loop = true
  noise.volume = 0.1
  noise.addEventListener('timeupdate', function () {
    var buffer = 0.35
    if (this.currentTime > this.duration - buffer) {
      this.currentTime = 0
      this.play()
    }
  }, false)
}
CLT.stopTVNoise = function () {
  clearInterval(CLT.tvNoiseCycleId)
  CLT.screen.css('background', '')
  noise.pause()
  noise.currentTime = 0
}
