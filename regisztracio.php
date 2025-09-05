<?php
require 'kapcsolat.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Hibás email formátum!");
    }

    if (strlen($password) < 6) {
        die("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
    }

    $stmt = $pdo->prepare("INSERT INTO felhasznalok (email, jelszo, szerep) VALUES (?, ?, 'user')");
    try {
        $stmt->execute([$email, $password]);
        echo "Sikeres regisztráció! <a href='bejelentkezes.php'>Bejelentkezés</a>";
    } catch (PDOException $e) {
        echo "Hiba: " . $e->getMessage();
    }
}
?>

<form method="post">
    Email: <input type="email" name="email" required><br>
    Jelszó: <input type="password" name="password" required><br>
    <button type="submit">Regisztráció</button>
</form>


