/* noise.js */
/* fancy noise pattern on the tv */

CLT.supportsCanvas = !!document.createElement('canvas').getContext;
if ( CLT.supportsCanvas ) {
  var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    noise = document.createElement('audio');
}

CLT.generateTVNoise = function(opacity, density) {
  if ( !CLT.supportsCanvas ) { return false; }

  var x, y,
    r, g, b,
    opacity = opacity,
    density = Math.floor(density) || 1;

  canvas.width = 200;
  canvas.height = 150;

  for ( x = 0; x < canvas.width; x += density ) {
    for ( y = 0; y < canvas.height; y += density ) {
      number = Math.floor( Math.random() * 256 );
      ctx.fillStyle = 'rgba(' + number + ',' + number + ',' + number + ',' + opacity + ')';
      ctx.fillRect(x, y, 1, 1);
    }
  }

  $('section#screen').css(
    'background', 'url(' + canvas.toDataURL('image/png') + ') center center repeat #' + '888'
  );

  if (typeof applyTVNoise == 'function') {
    applyTVNoise();
  }
}

CLT.applyTVNoise = function(){
  var realNoise = new Image();
  realNoise.src = canvas.toDataURL('image/png');

  realNoise.onload = function(){
    var tempCanvas = document.createElement('canvas'),
      tempctx = tempCanvas.getContext('2d');

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempctx.drawImage(realNoise, 0, 0);
  };
};

CLT.bringInDaTVNoise = function() {
  CLT.generateTVNoise(0.35, 0.001);
  CLT.applyTVNoise();
}

CLT.startTVNoise = function() {
  CLT.tvNoiseCycleId = setInterval(CLT.bringInDaTVNoise, 80);
  noise.src = '/assets/audio/noise.ogg';
  noise.autoplay = true;
  noise.controls = false;
  noise.loop = true;
  noise.volume = 0.5;
  noise.addEventListener('timeupdate', function(){
    var buffer = .44;
    if(this.currentTime > this.duration - buffer){
      this.currentTime = 0
      this.play()
    }}, false);
}
CLT.stopTVNoise = function() {
  clearInterval(CLT.tvNoiseCycleId);
  CLT.screen.css('background', '#ddd');
  noise.pause();
  noise.currentTime = 0;
}
