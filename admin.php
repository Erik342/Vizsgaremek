<?php
session_start();
<<<<<<< HEAD
require 'kapcsolat.php';

if ($_SESSION['szerep'] !== 'admin') {
    die("Nincs jogosultságod az admin felülethez!");
}

$action = $_GET['action'] ?? 'list';

// Új felhasználó létrehozása
if ($action === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $jelszo = $_POST['jelszo'];
    $szerep = $_POST['szerep'];

    $stmt = $pdo->prepare("INSERT INTO felhasznalok (email, jelszo, szerep) VALUES (?, ?, ?)");
    $stmt->execute([$email, $jelszo, $szerep]);

    header("Location: admin.php?action=list");
    exit;
}

// Felhasználó szerkesztése
if ($action === 'edit' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];

    // Ellenőrizzük, hogy nem admin-e az adott user
    $check = $pdo->prepare("SELECT szerep FROM felhasznalok WHERE id = ?");
    $check->execute([$id]);
    $user = $check->fetch();

    if ($user && $user['szerep'] === 'admin') {
        die("Admin felhasználót nem lehet szerkeszteni!");
    }

    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $jelszo = $_POST['jelszo'];
    $szerep = $_POST['szerep'];

    $stmt = $pdo->prepare("UPDATE felhasznalok SET email = ?, jelszo = ?, szerep = ? WHERE id = ?");
    $stmt->execute([$email, $jelszo, $szerep, $id]);

    header("Location: admin.php?action=list");
    exit;
}

// Felhasználó törlése
if ($action === 'delete') {
    $id = $_GET['id'];

    // Admin törlés tiltása
    $check = $pdo->prepare("SELECT szerep FROM felhasznalok WHERE id = ?");
    $check->execute([$id]);
    $user = $check->fetch();

    if ($user && $user['szerep'] === 'admin') {
        die("Admin felhasználót nem lehet törölni!");
    }

    $stmt = $pdo->prepare("DELETE FROM felhasznalok WHERE id = ?");
    $stmt->execute([$id]);

    header("Location: admin.php?action=list");
    exit;
}
?>

<h1>Admin felület</h1>
<p>Üdv, <?= htmlspecialchars($_SESSION['email']) ?>!</p>
<p><a href="kilepes.php">Kijelentkezés</a></p>
<hr>

<?php if ($action === 'list'): ?>
    <h2>Felhasználók listája</h2>
    <a href="admin.php?action=add">➕ Új felhasználó</a>
    <br><br>
    <?php
    $stmt = $pdo->query("SELECT * FROM felhasznalok");
    $felhasznalok = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ?>
    <table border="1" cellpadding="5">
        <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Szerep</th>
            <th>Műveletek</th>
        </tr>
        <?php foreach ($felhasznalok as $f): ?>
            <tr>
                <td><?= htmlspecialchars($f['id']) ?></td>
                <td><?= htmlspecialchars($f['email']) ?></td>
                <td><?= htmlspecialchars($f['szerep']) ?></td>
                <td>
                    <?php if ($f['szerep'] !== 'admin'): ?>
                        <a href="admin.php?action=edit&id=<?= $f['id'] ?>">✏️ Szerkesztés</a> |
                        <a href="admin.php?action=delete&id=<?= $f['id'] ?>" onclick="return confirm('Biztos törlöd?')">🗑️ Törlés</a>
                    <?php else: ?>
                        🔒 Nem módosítható
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>

<?php elseif ($action === 'add'): ?>
    <h2>Új felhasználó hozzáadása</h2>
    <form method="post" action="admin.php?action=add">
        Email: <input type="email" name="email" required><br>
        Jelszó: <input type="password" name="jelszo" required><br>
        Szerep:
        <select name="szerep">
            <option value="user">Felhasználó</option>
            <option value="admin">Admin</option>
        </select><br>
        <button type="submit">Hozzáadás</button>
    </form>
    <p><a href="admin.php?action=list">⬅ Vissza a listához</a></p>

<?php elseif ($action === 'edit'):
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("SELECT * FROM felhasznalok WHERE id = ?");
    $stmt->execute([$id]);
    $felhasznalo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$felhasznalo) {
        die("Nincs ilyen felhasználó!");
    }

    if ($felhasznalo['szerep'] === 'admin') {
        die("Admin felhasználót nem lehet szerkeszteni!");
    }
    ?>
    <h2>Felhasználó szerkesztése</h2>
    <form method="post" action="admin.php?action=edit">
        <input type="hidden" name="id" value="<?= $felhasznalo['id'] ?>">
        Email: <input type="email" name="email" value="<?= htmlspecialchars($felhasznalo['email']) ?>" required><br>
        Jelszó: <input type="text" name="jelszo" value="<?= htmlspecialchars($felhasznalo['jelszo']) ?>" required><br>
        Szerep:
        <select name="szerep">
            <option value="user" <?= $felhasznalo['szerep']==='user'?'selected':'' ?>>Felhasználó</option>
            <option value="admin" <?= $felhasznalo['szerep']==='admin'?'selected':'' ?>>Admin</option>
        </select><br>
        <button type="submit">Mentés</button>
    </form>
    <p><a href="admin.php?action=list">⬅ Vissza a listához</a></p>

<?php endif; ?>
=======
if ($_SESSION['szerep'] !== 'admin') {
    die("Nincs jogosultságod az admin felülethez!");
}
echo "Üdv az admin felületen, " . htmlspecialchars($_SESSION['email']);
>>>>>>> 24307fb08d99e32b9246a55f0416331592e2943c
