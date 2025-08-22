/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaladinsShipped implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * paladinsshipped.js
 *
 * PaladinsShipped user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
  "dojo",
  "dojo/_base/declare",
  "dojo/debounce",
  "ebg/core/gamegui",
  "ebg/counter",
  g_gamethemeurl + "modules/bga-zoom.js",
], function (dojo, declare, debounce, gamegui, bgaZoom) {
  return declare("bgagame.paladinsshipped", gamegui, {
    constructor: function () {
      // Here, you can init the global variables of your user interface
      // Example:
      // this.myGlobalValue = 0;

      this.uiItems = [];
      this.selectedPaladins = [];

      this.zoomManager = new ZoomManager({
        element: document.getElementById("zoomBox"),
        localStorageZoomKey: "paladinsshipped-zoom",
        defaultZoom: 1,

        zoomLevels: [0.75, 1, 1.25],
        autoZoom: {
          expectedWidth: 1500,
        },
      });
    },

    // uiItems functions
    attachFunctionsToUiItems: function () {
      const _self = this;
      this.uiItems._lastUid = 0;

      this.uiItems.itemConfig = {
        outsider: { cssClass: "outsider" },
        townsfolk_uiitem: { cssClass: "townsfolk" },
        paladin_card: { cssClass: "paladin_card" },
        tavern_card: { cssClass: "tavern_card" },
        wall_card: { cssClass: "wall_card" },
        kingsorder_card: { cssClass: "kingsorder_card" },
        kingsfavour_card: { cssClass: "kingsfavour_card" },
        absolve_jar_uiitem: { cssClass: "absolve_jar" },
        development_house_uiitem: { cssClass: "development_house" },
        fort_piece_uiitem: { cssClass: "fort_piece" },
        monk_piece_uiitem: { cssClass: "monk_piece" },
      };

      this.uiItems.itemBackgroundConfig = {
        outsider: {
          items_per_row: 8,
          width: 160,
          height: 250,
          type_property: "type_arg",
        },
        townsfolk_uiitem: {
          items_per_row: 6,
          width: 160,
          height: 250,
          type_property: "type_arg",
        },
        paladin_card: {
          items_per_row: 7,
          width: 160,
          height: 250,
          type_property: "type_arg",
        },
        tavern_card: {
          items_per_row: 5,
          width: 127,
          height: 198,
          type_property: "type_arg",
        },
        wall_card: {
          items_per_row: 5,
          width: 127,
          height: 198,
          type_property: "type_arg",
        },
        kingsorder_card: {
          items_per_row: 4,
          width: 127,
          height: 198,
          type_property: "type_arg",
        },
        kingsfavour_card: {
          items_per_row: 5,
          width: 127,
          height: 198,
          type_property: "type_arg",
        },
        absolve_jar_uiitem: {
          one_row: true,
          items_per_row: 7,
          width: 168,
          start_x: -41,
          start_y: 257,
          type_property: "order_index",
        },
      };

      this.uiItems.getByUiType = function (uiType) {
        return this.filter(function (u) {
          return u.uiType == uiType;
        });
      };

      this.uiItems.getByUid = function (uid) {
        return this.find(function (u) {
          return u.uid == uid;
        });
      };

      this.uiItems.getBackgroundPosition = function (uiType, typeArg) {
        var background = { 
          x: this.itemBackgroundConfig[uiType]?.["start_x"] || 0,
          y: this.itemBackgroundConfig[uiType]?.["start_y"] || 0
        };
        background.x +=
          (typeArg % this.itemBackgroundConfig[uiType].items_per_row) *
          -1 *
          this.itemBackgroundConfig[uiType]["width"];
        if (!this.itemBackgroundConfig[uiType]?.one_row) {
          background.y +=
            Math.floor(
              typeArg / this.itemBackgroundConfig[uiType].items_per_row,
            ) *
            -1 *
            this.itemBackgroundConfig[uiType]["height"];
        }
        return background;
      };

      this.uiItems.getBackgroundPositionForUiItem = function (uiItem) {
        // Items that only have one piece
        if (uiItem.uiType == "development_house_uiitem") {
          return { x: -596, y: 451 };
        }
        if (uiItem.uiType == "monk_piece_uiitem") {
          return { x: -792, y: 430 };
        }
        if (uiItem.uiType == "fort_piece_uiitem") {
          return { x: -975, y: 430 };
        }
        var background = { x: 0, y: 0 };
        if (this.itemBackgroundConfig[uiItem.uiType] != undefined) {
          var propertyName =
            this.itemBackgroundConfig[uiItem.uiType]["type_property"];
          var typeArg = parseInt(uiItem.data[propertyName]);
          background = this.getBackgroundPosition(uiItem.uiType, typeArg);
        }
        return background;
      };

      this.uiItems.setBackgroundUiItem = function (uiItem) {
        const background = this.getBackgroundPositionForUiItem(uiItem);
        dojo.setStyle(
          uiItem.htmlNode,
          "background-position",
          background.x + "px" + " " + background.y + "px",
        );
      };

      this.uiItems.createAndAddItem = function (uiType, params) {
        this._lastUid++;
        var htmlNode = null;
        htmlNode = dojo.create("div", {
          class: this.itemConfig[uiType].cssClass,
        });
        dojo.setAttr(htmlNode, "id", "uid-" + this._lastUid);

        dojo.setAttr(htmlNode, "data-uid", "uid-" + this._lastUid);
        dojo.connect(htmlNode, "onclick", _self, "onClickUiItem");

        const item = {
          uid: this._lastUid,
          uiType: uiType,
          data: params,
          htmlNode: htmlNode,
          uiPosition: 0,
        };
        this.setBackgroundUiItem(item);
        this.push(item);

        return item;
      };

      this.uiItems.createItems = function (uiType, dataArray) {
        for (const data of dataArray) {
          this.createAndAddItem(uiType, data);
        }
      };

      this.uiItems.resetAllSelectable = function () {
        this.resetSelectable(this);
      };

      this.uiItems.resetSelectable = function (items) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          dojo.removeClass(item.htmlNode, "selectable");
          dojo.removeClass(item.htmlNode, "selected");
          item.isSelected = false;
          item.isSelectable = false;
        }
      };

      this.uiItems.makeSelectable = function (items) {
        for (var i = 0; i < items.length; i++) {
          items[i].isSelectable = true;
          dojo.addClass(items[i].htmlNode, "selectable");
        }
        this.resetSelectableAnimation();
      };

      this.uiItems.resetSelectableAnimation = function () {
        //need code to restart it - https://css-tricks.com/restart-css-animation/
        const items = this.getSelectableItems(false);
        for (var i = 0; i < items.length; i++) {
          items[i].htmlNode.classList.remove("selectable");
          void items[i].htmlNode.offsetWidth;
          items[i].htmlNode.classList.add("selectable");
        }
      };

      this.uiItems.getSelectedItems = function () {
        return this.filter(function (u) {
          return u.isSelected;
        });
      };

      this.uiItems.getSelectableItems = function (includeSelected) {
        if (includeSelected)
          return this.filter(function (u) {
            return u.isSelectable;
          });
        return this.filter(function (u) {
          return u.isSelectable && !u.isSelected;
        });
      };

      this.uiItems.toggleSelection = function (uiItem) {
        if (uiItem.isSelectable) {
          if (uiItem.isSelected) {
            dojo.addClass(uiItem.htmlNode, "selectable");
            dojo.removeClass(uiItem.htmlNode, "selected");
          } else {
            dojo.removeClass(uiItem.htmlNode, "selectable");
            dojo.addClass(uiItem.htmlNode, "selected");
          }
          uiItem.isSelected = !uiItem.isSelected;
        }
      };
    },

    // onMainboardZoomPlus: function() {
    //     this.setZoom(this.zoom + 0.1);
    // },
    // onMainboardZoomMinus: function() {
    //     this.setZoom(this.zoom - 0.1);
    // },

    // setMainboardZoom: function (zoom) {
    //    zoom = parseInt(zoom) || 0;
    //    if (zoom === 0 || zoom < 0.1 || zoom > 10) {
    //      zoom = 1;
    //    }
    //    this.zoom = zoom;
    //    var inner = document.getElementById("mainboard_box");

    //    if (zoom == 1) {
    //      inner.style.removeProperty("transform");
    //      inner.style.removeProperty("width");
    //    } else {
    //      inner.style.transform = "scale(" + zoom + ")";
    //      inner.style.transformOrigin = "0 0";
    //      inner.style.width = 200 / zoom + "%";
    //    }
    //    localStorage.setItem(`${this.game_name}_zoom`, "" + this.zoom);
    //    this.onScreenWidthChange();
    // },

    /*
                setup:
                
                This method must set up the game user interface according to current game situation specified
                in parameters.
                
                The method is called each time the game interface is displayed to a player, ie:
                _ when the game starts
                _ when a player refreshes the game page (F5)
                
                "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
            */

    getValuesFromObject: function (data) {
      var values = [];
      for (var key in data) {
        values.push(data[key]);
      }
      return values;
    },

    // page load
    setup: function (gamedatas) {
        // Store the complete gamedatas for access throughout the game
        this.gamedatas = gamedatas;
        
        this.min_width_viewport = gamedatas.game_interface_width.min;
        this.max_width_viewport = gamedatas.game_interface_width.max;
        this.onScreenWidthChange();

        this.outsider_display = gamedatas.outsider_display;
        this.townsfolk_display = gamedatas.townsfolk_display;
        this.townsfolk_material = gamedatas.townsfolk_material;
        this.paladin_material = gamedatas.paladin_material;
        this.paladin_hand = gamedatas.player_paladin_hand;
        this.all_players_townsfolk_hands = gamedatas.all_players_townsfolk_hands;
        this.tavern_display = gamedatas.tavern_display;
        this.tavern_cards_material = gamedatas.tavern_cards_material;
        this.wall_cards = gamedatas.wall_cards;
        this.kingsorder_display = gamedatas.kingsorder_display;
        this.kingsfavour_display = gamedatas.kingsfavour_display;
        this.attachFunctionsToUiItems();
        
        this.createTokens();
        // this.uiItems.createItems(
        //   "outsider",
        //   this.getValuesFromObject(this.outsider_display)
        // );
        this.uiItems.createItems(
          "townsfolk_uiitem",
          this.getValuesFromObject(this.townsfolk_display),
        );
        if (this.paladin_hand) {
          this.createPaladinUiItems(this.paladin_hand);
        }
        if (this.tavern_display) {
          this.createTavernUiItems(this.tavern_display);
        }
        if (this.all_players_townsfolk_hands) {
          this.createAllPlayersTownsfolkUiItems(this.all_players_townsfolk_hands);
        }
        // TODO: so far, it only creates the deck background, not the cards
        this.setupWallCards(this.getValuesFromObject(this.wall_cards));
        
        const kingsOrderCards = this.getValuesFromObject(this.kingsorder_display);
        const kingsFavourCards = this.getValuesFromObject(this.kingsfavour_display);
        
        this.setupKingsOrderCards(kingsOrderCards);
        this.setupKingsFavourCards(kingsFavourCards);
        this.setupNotifications();
        this.setupActionButtons();
        this.updateActionButtons(); // Ensure action buttons are properly hidden/shown based on initial state
        this.drawUi();

        // Setting up player boards
        for (var player_id in gamedatas.players) {
          const player = gamedatas.players[player_id];
          // TODO: Setting up players boards if needed
          dojo.place(
            this.format_block("jstpl_player_panel_extension", {
              player_id: player_id,
            }),
            $("player_board_" + player_id),
          );
          if (player.parchment == "1") {
            this.updateParchment(player_id);
          }
          
          // Update player resource table
          this.updatePlayerResourceTable(player_id, player);
        }

        // TODO: Set up your game interface here, according to "gamedatas"
        // Setup game notifications to handle (see "setupNotifications" method below)
        this.addTooltipToClass(
          ".panel_parchment",
          _("Parchment, indicates the first player of each round"),
          "",
        );
        
        // Initialize player area reordering tracking
        this.lastReorderedUser = null;
        
        // Set data attributes for player identification
        this.setPlayerBoardAttributes();
        
        // Reorder player areas to show current user first
        // Use a delay to ensure all DOM elements are ready
        setTimeout(() => {
          this.reorderPlayerAreas();
        }, 200);
        
        // Initialize tavern selection functionality
        this.initTavernSelection();
    },

    // To be overrided by games
    onScreenWidthChange: function () {
      // Remove broken "zoom" property added by BGA framework
      this.gameinterface_zoomFactor = 1;
      $("page-content").style.removeProperty("zoom");
      $("page-title").style.removeProperty("zoom");
      $("right-side-first-part").style.removeProperty("zoom");

      var viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = this.default_viewport;
      }
    },

    setupPaladinSelection: function() {
      console.log("=== SETUP PALADIN SELECTION ===");
      console.log("Current player_id:", this.player_id);
      console.log("paladin_hand data:", this.paladin_hand);
      
      // Clear previous content
      const paladinContainer = document.getElementById('paladin_cards_inline');
      const tavernContainer = document.getElementById('tavern_cards_inline');
      const topPosition = document.getElementById('paladin_top_position');
      const middlePosition = document.getElementById('paladin_middle_position');
      const bottomPosition = document.getElementById('paladin_bottom_position');
      
      console.log("Container elements found:", {
        paladinContainer: !!paladinContainer,
        tavernContainer: !!tavernContainer,
        topPosition: !!topPosition,
        middlePosition: !!middlePosition,
        bottomPosition: !!bottomPosition
      });
      
      if (paladinContainer) paladinContainer.innerHTML = '';
      if (tavernContainer) tavernContainer.innerHTML = '';
      if (topPosition) topPosition.innerHTML = '';
      if (middlePosition) middlePosition.innerHTML = '';
      if (bottomPosition) bottomPosition.innerHTML = '';
      
      // Get current player's paladin cards
      const allPaladinCards = this.uiItems.getByUiType("paladin_card");
      const currentPlayerId = this.player_id;
      
      console.log("All paladin cards found:", allPaladinCards.length);
      console.log("Current player ID:", currentPlayerId);
      
      // If no paladin cards exist in UI items but they exist in game data, create them
      if (allPaladinCards.length === 0 && this.paladin_hand) {
        console.log("No paladin cards in UI, creating from paladin_hand");
        this.createPaladinUiItems(this.paladin_hand);
      }
      
      // Get the paladin cards again (in case we just created them)
      const updatedPaladinCards = this.uiItems.getByUiType("paladin_card");
      console.log("Updated paladin cards count:", updatedPaladinCards.length);
      
      // Try different location filters to find the cards
      const playerPaladins = updatedPaladinCards.filter(card => {
        const matchesLocation = (card.data.location === "paladinsSelection" || card.data.location === "paladin_hand");
        const matchesPlayer = card.data.location_arg == currentPlayerId;
        console.log(`Card ${card.data.id}: location=${card.data.location}, location_arg=${card.data.location_arg}, matchesLocation=${matchesLocation}, matchesPlayer=${matchesPlayer}`);
        return matchesLocation && matchesPlayer;
      });
      
      console.log("Player paladins found with location filter:", playerPaladins.length);
      
      // If no cards found with paladinsSelection location, try to find any paladin cards for this player
      if (playerPaladins.length === 0) {
        console.log("No cards found with location filter, trying alternative filter");
        const alternativePaladins = updatedPaladinCards.filter(card => 
          card.data.location_arg == currentPlayerId
        );
        
        console.log("Alternative paladins found:", alternativePaladins.length);
        
        if (alternativePaladins.length > 0) {
          console.log("Using alternative paladins");
          // Use the alternative cards
          alternativePaladins.forEach(card => {
            console.log(`Processing alternative card ${card.data.id}`);
            const cardClone = card.htmlNode.cloneNode(true);
            if (paladinContainer) {
              dojo.place(cardClone, paladinContainer);
              
              // Make cards draggable
              dojo.addClass(cardClone, 'draggable');
              cardClone.draggable = true;
              cardClone.dataset.cardId = card.data.id;
              
              // Add drag event listeners
              cardClone.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
              cardClone.addEventListener('dragend', (e) => this.handleDragEnd(e));
              
            }
          });
        }
      } else {
        console.log("Using original filtered paladins");
        // Use the original filtered cards
        playerPaladins.forEach(card => {
          console.log(`Processing original card ${card.data.id}`);
          const cardClone = card.htmlNode.cloneNode(true);
          if (paladinContainer) {
            dojo.place(cardClone, paladinContainer);
            
            // Make cards draggable
            dojo.addClass(cardClone, 'draggable');
            cardClone.draggable = true;
            cardClone.dataset.cardId = card.data.id;
            
            // Add drag event listeners
            cardClone.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
            cardClone.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
          }
        });
      }
      
      // Get tavern cards
      const tavernCards = this.uiItems.getByUiType("tavern_card");
      
      // If no tavern cards exist in UI items but they exist in game data, create them
      if (tavernCards.length === 0 && this.tavern_display) {
        this.createTavernUiItems(this.tavern_display);
        // Get the cards again after creation
        const newTavernCards = this.uiItems.getByUiType("tavern_card");
      }
      
      // Get the tavern cards again (in case we just created them)
      const updatedTavernCards = this.uiItems.getByUiType("tavern_card");
      
      // Move tavern cards to inline area (read-only)
      updatedTavernCards.forEach(card => {
        const cardClone = card.htmlNode.cloneNode(true);
        if (tavernContainer) {
          dojo.place(cardClone, tavernContainer);
          dojo.addClass(cardClone, 'readonly');
        }
      });
      
      // Set up drop zones for the three positions
      this.setupDropZones();
      
      // Reset selection
      this.selectedPaladins = {
        top: null,
        middle: null,
        bottom: null
      };
      this.updatePaladinSelectionCounter();
      
    },

    setupTownsfolkSelection: function () {
      if (this.isCurrentPlayerActive()) {
        const allTownsfolkCards = this.uiItems.getByUiType("townsfolk_uiitem");
        // Only make display cards selectable, not player cards
        const displayCards = allTownsfolkCards.filter(card => 
          card.data.location !== "playerboard_cards"
        );
        this.uiItems.makeSelectable(displayCards);
        this.uiItems.resetSelectableAnimation();
      }
    },



    // Handle tavern card click
    handleTavernCardClick: function(event, card) {
      // Check if the current player is the active player
      const currentPlayerId = this.player_id;
      const activePlayerId = this.gamedatas.gamestate.active_player;
      
      if (String(currentPlayerId) !== String(activePlayerId)) {
        console.log(`Player ${currentPlayerId} is not the active player (${activePlayerId}). Cannot select tavern card.`);
        return;
      }
      
      // Check if this card has already been selected
      if (this.selectedTavernCards.includes(card.data.id)) {
        console.log(`Card ${card.data.id} has already been selected, ignoring click`);
        return;
      }
      
      // Add the card to the selected cards tracking array
      this.selectedTavernCards.push(card.data.id);
      
      // Remove selectable class from all cards
      const allCards = document.querySelectorAll('#tavern_selection_cards .selectable');
      allCards.forEach(c => dojo.removeClass(c, 'selectable'));
      
      // Add selected class to clicked card
      dojo.addClass(event.target, 'selected');
      
      // Disable the click event on this card
      event.target.style.pointerEvents = 'none';
      event.target.style.opacity = '0.5';
      
      // Send the selection to the server
      this.ajaxcall('/paladinsshipped/paladinsshipped/pickTavern.html', {
        tavern_card_id: card.data.id
      }, this, function(result) {
        console.log('Tavern selection confirmed:', result);
      }, function(error) {
        console.error('Error selecting tavern card:', error);
      });
    },

    displayTaverns: function () {
      dojo.setStyle("tavernsSelection", "display", "flex");
      dojo.setStyle("tavernsSelection", "justify-content", "center");
    },

    createTavernUiItems: function (cards) {
      console.log("=== CREATE TAVERN UI ITEMS ===");
      console.log("Cards received:", cards);
      
      // Prevent multiple simultaneous updates
      if (this.isUpdatingTavernCards) {
        console.log("Tavern cards update already in progress, skipping");
        return;
      }
      
      this.isUpdatingTavernCards = true;
      
      try {
        // Check if we already have tavern cards to prevent duplication
        const existingTavernCards = this.uiItems.getByUiType("tavern_card");
        console.log("Existing tavern cards before creation:", existingTavernCards.length);
        
        // Always remove existing cards to ensure clean state
        // This prevents any potential duplication issues
        existingTavernCards.forEach(card => {
          if (card.htmlNode) {
            card.htmlNode.remove();
          }
        });
        
        console.log("Removed existing tavern cards from DOM");
        
        // Now create new tavern cards
        let cardsCreated = 0;
        for (var cardId in cards) {
          const card = cards[cardId];
          card.isSelectable = false;
          const uiType = "tavern_card";
          const params = card;
          this.uiItems.createAndAddItem(uiType, params);
          cardsCreated++;
        }
        
        console.log(`Total tavern cards created: ${cardsCreated}`);
        
        // Verify the cards were created
        const newTavernCards = this.uiItems.getByUiType("tavern_card");
        console.log("Tavern cards in UI items after creation:", newTavernCards.length);
        
        // Additional verification: check for duplicates
        const cardIds = new Set();
        newTavernCards.forEach(card => {
          if (cardIds.has(card.data.id)) {
            console.warn(`DUPLICATE CARD DETECTED: ${card.data.id}`);
          }
          cardIds.add(card.data.id);
        });
        console.log(`Unique card IDs: ${cardIds.size}, Total cards: ${newTavernCards.length}`);
      } finally {
        // Always reset the flag
        this.isUpdatingTavernCards = false;
      }
    },

    createTokens: function () {
      for (const playerId in this.gamedatas.players) {
        for (let i = 0; i < 8; i++) {
          const params = {
            id: `development_house_${i}_${playerId}`,
            type: "development_house",
            location: "playerboard",
            order_index: i,
            background_index: 0, // All houses use the same background image
            player_id: playerId
          };
          this.uiItems.createAndAddItem("development_house_uiitem", params);
        }
        for (let i = 0; i < 7; i++) {
            var params = {
              id: `absolve_jar_${i}_${playerId}`,
              type: "absolve_jar",
              location: "playerboard",
              order_index: i,
              player_id: playerId
            };
            this.uiItems.createAndAddItem("absolve_jar_uiitem", params);
            params = {
              id: `fort_piece_${i}_${playerId}`,
              type: "fort_piece",
              location: "playerboard",
              order_index: i,
              player_id: playerId
            };
            this.uiItems.createAndAddItem("fort_piece_uiitem", params);
            params = {
              id: `monk_piece_${i}_${playerId}`,
              type: "monk_piece",
              location: "playerboard",
              order_index: i,
              player_id: playerId
            };
            this.uiItems.createAndAddItem("monk_piece_uiitem", params);
        }
      }
    },

    createPaladinUiItems: function (cards) {
      console.log("=== CREATE PALADIN UI ITEMS ===");
      console.log("Cards received:", cards);
      console.log("Current player_id:", this.player_id);
      console.log("Cards type:", typeof cards);
      console.log("Cards length:", Array.isArray(cards) ? cards.length : Object.keys(cards).length);
      
      let cardsCreated = 0;
      for (var cardId in cards) {
        const card = cards[cardId];
        console.log(`Processing card ${cardId}:`, card);
        
        card.location = "paladinsSelection";
        card.location_arg = this.player_id; // Set the current player ID
        card.isSelectable = true;
        const uiType = "paladin_card";
        const params = card;
        
        console.log(`Creating UI item for card ${cardId} with params:`, params);
        this.uiItems.createAndAddItem(uiType, params);
        cardsCreated++;
      }
      
      console.log(`Total paladin cards created: ${cardsCreated}`);
      
      // Verify the cards were created
      const allPaladinCards = this.uiItems.getByUiType("paladin_card");
      console.log("All paladin cards in UI items after creation:", allPaladinCards.length);
      console.log("Paladin cards details:", allPaladinCards.map(card => ({
        id: card.data.id,
        location: card.data.location,
        location_arg: card.data.location_arg,
        player_id: this.player_id
      })));
    },

    createAllPlayersTownsfolkUiItems: function (allPlayersCards) {
      for (var playerId in allPlayersCards) {
        const playerCards = allPlayersCards[playerId];
        
        for (var cardId in playerCards) {
          const card = playerCards[cardId];
          card.location = "playerboard_cards";
          card.location_arg = playerId; // Set the player ID so cards go to correct player area
          card.isSelectable = false;
          const uiType = "townsfolk_uiitem";
          const params = card;
          
          this.uiItems.createAndAddItem(uiType, params);
        }
      }
    },

    setupWallCards: function (cards) {
      const deckBackground = { type: 24, type_arg: 24 };
      this.uiItems.createAndAddItem("wall_card", deckBackground);
    },

    setupKingsOrderCards: function (cards) {
      /*
        There will always be 3 king's order cards.
        If there are less than 3 cards, the missing cards are replaced by a background card.
      */
      const uiItems = Array(3).fill(null).map((_, i) => {
        if (cards[i]) {
          return cards[i];
        } else {
          // Create background card with location_arg
          return { 
            type: 6, 
            type_arg: 6, 
            location_arg: i,
            id: `background_kingsorder_${i}`
          };
        }
      });
      
      this.uiItems.createItems("kingsorder_card", uiItems);
    },

    setupKingsFavourCards: function (cards) {
      /*
        There will always be 5 king's favour cards.
        If there are less than 5 cards, the missing cards are replaced by a background card.
      */
      const uiItems = Array(5).fill(null).map((_, i) => {
        if (cards[i]) {
          return cards[i];
        } else {
          // Create background card with location_arg
          return { 
            type: 10, 
            type_arg: 10, 
            location_arg: i,
            id: `background_kingsfavour_${i}`
          };
        }
      });
      
      this.uiItems.createItems("kingsfavour_card", uiItems);
    },

    // State functions
    // they are called by onClickUiItem when in the respective state
    pickPaladins: function () {
      var playerId = this.player_id;
      var selectedPaladins = this.uiItems.getSelectedItems();

      if (selectedPaladins.length < 3) {
        const paladin_cards = this.uiItems
          .getByUiType("paladin_card")
          .filter(function (c) {
            return (
              c.data.location == "paladin_hand" &&
              c.data.location_arg == playerId
            );
          });
        this.uiItems.makeSelectable(paladin_cards);
      } else if (selectedPaladins.length == 3) {
        this.sendPaladins(
          selectedPaladins[0].data.id,
          selectedPaladins[1].data.id,
          selectedPaladins[2].data.id,
        );
      }
    },

    pickTavern: function (uiItem) {
      if (uiItem.data.id) {
        this.onClickConfirmTavern(uiItem.data.id);
      }
    },

    hireInitialTownsfolk: function (uiItem) {
      if (uiItem.data.id) {
        this.sendHireTownsfolk(uiItem.data.id);
      }
    },

    // call game actions
    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState: function (stateName, args) {
      
      
      // Set current move for click handlers
      this.currentMove = stateName;
      this.currentMoveArgs = args.args;
      
      // Update player board attributes to reflect current state
      this.setPlayerBoardAttributes();
      
      // Reorder player areas with a small delay to ensure DOM is ready
      setTimeout(() => {
        this.reorderPlayerAreas();
      }, 100);
      
      // Setup action buttons for actual game actions
      this.setupActionButtons();
      
      // Setup paladin selection area separately
      this.setupPaladinSelectionArea();
      
      // Setup townsfolk selection for hireInitialTownsfolk state
      if (stateName === 'hireInitialTownsfolk') {
        setTimeout(() => {
          this.setupTownsfolkSelection();
        }, 200);
      }
      
      // Handle paladin selection state
      if (stateName === 'pickPaladins') {
        // Show the paladin selection area immediately
        const paladinSelectionArea = document.getElementById('paladin_selection_area');
        if (paladinSelectionArea) {
          paladinSelectionArea.style.display = 'block';
        }
        
        // Setup the paladin selection
        this.setupPaladinSelection();
      }
      
      // Handle tavern selection state
      if (stateName === 'pickTavern') {
        // Show the tavern selection area
        this.showTavernSelectionModal();
      }
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
       
        switch (stateName) {
            case 'pickPaladins':
                // Hide paladin selection area when leaving this state
                const paladinSelectionArea = document.getElementById('paladin_selection_area');
                if (paladinSelectionArea) {
                    paladinSelectionArea.style.display = 'none';
                }
                break;
            case 'pickTavern':
                // Hide tavern selection area when leaving this state
                this.hideTavernSelectionModal();
                break;
        }
    },

    // nUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      
      // Update action buttons visibility when current player changes
      this.updateActionButtons();
    },

    ///////////////////////////////////////////////////
    //// Utility methods

    /*
            
                Here, you can defines some utility methods that you can use everywhere in your javascript
                script.
            
            */

    moveUiItemToParentContainer: function (uiItem, parentContainer) {
      if (parentContainer != null) {
        // Special handling for player townsfolk cards
        if (uiItem.uiType == "townsfolk_uiitem" && uiItem.data.location == "playerboard_cards") {
          
          const playerboardCardsElement = document.getElementById(parentContainer);
          
          if (playerboardCardsElement) {
            dojo.place(uiItem.htmlNode, playerboardCardsElement);
            
            // Add some margin for spacing between cards
            dojo.setStyle(uiItem.htmlNode, 'margin', '5px');
            // Ensure the card is visible
            dojo.setStyle(uiItem.htmlNode, 'display', 'block');
            dojo.setStyle(uiItem.htmlNode, 'position', 'relative');
          } 
        } else if (
          uiItem.uiType == "townsfolk_uiitem" && parentContainer.startsWith("townsfolk_spot_") ||
          uiItem.uiType == "kingsorder_card" && parentContainer.startsWith("kingsorder_spot_") ||
          uiItem.uiType == "kingsfavour_card" && parentContainer.startsWith("kingsfavour_spot_") ||
          uiItem.uiType == "absolve_jar_uiitem" && parentContainer.startsWith("absolve_jar_") ||
          uiItem.uiType == "development_house_uiitem" && parentContainer.startsWith("development_house_") ||
          uiItem.uiType == "fort_piece_uiitem" && parentContainer.startsWith("fort_piece_") ||
          uiItem.uiType == "monk_piece_uiitem" && parentContainer.startsWith("monk_piece_")
        ) {
          const spotElement = document.getElementById(parentContainer);
          if (spotElement) {
            dojo.place(uiItem.htmlNode, spotElement);
          } 
        } 
        else {
          dojo.place(uiItem.htmlNode, parentContainer);
        }
      } 
    },

    getParentContainerForUiItem: function (uiItem) {
      var containerName = "";
      if (uiItem.uiType == "outsider") {
        containerName = "outsider_cards";
      }
      if (uiItem.uiType == "townsfolk_uiitem") {
        if (uiItem.data.location == "playerboard_cards") {
          containerName = "playerboard_cards_" + uiItem.data.location_arg;
        } else {
          // Place cards in their specific spots based on location_arg (position in display)
          containerName = "townsfolk_spot_" + uiItem.data.location_arg;
        }
      }
      if (uiItem.uiType == "paladin_card") {
        containerName = "paladin_cards";
      }
      if (uiItem.uiType == "tavern_card") {
        containerName = "tavern_cards";
      }
      if (uiItem.uiType == "wall_card" && uiItem.data.type_arg == 24) {
        containerName = "wall_deck";
      }
      if (uiItem.uiType == "kingsorder_card") {
        containerName = "kingsorder_spot_" + uiItem.data.location_arg;
      }
      if (uiItem.uiType == "kingsfavour_card") {
        containerName = "kingsfavour_spot_" + uiItem.data.location_arg;
      }
      if (uiItem.uiType == "absolve_jar_uiitem") {
        containerName = "absolve_jar_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "development_house_uiitem") {
        containerName = "development_house_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "fort_piece_uiitem") {
        containerName = "fort_piece_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "monk_piece_uiitem") {
        containerName = "monk_piece_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      return containerName;
    },

    drawUiItem: function (uiItem) {
      
      var parentContainer = this.getParentContainerForUiItem(uiItem);
      
      this.moveUiItemToParentContainer(uiItem, parentContainer);
    },

    drawUi: function () {
      for (var i = 0; i < this.uiItems.length; i++) {
        var uiItem = this.uiItems[i];
        this.drawUiItem(uiItem);
      }
    },

    updateParchment: function (playerId) {
      dojo.query(".panel_parchment").style("display", "none");
      dojo.setStyle($("panel_parchment_" + playerId), "display", "inline");
    },

    ///////////////////////////////////////////////////
    //// Player's action

    /*
            
        Here, you are defining methods to handle player's action (ex: results of mouse click on 
        game objects).
        
        Most of the time, these methods:
        _ check the action is possible at this game state.
        _ make a call to the game server
    
    */

    onClickUiItem: function (evt) {
      if (evt != null) {
        var uid = dojo
          .getAttr(evt.currentTarget, "data-uid")
          .replace("uid-", "");
        var uiItem = this.uiItems.getByUid(uid);
        if (uiItem.isSelectable && this[this.currentMove] != undefined) {
          this.uiItems.toggleSelection(uiItem);
          // calls State function for the respective state
          this[this.currentMove](uiItem);
        }
      }
    },

    onClickConfirmTavern: function (tavern_card_id) {
      this.checkAction("pickTavern");
      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/pickTavern.html",
        {
          lock: true,
          tavern_card_id: tavern_card_id,
        },
        this,
        function (result) {},
        function (error) {},
      );
    },

    sendPaladins: function (bottom_id, chosen_id, top_id) {
      this.checkAction("pickPaladins");
      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/pickPaladins.html",
        {
          lock: true,
          bottom_id: bottom_id,
          chosen_id: chosen_id,
          top_id: top_id,
        },
        this,
        function (result) {},
        function (error) {},
      );
    },

    sendHireTownsfolk: function (townsfolk_card_id) {
      this.checkAction("hireInitialTownsfolk");
      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/hireInitialTownsfolk.html",
        {
          lock: true,
          townsfolk_card_id: townsfolk_card_id,
        },
        this,
        function (result) {},
        function (error) {},
      );
    },

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
                setupNotifications:
                
                In this method, you associate each of your game notifications with your local method to handle it.
                
                Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                      your paladinsshipped.game.php file.
            
            */
    setupNotifications: function () {
      console.log("Setting up notifications...");
      
      // Townsfolk hiring notification
      dojo.subscribe("townsfolkHired", this, "notif_townsfolkHired");
      
      // Townsfolk slide animation notification
      dojo.subscribe("slideCards", this, "notif_slideCards");
      
      // Tavern card updates - intercept and remove selected cards
      dojo.subscribe("tavernCardsUpdated", this, "notif_tavernCardsUpdated");
      
      // Tavern display updates
      dojo.subscribe("tavernDisplayUpdated", this, "notif_tavernDisplayUpdated");
      
      // Paladin cards updates
      dojo.subscribe("paladinCards", this, "notif_paladinCards");
      
      // Player resources update notification
      dojo.subscribe("playerResourcesUpdated", this, "notif_playerResourcesUpdated");
      console.log("Subscribed to playerResourcesUpdated notification");
      
      // Other existing notifications...
      dojo.subscribe("revealTaverns", this, "notif_revealTaverns");
      dojo.subscribe("cleanupTaverns", this, "notif_cleanupTaverns");
    },

    // TODO: from this point and below, you can write your game notifications handling methods

    /*
            Example:
            
            notif_cardPlayed: function( notif )
            {
                
                
                // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
                
                // TODO: play the card in the user interface.
            },    
            
            */

    notif_moveParchment: function (notif) {
      this.updateParchment(notif.args.player_id);
    },

    notif_paladinCards: function (notif) {
      console.log("=== PALADIN CARDS NOTIFICATION ===");
      console.log("Notification received:", notif);
      console.log("Cards data:", notif.args.cards);
      console.log("Current player_id:", this.player_id);
      console.log("Current game state:", this.gamedatas.gamestate.name);
      
      // Update the client-side paladin hand data
      this.paladin_hand = notif.args.cards;
      
      // Create the UI items
      this.createPaladinUiItems(notif.args.cards);
      
      // Check if we're in the pickPaladins state and need to show the selection
      const currentState = this.gamedatas.gamestate.name;
      if (currentState === 'pickPaladins') {
        console.log("Currently in pickPaladins state, calling setupPaladinSelection");
        this.setupPaladinSelection();
      }
    },

    notif_revealTaverns: function (notif) {
      this.createTavernUiItems(notif.args.cards);
    },

    notif_cleanupTaverns: function (notif) {
      dojo.setStyle("tavernsSelection", "display", "none");
    },

    // Handle player resources updates (coins, provisions, workers, etc.)
    notif_playerResourcesUpdated: function (notif) {
      const player_id = notif.args.player_id;
      const player_data = notif.args.player_data;
      
      console.log(`Received playerResourcesUpdated notification for player ${player_id}:`, player_data);
      
      // Highlight the player's resource table briefly
      this.highlightPlayerResourceTable(player_id);
      
      // Update the resource table for this player
      this.updatePlayerResourceTable(player_id, player_data);
      
      // Log the update for debugging
      console.log(`Resource table updated for player ${player_id}`);
    },

    notif_townsfolkHired: function (notif) {
      const hiredCard = notif.args.card;
      const playerId = notif.args.player_id;
      
      // Find the source card in the display
      const townsfolkCards = this.uiItems.getByUiType("townsfolk_uiitem");
      const sourceCard = townsfolkCards.find(card => card.data.id == hiredCard.id);
      if (!sourceCard) {
        // Fallback to normal behavior
        hiredCard.location = "playerboard_cards";
        hiredCard.location_arg = playerId;
        this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
        return;
      }
      
      // Get positions BEFORE hiding the card
      const sourcePos = dojo.position(sourceCard.htmlNode);
      const destContainer = document.getElementById("playerboard_cards_" + playerId);
      const destPos = dojo.position(destContainer);
      
      
      
      // Check if positions are valid
      if (!sourcePos || !destPos || !destContainer) {
        // Fallback: just place the card directly
        hiredCard.location = "playerboard_cards";
        hiredCard.location_arg = playerId;
        hiredCard.isSelectable = false;
        this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
        return;
      }
      
      // Create a temporary card for animation
      const tempCard = sourceCard.htmlNode.cloneNode(true);
      tempCard.style.position = 'absolute';
      tempCard.style.zIndex = '1000';
      tempCard.style.pointerEvents = 'none';
      // Apply the same scaling as player cards
      tempCard.style.transform = 'scale(0.58)';
      tempCard.style.transformOrigin = 'top left';
      document.body.appendChild(tempCard);
      
      // Hide the original card and make it non-selectable
      dojo.setStyle(sourceCard.htmlNode, "display", "none");
      sourceCard.isSelectable = false;
      sourceCard.isSelected = false;
      
      // Disable selection of remaining cards
      const remainingCards = townsfolkCards.filter(card => card.data.id != hiredCard.id);
      this.uiItems.resetSelectable(remainingCards);
      
      // Animate to destination
      dojo.animateProperty({
        node: tempCard,
        properties: {
          top: { start: sourcePos.y, end: destPos.y },
          left: { start: sourcePos.x, end: destPos.x }
        },
        duration: 1000,
        easing: dojo.fx.easing.quadOut
      }).play();
      
      // Set up the completion callback using setTimeout
      setTimeout(() => {

        
        // Remove the temporary card
        tempCard.remove();
        
        // Reorder player areas FIRST to ensure correct visual placement
        
        this.reorderPlayerAreas();
        
        
        // Add the card to the player's board
        hiredCard.location = "playerboard_cards";
        hiredCard.location_arg = playerId;
        hiredCard.isSelectable = false; // Player cards should not be selectable
        const createdItems = this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
        
        
        
        // Draw the newly created card to the DOM
        
        this.drawUi();
        
        // Verify the card was placed correctly
        setTimeout(() => {
          const placedCards = this.uiItems.getByUiType("townsfolk_uiitem");

          
          // Look for the card in the player's area specifically
          const placedCard = placedCards.find(card => 
            card.data.id == hiredCard.id && 
            card.data.location == "playerboard_cards" && 
            card.data.location_arg == playerId
          );
        }, 100);
      }, 1000); // Match the animation duration
    },

    notif_playerResourcesUpdated: function(notif) {
      
      
      // Update the resource table for the specified player
      if (notif.args.player_id && notif.args.player_data) {
        this.updatePlayerResourceTable(notif.args.player_id, notif.args.player_data);
      } else if (notif.args.all_players) {
        // Update all player resource tables
        this.updateAllPlayerResourceTables();
      }
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// ACTION BUTTON HANDLERS
    ////////////

    onPass: function() {
      this.ajaxcall('/paladinsshipped/paladinsshipped/pass.html', {}, this, function(result) {}, function(is_error) {});
    },

    onPray: function() {
      this.showWorkerSelectionMenu('pray', { action_space: 'pray' });
    },

    onRecruitDiscard: function() {
      this.showWorkerSelectionMenu('recruitDiscard', { townsfolk_card_id: null });
    },

    onRecruitHire: function() {
      this.showWorkerSelectionMenu('recruitHire', { townsfolk_card_id: null, use_debt: false });
    },

    onDevelop: function() {
      this.showWorkerSelectionMenu('develop', { action_space: 'develop', workshop_position: 'left' });
    },

    onHunt: function() {
      this.showWorkerSelectionMenu('hunt', {});
    },

    onTrade: function() {
      this.showWorkerSelectionMenu('trade', {});
    },

    onConspire: function() {
      this.showWorkerSelectionMenu('conspire', {});
    },

    onCommission: function() {
      this.showWorkerSelectionMenu('commission', { board_position: null });
    },

    onFortify: function() {
      this.showWorkerSelectionMenu('fortify', {});
    },

    onGarrison: function() {
      this.showWorkerSelectionMenu('garrison', { board_position: null });
    },

    onAbsolve: function() {
      this.showWorkerSelectionMenu('absolve', { jar_position: 'pay_debt' });
    },

    onAttack: function() {
      this.showWorkerSelectionMenu('attack', { outsider_card_id: null, silver_cost: 0 });
    },

    onConvert: function() {
      this.showWorkerSelectionMenu('convert', { outsider_card_id: null });
    },

    onKingsFavour: function() {
      this.showWorkerSelectionMenu('kingsFavour', { kings_favour_id: null });
    },



    hasPaladinsToSelect: function() {
      // Check if the current player has paladin cards in their hand
      const paladinCards = this.uiItems.getByUiType("paladin_card");
      const currentPlayerId = this.player_id;
      
      return paladinCards.some(card => 
        card.data.location === "paladinsSelection" && 
        card.data.location_arg === currentPlayerId
      );
    },



    togglePaladinSelection: function(cardElement, cardData) {
      const cardId = cardData.data.id;
      const isSelected = dojo.hasClass(cardElement, 'selected');
      
      if (isSelected) {
        // Deselect card
        dojo.removeClass(cardElement, 'selected');
        this.selectedPaladins = this.selectedPaladins.filter(id => id !== cardId);
      } else {
        // Select card (max 3)
        if (this.selectedPaladins.length < 3) {
          dojo.addClass(cardElement, 'selected');
          this.selectedPaladins.push(cardId);
        }
      }
      
      this.updatePaladinSelectionCounter();
    },

    setupDropZones: function() {
      const positions = ['top', 'middle', 'bottom'];
      
      positions.forEach(position => {
        const dropZone = document.getElementById(`paladin_${position}_position`);
        if (dropZone) {
          dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
          dropZone.addEventListener('drop', (e) => this.handleDrop(e, position));
          dropZone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
          dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        }
      });
    },

    handleDragStart: function(e, card) {
      e.dataTransfer.setData('text/plain', card.data.id);
      e.dataTransfer.effectAllowed = 'move';
      dojo.addClass(e.target, 'dragging');
    },

    handleDragEnd: function(e) {
      dojo.removeClass(e.target, 'dragging');
    },

    handleDragOver: function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },

    handleDragEnter: function(e) {
      e.preventDefault();
      dojo.addClass(e.target, 'drag_over');
    },

    handleDragLeave: function(e) {
      dojo.removeClass(e.target, 'drag_over');
    },

    handleDrop: function(e, position) {
      e.preventDefault();
      dojo.removeClass(e.target, 'drag_over');
      
      const cardId = e.dataTransfer.getData('text/plain');
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      
      if (cardElement && e.target.classList.contains('paladin_position_slot')) {
        // Remove card from available cards
        cardElement.remove();
        
        // Add card to the position
        const cardClone = cardElement.cloneNode(true);
        dojo.removeClass(cardClone, 'dragging');
        dojo.addClass(cardClone, 'positioned');
        cardClone.draggable = false;
        
        // Set the card to have relative positioning so the remove button positions correctly
        cardClone.style.position = 'relative';
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove_card_btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeCardFromPosition(position, cardId);
        cardClone.appendChild(removeBtn);
        
        e.target.innerHTML = '';
        e.target.appendChild(cardClone);
        dojo.addClass(e.target, 'has_card');
        
        // Update selection
        this.selectedPaladins[position] = cardId;
        this.updatePaladinSelectionCounter();
      }
    },

    removeCardFromPosition: function(position, cardId) {
      const positionElement = document.getElementById(`paladin_${position}_position`);
      const availableContainer = document.getElementById('paladin_cards_inline');
      
      if (positionElement && availableContainer) {
        // Get the positioned card before removing it
        const positionedCard = positionElement.querySelector('.positioned');
        
        // Remove from position
        positionElement.innerHTML = '';
        dojo.removeClass(positionElement, 'has_card');
        
        // Add back to available cards using the positioned card data
        if (positionedCard) {
          const cardClone = positionedCard.cloneNode(true);
          dojo.removeClass(cardClone, 'positioned');
          dojo.addClass(cardClone, 'draggable');
          cardClone.draggable = true;
          
          // Remove the remove button if it exists
          const removeBtn = cardClone.querySelector('.remove_card_btn');
          if (removeBtn) removeBtn.remove();
          
          // Reset positioning styles
          cardClone.style.position = '';
          
          // Re-add drag event listeners
          cardClone.addEventListener('dragstart', (e) => this.handleDragStart(e, {data: {id: cardId}}));
          cardClone.addEventListener('dragend', (e) => this.handleDragEnd(e));
          
          availableContainer.appendChild(cardClone);
        }
        
        // Update selection
        this.selectedPaladins[position] = null;
        this.updatePaladinSelectionCounter();
      }
    },

    updatePaladinSelectionCounter: function() {
      const confirmBtn = document.getElementById('confirm_paladin_selection');
      if (confirmBtn) {
        const selectedCount = Object.values(this.selectedPaladins).filter(id => id !== null).length;
        confirmBtn.innerHTML = `Confirm Selection (${selectedCount}/3)`;
        confirmBtn.disabled = selectedCount !== 3;
      }
    },

    confirmPaladinSelection: function() {
      // Check if all three positions are filled
      const topCardId = this.selectedPaladins.top;
      const middleCardId = this.selectedPaladins.middle;
      const bottomCardId = this.selectedPaladins.bottom;
      
      if (!topCardId || !middleCardId || !bottomCardId) {
        return;
      }
      
      // Submit the selection to the server
      this.ajaxcall('/paladinsshipped/paladinsshipped/selectPaladins.html', {
        top_paladin_id: topCardId,
        middle_paladin_id: middleCardId,
        bottom_paladin_id: bottomCardId
      }, this, function(result) {
      });
    },



    //////////////////////////////////////////////////////////////////////////////
    //////////// UI HELPER METHODS
    ////////////

    setupActionButtons: function() {
      const actionContainer = document.getElementById('action_buttons');
      if (!actionContainer) return;

      const currentState = this.gamedatas.gamestate.name;
      const isMyTurn = this.isCurrentPlayerActive();

      // Clear existing content
      actionContainer.innerHTML = '';

      // Only show action buttons during actual game action states (not paladin selection)
      if (currentState === 'playerAction' && isMyTurn) {
        // Create header
        const header = document.createElement('div');
        header.className = 'action_buttons_header';
        header.innerHTML = '<h3>Your Turn - Available Actions</h3>';
        actionContainer.appendChild(header);

        // Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'action_buttons_container';
        actionContainer.appendChild(buttonsContainer);

        // Define action buttons for actual game actions
        const actionButtons = [
          { id: 'conspire', text: 'Conspire', action: 'onConspire' },
          { id: 'garrison', text: 'Garrison', action: 'onGarrison' },
          { id: 'commission', text: 'Commission', action: 'onCommission' }
        ];

        // Show all action buttons
        actionButtons.forEach(button => {
          const btn = document.createElement('button');
          btn.id = button.id + '_btn';
          btn.className = 'action_button';
          btn.innerHTML = button.text;
          btn.onclick = () => this[button.action]();
          buttonsContainer.appendChild(btn);
        });

        // Show action buttons area
        dojo.setStyle(actionContainer, 'display', 'block');
      } else {
        // Hide action buttons area during non-action states
        dojo.setStyle(actionContainer, 'display', 'none');
      }
    },

    setupPaladinSelectionArea: function() {
      const paladinSelectionArea = document.getElementById('paladin_selection_area');
      if (!paladinSelectionArea) return;

      const currentState = this.gamedatas.gamestate.name;

      if (currentState === 'pickPaladins') {
        dojo.setStyle(paladinSelectionArea, 'display', 'block');
        // Add a small delay to ensure DOM is ready and cards are created
        setTimeout(() => {
          this.setupPaladinSelection();
        }, 500);
      } else {
        dojo.setStyle(paladinSelectionArea, 'display', 'none');
      }
    },

    updateActionButtons: function() {
      // Enable/disable action buttons based on current game state and player resources
      // This will be called when the game state changes
      const isMyTurn = this.isCurrentPlayerActive();
      
      // Get all action buttons
      const actionButtons = document.querySelectorAll('.action_button');
      actionButtons.forEach(btn => {
        const currentState = this.gamedatas.gamestate.name;
        
        // Special handling for paladin selection button
        if (btn.id === 'paladinSelection_btn') {
          // During pickPaladins state, the button should always be enabled for the current player
          btn.disabled = !isMyTurn || currentState !== 'pickPaladins';
        } else {
          btn.disabled = !isMyTurn;
        }
        
        // Add visual feedback for available actions
        if (isMyTurn) {
          dojo.addClass(btn, 'available');
        } else {
          dojo.removeClass(btn, 'available');
        }
      });
      
      // Show/hide the entire action buttons area based on game state AND current player
      const actionContainer = document.getElementById('action_buttons');
      if (actionContainer) {
        const currentState = this.gamedatas.gamestate.name;
        // Show action buttons if we're in playerAction state AND it's the current player's turn
        // OR if we're in pickPaladins state AND it's the current player's turn
        const shouldShow = (currentState === 'playerAction' || currentState === 'pickPaladins') && isMyTurn;
        dojo.setStyle(actionContainer, 'display', shouldShow ? 'flex' : 'none');
      }
      
      // Update individual button states based on action availability
      if (isMyTurn) {
        this.updateIndividualActionButtons();
      }
    },

    updateIndividualActionButtons: function() {
      const currentPlayerId = this.player_id;
      const actionSpaces = this.gamedatas.action_spaces[currentPlayerId];
      
      if (!actionSpaces) return;
      
      // Check conspire action availability
      const conspireBtn = document.getElementById('conspire_btn');
      if (conspireBtn) {
        if (actionSpaces.conspire && actionSpaces.conspire.used) {
          conspireBtn.disabled = true;
          conspireBtn.classList.add('unavailable');
          conspireBtn.title = 'Conspire action already used this round';
        } else {
          conspireBtn.disabled = false;
          conspireBtn.classList.remove('unavailable');
          conspireBtn.title = 'Conspire - Gain 1 Criminal and 1 Suspicion';
        }
      }
      
      // Check commission action availability
      const commissionBtn = document.getElementById('commission_btn');
      if (commissionBtn) {
        if (actionSpaces.commission && actionSpaces.commission.used) {
          commissionBtn.disabled = true;
          commissionBtn.classList.add('unavailable');
          commissionBtn.title = 'Commission action already used this round';
        } else {
          commissionBtn.disabled = false;
          commissionBtn.classList.remove('unavailable');
          commissionBtn.title = 'Commission - Place a monk (requires 0 Faith, 1-3 Provisions based on count)';
        }
      }
      
      // Check fortify action availability
      const fortifyBtn = document.getElementById('fortify_btn');
      if (fortifyBtn) {
        if (actionSpaces.fortify && actionSpaces.fortify.used) {
          fortifyBtn.disabled = true;
          fortifyBtn.classList.add('unavailable');
          fortifyBtn.title = 'Fortify action already used this round';
        } else {
          fortifyBtn.disabled = false;
          fortifyBtn.classList.remove('unavailable');
          fortifyBtn.title = 'Fortify - Build a wall (requires 2 Influence, 1 Provision)';
        }
      }
      
      // Check garrison action availability
      const garrisonBtn = document.getElementById('garrison_btn');
      if (garrisonBtn) {
        if (actionSpaces.garrison && actionSpaces.garrison.used) {
          garrisonBtn.disabled = true;
          garrisonBtn.classList.add('unavailable');
          garrisonBtn.title = 'Garrison action already used this round';
        } else {
          garrisonBtn.disabled = false;
          garrisonBtn.classList.remove('unavailable');
          garrisonBtn.title = 'Garrison - Place an outpost (requires 2 Strength, 1 Provision)';
        }
      }
      
      // Check absolve action availability
      const absolveBtn = document.getElementById('absolve_btn');
      if (absolveBtn) {
        if (actionSpaces.absolve && actionSpaces.absolve.used) {
          absolveBtn.disabled = true;
          absolveBtn.classList.add('unavailable');
          absolveBtn.title = 'Absolve action already used this round';
        } else {
          absolveBtn.disabled = false;
          absolveBtn.classList.remove('unavailable');
          absolveBtn.title = 'Absolve - Absolve sins (requires 2 Influence, 2 Silver)';
        }
      }
      
      // Check attack action availability
      const attackBtn = document.getElementById('attack_btn');
      if (attackBtn) {
        if (actionSpaces.attack && actionSpaces.attack.used) {
          attackBtn.disabled = true;
          attackBtn.classList.add('unavailable');
          attackBtn.title = 'Attack action already used this round';
        } else {
          attackBtn.disabled = false;
          attackBtn.classList.remove('unavailable');
          attackBtn.title = 'Attack - Attack an outsider (requires 2 Strength)';
        }
      }
      
      // Check convert action availability
      const convertBtn = document.getElementById('convert_btn');
      if (convertBtn) {
        if (actionSpaces.convert && actionSpaces.convert.used) {
          convertBtn.disabled = true;
          convertBtn.classList.add('unavailable');
          convertBtn.title = 'Convert action already used this round';
        } else {
          convertBtn.disabled = false;
          convertBtn.classList.remove('unavailable');
          convertBtn.title = 'Convert - Convert an outsider (requires 2 Faith, 2 Silver)';
        }
      }
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// NOTIFICATION HANDLERS FOR ACTIONS
    ////////////

    notif_pass: function(notif) {
      
      // Update UI to show player passed
    },

    notif_pray: function(notif) {
      
      // Update UI to show prayer action
    },

    notif_recruitDiscard: function(notif) {
      
      // Update UI to show townsfolk discard
    },

    notif_recruitHire: function(notif) {
      
      // Update UI to show townsfolk hire
    },

    notif_develop: function(notif) {
      
      // Update UI to show development
    },

    notif_hunt: function(notif) {
      
      // Update UI to show hunt results
    },

    notif_trade: function(notif) {
      
      // Update UI to show trade results
    },

    notif_conspire: function(notif) {
      
      // Update UI to show conspiracy
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_clearActionSpaces: function(notif) {
      
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_initializeTaxSupply: function(notif) {
      
      // Update tax supply display if needed
    },

    notif_inquisition: function(notif) {
      
      // Update UI to show inquisition results
    },

    notif_commission: function(notif) {
      
      // Update UI to show monk commission
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_fortify: function(notif) {
      
      // Update UI to show wall building
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_garrison: function(notif) {
      
      // Update UI to show outpost placement
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_absolve: function(notif) {
      
      // Update UI to show absolution
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_attack: function(notif) {
      
      // Update UI to show attack
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_convert: function(notif) {
      
      // Update UI to show conversion
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_fortify: function(notif) {
      
      // Update UI to show fortification
    },

    notif_garrison: function(notif) {
      
      // Update UI to show outpost garrison
    },

    notif_absolve: function(notif) {
      // Update UI to show absolution
    },

    notif_attack: function(notif) {
      // Update UI to show attack
    },

    notif_convert: function(notif) {
      // Update UI to show conversion
    },

    notif_kingsFavour: function(notif) {
      // Update UI to show King's Favour use
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// WORKER SELECTION MENU
    ////////////

    showWorkerSelectionMenu: function(actionType, actionParams) {
      // Store the current action being performed
      this.currentAction = {
        type: actionType,
        params: actionParams,
        selectedWorkers: []
      };

      // Get worker requirements for this action
      const requirements = this.getWorkerRequirements(actionType);
      
      // Create and show the worker selection modal
      this.createWorkerSelectionModal(actionType, requirements);
    },

    getWorkerRequirements: function(actionType) {
      // Define worker requirements for each action type
      const requirements = {
        'pass': { workers: 0, specific: [] },
        'pray': { workers: 1, specific: ['black_worker'] },
        'recruitDiscard': { workers: 1, specific: [] },
        'recruitHire': { workers: 2, specific: ['red_worker'] },
        'develop': { workers: 2, specific: [] },
        'hunt': { workers: 2, specific: ['green_worker'] },
        'trade': { workers: 2, specific: ['blue_worker'] },
        'conspire': { workers: 1, specific: [] },
        'commission': { workers: 3, specific: ['green_worker', 'black_worker'] },
        'fortify': { workers: 3, specific: ['blue_worker', 'green_worker'] },
        'garrison': { workers: 3, specific: ['blue_worker', 'red_worker'] },
        'absolve': { workers: 3, specific: ['black_worker', 'blue_worker'] },
        'attack': { workers: 3, specific: ['green_worker', 'red_worker'] },
        'convert': { workers: 3, specific: ['red_worker', 'black_worker'] },
        'kingsFavour': { workers: 1, specific: [] }
      };

      return requirements[actionType] || { workers: 0, specific: [] };
    },

    createWorkerSelectionModal: function(actionType, requirements) {
      // Remove existing modal if any
      const existingModal = document.getElementById('worker_selection_modal');
      if (existingModal) {
        existingModal.remove();
      }

      // Create modal container
      const modal = document.createElement('div');
      modal.id = 'worker_selection_modal';
      modal.className = 'worker_selection_modal';
      
      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.className = 'worker_selection_content';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'worker_selection_header';
      header.innerHTML = `<h3>Select Workers for ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}</h3>`;
      modalContent.appendChild(header);
      
      // Add requirements info
      const requirementsInfo = document.createElement('div');
      requirementsInfo.className = 'worker_requirements_info';
      requirementsInfo.innerHTML = `
        <p><strong>Required:</strong> ${requirements.workers} worker(s)</p>
        ${requirements.specific.length > 0 ? `<p><strong>Specific:</strong> ${requirements.specific.join(', ')}</p>` : ''}
      `;
      modalContent.appendChild(requirementsInfo);
      
      // Add worker selection area
      const workerSelection = document.createElement('div');
      workerSelection.className = 'worker_selection_area';
      workerSelection.id = 'worker_selection_area';
      modalContent.appendChild(workerSelection);
      
      // Add action buttons
      const actionButtons = document.createElement('div');
      actionButtons.className = 'worker_selection_actions';
      
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'action_button primary';
      confirmBtn.innerHTML = 'Confirm Action';
      confirmBtn.onclick = () => this.confirmWorkerSelection();
      actionButtons.appendChild(confirmBtn);
      
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'action_button secondary';
      cancelBtn.innerHTML = 'Cancel';
      cancelBtn.onclick = () => this.hideWorkerSelectionModal();
      actionButtons.appendChild(cancelBtn);
      
      modalContent.appendChild(actionButtons);
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Populate available workers
      this.populateAvailableWorkers();
    },

    populateAvailableWorkers: function() {
      const workerSelectionArea = document.getElementById('worker_selection_area');
      if (!workerSelectionArea) return;

      // Clear existing content
      workerSelectionArea.innerHTML = '';

      // Get current player's workers from game data
      const availableWorkers = this.getCurrentPlayerWorkers();
      
      if (availableWorkers.length === 0) {
        workerSelectionArea.innerHTML = '<p style="text-align: center; color: #6c757d; font-style: italic;">No workers available</p>';
        return;
      }

      // Create worker selection cards
      availableWorkers.forEach(worker => {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker_selection_card';
        workerCard.dataset.workerId = worker.id;
        workerCard.dataset.workerType = worker.type;
        
        workerCard.innerHTML = `
          <div class="worker_card_content" style="background-color: ${worker.color}">
            <div class="worker_name">${worker.name}</div>
            <div class="worker_type">${worker.type}</div>
          </div>
        `;
        
        workerCard.onclick = () => this.toggleWorkerSelection(workerCard, worker);
        workerSelectionArea.appendChild(workerCard);
      });
    },

    toggleWorkerSelection: function(workerCard, worker) {
      const isSelected = workerCard.classList.contains('selected');
      
      if (isSelected) {
        // Deselect worker
        workerCard.classList.remove('selected');
        this.currentAction.selectedWorkers = this.currentAction.selectedWorkers.filter(w => w.id !== worker.id);
      } else {
        // Check if we can select more workers
        const requirements = this.getWorkerRequirements(this.currentAction.type);
        if (this.currentAction.selectedWorkers.length < requirements.workers) {
          // Select worker
          workerCard.classList.add('selected');
          this.currentAction.selectedWorkers.push(worker);
        }
      }
      
      // Update confirm button state
      this.updateConfirmButtonState();
    },

    updateConfirmButtonState: function() {
      const confirmBtn = document.querySelector('#worker_selection_modal .action_button.primary');
      if (!confirmBtn) return;

      const requirements = this.getWorkerRequirements(this.currentAction.type);
      const canConfirm = this.currentAction.selectedWorkers.length === requirements.workers;
      
      confirmBtn.disabled = !canConfirm;
      if (canConfirm) {
        confirmBtn.classList.add('available');
      } else {
        confirmBtn.classList.remove('available');
      }
    },

    confirmWorkerSelection: function() {
      if (!this.currentAction || this.currentAction.selectedWorkers.length === 0) {
        return;
      }

      // Prepare the action parameters with selected workers
      const actionParams = { ...this.currentAction.params };
      
      // Add worker IDs to the parameters
      this.currentAction.selectedWorkers.forEach((worker, index) => {
        actionParams[`worker${index + 1}_id`] = worker.id;
      });

      // Submit the action
      this.submitAction(this.currentAction.type, actionParams);
      
      // Hide the modal
      this.hideWorkerSelectionModal();
    },

    submitAction: function(actionType, params) {
      // Map action types to their corresponding AJAX calls
      const actionMap = {
        'pass': () => this.ajaxcall('/paladinsshipped/paladinsshipped/pass.html', {}, this, function(result) {}, function(is_error) {}),
        'pray': () => this.ajaxcall('/paladinsshipped/paladinsshipped/pray.html', { action_space: params.action_space }, this, function(result) {}, function(is_error) {}),
        'recruitDiscard': () => this.ajaxcall('/paladinsshipped/paladinsshipped/recruitDiscard.html', { worker_id: params.worker1_id, townsfolk_card_id: params.townsfolk_card_id }, this, function(result) {}, function(is_error) {}),
        'recruitHire': () => this.ajaxcall('/paladinsshipped/paladinsshipped/recruitHire.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, townsfolk_card_id: params.townsfolk_card_id, use_debt: params.use_debt }, this, function(result) {}, function(is_error) {}),
        'develop': () => this.ajaxcall('/paladinsshipped/paladinsshipped/develop.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, action_space: params.action_space, workshop_position: params.workshop_position }, this, function(result) {}, function(is_error) {}),
        'hunt': () => this.ajaxcall('/paladinsshipped/paladinsshipped/hunt.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id }, this, function(result) {}, function(is_error) {}),
        'trade': () => this.ajaxcall('/paladinsshipped/paladinsshipped/trade.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id }, this, function(result) {}, function(is_error) {}),
        'conspire': () => this.ajaxcall('/paladinsshipped/paladinsshipped/conspire.html', { worker_id: params.worker1_id }, this, function(result) {}, function(is_error) {}),
        'commission': () => this.ajaxcall('/paladinsshipped/paladinsshipped/commission.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id, board_position: params.board_position }, this, function(result) {}, function(is_error) {}),
        'fortify': () => this.ajaxcall('/paladinsshipped/paladinsshipped/fortify.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id }, this, function(result) {}, function(is_error) {}),
        'garrison': () => this.ajaxcall('/paladinsshipped/paladinsshipped/garrison.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id, board_position: params.board_position }, this, function(result) {}, function(is_error) {}),
        'absolve': () => this.ajaxcall('/paladinsshipped/paladinsshipped/absolve.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id, jar_position: params.jar_position }, this, function(result) {}, function(is_error) {}),
        'attack': () => this.ajaxcall('/paladinsshipped/paladinsshipped/attack.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id, outsider_card_id: params.outsider_card_id, silver_cost: params.silver_cost }, this, function(result) {}, function(is_error) {}),
        'convert': () => this.ajaxcall('/paladinsshipped/paladinsshipped/convert.html', { worker1_id: params.worker1_id, worker2_id: params.worker2_id, worker3_id: params.worker3_id, outsider_card_id: params.outsider_card_id }, this, function(result) {}, function(is_error) {}),
        'kingsFavour': () => this.ajaxcall('/paladinsshipped/paladinsshipped/kingsFavour.html', { worker_id: params.worker1_id, kings_favour_id: params.kings_favour_id }, this, function(result) {}, function(is_error) {})
      };

      // Execute the action
      if (actionMap[actionType]) {
        actionMap[actionType]();
      }
    },

    hideWorkerSelectionModal: function() {
      const modal = document.getElementById('worker_selection_modal');
      if (modal) {
        modal.remove();
      }
      this.currentAction = null;
    },

    getCurrentPlayerWorkers: function() {
      // Get the current player's workers from the game data
      const currentPlayerId = this.player_id;
      
      if (!this.gamedatas || !this.gamedatas.players) {
        return [];
      }
      
      const playerData = this.gamedatas.players[currentPlayerId];
      
      if (!playerData) {
        return [];
      }

      const workerTypes = [
        { type: 'white_worker', name: 'Labourer', color: '#ffffff' },
        { type: 'green_worker', name: 'Scout', color: '#28a745' },
        { type: 'red_worker', name: 'Fighter', color: '#dc3545' },
        { type: 'blue_worker', name: 'Merchant', color: '#007bff' },
        { type: 'black_worker', name: 'Cleric', color: '#343a40' },
        { type: 'purple_worker', name: 'Criminal', color: '#6f42c1' }
      ];

      const availableWorkers = [];
      let workerId = 1;
      
      workerTypes.forEach(workerType => {
        const count = parseInt(playerData[workerType.type]) || 0;
        for (let i = 0; i < count; i++) {
          availableWorkers.push({
            id: workerId++,
            type: workerType.type,
            name: workerType.name,
            color: workerType.color
          });
        }
      });

      return availableWorkers;
    },

    updatePlayerResourceTable: function(player_id, player_data) {
      console.log(`Updating resource table for player ${player_id}:`, player_data);
      
      // Update resource values in the table
      const resourceElements = {
        'provisions': player_data.provision || 0,
        'coins': player_data.coin || 0,
        'white_workers': player_data.white_worker || 0,
        'green_workers': player_data.green_worker || 0,
        'blue_workers': player_data.blue_worker || 0,
        'red_workers': player_data.red_worker || 0,
        'black_workers': player_data.black_worker || 0,
        'purple_workers': player_data.purple_worker || 0,
        'faith': player_data.faith || 0,
        'strength': player_data.strength || 0,
        'influence': player_data.influence || 0,
        'paid_debt': player_data.paid_debt || 0,
        'unpaid_debt': player_data.unpaid_debt || 0
      };

      console.log(`Resource elements to update:`, resourceElements);

      // Update each resource element with visual feedback
      for (const [resource, value] of Object.entries(resourceElements)) {
        const element = document.getElementById(`${resource}_${player_id}`);
        if (element) {
          const oldValue = parseInt(element.textContent) || 0;
          const newValue = value;
          
          console.log(`Updating ${resource}_${player_id} from ${oldValue} to ${newValue}`);
          
          // Only animate if the value actually changed
          if (oldValue !== newValue) {
            this.animateResourceChange(element, oldValue, newValue, resource);
          } else {
            element.textContent = newValue;
          }
        } else {
          console.warn(`Element ${resource}_${player_id} not found`);
        }
      }
    },

    // Method to update all player resource tables (called when game state changes)
    updateAllPlayerResourceTables: function() {
      if (this.gamedatas && this.gamedatas.players) {
        for (const player_id in this.gamedatas.players) {
          this.updatePlayerResourceTable(player_id, this.gamedatas.players[player_id]);
        }
      }
    },

    // Animate resource changes with visual feedback
    animateResourceChange: function(element, oldValue, newValue, resourceType) {
      // Add highlight class for visual feedback
      element.classList.add('resource-update-highlight');
      
      // Determine if this is a gain or loss
      const isGain = newValue > oldValue;
      const changeAmount = Math.abs(newValue - oldValue);
      
      // Add appropriate CSS class for gain/loss
      if (isGain) {
        element.classList.add('resource-gain');
        element.classList.remove('resource-loss');
      } else {
        element.classList.add('resource-loss');
        element.classList.remove('resource-gain');
      }
      
      // Show floating change indicator for significant changes
      if (changeAmount > 0) {
        this.showResourceChangeIndicator(element, changeAmount, isGain);
      }
      
      // Animate the counting effect
      this.animateCount(element, oldValue, newValue, () => {
        // Remove highlight classes after animation
        setTimeout(() => {
          element.classList.remove('resource-update-highlight', 'resource-gain', 'resource-loss');
        }, 500);
      });
    },

    // Animate counting from old value to new value
    animateCount: function(element, startValue, endValue, callback) {
      const duration = 800; // Animation duration in milliseconds
      const steps = 20; // Number of steps in the animation
      const stepDuration = duration / steps;
      const valueDiff = endValue - startValue;
      const valueStep = valueDiff / steps;
      
      let currentStep = 0;
      
      const animateStep = () => {
        if (currentStep >= steps) {
          element.textContent = endValue;
          if (callback) callback();
          return;
        }
        
        currentStep++;
        const currentValue = Math.round(startValue + (valueStep * currentStep));
        element.textContent = currentValue;
        
        setTimeout(animateStep, stepDuration);
      };
      
      animateStep();
    },

    // Highlight the player's resource table to draw attention
    highlightPlayerResourceTable: function(player_id) {
      const playerBoard = document.getElementById('playerboard_' + player_id);
      if (playerBoard) {
        // Find the resource table within this player board
        const resourceTable = playerBoard.querySelector('.player_resources_table');
        if (resourceTable) {
          // Add highlight class
          resourceTable.classList.add('player-resource-update');
          
          // Remove highlight after animation
          setTimeout(() => {
            resourceTable.classList.remove('player-resource-update');
          }, 1500);
        }
      }
    },

    // Show floating indicator for resource changes
    showResourceChangeIndicator: function(element, changeAmount, isGain) {
      // Create floating indicator element
      const indicator = document.createElement('div');
      indicator.className = `resource-change-indicator ${isGain ? 'gain' : 'loss'}`;
      indicator.textContent = (isGain ? '+' : '-') + changeAmount;
      
      // Position it relative to the resource element
      const rect = element.getBoundingClientRect();
      indicator.style.position = 'absolute';
      indicator.style.left = (rect.left + rect.width / 2) + 'px';
      indicator.style.top = (rect.top - 20) + 'px';
      indicator.style.zIndex = '1000';
      
      // Add to body
      document.body.appendChild(indicator);
      
      // Animate and remove
      setTimeout(() => {
        indicator.remove();
      }, 1500);
    },

    // Function to set data attributes on player boards for identification
    setPlayerBoardAttributes: function() {
      if (!this.gamedatas || !this.gamedatas.players) {
        return;
      }

      const currentUserId = this.player_id;
      const activePlayerId = this.gamedatas.gamestate.active_player;

      // Set attributes for each player board
      for (const playerId in this.gamedatas.players) {
        const playerBoard = document.getElementById('playerboard_' + playerId);
        const playerNameHeader = document.getElementById('player_name_' + playerId);
        
        if (playerBoard) {
          // Set current user attribute
          if (playerId == currentUserId) {
            playerBoard.setAttribute('data-current-user', 'true');
          } else {
            playerBoard.setAttribute('data-current-user', 'false');
          }

          // Set active player attribute
          if (playerId == activePlayerId) {
            playerBoard.setAttribute('data-active-player', 'true');
          } else {
            playerBoard.setAttribute('data-active-player', 'false');
          }
        }
        
        // Update player name header with actual player name
        if (playerNameHeader) {
          const playerData = this.gamedatas.players[playerId];
          const playerName = playerData ? playerData.name : 'Unknown Player';
          const headerText = `${playerName} (ID: ${playerId})`;
          
          // Add indicators for current user and active player
          let indicators = '';
          if (playerId == currentUserId) {
            indicators += ' [YOU]';
          }
          if (playerId == activePlayerId) {
            indicators += ' [ACTIVE]';
          }
          
          playerNameHeader.querySelector('h3').textContent = headerText + indicators;
          
          // Apply player color to the header
          if (playerData && playerData.color) {
            const playerColor = '#' + playerData.color;
            
            // Set the background color to the player's color
            playerNameHeader.style.background = `linear-gradient(135deg, ${playerColor}, ${this.darkenColor(playerColor, 0.2)})`;
            
            // Adjust text color for better contrast
            const textColor = this.getContrastColor(playerColor);
            playerNameHeader.style.color = textColor;
            playerNameHeader.querySelector('h3').style.color = textColor;
          }
          
        }
      }
    },

    // Function to reorder player areas so current user appears first
    reorderPlayerAreas: function() {
      if (!this.gamedatas || !this.gamedatas.players) {
        return;
      }

      const playersBoardContainer = document.getElementById('playersBoardContainer');
      if (!playersBoardContainer) {
        return;
      }

      // Get the current user's player ID (not the active player)
      const currentUserId = this.player_id;
      if (!currentUserId) {
        return;
      }

      // Check if we already reordered for this user (convert to string for comparison)
      if (this.lastReorderedUser === String(currentUserId)) {
        return;
      }

      // Get all player board elements
      const playerBoards = playersBoardContainer.querySelectorAll('.playerboard');
      
      if (playerBoards.length <= 1) {
        return; // No need to reorder if there's only one player
      }

      // Create the desired order: current user first, then others in turn order
      const allPlayerIds = Object.keys(this.gamedatas.players);
      const desiredOrder = [String(currentUserId)];
      
      // Add other players in turn order (clockwise from current user)
      const currentUserIndex = allPlayerIds.indexOf(String(currentUserId));
      
      for (let i = 1; i < allPlayerIds.length; i++) {
        const nextIndex = (currentUserIndex + i) % allPlayerIds.length;
        desiredOrder.push(allPlayerIds[nextIndex]);
      }

      // Reorder the player boards
      desiredOrder.forEach((playerId, index) => {
        const playerBoard = document.getElementById('playerboard_' + playerId);
        if (playerBoard) {
          playersBoardContainer.appendChild(playerBoard);
        } else {
        }
      });

      // Update the order tracking (store as string)
      this.lastReorderedUser = String(currentUserId);
      
    },

    // Helper function to darken a color
    darkenColor: function(hexColor, factor) {
      // Remove the # if present
      hexColor = hexColor.replace('#', '');
      
      // Parse the hex color
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      
      // Darken by the factor
      const newR = Math.max(0, Math.floor(r * (1 - factor)));
      const newG = Math.max(0, Math.floor(g * (1 - factor)));
      const newB = Math.max(0, Math.floor(b * (1 - factor)));
      
      // Convert back to hex
      return '#' + newR.toString(16).padStart(2, '0') + 
                   newG.toString(16).padStart(2, '0') + 
                   newB.toString(16).padStart(2, '0');
    },

    // Helper function to get contrasting text color (black or white)
    getContrastColor: function(hexColor) {
      // Remove the # if present
      hexColor = hexColor.replace('#', '');
      
      // Parse the hex color
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Return black for light colors, white for dark colors
      return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    // Function to force reorder player areas (useful for debugging)
    forceReorderPlayerAreas: function() {
      this.lastReorderedUser = null; // Reset the tracking
      this.reorderPlayerAreas();
    },

    // Function to reorder player areas so current user appears first
    reorderPlayerAreas: function() {
      if (!this.gamedatas || !this.gamedatas.players) {
        return;
      }

      const playersBoardContainer = document.getElementById('playersBoardContainer');
      if (!playersBoardContainer) {
        return;
      }

      // Get the current user's player ID (not the active player)
      const currentUserId = this.player_id;
      if (!currentUserId) {
        return;
      }

      // Check if we already reordered for this user (convert to string for comparison)
      if (this.lastReorderedUser === String(currentUserId)) {
        return;
      }

      // Get all player board elements
      const playerBoards = playersBoardContainer.querySelectorAll('.playerboard');
      
      if (playerBoards.length <= 1) {
        return; // No need to reorder if there's only one player
      }

      // Create the desired order: current user first, then others in turn order
      const allPlayerIds = Object.keys(this.gamedatas.players);
      const desiredOrder = [String(currentUserId)];
      
      // Add other players in turn order (clockwise from current user)
      const currentUserIndex = allPlayerIds.indexOf(String(currentUserId));
      
      for (let i = 1; i < allPlayerIds.length; i++) {
        const nextIndex = (currentUserIndex + i) % allPlayerIds.length;
        desiredOrder.push(allPlayerIds[nextIndex]);
      }


      // Reorder the player boards
      desiredOrder.forEach((playerId, index) => {
        const playerBoard = document.getElementById('playerboard_' + playerId);
        if (playerBoard) {
          playersBoardContainer.appendChild(playerBoard);
        } else {
        }
      });

      // Update the order tracking (store as string)
      this.lastReorderedUser = String(currentUserId);
      
    },

    notif_slideCards: function(notif) {
      console.log("=== SLIDE CARDS NOTIFICATION RECEIVED ===");
      console.log("Full notification:", notif);
      console.log("Args:", notif.args);
      console.log("Trigger by:", notif.args.trigger_by);
      console.log("Cards:", notif.args.cards);
      
      if (notif.args.trigger_by === 'new_round') {
        console.log("Triggering townsfolk display slide animation...");
        this.animateTownsfolkDisplaySlide(notif.args.cards);
      } else {
        console.log("Not triggering animation - trigger_by is:", notif.args.trigger_by);
      }
    },

    animateTownsfolkDisplaySlide: function(newCards) {
      console.log("=== ANIMATING TOWNSFOLK DISPLAY SLIDE ===");
      console.log("New cards data:", newCards);
      
      // Get ALL display cards first (including hidden ones) for debugging
      const allDisplayCards = this.uiItems.getByUiType("townsfolk_uiitem").filter(card => 
        card.data.location === "townsfolk_display"
      );
      
      console.log("ALL display cards (including hidden):", allDisplayCards.length);
      console.log("ALL display cards details:", allDisplayCards.map(card => ({
        id: card.data.id,
        position: card.data.location_arg,
        hasHtmlNode: !!card.htmlNode,
        isVisible: card.htmlNode ? card.htmlNode.style.display !== "none" : false,
        displayStyle: card.htmlNode ? card.htmlNode.style.display : "no node"
      })));
      
      // Debug: Log each card individually
      allDisplayCards.forEach((card, index) => {
        console.log(`Card ${index}: ID=${card.data.id}, Position=${card.data.location_arg}, Visible=${card.htmlNode ? card.htmlNode.style.display !== "none" : false}, Display=${card.htmlNode ? card.htmlNode.style.display : "no node"}`);
        if (card.htmlNode) {
          console.log(`  Card ${index} classes:`, card.htmlNode.className);
          console.log(`  Card ${index} attributes:`, Array.from(card.htmlNode.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', '));
        }
      });

      // Get current display cards - only include visible cards
      const currentDisplayCards = allDisplayCards.filter(card => 
        card.htmlNode && 
        card.htmlNode.style.display !== "none" &&
        // Additional check: make sure this card wasn't previously picked
        // We can identify picked cards by checking if they have a specific class or data attribute
        !card.htmlNode.classList.contains('picked') &&
        !card.htmlNode.hasAttribute('data-picked') &&
        // Exclude cards that were previously selected/picked
        !card.htmlNode.classList.contains('selected')
      );
      
      // Remove picked/selected cards from the display first
      allDisplayCards.forEach(card => {
        if (card.htmlNode && 
            (card.htmlNode.classList.contains('selected') || 
             card.htmlNode.classList.contains('picked') || 
             card.htmlNode.hasAttribute('data-picked'))) {
          console.log(`Removing picked card ${card.data.id} from display`);
          card.htmlNode.remove(); // Remove from DOM entirely
        }
      });
      
      // Re-filter after removing picked cards
      const availableDisplayCards = allDisplayCards.filter(card => 
        card.htmlNode && 
        card.htmlNode.style.display !== "none" &&
        !card.htmlNode.classList.contains('picked') &&
        !card.htmlNode.hasAttribute('data-picked') &&
        !card.htmlNode.classList.contains('selected')
      );
      
      console.log("Available display cards after removing picked cards:", availableDisplayCards.length);
      
      // Step 1: Animate remaining cards sliding to fill leftmost positions
      const slidePromises = [];
      
      // Sort cards by their current position to ensure proper order
      availableDisplayCards.sort((a, b) => a.data.location_arg - b.data.location_arg);
      console.log("Sorted cards by position:", availableDisplayCards.map(card => card.data.location_arg));
      
      // Move each card to the leftmost available position
      availableDisplayCards.forEach((card, index) => {
        const newPosition = index; // Fill positions 0, 1, 2, etc.
        console.log(`Moving card ${card.data.id} from position ${card.data.location_arg} to position ${newPosition}`);
        const slidePromise = this.slideCardToPosition(card, newPosition);
        slidePromises.push(slidePromise);
      });
      
      console.log("Created slide promises:", slidePromises.length);
      
      // Step 2: After sliding animation completes, draw new cards
      Promise.all(slidePromises).then(() => {
        console.log("Slide animation completed, drawing new cards");
        setTimeout(() => {
          this.drawNewTownsfolkCards(newCards);
        }, 300); // Small delay before drawing new cards
      });
    },

    slideCardToPosition: function(card, newPosition) {
      return new Promise((resolve) => {
        console.log(`=== SLIDING CARD TO POSITION ${newPosition} ===`);
        console.log("Card data:", card.data);
        
        const cardElement = card.htmlNode;
        if (!cardElement) {
          console.error("No HTML node found for card:", card.data.id);
          resolve();
          return;
        }
        
        console.log("Card element found:", cardElement);
        
        // Get the target container for the new position
        const targetContainer = document.getElementById("townsfolk_spot_" + newPosition);
        if (!targetContainer) {
          console.error(`Target container not found: townsfolk_spot_${newPosition}`);
          resolve();
          return;
        }
        
        // Get current position for smooth animation
        const currentPos = dojo.position(cardElement);
        const targetPos = dojo.position(targetContainer);
        
        console.log(`Current position: x=${currentPos.x}, y=${currentPos.y}`);
        console.log(`Target position: x=${targetPos.x}, y=${targetPos.y}`);
        
        // Calculate the distance to move
        const deltaX = targetPos.x - currentPos.x;
        const deltaY = targetPos.y - currentPos.y;
        
        console.log(`Moving card by: deltaX=${deltaX}px, deltaY=${deltaY}px`);
        
        // Set up the card for smooth animation
        dojo.setStyle(cardElement, "position", "absolute");
        dojo.setStyle(cardElement, "z-index", "1000");
        dojo.setStyle(cardElement, "transition", "transform 1.5s ease-out");
        
        // Animate the card using transform
        dojo.setStyle(cardElement, "transform", `translate(${deltaX}px, ${deltaY}px) scale(0.58)`);
        
        // Update the card's data
        card.data.location_arg = newPosition;
        
        // After animation completes, move the card to the correct container
        setTimeout(() => {
          console.log(`Animation completed, moving card to container townsfolk_spot_${newPosition}`);
          
          // Reset the card's position and move it to the target container
          dojo.setStyle(cardElement, "position", "relative");
          dojo.setStyle(cardElement, "transform", "scale(0.58)");
          dojo.setStyle(cardElement, "z-index", "auto");
          dojo.setStyle(cardElement, "transition", "none");
          
          // Move the card to the target container
          targetContainer.appendChild(cardElement);
          
          console.log(`Card successfully moved to position ${newPosition}`);
          resolve();
        }, 1500); // Match the transition duration
      });
    },

    drawNewTownsfolkCards: function(newCards) {
      console.log("=== DRAWING NEW TOWNSFOLK CARDS ===");
      console.log("New cards data:", newCards);
      
      // Get current display cards after sliding
      const currentDisplayCards = this.uiItems.getByUiType("townsfolk_uiitem").filter(card => 
        card.data.location === "townsfolk_display" &&
        card.htmlNode && 
        card.htmlNode.parentNode && // Make sure it's still in the DOM
        card.htmlNode.style.display !== "none"
      );
      
      console.log("Current display cards after sliding:", currentDisplayCards.length);
      console.log("Current display cards positions:", currentDisplayCards.map(card => card.data.location_arg));
      
      // Calculate how many positions are already filled
      const filledPositions = currentDisplayCards.length;
      const maxPositions = 5;
      
      console.log(`Filled positions: ${filledPositions}, Max positions: ${maxPositions}`);
      
      // Convert newCards object to array if needed
      const newCardsArray = Array.isArray(newCards) ? newCards : Object.values(newCards);
      console.log("New cards array:", newCardsArray);
      
      // Track how many new cards we're actually drawing
      let cardsToDraw = 0;
      let cardsDrawn = 0;
      
      // Count how many cards we'll actually draw
      newCardsArray.forEach((cardData, index) => {
        const position = filledPositions + index;
        if (position < maxPositions) {
          cardsToDraw++;
        }
      });
      
      console.log(`Will draw ${cardsToDraw} new cards`);
      
      // Draw new cards in remaining positions
      newCardsArray.forEach((cardData, index) => {
        const position = filledPositions + index;
        if (position < maxPositions) {
          console.log(`Drawing new card ${cardData.id} at position ${position}`);
          this.drawNewCard(cardData, position, () => {
            // Callback when this card's animation completes
            cardsDrawn++;
            console.log(`Card ${cardData.id} animation completed. ${cardsDrawn}/${cardsToDraw} cards done.`);
            
            // If all cards are drawn, start the 10-second delay
            if (cardsDrawn >= cardsToDraw) {
              console.log("All new card animations completed. Animation sequence finished.");
            }
          });
        } else {
          console.log(`Skipping card ${cardData.id} - position ${position} exceeds max ${maxPositions}`);
        }
      });
      
      // If no cards to draw, start the delay immediately
      if (cardsToDraw === 0) {
        console.log("No new cards to draw. Animation sequence finished.");
      }
    },

    drawNewCard: function(cardData, position, onComplete) {
      // Create a new UI item for the card
      const newCard = this.uiItems.createAndAddItem("townsfolk_uiitem", cardData);
      
      if (!newCard || !newCard.htmlNode) {
        console.error("Failed to create new card UI item");
        if (onComplete) onComplete();
        return;
      }
      
      const cardElement = newCard.htmlNode;
      
      // Get the target container
      const displayContainer = document.getElementById("townsfolk_spot_" + position);
      if (!displayContainer) {
        console.error(`Display container not found: townsfolk_spot_${position}`);
        if (onComplete) onComplete();
        return;
      }
      
      // Set up the card for animation
      dojo.setStyle(cardElement, "position", "relative");
      dojo.setStyle(cardElement, "transform", "scale(0.58)");
      dojo.setStyle(cardElement, "opacity", "0");
      dojo.setStyle(cardElement, "transition", "opacity 0.5s ease-out");
      
      // Add the card to the display container
      displayContainer.appendChild(cardElement);
      
      // Animate the card fading in
      setTimeout(() => {
        // Fade in the card
        dojo.setStyle(cardElement, "opacity", "1");
        
        // Call the completion callback after the animation finishes
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500); // Match the transition duration
      }, position * 100); // Stagger the animations
    },

    // Track selected tavern cards to prevent them from reappearing
    selectedTavernCards: [],

    // Show tavern selection area
    showTavernSelectionModal: function() {
      console.log("=== SHOW TAVERN SELECTION AREA ===");
      console.log("Current player_id:", this.player_id);
      console.log("Active player_id:", this.gamedatas.gamestate.active_player);
      console.log("tavern_display data:", this.tavern_display);
      
      // Check if modal is already visible to prevent duplicate calls
      const tavernSelectionArea = document.getElementById('tavern_selection_area');
      if (tavernSelectionArea && tavernSelectionArea.style.display === 'block') {
        console.log("Tavern selection modal is already visible, skipping duplicate call");
        return;
      }
      
      // Clear previous content completely and ensure we start fresh
      const tavernSelectionCards = document.getElementById('tavern_selection_cards');
      if (tavernSelectionCards) {
        // Remove all child nodes to prevent duplication
        while (tavernSelectionCards.firstChild) {
          tavernSelectionCards.removeChild(tavernSelectionCards.firstChild);
        }
        console.log("Cleared previous tavern selection cards");
      } else {
        console.error("tavern_selection_cards element not found!");
        return;
      }
      
      // Get tavern cards from UI items
      let tavernCards = this.uiItems.getByUiType("tavern_card");
      console.log("Tavern cards in UI items:", tavernCards.length);
      
      // If no tavern cards exist in UI items but they exist in game data, create them
      if (tavernCards.length === 0 && this.tavern_display) {
        console.log("Creating tavern UI items from tavern_display");
        this.createTavernUiItems(this.tavern_display);
        // Get the cards again after creation
        tavernCards = this.uiItems.getByUiType("tavern_card");
        console.log("New tavern cards created:", tavernCards.length);
      }
      
      // Additional debugging: log all tavern cards to see what we have
      console.log("All tavern cards details:", tavernCards.map(card => ({
        id: card.data.id,
        location: card.data.location,
        location_arg: card.data.location_arg
      })));
      
      // Filter out already selected cards
      const availableTavernCards = tavernCards.filter(card => 
        !this.selectedTavernCards.includes(card.data.id)
      );
      console.log("Available tavern cards:", availableTavernCards.length);
      
      // Check if current player is the active player
      const currentPlayerId = this.player_id;
      const activePlayerId = this.gamedatas.gamestate.active_player;
      const isActivePlayer = String(currentPlayerId) === String(activePlayerId);
      console.log("Is current player active:", isActivePlayer);
      
      // Display available tavern cards in the selection area
      console.log(`Displaying ${availableTavernCards.length} available tavern cards`);
      
      // Track displayed cards to prevent duplicates
      const displayedCardIds = new Set();
      
      availableTavernCards.forEach(card => {
        // Skip if we've already displayed this card
        if (displayedCardIds.has(card.data.id)) {
          console.log(`Skipping duplicate card ${card.data.id}`);
          return;
        }
        
        displayedCardIds.add(card.data.id);
        const cardClone = card.htmlNode.cloneNode(true);
        
        if (tavernSelectionCards) {
          dojo.place(cardClone, tavernSelectionCards);
          
          // Check if this card has already been selected
          if (this.selectedTavernCards.includes(card.data.id)) {
            // Card has been selected - disable it
            dojo.addClass(cardClone, 'selected');
            cardClone.style.pointerEvents = 'none';
            cardClone.style.opacity = '0.5';
            cardClone.style.cursor = 'default';
          } else {
            // Card is available - make it selectable for active player
            if (isActivePlayer) {
              dojo.addClass(cardClone, 'selectable');
              cardClone.style.cursor = 'pointer';
              cardClone.dataset.cardId = card.data.id;
              
              // Add click event listener for selection
              cardClone.addEventListener('click', (e) => this.handleTavernCardClick(e, card));
            } else {
              // For non-active players, show cards as read-only (no special styling)
              cardClone.style.cursor = 'default';
            }
          }
        }
      });
      
      console.log(`Actually displayed ${displayedCardIds.size} unique tavern cards`);
      
      // Show the tavern selection area (using the already declared variable)
      if (tavernSelectionArea) {
        console.log("Showing tavern selection area");
        tavernSelectionArea.style.display = 'block';
      } else {
        console.error("tavern_selection_area element not found!");
      }
    },

    // Hide tavern selection area
    hideTavernSelectionModal: function() {
      const tavernSelectionArea = document.getElementById('tavern_selection_area');
      if (tavernSelectionArea) {
        tavernSelectionArea.style.display = 'none';
      }
      
      // Clear the selected cards tracking when leaving the state
      this.selectedTavernCards = [];
    },

    // Handle tavern card updates - remove selected cards from uiItems
    notif_tavernCardsUpdated: function(notif) {
      // Remove selected cards from uiItems
      this.selectedTavernCards.forEach(cardId => {
        const cardUiItem = this.uiItems.getByUiType("tavern_card").find(item => item.data.id === cardId);
        if (cardUiItem && cardUiItem.htmlNode) {
          cardUiItem.htmlNode.remove();
        }
      });
    },

    // Handle tavern display updates from server
    
    // Handle tavern card click for selection
    handleTavernCardClick: function(event, card) {
      const cardId = card.data.id;
      const cardElement = event.currentTarget;
      
      // Toggle selection
      if (this.selectedTavernCards.includes(cardId)) {
        // Deselect the card
        this.selectedTavernCards = this.selectedTavernCards.filter(id => id !== cardId);
        dojo.removeClass(cardElement, 'selected');
        dojo.addClass(cardElement, 'selectable');
      } else {
        // Select the card
        this.selectedTavernCards.push(cardId);
        dojo.removeClass(cardElement, 'selectable');
        dojo.addClass(cardElement, 'selected');
      }
      
      // Show/hide confirm button based on selection
      const confirmButton = document.getElementById('confirm_tavern_selection');
      if (confirmButton) {
        confirmButton.style.display = this.selectedTavernCards.length > 0 ? 'block' : 'none';
      }
      
      console.log('Tavern card selection updated:', this.selectedTavernCards);
      
      // Don't refresh the display immediately - let the player see their selection
      // The card will only disappear after they confirm
    },
    
    // Refresh the tavern selection display to show current state
    refreshTavernSelectionDisplay: function() {
      console.log("=== REFRESHING TAVERN SELECTION DISPLAY ===");
      console.log("Current selected cards:", this.selectedTavernCards);
      
      // Get the tavern selection cards container
      const tavernSelectionCards = document.getElementById('tavern_selection_cards');
      if (!tavernSelectionCards) {
        console.error("tavern_selection_cards element not found!");
        return;
      }
      
      // Clear the current display
      while (tavernSelectionCards.firstChild) {
        tavernSelectionCards.removeChild(tavernSelectionCards.firstChild);
      }
      
      // Get current tavern cards from UI items
      // These should now exclude the selected cards since the server updated the display
      const tavernCards = this.uiItems.getByUiType("tavern_card");
      console.log("Available tavern cards from server:", tavernCards.length);
      
      // Check if current player is the active player
      const currentPlayerId = this.player_id;
      const activePlayerId = this.gamedatas.gamestate.active_player;
      const isActivePlayer = String(currentPlayerId) === String(activePlayerId);
      
      // Display all remaining tavern cards (server has already filtered out selected ones)
      tavernCards.forEach(card => {
        const cardClone = card.htmlNode.cloneNode(true);
        dojo.place(cardClone, tavernSelectionCards);
        
        if (isActivePlayer) {
          dojo.addClass(cardClone, 'selectable');
          cardClone.style.cursor = 'pointer';
          cardClone.dataset.cardId = card.data.id;
          
          // Add click event listener for selection
          cardClone.addEventListener('click', (e) => this.handleTavernCardClick(e, card));
        } else {
          cardClone.style.cursor = 'default';
        }
      });
      
      console.log("Tavern selection display refreshed with server-filtered cards");
    },
    
    // Initialize tavern selection functionality
    initTavernSelection: function() {
      // Initialize selected tavern cards array
      this.selectedTavernCards = [];
      
      // Initialize flag to prevent tavern card updates during processing
      this.isUpdatingTavernCards = false;
      
      // Initialize flag to prevent rapid tavern display updates
      this.tavernDisplayUpdateInProgress = false;
      
      // Add event listeners for modal buttons
      const confirmButton = document.getElementById('confirm_tavern_selection');
      const cancelButton = document.getElementById('cancel_tavern_selection');
      
      if (confirmButton) {
        confirmButton.addEventListener('click', () => this.confirmTavernSelection());
      }
      
      if (cancelButton) {
        cancelButton.addEventListener('click', () => this.cancelTavernSelection());
      }
    },
    
    // Confirm tavern selection
    confirmTavernSelection: function() {
      if (this.selectedTavernCards.length === 0) {
        console.warn('No tavern card selected');
        return;
      }
      
      // Send the selection to the server
      const selectedCardId = this.selectedTavernCards[0]; // Assuming only one card can be selected
      console.log('Confirming tavern selection:', selectedCardId);
      
      // Disable the confirm button to prevent double-clicks
      const confirmButton = document.getElementById('confirm_tavern_selection');
      if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Processing...';
      }
      
      // Call the server action to confirm tavern selection
      this.ajaxcall('/paladinsshipped/paladinsshipped/pickTavern.html', 
        { tavern_card_id: selectedCardId }, this, function(result) {
          console.log('Tavern selection confirmed successfully:', result);
          // Don't hide the modal here - let the server handle it
        }, function(is_error) {
          console.error('Error confirming tavern selection:', is_error);
          // Re-enable the button on error
          if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm Selection';
          }
        });
      
      // Don't hide the modal immediately - let the server response handle it
      // This prevents the flickering issue
    },
    
    // Cancel tavern selection
    cancelTavernSelection: function() {
      console.log('Canceling tavern selection');
      this.hideTavernSelectionModal();
    },
    // Handle tavern selection completion
    notif_tavernSelectionComplete: function(notif) {
      console.log('Tavern selection completed:', notif);
      
      // Clear the selected cards only when selection is actually completed
      this.selectedTavernCards = [];
      console.log('Cleared selected tavern cards after completion');
      
      // Hide the tavern selection modal
      this.hideTavernSelectionModal();
      
      // Re-enable the confirm button if it was disabled
      const confirmButton = document.getElementById('confirm_tavern_selection');
      if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Confirm Selection';
      }
    },
    
    // Update tavern display from server notification
    notif_tavernDisplayUpdated: function(notif) {
      console.log("=== TAVERN DISPLAY UPDATED ===");
      console.log("Notification received:", notif);
      
      // Prevent multiple rapid updates
      if (this.tavernDisplayUpdateInProgress) {
        console.log("Tavern display update already in progress, skipping");
        return;
      }
      
      this.tavernDisplayUpdateInProgress = true;
      
      try {
        // Update the client-side tavern display data
        this.tavern_display = notif.args.tavern_display;
        
        // Recreate tavern card UI items with the updated data
        // createTavernUiItems now handles removing existing cards
        if (this.tavern_display) {
          this.createTavernUiItems(this.tavern_display);
        }
        
        // After server confirms selection, the tavern_display should now exclude the selected cards
        // We can clear the selectedTavernCards since the server has processed them
        console.log("Server updated tavern display, clearing selected cards:", this.selectedTavernCards);
        this.selectedTavernCards = [];
        
        // If the modal is currently visible, refresh it to show the updated state
        // This will hide the selected cards permanently
        const tavernSelectionArea = document.getElementById('tavern_selection_area');
        if (tavernSelectionArea && tavernSelectionArea.style.display === 'block') {
          console.log("Modal is visible, refreshing to show updated state");
          this.refreshTavernSelectionDisplay();
        }
        
        console.log("Tavern display update completed successfully");
      } finally {
        // Reset the flag after a delay to prevent rapid successive calls
        setTimeout(() => {
          this.tavernDisplayUpdateInProgress = false;
        }, 500);
      }
    },
  });
});
