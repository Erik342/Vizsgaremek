<?php
session_start();
session_destroy();
header("Location: bejelentkezes.php");
exit;