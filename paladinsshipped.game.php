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


require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');

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
    define('CARD_TYPE_OUTSIDER', 'outsider');
    define('CARD_TYPE_PALADIN', 'paladin');
    define('CARD_TYPE_SUSPICION', 'suspicion');
    define('CARD_TYPE_TOWNSFOLK', 'townsfolk');
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
    define("WORKER_BLACK", "black_worker");
    define("WORKER_BLUE", "blue_worker");
    define("WORKER_GREEN", "green_worker");
    define("WORKER_PURPLE", "purple_worker");
    define("WORKER_RED", "red_worker");
    define("WORKER_WHITE", "white_worker");
    define("YELLOW_SUIT", "YELLOW_SUIT");
}


class PaladinsShipped extends Table
{
    public $kingsfavour_cards_material;
    public $kingsorder_cards_material;
    public $card_types;
    public $wall_cards_material;
    public $player_spaces_material;
    public $tf_cards_material;
    public $os_cards_material;
    public $board_positions_material;
    public $tavern_cards_material;
    public $suspicion_cards_material;
    public $paladins_cards_material;
    public Deck $deck;

    public const PLAYER_RESOURCES = array(
        'white_worker',
        'green_worker',
        'red_worker',
        'blue_worker',
        'black_worker',
        'purple_worker',
        'coin',
        'provision',
        'unpaid_debt',
        'paid_debt',
        'parchment',
        'develop_qty',
        'commission_qty',
        'garrison_qty',
        'strength',
        'faith',
        'influence',
        'paladin_board',
        'board_positions'
    );

    public const PALADIN_SETS = array(
        'tower',
        'fountain',
        'barracks',
        'castle'
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
            "tax_supply" => 12,
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
        foreach ($players as $player_id => $player) {
            $set = array_shift($sets);
            $color = array_shift($default_colors);
            $values[] = "('{$player_id}','{$color}','{$set}','{$player['player_canal']}','" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
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
        $this->setupDebugStartingResources(array_keys($players));
        $this->setNextFirstPlayer();
        
        // Initialize tax supply based on player count
        $this->initializeTaxSupply(count($players));

        // Setup board positions based on player count
        $this->setupBoardPositions(count($players));

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
        $player_sql = "SELECT player_id id, player_score score," . implode(",", self::PLAYER_RESOURCES) . " FROM player";
        $result['players'] = self::getCollectionFromDb($player_sql);

        // $piece_sql = "SELECT piece_id id, piece_type type, piece_type_arg type_arg, piece_player_id player_id, piece_location location, piece_location_arg location_arg, piece_location_position location_position FROM piece WHERE piece_location <> 'box'";
        // $result['pieces'] = self::getCollectionFromDB($piece_sql);

        $result['outsider_display'] = $this->deck->getCardsInLocation("outsider_display");
        $result['townsfolk_display'] = $this->deck->getCardsInLocation("townsfolk_display");
        $result['townsfolk_material'] = $this->tf_cards_material;
        $result['paladin_material'] = $this->paladins_cards_material;
        $result['player_paladin_hand'] = $this->deck->getCardsInLocation('paladin_hand', $current_player_id);
        // Load all players' townsfolk hands since they are public information
        $result['all_players_townsfolk_hands'] = array();
        $players = self::loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $result['all_players_townsfolk_hands'][$player_id] = $this->deck->getCardsInLocation('hand', $player_id);
        }
        $result['tavern_display'] = $this->deck->getCardsInLocation('tavern_display');
        $result['tavern_cards_material'] = $this->tavern_cards_material;
        $result['wall_cards'] = $this->deck->getCardsInLocation('wall_hand', $current_player_id);
        $result['kingsorder_display'] = $this->deck->getCardsInLocation('kingsorder_display');
        $result['kingsfavour_display'] = $this->deck->getCardsInLocation('kingsfavour_display');
        $result['board_positions_material'] = $this->board_positions_material;
        $result['outsider_material'] = $this->os_cards_material;
        $result['main_board_positions'] = $this->getMainBoardPositions();
        
        // Add tax supply information
        $result['tax_supply'] = $this->getTaxSupply();
        
        // Add action space information for all players
        $result['action_spaces'] = [];
        foreach ($players as $player_id => $player) {
            $result['action_spaces'][$player_id] = $this->getActionSpaceInfo($player_id);
        }
        
        // Add board position information for all players
        $result['board_positions'] = [];
        foreach ($players as $player_id => $player) {
            $result['board_positions'][$player_id] = [
                'all_positions' => $this->getBoardPositions($player_id),
                'commission_positions' => $this->getCommissionPositions($player_id),
                'garrison_positions' => $this->getGarrisonPositions($player_id),
                'available_garrison_positions' => $this->getAvailableGarrisonPositions($player_id),
                'available_board_positions_by_faith' => $this->getAvailableBoardPositionsByFaith($player_id),
                'available_board_positions_by_strength' => $this->getAvailableBoardPositionsByStrength($player_id),
                'total_faith' => $this->getTotalFaith($player_id),
                'total_strength' => $this->getTotalStrength($player_id)
            ];
        }

        $result['player_panels'] = [];
        foreach ($players as $player_id => $player) {
            $result['player_panels'][$player_id] = $this->getPlayerPanelData($player_id);
        }
        
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
    public function refillDisplays($next_round)
    {
        if ($next_round < 2) {
            $this->placeNewCardsOnDisplay(CARD_TYPE_TOWNSFOLK, 'new_round', false);
            return;
        }
        $this->placeNewCardsOnDisplay(CARD_TYPE_TOWNSFOLK, 'new_round');
        $this->placeNewCardsOnDisplay(CARD_TYPE_OUTSIDER, 'new_round');
    }

    public function normalizeWorkerType($worker)
    {
        $worker_map = [
            'WORKER_WHITE' => 'white_worker',
            'WORKER_GREEN' => 'green_worker',
            'WORKER_BLUE' => 'blue_worker',
            'WORKER_RED' => 'red_worker',
            'WORKER_BLACK' => 'black_worker',
            'WORKER_PURPLE' => 'purple_worker',
            WORKER_WHITE => 'white_worker',
            WORKER_GREEN => 'green_worker',
            WORKER_BLUE => 'blue_worker',
            WORKER_RED => 'red_worker',
            WORKER_BLACK => 'black_worker',
            WORKER_PURPLE => 'purple_worker',
        ];

        return $worker_map[$worker] ?? $worker;
    }

    public function formatWorkersListForMessage($workers)
    {
        $labels = [
            'white_worker' => clienttranslate('Labourer'),
            'green_worker' => clienttranslate('Scout'),
            'blue_worker' => clienttranslate('Merchant'),
            'red_worker' => clienttranslate('Fighter'),
            'black_worker' => clienttranslate('Cleric'),
            'purple_worker' => clienttranslate('Criminal'),
        ];

        $parts = [];
        foreach ($workers as $worker) {
            $normalized = $this->normalizeWorkerType($worker);
            $parts[] = $labels[$normalized] ?? $normalized;
        }

        return implode(', ', $parts);
    }

    public function addResource($player_id, $resource, $qty = 1, $notify_resource_update = true)
    {
        // Check if the resource exists as a column in the player table
        $valid_resources = [
            'coin', 'provision', 'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker', 'paid_debt', 'unpaid_debt',
            'strength', 'faith', 'influence', 'parchment', 'develop_qty', 
            'commission_qty', 'garrison_qty'
        ];
        
        if (in_array($resource, $valid_resources)) {
            $sql = "UPDATE player SET $resource = $resource + $qty where player_id = $player_id";
            self::DbQuery($sql);
            
            if ($notify_resource_update) {
                $this->notifyPlayerResourceUpdate($player_id);
            }
        } else {
            // Log error for debugging
            self::warn("Attempted to add invalid resource: $resource");
        }
    }

    public function addWorkersForPlayer($player_id, $workers)
    {
        // Validate that all workers are valid worker types
        $valid_workers = [
            'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker'
        ];
        
        $updates = [];
        $criminal_count = 0;
        foreach ($workers as $worker) {
            $worker = $this->normalizeWorkerType($worker);
            if ($worker === 'purple_worker') {
                $criminal_count++;
            }
            if (in_array($worker, $valid_workers)) {
                $updates[] = "$worker = $worker + 1";
            }
        }
        
        if (!empty($updates)) {
            $sql = "UPDATE player SET " . implode(', ', $updates) . " WHERE player_id = $player_id";
            self::DbQuery($sql);
        }

        if ($criminal_count > 0) {
            $this->gainSuspicionForCriminals($player_id, $criminal_count);
        } else if (!empty($updates)) {
            $this->notifyPlayerResourceUpdate($player_id);
        }
    }

    public function getPlayerSuspicionCount($player_id)
    {
        return intval($this->deck->countCardInLocation('player_suspicion', $player_id));
    }

    public function getSuspicionTaxAmount($type_arg)
    {
        // Suspicion card type_arg is the printed tax value: 0, 1, or 2 silver.
        return intval($type_arg);
    }

    public function buildSuspicionDrawMessage($player_id, $suspicion_info)
    {
        $tax_amount = intval($suspicion_info['tax_amount']);
        $tax_given = intval($suspicion_info['tax_given']);

        $message = clienttranslate('${player_name} draws a suspicion card with ${tax_amount} tax');
        if ($tax_given > 0) {
            $message .= clienttranslate(' and gains ${tax_given} silver from the tax supply');
        } else if ($tax_amount > 0) {
            $message .= clienttranslate(' (tax supply empty)');
        }

        return $message;
    }

    public function gainSuspicionForCriminals($player_id, $criminal_count)
    {
        for ($i = 0; $i < $criminal_count; $i++) {
            $suspicion_info = $this->addSuspicionCard($player_id, false);

            if (!$suspicion_info) {
                continue;
            }

            $suspicion_count = $this->getPlayerSuspicionCount($player_id);

            self::notifyAllPlayers(
                'suspicionGained',
                $this->buildSuspicionDrawMessage($player_id, $suspicion_info),
                [
                    'player_id' => $player_id,
                    'player_name' => self::getPlayerNameById($player_id),
                    'suspicion_card' => $suspicion_info,
                    'tax_given' => $suspicion_info['tax_given'],
                    'tax_amount' => $suspicion_info['tax_amount'],
                    'tax_supply' => $this->getTaxSupply(),
                    'suspicion_count' => $suspicion_count,
                    'panel_data' => $this->getPlayerPanelData($player_id),
                ]
            );
        }

        $this->notifyPlayerResourceUpdate($player_id);
    }

    public function getTaxSupply()
    {
        return self::getGameStateValue('tax_supply');
    }

    public function setTaxSupply($amount)
    {
        self::setGameStateValue('tax_supply', $amount);
    }

    public function addToTaxSupply($amount)
    {
        $current = $this->getTaxSupply();
        $this->setTaxSupply($current + $amount);
    }

    public function removeFromTaxSupply($amount)
    {
        $current = $this->getTaxSupply();
        $new_amount = max(0, $current - $amount);
        $this->setTaxSupply($new_amount);
        
        $amount_removed = $current - $new_amount;
        
        // Check if tax supply was depleted (trigger inquisition)
        if ($current > 0 && $new_amount == 0) {
            $this->triggerInquisition();
        }
        
        return $amount_removed; // Return actual amount removed
    }

    public function triggerInquisition()
    {
        // Find players with the most suspicion
        $sql = "SELECT card_location_arg as player_id, COUNT(*) as suspicion_count 
                FROM card 
                WHERE card_location = 'player_suspicion' 
                GROUP BY card_location_arg 
                ORDER BY suspicion_count DESC";
        $suspicion_counts = self::getCollectionFromDb($sql);
        
        if (empty($suspicion_counts)) {
            // No suspicion, no inquisition
            return;
        }
        
        $max_suspicion = $suspicion_counts[0]['suspicion_count'];
        $players_with_max = array_filter($suspicion_counts, function($player) use ($max_suspicion) {
            return $player['suspicion_count'] == $max_suspicion;
        });
        
        // Give debt to players with most suspicion
        foreach ($players_with_max as $player) {
            $this->addResource($player['player_id'], 'unpaid_debt', 1);
            
            // Remove half of their suspicion (rounded down)
            $suspicion_to_remove = floor($max_suspicion / 2);
            if ($suspicion_to_remove > 0) {
                // TODO: Implement suspicion removal logic
            }
        }
        
        // Refill tax supply
        $player_count = count(self::loadPlayersBasicInfos());
        $tax_amounts = [2 => 5, 3 => 6, 4 => 8];
        $refill_amount = $tax_amounts[$player_count] ?? 5;
        $this->setTaxSupply($refill_amount);
        
        self::notifyAllPlayers("inquisition", clienttranslate('Inquisition! Players with most suspicion gain debt. Tax supply refilled.'), [
            'players_with_debt' => array_column($players_with_max, 'player_id'),
            'tax_refill' => $refill_amount
        ]);
    }

    /**
     * Temporary debug setup: generous starting resources so board actions can be tested.
     * TODO: replace with real game setup (paladin/tavern rewards, etc.)
     */
    private function setupDebugStartingResources(array $player_ids)
    {
        foreach ($player_ids as $player_id) {
            self::DbQuery("UPDATE player SET
                coin = 10,
                provision = 10,
                white_worker = 10,
                green_worker = 10,
                blue_worker = 10,
                red_worker = 10,
                black_worker = 10,
                purple_worker = 0
                WHERE player_id = $player_id");
        }
    }

    public function initializeTaxSupply($player_count)
    {
        // Tax supply initialization based on player count
        // According to the rules, tax supply should be 5-8 silver based on player count
        $tax_amounts = [
            2 => 5,  // 2 players: 5 silver
            3 => 6,  // 3 players: 6 silver  
            4 => 8   // 4 players: 8 silver
        ];
        
        $tax_amount = $tax_amounts[$player_count] ?? 5; // Default to 5 if unknown
        $this->setTaxSupply($tax_amount);
        
        self::notifyAllPlayers("initializeTaxSupply", clienttranslate('Tax supply initialized with ${tax_amount} silver'), [
            'tax_amount' => $tax_amount
        ]);
    }

    public function setupBoardPositions($player_count)
    {
        // Initialize board positions for all players
        $players = self::loadPlayersBasicInfos();
        $initial_board_positions = [];
        
        // Find positions that need to be pre-filled based on player count
        $positions_to_fill = [];
        
        foreach ($this->board_positions_material as $index => $position) {
            $min_players = $position['min_players'] ?? 1;
            
            // If playing with less than 4 players, fill positions requiring 4+ players
            if ($player_count < 4 && $min_players >= 4) {
                $positions_to_fill[] = $index;
            }
            // If playing with less than 3 players, fill positions requiring 3+ players
            else if ($player_count < 3 && $min_players >= 3) {
                $positions_to_fill[] = $index;
            }
        }
        
        // Randomly fill the required positions
        foreach ($positions_to_fill as $position_index) {
            // Randomly choose between commission (monk) and garrison (fort)
            $piece_type = (rand(0, 1) == 0) ? 'commission' : 'garrison';
            $initial_board_positions[$position_index] = $piece_type;
        }
        
        // Save the initial board positions to the database
        if (!empty($initial_board_positions)) {
            $positions_json = json_encode($initial_board_positions);
            $sql = "UPDATE player SET board_positions = '$positions_json'";
            self::DbQuery($sql);
            
            // Notify players about the setup
            $filled_count = count($initial_board_positions);
            self::notifyAllPlayers("setupBoardPositions", clienttranslate('${filled_count} board positions have been randomly filled for ${player_count}-player game'), [
                'player_count' => $player_count,
                'filled_positions' => $initial_board_positions,
                'filled_count' => $filled_count
            ]);
        }
    }

    public function removeWorkerCountsForPlayer($player_id, $worker_counts)
    {
        $updates = [];
        foreach ($worker_counts as $worker_type => $count) {
            if ($count > 0) {
                $updates[] = "$worker_type = GREATEST(0, $worker_type - $count)";
            }
        }
        
        if (!empty($updates)) {
            $sql = "UPDATE player SET " . implode(', ', $updates) . " WHERE player_id = $player_id";
            self::DbQuery($sql);
            
            // Send notification to update the resource table
            $this->notifyPlayerResourceUpdate($player_id);
        }
    }

    public function addSuspicionCard($player_id, $notify_resource_update = true)
    {
        // Draw a suspicion card from the deck and add it to the player's suspicion pile
        $suspicion_card = $this->deck->pickCardForLocation('suspicion_deck', 'player_suspicion', $player_id);
        
        if ($suspicion_card) {
            // type_arg is the printed tax value on the card: 0, 1, or 2
            $tax_amount = $this->getSuspicionTaxAmount($suspicion_card['type_arg']);
            
            // Get current tax supply amount
            $tax_supply = $this->getTaxSupply();
            
            // Add tax to player if available
            $tax_to_give = 0;
            if ($tax_amount > 0) {
                $tax_to_give = $this->removeFromTaxSupply($tax_amount);
                if ($tax_to_give > 0) {
                    $this->addResource($player_id, RESOURCE_COIN, $tax_to_give, false);
                }
            }
            
            $suspicion_info = [
                'id' => $suspicion_card['id'],
                'type' => $suspicion_card['type'],
                'type_arg' => $suspicion_card['type_arg'],
                'tax_amount' => $tax_amount,
                'tax_supply' => $tax_supply,
                'tax_given' => $tax_to_give,
            ];

            if ($notify_resource_update) {
                $this->notifyPlayerResourceUpdate($player_id);
            }
            
            return $suspicion_info;
        }
        
        return null;
    }

    public function resolveEffectForPlayer($effect, $player_id, $qty = 1)
    {
        $resource = "";
        if ($effect == EFFECT_RMV_SUSPICION) {
            $suspicion_cards = $this->deck->countCardInLocation('player_suspicion', $player_id);
            if ($suspicion_cards) {
                $top_suspicion_location = $this->deck->getExtremePosition(true, 'player_suspicion', $player_id);
                // TODO: discard top player suspicion to the top of discard
            } else {
                // no suspicion to discard
            }
        }
        if ($effect == RESOURCE_PROVISION || $effect == RESOURCE_COIN || strpos($effect, 'worker') === 0) {
            $resource = $effect;
        }
        if ($resource) {
            $this->addResource($player_id, $resource, $qty);
        }
        // TODO: message: player gets ${num} of ${resource}
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
        self::warn("Paladin sets found: " . json_encode($paladin_sets));
        
        foreach ($paladin_sets as $player_id => $set_name) {
            self::warn("Creating paladin deck for player {$player_id} with set {$set_name}");
            
            $cards_from_set = array_filter(
                $this->paladins_cards_material,
                function ($card_type) use ($set_name) {
                    return $card_type['set'] == $set_name;
                }
            );
            
            self::warn("Cards found for set {$set_name}: " . count($cards_from_set));
            self::warn("Cards from set: " . json_encode($cards_from_set));
            
            $paladin_cards = [];
            foreach ($cards_from_set as $paladin_card_id => $paladin_card_type) {
                $paladin_cards[] = ['type' => CARD_TYPE_PALADIN, 'type_arg' => $paladin_card_id, 'nbr' => 1];
            }
            
            self::warn("Paladin cards array for player {$player_id}: " . json_encode($paladin_cards));
            
            $this->deck->createCards($paladin_cards, "paladin_deck_{$player_id}");
            $this->deck->shuffle("paladin_deck_{$player_id}");
            
            $deck_count = $this->deck->countCardInLocation("paladin_deck_{$player_id}");
            self::warn("Paladin deck {$player_id} created with {$deck_count} cards");
        }
    }

    public function placeNewCardsOnDisplay($card_type, $trigger_by = "", $remove_oldest = true)
    {
        $display = $this->deck->getCardsInLocation("{$card_type}_display");
        if ($remove_oldest) {
            $oldest_card = array_filter(
                $display,
                function ($el) {
                    return $el['location_arg'] == 0;
                }
            );
            if ($oldest_card) {
                $this->deck->moveCard($oldest_card[0]['id'], 'discard');
            }
        }
        if ($card_type == CARD_TYPE_OUTSIDER) {
            $nbr = 6;
        }
        if ($card_type == CARD_TYPE_TOWNSFOLK) {
            $nbr = 5;
        }
        $this->deck->pickCardsForLocation(
            $nbr - count($display),
            "{$card_type}_deck",
            "{$card_type}_display",
            $nbr + 1
        );
        $this->slideCards($card_type, $trigger_by);
    }

    public function slideCards($card_type, $trigger_by)
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

    public function normalizeCardDisplay($display_location)
    {
        $display = $this->deck->getCardsInLocation($display_location, null, 'card_location_arg');
        $position = 0;
        foreach ($display as $card) {
            if ($card['location_arg'] != $position) {
                $this->deck->moveCard($card['id'], $display_location, $position);
            }
            $position++;
        }
    }
    public function getBoardCardsByType($card_type)
    {
        $cards_revealed = $this->deck->getCardsInLocation('board');
        return array_filter($cards_revealed, function ($card) use ($card_type) {
            return $card['type'] == $card_type;
        });
    }

    public function revealKingsOrder($round)
    {
        $num_revealed = sizeof($this->deck->getCardsInLocation('kingsorder_display'));
        if ($round > 3) {
            //TODO: error
        }
        if ($num_revealed > 2) {
            //TODO: error: should not happen
        }
        $this->deck->pickCardForLocation('kingsorder_deck', 'kingsorder_display');
        $this->normalizeCardDisplay('kingsorder_display');
        self::notifyAllPlayers('kingsDisplayUpdated', '', array(
            'kingsorder_display' => $this->deck->getCardsInLocation('kingsorder_display'),
        ));
    }

    public function revealKingsFavour($round)
    {
        $num_revealed = sizeof($this->deck->getCardsInLocation('kingsfavour_display'));
        if ($round < 3) {
            //TODO: error
        }
        if ($num_revealed > 4) {
            //TODO: error: should not happen
        }
        $this->deck->pickCardForLocation('kingsfavour_deck', 'kingsfavour_display');
        $this->normalizeCardDisplay('kingsfavour_display');
        self::notifyAllPlayers('kingsDisplayUpdated', '', array(
            'kingsfavour_display' => $this->deck->getCardsInLocation('kingsfavour_display'),
        ));
    }

    public function revealTaverns()
    {
        $num_of_players = sizeof(self::loadPlayersBasicInfos());
        return $this->deck->pickCardsForLocation($num_of_players + 1, 'tavern_deck', 'tavern_display');
    }

    public function getCardInfoByGlobalId($card_id)
    {
        $card = $this->deck->getCard($card_id);
        if ($card['type'] == 'outsider') {
            return $this->os_cards_material[$card['type_arg']];
        } elseif ($card['type'] == 'townsfolk') {
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
        
        // Notify all players about the townsfolk being hired to update UI
        $hired_card = $this->deck->getCard($townsfolk_card_id);
        self::notifyAllPlayers("townsfolkHired", '', [
            'card' => $hired_card,
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('end_picking_card');
    }

    public function pickPaladins($id_bottom, $id_chosen, $id_top)
    {
        self::checkAction('pickPaladins');
        $player_id = self::getCurrentPlayerId();

        // Verify the cards belong to the player
        $player_cards = $this->deck->getCardsInLocation('paladin_hand', $player_id);
        $player_card_ids = array_map(function ($card) {
            return $card['id'];
        }, $player_cards);

        if (
            !in_array($id_bottom, $player_card_ids) ||
            !in_array($id_chosen, $player_card_ids) ||
            !in_array($id_top, $player_card_ids)
        ) {
            throw new BgaUserException(self::_("You can only select from your own cards"));
        }

        // Move cards to their new locations
        $this->deck->insertCardOnExtremePosition($id_bottom, "paladin_deck_{$player_id}", true); // Bottom
        // $this->deck->moveCard($id_chosen, "paladin_hand", $player_id);     // Keep
        $this->deck->insertCardOnExtremePosition($id_top, "paladin_deck_{$player_id}", false);    // Top

        // Add workers from the chosen Paladin
        $chosen_card = $this->deck->getCard($id_chosen);
        $chosen_paladin_info = $this->paladins_cards_material[$chosen_card['type_arg']];
        
        if (isset($chosen_paladin_info['workers'])) {
            $this->addWorkersForPlayer($player_id, $chosen_paladin_info['workers']);
        }

        // Notify players
        self::notifyAllPlayers("pickedPaladins", clienttranslate('${player_name} has arranged their Paladins'), array(
            'player_id' => $player_id,
            'player_name' => $this->getPlayerNameById($player_id)
        ));

        // Notify the specific player about their chosen card
        self::notifyPlayer($player_id, "keepPaladin", '', array(
            'card' => $chosen_card
        ));

        $this->notifyPlayerResourceUpdate($player_id);

        // Mark this player as done
        $this->gamestate->setPlayerNonMultiactive($player_id, "done");
    }

    public function pickTavern($tavern_id)
    {
        self::checkAction('pickTavern');
        $player_id = self::getCurrentPlayerId();
        $tavern_card = $this->deck->getCard($tavern_id);
        $type_arg = intval($tavern_card['type_arg']);
        $tavern_card_info = $this->tavern_cards_material[$type_arg];
        $this->deck->moveCard($tavern_id, 'tavern_discard');
        
        // Add all workers from the tavern card in a single query
        $this->addWorkersForPlayer($player_id, $tavern_card_info);
        
        $worker_list = $this->formatWorkersListForMessage($tavern_card_info);
        self::notifyAllPlayers(
            "message",
            clienttranslate('${player_name} picks a tavern and gains ${worker_list}'),
            [
                "player_name" => self::getPlayerNameById($player_id),
                "worker_list" => $worker_list,
            ]
        );

        self::notifyAllPlayers(
            "tavernPicked",
            '',
            [
                "player_id" => $player_id,
                "tavern_card_id" => $tavern_id,
                "type_arg" => $type_arg,
                "workers" => $tavern_card_info,
                "panel_data" => $this->getPlayerPanelData($player_id),
            ]
        );

        $this->notifyPlayerResourceUpdate($player_id);
        
        $this->gamestate->nextState("");
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
        } else {
            $this->gamestate->nextState('transStartGame');
        }
    }

    // wonder how to test this
    public function stGameSetupNewRound()
    {
        $new_round = intval(self::getGameStateValue('current_round')) + 1;
        if ($new_round > 7) {
            $this->gamestate->nextState('calculateScores');
            return; //bye
        }
        if ($new_round <= 3) {
            $this->revealKingsOrder($new_round);
        }
        if ($new_round >= 3) {
            $this->revealKingsFavour($new_round);
        }
        if ($new_round >= 2) {
            $this->setNextFirstPlayer();
        }
        self::setGameStateValue('current_round', $new_round);
        $this->refillDisplays($new_round);
        
        // Clear all action spaces for the new round
        $this->clearActionSpaces();
        
        $this->gamestate->nextState('done');
    }

    public function clearActionSpaces()
    {
        // Clear all action spaces for all players at the start of a new round
        $sql = "UPDATE player SET 
                action_develop_used = 0,
                action_hunt_used = 0,
                action_trade_used = 0,
                action_recruit_used = 0,
                action_pray_used = 0,
                action_conspire_used = 0,
                action_commission_used = 0,
                action_fortify_used = 0,
                action_garrison_used = 0,
                action_absolve_used = 0,
                action_attack_used = 0,
                action_convert_used = 0,
                action_develop_workers = NULL,
                action_hunt_workers = NULL,
                action_trade_workers = NULL,
                action_recruit_workers = NULL,
                action_pray_workers = NULL,
                action_conspire_workers = NULL,
                action_commission_workers = NULL,
                action_fortify_workers = NULL,
                action_garrison_workers = NULL,
                action_absolve_workers = NULL,
                action_attack_workers = NULL,
                action_convert_workers = NULL";
        self::DbQuery($sql);
        
        self::notifyAllPlayers("clearActionSpaces", clienttranslate('Action spaces cleared for new round'), []);
    }

    /**
     * Check if a player can use a specific action (hasn't used it this round)
     */
    public function canUseAction($player_id, $action_name)
    {
        $field_name = "action_{$action_name}_used";
        $sql = "SELECT $field_name FROM player WHERE player_id = $player_id";
        $result = self::getUniqueValueFromDb($sql);
        return $result == 0;
    }

    /**
     * Mark an action as used for a player
     */
    public function markActionAsUsed($player_id, $action_name, $workers = [])
    {
        $used_field = "action_{$action_name}_used";
        $workers_field = "action_{$action_name}_workers";
        
        $workers_json = !empty($workers) ? json_encode($workers) : null;
        
        $sql = "UPDATE player SET 
                $used_field = 1,
                $workers_field = " . ($workers_json ? "'$workers_json'" : "NULL") . "
                WHERE player_id = $player_id";
        self::DbQuery($sql);
    }

    /**
     * Get the development count for a specific action
     */
    public function getDevelopmentCount($player_id, $action_name)
    {
        $field_name = "develop_{$action_name}_count";
        $sql = "SELECT $field_name FROM player WHERE player_id = $player_id";
        return (int)self::getUniqueValueFromDb($sql);
    }

    /**
     * Add a development to a specific action
     */
    public function addDevelopment($player_id, $action_name)
    {
        $current_count = $this->getDevelopmentCount($player_id, $action_name);
        if ($current_count < 2) { // Max 2 developments per action
            $field_name = "develop_{$action_name}_count";
            $sql = "UPDATE player SET $field_name = $field_name + 1 WHERE player_id = $player_id";
            self::DbQuery($sql);
            return true;
        }
        return false;
    }

    /**
     * Get all action space information for a player (for UI display)
     */
    public function getActionSpaceInfo($player_id)
    {
        $actions = ['develop', 'hunt', 'trade', 'recruit', 'pray', 'conspire', 
                   'commission', 'fortify', 'garrison', 'absolve', 'attack', 'convert'];
        
        $info = [];
        foreach ($actions as $action) {
            $used_field = "action_{$action}_used";
            $workers_field = "action_{$action}_workers";
            $develop_field = "develop_{$action}_count";
            
            $sql = "SELECT $used_field, $workers_field, $develop_field 
                    FROM player WHERE player_id = $player_id";
            $result = self::getObjectFromDb($sql);
            
            $info[$action] = [
                'used' => (bool)$result[$used_field],
                'workers' => $result[$workers_field] ? json_decode($result[$workers_field], true) : [],
                'developments' => (int)$result[$develop_field]
            ];
        }
        
        return $info;
    }

    public function stGamePickPaladins()
    {
        $players = self::loadPlayersBasicInfos();
        $first_player_id = self::getNextPlayerTable()[0];
        $this->gamestate->changeActivePlayer($first_player_id);  // change back to first player

        // Deal 3 paladin cards to each player
        foreach ($players as $player_id => $player) {
            // Debug: Check deck before picking
            $deck_count_before = $this->deck->countCardInLocation("paladin_deck_{$player_id}");
            self::warn("Player {$player_id} deck count before: {$deck_count_before}");
            
            $cards = $this->deck->pickCardsForLocation(3, "paladin_deck_{$player_id}", 'paladin_hand', $player_id);
            
            // Debug: Check cards picked and deck after
            $deck_count_after = $this->deck->countCardInLocation("paladin_deck_{$player_id}");
            $cards_count = count($cards);
            self::warn("Player {$player_id} picked {$cards_count} cards, deck count after: {$deck_count_after}");
            self::warn("Player {$player_id} cards: " . json_encode($cards));
            
            // Notify only the specific player about their cards
            self::notifyPlayer($player_id, "paladinCards", '', array(
                'cards' => $cards
            ));
            $this->giveExtraTime($player_id);
        }
        $new_taverns = $this->revealTaverns();

        // Notify all players that cards have been dealt
        self::notifyAllPlayers("message", clienttranslate('Each player draws their top 3 paladin cards'), array());
        self::notifyAllPlayers("revealTaverns", clienttranslate('New tavern cards are revealed'), array(
            'cards' => $new_taverns
        ));

        // Set up the multiactive state for all players
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->nextState("transPickPaladins");
    }

    public function stGamePickTaverns()
    {
        $nextState = "nextPlayer";
        if ($this->deck->countCardInLocation('tavern_display') == 1) {
            $nextState = "cleanupTaverns";
        }
        $this->activeNextPlayer();
        $this->gamestate->nextState($nextState);
    }


    public function stGameCleanupTaverns()
    {
        $this->deck->moveAllCardsInLocation("tavern_display", "tavern_discard");
        self::notifyAllPlayers("cleanupTaverns", clienttranslate('Cleaning up tavern cards'), []);
        $this->gamestate->nextState("");
    }

    public function stGameActionPhaseManager()
    {
        // For now, just move to the next player
        // TODO: Implement proper action phase management with multiple active players
        $this->activeNextPlayer();
        $this->gamestate->nextState('nextPlayer');
    }

    public function stPerformInquisition()
    {
        $this->triggerInquisition();
        $this->gamestate->nextState('');
    }

    public function stCalculateScores()
    {
        $players = self::loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $score = $this->calculatePlayerScore($player_id);
            self::DbQuery("UPDATE player SET player_score = $score WHERE player_id = $player_id");
        }
        $this->gamestate->nextState('endGame');
    }

    /**
     * End-game scoring. TODO: implement full rulebook scoring.
     */
    private function calculatePlayerScore($player_id)
    {
        return 0;
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// CORE GAME ACTIONS
    ////////////

    public function pass()
    {
        self::checkAction('pass');
        $player_id = self::getCurrentPlayerId();
        
        // TODO: Implement worker clearing logic
        // For now, just pass to next player
        
        self::notifyAllPlayers('pass', clienttranslate('${player_name} passes'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function pray($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $action_space)
    {
        self::checkAction('pray');
        $player_id = self::getCurrentPlayerId();
        
        $cost = $this->getCurrentActionCost(ACTION_PRAY, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Pray action"));
        }
        
        // Check if player has enough silver
        if ($this->getResourceCount($player_id, RESOURCE_COIN) < 2) {
            throw new BgaUserException(self::_("You need 2 Silver to pray"));
        }
        
        // Remove workers and pay silver
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_COIN, -2);
        
        // Clear workers from specified action space
        // TODO: Implement worker clearing logic
        
        self::notifyAllPlayers('pray', clienttranslate('${player_name} prays and clears workers from ${action_space}'), [
            'player_name' => self::getCurrentPlayerName(),
            'action_space' => $action_space,
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function recruitDiscard($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $townsfolk_card_id)
    {
        self::checkAction('recruitDiscard');
        $player_id = self::getCurrentPlayerId();
        
        $cost = $this->getCurrentActionCost(ACTION_RECRUIT, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Recruit action"));
        }
        
        // Remove workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // TODO: Implement discard logic
        
        self::notifyAllPlayers('recruitDiscard', clienttranslate('${player_name} discards a townsfolk'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function recruitHire($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $townsfolk_card_id, $use_debt = false)
    {
        self::checkAction('recruitHire');
        $player_id = self::getCurrentPlayerId();
        
        $cost = $this->getCurrentActionCost(ACTION_RECRUIT, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Recruit action"));
        }
        
        // Remove workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // TODO: Implement hiring logic
        
        self::notifyAllPlayers('recruitHire', clienttranslate('${player_name} hires a townsfolk'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function develop($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $action_space, $workshop_position)
    {
        self::checkAction('develop');
        $player_id = self::getCurrentPlayerId();
        
        // Check if player has enough silver
        if ($this->getResourceCount($player_id, RESOURCE_COIN) < 4) {
            throw new BgaUserException(self::_("You need 4 Silver to develop"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_DEVELOP, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Develop action"));
        }
        
        // Remove workers and pay silver
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_COIN, -4);
        
        // Place workshop and gain worker
        // TODO: Implement workshop placement logic
        
        self::notifyAllPlayers('develop', clienttranslate('${player_name} develops ${action_space}'), [
            'player_name' => self::getCurrentPlayerName(),
            'action_space' => $action_space,
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function hunt($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('hunt');
        $player_id = self::getCurrentPlayerId();
        
        $cost = $this->getCurrentActionCost(ACTION_HUNT, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Hunt action"));
        }
        
        // Remove workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // Gain provisions based on number of workers
        $total_workers = array_sum($worker_counts);
        $provisions_gained = ($total_workers > 1) ? 3 : 1;
        $this->addResource($player_id, RESOURCE_PROVISION, $provisions_gained);
        
        self::notifyAllPlayers('hunt', clienttranslate('${player_name} hunts and gains ${provisions} provisions'), [
            'player_name' => self::getCurrentPlayerName(),
            'provisions' => $provisions_gained,
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function trade($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('trade');
        $player_id = self::getCurrentPlayerId();
        
        $cost = $this->getCurrentActionCost(ACTION_TRADE, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Trade action"));
        }
        
        // Remove workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // Gain silver based on number of workers
        $total_workers = array_sum($worker_counts);
        $silver_gained = ($total_workers > 1) ? 3 : 1;
        $this->addResource($player_id, RESOURCE_COIN, $silver_gained);
        
        self::notifyAllPlayers('trade', clienttranslate('${player_name} trades and gains ${silver} silver'), [
            'player_name' => self::getCurrentPlayerName(),
            'silver' => $silver_gained,
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function conspire($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('conspire');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'conspire')) {
            throw new BgaUserException(self::_("You have already used the conspire action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_CONSPIRE, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Conspire action"));
        }
        
        // Remove the spent workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // Gain criminal
        $this->addResource($player_id, WORKER_PURPLE, 1);
        
        // Mark this action as used and store worker info
        $this->markActionAsUsed($player_id, 'conspire', $worker_counts);
        
        // Gain suspicion (draw a suspicion card)
        $suspicion_info = $this->addSuspicionCard($player_id);
        
        if ($suspicion_info) {
            $tax_message = '';
            if ($suspicion_info['tax_given'] > 0) {
                $tax_message = clienttranslate(' and gains ${tax_given} silver from tax (${tax_amount} available, ${tax_supply} in treasury)');
            } else if ($suspicion_info['tax_amount'] > 0) {
                $tax_message = clienttranslate(' but no silver available from tax (${tax_amount} needed, ${tax_supply} in treasury)');
            }
            
            self::notifyAllPlayers('conspire', clienttranslate('${player_name} conspires and gains a criminal and suspicion') . $tax_message, [
                'player_name' => self::getCurrentPlayerName(),
                'player_id' => $player_id,
                'suspicion_card' => $suspicion_info,
                'tax_given' => $suspicion_info['tax_given'],
                'tax_amount' => $suspicion_info['tax_amount'],
                'tax_supply' => $suspicion_info['tax_supply'],
                'action_space_info' => $this->getActionSpaceInfo($player_id)
            ]);
        } else {
            self::notifyAllPlayers('conspire', clienttranslate('${player_name} conspires and gains a criminal'), [
                'player_name' => self::getCurrentPlayerName(),
                'player_id' => $player_id,
                'action_space_info' => $this->getActionSpaceInfo($player_id)
            ]);
        }
        
        $this->gamestate->nextState('nextPlayer');
    }

    // Helper to get the current cost for an upgradable action
    public function getCurrentActionCost($action, $player_id) {
        $upgradable = [
            ACTION_COMMISSION, ACTION_FORTIFY, ACTION_GARRISON,
            ACTION_ABSOLVE, ACTION_ATTACK, ACTION_CONVERT
        ];
        $defaultCosts = $this->player_spaces_material;
        $cost = $defaultCosts[$action];
        if (in_array($action, $upgradable)) {
            // The DB field uses lowercase action names
            $devs = $this->getDevelopmentCount($player_id, strtolower(str_replace('ACTION_', '', $action)));
            $cost = array_slice($cost, $devs);
        }
        return $cost;
    }

    // Helper to validate worker counts against action cost requirements
    public function validateWorkerCountsForAction($player_id, $worker_counts, $cost) {
        // Debug logging
        self::trace("validateWorkerCountsForAction called with:");
        self::trace("player_id: $player_id");
        self::trace("worker_counts: " . json_encode($worker_counts));
        self::trace("cost: " . json_encode($cost));
        
        // Get player's current worker counts
        $player_workers = [];
        $worker_types = ['white_worker', 'green_worker', 'blue_worker', 'red_worker', 'black_worker', 'purple_worker'];
        foreach ($worker_types as $type) {
            $count = $this->getResourceCount($player_id, $type);
            if ($count > 0) {
                $player_workers[$type] = $count;
            }
        }
        
        self::trace("Player worker counts: " . json_encode($player_workers));
        
        // Count total workers being used
        $total_workers_used = array_sum($worker_counts);
        $total_workers_required = count($cost);
        
        if ($total_workers_used !== $total_workers_required) {
            self::trace("Total worker count mismatch: $total_workers_used vs $total_workers_required");
            return false;
        }
        
        // Create a copy to track available workers for validation
        $available_workers = $player_workers;
        
        // First, check if the player has enough workers of each type they're trying to use
        foreach ($worker_counts as $worker_type => $count) {
            if ($count > 0) {
                $player_count = $this->getResourceCount($player_id, $worker_type);
                if ($player_count < $count) {
                    self::trace("Player doesn't have enough $worker_type: has $player_count, needs $count");
                    return false;
                }
                // Consume the workers from available pool
                $available_workers[$worker_type] -= $count;
                if ($available_workers[$worker_type] <= 0) {
                    unset($available_workers[$worker_type]);
                }
            }
        }
        
        // Now validate that the provided workers can satisfy the cost requirements
        // For each cost requirement, check if we have the specific worker type or can use purple workers
        for ($i = 0; $i < count($cost); $i++) {
            $required_type = $cost[$i];
            
            if ($required_type === COST_ANY_WORKER) {
                self::trace("Required: ANY_WORKER");
                // Any worker is acceptable, but we need to check if player has any
                if (empty($available_workers)) {
                    self::trace("No available workers for ANY_WORKER");
                    return false;
                }
                // Find any available worker type
                $found = false;
                foreach ($available_workers as $type => $count) {
                    if ($count > 0) {
                        $available_workers[$type]--;
                        if ($available_workers[$type] <= 0) {
                            unset($available_workers[$type]);
                        }
                        $found = true;
                        self::trace("Found available worker type: $type");
                        break;
                    }
                }
                if (!$found) {
                    self::trace("No available workers found for ANY_WORKER");
                    return false;
                }
            } else {
                self::trace("Required: $required_type");
                // Check if we have the specific required worker type
                if (isset($available_workers[$required_type]) && $available_workers[$required_type] > 0) {
                    $available_workers[$required_type]--;
                    if ($available_workers[$required_type] <= 0) {
                        unset($available_workers[$required_type]);
                    }
                    self::trace("Used specific worker type: $required_type");
                } else {
                    // Try to use purple workers as wild
                    if (isset($available_workers['purple_worker']) && $available_workers['purple_worker'] > 0) {
                        $available_workers['purple_worker']--;
                        if ($available_workers['purple_worker'] <= 0) {
                            unset($available_workers['purple_worker']);
                        }
                        self::trace("Used purple worker as wild for: $required_type");
                    } else {
                        self::trace("No specific worker or purple worker available for: $required_type");
                        return false;
                    }
                }
            }
        }
        
        self::trace("Validation successful");
        return true;
    }

    // Helper to calculate provision cost for commission based on current count
    public function getCommissionProvisionCost($player_id) {
        $commission_count = $this->getResourceCount($player_id, 'commission_qty');
        if ($commission_count < 3) {
            return 1; // First 3 commissions cost 1 provision each
        } elseif ($commission_count < 5) {
            return 2; // 4th and 5th commissions cost 2 provisions each
        } else {
            return 3; // 6th and 7th commissions cost 3 provisions each
        }
    }

    // Helper to get available board positions for commission
    public function getAvailableCommissionPositions($player_id) {
        // Get all positions from board_positions_material
        $all_positions = [];
        foreach ($this->board_positions_material as $index => $position) {
            $all_positions[] = $index;
        }
        
        // Get occupied positions for this player
        $occupied = $this->getBoardPositions($player_id);
        $occupied_indices = array_keys($occupied);
        
        // Return available positions
        return array_diff($all_positions, $occupied_indices);
    }

    // Helper to get available board positions for garrison
    public function getAvailableGarrisonPositions($player_id) {
        // Get all positions from board_positions_material
        $all_positions = [];
        foreach ($this->board_positions_material as $index => $position) {
            $all_positions[] = $index;
        }
        
        // Get occupied positions for this player
        $occupied = $this->getBoardPositions($player_id);
        $occupied_indices = array_keys($occupied);
        
        // Return available positions
        return array_diff($all_positions, $occupied_indices);
    }





    // Helper to calculate total faith for a player (Faith stat + Paladin bonus)
    public function getTotalFaith($player_id) {
        $faith_stat = intval($this->getResourceCount($player_id, 'faith'));
        $paladin_bonus = $this->getActivePaladinStatBonuses($player_id);
        return $faith_stat + $paladin_bonus['faith'];
    }

    public function getTotalInfluence($player_id) {
        $influence_stat = intval($this->getResourceCount($player_id, 'influence'));
        $paladin_bonus = $this->getActivePaladinStatBonuses($player_id);
        return $influence_stat + $paladin_bonus['influence'];
    }

    public function getActivePaladinStatBonuses($player_id) {
        $bonuses = [
            'faith' => 0,
            'strength' => 0,
            'influence' => 0,
            'name' => null,
        ];

        $cards = $this->deck->getCardsInLocation('paladin_hand', $player_id);
        // Active paladin is the single card kept in hand after pick; during setup there are 3
        if (count($cards) !== 1) {
            return $bonuses;
        }

        $card = reset($cards);
        if (!$card || !isset($card['type_arg'])) {
            return $bonuses;
        }
        $paladin_info = $this->paladins_cards_material[$card['type_arg']] ?? null;
        if ($paladin_info === null) {
            return $bonuses;
        }

        $bonuses['name'] = $paladin_info['name'] ?? null;

        if (!isset($paladin_info['stats'])) {
            return $bonuses;
        }

        foreach ($paladin_info['stats'] as $attr => $value) {
            if ($attr === ATTR_FAITH) {
                $bonuses['faith'] = intval($value);
            } elseif ($attr === ATTR_STRENGTH) {
                $bonuses['strength'] = intval($value);
            } elseif ($attr === ATTR_INFLUENCE) {
                $bonuses['influence'] = intval($value);
            }
        }

        return $bonuses;
    }

    public function getPlayerPanelData($player_id) {
        $paladin_bonus = $this->getActivePaladinStatBonuses($player_id);

        $faith_base = intval($this->getResourceCount($player_id, 'faith'));
        $strength_base = intval($this->getResourceCount($player_id, 'strength'));
        $influence_base = intval($this->getResourceCount($player_id, 'influence'));

        return [
            'faith' => $faith_base + $paladin_bonus['faith'],
            'faith_bonus' => $paladin_bonus['faith'],
            'strength' => $strength_base + $paladin_bonus['strength'],
            'strength_bonus' => $paladin_bonus['strength'],
            'influence' => $influence_base + $paladin_bonus['influence'],
            'influence_bonus' => $paladin_bonus['influence'],
            'provision' => intval($this->getResourceCount($player_id, 'provision')),
            'coin' => intval($this->getResourceCount($player_id, 'coin')),
            'white_worker' => intval($this->getResourceCount($player_id, 'white_worker')),
            'green_worker' => intval($this->getResourceCount($player_id, 'green_worker')),
            'blue_worker' => intval($this->getResourceCount($player_id, 'blue_worker')),
            'red_worker' => intval($this->getResourceCount($player_id, 'red_worker')),
            'black_worker' => intval($this->getResourceCount($player_id, 'black_worker')),
            'purple_worker' => intval($this->getResourceCount($player_id, 'purple_worker')),
            'suspicion' => $this->getPlayerSuspicionCount($player_id),
            'unpaid_debt' => intval($this->getResourceCount($player_id, 'unpaid_debt')),
            'paid_debt' => intval($this->getResourceCount($player_id, 'paid_debt')),
            'parchment' => intval($this->getResourceCount($player_id, 'parchment')),
            'active_paladin_name' => $paladin_bonus['name'],
        ];
    }

    // Helper to get available board positions based on player's faith
    public function getAvailableBoardPositionsByFaith($player_id) {
        $total_faith = $this->getTotalFaith($player_id);
        $occupied_positions = $this->getBoardPositions($player_id);
        $available_positions = [];
        
        foreach ($this->board_positions_material as $index => $position) {
            // Check if position is available (not occupied) and player has enough faith
            if (!isset($occupied_positions[$index]) && isset($position['min_faith']) && $total_faith >= $position['min_faith']) {
                $available_positions[] = [
                    'index' => $index,
                    'position' => $position
                ];
            }
        }
        
        return $available_positions;
    }

    public function commission($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('commission');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'commission')) {
            throw new BgaUserException(self::_("You have already used the commission action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_COMMISSION, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Commission action"));
        }
        
        // Check provision cost based on current commission count
        $provision_cost = $this->getCommissionProvisionCost($player_id);
        $provisions = $this->getResourceCount($player_id, RESOURCE_PROVISION);
        if ($provisions < $provision_cost) {
            throw new BgaUserException(self::_("You need ${provision_cost} Provision(s) to commission (based on your current commission count)"));
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_PROVISION, -$provision_cost);
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'commission', $worker_counts);
        
        // Increment commission count
        $this->addResource($player_id, 'commission_qty', 1);
        
        // Gain +1 Influence
        $this->addResource($player_id, ATTR_INFLUENCE, 1);
        
        self::notifyAllPlayers('commission', clienttranslate('${player_name} commissions a monk and gains +1 Influence (cost: ${provision_cost} provision)'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'provision_cost' => $provision_cost,
            'influence_gained' => 1
        ]);
        
        // Transition to board position selection state
        $this->gamestate->nextState('selectBoardPosition');
    }

    // New action for selecting board position after commission
    public function selectCommissionPosition($board_position_index)
    {
        self::checkAction('selectCommissionPosition');
        $player_id = self::getCurrentPlayerId();
        
        // Get available positions based on faith
        $available_positions = $this->getAvailableBoardPositionsByFaith($player_id);
        $position_found = false;
        $selected_position = null;
        
        foreach ($available_positions as $pos) {
            if ($pos['index'] == $board_position_index) {
                $position_found = true;
                $selected_position = $pos;
                break;
            }
        }
        
        if (!$position_found) {
            throw new BgaUserException(self::_("Invalid board position selected"));
        }
        
        // Add the commission to the board position
        $this->addPieceToBoardPosition($player_id, $board_position_index, 'commission');
        
        // Get the bonus from the selected position
        $bonus = $selected_position['position']['bonus'];
        
        // Handle the bonus
        $bonus_result = $this->handleCommissionBonus($player_id, $bonus);
        
        self::notifyAllPlayers('commissionPositionSelected', clienttranslate('${player_name} places monk at position ${position_index} and gains ${bonus}'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'position_index' => $board_position_index,
            'bonus' => $bonus,
            'bonus_result' => $bonus_result
        ]);
        
        // Check if we need additional game states for certain bonuses
        if ($bonus === 'free_recruit') {
            $this->gamestate->nextState('freeRecruit');
        } elseif ($bonus === 'pray') {
            $this->gamestate->nextState('selectPraySpace');
        } else {
            $this->gamestate->nextState('nextPlayer');
        }
    }

    // Helper to handle commission bonuses
    public function handleCommissionBonus($player_id, $bonus) {
        switch ($bonus) {
            case 'pay_debt':
                // Remove unpaid debt and add paid debt
                $this->addResource($player_id, RESOURCE_UNPAID_DEBT, -1);
                $this->addResource($player_id, RESOURCE_PAID_DEBT, 1);
                return ['type' => 'pay_debt', 'message' => clienttranslate('Paid 1 debt')];
                
            case 'fighter':
                // Add red worker
                $this->addResource($player_id, WORKER_RED, 1);
                return ['type' => 'fighter', 'message' => clienttranslate('Gained 1 Fighter')];
                
            case 'labourer_scout':
                // Add white and green workers
                $this->addResource($player_id, WORKER_WHITE, 1);
                $this->addResource($player_id, WORKER_GREEN, 1);
                return ['type' => 'labourer_scout', 'message' => clienttranslate('Gained 1 Labourer and 1 Scout')];
                
            case 'labourer_fighter':
                // Add white and red workers
                $this->addResource($player_id, WORKER_WHITE, 1);
                $this->addResource($player_id, WORKER_RED, 1);
                return ['type' => 'labourer_fighter', 'message' => clienttranslate('Gained 1 Labourer and 1 Fighter')];
                
            case 'labourer_merchant':
                // Add white and blue workers
                $this->addResource($player_id, WORKER_WHITE, 1);
                $this->addResource($player_id, WORKER_BLUE, 1);
                return ['type' => 'labourer_merchant', 'message' => clienttranslate('Gained 1 Labourer and 1 Merchant')];
                
            case 'labourer_cleric':
                // Add white and black workers
                $this->addResource($player_id, WORKER_WHITE, 1);
                $this->addResource($player_id, WORKER_BLACK, 1);
                return ['type' => 'labourer_cleric', 'message' => clienttranslate('Gained 1 Labourer and 1 Cleric')];
                
            case 'labourer_labourer':
                // Add two white workers
                $this->addResource($player_id, WORKER_WHITE, 2);
                return ['type' => 'labourer_labourer', 'message' => clienttranslate('Gained 2 Labourers')];
                
            case 'labourer':
                // Add one white worker
                $this->addResource($player_id, WORKER_WHITE, 1);
                return ['type' => 'labourer', 'message' => clienttranslate('Gained 1 Labourer')];
                
            case 'scout':
                // Add one green worker
                $this->addResource($player_id, WORKER_GREEN, 1);
                return ['type' => 'scout', 'message' => clienttranslate('Gained 1 Scout')];
                
            case 'merchant':
                // Add one blue worker
                $this->addResource($player_id, WORKER_BLUE, 1);
                return ['type' => 'merchant', 'message' => clienttranslate('Gained 1 Merchant')];
                
            case 'cleric':
                // Add one black worker
                $this->addResource($player_id, WORKER_BLACK, 1);
                return ['type' => 'cleric', 'message' => clienttranslate('Gained 1 Cleric')];
                
            case '2_coin':
                // Add two coins
                $this->addResource($player_id, RESOURCE_COIN, 2);
                return ['type' => '2_coin', 'message' => clienttranslate('Gained 2 Silver')];
                
            case 'free_recruit':
                // This will be handled in a separate game state
                return ['type' => 'free_recruit', 'message' => clienttranslate('Free recruit available')];
                
            case 'pray':
                // This will be handled in a separate game state
                return ['type' => 'pray', 'message' => clienttranslate('Pray action available')];
                
            case 'rmv_suspicion':
                // Remove suspicion (TODO: implement suspicion removal)
                return ['type' => 'rmv_suspicion', 'message' => clienttranslate('Removed suspicion')];
                
            default:
                return ['type' => 'unknown', 'message' => clienttranslate('Unknown bonus: ${bonus}', ['bonus' => $bonus])];
        }
    }

    public function fortify($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('fortify');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'fortify')) {
            throw new BgaUserException(self::_("You have already used the fortify action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_FORTIFY, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Fortify action"));
        }
        
        // Check influence requirement (minimum 2 influence needed)
        $influence = $this->getResourceCount($player_id, ATTR_INFLUENCE);
        if ($influence < 2) {
            throw new BgaUserException(self::_("You need at least 2 Influence to fortify"));
        }
        
        // Check provision cost (1 provision)
        $provisions = $this->getResourceCount($player_id, RESOURCE_PROVISION);
        if ($provisions < 1) {
            throw new BgaUserException(self::_("You need 1 Provision to fortify"));
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_PROVISION, -1);
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'fortify', $worker_counts);
        
        // TODO: Implement wall building logic
        // TODO: Add fortify count tracking
        
        self::notifyAllPlayers('fortify', clienttranslate('${player_name} fortifies with a wall'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id)
        ]);
        $this->gamestate->nextState('nextPlayer');
    }

    // Helper to calculate total strength for a player (Strength stat + Paladin bonus)
    public function getTotalStrength($player_id) {
        $strength_stat = intval($this->getResourceCount($player_id, 'strength'));
        $paladin_bonus = $this->getActivePaladinStatBonuses($player_id);
        return $strength_stat + $paladin_bonus['strength'];
    }

    // Helper to get available board positions based on player's strength
    public function getAvailableBoardPositionsByStrength($player_id) {
        $total_strength = $this->getTotalStrength($player_id);
        $occupied_positions = $this->getBoardPositions($player_id);
        $available_positions = [];
        
        foreach ($this->board_positions_material as $index => $position) {
            // Check if position is available (not occupied) and player has enough strength
            if (!isset($occupied_positions[$index]) && isset($position['min_strength']) && $total_strength >= $position['min_strength']) {
                $available_positions[] = [
                    'index' => $index,
                    'position' => $position
                ];
            }
        }
        
        return $available_positions;
    }

    // Helper to get provision cost for garrison (same as commission)
    public function getGarrisonProvisionCost($player_id) {
        $garrison_count = $this->getResourceCount($player_id, 'garrison_qty');
        if ($garrison_count < 3) {
            return 1; // First 3 garrisons cost 1 provision each
        } elseif ($garrison_count < 5) {
            return 2; // 4th and 5th garrisons cost 2 provisions each
        } else {
            return 3; // 6th and 7th garrisons cost 3 provisions each
        }
    }

    public function garrison($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('garrison');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'garrison')) {
            throw new BgaUserException(self::_("You have already used the garrison action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_GARRISON, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Garrison action"));
        }
        
        // Check provision cost based on current garrison count
        $provision_cost = $this->getGarrisonProvisionCost($player_id);
        $provisions = $this->getResourceCount($player_id, RESOURCE_PROVISION);
        if ($provisions < $provision_cost) {
            throw new BgaUserException(self::_("You need ${provision_cost} Provision(s) to garrison (based on your current garrison count)"));
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_PROVISION, -$provision_cost);
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'garrison', $worker_counts);
        
        // Increment garrison count
        $this->addResource($player_id, 'garrison_qty', 1);
        
        // Gain +1 Faith
        $this->addResource($player_id, ATTR_FAITH, 1);
        
        self::notifyAllPlayers('garrison', clienttranslate('${player_name} garrisons an outpost and gains +1 Faith (cost: ${provision_cost} provision)'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'provision_cost' => $provision_cost,
            'faith_gained' => 1
        ]);
        
        // Transition to board position selection state
        $this->gamestate->nextState('selectBoardPosition');
    }

    // New action for selecting board position after garrison
    public function selectGarrisonPosition($board_position_index)
    {
        self::checkAction('selectGarrisonPosition');
        $player_id = self::getCurrentPlayerId();
        
        // Get available positions based on strength
        $available_positions = $this->getAvailableBoardPositionsByStrength($player_id);
        $position_found = false;
        $selected_position = null;
        
        foreach ($available_positions as $pos) {
            if ($pos['index'] == $board_position_index) {
                $position_found = true;
                $selected_position = $pos;
                break;
            }
        }
        
        if (!$position_found) {
            throw new BgaUserException(self::_("Invalid board position selected"));
        }
        
        // Add the garrison to the board position
        $this->addPieceToBoardPosition($player_id, $board_position_index, 'garrison');
        
        // Get the bonus from the selected position
        $bonus = $selected_position['position']['bonus'];
        
        // Handle the bonus (same as commission)
        $bonus_result = $this->handleCommissionBonus($player_id, $bonus);
        
        self::notifyAllPlayers('garrisonPositionSelected', clienttranslate('${player_name} places outpost at position ${position_index} and gains ${bonus}'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'position_index' => $board_position_index,
            'bonus' => $bonus,
            'bonus_result' => $bonus_result
        ]);
        
        // Check if we need additional game states for certain bonuses
        if ($bonus === 'free_recruit') {
            $this->gamestate->nextState('freeRecruit');
        } elseif ($bonus === 'pray') {
            $this->gamestate->nextState('selectPraySpace');
        } else {
            $this->gamestate->nextState('nextPlayer');
        }
    }

    public function absolve($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $jar_position)
    {
        self::checkAction('absolve');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'absolve')) {
            throw new BgaUserException(self::_("You have already used the absolve action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_ABSOLVE, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Absolve action"));
        }
        
        // Check influence requirement (minimum 2 influence needed)
        $influence = $this->getResourceCount($player_id, ATTR_INFLUENCE);
        if ($influence < 2) {
            throw new BgaUserException(self::_("You need at least 2 Influence to absolve"));
        }
        
        // Check silver cost (2 silver)
        $silver = $this->getResourceCount($player_id, RESOURCE_COIN);
        if ($silver < 2) {
            throw new BgaUserException(self::_("You need 2 Silver to absolve"));
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_COIN, -2);
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'absolve', $worker_counts);
        
        // TODO: Implement absolution logic based on jar position
        // TODO: Add absolve count tracking
        
        self::notifyAllPlayers('absolve', clienttranslate('${player_name} absolves'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'jar_position' => $jar_position
        ]);
        $this->gamestate->nextState('nextPlayer');
    }

    public function attack($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $outsider_card_id, $silver_cost = 0)
    {
        self::checkAction('attack');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'attack')) {
            throw new BgaUserException(self::_("You have already used the attack action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_ATTACK, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Attack action"));
        }
        
        // Check strength requirement (minimum 2 strength needed)
        $strength = $this->getResourceCount($player_id, ATTR_STRENGTH);
        if ($strength < 2) {
            throw new BgaUserException(self::_("You need at least 2 Strength to attack"));
        }
        
        // Check silver cost if needed
        if ($silver_cost > 0) {
            $silver = $this->getResourceCount($player_id, RESOURCE_COIN);
            if ($silver < $silver_cost) {
                throw new BgaUserException(self::_("You need ${silver_cost} Silver to attack this outsider"));
            }
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        if ($silver_cost > 0) {
            $this->addResource($player_id, RESOURCE_COIN, -$silver_cost);
        }
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'attack', $worker_counts);
        
        // TODO: Implement attack logic for outsider card
        // TODO: Add attack count tracking
        
        self::notifyAllPlayers('attack', clienttranslate('${player_name} attacks an outsider'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'outsider_card_id' => $outsider_card_id,
            'silver_cost' => $silver_cost
        ]);
        $this->gamestate->nextState('nextPlayer');
    }

    public function convert($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $outsider_card_id)
    {
        self::checkAction('convert');
        $player_id = self::getCurrentPlayerId();
        
        // Check if action is available
        if (!$this->canUseAction($player_id, 'convert')) {
            throw new BgaUserException(self::_("You have already used the convert action this round"));
        }
        
        $cost = $this->getCurrentActionCost(ACTION_CONVERT, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for Convert action"));
        }
        
        // Check faith requirement (minimum 2 faith needed)
        $faith = $this->getResourceCount($player_id, ATTR_FAITH);
        if ($faith < 2) {
            throw new BgaUserException(self::_("You need at least 2 Faith to convert"));
        }
        
        // Check silver cost (2 silver)
        $silver = $this->getResourceCount($player_id, RESOURCE_COIN);
        if ($silver < 2) {
            throw new BgaUserException(self::_("You need 2 Silver to convert"));
        }
        
        // Remove workers and pay costs
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->addResource($player_id, RESOURCE_COIN, -2);
        
        // Mark action as used
        $this->markActionAsUsed($player_id, 'convert', $worker_counts);
        
        // TODO: Implement conversion logic for outsider card
        // TODO: Add convert count tracking
        
        self::notifyAllPlayers('convert', clienttranslate('${player_name} converts an outsider'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'outsider_card_id' => $outsider_card_id
        ]);
        $this->gamestate->nextState('nextPlayer');
    }

    public function kingsFavour($worker_id, $kings_favour_id)
    {
        self::checkAction('kingsFavour');
        $player_id = self::getCurrentPlayerId();
        
        // Validate worker and kings favour card
        // TODO: Add validation logic
        
        // Use kings favour and gain rewards
        // TODO: Implement kings favour logic
        
        self::notifyAllPlayers('kingsFavour', clienttranslate('${player_name} uses a King\'s Favour'), [
            'player_name' => self::getCurrentPlayerName(),
            'player_id' => $player_id
        ]);
        
        $this->gamestate->nextState('nextPlayer');
    }

    // Helper method to get resource count
    private function getResourceCount($player_id, $resource_type)
    {
        // Check if the resource exists as a column in the player table
        $valid_resources = [
            'coin', 'provision', 'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker', 'paid_debt', 'unpaid_debt',
            'strength', 'faith', 'influence', 'parchment', 'develop_qty', 
            'commission_qty', 'garrison_qty'
        ];
        
        if (in_array($resource_type, $valid_resources)) {
            $sql = "SELECT $resource_type FROM player WHERE player_id = $player_id";
            return intval(self::getUniqueValueFromDb($sql));
        }
        
        return 0;
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

        throw new feException("Zombie mode not supported at this game state: " . $statename);
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

    // Helper to add a piece to a board position (unified method for commission and garrison)
    public function addPieceToBoardPosition($player_id, $position, $piece_type) {
        // Validate piece type
        if (!in_array($piece_type, ['commission', 'garrison'])) {
            throw new BgaUserException(self::_("Invalid piece type: ${piece_type}"));
        }
        
        // Get current board positions
        $board_positions = $this->getBoardPositions($player_id);
        
        // Add the piece to the specified position
        $board_positions[$position] = $piece_type;
        
        // Save back to database
        $positions_json = json_encode($board_positions);
        $sql = "UPDATE player SET board_positions = '$positions_json' WHERE player_id = $player_id";
        self::DbQuery($sql);
    }

    // Helper to get all board positions for a player
    public function getBoardPositions($player_id) {
        $sql = "SELECT board_positions FROM player WHERE player_id = $player_id";
        $result = self::getUniqueValueFromDb($sql);
        return $result ? json_decode($result, true) : [];
    }

    public function getMainBoardPositions()
    {
        $merged = [];
        $players = self::loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $positions = $this->getBoardPositions($player_id);
            foreach ($positions as $index => $type) {
                $merged[$index] = [
                    'type' => $type,
                    'player_id' => $player_id,
                ];
            }
        }
        return $merged;
    }

    // Helper to get positions for a specific piece type
    public function getPositions($player_id, $piece_type) {
        // Validate piece type
        if (!in_array($piece_type, ['commission', 'garrison'])) {
            throw new BgaUserException(self::_("Invalid piece type: ${piece_type}"));
        }
        
        $board_positions = $this->getBoardPositions($player_id);
        $positions = [];
        
        foreach ($board_positions as $position => $type) {
            if ($type === $piece_type) {
                $positions[] = (int)$position;
            }
        }
        
        return $positions;
    }

    // Legacy methods for backward compatibility
    public function addCommissionPosition($player_id, $position) {
        return $this->addPieceToBoardPosition($player_id, $position, 'commission');
    }

    public function addGarrisonPosition($player_id, $position) {
        return $this->addPieceToBoardPosition($player_id, $position, 'garrison');
    }

    // Legacy methods for backward compatibility
    public function getCommissionPositions($player_id) {
        return $this->getPositions($player_id, 'commission');
    }

    public function getGarrisonPositions($player_id) {
        return $this->getPositions($player_id, 'garrison');
    }

    public function notifyPlayerResourceUpdate($player_id) {
        // Get updated player data
        $sql = "SELECT * FROM player WHERE player_id = $player_id";
        $player_data = self::getObjectFromDb($sql);
        
        // Send notification to all players to update the resource table
        self::notifyAllPlayers('playerResourcesUpdated', '', [
            'player_id' => $player_id,
            'player_data' => $player_data,
            'panel_data' => $this->getPlayerPanelData($player_id),
        ]);
    }

    public function selectPaladins($top_paladin_id, $middle_paladin_id, $bottom_paladin_id)
    {
        // This method is called from the client AJAX call
        // For now, call the existing pickPaladins logic with the correct mapping
        // (Assuming: top = top, middle = chosen, bottom = bottom)
        return $this->pickPaladins($bottom_paladin_id, $middle_paladin_id, $top_paladin_id);
    }
}
