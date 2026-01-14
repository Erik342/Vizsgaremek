-- phpMyAdmin SQL Dump - FIXED VERSION
-- version 5.1.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ========================================
-- FIX 1: Add UNIQUE constraint to email in felhasznalok
-- ========================================
ALTER TABLE `felhasznalok`
  ADD UNIQUE KEY `email` (`email`);

-- ========================================
-- FIX 2: Add AUTO_INCREMENT to kiadasok
-- ========================================
ALTER TABLE `kiadasok`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ========================================
-- FIX 3: Ensure all PRIMARY KEYs and FOREIGN KEYs are correct
-- ========================================

-- bankkartyak is already correct
-- biztositasi_szerzodesek is already correct
-- eletbiztositas is already correct
-- felhasznalok is already correct
-- gepjramubiztositas is already correct
-- lakasbiztositas is already correct

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
