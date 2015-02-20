<?php
		$command = escapeshellcmd("python ../scripts/expand-entity-symbol.py " . $_GET['symbols']);
		$output = shell_exec($command);
		echo($output);
?>