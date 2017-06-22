$(function() {
  var url;
  var xhr = new XMLHttpRequest();

  $svgControls = $("#svgControls a");
  $svgControls.on("click", svgUpdateScreen);
  
  function svgUpdateScreen( ev ) {
    var pic;
    var picId;

    if (typeof ev === 'number') {
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

    if (picId) {
      url = "api/svg.php?id=" + picId;
      xhr.open("GET", url, true);
      xhr.send();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            $("section#screen").html(xhr.responseText);
          }
        }
      }
    } else {
      console.error('no picId found', picId);
    }
  }
});
