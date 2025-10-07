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
 * material.inc.php
 *
 * PaladinsShipped game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);

*/

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
    define("RESOURCE_COIN", "coin");
    define("RESOURCE_DEBT", "RESOURCE_DEBT");
    define("RESOURCE_PAID_DEBT", "RESOURCE_PAID_DEBT");
    define('RESOURCE_PROVISION', 'provision');
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


// Always give 1 strength
$this->wall_cards_material = [
    ["gain" => [ATTR_STRENGTH]],
    ["gain" => [ATTR_STRENGTH]],
    ["gain" => [WORKER_WHITE], "vp" => 1],
    ["gain" => [WORKER_WHITE], "vp" => 1],
    ["vp" => 2],

    ["vp" => 2],
    ["choice" => [EFFECT_PAY_DEBT, "2_COINS"]],
    ["choice" => [EFFECT_PAY_DEBT, "2_COINS"]],
    ["choice" => [EFFECT_RMV_SUSPICION, "2_COINS"]],
    ["choice" => [EFFECT_RMV_SUSPICION, "2_COINS"]],

    ["choice" => [EFFECT_RMV_SUSPICION, "2_COINS"]],
    ["choice" => [EFFECT_PAY_DEBT, "2_COINS"]],
    ["gain" => [WORKER_WHITE, WORKER_WHITE, WORKER_WHITE]],
    ["choice" => [EFFECT_RMV_SUSPICION, "2_COINS"]],
    ["gain" => [WORKER_WHITE, WORKER_WHITE]],

    ["gain" => [WORKER_WHITE, WORKER_BLUE]],
    ["gain" => [WORKER_WHITE, WORKER_RED]],
    ["gain" => [WORKER_WHITE, WORKER_GREEN]],
    ["gain" => [WORKER_GREEN]],
    ["gain" => [WORKER_BLUE]],

    ["gain" => [WORKER_RED]],
    ["gain" => [WORKER_WHITE, WORKER_BLACK]],
    ["gain" => [WORKER_GREEN, WORKER_BLUE]],
    ["gain" => [WORKER_BLACK]],
];

$this->player_spaces_material = [
    ACTION_DEVELOP => [COST_ANY_WORKER, COST_ANY_WORKER],
    ACTION_HUNT => [COST_ANY_WORKER, WORKER_GREEN],
    ACTION_TRADE => [COST_ANY_WORKER, WORKER_BLUE],
    ACTION_RECRUIT => [COST_ANY_WORKER, WORKER_RED],
    ACTION_PRAY => [WORKER_BLACK],
    ACTION_CONSPIRE => [COST_ANY_WORKER],
    ACTION_COMMISSION => [WORKER_GREEN, COST_ANY_WORKER, WORKER_BLACK],
    ACTION_ABSOLVE => [WORKER_BLACK, COST_ANY_WORKER, WORKER_BLUE],
    ACTION_FORTIFY => [WORKER_BLUE, COST_ANY_WORKER, WORKER_GREEN],
    ACTION_ATTACK => [WORKER_GREEN, COST_ANY_WORKER, WORKER_RED],
    ACTION_GARRISON => [WORKER_BLUE, COST_ANY_WORKER, WORKER_RED],
    ACTION_CONVERT => [WORKER_RED, COST_ANY_WORKER, WORKER_BLACK],
];

$this->tf_cards_material = [
    [
        "name" => clienttranslate("Abbot"),
        "discard" => [WORKER_BLACK, WORKER_WHITE],
        "passive" => ["trigger" => ACTION_ABSOLVE, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Abbot"),
        "discard" => [EFFECT_RMV_DEBT],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_ABSOLVE,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Conspirator"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [EFFECT_RMV_SUSPICION],
        ],
    ],
    [
        "name" => clienttranslate("Architect"),
        "discard" => [WORKER_PURPLE],
        "passive" => ["trigger" => ACTION_DEVELOP, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Defender"),
        "discard" => [ATTR_STRENGTH],
        "passive" => ["trigger" => ACTION_ATTACK, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Architect"),
        "discard" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_DEVELOP,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Gatekeeper"),
        "discard" => [WORKER_GREEN],
        "purchase_bonus" => RESOURCE_COIN,
        "passive" => ["trigger" => ACTION_FORTIFY, "reward" => [RESOURCE_COIN]],
    ],
    [
        "name" => clienttranslate("Missionary"),
        "discard" => [EFFECT_PRAY],
        "passive" => ["trigger" => ACTION_CONVERT, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Acolyte"),
        "discard" => [EFFECT_PRAY],
        "purchase_bonus" => RESOURCE_COIN,
        "passive" => [
            "trigger" => ACTION_COMMISSION,
            "reward" => [RESOURCE_COIN],
        ],
    ],
    [
        "name" => clienttranslate("Acolyte"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_COMMISSION,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Abbot"),
        "discard" => [EFFECT_PRAY],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_ABSOLVE,
            "reward" => [RESOURCE_PROVISION],
        ],
    ],
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [WORKER_WHITE, WORKER_WHITE],
        "passive" => ["trigger" => EFFECT_PAY_DEBT, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Peddler"),
        "discard" => [WORKER_WHITE, RESOURCE_PROVISION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
            "condition" => "2_or_more",
        ],
    ],
    [
        "name" => clienttranslate("Squire"),
        "discard" => [WORKER_PURPLE],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_FAITH],
            "condition" => "zero",
        ],
    ],
    [
        "name" => clienttranslate("Defender"),
        "discard" => [WORKER_WHITE, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_ATTACK,
            "reward" => [RESOURCE_PROVISION],
        ],
    ],
    [
        "name" => clienttranslate("Missionary"),
        "discard" => [ATTR_FAITH],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_CONVERT,
            "reward" => [RESOURCE_PROVISION],
        ],
    ],
    [
        "name" => clienttranslate("Conspirator"),
        "discard" => [WORKER_PURPLE],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [EFFECT_RMV_SUSPICION],
        ],
    ],
    [
        "name" => clienttranslate("Peddler"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [RESOURCE_COIN, RESOURCE_COIN],
            "condition" => "2_or_more",
        ],
    ],
    [
        "name" => clienttranslate("Missionary"),
        "discard" => [WORKER_GREEN, WORKER_WHITE],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_CONVERT,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Peddler"),
        "discard" => [WORKER_WHITE, WORKER_WHITE],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [WORKER_WHITE],
            "condition" => "2_or_more",
        ],
    ],
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => ["trigger" => EFFECT_PAY_DEBT, "reward" => [WORKER_GREEN]],
    ],
    [
        "name" => clienttranslate("Defender"),
        "discard" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_ATTACK,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Gatekeeper"),
        "discard" => [WORKER_BLUE, WORKER_WHITE],
        "passive" => ["trigger" => ACTION_FORTIFY, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Squire"),
        "discard" => [ATTR_INFLUENCE],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_INFLUENCE],
            "condition" => "zero",
        ],
    ],
    [
        "name" => clienttranslate("Gatekeeper"),
        "discard" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_FORTIFY,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [EFFECT_RMV_DEBT],
        "passive" => ["trigger" => EFFECT_PAY_DEBT, "reward" => [WORKER_RED]],
    ],
    [
        "name" => clienttranslate("Architect"),
        "discard" => [WORKER_WHITE, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_DEVELOP,
            "reward" => [RESOURCE_PROVISION],
        ],
    ],
    [
        "name" => clienttranslate("Squire"),
        "discard" => [WORKER_RED],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_FAITH],
            "condition" => "zero",
        ],
    ],
    [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_RED, WORKER_WHITE],
        "passive" => ["trigger" => ACTION_GARRISON, "reward" => [WORKER_WHITE]],
    ],
    [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_WHITE, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_COIN,
        "passive" => [
            "trigger" => ACTION_GARRISON,
            "reward" => [RESOURCE_COIN],
        ],
    ],
    [
        "name" => clienttranslate("Acolyte"),
        "discard" => [WORKER_BLACK],
        "passive" => [
            "trigger" => ACTION_COMMISSION,
            "reward" => [WORKER_WHITE],
        ],
    ],
    [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_BLUE],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_GARRISON,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
];

$this->kingsfavour_cards_material = [
    // ROW 1
    [
        "worker_cost" => WORKER_GREEN,
        "effect" => EFFECT_FREE_RECRUIT,
    ],
    [
        "worker_cost" => WORKER_BLACK,
        "effect" => "rmvsus_2tax",
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "effect" => "2_purple",
    ],
    [
        "worker_cost" => WORKER_PURPLE,
        "effect" => "choose_attr",
    ],
    [
        "worker_cost" => WORKER_RED,
        "effect" => "pay_coin_for_debt_or_rmv2sus",
    ],
    // ROW 2
    [
        "worker_cost" => COST_ANY_WORKER,
        "effect" => "get_debt_for_3_workers",
    ],
    [
        "worker_cost" => WORKER_BLUE,
        "effect" => "pay_food_for_develop_or_2_workers",
    ],
    [
        "worker_cost" => WORKER_PURPLE,
        "reward" => "3_white_workers",
    ],

    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => "2_food_tax",
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => EFFECT_PRAY,
    ],
];

$this->kingsorder_cards_material = [
    //ROW 1
    "FORTIFY",
    "CONVERT",
    "COMMISION",
    "ATTACK",
    // ROW 2
    "GARRISON",
    "ABSOLVE",
];

// OLD

$this->os_cards_material = [
    // ROW 1
    [
        "name" => clienttranslate("Archer"),
        "attack" => [WORKER_GREEN, RESOURCE_PROVISION],
        "end_game" => "2_garrison",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Armourer"),
        "attack" => [WORKER_RED],
        "end_game" => "4_strength",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Assassin"),
        "attack" => [WORKER_WHITE, RESOURCE_PROVISION],
        "end_game" => "yellow_attacked",
        "convert_extra_strength" => true,
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Champion"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_BLUE],
        "end_game" => "kings_order",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_WHITE],
        "end_game" => "more_mercenary",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Champion"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_GREEN],
        "end_game" => "kings_order",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Invader"),
        "attack" => [ATTR_INFLUENCE],
        "convert_extra_strength" => true,
        "end_game" => "attacked_blue",
        "suit" => YELLOW_SUIT,
    ],

    // ROW 2
    [
        "name" => clienttranslate("Guardian"),
        "attack" => [WORKER_WHITE, WORKER_WHITE],
        "end_game" => "2_develop",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Hunter"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_RED],
        "end_game" => "2_assistant",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Invader"),
        "attack" => [EFFECT_TAKE_TAX, RESOURCE_PROVISION],
        "convert_extra_strength" => true,
        "end_game" => "attacked_blue",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Lookout"),
        "attack" => [WORKER_WHITE, WORKER_BLUE],
        "end_game" => "2_fortify",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Thief"),
        "attack" => [WORKER_PURPLE],
        "end_game" => "suspicion",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Hunter"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "2_assistant",
        "suit" => YELLOW_SUIT,
    ],

    //ROW 3
    [
        "name" => clienttranslate("Traitor"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "unpaid_debt",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Adventurer"),
        "attack" => [WORKER_WHITE, WORKER_GREEN],
        "end_game" => "2_commision",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Warrior"),
        "attack" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
        "end_game" => "4_faith",
        "suit" => GREEN_SUIT,
    ],
    [
        "name" => clienttranslate("Archer"),
        "attack" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
        "end_game" => "2_garrison",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Barbarian"),
        "attack" => [WORKER_WHITE, WORKER_GREEN],
        "conver_extra_strength" => true,
        "end_game" => "attacked_green",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Marauder"),
        "attack" => [ATTR_INFLUENCE],
        "end_game" => "4_influence",
        "suit" => YELLOW_SUIT,
    ],

    // ROW 4

    // ROW 5

    //OLD

    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [WORKER_WHITE, RESOURCE_PROVISION],
        "end_game" => "more_mercenary",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "end_game" => "more_mercenary",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Protector"),
        "attack" => [WORKER_WHITE, WORKER_WHITE],
        "end_game" => "paid_debt",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Vigilante"),
        "attack" => [EFFECT_RMV_DEBT, WORKER_BLACK],
        "end_game" => "2_absolve",
        "suit" => YELLOW_SUIT,
    ],
    [
        "name" => clienttranslate("Warrior"),
        "attack" => [WORKER_BLACK],
        "end_game" => "4_faith",
        "suit" => YELLOW_SUIT,
    ],

    // BLUE
    [
        "name" => clienttranslate("Adventurer"),
        "attack" => [WORKER_WHITE, WORKER_BLACK],
        "end_game" => "2_commision",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Armourer"),
        "attack" => [WORKER_WHITE, RESOURCE_PROVISION],
        "end_game" => "4_strength",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Assassin"),
        "attack" => [WORKER_WHITE, WORKER_RED],
        "end_game" => "attacked_yellow",
        "convert_extra_strength" => true,
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Barbarian"),
        "attack" => [EFFECT_TAKE_TAX, RESOURCE_PROVISION],
        "end_game" => "attacked_green",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Guardian"),
        "attack" => [WORKER_BLUE, RESOURCE_PROVISION],
        "end_game" => "2_develop",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Lookout"),
        "attack" => [WORKER_BLUE],
        "end_game" => "2_fortify",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Marauder"),
        "attack" => [WORKER_PURPLE],
        "end_game" => "4_influence",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [WORKER_WHITE, WORKER_WHITE],
        "end_game" => "more_mercenary",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Protector"),
        "attack" => [WORKER_WHITE, RESOURCE_PROVISION],
        "end_game" => "paid_debt",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Thief"),
        "attack" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "end_game" => "suspicion_card",
        "suit" => BLUE_SUIT,
    ],

    [
        "name" => clienttranslate("Traitor"),
        "attack" => [WORKER_PURPLE],
        "end_game" => "unpaid_debt",
        "suit" => BLUE_SUIT,
    ],
    [
        "name" => clienttranslate("Vigilante"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "2_absolve",
        "suit" => BLUE_SUIT,
    ],
];

$this->board_positions_material = [
    [
        "min_faith" => 0,
        "min_strength" => 1,
        "bonus" => "free_recruit",
        "min_players" => 1,
    ],
    [
        "min_faith" => 0,
        "min_strength" => 1,
        "bonus" => "2_coin",
        "min_players" => 1,
    ],
    [
        "min_faith" => 0,
        "min_strength" => 1,
        "bonus" => "labourer",
        "min_players" => 3,
    ],
    [
        "min_faith" => 0,
        "min_strength" => 1,
        "bonus" => "rmv_suspicion",
        "min_players" => 4,
    ],

    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "free_recruit",
        "min_players" => 1,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "2_coin",
        "min_players" => 1,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "scout",
        "min_players" => 1,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "rmv_suspicion",
        "min_players" => 1,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "labourer",
        "min_players" => 4,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "2_coin",
        "min_players" => 3,
    ],
    [
        "min_faith" => 2,
        "min_strength" => 3,
        "bonus" => "rmv_suspicion",
        "min_players" => 3,
    ],

    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "labourer",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "merchant",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "2_coin",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "pray",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "scout",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 1,
        "bonus" => "fighter",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 3,
        "bonus" => "free_recruit",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 3,
        "bonus" => "pay_debt",
    ],
    [
        "min_faith" => 4,
        "min_strength" => 5,
        "min_players" => 4,
        "bonus" => "2_coin",
    ],

    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "fighter",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "pray",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "merchant",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "cleric",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "pay_debt",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "labourer_scout",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 1,
        "bonus" => "2_coin",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 3,
        "bonus" => "pray",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 4,
        "bonus" => "labourer_labourer",
    ],
    [
        "min_faith" => 6,
        "min_strength" => 7,
        "min_players" => 3,
        "bonus" => "2_coin",
    ],

    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 1,
        "bonus" => "pray",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 1,
        "bonus" => "labourer_fighter",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 1,
        "bonus" => "pay_debt",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 1,
        "bonus" => "labourer_merchant",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 1,
        "bonus" => "labourer_cleric",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 4,
        "bonus" => "pay_debt",
    ],
    [
        "min_faith" => 8,
        "min_strength" => 9,
        "min_players" => 3,
        "bonus" => "labourer_labourer",
    ],

    [
        "min_faith" => 10,
        "min_strength" => 11,
        "min_players" => 1,
        "bonus" => "pay_debt",
    ],
    [
        "min_faith" => 10,
        "min_strength" => 11,
        "min_players" => 3,
        "bonus" => "pray",
    ],
    [
        "min_faith" => 10,
        "min_strength" => 11,
        "min_players" => 4,
        "bonus" => "labourer_labourer",
    ],
];

$this->tavern_cards_material = [
    [WORKER_BLUE, WORKER_BLUE, WORKER_GREEN, WORKER_PURPLE],
    [WORKER_BLUE, WORKER_BLUE, WORKER_GREEN, WORKER_WHITE],
    [WORKER_RED, WORKER_BLUE, WORKER_GREEN, WORKER_PURPLE],
    [WORKER_BLACK, WORKER_GREEN, WORKER_WHITE, WORKER_WHITE],
    [WORKER_RED, WORKER_RED, WORKER_BLUE, WORKER_PURPLE],
    [WORKER_RED, WORKER_RED, WORKER_PURPLE, WORKER_WHITE],
    [WORKER_RED, WORKER_RED, WORKER_GREEN, WORKER_PURPLE],

    [WORKER_BLACK, WORKER_BLACK, WORKER_BLUE, WORKER_WHITE],
    [WORKER_BLACK, WORKER_BLACK, WORKER_BLUE, WORKER_GREEN],
    [WORKER_BLACK, WORKER_BLACK, WORKER_RED, WORKER_GREEN],
    [WORKER_RED, WORKER_PURPLE, WORKER_PURPLE, WORKER_WHITE],
    [WORKER_RED, WORKER_GREEN, WORKER_PURPLE, WORKER_PURPLE],
    [WORKER_RED, WORKER_BLUE, WORKER_PURPLE, WORKER_PURPLE],
    [WORKER_BLACK, WORKER_WHITE, WORKER_PURPLE, WORKER_WHITE],

    [WORKER_RED, WORKER_RED, WORKER_WHITE, WORKER_WHITE],
    [WORKER_RED, WORKER_WHITE, WORKER_PURPLE, WORKER_WHITE],
    [WORKER_BLACK, WORKER_BLACK, WORKER_BLUE, WORKER_BLUE],
    [WORKER_GREEN, WORKER_GREEN, WORKER_GREEN, WORKER_WHITE],
    [WORKER_BLACK, WORKER_BLACK, WORKER_BLACK, WORKER_RED],
    [WORKER_BLACK, WORKER_BLACK, WORKER_RED, WORKER_BLUE],
    [WORKER_BLUE, WORKER_BLUE, WORKER_WHITE, WORKER_WHITE],

    [WORKER_BLACK, WORKER_GREEN, WORKER_GREEN, WORKER_PURPLE],
    [WORKER_BLUE, WORKER_BLUE, WORKER_GREEN, WORKER_GREEN],
    [WORKER_RED, WORKER_BLUE, WORKER_GREEN, WORKER_GREEN],
];

// qty of each
$this->suspicion_cards_material = [6, 8, 10];

# SETS: castle, barracks, fountain, tower
$this->paladins_cards_material = [
    // ROW 1
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_BLUE, WORKER_GREEN],
        "action" => ACTION_CONVERT,
        "name" => clienttranslate("Gérier"),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 4],
        "workers" => [WORKER_BLUE, WORKER_WHITE],
        "name" => clienttranslate("Gérin"),
        "action" => ACTION_CONSPIRE,
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_WHITE, WORKER_GREEN],
        "action" => ACTION_DEVELOP,
        "name" => clienttranslate('Samson'),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_FAITH => 4],
        "workers" => [WORKER_BLACK, WORKER_BLACK],
        "action" => ACTION_PRAY,
        "name" => clienttranslate('Oliver'),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_STRENGTH => 4],
        "workers" => [WORKER_RED, WORKER_WHITE],
        "action" => ACTION_RECRUIT,
        "name" => clienttranslate('Roland'),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_STRENGTH => 3],
        "workers" => [WORKER_BLUE, WORKER_RED],
        "action" => ACTION_GARRISON,
        "name" => clienttranslate("Bérengier"),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_RED],
        "action" => ACTION_FORTIFY,
        "name" => clienttranslate("Anséis"),
        "set" => "castle",
    ],
    // ROW 2
    [
        "stats" => [ATTR_STRENGTH => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_GREEN],
        "action" => ACTION_COMMISSION,
        "name" => clienttranslate("Ivon"),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_STRENGTH => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_RED, WORKER_GREEN],
        "action" => ACTION_ATTACK,
        "name" => clienttranslate("Engelier"),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_FAITH => 2],
        "workers" => [WORKER_GREEN, WORKER_GREEN],
        "action" => ACTION_HUNT,
        "name" => clienttranslate('Girard'),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_STRENGTH => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_GREEN],
        "action" => ACTION_COMMISSION,
        "name" => clienttranslate("Ivon"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_RED],
        "action" => ACTION_FORTIFY,
        "name" => clienttranslate("Anséis"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_STRENGTH => 1],
        "workers" => [WORKER_BLACK, WORKER_BLUE],
        "action" => ACTION_ABSOLVE,
        "name" => clienttranslate("Ivoire"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_STRENGTH => 4],
        "workers" => [WORKER_RED, WORKER_WHITE],
        "action" => ACTION_RECRUIT,
        "name" => clienttranslate('Roland'),
        "set" => "barracks",
    ],
    // ROW 3
    [
        "stats" => [ATTR_FAITH => 4],
        "workers" => [WORKER_BLACK, WORKER_BLACK],
        "action" => ACTION_PRAY,
        "name" => clienttranslate('Oliver'),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_STRENGTH => 1],
        "workers" => [WORKER_BLACK, WORKER_BLUE],
        "action" => ACTION_ABSOLVE,
        "name" => clienttranslate("Ivoire"),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_STRENGTH => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_GREEN],
        "action" => ACTION_COMMISSION,
        "name" => clienttranslate("Ivon"),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_FAITH => 4],
        "workers" => [WORKER_BLACK, WORKER_BLACK],
        "action" => ACTION_PRAY,
        "name" => clienttranslate('Oliver'),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_STRENGTH => 4],
        "workers" => [WORKER_RED, WORKER_WHITE],
        "action" => ACTION_RECRUIT,
        "name" => clienttranslate('Roland'),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_FAITH => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_BLUE, WORKER_BLUE],
        "action" => ACTION_TRADE,
        "name" => clienttranslate('Otton'),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_WHITE, WORKER_GREEN],
        "action" => ACTION_DEVELOP,
        "name" => clienttranslate('Samson'),
        "set" => "fountain",
    ],
    // ROW 4
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_BLUE, WORKER_GREEN],
        "action" => ACTION_CONVERT,
        "name" => clienttranslate("Gérier"),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_STRENGTH => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_RED, WORKER_GREEN],
        "action" => ACTION_ATTACK,
        "name" => clienttranslate("Engelier"),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_RED],
        "action" => ACTION_FORTIFY,
        "name" => clienttranslate("Anséis"),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_STRENGTH => 3],
        "workers" => [WORKER_BLUE, WORKER_RED],
        "action" => ACTION_GARRISON,
        "name" => clienttranslate("Bérengier"),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 4],
        "workers" => [WORKER_BLUE, WORKER_WHITE],
        "name" => clienttranslate("Gérin"),
        "action" => ACTION_CONSPIRE,
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_FAITH => 2],
        "workers" => [WORKER_GREEN, WORKER_GREEN],
        "action" => ACTION_HUNT,
        "name" => clienttranslate('Girard'),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_STRENGTH => 1],
        "workers" => [WORKER_BLACK, WORKER_BLUE],
        "action" => ACTION_ABSOLVE,
        "name" => clienttranslate("Ivoire"),
        "set" => "tower",
    ],
    // ROW 5
    [
        "stats" => [ATTR_STRENGTH => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_GREEN],
        "action" => ACTION_COMMISSION,
        "name" => clienttranslate("Ivon"),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_FAITH => 2],
        "workers" => [WORKER_GREEN, WORKER_GREEN],
        "action" => ACTION_HUNT,
        "name" => clienttranslate('Girard'),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_FAITH => 4],
        "workers" => [WORKER_BLACK, WORKER_BLACK],
        "action" => ACTION_PRAY,
        "name" => clienttranslate('Oliver'),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_FAITH => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_BLUE, WORKER_BLUE],
        "action" => ACTION_TRADE,
        "name" => clienttranslate('Otton'),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_BLUE, WORKER_GREEN],
        "action" => ACTION_CONVERT,
        "name" => clienttranslate("Gérier"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_STRENGTH => 3],
        "workers" => [WORKER_BLUE, WORKER_RED],
        "action" => ACTION_GARRISON,
        "name" => clienttranslate("Bérengier"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_BLUE, WORKER_GREEN],
        "action" => ACTION_CONVERT,
        "name" => clienttranslate("Gérier"),
        "set" => "fountain",
    ],
    // ROW 6
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_WHITE, WORKER_GREEN],
        "action" => ACTION_DEVELOP,
        "name" => clienttranslate('Samson'),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 3, ATTR_STRENGTH => 1],
        "workers" => [WORKER_BLACK, WORKER_BLUE],
        "action" => ACTION_ABSOLVE,
        "name" => clienttranslate("Ivoire"),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_STRENGTH => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_RED, WORKER_GREEN],
        "action" => ACTION_ATTACK,
        "name" => clienttranslate("Engelier"),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_STRENGTH => 3],
        "workers" => [WORKER_BLUE, WORKER_RED],
        "action" => ACTION_GARRISON,
        "name" => clienttranslate("Bérengier"),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_STRENGTH => 3, ATTR_FAITH => 1],
        "workers" => [WORKER_RED, WORKER_GREEN],
        "action" => ACTION_ATTACK,
        "name" => clienttranslate("Engelier"),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_FAITH => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_BLUE, WORKER_BLUE],
        "action" => ACTION_TRADE,
        "name" => clienttranslate('Otton'),
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_STRENGTH => 4],
        "workers" => [WORKER_RED, WORKER_WHITE],
        "action" => ACTION_RECRUIT,
        "name" => clienttranslate('Roland'),
        "set" => "tower",
    ],
    // ROW 7
    [
        "stats" => [ATTR_INFLUENCE => 4],
        "workers" => [WORKER_BLUE, WORKER_WHITE],
        "name" => clienttranslate("Gérin"),
        "action" => ACTION_CONSPIRE,
        "set" => "barracks",
    ],
    [
        "stats" => [ATTR_FAITH => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_BLUE, WORKER_BLUE],
        "action" => ACTION_TRADE,
        "name" => clienttranslate('Otton'),
        "set" => "castle",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_FAITH => 2],
        "workers" => [WORKER_GREEN, WORKER_GREEN],
        "action" => ACTION_HUNT,
        "name" => clienttranslate('Girard'),
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 2, ATTR_STRENGTH => 2],
        "workers" => [WORKER_WHITE, WORKER_GREEN],
        "action" => ACTION_DEVELOP,
        "name" => clienttranslate('Samson'),
        "set" => "tower",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 4],
        "workers" => [WORKER_BLUE, WORKER_WHITE],
        "name" => clienttranslate("Gérin"),
        "action" => ACTION_CONSPIRE,
        "set" => "fountain",
    ],
    [
        "stats" => [ATTR_INFLUENCE => 1, ATTR_FAITH => 3],
        "workers" => [WORKER_BLACK, WORKER_RED],
        "action" => ACTION_FORTIFY,
        "name" => clienttranslate("Anséis"),
        "set" => "fountain",
    ],
];
