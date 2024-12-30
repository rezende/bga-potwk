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
        townsfolk: { cssClass: "townsfolk" },
        paladin_card: { cssClass: "paladin_card" }
      };

      this.uiItems.itemBackgroundConfig = {
        outsider: {
          items_per_row: 8,
          width: 160,
          height: 250,
          type_property: "type_arg",
        },
        townsfolk: {
          items_per_row: 6,
          width: 160,
          height: 250,
          type_property: "type_arg",
        },
        paladin_card: {
          items_per_row: 7,
          width: 160,
          height: 250,
          type_property: "type_arg"
        }
      };

      this.uiItems.getByUiType = function (uiType) {
        return this.filter(function (u) { return u.uiType == uiType });
      };

      this.uiItems.getByUid = function (uid) {
        return this.find(function (u) { return u.uid == uid });
      }

      this.uiItems.getBackgroundPosition = function (uiType, typeArg) {
        var background = { x: 0, y: 0 };
        background.x =
          (typeArg % this.itemBackgroundConfig[uiType].items_per_row) *
          -1 *
          this.itemBackgroundConfig[uiType]["width"];
        background.y =
          Math.floor(
            typeArg / this.itemBackgroundConfig[uiType].items_per_row
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
          background.x + "px" + " " + background.y + "px"
        );
      };

      this.uiItems.createAndAddItem = function (uiType, params) {
        this._lastUid++;
        var htmlNode = null;
        var clickHandler = null;
        htmlNode = dojo.create("div", {
          class: this.itemConfig[uiType].cssClass,
        });
        dojo.setAttr(htmlNode, "id", "uid-" + this._lastUid);

        dojo.setAttr(htmlNode, "data-uid", "uid-" + this._lastUid);
        clickHandler = dojo.connect(htmlNode, "onclick", _self, "onClickUiItem");

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
        this.createItemsViaCallback(function (d) {
          return uiType;
        }, dataArray);
      };

      this.uiItems.createItemsViaCallback = function (dataCallback, dataArray) {
        for (var i = 0; i < dataArray.length; i++) {
          const data = dataArray[i];
          this.createAndAddItem(dataCallback(data), data);
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
        debugger
        for (var i = 0; i < items.length; i++) {
          items[i].isSelectable = true;
          dojo.addClass(items[i].htmlNode, "selectable");
        }
        this.resetSelectableAnimation();
      };

      this.uiItems.resetSelectableAnimation = function ()          //need code to restart it - https://css-tricks.com/restart-css-animation/
      {
        const items = this.getSelectableItems(false);
        for (var i = 0; i < items.length; i++) {
          items[i].htmlNode.classList.remove("selectable");
          void items[i].htmlNode.offsetWidth;
          items[i].htmlNode.classList.add("selectable");
        }
      };

      this.uiItems.getSelectedItems = function () {
        return this.filter(function (u) { return u.isSelected; });
      };

      this.uiItems.getSelectableItems = function (includeSelected) {
        if (includeSelected)
          return this.filter(function (u) { return u.isSelectable; });
        return this.filter(function (u) { return u.isSelectable && !u.isSelected; });
      };

      this.uiItems.toggleSelection = function (uiItem) {
        if (uiItem.isSelectable) {
          if (uiItem.isSelected) {
            dojo.addClass(uiItem.htmlNode, "selectable");
            dojo.removeClass(uiItem.htmlNode, "selected");
          }
          else {
            dojo.removeClass(uiItem.htmlNode, "selectable")
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
      console.log("gameDatas", gamedatas);
      this.min_width_viewport = gamedatas.game_interface_width.min;
      this.max_width_viewport = gamedatas.game_interface_width.max;
      this.onScreenWidthChange();

      console.log("Starting game setup");
      this.outsider_display = gamedatas.outsider_display;
      this.townsfolk_display = gamedatas.townsfolk_display;
      this.townsfolk_material = gamedatas.townsfolk_material;
      this.paladin_material = gamedatas.paladin_material;
      this.paladin_hand = gamedatas.player_paladin_hand;
      this.attachFunctionsToUiItems();

      this.uiItems.createItems(
        "outsider",
        this.getValuesFromObject(this.outsider_display)
      );
      this.uiItems.createItems(
        "townsfolk",
        this.getValuesFromObject(this.townsfolk_display)
      );
      if (this.paladin_hand) {
        this.createPaladinUiItems(this.paladin_hand);
      }
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
          $("player_board_" + player_id)
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
        ""
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
      }
    },

    createPaladinUiItems: function (cards) {
      for (var cardId in cards) {
        const card = cards[cardId];
        card.location = "paladinsSelection";
        card.isSelectable = true;
        const uiType = "paladin_card"
        const params = card
        const cardElement = this.uiItems.createAndAddItem(uiType, params);

        dojo.connect(cardElement, 'onclick', this, function () {
          this.onPaladinCardClick(cardElement.uid);
        });
      }
    },

    // State functions
    pickPaladins: function () {
      var playerId = this.player_id;
      var selectedPaladins = this.uiItems.getSelectedItems();

      if (selectedPaladins.length < 3) {
        const paladin_cards = this.uiItems.getByUiType("paladin_card").filter(function (c) { return c.data.location == "paladin_hand" && c.data.location_arg == playerId; });
        this.uiItems.makeSelectable(paladin_cards);
      }
      else if (selectedPaladins.length == 3) {
        this.sendPaladins(selectedPaladins[0].data.id, selectedPaladins[1].data.id, selectedPaladins[2].data.id);
      }
    },

    // onClick functions
    onPaladinCardClick: function (uid) {
      const card = this.uiItems.find(item => item.uid === parseInt(uid));
      if (!card) return;

      // Toggle selection
      const isSelected = dojo.hasClass(card.htmlNode, 'selected');
      if (!isSelected) {
        // Only allow selecting if less than 3 cards are selected
        const selectedCards = dojo.query('.paladin.selected');
        if (selectedCards.length >= 3) return;
      }

      dojo.toggleClass(card.htmlNode, 'selected');

      // Check if we have exactly 3 cards selected
      const selectedCards = dojo.query('.paladin.selected');
      if (selectedCards.length === 3) {
        // Get the IDs of selected cards in order
        const selectedIds = Array.from(selectedCards).map(node => {
          const uid = dojo.attr(node, 'data-uid');
          const item = this.uiItems.find(item => item.uid === parseInt(uid));
          return item.data.id;
        });

        this.onClickConfirmPaladins(selectedIds[0], selectedIds[1], selectedIds[2]);
      }
    },

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
        case 'pickPaladins':
          this.setupPaladinSelection();
          break;
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
        /* Example:
                    
                    case 'myGameState':
                    
                        // Hide the HTML block we are displaying only during this game state
                        dojo.style( 'my_html_block_id', 'display', 'none' );
                        
                        break;
                   */

        case "dummmy":
          break;
      }
    },

    // nUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      console.log("onUpdateActionButtons: " + stateName);

      if (this.isCurrentPlayerActive()) {
        switch (stateName) {
          case "hireInitialTownsfolk":
            for (const [tf_id, value] of Object.entries(
              this.townsfolk_display
            )) {
              const tf_name = this.townsfolk_material[value.type_arg].name;
              this.addActionButton(
                `btnHire_${tf_id}`,
                _(`Hire ${tf_name} (${tf_id})`),
                dojo.hitch(
                  this,
                  dojo.partial(this.onClickConfirmTownsfolk, tf_id)
                )
              );
            }
            break;
        }
      }
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
        dojo.place(uiItem.htmlNode, parentContainer);
        this.positionUiItem(uiItem);
      }
    },

    getParentContainerForUiItem: function (uiItem) {
      var containerName = "";
      if (uiItem.uiType == "outsider") {
        containerName = "outsider_cards";
      }
      if (uiItem.uiType == "townsfolk") {
        containerName = "townsfolk_cards";
      }
      if (uiItem.uiType == "paladin_card") {
        containerName = "paladin_cards";
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

    /* Example:
            
            onMyMethodToCall1: function( evt )
            {
                console.log( 'onMyMethodToCall1' );
                
                // Preventing default browser reaction
                dojo.stopEvent( evt );
    
                // Check that this action is possible (see "possibleactions" in states.inc.php)
                if( ! this.checkAction( 'myAction' ) )
                {   return; }
    
                this.ajaxcall( "/paladinsshipped/paladinsshipped/myAction.html", { 
                                                                        lock: true, 
                                                                        myArgument1: arg1, 
                                                                        myArgument2: arg2,
                                                                        ...
                                                                     }, 
                             this, function( result ) {
                                
                                // What to do after the server call if it succeeded
                                // (most of the time: nothing)
                                
                             }, function( is_error) {
    
                                // What to do after the server call in anyway (success or failure)
                                // (most of the time: nothing)
    
                             } );        
            },        
            
            */

    onClickUiItem: function (evt) {
      if (evt != null) {
        var uid = dojo.getAttr(evt.currentTarget, "data-uid").replace("uid-", "");
        var uiItem = this.uiItems.getByUid(uid);
        if (uiItem.isSelectable && this[this.currentMove] != undefined) {
          this.uiItems.toggleSelection(uiItem);
          this[this.currentMove](uiItem);
        }
      }
    },

    onClickConfirmTownsfolk: function (townsfolk_card_id) {
      this.checkAction("hireInitialTownsfolk");
      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/hireInitialTownsfolk.html",
        {
          lock: true,
          townsfolk_card_id: townsfolk_card_id,
        },
        this,
        function (result) { },
        function (error) { }
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
        function (result) { },
        function (error) { }
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

  });
});
