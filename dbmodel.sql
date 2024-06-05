
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- PaladinsShipped implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` varchar(32) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(17) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `piece` (
    `piece_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `piece_type` varchar(32) NOT NULL,
    `piece_type_arg` int(10),
    `piece_player_id` varchar(16),
    `piece_location` varchar(32) NOT NULL,
    `piece_location_arg` varchar(32) NOT NULL,
    `piece_location_position` int,
    PRIMARY KEY (`piece_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



-- Other player stuff
-- suspicion: deck of cards: location: hand
-- townsfolk: deck of cards, location: hand
-- fortify: deck of cards, location: hand
-- attack: deck of cards, location: attack_pile
-- convert: deck of cards, location: hand
-- paladins: deck of cards, location: hand, deck
-- absolve bonus pieces
-- workers pieces with locations

ALTER TABLE `player` ADD `coin` tinyint(10) UNSIGNED NOT NULL DEFAULT '3' COMMENT 'Amount of coins in players possession';
ALTER TABLE `player` ADD `provision` tinyint(10) UNSIGNED NOT NULL DEFAULT '1' COMMENT 'Amount of provisions in players possession';
ALTER TABLE `player` ADD `white_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of labourers in player possession';
ALTER TABLE `player` ADD `green_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of scouts in player possession';
ALTER TABLE `player` ADD `blue_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of merchants in player possession';
ALTER TABLE `player` ADD `red_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of fighters in player possession';
ALTER TABLE `player` ADD `black_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of clerics in player possession';
ALTER TABLE `player` ADD `purple_worker` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of criminals in player possession';
ALTER TABLE `player` ADD `paid_debt` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of debts paid';
ALTER TABLE `player` ADD `unpaid_debt` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of debts unpaid';
ALTER TABLE `player` ADD `strength` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Current strength';
ALTER TABLE `player` ADD `faith` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Current faith';
ALTER TABLE `player` ADD `influence` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Current influence';
ALTER TABLE `player` ADD `parchment` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Is first player of the current round';
ALTER TABLE `player` ADD `develop_qty` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of developments done. Max 8';
ALTER TABLE `player` ADD `commission_qty` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of commissions done. Max 7';
ALTER TABLE `player` ADD `garrison_qty` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of garrisons done. Max 7';