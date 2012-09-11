<?php
  require_once 'connect.php';
  if (isset($SHALL_LOG_OUT))
  {
    $_SESSION = array(); setcookie(session_name(), '', time() - 42000); session_destroy(); 
    header('location: index.php');
  }

?>
<!DOCTYPE html>
<html>
<head>
  <meta name="fragment" content="!">
  <meta charset="UTF-8">
  <title>Test Title</title>
  <link rel="stylesheet" type="text/css" href="style.css" />
  <link rel="stylesheet" type="text/css" href="css/shCore.css" />
  <link rel="stylesheet" type="text/css" href="css/shThemeDefault.css" />
  <link rel="stylesheet" type="text/css" href="css/prettify.css" />
  <link rel="stylesheet" type="text/css" href="font-awesome.css" />
</head>
<body onload="prettyPrint()">
<div class="site-title">Test Title</div>
<div id="container" class="clearfix">
