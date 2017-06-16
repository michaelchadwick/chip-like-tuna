<!doctype html>
<html>
<head>
  <title>Chip Like Tuna</title>
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="icon" href="favicon.ico">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
  <script src="/assets/js/main.js"></script>
</head>
<body>
  <div id="wrap">
    <div id="main">
      <h1>FLV TV</h1>
      <section id="screen">
        <?php echo file_get_contents("assets/flv-scenes/svg/00-flv.min.svg") ?>
      </section>
      <section id="controls">
        <?php
          $dir = "./assets/flv-scenes/svg/";
          $dir_handle = opendir($dir);
          $files = array();

          while (($file=readdir($dir_handle)) !== false) {
            array_push($files, $dir . $file);
          }
          closedir($dir_handle);
          sort($files);

          if (sizeof($files) > 0) {
            $i = 0;
            foreach ($files as $file) {
              if (pathinfo($file)['extension'] == "svg")
                echo "<a href='#' id='" . $i++ . "'>" . (file_get_contents($file)) . "</a>\n";
            }
          } else {
            echo "<article><p>No svg files found.</p></article>";
          }
        ?>
      </section>
    </div>
  </div>
</body>
</html>
