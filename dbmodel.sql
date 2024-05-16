
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- paladinsshipped implementation : © <Your name here> <Your email address here>
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
  `card_type` varchar(16) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(16) NOT NULL,
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

-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

ALTER TABLE `player` ADD `coin` INT UNSIGNED NOT NULL DEFAULT '3';
ALTER TABLE `player` ADD `provision` INT UNSIGNED NOT NULL DEFAULT '1';
ALTER TABLE `player` ADD `white_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `green_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `blue_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `red_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `black_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `purple_worker` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `paid_debt` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `unpaid_debt` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `strength` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `faith` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `influence` INT UNSIGNED NOT NULL DEFAULT '0';
ALTER TABLE `player` ADD `parchment` INT UNSIGNED NOT NULL DEFAULT '0';