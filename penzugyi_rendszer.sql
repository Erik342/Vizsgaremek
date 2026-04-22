-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:3306
-- Létrehozás ideje: 2026. Ápr 22. 10:16
-- Kiszolgáló verziója: 5.7.24
-- PHP verzió: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `penzugyi_rendszer`
--

DELIMITER $$
--
-- Eljárások
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `bankkartya_hozzaad` (IN `p_felhasznalo_id` INT, IN `p_kartya_szam` VARCHAR(20), IN `p_lejarat` DATE, IN `p_statusz` VARCHAR(50))   BEGIN
    INSERT INTO bankkartyak (felhasznalo_id, kartya_szam, lejarat, statusz)
    VALUES (p_felhasznalo_id, p_kartya_szam, p_lejarat, p_statusz);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `bankkartya_statusz_modosit` (IN `p_id` INT, IN `p_statusz` VARCHAR(50))   BEGIN
    UPDATE bankkartyak SET statusz = p_statusz WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `biztositas_statusz_modosit` (IN `p_id` INT, IN `p_statusz` ENUM('aktiv','szuneteltetett','megszunt',''))   BEGIN
    UPDATE biztositasi_szerzodesek
    SET statusz = p_statusz
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `biztositas_szerzodes_letrehoz` (IN `p_felhasznalo_id` INT, IN `p_tipus` ENUM('elet','lakas','gepjarmu',''), IN `p_kotesi_datum` DATE, IN `p_ervenyes_tol` DATE, IN `p_ervenyes_ig` DATE, IN `p_havi_dij` DECIMAL(10,2))   BEGIN
    INSERT INTO biztositasi_szerzodesek
    (felhasznalo_id, tipus, kotesi_datum, ervenyes_tol, ervenyes_ig, havi_dij)
    VALUES
    (p_felhasznalo_id, p_tipus, p_kotesi_datum, p_ervenyes_tol, p_ervenyes_ig, p_havi_dij);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `eletbiztositas_letrehoz` (IN `p_szerzodes_id` INT, IN `p_biztositott_nev` VARCHAR(255), IN `p_szuletesi_datum` DATE, IN `p_kockazati_szint` ENUM('alacsony','kozepes','magas',''))   BEGIN
    INSERT INTO eletbiztositas
    (szerzodes_id, biztosított_nev, szuletesi_datum, kockazati_szint)
    VALUES
    (p_szerzodes_id, p_biztositott_nev, p_szuletesi_datum, p_kockazati_szint);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_letrehoz` (IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_jelszo` VARCHAR(255), IN `p_szerep` VARCHAR(50))   BEGIN
    INSERT INTO felhasznalok (nev, email, jelszo, letrehozasi_ido, szerep)
    VALUES (p_nev, p_email, p_jelszo, NOW(), p_szerep);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_modosit` (IN `p_id` INT, IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_szerep` VARCHAR(50))   BEGIN
    UPDATE felhasznalok
    SET nev = p_nev, email = p_email, szerep = p_szerep
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `gepjarmubiztositas_letrehoz` (IN `p_szerzodes_id` INT, IN `p_rendszam` VARCHAR(20), IN `p_alvazszam` VARCHAR(50), IN `p_gyartmany` VARCHAR(100), IN `p_tipus` VARCHAR(100), IN `p_gyartasi_ev` INT, IN `p_biztositas_tipusa` ENUM('kotelezo','casco','casco+kotelezo',''))   BEGIN
    INSERT INTO gepjramubiztositas
    (szerzodes_id, rendszam, alvazszam, gyartmany, tipus, gyartasi_ev, biztositas_tipusa)
    VALUES
    (p_szerzodes_id, p_rendszam, p_alvazszam, p_gyartmany, p_tipus, p_gyartasi_ev, p_biztositas_tipusa);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `kiadas_letrehoz` (IN `p_felhasznalo_id` INT, IN `p_nev` VARCHAR(255), IN `p_tipus` VARCHAR(100), IN `p_osszeg` INT)   BEGIN
    INSERT INTO kiadasok (felhasznalo_id, nev, tipus, osszeg, letrehozasi_ido)
    VALUES (p_felhasznalo_id, p_nev, p_tipus, p_osszeg, NOW());
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `kiadas_torol` (IN `p_id` INT)   BEGIN
    DELETE FROM kiadasok WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `lakasbiztositas_letrehoz` (IN `p_szerzodes_id` INT, IN `p_ingatlan_tipus` ENUM('tarsashaz','csaladi_haz','ikerhaz','egyeb'), IN `p_ingatlan_ertek` DECIMAL(15,2), IN `p_biztositas_tipusa` ENUM('teljeskoru','alap','tuz','vizkar','lopas'))   BEGIN
    INSERT INTO lakasbiztositas
    (szerzodes_id, ingatlan_tipus, ingatlan_ertek, biztositas_tipusa)
    VALUES
    (p_szerzodes_id, p_ingatlan_tipus, p_ingatlan_ertek, p_biztositas_tipusa);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `bankkartyak`
--

CREATE TABLE `bankkartyak` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `kartya_szam` varchar(50) NOT NULL,
  `lejarat` date NOT NULL,
  `statusz` enum('aktiv','lejart','tiltott') DEFAULT 'aktiv'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `biztositasi_szerzodesek`
--

CREATE TABLE `biztositasi_szerzodesek` (
  `id` int(11) NOT NULL,
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
  `nemzetiseg` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `csaladok`
--

CREATE TABLE `csaladok` (
  `id` int(11) NOT NULL,
  `nev` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `letrehozasi_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `csalad_meghivok`
--

CREATE TABLE `csalad_meghivok` (
  `id` int(11) NOT NULL,
  `csaladok_id` int(11) NOT NULL,
  `kod` varchar(8) NOT NULL,
  `letrehozas_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lejarat_ido` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `eletbiztositas`
--

CREATE TABLE `eletbiztositas` (
  `id` int(11) NOT NULL,
  `szerzodes_id` int(11) NOT NULL,
  `biztosított_nev` varchar(255) NOT NULL,
  `szuletesi_datum` date NOT NULL,
  `kockazati_szint` enum('alacsony','kozepes','magas') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `felhasznalok`
--

CREATE TABLE `felhasznalok` (
  `id` int(11) NOT NULL,
  `nev` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `jelszo` varchar(255) NOT NULL,
  `letrehozasi_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `szerep` enum('user','admin') NOT NULL DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'HUF',
  `location` varchar(255) DEFAULT NULL,
  `profile_picture` longtext,
  `has_completed_onboarding` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `nev`, `email`, `jelszo`, `letrehozasi_ido`, `szerep`, `email_verified`, `verification_token`, `verification_token_expires`, `currency`, `location`, `profile_picture`, `has_completed_onboarding`) VALUES
(21, 'admin123@gmail.com', 'admin123@gmail.com', '$2b$10$Yq6WlHU7MF926zmfnfz8keKAWmCWlRRa.1rMONVxoJrbHa5ax0ony', '2026-02-27 12:44:05', 'user', 0, '3a12774587d16786e3b177fb8cc841e0040bef5dd7c98b83ee102da648f8ca04', '2026-02-28 13:44:05', 'HUF', NULL, NULL, 1),
(22, 'abc123', 'abc123@gmail.com', '$2b$10$MuDzSR/lhEEFZfYRyndcIeq9ke2W.lTIzB13ADCJ0gjB5Ud0IEowS', '2026-03-03 10:09:05', 'user', 0, '5537e608a2062b89de73da8351cffa0e70bc15f2f4b96d9cbd1b77b58920ac62', '2026-03-04 11:09:06', 'HUF', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `gepjarmubiztositas`
--

CREATE TABLE `gepjarmubiztositas` (
  `id` int(11) NOT NULL,
  `szerzodes_id` int(11) NOT NULL,
  `rendszam` varchar(20) NOT NULL,
  `alvazszam` varchar(50) DEFAULT NULL,
  `gyartmany` varchar(100) DEFAULT NULL,
  `tipus` varchar(100) DEFAULT NULL,
  `gyartasi_ev` int(11) DEFAULT NULL,
  `biztositas_tipusa` enum('kotelezo','casco','casco+kotelezo') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `inbox_messages`
--

CREATE TABLE `inbox_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_read` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `inbox_messages`
--

INSERT INTO `inbox_messages` (`id`, `user_id`, `type`, `title`, `message`, `icon`, `is_read`, `created_at`) VALUES
(1, 6, 'notification', 'ASd', 'asder', NULL, 0, '2026-02-26 09:27:58'),
(2, 7, 'notification', 'ASd', 'asder', NULL, 0, '2026-02-26 09:27:58'),
(3, 19, 'notification', 'ASd', 'asder', NULL, 0, '2026-02-26 09:27:58');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `kiadasok`
--

CREATE TABLE `kiadasok` (
  `id` int(11) NOT NULL,
  `felhasznalo_id` int(11) NOT NULL,
  `nev` varchar(255) COLLATE utf8_hungarian_ci NOT NULL,
  `tipus` varchar(100) COLLATE utf8_hungarian_ci NOT NULL,
  `osszeg` decimal(10,2) NOT NULL,
  `letrehozasi_ido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `kiadasok`
--

INSERT INTO `kiadasok` (`id`, `felhasznalo_id`, `nev`, `tipus`, `osszeg`, `letrehozasi_ido`) VALUES
(13, 21, 'Kenyér', 'Élelmiszer', '1000.00', '2026-02-27 12:45:37');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `lakasbiztositas`
--

CREATE TABLE `lakasbiztositas` (
  `id` int(11) NOT NULL,
  `szerzodes_id` int(11) NOT NULL,
  `ingatlan_tipus` enum('tarsashaz','csaladi_haz','ikerhaz','egyeb') DEFAULT NULL,
  `ingatlan_ertek` decimal(15,2) NOT NULL,
  `biztositas_tipusa` enum('teljeskoru','alap','tuz','vizkar','lopas') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `bankkartyak`
--
ALTER TABLE `bankkartyak`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kartya_szam` (`kartya_szam`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- A tábla indexei `biztositasi_szerzodesek`
--
ALTER TABLE `biztositasi_szerzodesek`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- A tábla indexei `csaladok`
--
ALTER TABLE `csaladok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_owner_id` (`owner_id`);

--
-- A tábla indexei `csalad_meghivok`
--
ALTER TABLE `csalad_meghivok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kod` (`kod`),
  ADD KEY `idx_csaladok_id` (`csaladok_id`),
  ADD KEY `idx_kod` (`kod`);

--
-- A tábla indexei `eletbiztositas`
--
ALTER TABLE `eletbiztositas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `szerzodes_id` (`szerzodes_id`);

--
-- A tábla indexei `felhasznalok`
--
ALTER TABLE `felhasznalok`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `verification_token` (`verification_token`);

--
-- A tábla indexei `gepjarmubiztositas`
--
ALTER TABLE `gepjarmubiztositas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `szerzodes_id` (`szerzodes_id`);

--
-- A tábla indexei `inbox_messages`
--
ALTER TABLE `inbox_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- A tábla indexei `kiadasok`
--
ALTER TABLE `kiadasok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `felhasznalo_id` (`felhasznalo_id`);

--
-- A tábla indexei `lakasbiztositas`
--
ALTER TABLE `lakasbiztositas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `szerzodes_id` (`szerzodes_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `bankkartyak`
--
ALTER TABLE `bankkartyak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `biztositasi_szerzodesek`
--
ALTER TABLE `biztositasi_szerzodesek`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `csaladok`
--
ALTER TABLE `csaladok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `csalad_meghivok`
--
ALTER TABLE `csalad_meghivok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `eletbiztositas`
--
ALTER TABLE `eletbiztositas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT a táblához `gepjarmubiztositas`
--
ALTER TABLE `gepjarmubiztositas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `inbox_messages`
--
ALTER TABLE `inbox_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `kiadasok`
--
ALTER TABLE `kiadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT a táblához `lakasbiztositas`
--
ALTER TABLE `lakasbiztositas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `bankkartyak`
--
ALTER TABLE `bankkartyak`
  ADD CONSTRAINT `bankkartyak_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `biztositasi_szerzodesek`
--
ALTER TABLE `biztositasi_szerzodesek`
  ADD CONSTRAINT `biztositasi_szerzodesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `csaladok`
--
ALTER TABLE `csaladok`
  ADD CONSTRAINT `csaladok_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `csalad_meghivok`
--
ALTER TABLE `csalad_meghivok`
  ADD CONSTRAINT `csalad_meghivok_ibfk_1` FOREIGN KEY (`csaladok_id`) REFERENCES `csaladok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `eletbiztositas`
--
ALTER TABLE `eletbiztositas`
  ADD CONSTRAINT `eletbiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `gepjarmubiztositas`
--
ALTER TABLE `gepjarmubiztositas`
  ADD CONSTRAINT `gepjarmubiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `kiadasok`
--
ALTER TABLE `kiadasok`
  ADD CONSTRAINT `kiadasok_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `lakasbiztositas`
--
ALTER TABLE `lakasbiztositas`
  ADD CONSTRAINT `lakasbiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
