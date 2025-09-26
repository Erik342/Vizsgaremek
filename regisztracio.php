<?php
require 'kapcsolat.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nev = trim($_POST['nev']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    if (empty($nev)) {
        die("A név megadása kötelező!");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Hibás email formátum!");
    }

    if (strlen($password) < 6) {
        die("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
    }

    $stmt = $pdo->prepare("INSERT INTO felhasznalok (nev, email, jelszo, szerep) VALUES (?, ?, ?, 'user')");
    try {
        $stmt->execute([$nev, $email, $password]);
        echo "Sikeres regisztráció! <a href='bejelentkezes.php'>Bejelentkezés</a>";
    } catch (PDOException $e) {
        echo "Hiba: " . $e->getMessage();
    }
}
?>

<form method="post">
    Név: <input type="text" name="nev" required><br>
    Email: <input type="email" name="email" required><br>
    Jelszó: <input type="password" name="password" required><br>
    <button type="submit">Regisztráció</button>
</form>
