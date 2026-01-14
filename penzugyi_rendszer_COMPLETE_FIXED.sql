-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:3306
-- Kiszolgáló verziója: 5.7.24
-- PHP verzió: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ========================================
-- STORED PROCEDURES
-- ========================================

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `bankkartya_hozzaad` (IN `p_felhasznalo_id` INT, IN `p_kartya_szam` VARCHAR(20), IN `p_lejarat` DATE, IN `p_statusz` VARCHAR(50))
BEGIN
    INSERT INTO bankkartyak (felhasznalo_id, kartya_szam, lejarat, statusz)
    VALUES (p_felhasznalo_id, p_kartya_szam, p_lejarat, p_statusz);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `bankkartya_statusz_modosit` (IN `p_id` INT, IN `p_statusz` VARCHAR(50))
BEGIN
    UPDATE bankkartyak SET statusz = p_statusz WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_letrehoz` (IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_jelszo` VARCHAR(255), IN `p_szerep` VARCHAR(50))
BEGIN
    INSERT INTO felhasznalok (nev, email, jelszo, letrehozasi_ido, szerep)
    VALUES (p_nev, p_email, p_jelszo, NOW(), p_szerep);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_modosit` (IN `p_id` INT, IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_szerep` VARCHAR(50))
BEGIN
    UPDATE felhasznalok
    SET nev = p_nev, email = p_email, szerep = p_szerep
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `kiadas_letrehoz` (IN `p_felhasznalo_id` INT, IN `p_nev` VARCHAR(255), IN `p_tipus` VARCHAR(100), IN `p_osszeg` INT)
BEGIN
    INSERT INTO kiadasok (felhasznalo_id, nev, tipus, osszeg, letrehozasi_ido)
    VALUES (p_felhasznalo_id, p_nev, p_tipus, p_osszeg, NOW());
END$$

DELIMITER ;

-- ========================================
-- DROP existing tables and procedures (to rebuild cleanly)
-- ========================================
DROP PROCEDURE IF EXISTS `bankkartya_hozzaad`;
DROP PROCEDURE IF EXISTS `bankkartya_statusz_modosit`;
DROP PROCEDURE IF EXISTS `felhasznalo_letrehoz`;
DROP PROCEDURE IF EXISTS `felhasznalo_modosit`;
DROP PROCEDURE IF EXISTS `kiadas_letrehoz`;

DROP TABLE IF EXISTS `eletbiztositas`;
DROP TABLE IF EXISTS `gepjarmubiztositas`;
DROP TABLE IF EXISTS `lakasbiztositas`;
DROP TABLE IF EXISTS `biztositasi_szerzodesek`;
DROP TABLE IF EXISTS `bankkartyak`;
DROP TABLE IF EXISTS `kiadasok`;
DROP TABLE IF EXISTS `felhasznalok`;

-- ========================================
-- Create felhasznalok table
-- ========================================
CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nev` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `jelszo` varchar(255) NOT NULL,
  `letrehozasi_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `szerep` enum('user','admin') NOT NULL DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(255) UNIQUE,
  `verification_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Insert felhasznalok data
-- ========================================
INSERT INTO `felhasznalok` (`id`, `nev`, `email`, `jelszo`, `letrehozasi_ido`, `szerep`, `email_verified`, `verification_token`, `verification_token_expires`) VALUES
(4, 'klicsboti', 'botondklics0129@gmail.com', '$2b$10$TU4AEKt90U4AN5HmQyxigu1CfaYJSlt3fD4FyIGl2lGYWdJjgDvOG', '2025-12-18 08:49:35', 'user', 1, NULL, NULL),
(5, 'Zirkl Erik', 'zirklerik@gmail.com', '$2b$10$vgLKeRr/ctr8kFpzQkqWwuRDyTnmqHqyvLajl5aAq01iJ2JeK9ufi', '2026-01-06 11:56:25', 'user', 0, 'b4b86aacd3d56578edd3e8bd18060a53fd456350d37e7bbfaed80993ffdce9cd', '2026-01-07 12:56:25');

-- ========================================
-- Create bankkartyak table
-- ========================================
CREATE TABLE `bankkartyak` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `felhasznalo_id` int(11) NOT NULL,
  `kartya_szam` varchar(50) NOT NULL UNIQUE,
  `lejarat` date NOT NULL,
  `statusz` enum('aktiv','lejart','tiltott') DEFAULT 'aktiv',
  FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  KEY `felhasznalo_id` (`felhasznalo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Create biztositasi_szerzodesek table
-- ========================================
CREATE TABLE `biztositasi_szerzodesek` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `felhasznalo_id` int(11) NOT NULL,
  `tipus` enum('elet','lakas','gepjarmu') NOT NULL,
  `kotesi_datum` date NOT NULL,
  `ervenyes_tol` date NOT NULL,
  `ervenyes_ig` date DEFAULT NULL,
  `havi_dij` decimal(10,2) NOT NULL,
  `statusz` enum('aktiv','szuneteltetett','megszunt') DEFAULT 'aktiv',
  `nev` varchar(255) DEFAULT NULL,
  `lakcim` varchar(500) DEFAULT NULL,
  `szemelyigazolvan_szam` varchar(20) DEFAULT NULL,
  `adoszam` varchar(20) DEFAULT NULL,
  `taj_szam` varchar(20) DEFAULT NULL,
  `telefonszam` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `szuletesi_datum` date DEFAULT NULL,
  `nemzetiseg` varchar(100) DEFAULT NULL,
  FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  KEY `felhasznalo_id` (`felhasznalo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Insert biztositasi_szerzodesek data
-- ========================================
INSERT INTO `biztositasi_szerzodesek` (`id`, `felhasznalo_id`, `tipus`, `kotesi_datum`, `ervenyes_tol`, `ervenyes_ig`, `havi_dij`, `statusz`, `nev`, `lakcim`, `szemelyigazolvan_szam`, `adoszam`, `taj_szam`, `telefonszam`, `email`, `szuletesi_datum`, `nemzetiseg`) VALUES
(1, 5, 'lakas', '2026-01-14', '2026-01-14', '2026-01-22', '8000.00', 'aktiv', 'Zirkl Erik', 'Mohács, Árpád u. 1', '123456AB', '12345678-12', '12345678', '+36 20 123 4567', 'zirklerik@gmail.com', '2004-01-01', 'magyar');

-- ========================================
-- Create eletbiztositas table
-- ========================================
CREATE TABLE `eletbiztositas` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `szerzodes_id` int(11) NOT NULL UNIQUE,
  `biztosított_nev` varchar(255) NOT NULL,
  `szuletesi_datum` date NOT NULL,
  `kockazati_szint` enum('alacsony','kozepes','magas') DEFAULT NULL,
  FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Create gepjarmubiztositas table
-- ========================================
CREATE TABLE `gepjarmubiztositas` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `szerzodes_id` int(11) NOT NULL UNIQUE,
  `rendszam` varchar(20) NOT NULL,
  `alvazszam` varchar(50) DEFAULT NULL,
  `gyartmany` varchar(100) DEFAULT NULL,
  `tipus` varchar(100) DEFAULT NULL,
  `gyartasi_ev` int(11) DEFAULT NULL,
  `biztositas_tipusa` enum('kotelezo','casco','casco+kotelezo') NOT NULL,
  FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Create lakasbiztositas table
-- ========================================
CREATE TABLE `lakasbiztositas` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `szerzodes_id` int(11) NOT NULL UNIQUE,
  `ingatlan_tipus` enum('tarsashaz','csaladi_haz','ikerhaz','egyeb') DEFAULT NULL,
  `ingatlan_ertek` decimal(15,2) NOT NULL,
  `biztositas_tipusa` enum('teljeskoru','alap','tuz','vizkar','lopas') DEFAULT NULL,
  FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ========================================
-- Insert lakasbiztositas data
-- ========================================
INSERT INTO `lakasbiztositas` (`id`, `szerzodes_id`, `ingatlan_tipus`, `ingatlan_ertek`, `biztositas_tipusa`) VALUES
(1, 1, 'csaladi_haz', '76000000.00', 'tuz');

-- ========================================
-- Create kiadasok table (FIXED with AUTO_INCREMENT in PRIMARY KEY)
-- ========================================
CREATE TABLE `kiadasok` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `felhasznalo_id` int(11) NOT NULL,
  `nev` varchar(255) COLLATE utf8_hungarian_ci NOT NULL,
  `tipus` varchar(100) COLLATE utf8_hungarian_ci NOT NULL,
  `osszeg` decimal(10,2) NOT NULL,
  `letrehozasi_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE,
  KEY `felhasznalo_id` (`felhasznalo_id`),
  KEY `letrehozasi_ido` (`letrehozasi_ido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- ========================================
-- Insert kiadasok data
-- ========================================
INSERT INTO `kiadasok` (`id`, `felhasznalo_id`, `nev`, `tipus`, `osszeg`, `letrehozasi_ido`) VALUES
(4, 4, 'Élelmiszer', 'Egyéb', '4000.00', '2025-11-21 15:53:43'),
(5, 4, 'Élelmiszer', 'Egyéb', '3000.00', '2025-11-21 15:53:54'),
(6, 4, 'Életbiztosítás', 'Bizosítás', '4000.00', '2025-11-21 15:54:24'),
(11, 9, 'Elelmiszer', 'Csokoldade', '900.00', '2025-12-09 12:50:27'),
(8, 9, 'Kakaó', 'Élelmiszer', '4000.00', '2025-12-05 09:00:59'),
(9, 9, 'Lakbér', 'Bérlés', '95000.00', '2025-12-05 09:01:15'),
(11, 10, 'CSoki', 'Élelmiszer', '600.00', '2025-12-05 09:02:14');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
