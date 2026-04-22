-- Kiadások tábla
CREATE TABLE IF NOT EXISTS kiadasok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  felhasznalo_id INT NOT NULL,
  nev VARCHAR(255) NOT NULL,
  tipus VARCHAR(100) NOT NULL,
  osszeg DECIMAL(10, 2) NOT NULL,
  leiras TEXT,
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
  INDEX idx_felhasznalo_id (felhasznalo_id),
  INDEX idx_letrehozasi_ido (letrehozasi_ido)
);

-- Ha már létezik a tábla, add hozzá az leiras colont
ALTER TABLE kiadasok ADD COLUMN leiras TEXT AFTER osszeg;
