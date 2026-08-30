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

    /** Permanent Faith / Strength / Influence track maximum (0–12). */
    public const MAX_PERMANENT_ATTRIBUTE = 12;

    /** TEMP DEBUG — remove when done testing Fortify. */
    private const DEBUG_UNLIMITED_FORTIFY = true;
    private const DEBUG_STARTING_INFLUENCE = 0;
    /** TEMP DEBUG — grant on initial townsfolk hire to test attribute milestone VP. */
    private const DEBUG_INITIAL_TOWNSFOLK_INFLUENCE = 12;

    public const PERMANENT_ATTRIBUTES = ['faith', 'strength', 'influence'];

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
        'fortify_qty',
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
            "kings_favour_used" => 13,
            "kings_favour_newly_revealed" => 14,
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
        $result['wall_cards'] = $this->getPlayerWallCardsForClient($current_player_id);
        $result['all_players_wall_cards'] = [];
        foreach ($players as $player_id => $player) {
            $result['all_players_wall_cards'][$player_id] = $this->getPlayerWallCardsForClient($player_id);
        }
        $result['wall_cards_material'] = $this->wall_cards_material;
        $result['wall_deck_count'] = intval($this->deck->countCardInLocation('wall_deck'));
        $result['kingsorder_display'] = $this->deck->getCardsInLocation('kingsorder_display');
        $result['kingsfavour_display'] = $this->deck->getCardsInLocation('kingsfavour_display');
        $result['board_positions_material'] = $this->board_positions_material;
        $result['outsider_material'] = $this->os_cards_material;
        $result['main_board_positions'] = $this->getMainBoardPositions();
        
        // Add tax supply information
        $result['tax_supply'] = $this->getTaxSupply();
        $result['kings_favour_used'] = $this->getKingsFavourUsedCardIds();
        $result['kings_favour_newly_revealed'] = $this->getKingsFavourNewlyRevealedId();
        
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

        $result['player_active_paladins'] = [];
        foreach ($players as $player_id => $player) {
            $paladin_cards = $this->deck->getCardsInLocation('paladin_hand', $player_id);
            if (count($paladin_cards) === 1) {
                $result['player_active_paladins'][$player_id] = reset($paladin_cards);
            }
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

    public function formatWorkersWithArticleForMessage($workers)
    {
        $labels = [
            'white_worker' => clienttranslate('Labourer'),
            'green_worker' => clienttranslate('Scout'),
            'blue_worker' => clienttranslate('Merchant'),
            'red_worker' => clienttranslate('Fighter'),
            'black_worker' => clienttranslate('Cleric'),
            'purple_worker' => clienttranslate('Criminal'),
        ];

        $names = [];
        foreach ($workers as $worker) {
            $normalized = $this->normalizeWorkerType($worker);
            $names[] = $labels[$normalized] ?? $normalized;
        }

        $count = count($names);
        if ($count === 0) {
            return '';
        }
        if ($count === 1) {
            return clienttranslate('a ${worker}', ['worker' => $names[0]]);
        }
        if ($count === 2) {
            return clienttranslate('a ${worker1} and ${worker2}', [
                'worker1' => $names[0],
                'worker2' => $names[1],
            ]);
        }

        $last = array_pop($names);
        return clienttranslate('a ${workers} and ${last}', [
            'workers' => implode(', ', $names),
            'last' => $last,
        ]);
    }

    private function getWorkerLogLabel($worker_type, $count)
    {
        $labels = [
            'white_worker' => [clienttranslate('Labourer'), clienttranslate('Labourers')],
            'green_worker' => [clienttranslate('Scout'), clienttranslate('Scouts')],
            'blue_worker' => [clienttranslate('Merchant'), clienttranslate('Merchants')],
            'red_worker' => [clienttranslate('Fighter'), clienttranslate('Fighters')],
            'black_worker' => [clienttranslate('Cleric'), clienttranslate('Clerics')],
            'purple_worker' => [clienttranslate('Criminal'), clienttranslate('Criminals')],
        ];

        $pair = $labels[$worker_type] ?? [clienttranslate('Worker'), clienttranslate('Workers')];
        return $count === 1 ? $pair[0] : $pair[1];
    }

    private function formatWorkerPaymentPartHtml($worker_type, $count)
    {
        if ($count <= 0) {
            return '';
        }

        $css_class = 'log_worker_' . str_replace('_worker', '', $worker_type);
        $label = $this->getWorkerLogLabel($worker_type, $count);

        return sprintf(
            '<span class="log_worker %s">%d %s</span>',
            $css_class,
            $count,
            $label
        );
    }

    private function formatProvisionPaymentPartHtml($count)
    {
        $count = intval($count);
        $label = $count === 1
            ? clienttranslate('provision')
            : clienttranslate('provisions');

        return sprintf('<span class="log_provision">%d %s</span>', $count, $label);
    }

    private function formatSilverPaymentPartHtml($count)
    {
        $count = intval($count);
        if ($count <= 0) {
            return '';
        }

        $label = $count === 1
            ? clienttranslate('silver')
            : clienttranslate('silver');

        return sprintf('<span class="log_silver">%d %s</span>', $count, $label);
    }

    public function formatActionPaymentForLog($provision_cost, array $workers_used, $silver_cost = 0)
    {
        $parts = [];
        if ($silver_cost > 0) {
            $parts[] = $this->formatSilverPaymentPartHtml($silver_cost);
        }
        if ($provision_cost > 0) {
            $parts[] = $this->formatProvisionPaymentPartHtml($provision_cost);
        }

        $used_counts = [];
        foreach ($workers_used as $worker) {
            $worker_type = $this->normalizeWorkerType($worker);
            $used_counts[$worker_type] = ($used_counts[$worker_type] ?? 0) + 1;
        }

        $worker_order = [
            'white_worker', 'green_worker', 'blue_worker',
            'red_worker', 'black_worker', 'purple_worker',
        ];

        foreach ($worker_order as $worker_type) {
            $count = intval($used_counts[$worker_type] ?? 0);
            if ($count > 0) {
                $parts[] = $this->formatWorkerPaymentPartHtml($worker_type, $count);
            }
        }

        return $this->formatNaturalLanguageList($parts);
    }

    private function formatWorkerCountsForLog(array $worker_counts)
    {
        $worker_order = [
            'white_worker', 'green_worker', 'blue_worker',
            'red_worker', 'black_worker', 'purple_worker',
        ];
        $parts = [];

        foreach ($worker_order as $worker_type) {
            $count = intval($worker_counts[$worker_type] ?? 0);
            if ($count > 0) {
                $parts[] = $this->formatWorkerPaymentPartHtml($worker_type, $count);
            }
        }

        return $this->formatNaturalLanguageList($parts);
    }

    private function getActionSpaceDisplayName($action_space)
    {
        $names = [
            'develop' => clienttranslate('Develop'),
            'hunt' => clienttranslate('Hunt'),
            'trade' => clienttranslate('Trade'),
            'recruit' => clienttranslate('Recruit'),
            'conspire' => clienttranslate('Conspire'),
            'commission' => clienttranslate('Commission'),
            'fortify' => clienttranslate('Fortify'),
            'garrison' => clienttranslate('Garrison'),
            'absolve' => clienttranslate('Absolve'),
            'attack' => clienttranslate('Attack'),
            'convert' => clienttranslate('Convert'),
        ];

        return $names[$action_space] ?? $action_space;
    }

    private function notifyActionPaymentLine($player_name, $player_id, $payment_text)
    {
        if ($payment_text === '') {
            return;
        }

        self::notifyAllPlayers('actionPayment', clienttranslate('${player_name} sends ${payment}'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'payment' => $payment_text,
        ]);
    }

    private function notifyActionRewardLine($player_name, $player_id, $reward_text)
    {
        if ($reward_text === '') {
            return;
        }

        self::notifyAllPlayers('actionReward', clienttranslate('${player_name} gets ${rewards}'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'rewards' => $reward_text,
        ]);
    }

    private function notifyPassKeptWorkersLine($player_name, $player_id, $kept_workers_text)
    {
        if ($kept_workers_text === '') {
            return;
        }

        self::notifyAllPlayers('passKeptWorkers', clienttranslate('${player_name} keeps ${workers}'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'workers' => $kept_workers_text,
        ]);
    }

    private function notifyFortifyMilestoneVpLine($player_name, $player_id, $fortify_count, $milestone_vp)
    {
        $templates = [
            5 => clienttranslate('${player_name} gets +${vp} VP for building their 5th wall'),
            6 => clienttranslate('${player_name} gets +${vp} VP for building their 6th wall'),
            7 => clienttranslate('${player_name} gets +${vp} VP for building their 7th wall'),
        ];

        $fortify_count = intval($fortify_count);
        if (!isset($templates[$fortify_count]) || intval($milestone_vp) < 1) {
            return;
        }

        self::notifyAllPlayers('fortifyMilestoneVp', $templates[$fortify_count], [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'vp' => intval($milestone_vp),
            'fortify_count' => $fortify_count,
        ]);
    }

    private function notifyPlayerAction($notif_type, $action_message, array $state_args, $payment_text = '', $reward_text = '')
    {
        $player_name = $state_args['player_name'] ?? self::getCurrentPlayerName();
        $player_id = $state_args['player_id'] ?? self::getCurrentPlayerId();

        self::notifyAllPlayers($notif_type, $action_message, $state_args);
        $this->notifyActionPaymentLine($player_name, $player_id, $payment_text);
        $this->notifyActionRewardLine($player_name, $player_id, $reward_text);
    }

    private function formatWallRewardForLog($message)
    {
        if (strpos($message, '<span') === 0) {
            return $message;
        }

        if (preg_match('/^\+(\d+)\s+(.*)$/', $message, $matches)) {
            return $matches[1] . ' ' . $matches[2];
        }

        if (strpos($message, '+') === 0) {
            $reward = substr($message, 1);
            return $reward !== '' ? ('1 ' . $reward) : '1';
        }

        return $message;
    }

    private function formatNaturalLanguageList(array $items)
    {
        $items = array_values(array_filter($items, function ($item) {
            return $item !== '';
        }));
        $count = count($items);
        if ($count === 0) {
            return '';
        }
        if ($count === 1) {
            return $items[0];
        }
        if ($count === 2) {
            return $items[0] . clienttranslate(' and ') . $items[1];
        }

        $last = array_pop($items);
        return implode(', ', $items) . clienttranslate(' and ') . $last;
    }

    public function formatWallRewardsForLogMessage(array $reward_messages)
    {
        $counts = [];
        $other = [];
        foreach ($reward_messages as $message) {
            $formatted = $this->formatWallRewardForLog($message);
            if (preg_match('/^(\d+)\s+(.*)$/', $formatted, $matches)) {
                $label = $matches[2];
                $counts[$label] = ($counts[$label] ?? 0) + intval($matches[1]);
            } else {
                $other[] = $formatted;
            }
        }

        $parts = [];
        foreach ($counts as $label => $qty) {
            $parts[] = $qty . ' ' . $label;
        }
        $parts = array_merge($parts, $other);

        return $this->formatNaturalLanguageList($parts);
    }

    private function grantPlayerVp($player_id, $vp)
    {
        $vp = intval($vp);
        if ($vp <= 0) {
            return;
        }

        $this->playerScore->inc($player_id, $vp);
    }

    private function getFortifyMilestoneVp($fortify_count)
    {
        $fortify_count = intval($fortify_count);
        $milestones = [
            5 => 1,
            6 => 2,
            7 => 3,
        ];

        return $milestones[$fortify_count] ?? 0;
    }

    private function getAttributeMilestoneVp($attribute_level)
    {
        $milestones = [
            2 => 1,
            4 => 2,
            6 => 3,
            8 => 3,
            9 => 2,
            10 => 2,
            11 => 3,
            12 => 4,
        ];

        return $milestones[intval($attribute_level)] ?? 0;
    }

    private function getAttributeDisplayName($attribute)
    {
        $names = [
            'faith' => clienttranslate('Faith'),
            'strength' => clienttranslate('Strength'),
            'influence' => clienttranslate('Influence'),
        ];

        return $names[$attribute] ?? $attribute;
    }

    private function grantAttributeMilestoneVpForLevel($player_id, $attribute, $level)
    {
        $milestone_vp = $this->getAttributeMilestoneVp($level);
        if ($milestone_vp < 1) {
            return;
        }

        $this->grantPlayerVp($player_id, $milestone_vp);
        self::notifyAllPlayers('attributeMilestoneVp', clienttranslate('${player_name} gets +${vp} VP for reaching ${level} ${attribute_name}'), [
            'player_name' => self::getPlayerNameById($player_id),
            'player_id' => $player_id,
            'attribute' => $attribute,
            'attribute_name' => $this->getAttributeDisplayName($attribute),
            'level' => intval($level),
            'vp' => $milestone_vp,
        ]);
    }

    /**
     * Apply a permanent attribute change one track space at a time so every
     * crossed VP threshold triggers its own award, even on large increases.
     */
    private function applyPermanentAttributeChange($player_id, $attribute, $qty)
    {
        $current = intval($this->getResourceCount($player_id, $attribute));
        $target = $this->clampPermanentAttribute($current + intval($qty));

        if ($target === $current) {
            return;
        }

        if ($target > $current) {
            for ($level = $current + 1; $level <= $target; $level++) {
                self::DbQuery("UPDATE player SET $attribute = $level WHERE player_id = $player_id");
                $this->grantAttributeMilestoneVpForLevel($player_id, $attribute, $level);
            }
            return;
        }

        self::DbQuery("UPDATE player SET $attribute = $target WHERE player_id = $player_id");
    }

    private function normalizePlayerResourceColumn($resource)
    {
        $map = [
            RESOURCE_UNPAID_DEBT => 'unpaid_debt',
            RESOURCE_PAID_DEBT => 'paid_debt',
            RESOURCE_COIN => 'coin',
            RESOURCE_PROVISION => 'provision',
            ATTR_STRENGTH => 'strength',
            ATTR_FAITH => 'faith',
            ATTR_INFLUENCE => 'influence',
        ];

        return $map[$resource] ?? $resource;
    }

    private function isPermanentAttribute($resource)
    {
        return in_array($resource, self::PERMANENT_ATTRIBUTES, true);
    }

    private function clampPermanentAttribute($value)
    {
        return max(0, min(self::MAX_PERMANENT_ATTRIBUTE, intval($value)));
    }

    public function addResource($player_id, $resource, $qty = 1, $notify_resource_update = true)
    {
        $resource = $this->normalizePlayerResourceColumn($resource);

        // Check if the resource exists as a column in the player table
        $valid_resources = [
            'coin', 'provision', 'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker', 'paid_debt', 'unpaid_debt',
            'strength', 'faith', 'influence', 'parchment', 'develop_qty', 
            'commission_qty', 'garrison_qty', 'fortify_qty'
        ];
        
        if (in_array($resource, $valid_resources)) {
            if ($this->isPermanentAttribute($resource)) {
                $this->applyPermanentAttributeChange($player_id, $resource, $qty);
            } else {
                $sql = "UPDATE player SET $resource = $resource + $qty WHERE player_id = $player_id";
                self::DbQuery($sql);
            }
            
            if ($notify_resource_update) {
                $this->notifyPlayerResourceUpdate($player_id);
            }
            return;
        }

        self::warn("Attempted to add invalid resource: $resource");
    }

    public function addWorkersForPlayer($player_id, $workers)
    {
        $valid_workers = [
            'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker'
        ];
        
        $worker_counts = array_fill_keys($valid_workers, 0);
        $criminal_count = 0;
        foreach ($workers as $worker) {
            $worker = $this->normalizeWorkerType($worker);
            if ($worker === 'purple_worker') {
                $criminal_count++;
            }
            if (isset($worker_counts[$worker])) {
                $worker_counts[$worker]++;
            }
        }

        $updates = [];
        foreach ($worker_counts as $worker => $count) {
            if ($count > 0) {
                $updates[] = "$worker = $worker + $count";
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

            if (!empty($suspicion_info['tax_depleted'])) {
                $this->handleTaxSupplyDepleted();
            }
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

        return [
            'removed' => $current - $new_amount,
            'depleted' => ($current > 0 && $new_amount == 0),
        ];
    }

    private function handleTaxSupplyDepleted()
    {
        $this->triggerInquisition();
        $this->refillTaxSupplyAfterInquisition();
    }

    private function refillTaxSupplyAfterInquisition()
    {
        $player_count = count(self::loadPlayersBasicInfos());
        $tax_amounts = [2 => 5, 3 => 6, 4 => 8];
        $refill_amount = $tax_amounts[$player_count] ?? 5;
        $this->setTaxSupply($refill_amount);

        self::notifyAllPlayers(
            'taxSupplyChanged',
            clienttranslate('Tax supply refilled with ${tax_amount} silver'),
            [
                'tax_supply' => $refill_amount,
                'tax_amount' => $refill_amount,
            ]
        );
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

        self::notifyAllPlayers(
            'inquisition',
            clienttranslate('Inquisition! Players with most suspicion gain debt.'),
            [
                'players_with_debt' => array_column($players_with_max, 'player_id'),
                'tax_supply' => 0,
            ]
        );
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
                provision = 13,
                influence = " . self::DEBUG_STARTING_INFLUENCE . ",
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
            'tax_amount' => $tax_amount,
            'tax_supply' => $tax_amount,
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
            
            // Add tax to player if available
            $tax_to_give = 0;
            $tax_depleted = false;
            if ($tax_amount > 0) {
                $tax_result = $this->removeFromTaxSupply($tax_amount);
                $tax_to_give = $tax_result['removed'];
                $tax_depleted = $tax_result['depleted'];
                if ($tax_to_give > 0) {
                    $this->addResource($player_id, RESOURCE_COIN, $tax_to_give, false);
                }
                if ($tax_depleted) {
                    self::notifyAllPlayers(
                        'taxSupplyChanged',
                        clienttranslate('The tax supply is empty'),
                        ['tax_supply' => 0]
                    );
                }
            }
            
            $suspicion_info = [
                'id' => $suspicion_card['id'],
                'type' => $suspicion_card['type'],
                'type_arg' => $suspicion_card['type_arg'],
                'tax_amount' => $tax_amount,
                'tax_supply' => $this->getTaxSupply(),
                'tax_given' => $tax_to_give,
                'tax_depleted' => $tax_depleted,
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
                $oldest_card = reset($oldest_card);
                $this->deck->moveCard($oldest_card['id'], 'discard');
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
        $card = $this->deck->pickCardForLocation('kingsfavour_deck', 'kingsfavour_display');
        if ($card) {
            $this->setKingsFavourNewlyRevealed(intval($card['id']));
        }
        $this->normalizeCardDisplay('kingsfavour_display');
        self::notifyAllPlayers('kingsDisplayUpdated', '', array(
            'kingsfavour_display' => $this->deck->getCardsInLocation('kingsfavour_display'),
            'kings_favour_newly_revealed' => $this->getKingsFavourNewlyRevealedId(),
        ));
    }

    public function revealTaverns()
    {
        $this->deck->moveAllCardsInLocation('tavern_display', 'tavern_discard');
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

        // TEMP DEBUG — test attribute milestone VP notifications
        if (self::DEBUG_INITIAL_TOWNSFOLK_INFLUENCE > 0) {
            $this->addResource($player_id, ATTR_INFLUENCE, self::DEBUG_INITIAL_TOWNSFOLK_INFLUENCE);
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
            'player_name' => $this->getPlayerNameById($player_id),
            'chosen_card' => $chosen_card,
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
        self::setGameStateValue('current_round', $new_round);
        $this->refillDisplays($new_round);

        // Player board action spaces reset every round; passing also clears a player's board mid-round.
        $this->clearActionSpaces();

        // King's Favour cards are cleaned at the start of rounds 4-7.
        if ($new_round >= 4 && $new_round <= 7) {
            $this->clearKingsFavourForNewRound();
        }

        if ($new_round >= 3) {
            $this->revealKingsFavour($new_round);
        }
        if ($new_round >= 2) {
            $this->setNextFirstPlayer();
        }
        
        $this->gamestate->nextState('done');
    }

    public function clearActionSpaces()
    {
        // New-round reset for all players: action availability and pass status.
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
                action_convert_workers = NULL,
                has_passed = 0";
        self::DbQuery($sql);
        
        self::notifyAllPlayers("clearActionSpaces", clienttranslate('Action spaces cleared for new round'), []);
    }

    public function clearKingsFavourForNewRound()
    {
        $this->clearKingsFavourUsed();
        $this->clearKingsFavourNewlyRevealed();

        self::notifyAllPlayers('kingsFavourCleared', clienttranslate('King\'s Favour cards refreshed for the new round'), [
            'kings_favour_used' => [],
            'kings_favour_newly_revealed' => 0,
        ]);
    }

    public function getKingsFavourUsedCardIds()
    {
        $used_json = self::getGameStateValue('kings_favour_used');
        if (!$used_json) {
            return [];
        }

        $used = json_decode($used_json, true);
        return is_array($used) ? array_map('intval', $used) : [];
    }

    public function isKingsFavourUsed($card_id)
    {
        return in_array(intval($card_id), $this->getKingsFavourUsedCardIds(), true);
    }

    public function markKingsFavourUsed($card_id)
    {
        $used = $this->getKingsFavourUsedCardIds();
        $card_id = intval($card_id);
        if (!in_array($card_id, $used, true)) {
            $used[] = $card_id;
            self::setGameStateValue('kings_favour_used', json_encode($used));
        }
    }

    public function clearKingsFavourUsed()
    {
        self::setGameStateValue('kings_favour_used', json_encode([]));
    }

    public function getKingsFavourNewlyRevealedId()
    {
        return intval(self::getGameStateValue('kings_favour_newly_revealed'));
    }

    public function setKingsFavourNewlyRevealed($card_id)
    {
        self::setGameStateValue('kings_favour_newly_revealed', intval($card_id));
    }

    public function clearKingsFavourNewlyRevealed()
    {
        self::setGameStateValue('kings_favour_newly_revealed', 0);
    }

    public function isKingsFavourUsable($card_id)
    {
        $card_id = intval($card_id);
        if ($card_id <= 0) {
            return false;
        }

        if ($card_id === $this->getKingsFavourNewlyRevealedId()) {
            return false;
        }

        return !$this->isKingsFavourUsed($card_id);
    }

    public function getKingsFavourCardCost($type_arg)
    {
        if (!isset($this->kingsfavour_cards_material[$type_arg]['worker_cost'])) {
            return [COST_ANY_WORKER];
        }

        return [$this->kingsfavour_cards_material[$type_arg]['worker_cost']];
    }

    public function validateKingsFavourCard($kings_favour_id)
    {
        $kings_favour_id = intval($kings_favour_id);
        $card = $this->deck->getCard($kings_favour_id);

        if (!$card || $card['type'] !== CARD_TYPE_KINGS_FAVOUR || $card['location'] !== 'kingsfavour_display') {
            throw new BgaUserException(self::_("Invalid King's Favour card"));
        }

        if ($this->isKingsFavourUsed($kings_favour_id)) {
            throw new BgaUserException(self::_("This King's Favour has already been used this round"));
        }

        if (!$this->isKingsFavourUsable($kings_favour_id)) {
            throw new BgaUserException(self::_("This King's Favour cannot be used until next round"));
        }

        return $card;
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
     * Clear a used action space (Pray target). Workers are removed from the board and return to supply.
     */
    public function validateClearableActionSpace($player_id, $action_name)
    {
        $clearable_actions = ['develop', 'hunt', 'trade', 'recruit', 'conspire',
            'commission', 'fortify', 'garrison', 'absolve', 'attack', 'convert'];

        if (!in_array($action_name, $clearable_actions, true)) {
            throw new BgaUserException(self::_("This action space cannot be cleared"));
        }

        $used_field = "action_{$action_name}_used";
        $sql = "SELECT $used_field FROM player WHERE player_id = $player_id";
        if ((int)self::getUniqueValueFromDb($sql) !== 1) {
            throw new BgaUserException(self::_("The selected action has not been used this round"));
        }
    }

    public function clearActionSpace($player_id, $action_name)
    {
        $this->validateClearableActionSpace($player_id, $action_name);

        $used_field = "action_{$action_name}_used";
        $workers_field = "action_{$action_name}_workers";
        $sql = "UPDATE player SET $used_field = 0, $workers_field = NULL WHERE player_id = $player_id";
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
        $player_count = count(self::loadPlayersBasicInfos());

        for ($i = 0; $i < $player_count; $i++) {
            $this->activeNextPlayer();
            $active_player_id = self::getActivePlayerId();
            if (!$this->hasPlayerPassed($active_player_id)) {
                $this->gamestate->nextState('nextPlayer');
                return;
            }
        }

        $this->gamestate->nextState('endOfRound');
    }

    public function stPerformInquisition()
    {
        if ($this->getTaxSupply() != 0) {
            $this->setTaxSupply(0);
            self::notifyAllPlayers(
                'taxSupplyChanged',
                clienttranslate('The tax supply is empty'),
                ['tax_supply' => 0]
            );
        }
        $this->triggerInquisition();
        $this->refillTaxSupplyAfterInquisition();
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
     * End-game scoring. Live VP is added during play via grantPlayerVp().
     */
    private function calculatePlayerScore($player_id)
    {
        return intval(self::getUniqueValueFromDb(
            "SELECT player_score FROM player WHERE player_id = $player_id"
        ));
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// CORE GAME ACTIONS
    ////////////

    public function pass($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('pass');
        $player_id = self::getCurrentPlayerId();

        if ($this->hasPlayerPassed($player_id)) {
            throw new BgaUserException(self::_("You have already passed this round"));
        }

        $keep_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers),
        ];

        $this->validatePassWorkerKeep($player_id, $keep_counts);

        $this->clearPlayerActionSpacesOnPass($player_id);
        $this->setWorkerCountsForPlayer($player_id, $keep_counts, false);
        $this->markPlayerPassed($player_id);

        $player_name = self::getCurrentPlayerName();
        $kept_workers_text = $this->formatWorkerCountsForLog($keep_counts);
        $this->notifyPlayerAction('pass', clienttranslate('${player_name} passes'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'panel_data' => $this->getPlayerPanelData($player_id),
            'action_space_info' => $this->getActionSpaceInfo($player_id),
        ]);
        $this->notifyPassKeptWorkersLine($player_name, $player_id, $kept_workers_text);

        $this->notifyPlayerResourceUpdate($player_id);
        $this->gamestate->nextState('nextPlayer');
    }

    private function getWorkerTypeColumns()
    {
        return ['white_worker', 'green_worker', 'blue_worker', 'red_worker', 'black_worker', 'purple_worker'];
    }

    public function hasPlayerPassed($player_id)
    {
        $sql = "SELECT has_passed FROM player WHERE player_id = $player_id";
        return (int)self::getUniqueValueFromDb($sql) === 1;
    }

    private function markPlayerPassed($player_id)
    {
        $sql = "UPDATE player SET has_passed = 1 WHERE player_id = $player_id";
        self::DbQuery($sql);
    }

    private function collectBoardWorkerCounts($player_id)
    {
        $actions = ['develop', 'hunt', 'trade', 'recruit', 'pray', 'conspire',
            'commission', 'fortify', 'garrison', 'absolve', 'attack', 'convert'];
        $counts = array_fill_keys($this->getWorkerTypeColumns(), 0);

        foreach ($actions as $action) {
            $workers_field = "action_{$action}_workers";
            $sql = "SELECT $workers_field FROM player WHERE player_id = $player_id";
            $workers_json = self::getUniqueValueFromDb($sql);
            if (!$workers_json) {
                continue;
            }

            $workers = json_decode($workers_json, true);
            if (!is_array($workers)) {
                continue;
            }

            foreach ($workers as $worker_type) {
                if (isset($counts[$worker_type])) {
                    $counts[$worker_type]++;
                }
            }
        }

        return $counts;
    }

    private function clearPlayerActionSpacesOnPass($player_id)
    {
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
                action_convert_workers = NULL
                WHERE player_id = $player_id";
        self::DbQuery($sql);
    }

    private function clearBoardWorkers($player_id)
    {
        $sql = "UPDATE player SET
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
                action_convert_workers = NULL
                WHERE player_id = $player_id";
        self::DbQuery($sql);
    }

    public function setWorkerCountsForPlayer($player_id, $worker_counts, $notify_resource_update = true)
    {
        $updates = [];
        foreach ($this->getWorkerTypeColumns() as $type) {
            $count = max(0, intval($worker_counts[$type] ?? 0));
            $updates[] = "$type = $count";
        }

        $sql = "UPDATE player SET " . implode(', ', $updates) . " WHERE player_id = $player_id";
        self::DbQuery($sql);

        if ($notify_resource_update) {
            $this->notifyPlayerResourceUpdate($player_id);
        }
    }

    private function validatePassWorkerKeep($player_id, $keep_counts)
    {
        $worker_types = $this->getWorkerTypeColumns();
        $total_counts = [];

        foreach ($worker_types as $type) {
            $total_counts[$type] = $this->getResourceCount($player_id, $type);
        }

        $board_counts = $this->collectBoardWorkerCounts($player_id);
        foreach ($worker_types as $type) {
            $total_counts[$type] += $board_counts[$type];
        }

        $total_available = array_sum($total_counts);
        $total_keep = 0;

        foreach ($worker_types as $type) {
            $keep_count = max(0, intval($keep_counts[$type] ?? 0));
            if ($keep_count > $total_counts[$type]) {
                throw new BgaUserException(self::_("Invalid worker selection for pass"));
            }
            $total_keep += $keep_count;
        }

        if ($total_keep > 3) {
            throw new BgaUserException(self::_("You can keep at most 3 workers when passing"));
        }
    }

    public function pray($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $action_space)
    {
        self::checkAction('pray');
        $player_id = self::getCurrentPlayerId();

        if (!$this->canUseAction($player_id, 'pray')) {
            throw new BgaUserException(self::_("You have already used Pray this round"));
        }

        $this->validateClearableActionSpace($player_id, $action_space);
        
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

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'pray', $ordered_workers);
        $this->clearActionSpace($player_id, $action_space);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog(0, $ordered_workers, 2);
        $reward_text = $this->getActionSpaceDisplayName($action_space) . ' ' . clienttranslate('cleared');
        $this->notifyPlayerAction('pray', clienttranslate('${player_name} uses the Pray action'), [
            'player_name' => $player_name,
            'action_space' => $action_space,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, $reward_text);

        $this->notifyPlayerResourceUpdate($player_id);
        
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

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'recruit', $ordered_workers);
        
        // TODO: Implement discard logic

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('recruitDiscard', clienttranslate('${player_name} uses the Recruit action (discard)'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $this->formatActionPaymentForLog(0, $ordered_workers));

        $this->notifyPlayerResourceUpdate($player_id);
        
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

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'recruit', $ordered_workers);
        
        // TODO: Implement hiring logic

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('recruitHire', clienttranslate('${player_name} uses the Recruit action (hire)'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $this->formatActionPaymentForLog(0, $ordered_workers));

        $this->notifyPlayerResourceUpdate($player_id);
        
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

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'develop', $ordered_workers);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog(0, $ordered_workers, 4);
        $reward_text = $this->getActionSpaceDisplayName($action_space) . ' ' . clienttranslate('developed');
        $this->notifyPlayerAction('develop', clienttranslate('${player_name} uses the Develop action'), [
            'player_name' => $player_name,
            'action_space' => $action_space,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, $reward_text);

        $this->notifyPlayerResourceUpdate($player_id);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function hunt($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('hunt');
        $player_id = self::getCurrentPlayerId();

        if (!$this->canUseAction($player_id, 'hunt')) {
            throw new BgaUserException(self::_('You have already used the hunt action this round'));
        }
        
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];

        $total_workers = array_sum($worker_counts);
        if ($total_workers < 1 || $total_workers > 2) {
            throw new BgaUserException(self::_('Hunt requires 1 or 2 workers'));
        }

        $cost = $total_workers === 1
            ? [COST_ANY_WORKER]
            : [COST_ANY_WORKER, WORKER_GREEN];
        
        // Validate worker counts
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException($this->getWorkerValidationErrorMessage('hunt', $cost));
        }
        
        // Remove workers
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        
        // Gain provisions based on number of workers
        $provisions_gained = ($total_workers > 1) ? 3 : 1;
        $paladin_hunt_bonus = $this->getHuntPaladinProvisionBonus($player_id);
        $provisions_gained += $paladin_hunt_bonus;
        $this->addResource($player_id, RESOURCE_PROVISION, $provisions_gained);

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'hunt', $ordered_workers);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog(0, $ordered_workers);
        $reward_text = $this->formatProvisionPaymentPartHtml($provisions_gained);
        $this->notifyPlayerAction('hunt', clienttranslate('${player_name} uses the Hunt action'), [
            'player_name' => $player_name,
            'provisions' => $provisions_gained,
            'paladin_hunt_bonus' => $paladin_hunt_bonus,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, $reward_text);

        $this->notifyPlayerResourceUpdate($player_id);
        
        $this->gamestate->nextState('nextPlayer');
    }

    public function trade($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers)
    {
        self::checkAction('trade');
        $player_id = self::getCurrentPlayerId();

        if (!$this->canUseAction($player_id, 'trade')) {
            throw new BgaUserException(self::_('You have already used the trade action this round'));
        }
        
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

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'trade', $ordered_workers);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog(0, $ordered_workers);
        $reward_text = $this->formatSilverPaymentPartHtml($silver_gained);
        $this->notifyPlayerAction('trade', clienttranslate('${player_name} uses the Trade action'), [
            'player_name' => $player_name,
            'silver' => $silver_gained,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, $reward_text);

        $this->notifyPlayerResourceUpdate($player_id);
        
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'conspire', $ordered_workers);
        
        // Gain suspicion (draw a suspicion card)
        $suspicion_info = $this->addSuspicionCard($player_id);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog(0, $ordered_workers);
        $reward_parts = [
            $this->formatWorkerPaymentPartHtml(WORKER_PURPLE, 1),
            clienttranslate('1 Suspicion'),
        ];
        if ($suspicion_info && $suspicion_info['tax_given'] > 0) {
            $reward_parts[] = $this->formatSilverPaymentPartHtml($suspicion_info['tax_given']);
        }

        $state_args = [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ];
        if ($suspicion_info) {
            $state_args['suspicion_card'] = $suspicion_info;
            $state_args['tax_given'] = $suspicion_info['tax_given'];
            $state_args['tax_amount'] = $suspicion_info['tax_amount'];
            $state_args['tax_supply'] = $suspicion_info['tax_supply'];
        }

        $this->notifyPlayerAction(
            'conspire',
            clienttranslate('${player_name} uses the Conspire action'),
            $state_args,
            $payment_text,
            $this->formatNaturalLanguageList($reward_parts)
        );

        if ($suspicion_info && !empty($suspicion_info['tax_depleted'])) {
            $this->handleTaxSupplyDepleted();
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
    private function takeWorkerFromPool(array &$pool, $worker_type)
    {
        if (!isset($pool[$worker_type]) || $pool[$worker_type] <= 0) {
            return false;
        }

        $pool[$worker_type]--;
        if ($pool[$worker_type] <= 0) {
            unset($pool[$worker_type]);
        }

        return true;
    }

    private function restoreWorkerToPool(array &$pool, $worker_type)
    {
        $pool[$worker_type] = ($pool[$worker_type] ?? 0) + 1;
    }

    private function getWorkerTypesForCostSlot(array $pool, array $cost, $cost_index, $required_type)
    {
        if ($required_type === COST_ANY_WORKER) {
            $remaining_specific = [];
            for ($i = $cost_index + 1; $i < count($cost); $i++) {
                if ($cost[$i] !== COST_ANY_WORKER) {
                    $remaining_specific[$cost[$i]] = true;
                }
            }

            $preferred = [];
            $reserved = [];
            foreach ($pool as $type => $count) {
                if ($count <= 0) {
                    continue;
                }
                if (isset($remaining_specific[$type])) {
                    $reserved[] = $type;
                } else {
                    $preferred[] = $type;
                }
            }

            return array_merge($preferred, $reserved);
        }

        $candidates = [];
        if (isset($pool[$required_type]) && $pool[$required_type] > 0) {
            $candidates[] = $required_type;
        }
        if ($required_type !== WORKER_PURPLE && isset($pool[WORKER_PURPLE]) && $pool[WORKER_PURPLE] > 0) {
            $candidates[] = WORKER_PURPLE;
        }

        return $candidates;
    }

    private function canSatisfyWorkerCostFromPool(array $pool, array $cost, $cost_index = 0)
    {
        if ($cost_index >= count($cost)) {
            return true;
        }

        foreach ($this->getWorkerTypesForCostSlot($pool, $cost, $cost_index, $cost[$cost_index]) as $worker_type) {
            $next_pool = $pool;
            if (!$this->takeWorkerFromPool($next_pool, $worker_type)) {
                continue;
            }
            if ($this->canSatisfyWorkerCostFromPool($next_pool, $cost, $cost_index + 1)) {
                return true;
            }
        }

        return false;
    }

    private function buildOrderedWorkersFromPool(array &$pool, array $cost, $cost_index, array &$ordered_workers)
    {
        if ($cost_index >= count($cost)) {
            return true;
        }

        foreach ($this->getWorkerTypesForCostSlot($pool, $cost, $cost_index, $cost[$cost_index]) as $worker_type) {
            if (!$this->takeWorkerFromPool($pool, $worker_type)) {
                continue;
            }

            $ordered_workers[] = $worker_type;
            if ($this->buildOrderedWorkersFromPool($pool, $cost, $cost_index + 1, $ordered_workers)) {
                return true;
            }

            array_pop($ordered_workers);
            $this->restoreWorkerToPool($pool, $worker_type);
        }

        return false;
    }

    public function validateWorkerCountsForAction($player_id, $worker_counts, $cost) {
        $worker_types = ['white_worker', 'green_worker', 'blue_worker', 'red_worker', 'black_worker', 'purple_worker'];

        $total_workers_used = array_sum($worker_counts);
        $total_workers_required = count($cost);

        if ($total_workers_used !== $total_workers_required) {
            return false;
        }

        foreach ($worker_types as $type) {
            $count = intval($worker_counts[$type] ?? 0);
            if ($count > 0 && $this->getResourceCount($player_id, $type) < $count) {
                return false;
            }
        }

        $pool = [];
        foreach ($worker_types as $type) {
            $count = intval($worker_counts[$type] ?? 0);
            if ($count > 0) {
                $pool[$type] = $count;
            }
        }

        return $this->canSatisfyWorkerCostFromPool($pool, $cost);
    }

    public function buildOrderedActionWorkers($worker_counts, $cost)
    {
        $worker_types = ['white_worker', 'green_worker', 'blue_worker', 'red_worker', 'black_worker', 'purple_worker'];
        $pool = [];

        foreach ($worker_types as $type) {
            $count = intval($worker_counts[$type] ?? 0);
            if ($count > 0) {
                $pool[$type] = $count;
            }
        }

        $ordered_workers = [];
        if ($this->buildOrderedWorkersFromPool($pool, $cost, 0, $ordered_workers)) {
            return $ordered_workers;
        }

        return [];
    }

    private function findAndConsumeWorkerFromPool(&$pool, $required_type)
    {
        if ($required_type === COST_ANY_WORKER) {
            foreach ($pool as $type => $count) {
                if ($count > 0) {
                    $pool[$type]--;
                    if ($pool[$type] <= 0) {
                        unset($pool[$type]);
                    }
                    return $type;
                }
            }
            return null;
        }

        if (isset($pool[$required_type]) && $pool[$required_type] > 0) {
            $pool[$required_type]--;
            if ($pool[$required_type] <= 0) {
                unset($pool[$required_type]);
            }
            return $required_type;
        }

        if ($required_type !== WORKER_PURPLE && isset($pool[WORKER_PURPLE]) && $pool[WORKER_PURPLE] > 0) {
            $pool[WORKER_PURPLE]--;
            if ($pool[WORKER_PURPLE] <= 0) {
                unset($pool[WORKER_PURPLE]);
            }
            return WORKER_PURPLE;
        }

        return null;
    }

    private function consumeWorkerFromPool(&$pool, $required_type)
    {
        return $this->findAndConsumeWorkerFromPool($pool, $required_type) !== null;
    }

    public function getWorkerValidationErrorMessage($action_name, $cost)
    {
        $specific_requirements = array_values(array_filter(
            $cost,
            function ($requirement) {
                return $requirement !== COST_ANY_WORKER;
            }
        ));

        if ($action_name === 'hunt' || $action_name === ACTION_HUNT) {
            if (count($cost) === 1) {
                return clienttranslate('Invalid worker selection for Hunt.');
            }
            return clienttranslate('When hunting with 2 workers, one must be a Scout (green) or Criminal (purple, wild).');
        }

        if (count($specific_requirements) === 1) {
            $worker_name = $this->getWorkerDisplayName($specific_requirements[0]);
            return sprintf(
                clienttranslate('This action requires a %s. Criminals (purple workers) can be used as a wild card.'),
                $worker_name
            );
        }

        if (count($specific_requirements) > 1) {
            $worker_names = array_map([$this, 'getWorkerDisplayName'], $specific_requirements);
            return sprintf(
                clienttranslate('This action requires specific workers: %s. Criminals (purple workers) can be used as a wild card.'),
                implode(', ', $worker_names)
            );
        }

        return clienttranslate('Invalid worker selection for this action.');
    }

    private function getWorkerDisplayName($worker_type)
    {
        $names = [
            WORKER_WHITE => clienttranslate('Labourer'),
            WORKER_GREEN => clienttranslate('Scout'),
            WORKER_RED => clienttranslate('Fighter'),
            WORKER_BLUE => clienttranslate('Merchant'),
            WORKER_BLACK => clienttranslate('Cleric'),
            WORKER_PURPLE => clienttranslate('Criminal'),
        ];

        return $names[$worker_type] ?? $worker_type;
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
            'action' => null,
        ];

        $paladin_info = $this->getActivePaladinInfo($player_id);
        if ($paladin_info === null) {
            return $bonuses;
        }

        $bonuses['name'] = $paladin_info['name'] ?? null;
        $bonuses['action'] = $paladin_info['action'] ?? null;

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

    public function getActivePaladinInfo($player_id)
    {
        $cards = $this->deck->getCardsInLocation('paladin_hand', $player_id);
        // Active paladin is the single card kept in hand after pick; during setup there are 3
        if (count($cards) !== 1) {
            return null;
        }

        $card = reset($cards);
        if (!$card || !isset($card['type_arg'])) {
            return null;
        }

        return $this->paladins_cards_material[$card['type_arg']] ?? null;
    }

    public function getHuntPaladinProvisionBonus($player_id)
    {
        // Girard only: bonus applies to this player's active paladin for the round, not others.
        $paladin_info = $this->getActivePaladinInfo($player_id);
        if ($paladin_info === null) {
            return 0;
        }

        if (($paladin_info['action'] ?? null) !== ACTION_HUNT) {
            return 0;
        }

        return 2;
    }

    public function playerHasFortifyPaladinFreeProvision($player_id)
    {
        $paladin_info = $this->getActivePaladinInfo($player_id);
        if ($paladin_info === null) {
            return false;
        }

        return ($paladin_info['action'] ?? null) === ACTION_FORTIFY;
    }

    public function getFortifyCount($player_id)
    {
        return intval($this->getResourceCount($player_id, 'fortify_qty'));
    }

    public function getFortifyProvisionCost($player_id)
    {
        $fortify_count = $this->getFortifyCount($player_id);
        if ($fortify_count < 3) {
            return 1;
        }
        if ($fortify_count < 5) {
            return 2;
        }
        return 3;
    }

    public function getFortifyInfluenceRequirement($player_id)
    {
        $requirements = [0, 1, 3, 5, 7, 9, 11];
        $fortify_count = $this->getFortifyCount($player_id);
        if ($fortify_count >= count($requirements)) {
            return PHP_INT_MAX;
        }
        return $requirements[$fortify_count];
    }

    public function validateFortifyPrerequisites($player_id)
    {
        if ($this->getFortifyCount($player_id) >= 7) {
            throw new BgaUserException(self::_('You have already built all 7 walls'));
        }

        if ($this->deck->countCardInLocation('wall_deck') < 1) {
            throw new BgaUserException(self::_('No wall cards remain in the deck'));
        }

        $required_influence = $this->getFortifyInfluenceRequirement($player_id);
        if ($this->getTotalInfluence($player_id) < $required_influence) {
            throw new BgaUserException(sprintf(
                self::_('You need at least %d Influence to fortify your next wall'),
                $required_influence
            ));
        }

        if (!$this->playerHasFortifyPaladinFreeProvision($player_id)) {
            $provision_cost = $this->getFortifyProvisionCost($player_id);
            $provisions = $this->getResourceCount($player_id, RESOURCE_PROVISION);
            if ($provisions < $provision_cost) {
                throw new BgaUserException(sprintf(
                    self::_('You need %d Provision(s) to fortify'),
                    $provision_cost
                ));
            }
        }
    }

    public function drawWallCardForPlayer($player_id, $slot_index)
    {
        $card = $this->deck->pickCardForLocation('wall_deck', 'wall_hand', $player_id);
        if (!$card) {
            throw new BgaSystemException('Wall deck is empty');
        }

        $slot_index = intval($slot_index);
        $card_id = intval($card['id']);
        $player_id = intval($player_id);
        self::DbQuery(
            "UPDATE card SET card_location_position = $slot_index WHERE card_id = $card_id"
        );

        return $this->enrichWallCardForClient($this->deck->getCard($card_id));
    }

    private function enrichWallCardForClient($card)
    {
        if (!$card) {
            return $card;
        }

        if (!isset($card['location_position'])) {
            $card_id = intval($card['id']);
            $card['location_position'] = intval(self::getUniqueValueFromDB(
                "SELECT card_location_position FROM card WHERE card_id = $card_id"
            ));
        }

        return $card;
    }

    private function getPlayerWallCardsForClient($player_id)
    {
        $cards = $this->deck->getCardsInLocation('wall_hand', $player_id, 'card_location_position');
        $result = [];
        $slot_fallback = 0;

        foreach ($cards as $key => $card) {
            if (!is_array($card)) {
                continue;
            }

            $card = $this->enrichWallCardForClient($card);
            $slot = intval($card['location_position'] ?? 0);

            // Legacy rows may all have position 0 — assign sequential slots on load.
            if ($slot === 0 && $slot_fallback > 0) {
                $slot = $slot_fallback;
                $card['location_position'] = $slot;
            }

            $result[$card['id']] = $card;
            $slot_fallback = max($slot_fallback, $slot + 1);
        }

        return $result;
    }

    public function removeTopSuspicionForPlayer($player_id)
    {
        if ($this->deck->countCardInLocation('player_suspicion', $player_id) < 1) {
            return false;
        }

        $top_card_id = $this->deck->getExtremePosition(true, 'player_suspicion', $player_id);
        if (!$top_card_id) {
            return false;
        }

        $this->deck->moveCard($top_card_id, 'suspicion_discard');
        return true;
    }

    public function applyWallCardEffect($player_id, $effect, &$applied_messages)
    {
        if ($effect === ATTR_STRENGTH) {
            if ($this->getResourceCount($player_id, 'strength') >= self::MAX_PERMANENT_ATTRIBUTE) {
                return false;
            }
            $this->addResource($player_id, 'strength', 1, false);
            $applied_messages[] = clienttranslate('+1 Strength');
            return true;
        }

        if ($effect === ATTR_FAITH) {
            if ($this->getResourceCount($player_id, 'faith') >= self::MAX_PERMANENT_ATTRIBUTE) {
                return false;
            }
            $this->addResource($player_id, 'faith', 1, false);
            $applied_messages[] = clienttranslate('+1 Faith');
            return true;
        }

        if ($effect === ATTR_INFLUENCE) {
            if ($this->getResourceCount($player_id, 'influence') >= self::MAX_PERMANENT_ATTRIBUTE) {
                return false;
            }
            $this->addResource($player_id, 'influence', 1, false);
            $applied_messages[] = clienttranslate('+1 Influence');
            return true;
        }

        if ($effect === EFFECT_PAY_DEBT) {
            if ($this->getResourceCount($player_id, 'unpaid_debt') > 0) {
                $this->addResource($player_id, 'unpaid_debt', -1, false);
                $this->addResource($player_id, 'paid_debt', 1, false);
                $applied_messages[] = clienttranslate('Paid 1 Debt');
                return true;
            }
            return false;
        }

        if ($effect === EFFECT_RMV_SUSPICION) {
            if ($this->removeTopSuspicionForPlayer($player_id)) {
                $applied_messages[] = clienttranslate('Removed 1 Suspicion');
                return true;
            }
            return false;
        }

        if ($effect === '2_COINS') {
            $this->addResource($player_id, 'coin', 2, false);
            $applied_messages[] = clienttranslate('+2 Silver');
            return true;
        }

        $worker_type = $this->normalizeWorkerType($effect);
        if (strpos($worker_type, '_worker') !== false) {
            $this->addWorkersForPlayer($player_id, [$worker_type]);
            $applied_messages[] = $this->formatWorkerPaymentPartHtml($worker_type, 1);
            return true;
        }

        return false;
    }

    public function applyWallCardRewards($player_id, $type_arg)
    {
        $type_arg = intval($type_arg);
        if (!isset($this->wall_cards_material[$type_arg])) {
            return ['messages' => [], 'vp' => 0];
        }

        $card = $this->wall_cards_material[$type_arg];
        $applied_messages = [];

        // Rules: every Wall Card grants at least +1 Strength, plus any printed rewards.
        $this->applyWallCardEffect($player_id, ATTR_STRENGTH, $applied_messages);

        if (isset($card['gain'])) {
            foreach ($card['gain'] as $effect) {
                $this->applyWallCardEffect($player_id, $effect, $applied_messages);
            }
        }

        if (isset($card['choice'])) {
            // TODO: let the player pick between the choice options.
            $this->applyWallCardEffect($player_id, '2_COINS', $applied_messages);
        }

        $wall_vp = intval($card['vp'] ?? 0);
        if ($wall_vp > 0) {
            $this->grantPlayerVp($player_id, $wall_vp);
            $applied_messages[] = sprintf(
                clienttranslate('+%d VP'),
                $wall_vp
            );
        }

        return [
            'messages' => $applied_messages,
            'vp' => $wall_vp,
        ];
    }

    private function getPlayerWallCardVp($player_id)
    {
        $vp = 0;
        $cards = $this->deck->getCardsInLocation('wall_hand', $player_id);
        foreach ($cards as $card) {
            if (!is_array($card)) {
                continue;
            }
            $type_arg = intval($card['type_arg']);
            if (isset($this->wall_cards_material[$type_arg]['vp'])) {
                $vp += intval($this->wall_cards_material[$type_arg]['vp']);
            }
        }

        return $vp;
    }

    public function playerHasActiveGirardPaladin($player_id)
    {
        return $this->getHuntPaladinProvisionBonus($player_id) > 0;
    }

    public function getPlayerPanelData($player_id) {
        $paladin_bonus = $this->getActivePaladinStatBonuses($player_id);

        $faith_base = intval($this->getResourceCount($player_id, 'faith'));
        $strength_base = intval($this->getResourceCount($player_id, 'strength'));
        $influence_base = intval($this->getResourceCount($player_id, 'influence'));

        return [
            'faith' => $faith_base + $paladin_bonus['faith'],
            'faith_base' => $faith_base,
            'faith_bonus' => $paladin_bonus['faith'],
            'strength' => $strength_base + $paladin_bonus['strength'],
            'strength_base' => $strength_base,
            'strength_bonus' => $paladin_bonus['strength'],
            'influence' => $influence_base + $paladin_bonus['influence'],
            'influence_base' => $influence_base,
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'commission', $ordered_workers);
        
        // Increment commission count
        $this->addResource($player_id, 'commission_qty', 1);
        
        // Gain +1 Influence
        $this->addResource($player_id, ATTR_INFLUENCE, 1);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog($provision_cost, $ordered_workers);
        $this->notifyPlayerAction('commission', clienttranslate('${player_name} uses the Commission action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'provision_cost' => $provision_cost,
            'influence_gained' => 1,
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, clienttranslate('+1 Influence'));
        
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

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction(
            'commissionPositionSelected',
            clienttranslate('${player_name} places monk at position ${position_index}'),
            [
                'player_name' => $player_name,
                'player_id' => $player_id,
                'position_index' => $board_position_index,
                'bonus' => $bonus,
                'bonus_result' => $bonus_result,
                'panel_data' => $this->getPlayerPanelData($player_id),
            ],
            '',
            $bonus_result['message'] ?? ''
        );
        
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
        
        if (!self::DEBUG_UNLIMITED_FORTIFY && !$this->canUseAction($player_id, 'fortify')) {
            throw new BgaUserException(self::_("You have already used the fortify action this round"));
        }

        $this->validateFortifyPrerequisites($player_id);
        
        $cost = $this->getCurrentActionCost(ACTION_FORTIFY, $player_id);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers)
        ];
        
        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException($this->getWorkerValidationErrorMessage('fortify', $cost));
        }

        $provision_cost = 0;
        if (!$this->playerHasFortifyPaladinFreeProvision($player_id)) {
            $provision_cost = $this->getFortifyProvisionCost($player_id);
        }
        
        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        if ($provision_cost > 0) {
            $this->addResource($player_id, RESOURCE_PROVISION, -$provision_cost);
        }

        $wall_slot = $this->getFortifyCount($player_id);
        $wall_card = $this->drawWallCardForPlayer($player_id, $wall_slot);
        $reward_result = $this->applyWallCardRewards($player_id, $wall_card['type_arg']);
        $this->addResource($player_id, 'fortify_qty', 1, false);

        $fortify_count = $this->getFortifyCount($player_id);
        $milestone_vp = $this->getFortifyMilestoneVp($fortify_count);
        if ($milestone_vp > 0) {
            $this->grantPlayerVp($player_id, $milestone_vp);
        }

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        if (!self::DEBUG_UNLIMITED_FORTIFY) {
            $this->markActionAsUsed($player_id, 'fortify', $ordered_workers);
        }

        $payment_text = $this->formatActionPaymentForLog($provision_cost, $ordered_workers);
        $rewards_text = $this->formatWallRewardsForLogMessage($reward_result['messages']);

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('fortify', clienttranslate('${player_name} uses the Fortify action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'payment' => $payment_text,
            'rewards' => $rewards_text,
            'wall_card' => $wall_card,
            'wall_deck_count' => intval($this->deck->countCardInLocation('wall_deck')),
            'wall_slot' => $wall_slot,
            'provision_cost' => $provision_cost,
            'reward_messages' => $reward_result['messages'],
            'wall_vp' => $reward_result['vp'],
            'fortify_count' => $fortify_count,
            'milestone_vp' => $milestone_vp,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, $rewards_text);
        if ($milestone_vp > 0) {
            $this->notifyFortifyMilestoneVpLine($player_name, $player_id, $fortify_count, $milestone_vp);
        }
        $this->notifyPlayerResourceUpdate($player_id);
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'garrison', $ordered_workers);
        
        // Increment garrison count
        $this->addResource($player_id, 'garrison_qty', 1);
        
        // Gain +1 Faith
        $this->addResource($player_id, ATTR_FAITH, 1);

        $player_name = self::getCurrentPlayerName();
        $payment_text = $this->formatActionPaymentForLog($provision_cost, $ordered_workers);
        $this->notifyPlayerAction('garrison', clienttranslate('${player_name} uses the Garrison action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'provision_cost' => $provision_cost,
            'faith_gained' => 1,
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $payment_text, clienttranslate('+1 Faith'));
        
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

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction(
            'garrisonPositionSelected',
            clienttranslate('${player_name} places outpost at position ${position_index}'),
            [
                'player_name' => $player_name,
                'player_id' => $player_id,
                'position_index' => $board_position_index,
                'bonus' => $bonus,
                'bonus_result' => $bonus_result,
                'panel_data' => $this->getPlayerPanelData($player_id),
            ],
            '',
            $bonus_result['message'] ?? ''
        );
        
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'absolve', $ordered_workers);
        
        // TODO: Implement absolution logic based on jar position
        // TODO: Add absolve count tracking

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('absolve', clienttranslate('${player_name} uses the Absolve action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
            'jar_position' => $jar_position,
        ], $this->formatActionPaymentForLog(0, $ordered_workers, 2));
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'attack', $ordered_workers);
        
        // TODO: Implement attack logic for outsider card
        // TODO: Add attack count tracking

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('attack', clienttranslate('${player_name} uses the Attack action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
            'outsider_card_id' => $outsider_card_id,
            'silver_cost' => $silver_cost,
        ], $this->formatActionPaymentForLog(0, $ordered_workers, $silver_cost));
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
        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $this->markActionAsUsed($player_id, 'convert', $ordered_workers);
        
        // TODO: Implement conversion logic for outsider card
        // TODO: Add convert count tracking

        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('convert', clienttranslate('${player_name} uses the Convert action'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'action_space_info' => $this->getActionSpaceInfo($player_id),
            'panel_data' => $this->getPlayerPanelData($player_id),
            'outsider_card_id' => $outsider_card_id,
        ], $this->formatActionPaymentForLog(0, $ordered_workers, 2));
        $this->gamestate->nextState('nextPlayer');
    }

    public function kingsFavour($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers, $kings_favour_id)
    {
        self::checkAction('kingsFavour');
        $player_id = self::getCurrentPlayerId();

        $card = $this->validateKingsFavourCard($kings_favour_id);
        $cost = $this->getKingsFavourCardCost($card['type_arg']);
        $worker_counts = [
            'white_worker' => intval($white_workers),
            'green_worker' => intval($green_workers),
            'blue_worker' => intval($blue_workers),
            'red_worker' => intval($red_workers),
            'black_worker' => intval($black_workers),
            'purple_worker' => intval($purple_workers),
        ];

        if (!$this->validateWorkerCountsForAction($player_id, $worker_counts, $cost)) {
            throw new BgaUserException(self::_("Invalid worker selection for King's Favour"));
        }

        $this->removeWorkerCountsForPlayer($player_id, $worker_counts);
        $this->markKingsFavourUsed($kings_favour_id);

        $ordered_workers = $this->buildOrderedActionWorkers($worker_counts, $cost);
        $player_name = self::getCurrentPlayerName();
        $this->notifyPlayerAction('kingsFavour', clienttranslate('${player_name} uses a King\'s Favour'), [
            'player_name' => $player_name,
            'player_id' => $player_id,
            'kings_favour_id' => intval($kings_favour_id),
            'kings_favour_used' => $this->getKingsFavourUsedCardIds(),
            'kings_favour_newly_revealed' => $this->getKingsFavourNewlyRevealedId(),
            'panel_data' => $this->getPlayerPanelData($player_id),
        ], $this->formatActionPaymentForLog(0, $ordered_workers));

        $this->gamestate->nextState('nextPlayer');
    }

    // Helper method to get resource count
    private function getResourceCount($player_id, $resource_type)
    {
        $resource_type = $this->normalizePlayerResourceColumn($resource_type);

        // Check if the resource exists as a column in the player table
        $valid_resources = [
            'coin', 'provision', 'white_worker', 'green_worker', 'blue_worker', 
            'red_worker', 'black_worker', 'purple_worker', 'paid_debt', 'unpaid_debt',
            'strength', 'faith', 'influence', 'parchment', 'develop_qty', 
            'commission_qty', 'garrison_qty', 'fortify_qty'
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
