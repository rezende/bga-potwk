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
        if(self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "paladinsshipped_paladinsshipped";
            self::trace("Complete reinitialization of board game");
        }
    }
    public function hireInitialTownsfolk()
    {
        self::setAjaxMode();
        $townsfolk_card_id = self::getArg("townsfolk_card_id", AT_int, true);
        $this->game->hireInitialTownsfolk($townsfolk_card_id);
        self::ajaxResponse();
    }

    // TODO: defines your action entry points there


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

    /*

    Example:

    public function myAction()
    {
        self::setAjaxMode();

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }

    */

}
