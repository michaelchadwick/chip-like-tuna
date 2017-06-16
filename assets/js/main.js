$(function() {
  xhr = new XMLHttpRequest();
  
  $controls = $("#controls a");
  $controls.on("click", function() {
  
    var url = "api/svg.php?id=" + $(this).attr("id");
    xhr.open("GET", url, false);
    xhr.send();
  });

  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log(xhr.responseText);
        $("section#screen").html(xhr.responseText);
      }
    }
  }

});
