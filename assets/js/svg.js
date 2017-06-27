/* svg */
/* control the svg images on the screen */

if (typeof CLT !== 'undefined') {
  CLT.ajaxImgRequest = new XMLHttpRequest();

  CLT.svgUpdateScreen = function(ev) {
    var pic;
    var picId;
    var xhr;

    if (typeof ev == 'number') {
      picId = ev;
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

    if (picId != null) {
      if (RegExp('animated').test(CLT.screen.classList())) {
        CLT.screen.removeClass();
      }
      CLT.screen.addClass('animated' + Math.round(Math.random() * 10));
      xhr = CLT.ajaxImgRequest;
      CLT.url = "api/svg.php?id=" + picId;
      xhr.open("GET", CLT.url, true);
      xhr.send();
      xhr.onreadystatechange = function() {
        console.log('readyState', xhr.readyState);
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          $("section#screen").html(xhr.responseText);
        }
      }
    } else {
      console.error('no picId found', picId);
    }
  }
};
