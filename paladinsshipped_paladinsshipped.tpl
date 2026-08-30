{OVERALL_GAME_HEADER}

<div id="zoomBox">
  <!-- Paladin Selection Area (separate from action buttons) -->
  <div id="paladin_selection_area" class="paladin_selection_area" style="display: none;">
    <div class="paladin_selection_description">
      <p>Select Your Paladins</p>
    </div>
    
    <div class="paladin_selection_content">
      <div class="paladin_cards_section">
        <h4>Your Paladin Cards</h4>
        <div class="paladin_selection_positions">
          <div class="paladin_position">
            <div class="position_label">TOP</div>
            <div id="paladin_top_position" class="paladin_position_slot"></div>
          </div>
          <div class="paladin_position">
            <div class="position_label">PICKED</div>
            <div id="paladin_middle_position" class="paladin_position_slot"></div>
          </div>
          <div class="paladin_position">
            <div class="position_label">BOTTOM</div>
            <div id="paladin_bottom_position" class="paladin_position_slot"></div>
          </div>
        </div>
        <div class="paladin_available_cards">
          <h5>Available Cards</h5>
          <div id="paladin_cards_inline" class="paladin_cards_container"></div>
        </div>
      </div>
      
      <div class="tavern_cards_section">
        <h4>Available Tavern Cards</h4>
        <div id="tavern_cards_inline" class="tavern_cards_container"></div>
      </div>
    </div>
    
    <div class="paladin_selection_actions">
      <button class="action_button primary" id="confirm_paladin_selection" onclick="gameui.confirmPaladinSelection()">
        Confirm Selection (0/3)
      </button>
    </div>
  </div>

  <!-- Action Buttons Container - Only for actual game actions -->
  <div id="action_buttons">
  </div>

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
  <div id="paladinsSelection" class="whiteblock">
    <div id="paladinsSelectionDescription"></div>
    <div id="paladin_cards" class="paladin_cards_container"></div>
  </div>
  <div style="clear: both"></div>
  <div id="tavernsSelection" class="whiteblock">
    <div id="tavernsSelectionDescription"></div>
    <div id="tavern_cards" class="tavern_cards_container"></div>
  </div>
  <div style="clear: both"></div>

  <!-- Tavern Selection Area (inline modal on top of page) -->
  <div id="tavern_selection_area" class="tavern_selection_area" style="display: none;">
    <div class="tavern_selection_description">
      <p>Select Your Tavern Card</p>
    </div>
    
    <div class="tavern_selection_content">
      <div class="tavern_cards_section">
        <h4>Available Tavern Cards</h4>
        <div id="tavern_selection_cards" class="tavern_selection_cards_container"></div>
      </div>
    </div>
    
    <div class="tavern_selection_actions">
      <button id="confirm_tavern_selection" class="action_button primary" style="display: none;">
        Confirm Selection
      </button>
      <button id="cancel_tavern_selection" class="action_button secondary">
        Cancel
      </button>
    </div>
  </div>

  <!-- boardContainer contains both the player boards and the main board -->
  <div id="boardContainer">
    <!-- mainBoardContainer contains the main board -->
    <div id="board">
      <div id="boardLeft">
        <div id="townsfolk_cards">
          <div id="townsfolk_spot_0" class="townsfolk_spot"></div>
          <div id="townsfolk_spot_1" class="townsfolk_spot"></div>
          <div id="townsfolk_spot_2" class="townsfolk_spot"></div>
          <div id="townsfolk_spot_3" class="townsfolk_spot"></div>
          <div id="townsfolk_spot_4" class="townsfolk_spot"></div>
        </div>
        <div id="wall_deck"></div>
        <div id="kingsorder_cards">
          <div id="kingsorder_spot_0"></div>
          <div id="kingsorder_spot_1"></div>
          <div id="kingsorder_spot_2"></div>
        </div>
        <div id="kingsfavour_cards">
          <div id="kingsfavour_spot_0"></div>
          <div id="kingsfavour_spot_1"></div>
          <div id="kingsfavour_spot_2"></div>
          <div id="kingsfavour_spot_3"></div>
          <div id="kingsfavour_spot_4"></div>
        </div>
      </div>
    </div>

    <!-- mainBoardContainer contains the players board -->
    <div id="playersBoardContainer">
      <!-- BEGIN playerboard -->
      <div class="playerboard" id="playerboard_{PLAYER_ID}">
        <!-- Player Name Header -->
        <div class="player_name_header" id="player_name_{PLAYER_ID}">
          <h3>Player Area {PLAYER_ID}</h3>
        </div>
        
        <div class="playerboard_box_middle">
          <div class="playerboard_box">
            <div class="absolve_jars">
              <div id="absolve_jar_0_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_0"></div>
              <div id="absolve_jar_1_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_1"></div>
              <div id="absolve_jar_2_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_2"></div>
              <div id="absolve_jar_3_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_3"></div>
              <div id="absolve_jar_4_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_4"></div>
              <div id="absolve_jar_5_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_5"></div>
              <div id="absolve_jar_6_{PLAYER_ID}" class="absolve_jar_spot absolve_jar_6"></div>
            </div>
            <div class="development_houses">
              <div id="development_house_0_{PLAYER_ID}" class="development_house_spot development_house_spot_0"></div>
              <div id="development_house_1_{PLAYER_ID}" class="development_house_spot development_house_spot_1"></div>
              <div id="development_house_2_{PLAYER_ID}" class="development_house_spot development_house_spot_2"></div>
              <div id="development_house_3_{PLAYER_ID}" class="development_house_spot development_house_spot_3"></div>
              <div id="development_house_4_{PLAYER_ID}" class="development_house_spot development_house_spot_4"></div>
              <div id="development_house_5_{PLAYER_ID}" class="development_house_spot development_house_spot_5"></div>
              <div id="development_house_6_{PLAYER_ID}" class="development_house_spot development_house_spot_6"></div>
              <div id="development_house_7_{PLAYER_ID}" class="development_house_spot development_house_spot_7"></div>
            </div>
            <div class="fort_pieces">
              <div id="fort_piece_0_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_0"></div>
              <div id="fort_piece_1_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_1"></div>
              <div id="fort_piece_2_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_2"></div>
              <div id="fort_piece_3_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_3"></div>
              <div id="fort_piece_4_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_4"></div>
              <div id="fort_piece_5_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_5"></div>
              <div id="fort_piece_6_{PLAYER_ID}" class="fort_piece_spot fort_piece_spot_6"></div>
            </div>
            <div class="monk_pieces">
              <div id="monk_piece_0_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_0"></div>
              <div id="monk_piece_1_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_1"></div>
              <div id="monk_piece_2_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_2"></div>
              <div id="monk_piece_3_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_3"></div>
              <div id="monk_piece_4_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_4"></div>
              <div id="monk_piece_5_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_5"></div>
              <div id="monk_piece_6_{PLAYER_ID}" class="monk_piece_spot monk_piece_spot_6"></div>
            </div>
            <div id="develop_spaces">
              <div id="develop_space_0_{PLAYER_ID}" class="develop_space_spot develop_space_spot_0"></div>
              <div id="develop_space_1_{PLAYER_ID}" class="develop_space_spot develop_space_spot_1"></div>
            </div>
            <div id="hunt_spaces">
              <div id="hunt_space_0_{PLAYER_ID}" class="hunt_space_spot hunt_space_spot_0"></div>
              <div id="hunt_space_1_{PLAYER_ID}" class="hunt_space_spot hunt_space_spot_1"></div>
            </div>
            <div id="trade_spaces">
              <div id="trade_space_0_{PLAYER_ID}" class="trade_space_spot trade_space_spot_0"></div>
              <div id="trade_space_1_{PLAYER_ID}" class="trade_space_spot trade_space_spot_1"></div>
            </div>
            <div class="recruit_spaces">
              <div id="recruit_space_0_{PLAYER_ID}" class="recruit_space_spot recruit_space_spot_0"></div>
              <div id="recruit_space_1_{PLAYER_ID}" class="recruit_space_spot recruit_space_spot_1"></div>
            </div>
            <div id="pray_spaces">
              <div id="pray_space_0_{PLAYER_ID}" class="pray_space_spot pray_space_spot_0"></div>
            </div>
            <div id="conspire_spaces">
              <div id="conspire_space_0_{PLAYER_ID}" class="conspire_space_spot conspire_space_spot_0"></div>
            </div>
            <div class="commission_spaces">
              <div id="commission_space_0_{PLAYER_ID}" class="commission_space_spot commission_space_spot_0"></div>
              <div id="commission_space_1_{PLAYER_ID}" class="commission_space_spot commission_space_spot_1"></div>
              <div id="commission_space_2_{PLAYER_ID}" class="commission_space_spot commission_space_spot_2"></div>
            </div>
            <div class="garrison_spaces">
              <div id="garrison_space_0_{PLAYER_ID}" class="garrison_space_spot garrison_space_spot_0"></div>
              <div id="garrison_space_1_{PLAYER_ID}" class="garrison_space_spot garrison_space_spot_1"></div>
              <div id="garrison_space_2_{PLAYER_ID}" class="garrison_space_spot garrison_space_spot_2"></div>
            </div>
            <div class="conspire_spaces">
              <div id="conspire_space_0_{PLAYER_ID}" class="conspire_space_spot conspire_space_spot_0"></div>
              <div id="conspire_space_1_{PLAYER_ID}" class="conspire_space_spot conspire_space_spot_1"></div>
              <div id="conspire_space_2_{PLAYER_ID}" class="conspire_space_spot conspire_space_spot_2"></div>
            </div>
            <div class="absolve_spaces">
              <div id="absolve_space_0_{PLAYER_ID}" class="absolve_space_spot absolve_space_spot_0"></div>
              <div id="absolve_space_1_{PLAYER_ID}" class="absolve_space_spot absolve_space_spot_1"></div>
              <div id="absolve_space_2_{PLAYER_ID}" class="absolve_space_spot absolve_space_spot_2"></div>
            </div>
            <div class="attack_spaces">
              <div id="attack_space_0_{PLAYER_ID}" class="attack_space_spot attack_space_spot_0"></div>
              <div id="attack_space_1_{PLAYER_ID}" class="attack_space_spot attack_space_spot_1"></div>
              <div id="attack_space_2_{PLAYER_ID}" class="attack_space_spot attack_space_spot_2"></div>
            </div>
            <div class="convert_spaces">
              <div id="convert_space_0_{PLAYER_ID}" class="convert_space_spot convert_space_spot_0"></div>
              <div id="convert_space_1_{PLAYER_ID}" class="convert_space_spot convert_space_spot_1"></div>
              <div id="convert_space_2_{PLAYER_ID}" class="convert_space_spot convert_space_spot_2"></div>
            </div>
            <div class="develop_spaces">
              <div id="develop_space_0_{PLAYER_ID}" class="develop_space_spot develop_space_spot_0"></div>
              <div id="develop_space_1_{PLAYER_ID}" class="develop_space_spot develop_space_spot_1"></div>
              <div id="develop_space_2_{PLAYER_ID}" class="develop_space_spot develop_space_spot_2"></div>
            </div>
            <div class="trade_spaces">
              <div id="trade_space_0_{PLAYER_ID}" class="trade_space_spot trade_space_spot_0"></div>
              <div id="trade_space_1_{PLAYER_ID}" class="trade_space_spot trade_space_spot_1"></div>
              <div id="trade_space_2_{PLAYER_ID}" class="trade_space_spot trade_space_spot_2"></div>
            </div>
          </div>
          <div class="playerboard_cards" id="playerboard_cards_{PLAYER_ID}"></div>
        </div>
      </div>
      <!-- END playerboard -->
    </div>
  </div>
</div>

<script type="text/javascript">
  const jstpl_player_panel_extension =
    '<div class="panel_player_wrap">\
<div id="panel_${player_id}" class="panel_player">\
<div id="panel_paladin_${player_id}" class="panel_paladin" style="display:none;"></div>\
<div class="panel_section panel_section_attributes">\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_attr panel_icon_faith"></span><span id="panel_value_faith_${player_id}" class="panel_resource"></span><span id="panel_bonus_faith_${player_id}" class="panel_resource panel_resource_bonus"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_attr panel_icon_strength"></span><span id="panel_value_strength_${player_id}" class="panel_resource"></span><span id="panel_bonus_strength_${player_id}" class="panel_resource panel_resource_bonus"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_attr panel_icon_influence"></span><span id="panel_value_influence_${player_id}" class="panel_resource"></span><span id="panel_bonus_influence_${player_id}" class="panel_resource panel_resource_bonus"></span></span>\
</div>\
<div class="panel_section panel_section_resources">\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_resource panel_icon_provision"></span><span id="panel_value_provision_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_resource panel_icon_coin"></span><span id="panel_value_coin_${player_id}" class="panel_resource"></span></span>\
</div>\
<div class="panel_section panel_section_workers">\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_white_worker"></span><span id="panel_value_white_worker_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_green_worker"></span><span id="panel_value_green_worker_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_red_worker"></span><span id="panel_value_red_worker_${player_id}" class="panel_resource"></span></span><br />\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_blue_worker"></span><span id="panel_value_blue_worker_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_black_worker"></span><span id="panel_value_black_worker_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_worker panel_icon_purple_worker"></span><span id="panel_value_purple_worker_${player_id}" class="panel_resource"></span></span>\
</div>\
<div class="panel_section panel_section_cards">\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_card panel_icon_suspicion"></span><span id="panel_value_suspicion_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_card panel_icon_unpaid_debt"></span><span id="panel_value_unpaid_debt_${player_id}" class="panel_resource"></span></span>\
<span class="panel_resource_wrapper"><span class="panel_icon panel_icon_card panel_icon_paid_debt"></span><span id="panel_value_paid_debt_${player_id}" class="panel_resource"></span></span>\
</div>\
</div>\
<span class="panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span>\
</div>';
</script>

{OVERALL_GAME_FOOTER}
