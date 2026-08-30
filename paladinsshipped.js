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

        zoomLevels: [0.7, 0.85, 1, 1.15],
        autoZoom: {
          expectedWidth: 1552,
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
        suspicion_card: { cssClass: "suspicion_card suspicion_debt_sprite" },
        debt_card: { cssClass: "debt_card suspicion_debt_sprite" },
        absolve_jar_uiitem: { cssClass: "absolve_jar" },
        development_house_uiitem: { cssClass: "development_house" },
        fort_piece_uiitem: { cssClass: "fort_piece" },
        fort_mock_piece_uiitem: { cssClass: "fort_mock_piece" },
        garrison_piece_uiitem: { cssClass: "garrison_piece" },
        monk_piece_uiitem: { cssClass: "monk_piece" },
        main_board_piece_uiitem: { cssClass: "main_board_piece" },
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
        suspicion_card: {
          one_row: true,
          items_per_row: 6,
          width: 127,
          height: 198,
          type_property: "sprite_index",
        },
        debt_card: {
          one_row: true,
          items_per_row: 6,
          width: 127,
          height: 198,
          type_property: "sprite_index",
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
        // Gets the background position for the item in the sprite sheet
        if (uiItem.uiType == "development_house_uiitem") {
          return { x: -596, y: 451 };
        }
        if (uiItem.uiType == "monk_piece_uiitem") {
          return { x: -792, y: 430 };
        }
        if (uiItem.uiType == "main_board_piece_uiitem") {
          if (uiItem.data.piece_type === "garrison") {
            return { x: -975, y: 430 };
          }
          return { x: -792, y: 430 };
        }
        if (uiItem.uiType == "fort_piece_uiitem") {
          return { x: -975, y: 430 };
        }
        if (uiItem.uiType == "garrison_piece_uiitem") {
          return { x: -975, y: 430 };
        }
        if (uiItem.uiType == "fort_mock_piece_uiitem") {
          return { x: -975, y: 430 };
        }
        if (uiItem.uiType == "suspicion_card") {
          const spriteIndex =
            uiItem.data.sprite_index !== undefined
              ? parseInt(uiItem.data.sprite_index, 10)
              : uiItem.data.show_back
                ? _self.SUSPICION_DEBT_SPRITE.SUSPICION_BACK
                : parseInt(uiItem.data.type_arg, 10);
          return this.getBackgroundPosition("suspicion_card", spriteIndex);
        }
        if (uiItem.uiType == "debt_card") {
          const spriteIndex =
            uiItem.data.sprite_index !== undefined
              ? parseInt(uiItem.data.sprite_index, 10)
              : uiItem.data.paid
                ? _self.SUSPICION_DEBT_SPRITE.DEBT_PAID
                : _self.SUSPICION_DEBT_SPRITE.DEBT_UNPAID;
          return this.getBackgroundPosition("debt_card", spriteIndex);
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
        if (uiItem.uiType === "main_board_piece_uiitem") {
          dojo.removeClass(uiItem.htmlNode, "commission");
          dojo.removeClass(uiItem.htmlNode, "garrison");
          dojo.addClass(uiItem.htmlNode, uiItem.data.piece_type);
          return;
        }
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

    KINGS_ORDER_CARD_BACK: 6,
    KINGS_FAVOUR_CARD_BACK: 10,

    // sprite_suspicion_debt.png layout (127x198 per frame, single row):
    // 0 suspicion 0-tax | 1 suspicion 1-tax | 2 suspicion 2-tax
    // 3 suspicion back  | 4 debt unpaid     | 5 debt paid
    SUSPICION_DEBT_SPRITE: {
      SUSPICION_0: 0,
      SUSPICION_1: 1,
      SUSPICION_2: 2,
      SUSPICION_BACK: 3,
      DEBT_UNPAID: 4,
      DEBT_PAID: 5,
    },

    TAX_SUPPLY_MAX_COINS: 8,

    getTaxCoinPositions: function (count) {
      const rowPlan = {
        1: [1],
        2: [2],
        3: [3],
        4: [4],
        5: [3, 2],
        6: [3, 3],
        7: [4, 3],
        8: [4, 4],
      };
      const rows = rowPlan[count] || [count];
      const positions = [];
      const xGap = 0.19;
      const yGap = 0.26;
      const baseY = 0.5 - ((rows.length - 1) * yGap) / 2;

      rows.forEach((colsInRow, rowIndex) => {
        const rowWidth = (colsInRow - 1) * xGap;
        const startX = 0.5 - rowWidth / 2;
        const y = baseY + rowIndex * yGap;
        for (let col = 0; col < colsInRow; col++) {
          positions.push([startX + col * xGap, y]);
        }
      });
      return positions;
    },

    getSuspicionDebtSpritePosition: function (spriteIndex) {
      const config = this.uiItems.itemBackgroundConfig.suspicion_card;
      return this.uiItems.getBackgroundPosition("suspicion_card", spriteIndex);
    },

    createSuspicionDebtCardElement: function (spriteIndex, extraClass) {
      const card = dojo.create("div", {
        class:
          "suspicion_debt_sprite " + (extraClass || ""),
      });
      const position = this.getSuspicionDebtSpritePosition(spriteIndex);
      dojo.setStyle(
        card,
        "background-position",
        position.x + "px " + position.y + "px",
      );
      return card;
    },

    createSuspicionCardElement: function (suspicionCard, options) {
      const opts = options || {};
      const spriteIndex = opts.show_back
        ? this.SUSPICION_DEBT_SPRITE.SUSPICION_BACK
        : parseInt(suspicionCard.type_arg, 10);
      return this.createSuspicionDebtCardElement(
        spriteIndex,
        "suspicion_card",
      );
    },

    createDebtCardElement: function (isPaid) {
      const spriteIndex = isPaid
        ? this.SUSPICION_DEBT_SPRITE.DEBT_PAID
        : this.SUSPICION_DEBT_SPRITE.DEBT_UNPAID;
      return this.createSuspicionDebtCardElement(spriteIndex, "debt_card");
    },

    showSuspicionCardPreview: function (suspicionCard) {
      if (!suspicionCard) {
        return;
      }

      const preview = this.createSuspicionCardElement(suspicionCard);
      preview.classList.add("suspicion_card_preview");
      document.body.appendChild(preview);

      window.setTimeout(() => {
        if (preview.parentNode) {
          preview.parentNode.removeChild(preview);
        }
      }, 2000);
    },

    setupBoardViewControls: function () {
      const board = document.getElementById("board");
      const controls = document.getElementById("boardViewControls");
      if (!board || !controls) {
        return;
      }

      this.setBoardView("full");

      controls.querySelectorAll("[data-board-view]").forEach((button) => {
        button.addEventListener("click", () => {
          this.setBoardView(button.dataset.boardView);
        });
      });
    },

    setBoardView: function (view) {
      const board = document.getElementById("board");
      const controls = document.getElementById("boardViewControls");
      if (!board) {
        return;
      }

      const validViews = ["full", "left", "right"];
      if (!validViews.includes(view)) {
        view = "full";
      }

      board.classList.remove(
        "board-view-full",
        "board-view-left",
        "board-view-right",
      );
      board.classList.add("board-view-" + view);

      if (controls) {
        controls.querySelectorAll("[data-board-view]").forEach((button) => {
          button.classList.toggle(
            "active",
            button.dataset.boardView === view,
          );
        });
      }

      if (this.zoomManager) {
        if (this.zoomManager.settings.autoZoom) {
          this.zoomManager.settings.autoZoom.expectedWidth =
            view === "full" ? 1552 : 1480;
        }
        this.zoomManager.zoomOrDimensionChanged();
        if (this.zoomManager.settings.autoZoom) {
          this.zoomManager.setAutoZoom();
        }
      }
    },

    setupBoardSuspicionDebtAreas: function () {
      const debtPile = document.getElementById("debt_pile");
      if (debtPile) {
        debtPile.innerHTML = "";
        debtPile.appendChild(this.createDebtCardElement(false));
      }

      const suspicionDeck = document.getElementById("suspicion_deck");
      if (suspicionDeck) {
        suspicionDeck.innerHTML = "";
        suspicionDeck.appendChild(
          this.createSuspicionDebtCardElement(
            this.SUSPICION_DEBT_SPRITE.SUSPICION_BACK,
            "suspicion_card",
          ),
        );
      }

      this.updateSuspicionDiscardDisplay(
        this.gamedatas && this.gamedatas.suspicion_discard_top,
      );
      this.updateTaxSupplyDisplay(
        this.gamedatas && this.gamedatas.tax_supply,
      );
    },

    updateSuspicionDiscardDisplay: function (suspicionCard) {
      const discardPile = document.getElementById("suspicion_discard");
      if (!discardPile) {
        return;
      }

      discardPile.innerHTML = "";
      if (suspicionCard) {
        discardPile.appendChild(this.createSuspicionCardElement(suspicionCard));
      }

      if (this.gamedatas) {
        this.gamedatas.suspicion_discard_top = suspicionCard || null;
      }
    },

    updateTaxSupplyDisplay: function (amount) {
      const container = document.getElementById("tax_supply");
      if (!container) {
        return;
      }

      container.innerHTML = "";
      const count = Math.max(
        0,
        Math.min(this.TAX_SUPPLY_MAX_COINS, parseInt(amount, 10) || 0),
      );
      if (count === 0) {
        if (this.gamedatas) {
          this.gamedatas.tax_supply = 0;
        }
        return;
      }

      const positions = this.getTaxCoinPositions(count);
      const pile = dojo.create("div", { class: "tax_supply_pile" });
      positions.forEach(([xRatio, yRatio]) => {
        const coin = dojo.create("div", { class: "tax_coin" });
        dojo.setStyle(coin, "left", xRatio * 100 + "%");
        dojo.setStyle(coin, "top", yRatio * 100 + "%");
        dojo.setStyle(coin, "transform", "translate(-50%, -50%)");
        pile.appendChild(coin);
      });
      container.appendChild(pile);

      if (this.gamedatas) {
        this.gamedatas.tax_supply = count;
      }
    },

    buildKingsDisplayItems: function (cards, slotCount, cardType, backTypeArg, idPrefix) {
      const bySpot = {};
      this.getValuesFromObject(cards).forEach((card) => {
        if (card) {
          bySpot[parseInt(card.location_arg, 10)] = card;
        }
      });
      const items = [];
      for (let i = 0; i < slotCount; i++) {
        const real = bySpot[i];
        items.push({
          type: cardType,
          type_arg: real ? parseInt(real.type_arg, 10) : backTypeArg,
          location_arg: i,
          id: real ? real.id : idPrefix + "_back_" + i,
        });
      }
      return items;
    },

    updateKingsOrderDisplay: function (cards) {
      this.kingsorder_display = cards;
      const bySpot = {};
      this.getValuesFromObject(cards).forEach((card) => {
        if (card) {
          bySpot[parseInt(card.location_arg, 10)] = card;
        }
      });
      this.uiItems.getByUiType("kingsorder_card").forEach((item) => {
        const spot = parseInt(item.data.location_arg, 10);
        const real = bySpot[spot];
        item.data.type_arg = real
          ? parseInt(real.type_arg, 10)
          : this.KINGS_ORDER_CARD_BACK;
        if (real) {
          item.data.id = real.id;
        }
        this.uiItems.setBackgroundUiItem(item);
      });
    },

    updateKingsFavourDisplay: function (cards) {
      this.kingsfavour_display = cards;
      const bySpot = {};
      this.getValuesFromObject(cards).forEach((card) => {
        if (card) {
          bySpot[parseInt(card.location_arg, 10)] = card;
        }
      });
      this.uiItems.getByUiType("kingsfavour_card").forEach((item) => {
        const spot = parseInt(item.data.location_arg, 10);
        const real = bySpot[spot];
        item.data.type_arg = real
          ? parseInt(real.type_arg, 10)
          : this.KINGS_FAVOUR_CARD_BACK;
        if (real) {
          item.data.id = real.id;
        }
        this.uiItems.setBackgroundUiItem(item);
      });
      this.updateKingsFavourUsedDisplay();
    },

    getKingsFavourUsedCardIds: function() {
      const used = (this.gamedatas && this.gamedatas.kings_favour_used) || [];
      return used.map((id) => parseInt(id, 10));
    },

    syncKingsFavourUsed: function(usedCardIds) {
      if (!this.gamedatas) {
        return;
      }

      this.gamedatas.kings_favour_used = (usedCardIds || []).map((id) => parseInt(id, 10));
      this.updateKingsFavourUsedDisplay();
    },

    getKingsFavourNewlyRevealedId: function() {
      return parseInt(this.gamedatas && this.gamedatas.kings_favour_newly_revealed, 10) || 0;
    },

    syncKingsFavourNewlyRevealed: function(newlyRevealedId) {
      if (!this.gamedatas) {
        return;
      }

      this.gamedatas.kings_favour_newly_revealed = parseInt(newlyRevealedId, 10) || 0;
      this.updateKingsFavourUsedDisplay();
    },

    getUsableKingsFavourCards: function() {
      const usedIds = this.getKingsFavourUsedCardIds();
      const newlyRevealedId = this.getKingsFavourNewlyRevealedId();

      return this.getRevealedKingsFavourCards().filter((card) => {
        const cardId = parseInt(card.id, 10);
        return cardId > 0
          && usedIds.indexOf(cardId) === -1
          && cardId !== newlyRevealedId;
      });
    },

    getRevealedKingsFavourCards: function() {
      const cards = this.kingsfavour_display || (this.gamedatas && this.gamedatas.kingsfavour_display);
      if (!cards) {
        return [];
      }

      return this.getValuesFromObject(cards).filter((card) => card && card.type === 'kings_favour');
    },

    hasRevealedKingsFavourCards: function() {
      return this.getRevealedKingsFavourCards().length > 0;
    },

    hasUnusedKingsFavourCard: function() {
      return this.getUsableKingsFavourCards().length > 0;
    },

    isKingsFavourAvailable: function() {
      return this.getUsableKingsFavourCards().length > 0;
    },

    syncKingsFavourState: function(state) {
      if (!state) {
        return;
      }

      if (state.kings_favour_used !== undefined) {
        this.syncKingsFavourUsed(state.kings_favour_used);
      }

      if (state.kings_favour_newly_revealed !== undefined) {
        this.syncKingsFavourNewlyRevealed(state.kings_favour_newly_revealed);
      }
    },

    updateKingsFavourUsedDisplay: function() {
      const usedIds = this.getKingsFavourUsedCardIds();
      const newlyRevealedId = this.getKingsFavourNewlyRevealedId();

      this.uiItems.getByUiType('kingsfavour_card').forEach((item) => {
        const spotEl = document.getElementById(`kingsfavour_spot_${item.data.location_arg}`);
        const cardId = parseInt(item.data.id, 10);
        const isUsed = !!cardId && usedIds.indexOf(cardId) !== -1;
        const isNewlyRevealed = !!cardId && cardId === newlyRevealedId;

        if (spotEl) {
          spotEl.classList.toggle('kingsfavour_used', isUsed);
          spotEl.classList.toggle('kingsfavour_new', isNewlyRevealed);
        }
      });
    },

    refreshKingsFavourActionButtons: function() {
      const currentState = this.currentMove || this.gamedatas.gamestate.name;
      if (currentState === 'playerAction') {
        this.setupActionButtons('playerAction');
        this.updateActionButtons('playerAction');
      }
    },

    // page load
    setup: function (gamedatas) {
        // Store the complete gamedatas for access throughout the game
        this.gamedatas = gamedatas;
        
        this.min_width_viewport = gamedatas.game_interface_width.min;
        this.max_width_viewport = gamedatas.game_interface_width.max;
        this.onScreenWidthChange();

        this.outsider_display = gamedatas.outsider_display;
        this.outsider_material = gamedatas.outsider_material;
        this.board_positions_material = gamedatas.board_positions_material;
        this.main_board_positions = gamedatas.main_board_positions;
        this.townsfolk_display = gamedatas.townsfolk_display;
        this.townsfolk_material = gamedatas.townsfolk_material;
        this.paladin_material = gamedatas.paladin_material;
        this.paladin_hand = gamedatas.player_paladin_hand;
        this.all_players_townsfolk_hands = gamedatas.all_players_townsfolk_hands;
        this.tavern_display = gamedatas.tavern_display;
        this.tavern_cards_material = gamedatas.tavern_cards_material;
        this.wall_cards = gamedatas.wall_cards;
        this.all_players_wall_cards = gamedatas.all_players_wall_cards || {};
        this.wall_cards_material = gamedatas.wall_cards_material || {};
        this.wall_deck_count = gamedatas.wall_deck_count;
        this.kingsorder_display = gamedatas.kingsorder_display;
        this.kingsfavour_display = gamedatas.kingsfavour_display;
        this.attachFunctionsToUiItems();
        
        this.setupMainBoardSpots();
        this.createTokens();
        this.uiItems.createItems(
          "outsider",
          this.getValuesFromObject(this.outsider_display)
        );
        this.setupMainBoardPieces();
        this.uiItems.createItems(
          "townsfolk_uiitem",
          this.getValuesFromObject(this.townsfolk_display),
        );
        if (this.paladin_hand) {
          const paladinCards = Array.isArray(this.paladin_hand)
            ? this.paladin_hand
            : Object.values(this.paladin_hand);
          if (paladinCards.length > 1) {
            this.createPaladinUiItems(this.paladin_hand);
          }
        }
        this.setupPlayerBoardPaladins();
        if (this.tavern_display) {
          this.createTavernUiItems(this.tavern_display);
        }
        if (this.all_players_townsfolk_hands) {
          this.createAllPlayersTownsfolkUiItems(this.all_players_townsfolk_hands);
        }
        this.setupWallCards();
        
        const kingsOrderCards = this.getValuesFromObject(this.kingsorder_display);
        const kingsFavourCards = this.getValuesFromObject(this.kingsfavour_display);
        
        this.setupKingsOrderCards(kingsOrderCards);
        this.setupKingsFavourCards(kingsFavourCards);
        this.syncKingsFavourUsed(gamedatas.kings_favour_used || []);
        this.syncKingsFavourNewlyRevealed(gamedatas.kings_favour_newly_revealed || 0);
        this.setupBoardSuspicionDebtAreas();
        this.setupBoardViewControls();
        this.setupNotifications();
        this.setupActionButtons();
        this.updateActionButtons(); // Ensure action buttons are properly hidden/shown based on initial state
        this.drawUi();
        this.addOutsiderTooltips();

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

          if (gamedatas.player_panels && gamedatas.player_panels[player_id]) {
            this.updatePlayerPanelResources(player_id, gamedatas.player_panels[player_id]);
          }
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

    showPaladinSelectionArea: function () {
      const paladinSelectionArea = document.getElementById("paladin_selection_area");
      if (paladinSelectionArea) {
        paladinSelectionArea.style.setProperty("display", "block", "important");
      }
    },

    hidePaladinSelectionArea: function () {
      const paladinSelectionArea = document.getElementById("paladin_selection_area");
      if (paladinSelectionArea) {
        paladinSelectionArea.style.setProperty("display", "none", "important");
      }
    },

    showTavernSelectionArea: function () {
      const tavernSelectionArea = document.getElementById("tavern_selection_area");
      if (tavernSelectionArea) {
        tavernSelectionArea.style.setProperty("display", "block", "important");
      }
    },

    hideTavernSelectionArea: function () {
      const tavernSelectionArea = document.getElementById("tavern_selection_area");
      if (tavernSelectionArea) {
        tavernSelectionArea.style.setProperty("display", "none", "important");
      }
    },

    showActionButtonsArea: function () {
      const actionContainer = document.getElementById("action_buttons");
      if (actionContainer) {
        actionContainer.style.setProperty("display", "block", "important");
      }
    },

    hideActionButtonsArea: function () {
      const actionContainer = document.getElementById("action_buttons");
      if (actionContainer) {
        actionContainer.style.setProperty("display", "none", "important");
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
          const uiItem = this.uiItems.createAndAddItem(uiType, params);
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
              id: `monk_piece_${i}_${playerId}`,
              type: "monk_piece",
              location: "playerboard",
              order_index: i,
              player_id: playerId
            };
            this.uiItems.createAndAddItem("monk_piece_uiitem", params);
            params = {
              id: `garrison_piece_${i}_${playerId}`,
              type: "garrison_piece",
              location: "playerboard",
              order_index: i,
              player_id: playerId
            };
            this.uiItems.createAndAddItem("garrison_piece_uiitem", params);
        }
        // develop spaces
        params = {
          id: `develop_space_0_${playerId}`,
          type: "fort_mock_piece",
          location: "playerboard",
          order_index: 0,
          player_id: playerId,
          parentContainer: "develop_spaces"
        };
        this.uiItems.createAndAddItem("fort_mock_piece_uiitem", params);
        params = {
          id: `develop_space_1_${playerId}`,
          type: "fort_mock_piece",
          location: "playerboard",
          order_index: 1,
          player_id: playerId,
          parentContainer: "develop_spaces"
        };
        this.uiItems.createAndAddItem("fort_mock_piece_uiitem", params);

      }
    },

    MAIN_BOARD_REGIONS: [
      { id: 0, spots: [0, 1, 2, 3] },
      { id: 1, spots: [4, 5, 6, 7, 8, 9, 10] },
      { id: 2, spots: [11, 12, 13, 14, 15, 16, 17, 18, 19] },
      { id: 3, spots: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29] },
      { id: 4, spots: [30, 31, 32, 33, 34, 35, 36] },
      { id: 5, spots: [37, 38, 39] },
    ],

    setupMainBoardSpots: function () {
      const regionsContainer = document.getElementById("main_board_regions");
      if (!regionsContainer) {
        return;
      }
      regionsContainer.innerHTML = "";

      const outsiderContainer = document.getElementById("outsider_cards");
      if (outsiderContainer) {
        outsiderContainer.innerHTML = "";
        for (let i = 0; i < 6; i++) {
          dojo.create(
            "div",
            { class: "outsider_spot", id: "outsider_spot_" + i },
            outsiderContainer
          );
        }
      }
    },

    setupMainBoardPieces: function () {
      const positions = this.main_board_positions || {};
      for (const index in positions) {
        const entry = positions[index];
        this.createMainBoardPiece(
          parseInt(index, 10),
          entry.type,
          entry.player_id
        );
      }
    },

    createMainBoardPiece: function (positionIndex, pieceType, playerId) {
      const existing = this.uiItems.filter(
        (item) =>
          item.uiType === "main_board_piece_uiitem" &&
          item.data.position_index === positionIndex
      );
      existing.forEach((item) => {
        if (item.htmlNode && item.htmlNode.parentNode) {
          item.htmlNode.parentNode.removeChild(item.htmlNode);
        }
        const idx = this.uiItems.indexOf(item);
        if (idx >= 0) {
          this.uiItems.splice(idx, 1);
        }
      });

      const uiItem = this.uiItems.createAndAddItem("main_board_piece_uiitem", {
        position_index: positionIndex,
        piece_type: pieceType,
        player_id: playerId,
      });
      this.drawUiItem(uiItem);
      return uiItem;
    },

    getMergedMainBoardPositions: function () {
      const merged = Object.assign({}, this.main_board_positions || {});
      if (this.gamedatas && this.gamedatas.board_positions) {
        for (const playerId in this.gamedatas.board_positions) {
          const playerPositions =
            this.gamedatas.board_positions[playerId].all_positions || {};
          for (const index in playerPositions) {
            merged[index] = {
              type: playerPositions[index],
              player_id: playerId,
            };
          }
        }
      }
      return merged;
    },

    refreshMainBoardPieces: function () {
      this.main_board_positions = this.getMergedMainBoardPositions();
      const currentPieces = this.uiItems
        .getByUiType("main_board_piece_uiitem")
        .slice();
      currentPieces.forEach((item) => {
        if (item.htmlNode && item.htmlNode.parentNode) {
          item.htmlNode.parentNode.removeChild(item.htmlNode);
        }
        const idx = this.uiItems.indexOf(item);
        if (idx >= 0) {
          this.uiItems.splice(idx, 1);
        }
      });
      this.setupMainBoardPieces();
    },

    addOutsiderTooltips: function () {
      const outsiderCards = this.uiItems.getByUiType("outsider");
      outsiderCards.forEach((card) => {
        const cardInfo = this.outsider_material[card.data.type_arg];
        if (!cardInfo) {
          return;
        }
        const tooltip = cardInfo.name;
        this.addTooltip(card.htmlNode, tooltip, () => tooltip);
      });
    },

    onClickBoardPositionSpot: function (evt) {
      if (this.currentMove !== "selectBoardPosition") {
        return;
      }
      const spot = evt.currentTarget;
      if (!dojo.hasClass(spot, "selectable")) {
        return;
      }
      const positionIndex = parseInt(spot.dataset.positionIndex, 10);
      const action =
        this.pendingBoardAction === "garrison"
          ? "selectGarrisonPosition"
          : "selectCommissionPosition";
      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/" + action + ".html",
        {
          lock: true,
          board_position_index: positionIndex,
        },
        this,
        function () {},
        function () {}
      );
    },

    setupBoardPositionSelection: function () {
      const spots = document.querySelectorAll(".board_position_spot");
      spots.forEach((spot) => dojo.removeClass(spot, "selectable"));
      spots.forEach((spot) => dojo.removeClass(spot, "selected"));

      const playerId = this.player_id;
      const boardInfo = this.gamedatas.board_positions[playerId];
      if (!boardInfo) {
        return;
      }

      const availablePositions =
        this.pendingBoardAction === "garrison"
          ? boardInfo.available_board_positions_by_strength || []
          : boardInfo.available_board_positions_by_faith || [];

      availablePositions.forEach((pos) => {
        const spot = document.getElementById(
          "board_position_spot_" + pos.index
        );
        if (spot) {
          dojo.addClass(spot, "selectable");
        }
      });
    },

    clearBoardPositionSelection: function () {
      document.querySelectorAll(".board_position_spot").forEach((spot) => {
        dojo.removeClass(spot, "selectable");
        dojo.removeClass(spot, "selected");
      });
    },

    updateOutsiderDisplay: function (cards) {
      const outsiderCards = this.uiItems.getByUiType("outsider");
      outsiderCards.forEach((card) => {
        if (card.htmlNode && card.htmlNode.parentNode) {
          card.htmlNode.parentNode.removeChild(card.htmlNode);
        }
        const idx = this.uiItems.indexOf(card);
        if (idx >= 0) {
          this.uiItems.splice(idx, 1);
        }
      });

      const cardValues = this.getValuesFromObject(cards);
      this.uiItems.createItems("outsider", cardValues);
      this.drawUi();
      this.addOutsiderTooltips();
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

    setupPlayerBoardPaladins: function () {
      const activePaladins = this.gamedatas.player_active_paladins || {};
      Object.keys(activePaladins).forEach((playerId) => {
        this.showPaladinOnPlayerBoard(playerId, activePaladins[playerId]);
      });
    },

    findPaladinUiItemByCardId: function (cardId) {
      return this.uiItems.find(
        (item) =>
          item.uiType === "paladin_card" &&
          String(item.data.id) === String(cardId),
      );
    },

    showPaladinOnPlayerBoard: function (playerId, card) {
      if (!card) {
        return;
      }

      playerId = String(playerId);
      let uiItem = this.findPaladinUiItemByCardId(card.id);

      if (!uiItem) {
        uiItem = this.uiItems.createAndAddItem("paladin_card", {
          ...card,
          location: "playerboard_paladin",
          location_arg: playerId,
          isSelectable: false,
        });
      } else {
        uiItem.data.location = "playerboard_paladin";
        uiItem.data.location_arg = playerId;
        uiItem.isSelectable = false;
        uiItem.isSelected = false;
        dojo.removeClass(uiItem.htmlNode, "selectable");
        dojo.removeClass(uiItem.htmlNode, "selected");
      }

      if (!this.gamedatas.player_active_paladins) {
        this.gamedatas.player_active_paladins = {};
      }
      this.gamedatas.player_active_paladins[playerId] = card;

      this.drawUiItem(uiItem);
      this.updatePaladinCardOverlay(playerId, card.type_arg);
    },

    getPaladinMaterialInfo: function (typeArg) {
      const material = this.paladin_material && this.paladin_material[typeArg];
      if (!material) {
        return null;
      }

      return {
        name: material.name || "",
        power: material.power || "",
      };
    },

    getActivePaladinAction: function (playerId) {
      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);
      let typeArg = this.gamedatas.player_active_paladins?.[playerId]?.type_arg;

      if (typeArg === undefined && playerId === String(this.player_id) && this.paladin_hand) {
        const cards = Array.isArray(this.paladin_hand)
          ? this.paladin_hand
          : Object.values(this.paladin_hand);
        if (cards.length === 1) {
          typeArg = cards[0].type_arg;
        }
      }

      if (typeArg === undefined) {
        return null;
      }

      const material = this.paladin_material?.[typeArg];
      return material?.action || null;
    },

    playerHasActiveGirardPaladin: function (playerId) {
      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);
      return this.getHuntPaladinProvisionBonus(playerId) > 0;
    },

    getHuntPaladinProvisionBonus: function (playerId) {
      // Girard only — checks this player's chosen paladin for the round, not anyone else's.
      if (this.getActivePaladinAction(playerId) !== "ACTION_HUNT") {
        return 0;
      }

      return 2;
    },

    applyPaladinWorkerSelectionHints: function (actionType, requirements) {
      if (actionType === "hunt") {
        const bonus = this.getHuntPaladinProvisionBonus(this.player_id);
        if (bonus <= 0) {
          return requirements;
        }

        const paladinCard = this.gamedatas.player_active_paladins?.[this.player_id];
        let typeArg = paladinCard?.type_arg;
        if (typeArg === undefined && this.paladin_hand) {
          const cards = Array.isArray(this.paladin_hand)
            ? this.paladin_hand
            : Object.values(this.paladin_hand);
          if (cards.length === 1) {
            typeArg = cards[0].type_arg;
          }
        }
        const paladinInfo = typeArg !== undefined ? this.getPaladinMaterialInfo(typeArg) : null;
        const paladinName = paladinInfo?.name || _("Your Paladin");

        requirements.paladinBonusNote = dojo.string.substitute(
          _("${paladin_name}: +${bonus} bonus Provisions when Hunting this Round."),
          { paladin_name: paladinName, bonus: bonus },
        );
        requirements.rewardNote = dojo.string.substitute(
          _("1 worker = 1 Provision, 2 workers = 3 Provisions (+${bonus} Paladin bonus = 3 or 5 total)"),
          { bonus: bonus },
        );
      }

      if (actionType === "fortify") {
        requirements.wildNote = _('Criminals are wild');
        const provisionCost = this.getFortifyProvisionCost(this.player_id);
        const influenceRequired = this.getFortifyInfluenceRequirement(this.player_id);

        if (this.playerHasFortifyPaladinFreeProvision(this.player_id)) {
          const paladinCard = this.gamedatas.player_active_paladins?.[this.player_id];
          const paladinInfo = paladinCard?.type_arg !== undefined
            ? this.getPaladinMaterialInfo(paladinCard.type_arg)
            : null;
          const paladinName = paladinInfo?.name || _("Your Paladin");
          requirements.paladinBonusNote = dojo.string.substitute(
            _('${paladin_name}: Fortify costs no Provisions this Round.'),
            { paladin_name: paladinName },
          );
        } else {
          requirements.provisionNote = dojo.string.substitute(
            _('Costs ${cost} Provision(s)'),
            { cost: provisionCost },
          );
        }

        requirements.influenceNote = dojo.string.substitute(
          _('Requires ${influence} Influence'),
          { influence: influenceRequired },
        );
      }

      return requirements;
    },

    updatePaladinCardOverlay: function (playerId, typeArg) {
      const spot = document.getElementById("paladin_card_spot_" + playerId);
      if (!spot) {
        return;
      }

      const info = this.getPaladinMaterialInfo(typeArg);
      let overlay = spot.querySelector(".paladin_card_overlay");

      if (!info || (!info.name && !info.power)) {
        if (overlay) {
          overlay.remove();
        }
        return;
      }

      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "paladin_card_overlay";
        spot.appendChild(overlay);
      }

      overlay.innerHTML =
        `<div class="paladin_card_overlay_name">${info.name}</div>` +
        `<div class="paladin_card_overlay_power">${info.power}</div>`;
    },

    removeDiscardedPaladinCards: function (playerId, keptCardId) {
      const discardedItems = this.uiItems.filter(
        (item) =>
          item.uiType === "paladin_card" &&
          String(item.data.id) !== String(keptCardId) &&
          (item.data.location === "paladinsSelection" ||
            item.data.location === "paladin_hand"),
      );

      discardedItems.forEach((item) => {
        if (item.htmlNode && item.htmlNode.parentNode) {
          item.htmlNode.parentNode.removeChild(item.htmlNode);
        }
        const index = this.uiItems.indexOf(item);
        if (index >= 0) {
          this.uiItems.splice(index, 1);
        }
      });
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

    setupWallCards: function () {
      const deckBackground = { type: 'wall', type_arg: 24, location: 'wall_deck' };
      this.uiItems.createAndAddItem("wall_card", deckBackground);
      this.updateWallDeckCountDisplay(this.wall_deck_count);

      if (this.all_players_wall_cards) {
        Object.keys(this.all_players_wall_cards).forEach((playerId) => {
          const cards = this.getValuesFromObject(this.all_players_wall_cards[playerId]);
          cards.forEach((card) => {
            this.addWallCardToPlayerBoard(String(playerId), card, null, false);
          });
        });
      }
    },

    resolveWallCardSlot: function (wallCard, playerId, explicitSlot) {
      if (explicitSlot !== undefined && explicitSlot !== null) {
        const slot = parseInt(explicitSlot, 10);
        if (!Number.isNaN(slot)) {
          return slot;
        }
      }

      if (wallCard.location_position !== undefined && wallCard.location_position !== null) {
        const slot = parseInt(wallCard.location_position, 10);
        if (!Number.isNaN(slot)) {
          return slot;
        }
      }

      const existing = this.uiItems.getByUiType("wall_card").filter(
        (item) => item.data.location === "wall_hand"
          && String(item.data.location_arg) === String(playerId),
      );
      return existing.length;
    },

    addWallCardToPlayerBoard: function (playerId, wallCard, explicitSlot, animate) {
      if (!wallCard) {
        return;
      }

      playerId = String(playerId);
      const slot = this.resolveWallCardSlot(wallCard, playerId, explicitSlot);
      if (Number.isNaN(slot)) {
        return;
      }

      this.hideFortPiecePlaceholder(playerId, slot);

      const existing = this.uiItems.getByUiType("wall_card").find(
        (item) => item.data.id === wallCard.id,
      );
      if (existing) {
        return;
      }

      const cardData = {
        ...wallCard,
        location: 'wall_hand',
        location_arg: playerId,
        location_position: slot,
      };
      const created = this.uiItems.createAndAddItem("wall_card", cardData);
      if (!created) {
        return;
      }

      if (animate !== false) {
        this.animateWallCardToFortSpot(created, playerId, slot);
      } else {
        this.placeWallCardInFortSpot(created, playerId, slot);
      }
    },

    placeWallCardInFortSpot: function (card, playerId, slot) {
      if (!card || !card.htmlNode) {
        return;
      }

      playerId = String(playerId);
      slot = parseInt(slot, 10);
      if (Number.isNaN(slot)) {
        return;
      }

      card.data.location = 'wall_hand';
      card.data.location_arg = playerId;
      card.data.location_position = slot;

      const targetEl = document.getElementById('fort_piece_' + slot + '_' + playerId);
      const cardEl = card.htmlNode;

      if (!targetEl) {
        this.drawUiItem(card);
        return;
      }

      dojo.place(cardEl, targetEl);
      dojo.setStyle(cardEl, 'display', 'block');
      dojo.setStyle(cardEl, 'position', 'absolute');
      dojo.setStyle(cardEl, 'top', '0');
      dojo.setStyle(cardEl, 'left', '0');
      dojo.setStyle(cardEl, 'margin', '0');
      dojo.setStyle(cardEl, 'transform', '');
      dojo.setStyle(cardEl, 'transition', '');
      dojo.setStyle(cardEl, 'z-index', '');
      dojo.setStyle(cardEl, 'pointer-events', '');
    },

    animateWallCardToFortSpot: function (card, playerId, slot) {
      playerId = String(playerId);
      slot = parseInt(slot, 10);
      const deckEl = document.getElementById('wall_deck');
      const targetEl = document.getElementById('fort_piece_' + slot + '_' + playerId);
      if (!deckEl || !targetEl || !card || !card.htmlNode) {
        this.placeWallCardInFortSpot(card, playerId, slot);
        return;
      }

      const cardEl = card.htmlNode;
      const tempCard = cardEl.cloneNode(true);
      tempCard.removeAttribute('id');
      tempCard.removeAttribute('data-uid');
      dojo.setStyle(cardEl, 'display', 'none');
      tempCard.style.display = 'block';
      tempCard.style.position = 'absolute';
      tempCard.style.zIndex = '10000';
      tempCard.style.pointerEvents = 'none';
      tempCard.style.transform = 'scale(0.8)';
      tempCard.style.transformOrigin = '0 0';
      tempCard.style.margin = '0';
      document.body.appendChild(tempCard);

      const sourceEl = deckEl.querySelector('.wall_card') || deckEl;
      const deckPos = dojo.position(sourceEl);
      const targetPos = dojo.position(targetEl);
      if (!deckPos || !targetPos) {
        tempCard.remove();
        this.placeWallCardInFortSpot(card, playerId, slot);
        return;
      }

      tempCard.style.top = deckPos.y + 'px';
      tempCard.style.left = deckPos.x + 'px';

      requestAnimationFrame(() => {
        dojo.animateProperty({
          node: tempCard,
          duration: 900,
          easing: dojo.fx.easing.quadOut,
          properties: {
            top: { start: deckPos.y, end: targetPos.y },
            left: { start: deckPos.x, end: targetPos.x },
          },
          onEnd: () => {
            tempCard.remove();
            this.placeWallCardInFortSpot(card, playerId, slot);
          },
        }).play();
      });
    },

    hideFortPiecePlaceholder: function (playerId, slot) {
      const spot = document.getElementById('fort_piece_' + slot + '_' + playerId);
      if (spot) {
        dojo.addClass(spot, 'filled');
      }
    },

    updateWallDeckCountDisplay: function (count) {
      const el = document.getElementById('wall_deck_count');
      if (!el) {
        return;
      }

      const value = Math.max(0, parseInt(count, 10) || 0);
      el.textContent = String(value);
      el.classList.toggle('wall_deck_count_empty', value === 0);

      if (this.gamedatas) {
        this.gamedatas.wall_deck_count = value;
      }
      this.wall_deck_count = value;
      this.updateActionButtons();
    },

    FORTIFY_INFLUENCE_REQUIREMENTS: [0, 1, 3, 5, 7, 9, 11],

    /** TEMP DEBUG — remove when done testing Fortify. */
    DEBUG_UNLIMITED_FORTIFY: true,

    // Major actions: 3 workers = color A + any + color B (purple wild for A or B).
    MAJOR_ACTION_TYPES: ['commission', 'fortify', 'garrison', 'absolve', 'attack', 'convert'],

    isMajorAction: function (actionType) {
      return this.MAJOR_ACTION_TYPES.indexOf(actionType) !== -1;
    },

    // Major action confirm check: each mandatory color present, purple wild (1 purple covers 1 color).
    getMajorActionMissingMandatoryColors: function (actionType, selectedWorkerCounts) {
      const cost = this.getActionWorkerCost(actionType, 3);
      const requiredColors = cost.filter((requirement) => requirement !== 'COST_ANY_WORKER');
      let purpleAvailable = parseInt(selectedWorkerCounts.purple_worker, 10) || 0;
      const missing = [];

      for (let i = 0; i < requiredColors.length; i++) {
        const color = requiredColors[i];
        const count = parseInt(selectedWorkerCounts[color], 10) || 0;
        if (count > 0) {
          continue;
        }
        if (purpleAvailable > 0) {
          purpleAvailable--;
          continue;
        }
        missing.push(color);
      }

      return missing;
    },

    selectionSatisfiesMajorActionMandatoryColors: function (actionType, selectedWorkerCounts) {
      return this.getMajorActionMissingMandatoryColors(actionType, selectedWorkerCounts).length === 0;
    },

    getMajorActionValidationMessage: function (actionType, selectedWorkerCounts, limits) {
      const missing = this.getMajorActionMissingMandatoryColors(actionType, selectedWorkerCounts);
      if (missing.length > 0) {
        const missingNames = missing.map((workerType) => this.getWorkerTypeName(workerType));
        return dojo.string.substitute(
          _('Missing: ${worker_names}'),
          { worker_names: missingNames.join(', ') },
        );
      }

      const totalSelected = Object.values(selectedWorkerCounts).reduce(
        (sum, count) => sum + (parseInt(count, 10) || 0),
        0,
      );

      if (totalSelected !== limits.max) {
        return dojo.string.substitute(
          _('This action costs ${workers} workers.'),
          { workers: limits.max },
        );
      }

      return '';
    },

    getMajorActionConfirmHint: function (actionType, selectedWorkerCounts, limits) {
      return this.getMajorActionValidationMessage(actionType, selectedWorkerCounts, limits);
    },

    canAffordMajorActionWorkers: function (actionType, playerId) {
      if (!this.isMajorAction(actionType)) {
        return false;
      }

      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);
      const player = this.gamedatas.players?.[playerId];
      if (!player) {
        return false;
      }

      const pool = {};
      [
        'white_worker', 'green_worker', 'blue_worker',
        'red_worker', 'black_worker', 'purple_worker',
      ].forEach((workerType) => {
        const count = parseInt(player[workerType], 10) || 0;
        if (count > 0) {
          pool[workerType] = count;
        }
      });

      const cost = this.getActionWorkerCost(actionType, 3);
      return this.canSatisfyWorkerCostFromPool(this.cloneWorkerPool(pool), cost);
    },

    getFortifyCount: function (playerId) {
      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);
      const player = this.gamedatas.players?.[playerId];
      return player ? parseInt(player.fortify_qty, 10) || 0 : 0;
    },

    getFortifyProvisionCost: function (playerId) {
      const fortifyCount = this.getFortifyCount(playerId);
      if (fortifyCount < 3) {
        return 1;
      }
      if (fortifyCount < 5) {
        return 2;
      }
      return 3;
    },

    getFortifyInfluenceRequirement: function (playerId) {
      const fortifyCount = this.getFortifyCount(playerId);
      return this.FORTIFY_INFLUENCE_REQUIREMENTS[fortifyCount] ?? Number.MAX_SAFE_INTEGER;
    },

    playerHasFortifyPaladinFreeProvision: function (playerId) {
      return this.getActivePaladinAction(playerId) === 'ACTION_FORTIFY';
    },

    getPlayerTotalInfluence: function (playerId) {
      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);
      const panel = this.gamedatas.player_panels?.[playerId];
      if (panel && panel.influence !== undefined) {
        return parseInt(panel.influence, 10) || 0;
      }
      const player = this.gamedatas.players?.[playerId];
      return player ? parseInt(player.influence, 10) || 0 : 0;
    },

    canAffordFortifyWorkers: function (playerId) {
      return this.canAffordMajorActionWorkers('fortify', playerId);
    },

    getFortifyBlockedReason: function (playerId) {
      playerId = playerId !== undefined ? String(playerId) : String(this.player_id);

      if (this.getFortifyCount(playerId) >= 7) {
        return _('You have already built all 7 walls.');
      }

      const wallDeckRemaining = Math.max(
        0,
        parseInt(this.wall_deck_count ?? this.gamedatas?.wall_deck_count, 10) || 0,
      );
      if (wallDeckRemaining < 1) {
        return _('No wall cards remain in the deck.');
      }

      const requiredInfluence = this.getFortifyInfluenceRequirement(playerId);
      if (this.getPlayerTotalInfluence(playerId) < requiredInfluence) {
        return dojo.string.substitute(
          _('You need at least ${influence} Influence to fortify your next wall.'),
          { influence: requiredInfluence },
        );
      }

      if (!this.playerHasFortifyPaladinFreeProvision(playerId)) {
        const provisionCost = this.getFortifyProvisionCost(playerId);
        const provisions = parseInt(this.gamedatas.players?.[playerId]?.provision, 10) || 0;
        if (provisions < provisionCost) {
          return dojo.string.substitute(
            _('You need ${cost} Provision(s) to fortify.'),
            { cost: provisionCost },
          );
        }
      }

      if (!this.canAffordFortifyWorkers(playerId)) {
        return _('You need 3 workers including at least 1 Merchant (blue) and 1 Scout (green). Criminals are wild.');
      }

      return null;
    },

    canFortify: function (playerId) {
      return this.getFortifyBlockedReason(playerId) === null;
    },

    setupKingsOrderCards: function (cards) {
      const uiItems = this.buildKingsDisplayItems(
        cards,
        3,
        "kings_order",
        this.KINGS_ORDER_CARD_BACK,
        "kingsorder"
      );
      this.uiItems.createItems("kingsorder_card", uiItems);
    },

    setupKingsFavourCards: function (cards) {
      const uiItems = this.buildKingsDisplayItems(
        cards,
        5,
        "kings_favour",
        this.KINGS_FAVOUR_CARD_BACK,
        "kingsfavour"
      );
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
      this.setupActionButtons(stateName);
      this.updateActionButtons(stateName);
      
      // Setup paladin selection area separately
      this.setupPaladinSelectionArea(stateName);
      
      // Setup townsfolk selection for hireInitialTownsfolk state
      if (stateName === 'hireInitialTownsfolk') {
        setTimeout(() => {
          this.setupTownsfolkSelection();
        }, 200);
      }
      
      // Handle paladin selection state
      if (stateName === 'pickPaladins') {
        this.showPaladinSelectionArea();
        this.setupPaladinSelection();
      }
      
      // Handle tavern selection state
      if (stateName === 'pickTavern') {
        this.showTavernSelectionModal();
      }

      if (stateName === 'selectBoardPosition') {
        this.setupBoardPositionSelection();
      } else {
        this.clearBoardPositionSelection();
      }
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
       
        switch (stateName) {
            case 'pickPaladins':
                this.hidePaladinSelectionArea();
                break;
            case 'pickTavern':
                // Hide tavern selection area when leaving this state
                this.hideTavernSelectionModal();
                break;
            case 'selectBoardPosition':
                this.clearBoardPositionSelection();
                this.pendingBoardAction = null;
                break;
        }
    },

    // nUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      this.updateActionButtons(stateName);

      if (stateName === 'pickTavern') {
        this.refreshTavernSelectionInteractability();
      }
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
          uiItem.uiType == "paladin_card" && uiItem.data.location == "playerboard_paladin"
        ) {
          const spotElement = document.getElementById(parentContainer);
          if (spotElement) {
            dojo.place(uiItem.htmlNode, spotElement);
            dojo.setStyle(uiItem.htmlNode, "display", "block");
            dojo.setStyle(uiItem.htmlNode, "position", "absolute");
            dojo.setStyle(uiItem.htmlNode, "top", "0");
            dojo.setStyle(uiItem.htmlNode, "left", "0");
            dojo.setStyle(uiItem.htmlNode, "margin", "0");
          }
        } else if (
          uiItem.uiType == "townsfolk_uiitem" && parentContainer.startsWith("townsfolk_spot_") ||
          uiItem.uiType == "outsider" && parentContainer.startsWith("outsider_spot_") ||
          uiItem.uiType == "main_board_piece_uiitem" && parentContainer.startsWith("board_position_spot_") ||
          uiItem.uiType == "kingsorder_card" && parentContainer.startsWith("kingsorder_spot_") ||
          uiItem.uiType == "kingsfavour_card" && parentContainer.startsWith("kingsfavour_spot_") ||
          uiItem.uiType == "absolve_jar_uiitem" && parentContainer.startsWith("absolve_jar_") ||
          uiItem.uiType == "development_house_uiitem" && parentContainer.startsWith("development_house_") ||
          uiItem.uiType == "fort_piece_uiitem" && parentContainer.startsWith("fort_piece_") ||
          uiItem.uiType == "wall_card" && parentContainer.startsWith("fort_piece_") ||
          uiItem.uiType == "monk_piece_uiitem" && parentContainer.startsWith("monk_piece_") ||
          uiItem.uiType == "garrison_piece_uiitem" && parentContainer.startsWith("garrison_piece_") ||
          uiItem.uiType == "fort_mock_piece_uiitem"
        ) {
          const spotElement = document.getElementById(parentContainer);
          if (spotElement) {
            dojo.place(uiItem.htmlNode, spotElement);
            if (
              uiItem.uiType == "kingsorder_card" ||
              uiItem.uiType == "kingsfavour_card"
            ) {
              dojo.setStyle(uiItem.htmlNode, "display", "block");
              dojo.setStyle(uiItem.htmlNode, "position", "relative");
            }
            if (uiItem.uiType == "wall_card") {
              dojo.setStyle(uiItem.htmlNode, "display", "block");
              dojo.setStyle(uiItem.htmlNode, "position", "absolute");
              dojo.setStyle(uiItem.htmlNode, "top", "0");
              dojo.setStyle(uiItem.htmlNode, "left", "0");
              dojo.setStyle(uiItem.htmlNode, "margin", "0");
              dojo.setStyle(uiItem.htmlNode, "transform", "");
              dojo.setStyle(uiItem.htmlNode, "transition", "");
            }
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
        containerName = "outsider_spot_" + uiItem.data.location_arg;
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
        if (uiItem.data.location == "playerboard_paladin") {
          containerName = "paladin_card_spot_" + uiItem.data.location_arg;
        } else {
          containerName = "paladin_cards";
        }
      }
      if (uiItem.uiType == "tavern_card") {
        containerName = "tavern_cards";
      }
      if (uiItem.uiType == "wall_card" && uiItem.data.type_arg == 24) {
        containerName = "wall_deck";
      }
      if (uiItem.uiType == "wall_card" && uiItem.data.location === "wall_hand") {
        const slot = uiItem.data.location_position !== undefined && uiItem.data.location_position !== null
          ? uiItem.data.location_position
          : 0;
        const ownerId = String(uiItem.data.location_arg);
        containerName = "fort_piece_" + slot + "_" + ownerId;
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
      if (uiItem.uiType == "fort_mock_piece_uiitem") {
        containerName = uiItem.data.parentContainer + "_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "monk_piece_uiitem") {
        containerName = "monk_piece_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "garrison_piece_uiitem") {
        containerName = "garrison_piece_" + uiItem.data.order_index + "_" + uiItem.data.player_id;
      }
      if (uiItem.uiType == "main_board_piece_uiitem") {
        containerName = "board_position_spot_" + uiItem.data.position_index;
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
      dojo.subscribe("kingsDisplayUpdated", this, "notif_kingsDisplayUpdated");
      dojo.subscribe("setupBoardPositions", this, "notif_setupBoardPositions");
      dojo.subscribe("commissionPositionSelected", this, "notif_commissionPositionSelected");
      dojo.subscribe("garrisonPositionSelected", this, "notif_garrisonPositionSelected");
      
      // Tavern card picked notification
      dojo.subscribe("tavernPicked", this, "notif_tavernPicked");
      
      // Paladin cards updates
      dojo.subscribe("paladinCards", this, "notif_paladinCards");
      dojo.subscribe("pickedPaladins", this, "notif_pickedPaladins");
      dojo.subscribe("keepPaladin", this, "notif_keepPaladin");
      
      // Player resources update notification
      dojo.subscribe("playerResourcesUpdated", this, "notif_playerResourcesUpdated");
      dojo.subscribe("suspicionGained", this, "notif_suspicionGained");
      dojo.subscribe("taxSupplyChanged", this, "notif_taxSupplyChanged");
      console.log("Subscribed to playerResourcesUpdated notification");
      
      // Other existing notifications...
      dojo.subscribe("revealTaverns", this, "notif_revealTaverns");
      dojo.subscribe("cleanupTaverns", this, "notif_cleanupTaverns");

      // Player action notifications
      dojo.subscribe("fortify", this, "notif_fortify");
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
      console.log("Current game state:", this.currentMove);
      
      // Update the client-side paladin hand data
      this.paladin_hand = notif.args.cards;
      
      // Create the UI items
      this.createPaladinUiItems(notif.args.cards);
      
      // Cards are dealt right before pickPaladins; show selection once they arrive
      this.showPaladinSelectionArea();
      this.setupPaladinSelection();
    },

    notif_pickedPaladins: function (notif) {
      const playerId = String(notif.args.player_id);
      const chosenCard = notif.args.chosen_card;

      if (chosenCard) {
        this.showPaladinOnPlayerBoard(playerId, chosenCard);
        this.removeDiscardedPaladinCards(playerId, chosenCard.id);
      }

      if (playerId === String(this.player_id)) {
        this.hidePaladinSelectionArea();
      }
    },

    notif_keepPaladin: function (notif) {
      if (!notif.args.card) {
        return;
      }

      this.showPaladinOnPlayerBoard(this.player_id, notif.args.card);
      this.removeDiscardedPaladinCards(this.player_id, notif.args.card.id);
      this.hidePaladinSelectionArea();
    },

    notif_revealTaverns: function (notif) {
      this.createTavernUiItems(notif.args.cards);
    },

    notif_cleanupTaverns: function (notif) {
      dojo.setStyle("tavernsSelection", "display", "none");
      this.pickedTavernCards = {};
      this.pendingTavernCardId = null;
      this.uiItems.getByUiType("tavern_card").forEach((card) => {
        if (card.htmlNode) {
          card.htmlNode.remove();
        }
      });
      this.tavern_display = {};
    },

    // Handle player resources updates (coins, provisions, workers, etc.)
    notif_playerResourcesUpdated: function (notif) {
      const player_id = String(notif.args.player_id);
      const panel_data = notif.args.panel_data;
      const player_data = notif.args.player_data;

      if (player_id && player_data && this.gamedatas.players && this.gamedatas.players[player_id]) {
        const resourceFields = [
          "coin",
          "provision",
          "white_worker",
          "green_worker",
          "blue_worker",
          "red_worker",
          "black_worker",
          "purple_worker",
          "faith",
          "strength",
          "influence",
        ];
        resourceFields.forEach((field) => {
          if (player_data[field] !== undefined) {
            this.gamedatas.players[player_id][field] = player_data[field];
          }
        });
      }

      if (player_id && panel_data) {
        this.syncPlayerResourceDataFromPanel(player_id, panel_data);
        this.updatePlayerPanelResources(player_id, panel_data);
      } else if (notif.args.all_players) {
        this.updateAllPlayerPanels();
      }
    },

    notif_suspicionGained: function(notif) {
      const player_id = String(notif.args.player_id);
      const panel_data = notif.args.panel_data;
      const suspicion_count = notif.args.suspicion_count;

      if (notif.args.suspicion_card) {
        this.showSuspicionCardPreview(notif.args.suspicion_card);
      }

      if (notif.args.tax_supply !== undefined) {
        this.updateTaxSupplyDisplay(notif.args.tax_supply);
      }

      if (panel_data) {
        if (suspicion_count !== undefined) {
          panel_data.suspicion = suspicion_count;
        }
        this.updatePlayerPanelResources(player_id, panel_data);
        if (this.gamedatas.player_panels) {
          this.gamedatas.player_panels[player_id] = panel_data;
        }
      } else if (suspicion_count !== undefined) {
        const el = document.getElementById(`panel_value_suspicion_${player_id}`);
        if (el) {
          el.textContent = suspicion_count;
        }
      }
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

    //////////////////////////////////////////////////////////////////////////////
    //////////// ACTION BUTTON HANDLERS
    ////////////

    onPass: function() {
      this.showWorkerSelectionMenu('pass', {});
    },

    onPray: function() {
      this.showWorkerSelectionMenu('pray', {});
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
      const blockedReason = this.getFortifyBlockedReason(this.player_id);
      if (blockedReason) {
        this.showMessage(blockedReason, 'error');
        return;
      }
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

    getActionButtonDefinitions: function() {
      const enabledActionIds = ['hunt', 'pray', 'fortify', 'pass'];

      const buttons = [
        { id: 'pass', text: 'Pass', action: 'onPass' },
        { id: 'pray', text: 'Pray', action: 'onPray', actionSpace: 'pray' },
        { id: 'recruitDiscard', text: 'Recruit (Discard)', action: 'onRecruitDiscard', actionSpace: 'recruit' },
        { id: 'recruitHire', text: 'Recruit (Hire)', action: 'onRecruitHire', actionSpace: 'recruit' },
        { id: 'develop', text: 'Develop', action: 'onDevelop', actionSpace: 'develop' },
        { id: 'hunt', text: 'Hunt', action: 'onHunt', actionSpace: 'hunt' },
        { id: 'trade', text: 'Trade', action: 'onTrade', actionSpace: 'trade' },
        { id: 'conspire', text: 'Conspire', action: 'onConspire', actionSpace: 'conspire' },
        { id: 'commission', text: 'Commission', action: 'onCommission', actionSpace: 'commission' },
        { id: 'fortify', text: 'Fortify', action: 'onFortify', actionSpace: 'fortify' },
        { id: 'garrison', text: 'Garrison', action: 'onGarrison', actionSpace: 'garrison' },
        { id: 'absolve', text: 'Absolve', action: 'onAbsolve', actionSpace: 'absolve' },
        { id: 'attack', text: 'Attack', action: 'onAttack', actionSpace: 'attack' },
        { id: 'convert', text: 'Convert', action: 'onConvert', actionSpace: 'convert' },
        { id: 'kingsFavour', text: "King's Favour", action: 'onKingsFavour' },
      ];

      let visibleButtons = buttons.filter((button) => enabledActionIds.includes(button.id));

      if (!this.isKingsFavourAvailable()) {
        visibleButtons = visibleButtons.filter((button) => button.id !== 'kingsFavour');
      }

      visibleButtons.sort(
        (a, b) => enabledActionIds.indexOf(a.id) - enabledActionIds.indexOf(b.id),
      );

      return visibleButtons;
    },

    setActionButtonUsedState: function(btn, isUsed, baseLabel) {
      if (!btn) {
        return;
      }

      if (!btn.dataset.baseLabel) {
        btn.dataset.baseLabel = baseLabel || btn.textContent.replace(' (used)', '');
      }

      if (isUsed) {
        btn.disabled = true;
        btn.classList.add('unavailable');
        btn.textContent = `${btn.dataset.baseLabel} (used)`;
      } else {
        btn.classList.remove('unavailable');
        btn.textContent = btn.dataset.baseLabel;
      }
    },

    applyActionSpaceInfoFromNotif: function(notif) {
      const playerId = notif.args && notif.args.player_id !== undefined
        ? String(notif.args.player_id)
        : null;

      if (!playerId || !notif.args.action_space_info) {
        return;
      }

      if (!this.gamedatas.action_spaces) {
        this.gamedatas.action_spaces = {};
      }

      this.gamedatas.action_spaces[playerId] = notif.args.action_space_info;
    },

    handleActionNotif: function(notif) {
      this.applyActionSpaceInfoFromNotif(notif);

      if (notif.args && notif.args.action_space_info && notif.args.player_id !== undefined) {
        const playerId = String(notif.args.player_id);
        Object.keys(notif.args.action_space_info).forEach((actionName) => {
          this.updateActionSpaceDisplay(playerId, actionName, notif.args.action_space_info[actionName]);
        });
      }

      if (notif.args && notif.args.panel_data && notif.args.player_id !== undefined) {
        this.syncPlayerResourceDataFromPanel(String(notif.args.player_id), notif.args.panel_data);
        this.updatePlayerPanelResources(String(notif.args.player_id), notif.args.panel_data);
      }

      this.updateActionButtons();
    },

    syncPlayerResourceDataFromPanel: function(playerId, panelData) {
      if (!panelData || !this.gamedatas.players || !this.gamedatas.players[playerId]) {
        return;
      }

      const attributeFields = ["faith", "strength", "influence"];
      attributeFields.forEach((attr) => {
        const baseKey = `${attr}_base`;
        if (panelData[baseKey] !== undefined) {
          this.gamedatas.players[playerId][attr] = panelData[baseKey];
        } else if (panelData[attr] !== undefined) {
          const bonus = panelData[`${attr}_bonus`] || 0;
          this.gamedatas.players[playerId][attr] = panelData[attr] - bonus;
        }
      });

      [
        'coin',
        'provision',
        'white_worker',
        'green_worker',
        'blue_worker',
        'red_worker',
        'black_worker',
        'purple_worker',
        'unpaid_debt',
        'paid_debt',
      ].forEach((field) => {
        if (panelData[field] !== undefined) {
          this.gamedatas.players[playerId][field] = panelData[field];
        }
      });

      if (this.gamedatas.player_panels) {
        this.gamedatas.player_panels[playerId] = panelData;
      }
    },

    setupActionButtons: function(stateName) {
      const actionContainer = document.getElementById('action_buttons');
      if (!actionContainer) return;

      const currentState = stateName || this.currentMove || this.gamedatas.gamestate.name;
      const isMyTurn = this.isCurrentPlayerActive();

      // Clear existing content
      actionContainer.innerHTML = '';

      // Only show action buttons during actual game action states
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

        const actionButtons = this.getActionButtonDefinitions();

        actionButtons.forEach(button => {
          const btn = document.createElement('button');
          btn.id = button.id + '_btn';
          btn.className = 'action_button';
          btn.dataset.baseLabel = button.text;
          btn.innerHTML = button.text;
          btn.onclick = () => this[button.action]();
          buttonsContainer.appendChild(btn);
        });

        this.showActionButtonsArea();
        this.updateIndividualActionButtons();
      } else {
        this.hideActionButtonsArea();
      }
    },

    setupPaladinSelectionArea: function(stateName) {
      const paladinSelectionArea = document.getElementById('paladin_selection_area');
      if (!paladinSelectionArea) return;

      const currentState = stateName || this.currentMove || this.gamedatas.gamestate.name;

      if (currentState === 'pickPaladins') {
        this.showPaladinSelectionArea();
        setTimeout(() => {
          this.setupPaladinSelection();
        }, 100);
      } else {
        this.hidePaladinSelectionArea();
      }
    },

    updateActionButtons: function(stateName) {
      const isMyTurn = this.isCurrentPlayerActive();
      const currentState = stateName || this.currentMove || this.gamedatas.gamestate.name;
      
      // Get all action buttons
      const actionButtons = document.querySelectorAll('.action_button');
      actionButtons.forEach(btn => {
        // Special handling for paladin selection button
        if (btn.id === 'paladinSelection_btn') {
          btn.disabled = !isMyTurn || currentState !== 'pickPaladins';
        } else if (!btn.classList.contains('unavailable')) {
          btn.disabled = !isMyTurn;
        }
        
        // Add visual feedback for available actions
        if (isMyTurn) {
          dojo.addClass(btn, 'available');
        } else {
          dojo.removeClass(btn, 'available');
        }
      });
      
      const actionContainer = document.getElementById('action_buttons');
      if (actionContainer) {
        const shouldShow = currentState === 'playerAction' && isMyTurn;
        if (shouldShow) {
          this.showActionButtonsArea();
        } else {
          this.hideActionButtonsArea();
        }
      }
      
      // Update individual button states based on action availability
      if (isMyTurn && currentState === 'playerAction') {
        this.updateIndividualActionButtons();
      }
    },

    updateIndividualActionButtons: function() {
      const currentPlayerId = this.player_id;
      const actionSpaces = this.gamedatas.action_spaces && this.gamedatas.action_spaces[currentPlayerId];

      if (!actionSpaces) {
        return;
      }

      this.getActionButtonDefinitions().forEach((buttonDef) => {
        if (buttonDef.id === 'kingsFavour') {
          const btn = document.getElementById(`${buttonDef.id}_btn`);
          if (btn) {
            this.setActionButtonUsedState(btn, !this.isKingsFavourAvailable(), buttonDef.text);
            if (this.isKingsFavourAvailable()) {
              btn.disabled = false;
            }
          }
          return;
        }

        if (!buttonDef.actionSpace) {
          return;
        }

        const btn = document.getElementById(`${buttonDef.id}_btn`);
        const isUsed = !!(actionSpaces[buttonDef.actionSpace] && actionSpaces[buttonDef.actionSpace].used);
        const effectivelyUsed = isUsed && !(this.DEBUG_UNLIMITED_FORTIFY && buttonDef.id === 'fortify');
        this.setActionButtonUsedState(btn, effectivelyUsed, buttonDef.text);

        if (btn && !effectivelyUsed) {
          btn.disabled = false;
          if (buttonDef.id === 'fortify' && !this.canFortify()) {
            btn.disabled = true;
          }
        }
      });
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// NOTIFICATION HANDLERS FOR ACTIONS
    ////////////

    notif_pass: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_pray: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_recruitDiscard: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_recruitHire: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_develop: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_hunt: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_trade: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_conspire: function(notif) {
      if (notif.args.suspicion_card) {
        this.showSuspicionCardPreview(notif.args.suspicion_card);
      }

      if (notif.args.tax_supply !== undefined) {
        this.updateTaxSupplyDisplay(notif.args.tax_supply);
      }

      this.handleActionNotif(notif);
    },

    notif_clearActionSpaces: function(notif) {
      if (this.gamedatas.action_spaces) {
        Object.keys(this.gamedatas.action_spaces).forEach((playerId) => {
          const actionNames = Object.keys(this.gamedatas.action_spaces[playerId]);
          actionNames.forEach((actionName) => {
            this.gamedatas.action_spaces[playerId][actionName] = {
              used: false,
              workers: [],
              developments: this.gamedatas.action_spaces[playerId][actionName].developments || 0,
            };
          });
        });
      }

      this.updateActionButtons();
    },

    notif_kingsFavourCleared: function(notif) {
      this.syncKingsFavourState(notif.args);
      this.refreshKingsFavourActionButtons();
    },

    notif_initializeTaxSupply: function(notif) {
      const amount = notif.args.tax_supply !== undefined
        ? notif.args.tax_supply
        : notif.args.tax_amount;
      if (amount !== undefined) {
        this.updateTaxSupplyDisplay(amount);
      }
    },

    notif_taxSupplyChanged: function(notif) {
      if (notif.args.tax_supply !== undefined) {
        this.updateTaxSupplyDisplay(notif.args.tax_supply);
      }
    },

    notif_inquisition: function(notif) {
      if (notif.args.tax_supply !== undefined) {
        this.updateTaxSupplyDisplay(notif.args.tax_supply);
      }
    },

    notif_commission: function(notif) {
      this.pendingBoardAction = 'commission';
      this.handleActionNotif(notif);
    },

    notif_fortify: function(notif) {
      if (notif.args.wall_card) {
        if (notif.args.wall_deck_count !== undefined && notif.args.wall_deck_count !== null) {
          this.updateWallDeckCountDisplay(notif.args.wall_deck_count);
        } else {
          const current = parseInt(this.wall_deck_count, 10);
          this.updateWallDeckCountDisplay(Math.max(0, (Number.isNaN(current) ? 0 : current) - 1));
        }
      }
      if (notif.args.wall_card && notif.args.player_id !== undefined) {
        const playerId = String(notif.args.player_id);
        if (this.gamedatas.players?.[playerId]) {
          this.gamedatas.players[playerId].fortify_qty =
            (parseInt(this.gamedatas.players[playerId].fortify_qty, 10) || 0) + 1;
        }
        if (!this.all_players_wall_cards) {
          this.all_players_wall_cards = {};
        }
        if (!this.all_players_wall_cards[playerId]) {
          this.all_players_wall_cards[playerId] = {};
        }
        this.all_players_wall_cards[playerId][notif.args.wall_card.id] = notif.args.wall_card;
        this.addWallCardToPlayerBoard(
          playerId,
          notif.args.wall_card,
          notif.args.wall_slot,
          true,
        );
      }
      if (notif.args.panel_data && notif.args.player_id !== undefined) {
        this.syncPlayerResourceDataFromPanel(String(notif.args.player_id), notif.args.panel_data);
        this.updatePlayerPanelResources(String(notif.args.player_id), notif.args.panel_data);
      }
      this.handleActionNotif(notif);
    },

    notif_garrison: function(notif) {
      this.pendingBoardAction = 'garrison';
      this.handleActionNotif(notif);
    },

    notif_absolve: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_attack: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_convert: function(notif) {
      this.handleActionNotif(notif);
    },

    notif_kingsFavour: function(notif) {
      this.syncKingsFavourState(notif.args);

      if (notif.args.panel_data && notif.args.player_id !== undefined) {
        this.syncPlayerResourceDataFromPanel(String(notif.args.player_id), notif.args.panel_data);
        this.updatePlayerPanelResources(String(notif.args.player_id), notif.args.panel_data);
      }

      this.refreshKingsFavourActionButtons();
    },

    //////////////////////////////////////////////////////////////////////////////
    //////////// WORKER SELECTION MENU
    ////////////

    getWorkerTypeDefinitions: function() {
      return [
        { type: 'white_worker', name: 'Labourer', iconClass: 'panel_icon_white_worker' },
        { type: 'green_worker', name: 'Scout', iconClass: 'panel_icon_green_worker' },
        { type: 'red_worker', name: 'Fighter', iconClass: 'panel_icon_red_worker' },
        { type: 'blue_worker', name: 'Merchant', iconClass: 'panel_icon_blue_worker' },
        { type: 'black_worker', name: 'Cleric', iconClass: 'panel_icon_black_worker' },
        { type: 'purple_worker', name: 'Criminal', iconClass: 'panel_icon_purple_worker' },
      ];
    },

    getWorkerTypeName: function(workerType) {
      const definition = this.getWorkerTypeDefinitions().find((worker) => worker.type === workerType);
      return definition ? definition.name : workerType;
    },

    formatWorkerRequirements: function(requirements) {
      if (!requirements.specific.length) {
        return '';
      }

      const names = requirements.specific.map((workerType) => this.getWorkerTypeName(workerType));
      if (requirements.wildNote) {
        return `${names.join(', ')} (${requirements.wildNote})`;
      }

      return names.join(', ');
    },

    getActionWorkerCost: function(actionType, workerCount) {
      const count = workerCount !== undefined ? workerCount : null;

      if (actionType === 'hunt') {
        if (count === 1) {
          return ['COST_ANY_WORKER'];
        }
        if (count === 2) {
          return ['COST_ANY_WORKER', 'green_worker'];
        }
        return ['COST_ANY_WORKER', 'green_worker'];
      }

      const costs = {
        pass: [],
        pray: ['black_worker'],
        recruitDiscard: ['COST_ANY_WORKER'],
        recruitHire: ['COST_ANY_WORKER', 'red_worker'],
        develop: ['COST_ANY_WORKER', 'COST_ANY_WORKER'],
        trade: ['COST_ANY_WORKER', 'blue_worker'],
        conspire: ['COST_ANY_WORKER'],
        commission: ['green_worker', 'COST_ANY_WORKER', 'black_worker'],
        fortify: ['blue_worker', 'COST_ANY_WORKER', 'green_worker'],
        garrison: ['blue_worker', 'COST_ANY_WORKER', 'red_worker'],
        absolve: ['black_worker', 'COST_ANY_WORKER', 'blue_worker'],
        attack: ['green_worker', 'COST_ANY_WORKER', 'red_worker'],
        convert: ['red_worker', 'COST_ANY_WORKER', 'black_worker'],
        kingsFavour: ['COST_ANY_WORKER'],
      };

      return costs[actionType] || [];
    },

    cloneWorkerPool: function(selectedWorkerCounts) {
      const pool = {};
      Object.keys(selectedWorkerCounts).forEach((workerType) => {
        const count = parseInt(selectedWorkerCounts[workerType], 10) || 0;
        if (count > 0) {
          pool[workerType] = count;
        }
      });
      return pool;
    },

    takeWorkerFromPool: function(pool, workerType) {
      if (!pool[workerType] || pool[workerType] <= 0) {
        return false;
      }

      pool[workerType]--;
      if (pool[workerType] <= 0) {
        delete pool[workerType];
      }
      return true;
    },

    getWorkerTypesForCostSlot: function(pool, cost, costIndex, requiredType) {
      if (requiredType === 'COST_ANY_WORKER') {
        const remainingSpecific = {};
        for (let i = costIndex + 1; i < cost.length; i++) {
          if (cost[i] !== 'COST_ANY_WORKER') {
            remainingSpecific[cost[i]] = true;
          }
        }

        const preferred = [];
        const reserved = [];
        Object.keys(pool).forEach((type) => {
          if (pool[type] <= 0) {
            return;
          }
          if (remainingSpecific[type]) {
            reserved.push(type);
          } else {
            preferred.push(type);
          }
        });

        return preferred.concat(reserved);
      }

      const candidates = [];
      if (pool[requiredType] > 0) {
        candidates.push(requiredType);
      }
      if (requiredType !== 'purple_worker' && pool.purple_worker > 0) {
        candidates.push('purple_worker');
      }
      return candidates;
    },

    canSatisfyWorkerCostFromPool: function(pool, cost, costIndex) {
      const index = costIndex || 0;
      if (index >= cost.length) {
        return true;
      }

      const candidateTypes = this.getWorkerTypesForCostSlot(pool, cost, index, cost[index]);
      for (let i = 0; i < candidateTypes.length; i++) {
        const workerType = candidateTypes[i];
        const nextPool = this.cloneWorkerPool(pool);
        if (!this.takeWorkerFromPool(nextPool, workerType)) {
          continue;
        }
        if (this.canSatisfyWorkerCostFromPool(nextPool, cost, index + 1)) {
          return true;
        }
      }

      return false;
    },

    consumeWorkerFromPool: function(pool, requiredType) {
      if (requiredType === 'COST_ANY_WORKER') {
        const types = Object.keys(pool);
        for (let i = 0; i < types.length; i++) {
          const workerType = types[i];
          if (pool[workerType] > 0) {
            pool[workerType]--;
            if (pool[workerType] <= 0) {
              delete pool[workerType];
            }
            return true;
          }
        }
        return false;
      }

      if (pool[requiredType] > 0) {
        pool[requiredType]--;
        if (pool[requiredType] <= 0) {
          delete pool[requiredType];
        }
        return true;
      }

      if (requiredType !== 'purple_worker' && pool.purple_worker > 0) {
        pool.purple_worker--;
        if (pool.purple_worker <= 0) {
          delete pool.purple_worker;
        }
        return true;
      }

      return false;
    },

    validateSelectedWorkersForAction: function(actionType, selectedWorkerCounts) {
      const limits = this.getWorkerRequirementLimits(actionType);
      const totalSelected = Object.values(selectedWorkerCounts).reduce(
        (sum, count) => sum + (parseInt(count, 10) || 0),
        0,
      );

      if (this.isMajorAction(actionType)) {
        const message = this.getMajorActionValidationMessage(actionType, selectedWorkerCounts, limits);
        if (message) {
          return { valid: false, message: message };
        }
        return { valid: true, message: '' };
      }

      if (totalSelected < limits.min || totalSelected > limits.max) {
        return {
          valid: false,
          message: dojo.string.substitute(
            _('Please select between ${min_workers} and ${max_workers} workers for this action.'),
            { min_workers: limits.min, max_workers: limits.max },
          ),
        };
      }

      const cost = this.getActionWorkerCost(actionType, totalSelected);
      const pool = this.cloneWorkerPool(selectedWorkerCounts);
      if (!this.canSatisfyWorkerCostFromPool(pool, cost)) {
        return {
          valid: false,
          message: this.getWorkerValidationErrorMessage(actionType, cost),
        };
      }

      return { valid: true, message: '' };
    },

    getWorkerValidationErrorMessage: function(actionType, cost) {
      if (actionType === 'hunt') {
        if (cost.length === 1) {
          return _('Invalid worker selection for Hunt.');
        }
        return _('When hunting with 2 workers, one must be a Scout (green) or Criminal (purple, wild).');
      }

      const specificRequirements = cost.filter((requirement) => requirement !== 'COST_ANY_WORKER');
      if (specificRequirements.length === 1) {
        const workerName = this.getWorkerTypeName(specificRequirements[0]);
        return dojo.string.substitute(
          _('This action requires a ${worker_name}. Criminals (purple workers) can be used as a wild card.'),
          { worker_name: workerName },
        );
      }

      if (specificRequirements.length > 1) {
        const workerNames = specificRequirements.map((workerType) => this.getWorkerTypeName(workerType)).join(', ');
        return dojo.string.substitute(
          _('This action requires specific workers: ${worker_names}. Criminals (purple workers) can be used as a wild card.'),
          { worker_names: workerNames },
        );
      }

      return _('Invalid worker selection for this action.');
    },

    showWorkerValidationError: function(message) {
      const errorEl = document.getElementById('worker_validation_error');
      if (!errorEl) {
        this.showMessage(message, 'error');
        return;
      }

      errorEl.textContent = message;
      errorEl.classList.remove('worker_confirm_hint');
      errorEl.style.display = 'block';
    },

    showWorkerConfirmHint: function(message) {
      const errorEl = document.getElementById('worker_validation_error');
      if (!errorEl || !message) {
        return;
      }

      errorEl.textContent = message;
      errorEl.classList.add('worker_confirm_hint');
      errorEl.style.display = 'block';
    },

    clearWorkerValidationError: function() {
      const errorEl = document.getElementById('worker_validation_error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('worker_confirm_hint');
        errorEl.style.display = 'none';
      }
    },

    showWorkerSelectionMenu: function(actionType, actionParams) {
      // Store the current action being performed
      this.currentAction = {
        type: actionType,
        params: actionParams,
        selectedWorkerCounts: {
          white_worker: 0,
          green_worker: 0,
          blue_worker: 0,
          red_worker: 0,
          black_worker: 0,
          purple_worker: 0,
        },
      };

      // Get worker requirements for this action
      const requirements = this.applyPaladinWorkerSelectionHints(
        actionType,
        this.getWorkerRequirements(actionType),
      );
      
      // Create and show the worker selection panel in place of action buttons
      this.createWorkerSelectionPanel(actionType, requirements);
    },

    getWorkerRequirements: function(actionType) {
      // Define worker requirements for each action type
      const requirements = {
        'pass': {
          workers: 3,
          minWorkers: 0,
          maxWorkers: 3,
          specific: [],
          keepNote: _('Choose up to 3 workers to keep for next round'),
        },
        'pray': {
          workers: 1,
          minWorkers: 1,
          maxWorkers: 1,
          specific: ['black_worker'],
          allowedWorkerTypes: ['black_worker', 'purple_worker'],
          wildNote: _('Criminals are wild for Cleric'),
          silverNote: _('Also costs 2 Silver'),
        },
        'recruitDiscard': { workers: 1, minWorkers: 1, maxWorkers: 1, specific: [] },
        'recruitHire': { workers: 2, minWorkers: 2, maxWorkers: 2, specific: ['red_worker'] },
        'develop': { workers: 2, minWorkers: 2, maxWorkers: 2, specific: [] },
        'hunt': {
          workers: 2,
          minWorkers: 1,
          maxWorkers: 2,
          specific: ['green_worker'],
          wildNote: _('Criminals are wild'),
          rewardNote: _('1 worker = 1 Provision, 2 workers = 3 Provisions'),
        },
        'trade': { workers: 2, minWorkers: 1, maxWorkers: 2, specific: ['blue_worker'] },
        'conspire': { workers: 1, minWorkers: 1, maxWorkers: 1, specific: [] },
        'commission': { workers: 3, minWorkers: 3, maxWorkers: 3, specific: ['green_worker', 'black_worker'], wildNote: _('Criminals are wild') },
        'fortify': {
          workers: 3,
          minWorkers: 3,
          maxWorkers: 3,
          specific: ['blue_worker', 'green_worker'],
          wildNote: _('Criminals are wild'),
        },
        // Major actions: two specific colors + any third (see getActionWorkerCost / player_spaces_material).
        'garrison': { workers: 3, minWorkers: 3, maxWorkers: 3, specific: ['blue_worker', 'red_worker'], wildNote: _('Criminals are wild') },
        'absolve': { workers: 3, minWorkers: 3, maxWorkers: 3, specific: ['black_worker', 'blue_worker'], wildNote: _('Criminals are wild') },
        'attack': { workers: 3, minWorkers: 3, maxWorkers: 3, specific: ['green_worker', 'red_worker'], wildNote: _('Criminals are wild') },
        'convert': { workers: 3, minWorkers: 3, maxWorkers: 3, specific: ['red_worker', 'black_worker'], wildNote: _('Criminals are wild') },
        'kingsFavour': { workers: 1, minWorkers: 1, maxWorkers: 1, specific: [] }
      };

      return requirements[actionType] || { workers: 0, minWorkers: 0, maxWorkers: 0, specific: [] };
    },

    getWorkerRequirementLimits: function(actionType) {
      if (actionType === 'pass') {
        const totalAvailable = this.getTotalPassAvailableWorkers();
        return {
          min: 0,
          max: Math.min(3, totalAvailable),
        };
      }

      const requirements = this.getWorkerRequirements(actionType);
      return {
        min: requirements.minWorkers !== undefined ? requirements.minWorkers : requirements.workers,
        max: requirements.maxWorkers !== undefined ? requirements.maxWorkers : requirements.workers,
      };
    },

    formatWorkerRequirementSummary: function(requirements) {
      const limits = {
        min: requirements.minWorkers !== undefined ? requirements.minWorkers : requirements.workers,
        max: requirements.maxWorkers !== undefined ? requirements.maxWorkers : requirements.workers,
      };

      if (limits.min === limits.max) {
        return `${limits.min}`;
      }

      return `${limits.min}-${limits.max}`;
    },

    createWorkerSelectionPanel: function(actionType, requirements) {
      const actionContainer = document.getElementById('action_buttons');
      if (!actionContainer) {
        return;
      }

      actionContainer.innerHTML = '';

      const panel = document.createElement('div');
      panel.id = 'worker_selection_panel';
      panel.className = 'worker_selection_panel';

      const panelContent = document.createElement('div');
      panelContent.className = 'worker_selection_content';

      const header = document.createElement('div');
      header.className = 'worker_selection_header';
      if (actionType === 'pass') {
        header.innerHTML = `<h3>${_('Choose Workers to Keep')}</h3>`;
      } else {
        const actionLabel = this.getActionDisplayName(actionType) || actionType;
        header.innerHTML = `<h3>${dojo.string.substitute(_('Select Workers for ${action}'), { action: actionLabel })}</h3>`;
      }
      panelContent.appendChild(header);

      const requirementsInfo = document.createElement('div');
      requirementsInfo.className = 'worker_requirements_info';
      if (actionType === 'pass') {
        requirementsInfo.innerHTML = `
          <p><strong>${_('Choose up to 3 workers to keep for next round')}</strong></p>
        `;
      } else {
        const limits = this.getWorkerRequirementLimits(actionType);
        const workerRequirementLine = actionType === 'pray'
          ? `<p><strong>${_('Worker:')}</strong> ${this.formatWorkerRequirements(requirements)}</p>`
          : (requirements.specific.length > 0
            ? `<p><strong>${limits.min === 3 && limits.max === 3 ? _('Workers:') : _('With 2 workers:')}</strong> ${this.formatWorkerRequirements(requirements)}</p>`
            : '');
        requirementsInfo.innerHTML = `
          <p><strong>Required:</strong> ${this.formatWorkerRequirementSummary(requirements)} worker(s)</p>
          ${workerRequirementLine}
          ${requirements.influenceNote ? `<p><strong>${_('Influence:')}</strong> ${requirements.influenceNote}</p>` : ''}
          ${requirements.provisionNote ? `<p><strong>${_('Cost:')}</strong> ${requirements.provisionNote}</p>` : ''}
          ${requirements.silverNote ? `<p><strong>Cost:</strong> ${requirements.silverNote}</p>` : ''}
          ${requirements.rewardNote ? `<p><strong>Reward:</strong> ${requirements.rewardNote}</p>` : ''}
          ${requirements.paladinBonusNote ? `<p class="paladin_bonus_note">${requirements.paladinBonusNote}</p>` : ''}
        `;
      }
      panelContent.appendChild(requirementsInfo);

      if (actionType === 'pray') {
        const prayActionSelection = document.createElement('div');
        prayActionSelection.id = 'pray_action_selection_area';
        prayActionSelection.className = 'pray_action_selection_area';
        panelContent.appendChild(prayActionSelection);
      }

      const validationError = document.createElement('div');
      validationError.id = 'worker_validation_error';
      validationError.className = 'worker_validation_error';
      validationError.style.display = 'none';
      panelContent.appendChild(validationError);

      const workerSelection = document.createElement('div');
      workerSelection.className = 'worker_selection_area';
      workerSelection.id = 'worker_selection_area';
      panelContent.appendChild(workerSelection);

      const actionButtons = document.createElement('div');
      actionButtons.className = 'worker_selection_actions';

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'action_button primary';
      confirmBtn.innerHTML = actionType === 'pass' ? _('Confirm Pass') : _('Confirm Action');
      confirmBtn.onclick = () => this.confirmWorkerSelection();
      actionButtons.appendChild(confirmBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'action_button secondary';
      cancelBtn.innerHTML = _('Cancel');
      cancelBtn.onclick = () => this.hideWorkerSelectionPanel();
      actionButtons.appendChild(cancelBtn);

      panelContent.appendChild(actionButtons);
      panel.appendChild(panelContent);
      actionContainer.appendChild(panel);
      this.showActionButtonsArea();
      this.populateAvailableWorkers();
    },

    populateAvailableWorkers: function() {
      const workerSelectionArea = document.getElementById('worker_selection_area');
      if (!workerSelectionArea) return;

      // Clear existing content
      workerSelectionArea.innerHTML = '';

      // Get current player's workers from game data
      const actionType = this.currentAction ? this.currentAction.type : null;
      const availableWorkers = actionType === 'pass'
        ? this.getPassAvailableWorkers()
        : this.getCurrentPlayerWorkers();
      
      if (availableWorkers.length === 0) {
        workerSelectionArea.innerHTML = `<p style="text-align: center; color: #6c757d; font-style: italic;">${_('No workers available')}</p>`;
        this.updateConfirmButtonState();
        return;
      }

      // Create one selectable card per worker color the player has
      availableWorkers.forEach(worker => {
        const workerCard = document.createElement('div');
        workerCard.className = 'worker_selection_card';
        workerCard.dataset.workerType = worker.type;
        workerCard.dataset.workerAvailable = String(worker.available);
        
        workerCard.innerHTML = `
          <div class="worker_card_content">
            <span class="panel_icon panel_icon_worker ${worker.iconClass}" aria-hidden="true"></span>
            <div class="worker_name">${worker.name}</div>
            <div class="worker_available">Available: ${worker.available}</div>
            <div class="worker_count_controls">
              <button type="button" class="worker_count_btn worker_count_minus" aria-label="Remove ${worker.name}">−</button>
              <span class="worker_selected_count">0</span>
              <button type="button" class="worker_count_btn worker_count_plus" aria-label="Add ${worker.name}">+</button>
            </div>
          </div>
        `;

        const minusBtn = workerCard.querySelector('.worker_count_minus');
        const plusBtn = workerCard.querySelector('.worker_count_plus');

        minusBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          this.adjustWorkerSelection(worker, -1);
        });

        plusBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          this.adjustWorkerSelection(worker, 1);
        });

        workerSelectionArea.appendChild(workerCard);
      });

      if (this.currentAction && this.currentAction.type === 'pass') {
        const totalAvailable = this.getTotalPassAvailableWorkers();
        if (totalAvailable <= 3) {
          availableWorkers.forEach((worker) => {
            this.currentAction.selectedWorkerCounts[worker.type] = worker.available;
          });
        } else {
          const purpleWorker = availableWorkers.find((worker) => worker.type === 'purple_worker');
          if (purpleWorker) {
            this.currentAction.selectedWorkerCounts.purple_worker = Math.min(3, purpleWorker.available);
          }
        }
      }

      if (this.currentAction && this.currentAction.type === 'pray') {
        const purpleWorker = availableWorkers.find((worker) => worker.type === 'purple_worker');
        const blackWorker = availableWorkers.find((worker) => worker.type === 'black_worker');
        const purpleCount = purpleWorker ? purpleWorker.available : 0;

        if (purpleCount === 0 && blackWorker && blackWorker.available > 0) {
          this.currentAction.selectedWorkerCounts.black_worker = 1;
        }

        this.populatePrayActionSelection();
      }

      this.updateWorkerSelectionDisplay();
      this.updateConfirmButtonState();
    },

    getTotalSelectedWorkerCount: function() {
      if (!this.currentAction || !this.currentAction.selectedWorkerCounts) {
        return 0;
      }

      return Object.values(this.currentAction.selectedWorkerCounts).reduce(
        (total, count) => total + (parseInt(count, 10) || 0),
        0,
      );
    },

    getSelectedWorkerCountForType: function(workerType) {
      if (!this.currentAction || !this.currentAction.selectedWorkerCounts) {
        return 0;
      }

      return parseInt(this.currentAction.selectedWorkerCounts[workerType], 10) || 0;
    },

    canIncreaseWorkerSelection: function(worker) {
      if (!this.currentAction) {
        return false;
      }

      const limits = this.getWorkerRequirementLimits(this.currentAction.type);
      const selectedOfType = this.getSelectedWorkerCountForType(worker.type);
      const totalSelected = this.getTotalSelectedWorkerCount();

      if (selectedOfType >= worker.available || totalSelected >= limits.max) {
        return false;
      }

      // Major actions: free selection up to max; Confirm checks mandatory colors.
      if (this.isMajorAction(this.currentAction.type)) {
        return true;
      }

      const hypotheticalCounts = { ...this.currentAction.selectedWorkerCounts };
      hypotheticalCounts[worker.type] = selectedOfType + 1;
      const newTotal = totalSelected + 1;
      if (newTotal === limits.max) {
        return this.validateSelectedWorkersForAction(
          this.currentAction.type,
          hypotheticalCounts,
        ).valid;
      }

      return true;
    },

    canDecreaseWorkerSelection: function(workerType) {
      return this.getSelectedWorkerCountForType(workerType) > 0;
    },

    adjustWorkerSelection: function(worker, delta) {
      if (!this.currentAction) {
        return;
      }

      const currentCount = this.getSelectedWorkerCountForType(worker.type);

      if (delta > 0) {
        if (!this.canIncreaseWorkerSelection(worker)) {
          return;
        }
        this.currentAction.selectedWorkerCounts[worker.type] = currentCount + 1;
      } else if (delta < 0 && currentCount > 0) {
        this.currentAction.selectedWorkerCounts[worker.type] = currentCount - 1;
      }

      this.updateWorkerSelectionDisplay();
      this.clearWorkerValidationError();
      this.updateConfirmButtonState();
    },

    updateWorkerSelectionDisplay: function() {
      const workerSelectionArea = document.getElementById('worker_selection_area');
      if (!workerSelectionArea || !this.currentAction) {
        return;
      }

      workerSelectionArea.querySelectorAll('.worker_selection_card').forEach((workerCard) => {
        const workerType = workerCard.dataset.workerType;
        const selectedCount = this.getSelectedWorkerCountForType(workerType);
        const selectedCountEl = workerCard.querySelector('.worker_selected_count');
        const minusBtn = workerCard.querySelector('.worker_count_minus');
        const plusBtn = workerCard.querySelector('.worker_count_plus');
        const available = parseInt(workerCard.dataset.workerAvailable, 10) || 0;

        if (selectedCountEl) {
          selectedCountEl.textContent = String(selectedCount);
        }

        if (selectedCount > 0) {
          workerCard.classList.add('selected');
        } else {
          workerCard.classList.remove('selected');
        }

        if (minusBtn) {
          minusBtn.disabled = !this.canDecreaseWorkerSelection(workerType);
        }

        if (plusBtn) {
          plusBtn.disabled = !this.canIncreaseWorkerSelection({
            type: workerType,
            available: available,
          });
        }
      });
    },

    updateConfirmButtonState: function() {
      const confirmBtn = document.querySelector('#worker_selection_panel .action_button.primary');
      if (!confirmBtn || !this.currentAction) return;

      const limits = this.getWorkerRequirementLimits(this.currentAction.type);
      const totalSelected = this.getTotalSelectedWorkerCount();
      let canConfirm = false;

      if (totalSelected >= limits.min && totalSelected <= limits.max) {
        canConfirm = this.validateSelectedWorkersForAction(
          this.currentAction.type,
          this.currentAction.selectedWorkerCounts,
        ).valid;
      }

      if (this.currentAction.type === 'pray') {
        const clearableActions = this.getClearableUsedActions();
        canConfirm = canConfirm
          && clearableActions.length > 0
          && !!this.currentAction.params.action_space;
      }
      
      confirmBtn.disabled = !canConfirm;
      if (canConfirm) {
        confirmBtn.classList.add('available');
        this.clearWorkerValidationError();
      } else {
        confirmBtn.classList.remove('available');
        if (this.isMajorAction(this.currentAction.type)) {
          this.showWorkerConfirmHint(this.getMajorActionConfirmHint(
            this.currentAction.type,
            this.currentAction.selectedWorkerCounts,
            limits,
          ));
        } else {
          this.clearWorkerValidationError();
        }
      }
    },

    buildWorkerCountParams: function(selectedWorkerCounts) {
      return {
        white_workers: selectedWorkerCounts.white_worker || 0,
        green_workers: selectedWorkerCounts.green_worker || 0,
        blue_workers: selectedWorkerCounts.blue_worker || 0,
        red_workers: selectedWorkerCounts.red_worker || 0,
        black_workers: selectedWorkerCounts.black_worker || 0,
        purple_workers: selectedWorkerCounts.purple_worker || 0,
      };
    },

    validatePassWorkerKeep: function() {
      const totalAvailable = this.getTotalPassAvailableWorkers();
      const totalSelected = this.getTotalSelectedWorkerCount();
      const limits = this.getWorkerRequirementLimits('pass');

      if (totalSelected < limits.min || totalSelected > limits.max) {
        return {
          valid: false,
          message: dojo.string.substitute(
            _('Choose up to ${max_workers} workers to keep.'),
            { max_workers: limits.max },
          ),
        };
      }

      const availableWorkers = this.getPassAvailableWorkers();
      for (let i = 0; i < availableWorkers.length; i++) {
        const worker = availableWorkers[i];
        const selectedCount = this.getSelectedWorkerCountForType(worker.type);
        if (selectedCount > worker.available) {
          return {
            valid: false,
            message: _('Invalid worker selection for pass.'),
          };
        }
      }

      return { valid: true, message: '' };
    },

    confirmWorkerSelection: function() {
      if (!this.currentAction) {
        return;
      }

      if (this.currentAction.type === 'pass') {
        const validation = this.validatePassWorkerKeep();
        if (!validation.valid) {
          this.showWorkerValidationError(validation.message);
          return;
        }

        this.clearWorkerValidationError();
        const workerCounts = this.buildWorkerCountParams(this.currentAction.selectedWorkerCounts);
        this.submitAction('pass', workerCounts);
        this.hideWorkerSelectionPanel();
        return;
      }

      const limits = this.getWorkerRequirementLimits(this.currentAction.type);
      const totalSelected = this.getTotalSelectedWorkerCount();
      if (totalSelected < limits.min || totalSelected > limits.max) {
        return;
      }

      const validation = this.validateSelectedWorkersForAction(
        this.currentAction.type,
        this.currentAction.selectedWorkerCounts,
      );
      if (!validation.valid) {
        this.showWorkerValidationError(validation.message);
        return;
      }

      if (this.currentAction.type === 'pray') {
        if (!this.currentAction.params.action_space) {
          this.showWorkerValidationError(_('Select an action to clear.'));
          return;
        }

        const clearableActions = this.getClearableUsedActions();
        if (clearableActions.indexOf(this.currentAction.params.action_space) === -1) {
          this.showWorkerValidationError(_('The selected action cannot be cleared.'));
          return;
        }
      }

      this.clearWorkerValidationError();

      const workerCounts = this.buildWorkerCountParams(this.currentAction.selectedWorkerCounts);
      const actionParams = { ...this.currentAction.params, ...workerCounts };

      this.submitAction(this.currentAction.type, actionParams);
      this.hideWorkerSelectionPanel();
    },

    submitAction: function(actionType, params) {
      const workerParams = {
        white_workers: params.white_workers || 0,
        green_workers: params.green_workers || 0,
        blue_workers: params.blue_workers || 0,
        red_workers: params.red_workers || 0,
        black_workers: params.black_workers || 0,
        purple_workers: params.purple_workers || 0,
      };

      const actionMap = {
        'pass': () => this.ajaxcall('/paladinsshipped/paladinsshipped/pass.html', workerParams, this, function(result) {}, function(is_error) {}),
        'pray': () => this.ajaxcall('/paladinsshipped/paladinsshipped/pray.html', { ...workerParams, action_space: params.action_space }, this, function(result) {}, function(is_error) {}),
        'recruitDiscard': () => this.ajaxcall('/paladinsshipped/paladinsshipped/recruitDiscard.html', { ...workerParams, townsfolk_card_id: params.townsfolk_card_id }, this, function(result) {}, function(is_error) {}),
        'recruitHire': () => this.ajaxcall('/paladinsshipped/paladinsshipped/recruitHire.html', { ...workerParams, townsfolk_card_id: params.townsfolk_card_id, use_debt: params.use_debt }, this, function(result) {}, function(is_error) {}),
        'develop': () => this.ajaxcall('/paladinsshipped/paladinsshipped/develop.html', { ...workerParams, action_space: params.action_space, workshop_position: params.workshop_position }, this, function(result) {}, function(is_error) {}),
        'hunt': () => this.ajaxcall('/paladinsshipped/paladinsshipped/hunt.html', workerParams, this, function(result) {}, function(is_error) {}),
        'trade': () => this.ajaxcall('/paladinsshipped/paladinsshipped/trade.html', workerParams, this, function(result) {}, function(is_error) {}),
        'conspire': () => this.ajaxcall('/paladinsshipped/paladinsshipped/conspire.html', workerParams, this, function(result) {}, function(is_error) {}),
        'commission': () => this.ajaxcall('/paladinsshipped/paladinsshipped/commission.html', workerParams, this, function(result) {}, function(is_error) {}),
        'fortify': () => this.ajaxcall('/paladinsshipped/paladinsshipped/fortify.html', workerParams, this, function(result) {}, function(is_error) {}),
        'garrison': () => this.ajaxcall('/paladinsshipped/paladinsshipped/garrison.html', workerParams, this, function(result) {}, function(is_error) {}),
        'absolve': () => this.ajaxcall('/paladinsshipped/paladinsshipped/absolve.html', { ...workerParams, jar_position: params.jar_position }, this, function(result) {}, function(is_error) {}),
        'attack': () => this.ajaxcall('/paladinsshipped/paladinsshipped/attack.html', { ...workerParams, outsider_card_id: params.outsider_card_id, silver_cost: params.silver_cost }, this, function(result) {}, function(is_error) {}),
        'convert': () => this.ajaxcall('/paladinsshipped/paladinsshipped/convert.html', { ...workerParams, outsider_card_id: params.outsider_card_id }, this, function(result) {}, function(is_error) {}),
        'kingsFavour': () => this.ajaxcall('/paladinsshipped/paladinsshipped/kingsFavour.html', { ...workerParams, kings_favour_id: params.kings_favour_id }, this, function(result) {}, function(is_error) {})
      };

      // Execute the action
      if (actionMap[actionType]) {
        actionMap[actionType]();
      }
    },

    hideWorkerSelectionPanel: function() {
      this.currentAction = null;
      this.setupActionButtons();
    },

    getActionSpaceSlotCount: function(actionName) {
      const slotCounts = {
        develop: 2,
        hunt: 2,
        trade: 2,
        recruit: 2,
        pray: 1,
        conspire: 1,
        commission: 3,
        fortify: 3,
        garrison: 3,
        absolve: 3,
        attack: 3,
        convert: 3,
      };

      return slotCounts[actionName] || 0;
    },

    workersToOrderedList: function(workers) {
      if (Array.isArray(workers)) {
        return workers;
      }

      const list = [];
      Object.keys(workers || {}).forEach((workerType) => {
        const count = parseInt(workers[workerType], 10) || 0;
        for (let i = 0; i < count; i++) {
          list.push(workerType);
        }
      });
      return list;
    },

    clearActionSpaceWorkers: function(playerId, actionName, slotCount) {
      for (let i = 0; i < slotCount; i++) {
        const spot = document.getElementById(`${actionName}_space_${i}_${playerId}`);
        if (spot) {
          spot.innerHTML = '';
        }
      }
    },

    renderActionSpaceWorkers: function(playerId, actionName, workers) {
      const orderedWorkers = this.workersToOrderedList(workers);
      orderedWorkers.forEach((workerType, index) => {
        const spot = document.getElementById(`${actionName}_space_${index}_${playerId}`);
        if (!spot) {
          return;
        }

        spot.innerHTML = '';
        const icon = document.createElement('span');
        icon.className = `panel_icon panel_icon_worker panel_icon_${workerType}`;
        icon.setAttribute('aria-hidden', 'true');
        spot.appendChild(icon);
      });
    },

    updateActionSpaceDisplay: function(playerId, actionName, actionInfo) {
      const slotCount = this.getActionSpaceSlotCount(actionName);
      if (!slotCount) {
        return;
      }

      this.clearActionSpaceWorkers(playerId, actionName, slotCount);

      if (actionInfo && actionInfo.used && actionInfo.workers) {
        this.renderActionSpaceWorkers(playerId, actionName, actionInfo.workers);
      }
    },

    renderAllActionSpaces: function() {
      if (!this.gamedatas.action_spaces) {
        return;
      }

      Object.keys(this.gamedatas.action_spaces).forEach((playerId) => {
        const playerActionSpaces = this.gamedatas.action_spaces[playerId];
        Object.keys(playerActionSpaces).forEach((actionName) => {
          this.updateActionSpaceDisplay(playerId, actionName, playerActionSpaces[actionName]);
        });
      });
    },

    getPassAvailableWorkers: function() {
      const currentPlayerId = String(this.player_id);
      const workerTotals = {};

      this.getWorkerTypeDefinitions().forEach((workerType) => {
        workerTotals[workerType.type] = 0;
      });

      const playerData = this.gamedatas && this.gamedatas.players
        ? this.gamedatas.players[currentPlayerId]
        : null;

      if (playerData) {
        this.getWorkerTypeDefinitions().forEach((workerType) => {
          workerTotals[workerType.type] += parseInt(playerData[workerType.type], 10) || 0;
        });
      }

      const actionSpaces = this.gamedatas.action_spaces && this.gamedatas.action_spaces[currentPlayerId];
      if (actionSpaces) {
        Object.keys(actionSpaces).forEach((actionName) => {
          const workers = actionSpaces[actionName].workers || [];
          this.workersToOrderedList(workers).forEach((workerType) => {
            workerTotals[workerType] = (workerTotals[workerType] || 0) + 1;
          });
        });
      }

      return this.getWorkerTypeDefinitions()
        .filter((workerType) => workerTotals[workerType.type] > 0)
        .map((workerType) => ({
          type: workerType.type,
          name: workerType.name,
          iconClass: workerType.iconClass,
          available: workerTotals[workerType.type],
        }));
    },

    getTotalPassAvailableWorkers: function() {
      return this.getPassAvailableWorkers().reduce(
        (total, worker) => total + worker.available,
        0,
      );
    },

    getCurrentPlayerWorkers: function() {
      const currentPlayerId = String(this.player_id);
      
      if (!this.gamedatas || !this.gamedatas.players) {
        return [];
      }
      
      const playerData = this.gamedatas.players[currentPlayerId];
      
      if (!playerData) {
        return [];
      }

      let allowedWorkerTypes = null;
      if (this.currentAction) {
        const requirements = this.getWorkerRequirements(this.currentAction.type);
        allowedWorkerTypes = requirements.allowedWorkerTypes || null;
      }

      const availableWorkers = [];
      
      this.getWorkerTypeDefinitions().forEach((workerType) => {
        if (allowedWorkerTypes && allowedWorkerTypes.indexOf(workerType.type) === -1) {
          return;
        }

        const count = parseInt(playerData[workerType.type], 10) || 0;
        if (count > 0) {
          availableWorkers.push({
            type: workerType.type,
            name: workerType.name,
            iconClass: workerType.iconClass,
            available: count,
          });
        }
      });

      return availableWorkers;
    },

    getClearableUsedActions: function() {
      const currentPlayerId = String(this.player_id);
      const actionSpaces = this.gamedatas.action_spaces && this.gamedatas.action_spaces[currentPlayerId];

      if (!actionSpaces) {
        return [];
      }

      const clearableActions = [
        'develop', 'hunt', 'trade', 'recruit', 'conspire',
        'commission', 'fortify', 'garrison', 'absolve', 'attack', 'convert',
      ];

      return clearableActions.filter((actionName) => actionSpaces[actionName] && actionSpaces[actionName].used);
    },

    getActionDisplayName: function(actionName) {
      const names = {
        develop: _('Develop'),
        hunt: _('Hunt'),
        trade: _('Trade'),
        recruit: _('Recruit'),
        conspire: _('Conspire'),
        commission: _('Commission'),
        fortify: _('Fortify'),
        garrison: _('Garrison'),
        absolve: _('Absolve'),
        attack: _('Attack'),
        convert: _('Convert'),
      };

      return names[actionName] || actionName;
    },

    populatePrayActionSelection: function() {
      const area = document.getElementById('pray_action_selection_area');
      if (!area) {
        return;
      }

      area.innerHTML = '';

      const clearableActions = this.getClearableUsedActions();
      const title = document.createElement('p');
      title.className = 'pray_action_selection_title';
      title.innerHTML = '<strong>Select action to clear:</strong>';
      area.appendChild(title);

      if (clearableActions.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'pray_no_actions';
        emptyMessage.textContent = _('No used actions available to clear.');
        area.appendChild(emptyMessage);
        return;
      }

      const list = document.createElement('div');
      list.className = 'pray_action_list';

      clearableActions.forEach((actionName) => {
        const optionBtn = document.createElement('button');
        optionBtn.type = 'button';
        optionBtn.className = 'pray_action_option';
        optionBtn.textContent = this.getActionDisplayName(actionName);
        optionBtn.dataset.actionName = actionName;
        optionBtn.onclick = () => this.selectPrayClearAction(actionName);
        list.appendChild(optionBtn);
      });

      area.appendChild(list);

      if (clearableActions.length === 1) {
        this.selectPrayClearAction(clearableActions[0]);
      }
    },

    selectPrayClearAction: function(actionName) {
      if (!this.currentAction) {
        return;
      }

      this.currentAction.params.action_space = actionName;

      document.querySelectorAll('.pray_action_option').forEach((optionBtn) => {
        if (optionBtn.dataset.actionName === actionName) {
          optionBtn.classList.add('selected');
        } else {
          optionBtn.classList.remove('selected');
        }
      });

      this.updateConfirmButtonState();
    },

    updatePlayerPanelResources: function (player_id, panel_data) {
      if (!panel_data) {
        return;
      }

      const attributes = ["faith", "strength", "influence"];
      attributes.forEach((attr) => {
        const valueEl = document.getElementById(`panel_value_${attr}_${player_id}`);
        const bonusEl = document.getElementById(`panel_bonus_${attr}_${player_id}`);
        const total = panel_data[attr] || 0;
        const bonus = panel_data[`${attr}_bonus`] || 0;
        const baseKey = `${attr}_base`;
        const permanent = panel_data[baseKey] !== undefined ? panel_data[baseKey] : total - bonus;

        if (valueEl) {
          valueEl.textContent = permanent;
          if (bonus > 0) {
            valueEl.title = `${permanent} permanent + ${bonus} from paladin (= ${total} total)`;
          } else {
            valueEl.removeAttribute("title");
          }
        }
        if (bonusEl) {
          bonusEl.textContent = bonus > 0 ? `+${bonus}` : "";
        }
      });

      const resources = [
        "provision",
        "coin",
        "white_worker",
        "green_worker",
        "red_worker",
        "blue_worker",
        "black_worker",
        "purple_worker",
        "suspicion",
        "unpaid_debt",
        "paid_debt",
      ];
      resources.forEach((resource) => {
        const el = document.getElementById(`panel_value_${resource}_${player_id}`);
        if (el) {
          el.textContent = panel_data[resource] || 0;
        }
      });

      const paladinEl = document.getElementById(`panel_paladin_${player_id}`);
      if (paladinEl) {
        if (panel_data.active_paladin_name) {
          const bonusParts = [];
          if (panel_data.faith_bonus > 0) {
            bonusParts.push(`+${panel_data.faith_bonus} Faith`);
          }
          if (panel_data.strength_bonus > 0) {
            bonusParts.push(`+${panel_data.strength_bonus} Strength`);
          }
          if (panel_data.influence_bonus > 0) {
            bonusParts.push(`+${panel_data.influence_bonus} Influence`);
          }
          paladinEl.innerHTML =
            `<strong>${panel_data.active_paladin_name}</strong>` +
            `<span>${bonusParts.join(", ")}</span>`;
          paladinEl.style.display = "block";
        } else {
          paladinEl.innerHTML = "";
          paladinEl.style.display = "none";
        }
      }
    },

    updateAllPlayerPanels: function () {
      if (!this.gamedatas || !this.gamedatas.player_panels) {
        return;
      }
      for (const player_id in this.gamedatas.player_panels) {
        this.updatePlayerPanelResources(
          player_id,
          this.gamedatas.player_panels[player_id],
        );
      }
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

    notif_setupBoardPositions: function (notif) {
      const filledPositions = notif.args.filled_positions || {};
      this.main_board_positions = this.main_board_positions || {};
      for (const index in filledPositions) {
        this.main_board_positions[index] = {
          type: filledPositions[index],
          player_id: null,
        };
      }
      this.refreshMainBoardPieces();
    },

    notif_commissionPositionSelected: function (notif) {
      const positionIndex = notif.args.position_index;
      this.main_board_positions = this.main_board_positions || {};
      this.main_board_positions[positionIndex] = {
        type: "commission",
        player_id: notif.args.player_id,
      };
      if (
        this.gamedatas.board_positions &&
        this.gamedatas.board_positions[notif.args.player_id]
      ) {
        this.gamedatas.board_positions[notif.args.player_id].all_positions[
          positionIndex
        ] = "commission";
      }
      this.createMainBoardPiece(
        positionIndex,
        "commission",
        notif.args.player_id
      );
      this.clearBoardPositionSelection();
      this.pendingBoardAction = null;
      this.updateActionButtons();
      if (notif.args.panel_data && notif.args.player_id !== undefined) {
        this.syncPlayerResourceDataFromPanel(String(notif.args.player_id), notif.args.panel_data);
        this.updatePlayerPanelResources(String(notif.args.player_id), notif.args.panel_data);
      }
    },

    notif_garrisonPositionSelected: function (notif) {
      const positionIndex = notif.args.position_index;
      this.main_board_positions = this.main_board_positions || {};
      this.main_board_positions[positionIndex] = {
        type: "garrison",
        player_id: notif.args.player_id,
      };
      if (
        this.gamedatas.board_positions &&
        this.gamedatas.board_positions[notif.args.player_id]
      ) {
        this.gamedatas.board_positions[notif.args.player_id].all_positions[
          positionIndex
        ] = "garrison";
      }
      this.createMainBoardPiece(
        positionIndex,
        "garrison",
        notif.args.player_id
      );
      this.clearBoardPositionSelection();
      this.pendingBoardAction = null;
      this.updateActionButtons();
      if (notif.args.panel_data && notif.args.player_id !== undefined) {
        this.syncPlayerResourceDataFromPanel(String(notif.args.player_id), notif.args.panel_data);
        this.updatePlayerPanelResources(String(notif.args.player_id), notif.args.panel_data);
      }
    },

    notif_slideCards: function(notif) {
      if (notif.args.trigger_by === 'new_round') {
        this.animateTownsfolkDisplaySlide(notif.args.cards);
        return;
      }

      if (notif.args.cards && Object.keys(notif.args.cards).length > 0) {
        const firstCard = notif.args.cards[Object.keys(notif.args.cards)[0]];
        if (firstCard && firstCard.type === 'outsider') {
          this.outsider_display = notif.args.cards;
          this.updateOutsiderDisplay(notif.args.cards);
        }
      }
    },

    notif_kingsDisplayUpdated: function (notif) {
      if (notif.args.kingsorder_display) {
        this.updateKingsOrderDisplay(notif.args.kingsorder_display);
      }
      if (notif.args.kingsfavour_display) {
        this.updateKingsFavourDisplay(notif.args.kingsfavour_display);
        if (this.gamedatas) {
          this.gamedatas.kingsfavour_display = notif.args.kingsfavour_display;
        }
        this.syncKingsFavourState(notif.args);
        this.refreshKingsFavourActionButtons();
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

    // Tavern selection state
    pickedTavernCards: {},
    pendingTavernCardId: null,

    isTavernCardPicked: function(cardId) {
      return Object.prototype.hasOwnProperty.call(this.pickedTavernCards, String(cardId));
    },

    getTavernSelectionCardElement: function(cardId) {
      const container = document.getElementById('tavern_selection_cards');
      if (!container) {
        return null;
      }
      return container.querySelector(`[data-card-id="${cardId}"]`);
    },

    getPickedTavernPlayerId: function(cardId) {
      const picked = this.pickedTavernCards[String(cardId)];
      return picked ? picked.playerId : null;
    },

    getPlayerColorHex: function(playerId) {
      const playerData =
        this.gamedatas && this.gamedatas.players && this.gamedatas.players[playerId];
      if (playerData && playerData.color) {
        return "#" + playerData.color;
      }
      return "#6c757d";
    },

    applyPickedTavernCardStyle: function(cardElement, playerId, animate) {
      if (!cardElement || !playerId) {
        return;
      }

      const playerColor = this.getPlayerColorHex(playerId);
      cardElement.style.setProperty("--tavern-picker-color", playerColor);
      cardElement.dataset.pickedBy = String(playerId);

      dojo.removeClass(cardElement, "selectable");
      dojo.removeClass(cardElement, "selected");
      dojo.addClass(cardElement, "picked");
      dojo.removeClass(cardElement, "picked-animating");
      if (animate) {
        dojo.addClass(cardElement, "picked-animating");
      }

      cardElement.style.pointerEvents = "none";
      cardElement.style.cursor = "default";
    },

    decorateTavernSelectionCard: function(cardElement, card, isActivePlayer) {
      const cardId = card.data.id;

      const pickedPlayerId = this.getPickedTavernPlayerId(cardId);
      if (pickedPlayerId) {
        this.applyPickedTavernCardStyle(cardElement, pickedPlayerId, false);
        return;
      }

      if (this.pendingTavernCardId === String(cardId)) {
        dojo.addClass(cardElement, 'selected');
      } else if (isActivePlayer) {
        dojo.addClass(cardElement, 'selectable');
        cardElement.style.cursor = 'pointer';
        cardElement.addEventListener('click', (e) => this.handleTavernCardClick(e, card));
      } else {
        cardElement.style.cursor = 'default';
      }
    },

    resetTavernConfirmButton: function() {
      const confirmButton = document.getElementById('confirm_tavern_selection');
      if (!confirmButton) {
        return;
      }

      confirmButton.disabled = false;
      confirmButton.textContent = 'Confirm Selection';
      confirmButton.style.display = this.pendingTavernCardId ? 'block' : 'none';
    },

    showTavernSelectionModal: function() {
      const tavernSelectionArea = document.getElementById('tavern_selection_area');
      const tavernSelectionCards = document.getElementById('tavern_selection_cards');
      if (!tavernSelectionCards) {
        return;
      }

      while (tavernSelectionCards.firstChild) {
        tavernSelectionCards.removeChild(tavernSelectionCards.firstChild);
      }

      let tavernCards = this.uiItems.getByUiType("tavern_card");
      if (tavernCards.length === 0 && this.tavern_display) {
        this.createTavernUiItems(this.tavern_display);
        tavernCards = this.uiItems.getByUiType("tavern_card");
      }

      const isActivePlayer =
        String(this.player_id) === String(this.gamedatas.gamestate.active_player);

      const displayedCardIds = new Set();

      tavernCards.forEach((card) => {
        const cardClone = card.htmlNode.cloneNode(true);
        cardClone.dataset.cardId = String(card.data.id);
        dojo.place(cardClone, tavernSelectionCards);
        displayedCardIds.add(String(card.data.id));
        this.decorateTavernSelectionCard(cardClone, card, isActivePlayer);
      });

      Object.keys(this.pickedTavernCards).forEach((cardId) => {
        if (displayedCardIds.has(cardId)) {
          return;
        }

        const picked = this.pickedTavernCards[cardId];
        const card = this.uiItems
          .getByUiType("tavern_card")
          .find((item) => String(item.data.id) === cardId);

        if (!card) {
          return;
        }

        const cardClone = card.htmlNode.cloneNode(true);
        cardClone.dataset.cardId = cardId;
        dojo.place(cardClone, tavernSelectionCards);
        this.applyPickedTavernCardStyle(cardClone, picked.playerId, false);
      });

      if (tavernSelectionArea) {
        this.showTavernSelectionArea();
      }

      this.resetTavernConfirmButton();
    },

    hideTavernSelectionModal: function() {
      this.hideTavernSelectionArea();

      this.pendingTavernCardId = null;
      this.resetTavernConfirmButton();
    },

    handleTavernCardClick: function(event, card) {
      const cardId = card.data.id;
      const cardElement = event.currentTarget;

      if (this.isTavernCardPicked(cardId)) {
        return;
      }

      const activePlayerId = this.gamedatas.gamestate.active_player;
      if (String(this.player_id) !== String(activePlayerId)) {
        return;
      }

      const container = document.getElementById('tavern_selection_cards');
      if (!container) {
        return;
      }

      container.querySelectorAll('.tavern_card').forEach((el) => {
        dojo.removeClass(el, 'selected');
        if (!this.isTavernCardPicked(el.dataset.cardId)) {
          dojo.addClass(el, 'selectable');
        }
      });

      this.pendingTavernCardId = String(cardId);
      dojo.removeClass(cardElement, 'selectable');
      dojo.addClass(cardElement, 'selected');
      this.resetTavernConfirmButton();
    },

    refreshTavernSelectionInteractability: function() {
      const container = document.getElementById('tavern_selection_cards');
      if (!container) {
        return;
      }

      const isActivePlayer =
        String(this.player_id) === String(this.gamedatas.gamestate.active_player);
      const tavernCards = this.uiItems.getByUiType("tavern_card");
      const cardById = {};
      tavernCards.forEach((card) => {
        cardById[card.data.id] = card;
      });

      this.pendingTavernCardId = null;
      this.resetTavernConfirmButton();

      container.querySelectorAll('.tavern_card').forEach((cardElement) => {
        const cardId = cardElement.dataset.cardId;
        const card = cardById[cardId];
        if (!card || this.isTavernCardPicked(cardId)) {
          return;
        }

        const clone = cardElement.cloneNode(true);
        clone.dataset.cardId = cardId;
        cardElement.parentNode.replaceChild(clone, cardElement);
        this.decorateTavernSelectionCard(clone, card, isActivePlayer);
      });
    },

    greyOutTavernCard: function(cardId, playerId) {
      const normalizedId = String(cardId);
      if (!this.isTavernCardPicked(normalizedId)) {
        this.pickedTavernCards[normalizedId] = { playerId: playerId };
      }

      const cardElement = this.getTavernSelectionCardElement(normalizedId);
      this.applyPickedTavernCardStyle(cardElement, playerId, true);
    },

    initTavernSelection: function() {
      this.pickedTavernCards = {};
      this.pendingTavernCardId = null;
      this.isUpdatingTavernCards = false;

      const confirmButton = document.getElementById('confirm_tavern_selection');
      const cancelButton = document.getElementById('cancel_tavern_selection');

      if (confirmButton) {
        confirmButton.addEventListener('click', () => this.confirmTavernSelection());
      }

      if (cancelButton) {
        cancelButton.addEventListener('click', () => this.cancelTavernSelection());
      }
    },

    cancelTavernSelection: function() {
      this.pendingTavernCardId = null;

      const container = document.getElementById('tavern_selection_cards');
      if (container) {
        container.querySelectorAll('.tavern_card.selected').forEach((el) => {
          dojo.removeClass(el, 'selected');
          if (!this.isTavernCardPicked(el.dataset.cardId)) {
            dojo.addClass(el, 'selectable');
          }
        });
      }

      this.resetTavernConfirmButton();
    },

    confirmTavernSelection: function() {
      if (!this.pendingTavernCardId) {
        return;
      }

      this.checkAction("pickTavern");

      const selectedCardId = this.pendingTavernCardId;
      const confirmButton = document.getElementById('confirm_tavern_selection');
      if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Processing...';
      }

      this.ajaxcall(
        "/paladinsshipped/paladinsshipped/pickTavern.html",
        {
          lock: true,
          tavern_card_id: selectedCardId,
        },
        this,
        function () {},
        function () {
          if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm Selection';
          }
        },
      );
    },

    notif_tavernPicked: function(notif) {
      const cardId = notif.args.tavern_card_id;
      const playerId = notif.args.player_id;
      const panel_data = notif.args.panel_data;

      this.greyOutTavernCard(cardId, playerId);
      this.pendingTavernCardId = null;
      this.resetTavernConfirmButton();
      this.refreshTavernSelectionInteractability();

      if (panel_data) {
        const player_id = String(playerId);
        this.updatePlayerPanelResources(player_id, panel_data);
        if (this.gamedatas.player_panels) {
          this.gamedatas.player_panels[player_id] = panel_data;
        }
      }
    },
  });
});
