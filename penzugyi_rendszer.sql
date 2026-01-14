-- Create database if not exists
CREATE DATABASE IF NOT EXISTS penzugyi_rendszer;
USE penzugyi_rendszer;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS felhasznalok (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nev VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  jelszo VARCHAR(255) NOT NULL,
  szerep VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) UNIQUE,
  verification_token_expires DATETIME,
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insurance contracts table
CREATE TABLE IF NOT EXISTS biztositasi_szerzodesek (
  id INT PRIMARY KEY AUTO_INCREMENT,
  felhasznalo_id INT NOT NULL,
  tipus ENUM('elet', 'lakas', 'gepjarmu') NOT NULL,
  kotesi_datum DATE NOT NULL,
  ervenyes_tol DATE NOT NULL,
  ervenyes_ig DATE,
  havi_dij DECIMAL(10, 2) NOT NULL,
  statusz ENUM('aktiv', 'szuneteltetett', 'megszunt') DEFAULT 'aktiv',
  nev VARCHAR(255),
  lakcim VARCHAR(255),
  szemelyigazolvan_szam VARCHAR(20),
  adoszam VARCHAR(20),
  taj_szam VARCHAR(20),
  telefonszam VARCHAR(20),
  email VARCHAR(255),
  szuletesi_datum DATE,
  nemzetiseg VARCHAR(50),
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
  INDEX idx_user_id (felhasznalo_id),
  INDEX idx_tipus (tipus)
);

-- Life insurance details table
CREATE TABLE IF NOT EXISTS eletbiztositas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  szerzodes_id INT NOT NULL,
  biztosított_nev VARCHAR(255),
  szuletesi_datum DATE,
  kockazati_szint ENUM('alacsony', 'kozepes', 'magas'),
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (szerzodes_id) REFERENCES biztositasi_szerzodesek(id) ON DELETE CASCADE,
  INDEX idx_contract_id (szerzodes_id)
);

-- Home insurance details table
CREATE TABLE IF NOT EXISTS lakasbiztositas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  szerzodes_id INT NOT NULL,
  ingatlan_tipus ENUM('tarsashaz', 'csaladi_haz', 'ikerhaz', 'egyeb'),
  ingatlan_ertek DECIMAL(15, 2),
  biztositas_tipusa ENUM('teljeskoru', 'alap', 'tuz', 'vizkar', 'lopas'),
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (szerzodes_id) REFERENCES biztositasi_szerzodesek(id) ON DELETE CASCADE,
  INDEX idx_contract_id (szerzodes_id)
);

-- Car insurance details table
CREATE TABLE IF NOT EXISTS gepjarmubiztositas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  szerzodes_id INT NOT NULL,
  rendszam VARCHAR(20),
  alvazszam VARCHAR(50),
  gyartmany VARCHAR(100),
  tipus VARCHAR(100),
  gyartasi_ev INT,
  biztositas_tipusa ENUM('kotelezo', 'casco', 'casco+kotelezo'),
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (szerzodes_id) REFERENCES biztositasi_szerzodesek(id) ON DELETE CASCADE,
  INDEX idx_contract_id (szerzodes_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS kiadasok (
  id INT PRIMARY KEY AUTO_INCREMENT,
  felhasznalo_id INT NOT NULL,
  nev VARCHAR(255) NOT NULL,
  tipus VARCHAR(100),
  osszeg DECIMAL(10, 2) NOT NULL,
  letrehozasi_ido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (felhasznalo_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
  INDEX idx_user_id (felhasznalo_id),
  INDEX idx_creation_time (letrehozasi_ido)
);

-- Create indexes for better query performance
CREATE INDEX idx_biztositasi_szerzodesek_user ON biztositasi_szerzodesek(felhasznalo_id);
CREATE INDEX idx_biztositasi_szerzodesek_tipus ON biztositasi_szerzodesek(tipus);
CREATE INDEX idx_kiadasok_user ON kiadasok(felhasznalo_id);
