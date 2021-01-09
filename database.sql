-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 09 jan. 2021 à 13:56
-- Version du serveur :  5.7.31
-- Version de PHP : 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Appli Emprunt`
--

-- --------------------------------------------------------

--
-- Structure de la table `devices`
--

DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `deviceID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `version` varchar(15) NOT NULL,
  `ref` varchar(5) NOT NULL,
  `stock` int(11) DEFAULT NULL,
  PRIMARY KEY (`deviceID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `devices`
--

INSERT INTO `devices` (`deviceID`, `name`, `version`, `ref`, `stock`) VALUES
(34, 'Samsung S10', 'V8.0', 'AN001', 5),
(35, 'OnePlus 7', 'V11.0', 'AN002', 20),
(36, 'Nokia 3310', 'V1.2', 'TC001', 1142),
(37, 'Iphone X', 'V14.3', 'AA001', 33),
(555, 'mockdevice', '0.0', 'MOCK', 1),
(38, 'Blackberry Bold 9900 ', 'V9.0', 'BB001', 4);

-- --------------------------------------------------------

--
-- Structure de la table `loans`
--

DROP TABLE IF EXISTS `loans`;
CREATE TABLE IF NOT EXISTS `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `deviceID` int(11) NOT NULL,
  `loan_start` date NOT NULL,
  `loan_end` date NOT NULL,
  `borrower` int(11) NOT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `fk_deviceid` (`deviceID`),
  KEY `fk_userid` (`borrower`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `loans`
--

INSERT INTO `loans` (`loan_id`, `deviceID`, `loan_start`, `loan_end`, `borrower`) VALUES
(31, 38, '2021-01-16', '2021-01-23', 1000015),
(32, 38, '2021-01-16', '2021-01-23', 1000013),
(33, 38, '2021-01-16', '2021-01-23', 1000014),
(34, 38, '2021-01-16', '2021-01-23', 1000011),
(35, 36, '2021-01-01', '2031-01-01', 1000010),
(36, 34, '2021-01-09', '2021-01-09', 1000010),
(37, 36, '2021-01-09', '2021-01-16', 1000010),
(38, 38, '2021-01-24', '2021-01-30', 1000010),
(39, 38, '2021-01-24', '2021-01-30', 1000015),
(40, 35, '2021-01-09', '2021-02-06', 1000009);

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `lastname` varchar(30) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL,
  `regnumber` int(11) NOT NULL AUTO_INCREMENT,
  `admin` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`regnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=1000016 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`lastname`, `firstname`, `email`, `password`, `regnumber`, `admin`) VALUES
('Jordan', 'Michael', 'michael.jordan@gmail.com', '$2b$10$MTmemI0AYsxy2J76OJihY.3Y3eiNLKmXCecYfiYa9IvX7MOPrAwFm', 1000009, 0),
('Raoult', 'Didier', 'iambullshit@laposte.net', '$2b$10$9gUlhniS4rIBPb2pLR4E9O4IlC/.ECuiUnq6su0HX3AS3p1p/hMp2', 1000010, 0),
('Mbappe', 'Kylian', 'petitpont@hotmail.com', '$2b$10$NUVs.r/gOzzAvtDgMz5wb./DtP694P1Zd5nTd.kAk6WR3yaNzLLS.', 1000011, 1),
('Claquart', 'Taudine', 'taudine.claquart@univ-tours.fr', '$2b$10$8CEFLgcHxodFdDY/yNVuV.FX4yISPjBwz6D2ebXGW08OOoYWEa1fq', 1000013, 0),
('Hamilton', 'Lewis', 'alwaysP1@gmail.com', '$2b$10$38/1o3Nj8mULUeFZOrmlfeFvZ0pat7P5m.o3SHq5MoCnFcLmzDsKi', 1000014, 0),
('mock', 'user', 'mock@user', 'mockpassword', 5555555, 1),
('admin', 'admin', 'admin@locaMat.fr', '$2b$10$wsqEZRcD/4Wr8LCFQrRXGeFCQmHCGzIHgNIV5CqXusCjpsMRzVaJa', 1000015, 1);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `fk_deviceid` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`),
  ADD CONSTRAINT `fk_userid` FOREIGN KEY (`borrower`) REFERENCES `users` (`regnumber`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
