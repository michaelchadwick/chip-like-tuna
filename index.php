<!doctype html>
<html>
<head>
  <title>Chip Like Tuna</title>
  <link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
  <div id="wrap">
    <div id="main">
      <h1>FLV TV</h1>
      <section id="screen">
        <?php echo file_get_contents("assets/flv-scenes/svg/01-docking.min.svg") ?>
      </section>
      <section id="controls">
        <?php
          $dir = opendir("./assets/flv-scenes/svg");
          $files = array();

          // Read all the svg files
          while (($file=readdir($dir)) !== false) {
            array_push($files, './assets/flv-scenes/svg/' . $file);
          }
          closedir($dir);
          sort($files);

          // Make <dt>s if there are any subdirectories.
          if (sizeof($files) > 0) {
            foreach ($files as $file) {
              echo "<a href='#'>" . file_get_contents($file) . "</a>\n";
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
