-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 08 jan. 2021 à 20:53
-- Version du serveur :  10.4.10-MariaDB
-- Version de PHP :  7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `qlog`
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `devices`
--

INSERT INTO `devices` (`deviceID`, `name`, `version`, `ref`, `stock`) VALUES
(9, 'OnePlusOne', 'V1', 'OP1', 1),
(18, 'OnePlus 7', '7', 'OP7', 1),
(22, 'iPhone6', '6', 'AP6', 5),
(27, 'OnePlus 5', 'V5', 'OP5', 2),
(28, 'OnePlus 5T', 'V5T', 'OP5T', 7),
(29, 'Oneplus 7 Pro', 'V7P', 'OP7P', 30),
(30, 'OnePlus9', 'V9', 'OP9', 9),
(31, 'Razer Blade 15', 'V15', 'RB15', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `loans`
--

INSERT INTO `loans` (`loan_id`, `deviceID`, `loan_start`, `loan_end`, `borrower`) VALUES
(28, 18, '2021-01-21', '2021-02-05', 1000002);

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`token`) VALUES
('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJAYiIsImlhdCI6MTYxMDEyODQ3Mn0.kBv6Z48x1xW3_rsKT7C_hhMFKEwSv4maZLELwMK5_VU');

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
  `admin` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`regnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=1000005 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`lastname`, `firstname`, `email`, `password`, `regnumber`, `admin`) VALUES
('a', 'a', 'a@a', '$2b$10$0bzE0bGtE8wpefAhgp61wO0NLEZLhfxowvXQK8PGuP37TbonyG4jO', 1000002, 1),
('b', 'b', 'b@b', '$2b$10$vS1EkyLMlEjxjQo92RzWT.ZQDOb4BSTIT4Kn45wdV0tLWzZ8COHVe', 1000003, 1),
('c', 'c', 'c@c', '$2b$10$Sr1L6fb7Xt7cN1zPM7RhoezjpWwZ8USfu/aaBShXJCtXBV7FGYWYu', 1000004, 0);

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
