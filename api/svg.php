  <?php
  $albumId = 'scenes';
  $images = array(
    'common' => array(
      'logo'      => '../assets/svg/flv-common/00-logo.svg',
    ),
    'scenes' => array(
      'logo'      => '../assets/svg/flv-common/00-logo.svg',
      'docking'   => '../assets/svg/flv-scenes/01-docking.svg',
      'road'      => '../assets/svg/flv-scenes/02-road.svg',
      'charlotte' => '../assets/svg/flv-scenes/03-charlotte.svg',
      'wondering' => '../assets/svg/flv-scenes/04-wondering.svg',
      'ladder'    => '../assets/svg/flv-scenes/05-ladder.svg',
      'fudge'     => '../assets/svg/flv-scenes/06-fudge.svg',
      'tattoo'    => '../assets/svg/flv-scenes/07-tattoo.svg',
      'pinto'     => '../assets/svg/flv-scenes/08-pinto.svg',
      'scenes'    => '../assets/svg/flv-scenes/09-scenes.svg',
      'overjoyed' => '../assets/svg/flv-scenes/10-overjoyed.svg',
      'beyond'    => '../assets/svg/flv-scenes/11-beyond.svg'
    ),
    'unwound' => array(),
  );

  if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['id'])) {
    $svgId = $_GET['id'];

    echo file_get_contents($images[$albumId][$svgId]);
  }
?>
