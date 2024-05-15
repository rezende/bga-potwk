<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * paladinsshipped implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * paladinsshipped.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */


require_once(APP_GAMEMODULE_PATH.'module/table/table.game.php');


class paladinsshipped extends Table
{
    public function __construct()
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels(array(
            "current_round" => 10,
            "main_player_id" => 11,
            "first_move_of_round" => 12, //maybe not needed as ir moves clockwise
            "can_undo" => 15,
        ));
        $this->deck = self::getNew("module.common.deck");
        $this->deck->init("card"); // table name
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "paladinsshipped";
    }

    /*
        setupNewGame:

        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes($player['player_name'])."','".addslashes($player['player_avatar'])."')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();

        /************ Start the game initialization *****/

        // Init global values with their initial values

        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );
        self::setGameStateInitialValue('current_round', 0);
        self::setGameStateInitialValue('main_player_id', 0);
        self::setGameStateInitialValue('first_move_of_round', 1);
        self::setGameStateInitialValue('can_undo', 0);
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        // self::initStat('player', 'fortifications', 0);
        // self::initStat('player', 'commisions', 0);
        // self::initStat('player', 'invaders_attacked', 0);
        // self::initStat('player', 'invaders_converted', 0);
        // self::initStat('player', 'absolutions', 0);
        // self::initStat('player', 'garrisoned_posts', 0);
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
        $this->createAllDecks();
        // $this->createDefaultGamePieces($players);


        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();
        // $this->setFirstPlayerMarker($this->getActivePlayerId());

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas:

        Gather all informations about current game situation (visible by the current player).

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $player_sql = "SELECT player_id id, player_score score, white_worker, green_worker, red_worker, blue_worker, black_worker, purple_worker, coin, provision, unpaid_debt, paid_debt FROM player ";
        $result['players'] = self::getCollectionFromDb($player_sql);

        // $piece_sql = "SELECT piece_id id, piece_type type, piece_type_arg type_arg, piece_player_id player_id, piece_location location, piece_location_arg location_arg, piece_location_position location_position FROM piece WHERE piece_location <> 'box'";
        // $result['pieces'] = self::getCollectionFromDB($piece_sql);

        $result['invader_display'] = $this->deck->getCardsInLocation("invader_display");
        $result['assitant_display'] = $this->deck->getCardsInLocation("assistant_display");



        // TODO: Gather all information about current game situation (visible by player $current_player_id).

        return $result;
    }

    /*
        getGameProgression:

        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).

        This method is called each time we are in a game state with the "updateGameProgression" property set to true
        (see states.inc.php)
    */
    public function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    /*
        In this space, you can put any utility methods useful for your game logic
    */
    public function createAllDecks()
    {
        $outsider_cards = array();
        foreach ($this->outsider_cards_material as $outsider_card_id => $outsider_card_type) {
            $outsider_cards[] = array('type' => 'outsider', 'type_arg' => $outsider_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($outsider_cards, 'outsider_deck');
        $this->deck->shuffle('outsider_deck');
        $this->deck->pickCardsForLocation(6, 'outsider_deck', 'outsider_display');
        $this->slideCards(card_type: 'outsider', trigger_by: 'game_setup');

        $assistant_cards = array();
        foreach ($this->assistant_cards_material as $assistant_card_id => $assistant_card_type) {
            $assistant_cards[] = array('type' => 'assistant', 'type_arg' => $assistant_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($assistant_cards, 'assistant_deck');
        $this->deck->shuffle('assistant_deck');
        $this->deck->pickCardsForLocation(5, 'assistant_deck', 'assistant_display');
        $this->slideCards(card_type: 'assistant', trigger_by: 'game_setup');

        // $tavern_cards = array();
        // foreach ($this->tavern_cards_material as $tavern_card_id => $tavern_card_type) {
        //     $tavern_cards[] = array('type' => $tavern_card_id, 'type_arg' => $tavern_card_id, 'nbr' => 1);
        // }
        // $this->deck->createCards($tavern_cards, 'tavern_deck');
        // $this->deck->shuffle('tavern_deck');

        // $fortification_cards = array();
        // foreach ($this->fortification_cards_material as $fortification_card_id => $fortification_card_type) {
        //     $fortification_cards[] = array('type' => $fortification_card_id, 'type_arg' => $fortification_card_id, 'nbr' => 1);
        // }
        // $this->deck->createCards($fortification_cards, 'fortification_deck');
        // $this->deck->shuffle('fortification_deck');

        // $suspicion_cards = array();
        // foreach ($this->suspicion_cards_material as $suspicion_card_id => $suspicion_card_type) {
        //     $suspicion_cards[] = array('type' => $suspicion_card_id, 'type_arg' => $suspicion_card_id, 'nbr' => 8);
        // }
        // $this->deck->createCards($suspicion_cards, 'suspicion_deck');
        // $this->deck->shuffle('suspicion_deck');
    }

    // public function placeNewOutsidersOutOnBoard($num_of, $trigger_by = "")
    // {
    //     $outsider_display = $this->deck->getCardsInLocation('outsider_display');
    //     $oldest_outsider = array_filter(
    //         $outsider_display,
    //         function ($el) { return $el['location_arg'] == 0; }
    //     );
    //     if ($oldest_outsider) {
    //         $this->deck->moveCard($oldest_outsider[0]['id'], 'discard');
    //     }
    //     $this->deck->pickCardsForLocation(6 - count($outsider_display), 'outsider_deck', 'outsider_display');
    //     $this->slideCards('outsider', $trigger_by);
    // }
    public function slideCards(string $card_type, string $trigger_by = "")
    {
        $display = $this->deck->getCardsInLocation("{$card_type}_display", null, 'card_location_arg');
        $position = 0;
        foreach ($display as $card) {
            if ($card['location_arg'] != $position) {
                $this->deck->moveCard($card['id'], "{$card_type}_display", $position);
            }
            $position++;
        }
        $card_display = $this->deck->getCardsInLocation("{$card_type}_display");
        self::notifyAllPlayers('slideCards', '', array('cards' => $card_display, 'trigger_by' => $trigger_by));
    }

    // public function pickCharacter($character_type)
    // {
    //     self::checkAction('pickCharacter');
    //     $player_id = self::getActivePlayerId();
    //     $pending_id = self::getUniqueValueFromDB("SELECT pending_id FROM pending_action WHERE pending_type = 'character' AND pending_type_arg = {$character_type}");
    //     if ($pending_id == null) {
    //         throw new BgaUserException(self::_("Oops something went wrong, this character is not available"));
    //     }

    //     self::notifyAllPlayers(
    //         "pickCharacter",
    //         clienttranslate('${player_name} picks character ${character_name}'),
    //         array(
    //             'i18n' => array('character_name'), 'player_id' => $player_id,
    //             'player_name' => self::getActivePlayerName(), 'character_type' => $character_type, 'character_name' => $this->character_types[$character_type]["name"]
    //         )
    //     );
    //     $this->setupCharacter($character_type, $player_id);
    //     self::DbQuery("DELETE FROM pending_action WHERE pending_id = {$pending_id}");
    //     $this->gamestate->nextState("");
    // }
    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in paladinsshipped.action.php)
    */

    /*

    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' );

        $player_id = self::getActivePlayerId();

        // Add your game logic to play a card there
        ...

        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );

    }

    */


    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*

    Example for game state "MyGameState":

    function argMyGameState()
    {
        // Get some values from the current game situation in database...

        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    /*

    Example for game state "MyGameState":




    function stMyGameState()
    {
        // Do some stuff ...

        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }
    */
    public function stGameHireInitialAssistant()
    {
        $next_player_id = self::getPlayerBefore(self::getActivePlayerId());
        $last_player_id = $this->getLastPlayerId();
        if ($next_player_id != $last_player_id) {
            $this->gamestate->changeActivePlayer($next_player_id);
            $this->gamestate->nextState('transHireInitialAssistant');
        } else {
            $this->gamestate->nextState('transStartGame');
        }
    }
    public function getLastPlayerId()
    {
        $player_order = self::getNextPlayerTable();
        $last_player_id = null;
        $next_player_id = $player_order[0];
        do {
            $last_player_id = $next_player_id;
            {
                $next_player_id = $player_order[$next_player_id];
            }
        } while ($next_player_id != $player_order[0]);
        return $last_player_id;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:

        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).

        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message.
    */

    public function zombieTurn($state, $active_player)
    {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: ".$statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:

        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.

    */

    public function upgradeTableDb($from_version)
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //


    }
}
