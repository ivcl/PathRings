<?php
    error_reporting(E_ALL ^ E_DEPRECATED);
    $username="pathrings"; //replace with your mySql username
    $password="";  //replace with your mySql password
    $database="protein";  //replace with your mySql database name
    $host="localhost";  //replace with the name of the machine your mySql runs on
    $connection=mysql_connect($host,$username,$password);
?>