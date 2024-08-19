{OVERALL_GAME_HEADER}

<div class="main_container">
  <div class="mainboard">
    <div class="mainboard_box_top">
      <!-- townsfolk and support on the left   -->
      <div id="townsfolk_cards"></div>
      <!-- money and thief on the right -->
    </div>
    <div class="mainboard_box_middle">
      <!-- kings orders and favors on the left  -->
      <div id="mainboard_left"></div>
      <!-- meeples put by players on the right-->
      <div id="mainboard_right"></div>
    </div>
    <div class="mainboard_box_bottle">
      <!-- tavern on the left   -->
      <div id="outsider_cards"></div>
      <!-- outsiders on the right -->
    </div>
  </div>

  <div class="players_area">
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
  </div>
</div>

<script type="text/javascript">
  const jstpl_player_panel_extension =
    '<div id="panel_${player_id}" class="panel_player">\
<span class="panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span></div>';
</script>

{OVERALL_GAME_FOOTER}
