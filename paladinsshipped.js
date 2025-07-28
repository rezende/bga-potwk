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
        var background = { x: 0, y: 0 };
        background.x =
          (typeArg % this.itemBackgroundConfig[uiType].items_per_row) *
          -1 *
          this.itemBackgroundConfig[uiType]["width"];
        background.y =
          Math.floor(
            typeArg / this.itemBackgroundConfig[uiType].items_per_row,
          ) *
          -1 *
          this.itemBackgroundConfig[uiType]["height"];
        return background;
      };

      this.uiItems.getBackgroundPositionForUiItem = function (uiItem) {
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
        console.log("created item", item);
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

      console.log("Starting game setup");
      this.outsider_display = gamedatas.outsider_display;
      this.townsfolk_display = gamedatas.townsfolk_display;
      this.townsfolk_material = gamedatas.townsfolk_material;
      this.paladin_material = gamedatas.paladin_material;
      this.paladin_hand = gamedatas.player_paladin_hand;
      this.all_players_townsfolk_hands = gamedatas.all_players_townsfolk_hands;
      console.log("All players townsfolk hands:", this.all_players_townsfolk_hands);
      this.tavern_display = gamedatas.tavern_display;
      this.tavern_cards_material = gamedatas.tavern_cards_material;
      this.wall_cards = gamedatas.wall_cards;
      this.kingsorder_display = gamedatas.kingsorder_display;
      this.kingsfavour_display = gamedatas.kingsfavour_display;
      this.attachFunctionsToUiItems();

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
      console.log("Checking if all_players_townsfolk_hands exists:", !!this.all_players_townsfolk_hands);
      if (this.all_players_townsfolk_hands) {
        console.log("Creating UI items for all players' townsfolk hands");
        this.createAllPlayersTownsfolkUiItems(this.all_players_townsfolk_hands);
      }
      // TODO: so far, it only creates the deck background, not the cards
      this.setupWallCards(this.getValuesFromObject(this.wall_cards));
      this.setupKingsOrderCards(
        this.getValuesFromObject(this.kingsorder_display),
      );
      this.setupKingsFavourCards(
        this.getValuesFromObject(this.kingsfavour_display),
      );
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
      console.log("Ending game setup");
      
      // Initialize player area reordering tracking
      this.lastReorderedUser = null;
      
      // Set data attributes for player identification
      this.setPlayerBoardAttributes();
      
      // Reorder player areas to show current user first
      this.reorderPlayerAreas();
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

    setupPaladinSelection: function () {
      if (this.isCurrentPlayerActive()) {
        const paladinCards = this.uiItems.getByUiType("paladin_card");
        for (var paladinCard of paladinCards) {
          dojo.place(paladinCard.htmlNode, "paladinsSelection");
          this.uiItems.setBackgroundUiItem(paladinCard);
          dojo.setStyle(paladinCard.htmlNode, "top", "");
          dojo.setStyle(paladinCard.htmlNode, "left", "");
          // this.removeTooltip(dojo.getAttr(paladinCard.htmlNode, "id"));
        }
        dojo.setStyle("paladinsSelection", "display", "flex");
        dojo.setStyle("paladinsSelection", "justify-content", "center");
        this.uiItems.makeSelectable(paladinCards);

        const tavernCards = this.uiItems.getByUiType("tavern_card");
        for (var tavernCard of tavernCards) {
          dojo.place(tavernCard.htmlNode, "tavernsSelection");
          this.uiItems.setBackgroundUiItem(tavernCard);
          dojo.setStyle(tavernCard.htmlNode, "top", "");
          dojo.setStyle(tavernCard.htmlNode, "left", "");
          // this.removeTooltip(dojo.getAttr(tavernCard.htmlNode, "id"));
        }
        this.displayTaverns();
        // this.uiItems.makeSelectable(tavernCards);
      }
    },

    setupTownsfolkSelection: function () {
      if (this.isCurrentPlayerActive()) {
        const allTownsfolkCards = this.uiItems.getByUiType("townsfolk_uiitem");
        // Only make display cards selectable, not player cards
        const displayCards = allTownsfolkCards.filter(card => 
          card.data.location !== "playerboard_cards"
        );
        console.log("Making display cards selectable:", displayCards.length, "out of", allTownsfolkCards.length, "total cards");
        this.uiItems.makeSelectable(displayCards);
        this.uiItems.resetSelectableAnimation();
      }
    },

    setupTavernSelection: function () {
      this.displayTaverns();
      if (this.isCurrentPlayerActive()) {
        this.uiItems.makeSelectable(this.uiItems.getByUiType("tavern_card"));
      }
    },

    displayTaverns: function () {
      dojo.setStyle("tavernsSelection", "display", "flex");
      dojo.setStyle("tavernsSelection", "justify-content", "center");
    },

    createTavernUiItems: function (cards) {
      for (var cardId in cards) {
        const card = cards[cardId];
        // card.location = "tavernDisplay";
        card.isSelectable = false;
        const uiType = "tavern_card";
        const params = card;
        this.uiItems.createAndAddItem(uiType, params);
      }
    },

    createPaladinUiItems: function (cards) {
      for (var cardId in cards) {
        const card = cards[cardId];
        card.location = "paladinsSelection";
        card.location_arg = this.player_id; // Set the current player ID
        card.isSelectable = true;
        const uiType = "paladin_card";
        const params = card;
        this.uiItems.createAndAddItem(uiType, params);
      }
    },

    createAllPlayersTownsfolkUiItems: function (allPlayersCards) {
      console.log("createAllPlayersTownsfolkUiItems called with:", allPlayersCards);
      for (var playerId in allPlayersCards) {
        const playerCards = allPlayersCards[playerId];
        console.log("Creating UI items for player", playerId, "with cards:", playerCards);
        for (var cardId in playerCards) {
          const card = playerCards[cardId];
          card.location = "playerboard_cards";
          card.location_arg = playerId; // Set the player ID so cards go to correct player area
          card.isSelectable = false;
          const uiType = "townsfolk_uiitem";
          const params = card;
          console.log("Creating UI item for player", playerId, "card:", params);
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
      const deckBackground = { type: 6, type_arg: 6 };
      const uiItems = Array(3)
        .fill(deckBackground)
        .map((background, i) => cards[i] || background);
      this.uiItems.createItems("kingsorder_card", uiItems);
    },

    setupKingsFavourCards: function (cards) {
      /*
        There will always be 5 king's favour cards.
        If there are less than 5 cards, the missing cards are replaced by a background card.
      */
      const deckBackground = { type: 10, type_arg: 10 };
      const uiItems = Array(5)
        .fill(deckBackground)
        .map((background, i) => cards[i] || background);
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
      this.currentMove = stateName;
      this.currentMoveArgs = args.args;
      console.log("Entering state: " + stateName);

      // Update player board attributes to reflect current state
      this.setPlayerBoardAttributes();

      switch (stateName) {
        case "pickPaladins":
          // Show paladin selection button and automatically open the modal
          this.setupActionButtons();
          this.updateActionButtons();
          
          // Automatically show the paladin selection modal for the current player
          if (this.isCurrentPlayerActive()) {
            this.showPaladinSelectionModal();
          }
          break;

        case "pickTavern":
          this.setupTavernSelection();
          break;

        case "hireInitialTownsfolk":
          this.setupTownsfolkSelection();
          break;

        case "playerAction":
          this.setupActionButtons();
          this.updateActionButtons();
          break;

        case "cleanupTaverns":
          dojo.setStyle("tavernsSelection", "display", "none");

        case "dummmy":
          break;
      }
      
      // Reorder player areas to show current user first
      this.reorderPlayerAreas();
    },



    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      console.log("Leaving state: " + stateName);

      switch (stateName) {
        case "pickPaladins":
          // Hide the old inline selection and the modal
          dojo.setStyle("paladinsSelection", "display", "none");
          this.hidePaladinSelectionModal();
          this.uiItems.resetAllSelectable();
          break;
        case "playerAction":
          // Hide action buttons when leaving playerAction state
          const actionContainer = document.getElementById('action_buttons');
          if (actionContainer) {
            dojo.setStyle(actionContainer, 'display', 'none');
          }
          break;
        case "dummmy":
          break;
      }
    },

    // nUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      console.log("onUpdateActionButtons: " + stateName);
      // Update action buttons visibility when current player changes
      this.updateActionButtons();
    },

    ///////////////////////////////////////////////////
    //// Utility methods

    /*
            
                Here, you can defines some utility methods that you can use everywhere in your javascript
                script.
            
            */

    getPositionForUiItem: function (uiItem) {
      var position = { top: null, left: null };
      return position;
    },

    positionUiItem: function (uiItem) {
      // Skip positioning for player cards since they use flex layout
      if (uiItem.uiType == "townsfolk_uiitem" && uiItem.data.location == "playerboard_cards") {
        console.log("Skipping positioning for player card - using flex layout");
        return;
      }
      
      var position = this.getPositionForUiItem(uiItem);
      if (position.top != null && position.left != null) {
        dojo.setStyle(uiItem.htmlNode, "top", position.top + "px");
        dojo.setStyle(uiItem.htmlNode, "left", position.left + "px");
        console.log("Positioned UI item:", uiItem.uiType, "at", position.top, position.left);
      } else {
        console.log("No position calculated for UI item:", uiItem.uiType);
      }
    },

    moveUiItemToParentContainer: function (uiItem, parentContainer) {
      console.log("moveUiItemToParentContainer called for:", uiItem.uiType, "to container:", parentContainer);
      if (parentContainer != null) {
        // Special handling for player townsfolk cards
        if (uiItem.uiType == "townsfolk_uiitem" && uiItem.data.location == "playerboard_cards") {
          console.log("Processing player townsfolk card:", uiItem);
          console.log("Card data:", uiItem.data);
          const playerboardCardsElement = document.getElementById(parentContainer);
          console.log("Looking for container:", parentContainer);
          console.log("Found element:", playerboardCardsElement);
          if (playerboardCardsElement) {
            dojo.place(uiItem.htmlNode, playerboardCardsElement);
            console.log("Placed card in container");
            // Add some margin for spacing between cards
            dojo.setStyle(uiItem.htmlNode, 'margin', '5px');
            // Ensure the card is visible
            dojo.setStyle(uiItem.htmlNode, 'display', 'block');
            dojo.setStyle(uiItem.htmlNode, 'position', 'relative');
            console.log("Applied styles to card");
            console.log("Card HTML after placement:", uiItem.htmlNode);
            console.log("Container children after placement:", playerboardCardsElement.children.length);
            console.log("Container HTML after placement:", playerboardCardsElement.innerHTML);
          } else {
            console.error("Could not find playerboard cards container:", parentContainer);
          }
        } else if (uiItem.uiType == "townsfolk_uiitem" && parentContainer.startsWith("townsfolk_spot_")) {
          // Special handling for display townsfolk cards - place in specific spots
          console.log("Processing display townsfolk card:", uiItem, "to spot:", parentContainer);
          const spotElement = document.getElementById(parentContainer);
          if (spotElement) {
            dojo.place(uiItem.htmlNode, spotElement);
            console.log("Placed display card in spot:", parentContainer);
          } else {
            console.error("Could not find spot container:", parentContainer);
          }
        } else {
          dojo.place(uiItem.htmlNode, parentContainer);
        }
        this.positionUiItem(uiItem);
      } else {
        console.error("No parent container found for UI item:", uiItem);
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
          console.log("Routing townsfolk card to player container:", containerName, "for player:", uiItem.data.location_arg);
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
        containerName = "kingsorder_cards";
      }
      if (uiItem.uiType == "kingsfavour_card") {
        containerName = "kingsfavour_cards";
      }
      return containerName;
    },

    drawUiItem: function (uiItem) {
      console.log("drawUiItem called for:", uiItem.uiType, "with data:", uiItem.data);
      var parentContainer = this.getParentContainerForUiItem(uiItem);
      console.log("Parent container determined:", parentContainer);
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
      console.log("notifications subscriptions setup");
      dojo.subscribe("moveParchment", this, "notif_moveParchment");
      dojo.subscribe("paladinCards", this, "notif_paladinCards");
      dojo.subscribe("revealTaverns", this, "notif_revealTaverns");
      dojo.subscribe("cleanupTaverns", this, "notif_cleanupTaverns");
      dojo.subscribe("townsfolkHired", this, "notif_townsfolkHired");
      dojo.subscribe("playerResourcesUpdated", this, "notif_playerResourcesUpdated");

      // TODO: here, associate your game notifications with local methods

      // Example 1: standard notification handling
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

      // Example 2: standard notification handling + tell the user interface to wait
      //            during 3 seconds after calling the method in order to let the players
      //            see what is happening in the game.
      // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
      // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
      //
    },

    // TODO: from this point and below, you can write your game notifications handling methods

    /*
            Example:
            
            notif_cardPlayed: function( notif )
            {
                console.log( 'notif_cardPlayed' );
                console.log( notif );
                
                // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
                
                // TODO: play the card in the user interface.
            },    
            
            */

    notif_moveParchment: function (notif) {
      this.updateParchment(notif.args.player_id);
    },

    notif_paladinCards: function (notif) {
      this.createPaladinUiItems(notif.args.cards);
    },

    notif_revealTaverns: function (notif) {
      this.createTavernUiItems(notif.args.cards);
    },

    notif_cleanupTaverns: function (notif) {
      dojo.setStyle("tavernsSelection", "display", "none");
    },

    notif_townsfolkHired: function (notif) {
      console.log("Townsfolk hired notification received:", notif);
      
      const hiredCard = notif.args.card;
      const playerId = notif.args.player_id;
      
      console.log("Hiring card:", hiredCard);
      console.log("For player:", playerId);
      console.log("Current player ID:", this.player_id);
      
      // Find the source card in the display
      const townsfolkCards = this.uiItems.getByUiType("townsfolk_uiitem");
      const sourceCard = townsfolkCards.find(card => card.data.id == hiredCard.id);
      if (!sourceCard) {
        console.error("Could not find source card for animation");
        // Fallback to normal behavior
        hiredCard.location = "playerboard_cards";
        hiredCard.location_arg = playerId;
        this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
        return;
      }
      
      console.log("Found source card:", sourceCard);
      
      // Get positions BEFORE hiding the card
      const sourcePos = dojo.position(sourceCard.htmlNode);
      const destContainer = document.getElementById("playerboard_cards_" + playerId);
      const destPos = dojo.position(destContainer);
      
      console.log("Source position:", sourcePos);
      console.log("Destination position:", destPos);
      console.log("Destination container:", destContainer);
      
      // Check if positions are valid
      if (!sourcePos || !destPos || !destContainer) {
        console.error("Invalid positions for animation, using fallback");
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
        console.log("Animation completed, placing card...");
        
        // Remove the temporary card
        tempCard.remove();
        
        // Reorder player areas FIRST to ensure correct visual placement
        console.log("Reordering player areas before card placement...");
        console.log("Current user ID before reorder:", this.player_id);
        console.log("Active player ID before reorder:", this.gamedatas.gamestate.active_player);
        this.reorderPlayerAreas();
        console.log("Player areas reordered, now placing card...");
        
        // Add the card to the player's board
        hiredCard.location = "playerboard_cards";
        hiredCard.location_arg = playerId;
        hiredCard.isSelectable = false; // Player cards should not be selectable
        const createdItems = this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
        
        console.log("Card successfully placed in player area:", playerId);
        console.log("Created items:", createdItems);
        
        // Draw the newly created card to the DOM
        console.log("Drawing newly created card to DOM...");
        this.drawUi();
        
        // Verify the card was placed correctly
        setTimeout(() => {
          const placedCards = this.uiItems.getByUiType("townsfolk_uiitem");
          console.log("All townsfolk cards:", placedCards);
          
          // Look for the card in the player's area specifically
          const placedCard = placedCards.find(card => 
            card.data.id == hiredCard.id && 
            card.data.location == "playerboard_cards" && 
            card.data.location_arg == playerId
          );
          
          if (placedCard) {
            console.log("Card verification - Found placed card:", placedCard);
            console.log("Card location_arg:", placedCard.data.location_arg);
            console.log("Expected player ID:", playerId);
            console.log("Card HTML element:", placedCard.htmlNode);
          } else {
            console.error("Card verification - Could not find placed card in player area");
            console.log("Looking for card with ID:", hiredCard.id, "in player area:", playerId);
          }
        }, 100);
      }, 1000); // Match the animation duration
    },

    notif_playerResourcesUpdated: function(notif) {
      console.log("Player resources updated notification received:", notif);
      
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

    onKingsFavor: function() {
      this.showWorkerSelectionMenu('kingsFavor', { kings_favor_id: null });
    },

    onPaladinSelection: function() {
      this.showPaladinSelectionModal();
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

    showPaladinSelectionModal: function() {
      // Clear previous content
      const paladinContainer = document.getElementById('paladin_cards_modal');
      const tavernContainer = document.getElementById('tavern_cards_modal');
      const topPosition = document.getElementById('paladin_top_position');
      const middlePosition = document.getElementById('paladin_middle_position');
      const bottomPosition = document.getElementById('paladin_bottom_position');
      
      if (paladinContainer) paladinContainer.innerHTML = '';
      if (tavernContainer) tavernContainer.innerHTML = '';
      if (topPosition) topPosition.innerHTML = '';
      if (middlePosition) middlePosition.innerHTML = '';
      if (bottomPosition) bottomPosition.innerHTML = '';
      
      // Get current player's paladin cards
      const paladinCards = this.uiItems.getByUiType("paladin_card");
      const currentPlayerId = this.player_id;
      
      console.log("ShowPaladinSelectionModal debug:", {
        allPaladinCards: paladinCards,
        currentPlayerId: currentPlayerId,
        paladinCardsLength: paladinCards.length
      });
      
      const playerPaladins = paladinCards.filter(card => 
        card.data.location === "paladinsSelection" && 
        card.data.location_arg === currentPlayerId
      );
      
      console.log("Filtered player paladins:", {
        playerPaladins: playerPaladins,
        playerPaladinsLength: playerPaladins.length
      });
      
      // Get tavern cards
      const tavernCards = this.uiItems.getByUiType("tavern_card");
      
      console.log("Tavern cards:", {
        tavernCards: tavernCards,
        tavernCardsLength: tavernCards.length
      });
      
      // Move paladin cards to available cards section
      playerPaladins.forEach(card => {
        const cardClone = card.htmlNode.cloneNode(true);
        dojo.place(cardClone, paladinContainer);
        
        // Make cards draggable
        dojo.addClass(cardClone, 'draggable');
        cardClone.draggable = true;
        cardClone.dataset.cardId = card.data.id;
        
        // Add drag event listeners
        cardClone.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
        cardClone.addEventListener('dragend', (e) => this.handleDragEnd(e));
      });
      
      // Set up drop zones for the three positions
      this.setupDropZones();
      
      // Move tavern cards to modal (read-only)
      tavernCards.forEach(card => {
        const cardClone = card.htmlNode.cloneNode(true);
        dojo.place(cardClone, tavernContainer);
        dojo.addClass(cardClone, 'readonly');
      });
      
      // Show modal
      const modal = document.getElementById('paladin_selection_modal');
      if (modal) {
        dojo.setStyle(modal, 'display', 'flex');
      }
      
      // Reset selection
      this.selectedPaladins = {
        top: null,
        middle: null,
        bottom: null
      };
      this.updatePaladinSelectionCounter();
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
      const availableContainer = document.getElementById('paladin_cards_modal');
      
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
      const selectedCount = Object.values(this.selectedPaladins).filter(id => id !== null).length;
      if (selectedCount === 3) {
        // Send the selection to the server in the correct order: bottom, picked, top
        this.sendPaladins(
          this.selectedPaladins.bottom,
          this.selectedPaladins.middle,
          this.selectedPaladins.top
        );
        
        // Hide the modal
        this.hidePaladinSelectionModal();
      }
    },

    hidePaladinSelectionModal: function() {
      const modal = document.getElementById('paladin_selection_modal');
      if (modal) {
        dojo.setStyle(modal, 'display', 'none');
      }
      
      // Reset selection
      this.selectedPaladins = [];
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// UI HELPER METHODS
    ////////////

    setupActionButtons: function() {
      // Create action buttons for the player board
      const actionButtons = [
        { id: 'pass', text: 'Pass', action: 'onPass' },
        { id: 'pray', text: 'Pray', action: 'onPray' },
        { id: 'recruit', text: 'Recruit', action: 'onRecruitHire' },
        { id: 'develop', text: 'Develop', action: 'onDevelop' },
        { id: 'hunt', text: 'Hunt', action: 'onHunt' },
        { id: 'trade', text: 'Trade', action: 'onTrade' },
        { id: 'conspire', text: 'Conspire', action: 'onConspire' },
        { id: 'commission', text: 'Commission', action: 'onCommission' },
        { id: 'fortify', text: 'Fortify', action: 'onFortify' },
        { id: 'garrison', text: 'Garrison', action: 'onGarrison' },
        { id: 'absolve', text: 'Absolve', action: 'onAbsolve' },
        { id: 'attack', text: 'Attack', action: 'onAttack' },
        { id: 'convert', text: 'Convert', action: 'onConvert' },
        { id: 'kingsFavor', text: 'King\'s Favor', action: 'onKingsFavor' },
        { id: 'paladinSelection', text: 'Select Paladins', action: 'onPaladinSelection', special: true }
      ];

      const actionContainer = document.getElementById('action_buttons');
      if (actionContainer) {
        // Clear existing content
        actionContainer.innerHTML = '';
        
        // Add header with current player info
        const header = document.createElement('div');
        header.className = 'action_buttons_header';
        
        const isMyTurn = this.isCurrentPlayerActive();
        const currentState = this.gamedatas.gamestate.name;
        
        // Different header text based on state
        let headerText;
        if (currentState === 'pickPaladins') {
          headerText = 'Select Your Paladins';
        } else {
          headerText = isMyTurn ? 'Your Turn - Available Actions' : 'Available Actions';
        }
        
        header.innerHTML = '<h3>' + headerText + '</h3>';
        actionContainer.appendChild(header);
        
        // Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'action_buttons_container';
        actionContainer.appendChild(buttonsContainer);
        
        // Filter buttons based on current state
        let buttonsToShow = actionButtons;
        if (currentState === 'pickPaladins') {
          // Only show paladin selection button during pickPaladins state
          buttonsToShow = actionButtons.filter(button => button.special);
        } else {
          // Show all buttons except paladin selection during other states
          buttonsToShow = actionButtons.filter(button => !button.special);
        }
        
        buttonsToShow.forEach(button => {
          const btn = document.createElement('button');
          btn.id = button.id + '_btn';
          btn.className = 'action_button';
          
          // Special styling for paladin selection button
          if (button.special) {
            btn.className += ' special';
            btn.style.backgroundColor = '#28a745';
            btn.style.color = 'white';
            btn.style.fontWeight = 'bold';
          }
          
          btn.innerHTML = button.text;
          btn.onclick = () => this[button.action]();
          buttonsContainer.appendChild(btn);
        });
        
        // Hide action buttons by default - they will only show during appropriate states
        dojo.setStyle(actionContainer, 'display', 'none');
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
      console.log('Player passed:', notif.args.player_name);
      // Update UI to show player passed
    },

    notif_pray: function(notif) {
      console.log('Player prayed:', notif.args.player_name, 'Action space:', notif.args.action_space);
      // Update UI to show prayer action
    },

    notif_recruitDiscard: function(notif) {
      console.log('Player discarded townsfolk:', notif.args.player_name);
      // Update UI to show townsfolk discard
    },

    notif_recruitHire: function(notif) {
      console.log('Player hired townsfolk:', notif.args.player_name);
      // Update UI to show townsfolk hire
    },

    notif_develop: function(notif) {
      console.log('Player developed:', notif.args.player_name, 'Action space:', notif.args.action_space);
      // Update UI to show development
    },

    notif_hunt: function(notif) {
      console.log('Player hunted:', notif.args.player_name, 'Provisions gained:', notif.args.provisions);
      // Update UI to show hunt results
    },

    notif_trade: function(notif) {
      console.log('Player traded:', notif.args.player_name, 'Silver gained:', notif.args.silver);
      // Update UI to show trade results
    },

    notif_conspire: function(notif) {
      console.log('Player conspired:', notif.args.player_name);
      console.log('Tax info:', notif.args.tax_given, notif.args.tax_amount, notif.args.tax_supply);
      // Update UI to show conspiracy
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_clearActionSpaces: function(notif) {
      console.log('Action spaces cleared for new round');
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_initializeTaxSupply: function(notif) {
      console.log('Tax supply initialized with:', notif.args.tax_amount, 'silver');
      // Update tax supply display if needed
    },

    notif_inquisition: function(notif) {
      console.log('Inquisition triggered!');
      console.log('Players with debt:', notif.args.players_with_debt);
      console.log('Tax refill amount:', notif.args.tax_refill);
      // Update UI to show inquisition results
    },

    notif_commission: function(notif) {
      console.log('Player commissioned monk:', notif.args.player_name);
      console.log('Board position:', notif.args.board_position);
      // Update UI to show monk commission
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_fortify: function(notif) {
      console.log('Player fortified with wall:', notif.args.player_name);
      // Update UI to show wall building
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_garrison: function(notif) {
      console.log('Player garrisoned outpost:', notif.args.player_name);
      console.log('Board position:', notif.args.board_position);
      // Update UI to show outpost placement
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_absolve: function(notif) {
      console.log('Player absolved sins:', notif.args.player_name);
      console.log('Jar position:', notif.args.jar_position);
      // Update UI to show absolution
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_attack: function(notif) {
      console.log('Player attacked outsider:', notif.args.player_name);
      console.log('Outsider card ID:', notif.args.outsider_card_id);
      console.log('Silver cost:', notif.args.silver_cost);
      // Update UI to show attack
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_convert: function(notif) {
      console.log('Player converted outsider:', notif.args.player_name);
      console.log('Outsider card ID:', notif.args.outsider_card_id);
      // Update UI to show conversion
      // Refresh action buttons to update availability
      this.updateActionButtons();
    },

    notif_fortify: function(notif) {
      console.log('Player fortified:', notif.args.player_name);
      // Update UI to show fortification
    },

    notif_garrison: function(notif) {
      console.log('Player garrisoned outpost:', notif.args.player_name);
      // Update UI to show outpost garrison
    },

    notif_absolve: function(notif) {
      console.log('Player absolved:', notif.args.player_name);
      // Update UI to show absolution
    },

    notif_attack: function(notif) {
      console.log('Player attacked outsider:', notif.args.player_name);
      // Update UI to show attack
    },

    notif_convert: function(notif) {
      console.log('Player converted outsider:', notif.args.player_name);
      // Update UI to show conversion
    },

    notif_kingsFavor: function(notif) {
      console.log('Player used King\'s Favor:', notif.args.player_name);
      // Update UI to show King's Favor use
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
        'kingsFavor': { workers: 1, specific: [] }
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
      
      console.log('Available workers for selection:', availableWorkers);
      
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
        'kingsFavor': () => this.ajaxcall('/paladinsshipped/paladinsshipped/kingsFavor.html', { worker_id: params.worker1_id, kings_favor_id: params.kings_favor_id }, this, function(result) {}, function(is_error) {})
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
        console.error('Game data not available');
        return [];
      }
      
      const playerData = this.gamedatas.players[currentPlayerId];
      
      if (!playerData) {
        console.error('Player data not found for ID:', currentPlayerId);
        console.log('Available players:', Object.keys(this.gamedatas.players));
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
        console.log(`Player ${currentPlayerId} has ${count} ${workerType.type}`);
        for (let i = 0; i < count; i++) {
          availableWorkers.push({
            id: workerId++,
            type: workerType.type,
            name: workerType.name,
            color: workerType.color
          });
        }
      });

      console.log(`Total available workers for player ${currentPlayerId}:`, availableWorkers.length);
      return availableWorkers;
    },

    updatePlayerResourceTable: function(player_id, player_data) {
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

      // Update each resource element
      for (const [resource, value] of Object.entries(resourceElements)) {
        const element = document.getElementById(`${resource}_${player_id}`);
        if (element) {
          element.textContent = value;
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

    // Function to set data attributes on player boards for identification
    setPlayerBoardAttributes: function() {
      if (!this.gamedatas || !this.gamedatas.players) {
        return;
      }

      const currentUserId = this.player_id;
      const activePlayerId = this.gamedatas.gamestate.active_player;

      console.log("Setting player board attributes:");
      console.log("Current user ID:", currentUserId);
      console.log("Active player ID:", activePlayerId);

      // Set attributes for each player board
      for (const playerId in this.gamedatas.players) {
        const playerBoard = document.getElementById('playerboard_' + playerId);
        const playerNameHeader = document.getElementById('player_name_' + playerId);
        
        if (playerBoard) {
          // Set current user attribute
          if (playerId == currentUserId) {
            playerBoard.setAttribute('data-current-user', 'true');
            console.log("Marked player board as current user:", playerId);
          } else {
            playerBoard.setAttribute('data-current-user', 'false');
          }

          // Set active player attribute
          if (playerId == activePlayerId) {
            playerBoard.setAttribute('data-active-player', 'true');
            console.log("Marked player board as active player:", playerId);
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
            console.log("Applying player color to header:", playerId, playerColor);
            
            // Set the background color to the player's color
            playerNameHeader.style.background = `linear-gradient(135deg, ${playerColor}, ${this.darkenColor(playerColor, 0.2)})`;
            
            // Adjust text color for better contrast
            const textColor = this.getContrastColor(playerColor);
            playerNameHeader.style.color = textColor;
            playerNameHeader.querySelector('h3').style.color = textColor;
          }
          
          console.log("Updated player name header for", playerId, ":", headerText + indicators);
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

      // Check if we already reordered for this user
      if (this.lastReorderedUser === currentUserId) {
        console.log("Already reordered for user:", currentUserId);
        return;
      }

      console.log("Reordering player areas...");
      console.log("Current user ID:", currentUserId);
      console.log("Active player ID:", this.gamedatas.gamestate.active_player);
      console.log("All player IDs:", Object.keys(this.gamedatas.players));

      // Get all player board elements
      const playerBoards = playersBoardContainer.querySelectorAll('.playerboard');
      if (playerBoards.length <= 1) {
        return; // No need to reorder if there's only one player
      }

      // Create the desired order: current user first, then others in turn order
      const allPlayerIds = Object.keys(this.gamedatas.players);
      const desiredOrder = [currentUserId];
      
      // Add other players in turn order (clockwise from current user)
      const currentUserIndex = allPlayerIds.indexOf(currentUserId);
      for (let i = 1; i < allPlayerIds.length; i++) {
        const nextIndex = (currentUserIndex + i) % allPlayerIds.length;
        desiredOrder.push(allPlayerIds[nextIndex]);
      }

      console.log("Desired player order:", desiredOrder);

      // Reorder the player boards
      desiredOrder.forEach(playerId => {
        const playerBoard = document.getElementById('playerboard_' + playerId);
        if (playerBoard) {
          playersBoardContainer.appendChild(playerBoard);
        }
      });

      // Update the order tracking
      this.lastReorderedUser = currentUserId;
      
      console.log("Player areas reordered. New order:", desiredOrder);
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
  });
});
