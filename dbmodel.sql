
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
  `card_location` varchar(32) NOT NULL,
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
ALTER TABLE `player` ADD `commission_qty` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of commissions done. Max 7.';
ALTER TABLE `player` ADD `garrison_qty` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Amount of garrisons done. Max 7.';

-- Note: Tax supply is stored as a game state value, not in the database

ALTER TABLE `player` ADD `abs_free_hire` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Absolve "free hire" bonus taken. Max 1';
ALTER TABLE `player` ADD `abs_labourer` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Absolve "labourer" bonus taken. Max 1';
ALTER TABLE `player` ADD `abs_pray` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Absolve "pray" bonus taken. Max 2';
ALTER TABLE `player` ADD `abs_faith` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Absolve "faith" bonus taken. Max 1';
ALTER TABLE `player` ADD `abs_2_provision` tinyint(10) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Absolve "2 provisions" bonus taken. Max 1';
ALTER TABLE `player` ADD `abs_rmv_suspicion` tinyint(10) UNSIGNED NOT NULL DEFAULT '0'; -- 1or2
ALTER TABLE `player` ADD `abs_pay_debt` tinyint(10) UNSIGNED NOT NULL DEFAULT '0'; -- 1or2

-- Is the space occupied by workers

-- Game logic tracking: simple boolean flags for action availability
ALTER TABLE `player` ADD `action_develop_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used develop action this round';
ALTER TABLE `player` ADD `action_hunt_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used hunt action this round';
ALTER TABLE `player` ADD `action_trade_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used trade action this round';
ALTER TABLE `player` ADD `action_recruit_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used recruit action this round';
ALTER TABLE `player` ADD `action_pray_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used pray action this round';
ALTER TABLE `player` ADD `action_conspire_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used conspire action this round';
ALTER TABLE `player` ADD `action_commission_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used commission action this round';
ALTER TABLE `player` ADD `action_fortify_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used fortify action this round';
ALTER TABLE `player` ADD `action_garrison_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used garrison action this round';
ALTER TABLE `player` ADD `action_absolve_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used absolve action this round';
ALTER TABLE `player` ADD `action_attack_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used attack action this round';
ALTER TABLE `player` ADD `action_convert_used` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Has player used convert action this round';

-- Visual representation: JSON strings storing worker placement and development info
ALTER TABLE `player` ADD `action_develop_workers` text COMMENT 'JSON array of worker types placed on develop action';
ALTER TABLE `player` ADD `action_hunt_workers` text COMMENT 'JSON array of worker types placed on hunt action';
ALTER TABLE `player` ADD `action_trade_workers` text COMMENT 'JSON array of worker types placed on trade action';
ALTER TABLE `player` ADD `action_recruit_workers` text COMMENT 'JSON array of worker types placed on recruit action';
ALTER TABLE `player` ADD `action_pray_workers` text COMMENT 'JSON array of worker types placed on pray action';
ALTER TABLE `player` ADD `action_conspire_workers` text COMMENT 'JSON array of worker types placed on conspire action';
ALTER TABLE `player` ADD `action_commission_workers` text COMMENT 'JSON array of worker types placed on commission action';
ALTER TABLE `player` ADD `action_fortify_workers` text COMMENT 'JSON array of worker types placed on fortify action';
ALTER TABLE `player` ADD `action_garrison_workers` text COMMENT 'JSON array of worker types placed on garrison action';
ALTER TABLE `player` ADD `action_absolve_workers` text COMMENT 'JSON array of worker types placed on absolve action';
ALTER TABLE `player` ADD `action_attack_workers` text COMMENT 'JSON array of worker types placed on attack action';
ALTER TABLE `player` ADD `action_convert_workers` text COMMENT 'JSON array of worker types placed on convert action';

-- Development tracking: number of developments on each action space (0, 1, or 2)
ALTER TABLE `player` ADD `develop_develop_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on develop action (0-2)';
ALTER TABLE `player` ADD `develop_hunt_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on hunt action (0-2)';
ALTER TABLE `player` ADD `develop_trade_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on trade action (0-2)';
ALTER TABLE `player` ADD `develop_recruit_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on recruit action (0-2)';
ALTER TABLE `player` ADD `develop_pray_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on pray action (0-2)';
ALTER TABLE `player` ADD `develop_conspire_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on conspire action (0-2)';
ALTER TABLE `player` ADD `develop_commission_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on commission action (0-2)';
ALTER TABLE `player` ADD `develop_fortify_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on fortify action (0-2)';
ALTER TABLE `player` ADD `develop_garrison_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on garrison action (0-2)';
ALTER TABLE `player` ADD `develop_absolve_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on absolve action (0-2)';
ALTER TABLE `player` ADD `develop_attack_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on attack action (0-2)';
ALTER TABLE `player` ADD `develop_convert_count` tinyint(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Number of developments on convert action (0-2)';

-- Board position tracking for commission and garrison actions
ALTER TABLE `player` ADD `board_positions` text COMMENT 'JSON object mapping board position indices to piece types (commission/garrison)';

-- Paladin board set assignment
ALTER TABLE `player` ADD `paladin_board` varchar(32) NOT NULL DEFAULT 'castle' COMMENT 'Paladin board set assigned to player (castle, barracks, fountain, tower)';

-- Spaces that can be developed
ALTER TABLE `player`