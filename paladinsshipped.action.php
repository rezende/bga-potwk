<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * paladinsshipped implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * paladinsshipped.action.php
 *
 * paladinsshipped main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/paladinsshipped/paladinsshipped/myAction.html", ...)
 *
 */


class action_paladinsshipped extends APP_GameAction
{
    // Constructor: please do not modify
    public function __default()
    {
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "paladinsshipped_paladinsshipped";
            self::trace("Complete reinitialization of board game");
        }
    }

    // TODO: defines your action entry points there
    public function hireInitialTownsfolk()
    {
        self::setAjaxMode();
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $this->game->hireInitialTownsfolk($townsfolk_card_id);
        self::ajaxResponse();
    }
    public function pickPaladins()
    {
        self::setAjaxMode();
        $bottom_paladin = self::getArg("bottom_id", AT_int, true);
        $chosen_paladin = self::getArg("chosen_id", AT_int, true);
        $top_paladin = self::getArg("top_id", AT_int, true);
        $this->game->pickPaladins($bottom_paladin, $chosen_paladin, $top_paladin);
        self::ajaxResponse();
    }
    public function pickTavern()
    {
        self::setAjaxMode();
        $this->game->pickTavern(self::getArg("tavern_card_id", AT_int, true));
        self::ajaxResponse();
    }

    // CORE GAME ACTIONS
    public function pass()
    {
        self::setAjaxMode();
        $this->game->pass();
        self::ajaxResponse();
    }

    public function pray()
    {
        self::setAjaxMode();
        $action_space = self::getArg("action_space", AT_alphanum, true);
        $this->game->pray($action_space);
        self::ajaxResponse();
    }

    public function recruitDiscard()
    {
        self::setAjaxMode();
        $worker_id = self::getArg("worker_id", AT_int, true);
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $this->game->recruitDiscard($worker_id, $townsfolk_card_id);
        self::ajaxResponse();
    }

    public function recruitHire()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, false);
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $use_debt = self::getArg("use_debt", AT_bool, false);
        $this->game->recruitHire($worker1_id, $worker2_id, $townsfolk_card_id, $use_debt);
        self::ajaxResponse();
    }

    public function develop()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, true);
        $action_space = self::getArg("action_space", AT_alphanum, true);
        $workshop_position = self::getArg("workshop_position", AT_alphanum, true);
        $this->game->develop($worker1_id, $worker2_id, $action_space, $workshop_position);
        self::ajaxResponse();
    }

    public function hunt()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, false);
        $this->game->hunt($worker1_id, $worker2_id);
        self::ajaxResponse();
    }

    public function trade()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, false);
        $this->game->trade($worker1_id, $worker2_id);
        self::ajaxResponse();
    }

    public function conspire()
    {
        self::setAjaxMode();
        $white_workers = self::getArg("white_workers", AT_int, false);
        $green_workers = self::getArg("green_workers", AT_int, false);
        $blue_workers = self::getArg("blue_workers", AT_int, false);
        $red_workers = self::getArg("red_workers", AT_int, false);
        $black_workers = self::getArg("black_workers", AT_int, false);
        $purple_workers = self::getArg("purple_workers", AT_int, false);
        $this->game->conspire($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers);
        self::ajaxResponse();
    }

    public function commission()
    {
        self::setAjaxMode();
        $white_workers = self::getArg("white_workers", AT_int, false);
        $green_workers = self::getArg("green_workers", AT_int, false);
        $blue_workers = self::getArg("blue_workers", AT_int, false);
        $red_workers = self::getArg("red_workers", AT_int, false);
        $black_workers = self::getArg("black_workers", AT_int, false);
        $purple_workers = self::getArg("purple_workers", AT_int, false);
        $this->game->commission($white_workers, $green_workers, $blue_workers, $red_workers, $black_workers, $purple_workers);
        self::ajaxResponse();
    }

    public function selectCommissionPosition()
    {
        self::setAjaxMode();
        $board_position_index = self::getArg("board_position_index", AT_posint, true);
        $this->game->selectCommissionPosition($board_position_index);
        self::ajaxResponse();
    }

    public function selectGarrisonPosition()
    {
        self::setAjaxMode();
        $board_position_index = self::getArg("board_position_index", AT_posint, true);
        $this->game->selectGarrisonPosition($board_position_index);
        self::ajaxResponse();
    }

    public function fortify()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, true);
        $worker3_id = self::getArg("worker3_id", AT_int, true);
        $this->game->fortify($worker1_id, $worker2_id, $worker3_id);
        self::ajaxResponse();
    }

    public function garrison()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_posint, false);
        $worker2_id = self::getArg("worker2_id", AT_posint, false);
        $worker3_id = self::getArg("worker3_id", AT_posint, false);
        $this->game->garrison($worker1_id, $worker2_id, $worker3_id);
        self::ajaxResponse();
    }

    public function absolve()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, true);
        $worker3_id = self::getArg("worker3_id", AT_int, true);
        $jar_position = self::getArg("jar_position", AT_alphanum, true);
        $this->game->absolve($worker1_id, $worker2_id, $worker3_id, $jar_position);
        self::ajaxResponse();
    }

    public function attack()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, true);
        $worker3_id = self::getArg("worker3_id", AT_int, true);
        $outsider_card_id = self::getArg("outsider_card_id", AT_int, true);
        $silver_cost = self::getArg("silver_cost", AT_int, false);
        $this->game->attack($worker1_id, $worker2_id, $worker3_id, $outsider_card_id, $silver_cost);
        self::ajaxResponse();
    }

    public function convert()
    {
        self::setAjaxMode();
        $worker1_id = self::getArg("worker1_id", AT_int, true);
        $worker2_id = self::getArg("worker2_id", AT_int, true);
        $worker3_id = self::getArg("worker3_id", AT_int, true);
        $outsider_card_id = self::getArg("outsider_card_id", AT_int, true);
        $this->game->convert($worker1_id, $worker2_id, $worker3_id, $outsider_card_id);
        self::ajaxResponse();
    }

    public function kingsFavour()
    {
        self::setAjaxMode();
        $worker_id = self::getArg("worker_id", AT_int, true);
        $kings_favour_id = self::getArg("kings_favour_id", AT_int, true);
        $this->game->kingsFavour($worker_id, $kings_favour_id);
        self::ajaxResponse();
    }

    public function selectPaladins()
    {
        self::setAjaxMode();
        $top_paladin_id = self::getArg("top_paladin_id", AT_int, true);
        $middle_paladin_id = self::getArg("middle_paladin_id", AT_int, true);
        $bottom_paladin_id = self::getArg("bottom_paladin_id", AT_int, true);
        $this->game->selectPaladins($top_paladin_id, $middle_paladin_id, $bottom_paladin_id);
        self::ajaxResponse();
    }

    // SETUP

    // recruit (assistantID, assistantPosition)

    // ROUND

    // choosePaladin (chosenPaladin, topPaladin, bottomPaladin)

    // pickTavern (tavernID)

    // actionDevelop (worker1, worker2, developedAction:[commision, fortify, garrison, absolve, attack, convert], developedActionPosition:[left, middle])

    // actionHunt (worker1, worker2?)

    // actionTrade (worker1, worker2?)

    // actionRecruit (worker1, worker2?, assistantPos, assistantID, debt:[True, False])

    // actionTrade (worker1, worker2)
}
