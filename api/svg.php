<?php
  $images = [
    "../assets/flv-scenes/svg/00-flv.min.svg",
    "../assets/flv-scenes/svg/01-docking.min.svg",
    "../assets/flv-scenes/svg/02-road.min.svg",
    "../assets/flv-scenes/svg/03-charlotte.min.svg",
    "../assets/flv-scenes/svg/04-wondering.min.svg",
    "../assets/flv-scenes/svg/05-ladder.min.svg",
    "../assets/flv-scenes/svg/06-fudge.min.svg",
    "../assets/flv-scenes/svg/07-pinto.min.svg",
    "../assets/flv-scenes/svg/08-tattoo.min.svg",
    "../assets/flv-scenes/svg/09-scenes.min.svg",
    "../assets/flv-scenes/svg/10-overjoyed.min.svg",
    "../assets/flv-scenes/svg/11-beyond.min.svg"
  ];

  if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['id'])) {
    $svgID = $_GET['id'];
  
    echo file_get_contents($images[$svgID]);
  }
?>
