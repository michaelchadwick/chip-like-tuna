<!doctype html>
<html>
<head>
  <title>Chip Like Tuna</title>
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="icon" href="favicon.ico">
  <!-- for player button -->
  <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
  <!-- for site text -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Press+Start+2P">
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <?php $admin = (isset($_GET['admin']) && $_GET['admin'] == 1) ? true : false; ?>
  <div id="wrap">
    <div id="main">
      <h1>FLV TV</h1>

      <section id="screen">
        <svg></svg>
        <div id="messageScreen">
          <span></span>
        </div>
      </section>

      <section id="noiseControls" class="debug">
        <button class="button noise" id="btnNoiseStart">Start Noise Cycle</button>
        <button class="button noise" id="btnNoiseStop">Stop Noise Cycle</button>
      </section>

      <section id="svgControls">
        <?php
        $dir = "./assets/svg/flv-scenes";
        $dir_handle = opendir($dir);
        $files = array();

        while (($file=readdir($dir_handle)) !== false) {
          array_push($files, $dir . $file);
        }
        closedir($dir_handle);
        sort($files);

        if (sizeof($files) > 0) {
          foreach ($files as $file) {
            $pathinfo = pathinfo($file);
            if (pathinfo($file)['extension'] == "svg") {
              $id = explode('.', explode('-', pathinfo($file)['basename'])[1])[0];
              echo "<a href='#' id='" . $id . "' alt='" . $id . "' title='" . $id . "'>" . (file_get_contents($file)) . "</a>\n";
            }
          }
        } else {
          echo "<article><p>No svg files found.</p></article>";
        }
        ?>
      </section>

      <div class="player">
        <div class="controls">
          <button class="playButton fa fa-play"></button>
          <div class="track">
            <div class="progress"></div>
            <div class="scrubber"></div>
          </div>
          <div class="volume">
            <input class="rngVolume" type="range" min="0" max="100" value="50" /><br />
            <label class="lblVolume" for="rngVolume" />
          </div>
        </div>
        <p id="messageDebug" class="debug"></p>
        <p id="progressStatus" class="debug">&nbsp;</p>
      </div>
    </div>

    <footer>
      <div>
        <a href="http://flylikevenus.com">Fly Like Venus</a> is a rock band from San Diego, CA. Buy <a href="http://flylikevenus.bandcamp.com">Scenes</a> now!
      </div>

      <div>
        Acknowledgements: SVGs designed by <strong>Freepik</strong> from <a href='http://flaticon.com'>Flaticon</a>, except for <em>Sea Waves</em> and <em>Suitcase</em> by <strong>Daniel Bruce</strong>, and <em>Pixel Window</em> by <strong>Pixelvisualization</strong>
      </div>

      <?php //if ($admin) { ?>
      <!--<div>[<a href="?admin=0">display version</a>]</div>-->
      <?php //} else { ?>
      <!--<div>[<a href="?admin=1">admin version</a>]</div>-->
      <?php //} ?>
    </footer>
  </div>

  <script src="/assets/js/vendor/system.js"></script>
  <script>
    SystemJS.import('/assets/js/vendor/jquery.min.js')
      .then(init => SystemJS.import('/assets/js/init.js'))
      .then(markers => SystemJS.import('/assets/js/markers.js'))
      .then(svg => SystemJS.import('/assets/js/svg.js'))
      .then(noise => SystemJS.import('/assets/js/noise.js'))
      .then(main => SystemJS.import('/assets/js/main.js'));
  </script>
</body>
</html>
