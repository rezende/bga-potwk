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
        
        <!-- Player Resources Table -->
        <div class="player_resources_table" id="player_resources_{PLAYER_ID}">
          <table class="resources_table">
            <thead>
              <tr>
                <th colspan="2">Resources</th>
                <th colspan="6">Workers</th>
                <th colspan="3">Stats</th>
              </tr>
              <tr>
                <th>Provisions</th>
                <th>Coins</th>
                <th>White</th>
                <th>Green</th>
                <th>Blue</th>
                <th>Red</th>
                <th>Black</th>
                <th>Purple</th>
                <th>Faith</th>
                <th>Strength</th>
                <th>Influence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td id="provisions_{PLAYER_ID}">0</td>
                <td id="coins_{PLAYER_ID}">0</td>
                <td id="white_workers_{PLAYER_ID}">0</td>
                <td id="green_workers_{PLAYER_ID}">0</td>
                <td id="blue_workers_{PLAYER_ID}">0</td>
                <td id="red_workers_{PLAYER_ID}">0</td>
                <td id="black_workers_{PLAYER_ID}">0</td>
                <td id="purple_workers_{PLAYER_ID}">0</td>
                <td id="faith_{PLAYER_ID}">0</td>
                <td id="strength_{PLAYER_ID}">0</td>
                <td id="influence_{PLAYER_ID}">0</td>
              </tr>
            </tbody>
          </table>
          <div class="debt_info">
            <span>Paid Debt: <span id="paid_debt_{PLAYER_ID}">0</span></span>
            <span>Unpaid Debt: <span id="unpaid_debt_{PLAYER_ID}">0</span></span>
          </div>
        </div>
        
        <div class="playerboard_box_middle">
          <div class="playerboard_box"></div>
          <div class="playerboard_cards" id="playerboard_cards_{PLAYER_ID}"></div>
        </div>
      </div>
      <!-- END playerboard -->
    </div>
  </div>
</div>

<script type="text/javascript">
  const jstpl_player_panel_extension =
    '<div id="panel_${player_id}" class="panel_player">\
<span class="panel_parchment" id="panel_parchment_${player_id}" style="display:none;"></span></div>';
</script>

{OVERALL_GAME_FOOTER}
