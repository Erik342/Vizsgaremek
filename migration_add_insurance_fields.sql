-- Biztosítási szerződés adatok kiterjesztése
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `nev` varchar(255) DEFAULT NULL AFTER `statusz`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `lakcim` varchar(500) DEFAULT NULL AFTER `nev`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `szemelyigazolvan_szam` varchar(20) DEFAULT NULL AFTER `lakcim`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `adoszam` varchar(20) DEFAULT NULL AFTER `szemelyigazolvan_szam`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `taj_szam` varchar(20) DEFAULT NULL AFTER `adoszam`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `telefonszam` varchar(20) DEFAULT NULL AFTER `taj_szam`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `email` varchar(255) DEFAULT NULL AFTER `telefonszam`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `szuletesi_datum` date DEFAULT NULL AFTER `email`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `nemzetiseg` varchar(100) DEFAULT NULL AFTER `szuletesi_datum`;
ALTER TABLE `biztositasi_szerzodesek` ADD COLUMN `alairas` varchar(255) DEFAULT NULL AFTER `nemzetiseg`;
