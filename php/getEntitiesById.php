<?php
    $command = escapeshellcmd("python ../scripts/get-entities-by-id.py " . $_GET['ids']);
    $output = shell_exec($command);
   echo($output);
?>