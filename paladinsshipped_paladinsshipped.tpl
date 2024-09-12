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
    <div id="mainBoardContainer">
      <div id="board">
        <div id="boardLeft"></div>
        <div id="boardRight"></div>
      </div>

      <!-- mainBoardContainer contains the players board -->
      <div id="playersBoardContainer">
        <!-- BEGIN playerboard -->
        <div class="playerboard" id="playerboard_{player_ID}">
          <div class="playerboard_box_top">
            <!-- walls on the left + suspicion stack on the right -->
          </div>

          <div class="playerboard_box_middle">
            <!-- pointmarkers on the left -->
            <!-- townsfolk marker on top left -->
            <!-- buy markers on mid/bottom left -->

            <!-- outsider defeated marker on top right (left) -->
            <!-- converted outsider marker on top right (right) -->
            <!-- advanced buy markers on mid right -->
            <!-- walls marker / jars on bottom right -->

            <div class="playerboard_box"></div>
          </div>
          <div class="playerboard_box_bottom">
            <!-- converted outsider card -->
          </div>
        </div>
        <!-- END playerboard -->
        <div id="townsfolk_cards"></div>
        <div id="outsider_cards"></div>
      </div>
    </div>
  </div>
</div>

<script type="text/javascript">
  const jstpl_player_panel_extension =
    '<div id="panel_${player_id}" class="panel_player">\
<span class="panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span></div>';
</script>

{OVERALL_GAME_FOOTER}
