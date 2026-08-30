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

    private function getWorkerCountArgs()
    {
        return [
            self::getArg("white_workers", AT_int, false),
            self::getArg("green_workers", AT_int, false),
            self::getArg("blue_workers", AT_int, false),
            self::getArg("red_workers", AT_int, false),
            self::getArg("black_workers", AT_int, false),
            self::getArg("purple_workers", AT_int, false),
        ];
    }

    private function callWithWorkerCounts($method, ...$extra_args)
    {
        $args = array_merge($this->getWorkerCountArgs(), $extra_args);
        call_user_func_array([$this->game, $method], $args);
    }

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
        $this->callWithWorkerCounts('pass');
        self::ajaxResponse();
    }

    public function pray()
    {
        self::setAjaxMode();
        $action_space = self::getArg("action_space", AT_alphanum, true);
        $this->callWithWorkerCounts('pray', $action_space);
        self::ajaxResponse();
    }

    public function recruitDiscard()
    {
        self::setAjaxMode();
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $this->callWithWorkerCounts('recruitDiscard', $townsfolk_card_id);
        self::ajaxResponse();
    }

    public function recruitHire()
    {
        self::setAjaxMode();
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $use_debt = self::getArg("use_debt", AT_bool, false);
        $this->callWithWorkerCounts('recruitHire', $townsfolk_card_id, $use_debt);
        self::ajaxResponse();
    }

    public function develop()
    {
        self::setAjaxMode();
        $action_space = self::getArg("action_space", AT_alphanum, true);
        $workshop_position = self::getArg("workshop_position", AT_alphanum, true);
        $this->callWithWorkerCounts('develop', $action_space, $workshop_position);
        self::ajaxResponse();
    }

    public function hunt()
    {
        self::setAjaxMode();
        $this->callWithWorkerCounts('hunt');
        self::ajaxResponse();
    }

    public function trade()
    {
        self::setAjaxMode();
        $this->callWithWorkerCounts('trade');
        self::ajaxResponse();
    }

    public function conspire()
    {
        self::setAjaxMode();
        $this->callWithWorkerCounts('conspire');
        self::ajaxResponse();
    }

    public function commission()
    {
        self::setAjaxMode();
        $this->callWithWorkerCounts('commission');
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
        $this->callWithWorkerCounts('fortify');
        self::ajaxResponse();
    }

    public function garrison()
    {
        self::setAjaxMode();
        $this->callWithWorkerCounts('garrison');
        self::ajaxResponse();
    }

    public function absolve()
    {
        self::setAjaxMode();
        $jar_position = self::getArg("jar_position", AT_alphanum, true);
        $this->callWithWorkerCounts('absolve', $jar_position);
        self::ajaxResponse();
    }

    public function attack()
    {
        self::setAjaxMode();
        $outsider_card_id = self::getArg("outsider_card_id", AT_int, true);
        $silver_cost = self::getArg("silver_cost", AT_int, false);
        $this->callWithWorkerCounts('attack', $outsider_card_id, $silver_cost);
        self::ajaxResponse();
    }

    public function convert()
    {
        self::setAjaxMode();
        $outsider_card_id = self::getArg("outsider_card_id", AT_int, true);
        $this->callWithWorkerCounts('convert', $outsider_card_id);
        self::ajaxResponse();
    }

    public function kingsFavour()
    {
        self::setAjaxMode();
        $kings_favour_id = self::getArg("kings_favour_id", AT_int, true);
        $this->callWithWorkerCounts('kingsFavour', $kings_favour_id);
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
}
