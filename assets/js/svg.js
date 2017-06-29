/* svg */
/* control the svg images on the screen */

if (typeof CLT !== 'undefined') {
  CLT.ajaxImgRequest = new XMLHttpRequest();

  CLT.svgUpdateScreen = function(ev) {
    var pic;
    var picId;
    var xhr;

    if ((typeof ev) === 'string') {
      picId = ev;
    } else {
      if (ev.target == 'svg') {
        picId = ev.target.id;
      } else {
        pic = ev.target.parentElement;
        // in case we clicked on the svg itself in the thumbnail
        // we need to go up one more level
        if (pic.nodeName == 'svg') {
          picId = pic.parentElement.id;
        } else {
          picId = pic.id;
        }
      }
    }

    if (picId != null) {
      let classExists = RegExp(picId).test(CLT.screen.classList());

      if (!classExists) {
        if (CLT.screen.children('svg')[0].id != picId) {
          xhr = CLT.ajaxImgRequest;

          xhr.onload = function() {
            CLT.svgRemoveAnimation();
            CLT.screen.addClass(picId);
          }

          CLT.url = "api/svg.php?id=" + picId;
          xhr.open("GET", CLT.url, true);
          xhr.send();

          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
              CLT.screen.html(xhr.responseText);
            }
          }
        }
      }
    } else {
      console.error('no picId found', picId);
    }
  }

  CLT.svgRemoveAnimation = function() {
    CLT.screen.removeClass();
  }
  CLT.svgAddAnimation = function(song) {
    if (!RegExp('animated-' + song).test(CLT.screen.classList())) {
      CLT.screen.removeClass();
      CLT.screen.addClass('animated-' + song);
    }

  }
};
