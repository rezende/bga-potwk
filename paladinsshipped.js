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
      }

      // TODO: Set up your game interface here, according to "gamedatas"
      // Setup game notifications to handle (see "setupNotifications" method below)
      this.addTooltipToClass(
        ".panel_parchment",
        _("Parchment, indicates the first player of each round"),
        "",
      );
      console.log("Ending game setup");
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
        const townsfolkCards = this.uiItems.getByUiType("townsfolk_uiitem");
        this.uiItems.makeSelectable(townsfolkCards);
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

      switch (stateName) {
        case "pickPaladins":
          this.setupPaladinSelection();
          break;

        case "pickTavern":
          this.setupTavernSelection();
          break;

        case "hireInitialTownsfolk":
          this.setupTownsfolkSelection();
          break;

        case "cleanupTaverns":
          dojo.setStyle("tavernsSelection", "display", "none");

        case "dummmy":
          break;
      }
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      console.log("Leaving state: " + stateName);

      switch (stateName) {
        case "pickPaladins":
          dojo.setStyle("paladinsSelection", "display", "none");
          this.uiItems.resetAllSelectable();
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
      var position = this.getPositionForUiItem(uiItem);
      if (position.top != null && position.left != null) {
        dojo.setStyle(uiItem.htmlNode, "top", position.top + "px");
        dojo.setStyle(uiItem.htmlNode, "left", position.left + "px");
      }
    },

    moveUiItemToParentContainer: function (uiItem, parentContainer) {
      if (parentContainer != null) {
        // Special handling for player townsfolk cards
        if (uiItem.uiType == "townsfolk_uiitem" && uiItem.data.location == "playerboard_cards") {
          console.log("Processing player townsfolk card:", uiItem);
          const playerboardCardsElement = document.getElementById(parentContainer);
          console.log("Looking for container:", parentContainer);
          console.log("Found element:", playerboardCardsElement);
          if (playerboardCardsElement) {
            dojo.place(uiItem.htmlNode, playerboardCardsElement);
            console.log("Placed card in container");
            // Add some margin for spacing between cards
            dojo.setStyle(uiItem.htmlNode, 'margin', '5px');
            console.log("Applied styles to card");
          } else {
            console.error("Could not find playerboard cards container:", parentContainer);
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
      console.log("notifications subscriptions setup");
      dojo.subscribe("moveParchment", this, "notif_moveParchment");
      dojo.subscribe("paladinCards", this, "notif_paladinCards");
      dojo.subscribe("revealTaverns", this, "notif_revealTaverns");
      dojo.subscribe("cleanupTaverns", this, "notif_cleanupTaverns");
      dojo.subscribe("townsfolkHired", this, "notif_townsfolkHired");

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
      
      // Create a clone of the card for animation
      const tempCard = sourceCard.htmlNode.cloneNode(true);
      dojo.setStyle(tempCard, "position", "absolute");
      dojo.setStyle(tempCard, "z-index", "1000");
      // Apply the same styling as display cards to maintain size consistency
      dojo.setStyle(tempCard, "width", "94px");
      dojo.setStyle(tempCard, "height", "145px");
      dojo.setStyle(tempCard, "transform", "scale(0.58)");
      dojo.setStyle(tempCard, "transform-origin", "top left");
      dojo.place(tempCard, "zoomBox");
      
      // Get positions
      const sourcePos = dojo.position(sourceCard.htmlNode);
      const destContainer = document.getElementById("playerboard_cards_" + playerId);
      const destPos = dojo.position(destContainer);
      
      console.log("Source position:", sourcePos);
      console.log("Destination position:", destPos);
      
      // Position temp card at source
      dojo.setStyle(tempCard, "top", sourcePos.y + "px");
      dojo.setStyle(tempCard, "left", sourcePos.x + "px");
      
      // Hide the original card during animation instead of replacing it
      dojo.setStyle(sourceCard.htmlNode, "visibility", "hidden");
      
      // Animate to destination
      const anim = dojo.fx.slideTo({
        node: tempCard,
        top: destPos.y + 10, // Add small offset
        left: destPos.x + 10,
        duration: 800,
        unit: "px"
      });
      
      anim.onEnd = () => {
        console.log("Animation completed");
        dojo.destroy(tempCard);
        
        // Remove the original card from the UI items array and DOM
        const cardIndex = this.uiItems.findIndex(item => item.uid === sourceCard.uid);
        if (cardIndex !== -1) {
          this.uiItems.splice(cardIndex, 1);
          dojo.destroy(sourceCard.htmlNode);
        }
        
        // Create the UI item for the hired card in the player's area
        // Check if it doesn't already exist to avoid duplicates
        const existingCards = this.uiItems.getByUiType("townsfolk_uiitem");
        const cardExists = existingCards.some(card => card.data.id == hiredCard.id && card.data.location == "playerboard_cards");
        
        if (!cardExists) {
          console.log("Creating UI item for hired townsfolk in player area:", hiredCard);
          hiredCard.location = "playerboard_cards";
          hiredCard.location_arg = playerId;
          this.uiItems.createItems("townsfolk_uiitem", [hiredCard]);
          
          // Force a redraw to make sure the card appears
          console.log("Forcing UI redraw after creating card");
          this.drawUi();
        } else {
          console.log("Card already exists in player area, skipping creation");
        }
      };
      
      anim.play();
    },
  });
});
