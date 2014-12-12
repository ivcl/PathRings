<?php

//always use this username, otherwise you can't get results
$userID="pathbubbles"; 

//This is password for you.
$password="webgiviForYongnan";

//$entrezIDs = '373854,373885,373886';
 $entrezIDs = $_GET["entrezIDs"];

$result = file_get_contents("http://raven.anr.udel.edu/~sunliang/webgivi/webgiviAPI.php?userID=$userID&password=$password&entrezIDs=$entrezIDs");

echo $result;


?>