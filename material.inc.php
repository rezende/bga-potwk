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
 * material.inc.php
 *
 * paladinsshipped game material description
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

if (!defined("ATTR_FAITH")) {
    // guard since this included multiple times
    define("RESOURCE_COIN", "RESOURCE_COIN");
    define("RESOURCE_PROVISION", "RESOURCE_PROVISION");
    define("RESOURCE_DEBT", "RESOURCE_DEBT");
    define("RESOURCE_SUSPICION", "RESOURCE_SUSPICION");
    define("RESOURCE_PAID_DEBT", "RESOURCE_PAID_DEBT");
    define("RESOURCE_UNPAID_DEBT", "RESOURCE_UNPAID_DEBT");

    define("ATTR_FAITH", "ATTR_FAITH");
    define("ATTR_STRENGTH", "ATTR_STRENGTH");
    define("ATTR_INFLUENCE", "ATTR_INFLUENCE");

    define("ACTION_DEVELOP", "ACTION_DEVELOP");
    define("ACTION_HUNT", "ACTION_HUNT");
    define("ACTION_TRADE", "ACTION_TRADE");
    define("ACTION_RECRUIT", "ACTION_RECRUIT");
    define("ACTION_PRAY", "ACTION_PRAY");
    define("ACTION_CONSPIRE", "ACTION_CONSPIRE");
    define("ACTION_COMMISSION", "ACTION_COMMISSION");
    define("ACTION_FORTIFY", "ACTION_FORTIFY");
    define("ACTION_GARRISON", "ACTION_GARRISON");
    define("ACTION_ABSOLVE", "ACTION_ABSOLVE");
    define("ACTION_ATTACK", "ACTION_ATTACK");
    define("ACTION_CONVERT", "ACTION_CONVERT");
    define("ACTION_USE_KINGS_FAVOR", "USE_KINGS_FAVOR");
    define("ACTION_PASS", "ACTION_PASS");

    define("WORKER_LABOURER", "WORKER_LABOURER");
    define("WORKER_FIGHTER", "WORKER_FIGHTER");
    define("WORKER_SCOUT", "WORKER_SCOUT");
    define("WORKER_CLERIC", "WORKER_CLERIC");
    define("WORKER_MERCHANT", "WORKER_MERCHANT");
    define("WORKER_CRIMINAL", "WORKER_CRIMINAL");

    define("COST_ANY_WORKER", "COST_ANY_WORKER");

    define("EVENT_INQUISITION", "EVENT_INQUISITION");

    define("EFFECT_TAKE_TAX", "EFFECT_TAKE_TAX");
    define("EFFECT_RMV_SUSPICION", "EFFECT_RMV_SUSPICION");
    define("EFFECT_RMV_DEBT", "EFFECT_RMV_DEBT");
    define("EFFECT_PAY_DEBT", "EFFECT_PAY_DEBT");
    define("EFFECT_PRAY", "EFFECT_PRAY");
    define("EFFECT_FREE_RECRUIT", "EFFECT_FREE_RECRUIT");
    define("EFFECT_FREE_DEVELOPMENT", "EFFECT_FREE_DEVELOPMENT");

    define("YELLOW_SUIT", "YELLOW_SUIT");
    define("BLUE_SUIT", "BLUE_SUIT");
    define("GREEN_SUIT", "GREEN_SUIT");
}

$this->assistant_cards_material = [
    0 => [
        "name" => clienttranslate("Missionary"),
        "discard" => [ATTR_FAITH],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_CONVERT,
            "reward" => [RESOURCE_PROVISION],
        ],
    ],
    1 => [
        "name" => clienttranslate("Missionary"),
        "discard" => [WORKER_SCOUT, WORKER_LABOURER],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_CONVERT,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],
    2 => [
        "name" => clienttranslate("Missionary"),
        "discard" => [EFFECT_PRAY],
        "passive" => [
            "trigger" => ACTION_CONVERT,
            "reward" => [WORKER_LABOURER],
        ],
    ],

    3 => [
        "name" => clienttranslate("Peddler"),
        "discard" => [WORKER_LABOURER, WORKER_LABOURER],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [WORKER_LABOURER],
            "condition" => "2_or_more",
        ],
    ],
    4 => [
        "name" => clienttranslate("Peddler"),
        "discard" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
            "condition" => "2_or_more",
        ],
    ],
    5 => [
        "name" => clienttranslate("Peddler"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [RESOURCE_COIN, RESOURCE_COIN],
            "condition" => "2_or_more",
        ],
    ],

    6 => [
        "name" => clienttranslate("Squire"),
        "discard" => [WORKER_FIGHTER],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_FAITH],
            "condition" => "zero",
        ],
    ],
    7 => [
        "name" => clienttranslate("Squire"),
        "discard" => [ATTR_INFLUENCE],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_INFLUENCE],
            "condition" => "zero",
        ],
    ],
    8 => [
        "name" => clienttranslate("Squire"),
        "discard" => [WORKER_CRIMINAL],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [ATTR_FAITH],
            "condition" => "zero",
        ],
    ],

    8 => [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_FIGHTER, WORKER_LABOURER],
        "passive" => [
            "trigger" => ACTION_GARRISON,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    9 => [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_COIN,
        "passive" => [
            "trigger" => ACTION_GARRISON,
            "reward" => [RESOURCE_COIN],
        ],
    ],
    10 => [
        "name" => clienttranslate("Watchman"),
        "discard" => [WORKER_MERCHANT],
        "purchase_bonus" => EFFECT_RMV_SUSPICION,
        "passive" => [
            "trigger" => ACTION_GARRISON,
            "reward" => [EFFECT_TAKE_TAX],
        ],
    ],

    11 => [
        "name" => clienttranslate("Abbot"),
        "discard" => [WORKER_CLERIC, WORKER_LABOURER],
        "passive" => [
            "trigger" => ACTION_ABSOLVE,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    12 => [
        "name" => clienttranslate("Abbot"),
        "discard" => [EFFECT_PRAY],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_ABSOLVE,
            "reward" => [RESOURCE_PROVISION],
        ],
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
        "name" => clienttranslate("Acolyte"),
        "discard" => [WORKER_CLERIC],
        "passive" => [
            "trigger" => ACTION_COMMISSION,
            "reward" => [WORKER_LABOURER],
        ],
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
        "name" => clienttranslate("Architect"),
        "discard" => [WORKER_CRIMINAL],
        "passive" => [
            "trigger" => ACTION_DEVELOP,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    [
        "name" => clienttranslate("Architect"),
        "discard" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_DEVELOP,
            "reward" => [RESOURCE_PROVISION],
        ],
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
        "name" => clienttranslate("Conspirator"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [EFFECT_RMV_SUSPICION],
        ],
    ],
    [
        "name" => clienttranslate("Conspirator"),
        "discard" => [WORKER_CRIMINAL],
        "passive" => [
            "trigger" => EVENT_INQUISITION,
            "reward" => [EFFECT_RMV_SUSPICION],
        ],
    ],

    //Debt Collector x 3
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [WORKER_LABOURER, WORKER_LABOURER],
        "passive" => [
            "trigger" => EFFECT_PAY_DEBT,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [EFFECT_RMV_DEBT],
        "passive" => [
            "trigger" => EFFECT_PAY_DEBT,
            "reward" => [WORKER_FIGHTER],
        ],
    ],
    [
        "name" => clienttranslate("Debt Collector"),
        "discard" => [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        "passive" => [
            "trigger" => EFFECT_PAY_DEBT,
            "reward" => [WORKER_SCOUT],
        ],
    ],

    //Defender x 3
    [
        "name" => clienttranslate("Defender"),
        "discard" => [ATTR_STRENGTH],
        "passive" => [
            "trigger" => ACTION_ATTACK,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    [
        "name" => clienttranslate("Defender"),
        "discard" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "purchase_bonus" => RESOURCE_PROVISION,
        "passive" => [
            "trigger" => ACTION_ATTACK,
            "reward" => [RESOURCE_PROVISION],
        ],
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

    // Gatekeeper x 3
    [
        "name" => clienttranslate("Gatekeeper"),
        "discard" => [WORKER_MERCHANT, WORKER_LABOURER],
        "passive" => [
            "trigger" => ACTION_FORTIFY,
            "reward" => [WORKER_LABOURER],
        ],
    ],
    [
        "name" => clienttranslate("Gatekeeper"),
        "discard" => [WORKER_SCOUT],
        "purchase_bonus" => RESOURCE_COIN,
        "passive" => [
            "trigger" => ACTION_FORTIFY,
            "reward" => [RESOURCE_COIN],
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
];

$this->kings_favors_material = [
    [
        "worker_cost" => WORKER_CRIMINAL,
        "reward" => [WORKER_LABOURER, WORKER_LABOURER, WORKER_LABOURER],
    ],
    [
        "worker_cost" => WORKER_SCOUT,
        "reward" => EFFECT_FREE_RECRUIT,
    ],
    [
        "worker_cost" => WORKER_CRIMINAL,
        "reward" => [
            "choices" => [ATTR_FAITH],
            [ATTR_INFLUENCE],
            [ATTR_STRENGTH],
        ],
        "type" => "choice",
    ],
    [
        "worker_cost" => WORKER_FIGHTER,
        "reward" => [
            "choices" => [EFFECT_PAY_DEBT],
            [EFFECT_RMV_SUSPICION, EFFECT_RMV_SUSPICION],
        ],
        "resource_cost" => [
            "value" => -1,
            "resource" => RESOURCE_COIN,
        ],
        "type" => "choice",
    ],
    [
        "worker_cost" => WORKER_CLERIC,
        "reward" => [EFFECT_RMV_SUSPICION, EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => [WORKER_CRIMINAL, WORKER_CRIMINAL],
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => [RESOURCE_PROVISION, RESOURCE_PROVISION, EFFECT_TAKE_TAX],
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => [WORKER_SCOUT, WORKER_MERCHANT, WORKER_FIGHTER],
        "resource_cost" => [
            "value" => 1,
            "resource" => RESOURCE_UNPAID_DEBT,
        ],
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "resource_cost" => [
            "value" => -1,
            "resource" => RESOURCE_PROVISION,
        ],
        "reward" => [
            "choices" => [EFFECT_FREE_DEVELOPMENT],
            [WORKER_FIGHTER, WORKER_CLERIC],
        ],
        "type" => "choice",
    ],
    [
        "worker_cost" => COST_ANY_WORKER,
        "reward" => EFFECT_PRAY,
    ],
];

$this->kings_orders_material = [
  "ABSOLVE", "FORTIFY", "GARRISON", "COMMISION", "ATTACK", "CONVERT"
];

$this->outsider_cards_material = [
    // Blue suit
    [
        "name" => clienttranslate("Adventurer"),
        "attack" => [WORKER_LABOURER, WORKER_CLERIC],
        "end_game" => "2_commision",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Armourer"),
        "attack" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "end_game" => "4_strength",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Assassin"),
        "attack" => [WORKER_LABOURER, WORKER_FIGHTER],
        "end_game" => "attacked_yellow",
        "convert_extra_strength" => true,
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Barbarian"),
        "attack" => [EFFECT_TAKE_TAX, RESOURCE_PROVISION],
        "end_game" => "attacked_green",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Guardian"),
        "attack" => [WORKER_MERCHANT, RESOURCE_PROVISION],
        "end_game" => "2_develop",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Lookout"),
        "attack" => [WORKER_MERCHANT],
        "end_game" => "2_fortify",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Marauder"),
        "attack" => [WORKER_CRIMINAL],
        "end_game" => "4_influence",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [WORKER_LABOURER, WORKER_LABOURER],
        "end_game" => "more_mercenary",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Protector"),
        "attack" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "end_game" => "paid_debt",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Thief"),
        "attack" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "end_game" => "suspicion_card",
        "suit" => BLUE_SUIT
    ],

    [
        "name" => clienttranslate("Traitor"),
        "attack" => [WORKER_CRIMINAL],
        "end_game" => "unpaid_debt",
        "suit" => BLUE_SUIT
    ],
    [
        "name" => clienttranslate("Vigilante"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "2_absolve",
        "suit" => BLUE_SUIT
    ],

    // green suit
    [
        "name" => clienttranslate("Archer"),
        "attack" => [WORKER_SCOUT, RESOURCE_PROVISION],
        "end_game" => "2_garrison",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Armourer"),
        "attack" => [WORKER_FIGHTER],
        "end_game" => "4_strength",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Assassin"),
        "attack" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "end_game" => "yellow_attacked",
        "convert_extra_strength" => true,
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Champion"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_MERCHANT],
        "end_game" => "kings_order",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Guardian"),
        "attack" => [WORKER_LABOURER, WORKER_LABOURER],
        "end_game" => "2_develop",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Hunter"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_FIGHTER],
        "end_game" => "2_assistant",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Invader"),
        "attack" => [EFFECT_TAKE_TAX, RESOURCE_PROVISION],
        "convert_extra_strength" => true,
        "end_game" => "attacked_blue",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Lookout"),
        "attack" => [WORKER_LABOURER, WORKER_MERCHANT],
        "end_game" => "2_fortify",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_LABOURER],
        "end_game" => "more_mercenary",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Thief"),
        "attack" => [WORKER_CRIMINAL],
        "end_game" => "suspicion",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Traitor"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "unpaid_debt",
        "suit" => GREEN_SUIT
    ],
    [
        "name" => clienttranslate("Warrior"),
        "attack" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
        "end_game" => "4_faith",
        "suit" => GREEN_SUIT
    ],

    //Yellow Suit
    [
        "name" => clienttranslate("Adventurer"),
        "attack" => [WORKER_LABOURER, WORKER_SCOUT],
        "end_game" => "2_commision",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Archer"),
        "attack" => [RESOURCE_PROVISION, RESOURCE_PROVISION],
        "end_game" => "2_garrison",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Barbarian"),
        "attack" => [WORKER_LABOURER, WORKER_SCOUT],
        "conver_extra_strength" => true,
        "end_game" => "attacked_green",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Champion"),
        "attack" => [EFFECT_RMV_SUSPICION, WORKER_LABOURER],
        "end_game" => "kings_favor",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Hunter"),
        "attack" => [EFFECT_RMV_DEBT],
        "end_game" => "2_assistant",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Invader"),
        "attack" => [ATTR_INFLUENCE],
        "convert_extra_strength" => true,
        "end_game" => "attacked_blue",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Marauder"),
        "attack" => [ATTR_INFLUENCE],
        "end_game" => "4_influence",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [WORKER_LABOURER, RESOURCE_PROVISION],
        "end_game" => "more_mercenary",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Mercenary"),
        "attack" => [EFFECT_TAKE_TAX, EFFECT_TAKE_TAX],
        "end_game" => "more_mercenary",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Protector"),
        "attack" => [WORKER_LABOURER, WORKER_LABOURER],
        "end_game" => "paid_debt",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Vigilante"),
        "attack" => [EFFECT_RMV_DEBT, WORKER_CLERIC],
        "end_game" => "2_absolve",
        "suit" => YELLOW_SUIT
    ],
    [
        "name" => clienttranslate("Warrior"),
        "attack" => [WORKER_CLERIC],
        "end_game" => "4_faith",
        "suit" => YELLOW_SUIT
    ],
];

$this->board_positions = [
    "assistant3_debt", "assistant2_debt", "assistant2", "assistant1", "assistant0",
    "kings_order1", "kings_order2", "kings_order3",
    "kings_favor3", "kings_favor4", "kings_order5" , "kings_order6" ,  "kings_order7",
    "ousider0", "outsider2", "outisder4", "outisder6", "outsider8", "outsider10",
];

$this->board_positions_material = [
    [
        "column" => 0,
        "bonus" => "free_recruit",
        "min_players" => 1
    ],
    [
        "column" => 0,
        "bonus" => "2_coin",
        "min_players" => 1
    ],
    [
        "column" => 0,
        "bonus" => "labourer",
        "min_players" => 3
    ],
    [
        "column" => 0,
        "bonus" => "rmv_suspicion",
        "min_players" => 4
    ],

    [
        "column" => 2,
        "bonus" => "free_recruit",
        "min_players" => 1
    ],
    [
        "column" => 2,
        "bonus" => "2_coin",
        "min_players" => 1
    ],
    [
        "column" => 2,
        "bonus" => "scout",
        "min_players" => 1
    ],
    [
        "column" => 2,
        "bonus" => "rmv_suspicion",
        "min_players" => 1
    ],
    [
        "column" => 2,
        "bonus" => "labourer",
        "min_players" => 4
    ],
    [
        "column" => 2,
        "bonus" => "2_coin",
        "min_players" => 3
    ],
    [
        "column" => 2,
        "bonus" => "rmv_suspicion",
        "min_players" => 3
    ],

    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "labourer"
    ],
    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "merchant"
    ],
    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "2_coin"
    ],
    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "pray"
    ],
    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "scout"
    ],
    [
        "column" => 4,
        "min_players" => 1,
        "bonus" => "fighter"
    ],
    [
        "column" => 4,
        "min_players" => 3,
        "bonus" => "free_recruit"
    ],
    [
        "column" => 4,
        "min_players" => 3,
        "bonus" => "pay_debt"
    ],
    [
        "column" => 4,
        "min_players" => 4,
        "bonus" => "2_coin"
    ],

    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "fighter"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "pray"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "merchant"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "cleric"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "pay_debt"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "labourer_scout"
    ],
    [
        "column" => 6,
        "min_players" => 1,
        "bonus" => "2_coin"
    ],
    [
        "column" => 6,
        "min_players" => 3,
        "bonus" => "pray"
    ],
    [
        "column" => 6,
        "min_players" => 4,
        "bonus" => "labourer_labourer"
    ],
    [
        "column" => 6,
        "min_players" => 3,
        "bonus" => "2_coin"
    ],

    [
        "column" => 8,
        "min_players" => 1,
        "bonus" => "pray"
    ],
    [
        "column" => 8,
        "min_players" => 1,
        "bonus" => "labourer_fighter"
    ],
    [
        "column" => 8,
        "min_players" => 1,
        "bonus" => "pay_debt"
    ],
    [
        "column" => 8,
        "min_players" => 1,
        "bonus" => "labourer_merchant"
    ],
    [
        "column" => 8,
        "min_players" => 1,
        "bonus" => "labourer_cleric"
    ],
    [
        "column" => 8,
        "min_players" => 4,
        "bonus" => "pay_debt"
    ],
    [
        "column" => 8,
        "min_players" => 3,
        "bonus" => "labourer_labourer"
    ],

    [
        "column" => 10,
        "min_players" => 1,
        "bonus" => "pay_debt"
    ],
    [
        "column" => 10,
        "min_players" => 3,
        "bonus" => "pray"
    ],
    [
        "column" => 10,
        "min_players" => 4,
        "bonus" => "labourer_labourer"
    ],

];

$this->tavern_cards_material = [
    [WORKER_MERCHANT, WORKER_MERCHANT, WORKER_SCOUT, WORKER_CRIMINAL],
    [WORKER_MERCHANT, WORKER_MERCHANT, WORKER_SCOUT, WORKER_LABOURER],
    [WORKER_FIGHTER, WORKER_MERCHANT, WORKER_SCOUT, WORKER_CRIMINAL],
    [WORKER_CLERIC, WORKER_SCOUT, WORKER_LABOURER, WORKER_LABOURER],
    [WORKER_FIGHTER, WORKER_FIGHTER, WORKER_MERCHANT, WORKER_CRIMINAL],
    [WORKER_FIGHTER, WORKER_FIGHTER, WORKER_CRIMINAL, WORKER_LABOURER],
    [WORKER_FIGHTER, WORKER_FIGHTER, WORKER_SCOUT, WORKER_CRIMINAL],

    [WORKER_CLERIC, WORKER_CLERIC, WORKER_MERCHANT, WORKER_LABOURER],
    [WORKER_CLERIC, WORKER_CLERIC, WORKER_MERCHANT, WORKER_SCOUT],
    [WORKER_CLERIC, WORKER_CLERIC, WORKER_FIGHTER, WORKER_SCOUT],
    [WORKER_FIGHTER, WORKER_CRIMINAL, WORKER_CRIMINAL, WORKER_LABOURER],
    [WORKER_FIGHTER, WORKER_SCOUT, WORKER_CRIMINAL, WORKER_CRIMINAL],
    [WORKER_FIGHTER, WORKER_MERCHANT, WORKER_CRIMINAL, WORKER_CRIMINAL],
    [WORKER_CLERIC, WORKER_LABOURER, WORKER_CRIMINAL, WORKER_LABOURER],

    [WORKER_FIGHTER, WORKER_FIGHTER, WORKER_LABOURER, WORKER_LABOURER],
    [WORKER_FIGHTER, WORKER_LABOURER, WORKER_CRIMINAL, WORKER_LABOURER],
    [WORKER_CLERIC, WORKER_CLERIC, WORKER_MERCHANT, WORKER_MERCHANT],
    [WORKER_SCOUT, WORKER_SCOUT, WORKER_SCOUT, WORKER_LABOURER],
    [WORKER_CLERIC, WORKER_CLERIC, WORKER_CLERIC, WORKER_FIGHTER],
    [WORKER_CLERIC, WORKER_CLERIC, WORKER_FIGHTER, WORKER_MERCHANT],
    [WORKER_MERCHANT, WORKER_MERCHANT, WORKER_LABOURER, WORKER_LABOURER],

    [WORKER_CLERIC, WORKER_SCOUT, WORKER_SCOUT, WORKER_CRIMINAL],
    [WORKER_MERCHANT, WORKER_MERCHANT, WORKER_SCOUT, WORKER_SCOUT],
    [WORKER_FIGHTER, WORKER_MERCHANT, WORKER_SCOUT, WORKER_SCOUT],

];

$this->suspicion_cards_material = [
    "2tax",
    "1tax",
    "0tax"
];

$this->paladins_cards_material = [];

$this->fortification_cards_material = [];

$this->suspicion_cards_material = [
    "2_coin", "1_coin", "0_coin"
];
