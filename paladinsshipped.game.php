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

if (!defined("RESOURCE_COIN")) {
    // guard since this included multiple times
    define("ACTION_ABSOLVE", "ACTION_ABSOLVE");
    define("ACTION_ATTACK", "ACTION_ATTACK");
    define("ACTION_COMMISSION", "ACTION_COMMISSION");
    define("ACTION_CONSPIRE", "ACTION_CONSPIRE");
    define("ACTION_CONVERT", "ACTION_CONVERT");
    define("ACTION_DEVELOP", "ACTION_DEVELOP");
    define("ACTION_FORTIFY", "ACTION_FORTIFY");
    define("ACTION_GARRISON", "ACTION_GARRISON");
    define("ACTION_HUNT", "ACTION_HUNT");
    define("ACTION_PASS", "ACTION_PASS");
    define("ACTION_PRAY", "ACTION_PRAY");
    define("ACTION_RECRUIT", "ACTION_RECRUIT");
    define("ACTION_TRADE", "ACTION_TRADE");
    define("ACTION_USE_KINGS_FAVOR", "USE_KINGS_FAVOR");
    define("ATTR_FAITH", "ATTR_FAITH");
    define("ATTR_INFLUENCE", "ATTR_INFLUENCE");
    define("ATTR_STRENGTH", "ATTR_STRENGTH");
    define("BLUE_SUIT", "BLUE_SUIT");
    define('CARD_TYPE_KINGS_FAVOUR', 'kings_favour');
    define('CARD_TYPE_KINGS_ORDER', 'kings_order');
    define('CARD_TYPE_PALADIN', 'paladin');
    define('CARD_TYPE_SUSPICION', 'suspicion');
    define("COST_ANY_WORKER", "COST_ANY_WORKER");
    define("EFFECT_FREE_DEVELOPMENT", "EFFECT_FREE_DEVELOPMENT");
    define("EFFECT_FREE_RECRUIT", "EFFECT_FREE_RECRUIT");
    define("EFFECT_PAY_DEBT", "EFFECT_PAY_DEBT");
    define("EFFECT_PRAY", "EFFECT_PRAY");
    define("EFFECT_RMV_DEBT", "EFFECT_RMV_DEBT");
    define("EFFECT_RMV_SUSPICION", "EFFECT_RMV_SUSPICION");
    define("EFFECT_TAKE_TAX", "EFFECT_TAKE_TAX");
    define("EVENT_INQUISITION", "EVENT_INQUISITION");
    define("GREEN_SUIT", "GREEN_SUIT");
    define('RESOURCE_COIN', 'coin');
    define("RESOURCE_DEBT", "RESOURCE_DEBT");
    define("RESOURCE_PAID_DEBT", "RESOURCE_PAID_DEBT");
    define("RESOURCE_PROVISION", "provision");
    define("RESOURCE_SUSPICION", "RESOURCE_SUSPICION");
    define("RESOURCE_UNPAID_DEBT", "RESOURCE_UNPAID_DEBT");
    define("WORKER_BLACK", "WORKER_BLACK");
    define("WORKER_BLUE", "WORKER_BLUE");
    define("WORKER_GREEN", "WORKER_GREEN");
    define("WORKER_PURPLE", "WORKER_PURPLE");
    define("WORKER_RED", "WORKER_RED");
    define("WORKER_WHITE", "WORKER_WHITE");
    define("YELLOW_SUIT", "YELLOW_SUIT");
}


class PaladinsShipped extends Table
{
    public const PLAYER_RESOURCES = array(
        'white_worker', 'green_worker', 'red_worker', 'blue_worker',
        'black_worker', 'purple_worker', 'coin', 'provision', 'unpaid_debt',
        'paid_debt', 'parchment', 'develop_qty',
        'commission_qty', 'garrison_qty', 'strength', 'faith',
        'influence', 'paladin_board'
    );

    public const PALADIN_SETS = array(
        'tower', 'fountain', 'barracks', 'castle'
    );

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
            "can_undo" => 11,
        ));
        $this->deck = self::getNew("module.common.deck");
        $this->deck->init("card");
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
        $sets = self::PALADIN_SETS;
        shuffle($sets);
        $sql = "INSERT INTO player (player_id, player_color, paladin_board, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach($players as $player_id => $player) {
            $set = array_shift($sets);
            $color = array_shift($default_colors);
            $values[] = "('{$player_id}','{$color}','{$set}','{$player['player_canal']}','".addslashes($player['player_name'])."','".addslashes($player['player_avatar'])."')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();

        /************ Start the game initialization *****/

        // Init global values with their initial values


        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        // self::initStat('player', 'fortifications', 0);
        // self::initStat('player', 'commisions', 0);
        // self::initStat('player', 'outisder_attacked', 0);
        // self::initStat('player', 'outsider_converted', 0);
        // self::initStat('player', 'absolutions', 0);
        // self::initStat('player', 'garrisoned_posts', 0);
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
        $this->createAllDecks();
        // $this->createDefaultGamePieces($players);
        $this->setNextFirstPlayer();

        // Activate first player (which is in general a good idea :) )

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

        $gameinfos = self::getGameinfos();
        $result = array();

        $result['game_interface_width'] = $gameinfos['game_interface_width'];

        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $player_sql = "SELECT player_id id, player_score score,".implode(",", self::PLAYER_RESOURCES)." FROM player";
        $result['players'] = self::getCollectionFromDb($player_sql);

        // $piece_sql = "SELECT piece_id id, piece_type type, piece_type_arg type_arg, piece_player_id player_id, piece_location location, piece_location_arg location_arg, piece_location_position location_position FROM piece WHERE piece_location <> 'box'";
        // $result['pieces'] = self::getCollectionFromDB($piece_sql);

        $result['outsider_display'] = $this->deck->getCardsInLocation("outsider_display");
        $result['townsfolk_display'] = $this->deck->getCardsInLocation("townsfolk_display");
        $result['townsfolk_material'] = $this->tf_cards_material;
        $result['paladin_material'] = $this->paladins_cards_material;
        $result['player_paladin_hand'] = $this->deck->getCardsInLocation('paladin_hand', $current_player_id);
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
    ///////////

    /*
        In this space, you can put any utility methods useful for your game logic
    */
    public function dealPaladinCards($players) {
        self::notifyAllPlayers("message", clienttranslate('Each player draws their top 3 paladin cards'), array());
        foreach ($players as $player_id => $player) {
            $cards = $this->deck->pickCardsForLocation(3, "paladin_deck_{$player_id}", 'paladin_hand', $player_id);
            // self::notifyPlayer($player_id, "paladinCards", '', array("cards" => $cards));
        }
    }

    public function resolveEffectForPlayer($effect, $player_id, $qty = 1)
    {
        $resource = "";
        if ($effect == EFFECT_RMV_SUSPICION) {
            $suspicion_cards = $this->deck->countCardInLocation("suspicion_deck_$player_id");
            if ($suspicion_cards) {
                $top_suspicion_location = $this->deck->getExtremePosition(true, "suspicion_deck_$player_id");
                $this->dump($top_suspicion_location);
                // TODO: discard top player suspicion to the top of discard
            }
<<<<<<< HEAD
            else {
                // no suspicion to discard
            }
=======
>>>>>>> chore/improvements
        }
        if ($effect == RESOURCE_PROVISION || $effect == RESOURCE_COIN) {
            $resource = $effect;
        }
        if ($resource) {
            $sql = "UPDATE player SET $resource = $resource + $qty where player_id = $player_id";
            self::DbQuery($sql);
        }
    }

    public function setNextFirstPlayer()
    {
        $this->activeNextPlayer();
        $player_id = self::getActivePlayerId();
        self::DbQuery("UPDATE player SET parchment = 0");
        self::DbQuery("UPDATE player SET parchment = 1 WHERE player_id = {$player_id}");
        self::notifyAllPlayers("moveParchment", '', array("player_id" => $player_id));
    }

    public function createAllDecks()
    {
        $os_cards = array();
        foreach ($this->os_cards_material as $os_card_id => $os_card_type) {
            $os_cards[] = array('type' => 'outsider', 'type_arg' => $os_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($os_cards, 'outsider_deck');
        $this->deck->shuffle('outsider_deck');
        $this->deck->pickCardsForLocation(6, 'outsider_deck', 'outsider_display');
        $this->slideCards('outsider', 'game_setup');

        $tf_cards = array();
        foreach ($this->tf_cards_material as $tf_card_id => $tf_card_type) {
            $tf_cards[] = array('type' => 'townsfolk', 'type_arg' => $tf_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($tf_cards, 'townsfolk_deck');
        $this->deck->shuffle('townsfolk_deck');
        $this->deck->pickCardsForLocation(5, 'townsfolk_deck', 'townsfolk_display');
        $this->slideCards('townsfolk', 'game_setup');

        $tavern_cards = array();
        foreach ($this->tavern_cards_material as $tavern_card_id => $tavern_card_type) {
            $tavern_cards[] = array('type' => 'tavern', 'type_arg' => $tavern_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($tavern_cards, 'tavern_deck');
        $this->deck->shuffle('tavern_deck');
        $this->deck->autoreshuffle_custom = array('tavern_deck' => 'tavern_discard');

        $wall_cards = array();
        foreach ($this->wall_cards_material as $wall_card_id => $wall_card_type) {
            $wall_cards[] = array('type' => 'wall', 'type_arg' => $wall_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($wall_cards, 'wall_deck');
        $this->deck->shuffle('wall_deck');

        $suspicion_cards = array();
        foreach ($this->suspicion_cards_material as $suspicion_card_id => $suspicion_card_qty) {
            $suspicion_cards[] = array('type' => CARD_TYPE_SUSPICION, 'type_arg' => $suspicion_card_id, 'nbr' => $suspicion_card_qty);
        }
        $this->deck->createCards($suspicion_cards, 'suspicion_deck');
        $this->deck->shuffle('suspicion_deck');

        $kingsorder_cards = array();
        foreach ($this->kingsorder_cards_material as $kingsorder_card_id => $kingsorder_card_type) {
            $kingsorder_cards[] = array('type' => CARD_TYPE_KINGS_ORDER, 'type_arg' => $kingsorder_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($kingsorder_cards, 'kingsorder_deck');
        $this->deck->shuffle('kingsorder_deck');

        $kingsfavour_cards = array();
        foreach ($this->kingsfavour_cards_material as $kingsfavour_card_id => $kingsfavour_card_type) {
            $kingsfavour_cards[] = array('type' => CARD_TYPE_KINGS_FAVOUR, 'type_arg' => $kingsfavour_card_id, 'nbr' => 1);
        }
        $this->deck->createCards($kingsfavour_cards, 'kingsfavour_deck');
        $this->deck->shuffle('kingsfavour_deck');

        $paladin_sets = $this->getCollectionFromDB("SELECT player_id, paladin_board FROM player", true);
        foreach($paladin_sets as $player_id => $set_name) {
            $cards_from_set = array_filter(
                $this->paladins_cards_material,
                function ($card_type) use ($set_name) {return $card_type['set'] == $set_name;}
            );
            $paladin_cards = [];
            foreach($cards_from_set as $paladin_card_id => $paladin_card_type) {
                $paladin_cards[] = ['type' => CARD_TYPE_PALADIN, 'type_arg' => $paladin_card_id, 'nbr' => 1];
            }
            $this->deck->createCards($paladin_cards, "paladin_deck_{$player_id}");
            $this->deck->shuffle("paladin_deck_{$player_id}");
        }
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
    public function getBoardCardsByType($card_type)
    {
        $cards_revealed = $this->deck->getCardsInLocation('board');
        return array_filter($cards_revealed, function ($card) use ($card_type) {return $card['type'] == $card_type;});
    }

    public function revealKingsOrder($round)
    {
        $num_revealed = sizeof($this->getBoardCardsByType(CARD_TYPE_KINGS_ORDER));
        if ($round > 3) {
            //TODO: error
        }
        if ($num_revealed > 2) {
            //TODO: error: should not happen
        }
        $this->deck->pickCardForLocation('kingsorder_deck', 'kingsorder_display');
    }

    public function revealKingsFavour($round)
    {
        $num_revealed = sizeof($this->getBoardCardsByType(CARD_TYPE_KINGS_FAVOUR));
        if ($round < 3) {
            //TODO: error
        }
        if ($num_revealed > 4) {
            //TODO: error: should not happen
        }
        $this->deck->pickCardForLocation('kingsfavour_deck', 'kingsfavour_display');
    }

    public function revealTaverns()
    {
        $num_of_players = sizeof(self::loadPlayersBasicInfos());
        $this->deck->pickCardForLocation($num_of_players + 1, 'tavern_deck', 'tavern_display');
    }

    public function getCardInfoByGlobalId($card_id)
    {
        $card = $this->deck->getCard($card_id);
        if ($card['type'] == CARD_TYPE_TOWNSFOLK ) {
            return $this->tf_cards_material[$card['type_arg']];
        }
        return new stdClass();
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    public function hireInitialTownsfolk($townsfolk_card_id)
    {
        self::checkAction('hireInitialTownsfolk');
        $player_id = self::getCurrentPlayerId();
        $townsfolk_card_info = $this->getCardInfoByGlobalId($townsfolk_card_id);
        $this->deck->moveCard($townsfolk_card_id, "hand", $player_id);
        if (isset($townsfolk_card_info['purchase_bonus'])) {
            $this->resolveEffectForPlayer(
                $townsfolk_card_info['purchase_bonus'],
                $player_id
            );
        }
        self::notifyAllPlayers(
            "message",
            clienttranslate('${player_name} hires ${townsfolk_name}'),
            [
                "player_name" => self::getPlayerNameById($player_id),
                "townsfolk_name" => $townsfolk_card_info['name']
            ]
        );
        $this->gamestate->nextState();
    }

    public function pickPaladins($id_bottom, $id_chosen, $id_top)
    {
        self::checkAction('pickPaladins');
        $player_id = self::getCurrentPlayerId();
        self::notifyAllPlayers("pickedPaladins", clienttranslate('${player_name} has picked their Paladins'), array(
            'player_id' => $player_id,
            'player_name' => $this->getPlayerNameById($player_id)
        ));
        $this->gamestate->setPlayerNonMultiactive($player_id, "done");
    }

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

    public function stGameHireInitialTownsfolk()
    {
        $next_player_id = self::getPlayerBefore(self::getActivePlayerId());
        if (!$this->deck->getPlayerHand($next_player_id)) {
            $this->gamestate->changeActivePlayer($next_player_id);
            $this->gamestate->nextState('transHireInitialTownsfolk');
            return;
        }
        $this->gamestate->nextState('transStartGame');
    }

    // wonder how to test this
    public function stGameSetupNewRound()
    {
<<<<<<< HEAD
        $new_round = intval(self::getGameStateValue('current_round')) + 1;
        if ($new_round > 7) {
=======
        $next_round = intval(self::getGameStateValue('current_round')) + 1;
        if ($next_round > 7) {
>>>>>>> chore/improvements
            $this->gamestate->nextState('calculateScores');
            return; //bye
        }
        if ($next_round <= 3) {
            $this->revealKingsOrder($next_round);
        }
        if ($next_round >= 3) {
            $this->revealKingsFavour($next_round);
        }
        if ($next_round >= 2) {
            $this->setNextFirstPlayer();
            $this->refillDisplays(); // TODO, need to refill tf on round 1
        }
        self::setGameStateValue('current_round', $next_round);
        $this->revealTaverns();
        $this->gamestate->nextState('done');
    }

    public function stGamePickPaladins()
    {
        $players = self::loadPlayersBasicInfos();
        $first_player_id = self::getNextPlayerTable()[0];
        $this->gamestate->changeActivePlayer($first_player_id);       //change back to first player

        $this->dealPaladinCards($players);
        foreach ($players as $player_id => $player) {
            $this->giveExtraTime($player_id);
        }
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->nextState("transPickPaladins");
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
