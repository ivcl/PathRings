<?php
		$command = escapeshellcmd("python ../scripts/expand-entity-symbol.py " . $_GET['name']);
		$output = shell_exec($command);
		echo($output);
?>