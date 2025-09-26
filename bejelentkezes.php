<?php
require 'kapcsolat.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM felhasznalok WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && $password === $user['jelszo']) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['nev'] = $user['nev'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['szerep'] = $user['szerep'];

        if ($user['szerep'] === 'admin') {
            echo "Sikeres bejelentkezés ADMINKÉNT! 🎉<br>";
            echo "<a href='admin.php'>Admin felület</a>";
        } else {
            echo "Sikeres bejelentkezés FELHASZNÁLÓKÉNT! 👤<br>";
            echo "<a href='felhasznalo.php'>Felhasználói felület</a>";
        }
    } else {
        echo "Hibás email vagy jelszó!";
    }
}
?>

<form method="post">
    Email: <input type="email" name="email" required><br>
    Jelszó: <input type="password" name="password" required><br>
    <button type="submit">Bejelentkezés</button>
</form>