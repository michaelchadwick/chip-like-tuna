<?php
  $images = array(
    'intro'     => '../assets/flv-scenes/svg/00-intro.svg',
    'docking'   => '../assets/flv-scenes/svg/01-docking.svg',
    'road'      => '../assets/flv-scenes/svg/02-road.svg',
    'charlotte' => '../assets/flv-scenes/svg/03-charlotte.svg',
    'wondering' => '../assets/flv-scenes/svg/04-wondering.svg',
    'ladder'    => '../assets/flv-scenes/svg/05-ladder.svg',
    'fudge'     => '../assets/flv-scenes/svg/06-fudge.svg',
    'tattoo'    => '../assets/flv-scenes/svg/07-tattoo.svg',
    'pinto'     => '../assets/flv-scenes/svg/08-pinto.svg',
    'scenes'    => '../assets/flv-scenes/svg/09-scenes.svg',
    'overjoyed' => '../assets/flv-scenes/svg/10-overjoyed.svg',
    'beyond'    => '../assets/flv-scenes/svg/11-beyond.svg'
  );

  if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['id'])) {
    $svgID = $_GET['id'];
  
    echo file_get_contents($images[$svgID]);
  }
?>
