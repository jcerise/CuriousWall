<?php
error_reporting(E_ALL);
session_name('cwHello'); session_set_cookie_params(10*365*24*60*60); session_start();

$db_host    = 'localhost';
$db_user    = 'curious_wall';
$db_pass    = 'curious';
$db_name    = 'curious';

$db = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass
      , array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8")
);

$link = mysql_connect($db_host, $db_user, $db_pass);
mysql_select_db("curious", $link) or die(mysql_error());

// display diamond next to admins/mods name, and output the username

function theusername($name,$permissions) {
if ($permissions == 1) echo $name . "♦";
else echo $name;
}


// display if a topic is locked in the topics title
function displaytopiclocked($topicname,$islocked) {
  if ($islocked == 1) echo $topicname . ' <i class="icon-lock"></i>';
else echo $topicname;
}
?>
