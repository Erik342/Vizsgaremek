-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Gép: localhost:3306
-- Létrehozás ideje: 2025. Dec 09. 13:07
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
    UPDATE bankkartyak
    SET statusz = p_statusz
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_letrehoz` (IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_jelszo` VARCHAR(255), IN `p_szerep` VARCHAR(50))   BEGIN
    INSERT INTO felhasznalok (nev, email, jelszo, letrehozasi_ido, szerep)
    VALUES (p_nev, p_email, p_jelszo, NOW(), p_szerep);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `felhasznalo_modosit` (IN `p_id` INT, IN `p_nev` VARCHAR(255), IN `p_email` VARCHAR(255), IN `p_szerep` VARCHAR(50))   BEGIN
    UPDATE felhasznalok
    SET nev = p_nev,
        email = p_email,
        szerep = p_szerep
    WHERE id = p_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `kiadas_letrehoz` (IN `p_felhasznalo_id` INT, IN `p_nev` VARCHAR(255), IN `p_tipus` VARCHAR(100), IN `p_osszeg` INT)   BEGIN
    INSERT INTO kiadasok (felhasznalo_id, nev, tipus, osszeg, letrehozasi_ido)
    VALUES (p_felhasznalo_id, p_nev, p_tipus, p_osszeg, NOW());
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
  `statusz` enum('aktiv','szuneteltetett','megszunt') DEFAULT 'aktiv'
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
  `szerep` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- A tábla adatainak kiíratása `felhasznalok`
--

INSERT INTO `felhasznalok` (`id`, `nev`, `email`, `jelszo`, `letrehozasi_ido`, `szerep`) VALUES
(4, 'klicsboti', 'botondklics0129@gmail.com', '$2b$10$HoAUeUqBqN22qytQsAoXoOUx45h0mOG6azHeD9SM0lZbKId/15ii2', '2025-11-13 16:36:23', 'admin'),
(5, 'erik', 'zirklerik@gmail.com', '$2b$10$sEHf9MPtuneuO/r0EuWRO.bdKI7fm/LXFK7Xpo6nPTauwzYcyOJlm', '2025-11-13 16:43:59', 'admin'),
(6, 'kevin', 'bakokevin0120@gmail.com', '$2b$10$h.Er5DOr9fAJXOHmFA1pLONplYya.LNVrmkBwAEu7PCDeVRi07GX6', '2025-11-20 09:11:20', 'admin'),
(7, 'asd123', 'bakokevinmag@gmail.com', '$2b$10$jCUh8HiuMOJc3oB9eGZlNetXAC2qeC4zyLnQXKhLXwIrN.Z0.VjAe', '2025-11-21 08:51:22', 'admin'),
(8, 'Peti', 'mpeti@gmail.com', '$2b$10$M77DBq6rmQ8fQ3kY.qxGxex1GcA6m9RAscv7BscQUq3W/hvK6DwWy', '2025-12-02 11:35:07', 'admin'),
(9, 'asdd', 'asdd', 'asd', '2025-12-09 12:01:12', 'user');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `gepjramubiztositas`
--

CREATE TABLE `gepjramubiztositas` (
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
(4, 4, 'Élelmiszer', 'Egyéb', '4000.00', '2025-11-21 15:53:43'),
(5, 4, 'Élelmiszer', 'Egyéb', '3000.00', '2025-11-21 15:53:54'),
(6, 4, 'Életbiztosítás', 'Bizosítás', '4000.00', '2025-11-21 15:54:24'),
(10, 5, '', '', '500.00', '2025-12-09 12:50:03'),
(11, 9, 'Elelmiszer', 'Csokoldade', '900.00', '2025-12-09 12:50:27');

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
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `gepjramubiztositas`
--
ALTER TABLE `gepjramubiztositas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `szerzodes_id` (`szerzodes_id`);

--
-- A tábla indexei `kiadasok`
--
ALTER TABLE `kiadasok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_felhasznalo_id` (`felhasznalo_id`),
  ADD KEY `idx_letrehozasi_ido` (`letrehozasi_ido`);

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
-- AUTO_INCREMENT a táblához `eletbiztositas`
--
ALTER TABLE `eletbiztositas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `felhasznalok`
--
ALTER TABLE `felhasznalok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT a táblához `gepjramubiztositas`
--
ALTER TABLE `gepjramubiztositas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `kiadasok`
--
ALTER TABLE `kiadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  ADD CONSTRAINT `bankkartyak_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`);

--
-- Megkötések a táblához `biztositasi_szerzodesek`
--
ALTER TABLE `biztositasi_szerzodesek`
  ADD CONSTRAINT `biztositasi_szerzodesek_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`);

--
-- Megkötések a táblához `eletbiztositas`
--
ALTER TABLE `eletbiztositas`
  ADD CONSTRAINT `eletbiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`);

--
-- Megkötések a táblához `gepjramubiztositas`
--
ALTER TABLE `gepjramubiztositas`
  ADD CONSTRAINT `gepjramubiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`);

--
-- Megkötések a táblához `kiadasok`
--
ALTER TABLE `kiadasok`
  ADD CONSTRAINT `kiadasok_ibfk_1` FOREIGN KEY (`felhasznalo_id`) REFERENCES `felhasznalok` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `lakasbiztositas`
--
ALTER TABLE `lakasbiztositas`
  ADD CONSTRAINT `lakasbiztositas_ibfk_1` FOREIGN KEY (`szerzodes_id`) REFERENCES `biztositasi_szerzodesek` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
