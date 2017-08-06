/* svg */
/* control the svg images on the screen */
/* global CLT */

if (typeof CLT !== 'undefined') {
  CLT.ajaxImgRequest = new window.XMLHttpRequest()

  CLT.svgUpdateScreen = function (ev) {
    var pic
    var picId
    var xhr

    // parse request for picId
    if ((typeof ev) === 'string') {
      picId = ev
    } else {
      if (ev.target === 'svg') {
        picId = ev.target.id
      } else {
        pic = ev.target.parentElement
        // in case we clicked on the svg itself in the thumbnail
        // we need to go up one more level
        if (pic.nodeName === 'svg') {
          picId = pic.parentElement.id
        } else {
          picId = pic.id
        }
      }
    }

    // if we got a valid picId, call api for new svg image
    if (picId != null) {
      let classExists = RegExp(picId).test(CLT.screen.classList())
      let method = 'GET'
      let useAsync = true

      // as long as we aren't currently using this picId, update
      if (!classExists) {
        if (CLT.screen.children('svg')[0].id !== picId) {
          xhr = CLT.ajaxImgRequest
          CLT.url = `api/svg.php?id=${picId}`
          xhr.open(method, CLT.url, useAsync)

          xhr.onload = function () {
            CLT.svgRemoveAnimation()
            CLT.screen.addClass(picId)
          }
          xhr.onreadystatechange = function () {
            if (xhr.readyState === window.XMLHttpRequest.DONE && xhr.status === 200) {
              CLT.screen.html(xhr.responseText)
              // CLT.skipAhead(ev.currentTarget.id)
            }
          }
          xhr.send()
        }
      }
    } else {
      console.error('no picId found', picId)
    }
  }
  CLT.svgRemoveAnimation = function () {
    CLT.screen.removeClass()
  }
  CLT.svgAddAnimation = function (animationId) {
    if (!RegExp('animated-' + animationId).test(CLT.screen.classList())) {
      CLT.svgRemoveAnimation()
      CLT.screen.addClass('animated-' + animationId)
    }
  }
  // STUB: skip ahead to timecode for song
  CLT.skipAhead = function (songId) {
    /*
    var width = sp.track.offsetWidth
    var left = parseInt(sp.scrubber.style.left || 0, 10)
    var time = left / width * sp.buffer.duration
    var sp = window.SoundPlayer

    // sp.seek(time);
    sp.dragging = !sp.dragging

    // position = this.startLeft + ( e.pageX - this.startX );
    // position = Math.max(Math.min(width, position), 0);
    // this.scrubber.style.left = position + 'px';
    */
  }
}
