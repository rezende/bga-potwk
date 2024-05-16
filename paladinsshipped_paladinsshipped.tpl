{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- paladinsshipped implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    paladinsshipped_paladinsshipped.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
   
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

<div class="container">
  <div class="mainboard">
    <div id="mainboard_1"></div>
    <div id="mainboard_2"></div>
  </div>
  <div id="card"></div>
</div>

<script type="text/javascript">
const jstpl_player_panel_extension = '<div id="panel_${player_id}" class="panel_player">\
<span class="piece panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span></div>'
</script>

{OVERALL_GAME_FOOTER}
