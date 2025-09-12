<?php
session_start();
if ($_SESSION['szerep'] !== 'user') {
    die("Ez a felület csak sima felhasználóknak elérhető!");
}
echo "Üdv a felhasználói felületen, " . htmlspecialchars($_SESSION['email']);
