<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaladinsShipped implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * PaladinsShipped game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!


$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array("" => 2)
    ),

    2 => array(
        "name" => "prepareTownsfolk",
        "type" => "game",
        "action" => "stGameHireInitialTownsfolk",
        "transitions" => array("transHireInitialTownsfolk" => 3, "transStartGame" => 5)
    ),

    3 => array(
        "name" => "hireInitialTownsfolk",
        "description" => clienttranslate('${actplayer} must hire an initial assistant'),
        "descriptionmyturn" => clienttranslate('${you} must hire your initial assistant'),
        "type" => "activeplayer",
        "possibleactions" => array("hireInitialTownsfolk"),
        "transitions" => array("" => 2)
    ),

    5 => array(
        "name" => "newRound",
        "type" => "game",
        "action" => "stGameSetupNewRound",
        "transitions" => array("done" => 10, "calculateScores" => 98)
    ),

    6 => array(
        "name" => "pickPaladins",
        "description" => clienttranslate("All players need to choose their Paladins"),
        "descriptionmyturn" => clienttranslate('${you} need to choose your Paladins'),
        "type" => "multipleactiveplayer",
        "possibleactions" => array('pickPaladins'),
        "transitions" => array("done" => 7)
    ),

    7 => array(
        "name" => "pickTavern",
        "description" => clienttranslate('${actplayer} must choose a tavern card'),
        "descriptionmyturn" => clienttranslate('${you} must choose your tavern card'),
        "type" => "activeplayer",
        "possibleactions" => array("pickTavern"),
        "transitions" => array("" => 11)
    ),

    8 => array(
        "name" => "playerAction",
        "description" => clienttranslate('${actplayer} must choose a board action or pass'),
        "descriptionmyturn" => clienttranslate('${you} must choose a board action or pass'),
        "type" => "activeplayer",
        "possibleactions" => array(
            "pass",
            "pray",
            "recruitDiscard",
            "recruitHire",
            "develop",
            "hunt",
            "trade",
            "conspire",
            "commission",
            "fortify",
            "garrison",
            "absolve",
            "attack",
            "convert",
            "kingsFavour"
        ),
        "transitions" => array("nextPlayer" => 12, "endOfRound" => 5, "inquisition" => 9, "selectBoardPosition" => 14)
    ),

    9 => array(
        "name" => "inquisition",
        "type" => "game",
        "action" => "stPerformInquisition",
        "transitions" => array("" => 8)
    ),

    10 => array(
        "name" => "gamePickPaladins",
        "type" => "game",
        "action" => "stGamePickPaladins",
        "transitions" => array(
            "transPickPaladins" => 6,
        ),
    ),

    11 => [
        "name" => "prepareTaverns",
        "type" => "game",
        "action" => "stGamePickTaverns",
        "transitions" => array("nextPlayer" => 7, "cleanupTaverns" => 8)

    ],

    12 => [
        "name" => "actionPhaseManager",
        "type" => "game",
        "action" => "stGameActionPhaseManager",
        "transitions" => ["nextPlayer" => 8, "endOfRound" => 5, "inquisition" => 9]
    ],

    13 => [
        "name" => "cleanupTaverns",
        "type" => "game",
        "action" => "stGameCleanupTaverns",
        "transitions" => ["" => 8]
    ],

    14 => [
        "name" => "selectBoardPosition",
        "description" => clienttranslate('${actplayer} must select a board position for their monk'),
        "descriptionmyturn" => clienttranslate('${you} must select a board position for your monk'),
        "type" => "activeplayer",
        "possibleactions" => array("selectCommissionPosition", "selectGarrisonPosition"),
        "transitions" => array("freeRecruit" => 15, "selectPraySpace" => 16, "nextPlayer" => 12)
    ],

    15 => [
        "name" => "freeRecruit",
        "description" => clienttranslate('${actplayer} must recruit a townsfolk for free'),
        "descriptionmyturn" => clienttranslate('${you} must recruit a townsfolk for free'),
        "type" => "activeplayer",
        "possibleactions" => array("recruitHire"),
        "transitions" => array("nextPlayer" => 12)
    ],

    16 => [
        "name" => "selectPraySpace",
        "description" => clienttranslate('${actplayer} must select a space to clear with prayer'),
        "descriptionmyturn" => clienttranslate('${you} must select a space to clear with prayer'),
        "type" => "activeplayer",
        "possibleactions" => array("pray"),
        "transitions" => array("nextPlayer" => 12)
    ],

    98 => array(
        "name" => "calculateScores",
        "description" => clienttranslate("End of game"),
        "type" => "game",
        "action" => "stCalculateScores",
        "transitions" => array("endGame" => 99)
    ),


    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
