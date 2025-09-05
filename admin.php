<?php
session_start();
if ($_SESSION['szerep'] !== 'admin') {
    die("Nincs jogosultságod az admin felülethez!");
}
echo "Üdv az admin felületen, " . htmlspecialchars($_SESSION['email']);
