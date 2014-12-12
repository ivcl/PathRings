<?php

//always use this username, otherwise you can't get results
$username="liang";

//This is password for you.
$password="AnalysisForLiang";


//this is an example list of entrez ids.
//all you have to do is to make a list of entrezIDs and put them in a string like this.
//the entrezIDs must be comma separated
//$all_entrez_ids="650,651,652";
$all_entrez_ids = $_POST["entrezIDs"];

//This is the function to call my API in eGIFT
$result = file_get_contents("https://biotm.cis.udel.edu/udelafc/getGeneAnalysisResults.php?user=$username&pass=$password&entrezids=$all_entrez_ids");

echo $result;
//The results come in a format just like the CSV you get when you do gene analysis online
//The following is just a sample code to print the CSV file content.
//$result_lines = explode("\n",$result);
//foreach($result_lines as $line){
//	echo $line."<br>";
//}

?>