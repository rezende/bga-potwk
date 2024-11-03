{OVERALL_GAME_HEADER}

<div id="zoomBox">
  <!-- containter on the top to select cards -->
  <div id="townsfolkSelection" class="whiteblock">
    <div
      id="characterSelectionDescription"
      style="
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        display: none;
      "
    ></div>
  </div>
  <div id="paladinsSelection" class="whiteblock"></div>
  <div style="clear: both"></div>

  <!-- boardContainer contains both the player boards and the main board -->
  <div id="boardContainer">
    <!-- mainBoardContainer contains the main board -->
    <div id="board">
      <div id="boardLeft"></div>
      <div id="boardRight"></div>
    </div>

    <!-- mainBoardContainer contains the players board -->
    <div id="playersBoardContainer">
      <!-- BEGIN playerboard -->
      <div class="playerboard" id="playerboard_{player_ID}">
        <div class="playerboard_box_middle">
          <div class="playerboard_box"></div>
        </div>
      </div>
      <!-- END playerboard -->
    </div>
    <div id="townsfolk_cards" style="visibility: hidden"></div>
    <div id="outsider_cards" style="visibility: hidden"></div>
  </div>
</div>

<script type="text/javascript">
  const jstpl_player_panel_extension =
    '<div id="panel_${player_id}" class="panel_player">\
<span class="panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span></div>';
</script>

{OVERALL_GAME_FOOTER}
