$(function() {
  xhr = new XMLHttpRequest();

  $svgControls = $("#svgControls a");
  $svgControls.on("click", function() {
    var url = "api/svg.php?id=" + $(this).attr("id");
    xhr.open("GET", url, false);
    xhr.send();
  });

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        $("section#screen").html(xhr.responseText);
      }
    }
  }
});
