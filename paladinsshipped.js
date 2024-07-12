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
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
    function (dojo, declare) {
        return declare("bgagame.paladinsshipped", ebg.core.gamegui, {
            constructor: function () {
                console.log('paladinsshipped constructor');
                // Here, you can init the global variables of your user interface
                // Example:
                // this.myGlobalValue = 0;
                this.uiItems = [];
                this.tf_display = [];
                this.os_display = [];
                this.playerMatContainerUiTypes = { "large": ["townsfolk"] };
            },

            // #region uiItems

            attachFunctionsToUiItems: function () {
                var _self = this;
                this.uiItems._lastUid = 0;

                this.uiItems.getByUid = function (uid) {
                    return this.find(function (u) { return u.uid == uid });
                }

                this.uiItems.getByUiType = function (uiType) {
                    return this.filter(function (u) { return u.uiType == uiType });
                }

                this.uiItems.getByUiTypeAndId = function (uiType, id) {
                    return this.find(function (u) { return u.uiType == uiType && parseInt(u.data.id) == parseInt(id) });
                }

                this.uiItems.getByUiTypeAndTypeArg = function (uiType, typeArg) {
                    return this.find(function (u) { return u.uiType == uiType && parseInt(u.data.type_arg) == parseInt(typeArg) });
                }

                this.uiItems.getByUiTypes = function (uiTypes) {
                    return this.filter(function (u) { return uiTypes.includes(u.uiType) });
                }

                this.uiItems.getPlayerUiItems = function (uiType, location, playerId) {
                    return this.filter(function (u) { return u.uiType == uiType && (u.data.player_id == playerId || u.data.location_arg == playerId) && u.data.location == location });
                }

                this.uiItems.getPlayerId = function (uiItem) {
                    var playerId = null;
                    if (uiItem.uiType == "townsfolk" && uiItem.data.location == "hand") {
                        playerId = uiItem.data.location_arg;
                    }
                    return playerId;
                }

                this.uiItems.isPlayerItem = function (uiItem) {
                    var isPlayerItem = false;
                    if (uiItem.data.location) {
                        isPlayerItem = uiItem.data.location.endsWith("hand") || uiItem.data.location == "player_mat" || uiItem.data.location == "zombie_mat";
                    }
                    return isPlayerItem;
                }

                this.uiItems.resetSelectableAnimation = function ()
                {
                    var items = this.getSelectableItems(false);
                    for (var i = 0; i < items.length; i++) {
                        items[i].htmlNode.classList.remove("selectable");
                        void items[i].htmlNode.offsetWidth;
                        items[i].htmlNode.classList.add("selectable");
                    }
                }

                this.uiItems.getSelectedItems = () => this.filter((u) => u.isSelected)

                this.uiItems.getSelectedItemsByUiType = function (uiType) {
                    return this.filter(function (u) { return u.isSelected && u.uiType == uiType; });
                }

                this.uiItems.getFirstSelectedItemByUiType = function (uiType) {
                    var items = this.getSelectedItemsByUiType(uiType);
                    return items.length > 0 ? items[0] : null;
                }

                this.uiItems.getFirstSelectedItemByUiTypes = function (uiTypes) {
                    var item = null;
                    for (var i = 0; i < uiTypes.length; i++) {
                        item = this.getFirstSelectedItemByUiType(uiTypes[i]);
                        if (item != null) { break; }
                    }
                    return item;
                }

                this.uiItems.getSelectableItems = function (includeSelected) {
                    if (includeSelected)
                        return this.filter(function (u) { return u.isSelectable; });

                    return this.filter(function (u) { return u.isSelectable && !u.isSelected; });
                }

                this.uiItems.makeSelectable = function (items) {
                    for (var i = 0; i < items.length; i++) {
                        items[i].isSelectable = true;
                        dojo.addClass(items[i].htmlNode, "selectable");
                    }
                    this.resetSelectableAnimation();
                }

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
                }

                this.uiItems.resetSelectable = function (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        dojo.removeClass(item.htmlNode, "selectable");
                        dojo.removeClass(item.htmlNode, "selected");
                        item.isSelected = false;
                        item.isSelectable = false;
                    }
                }

                this.uiItems.resetAllSelectable = function () {
                    this.resetSelectable(this);
                }

                this.uiItems.resetAllNotSelected = function () {
                    this.resetSelectable(this.getSelectableItems(false));
                }

                this.uiItems.resetAllSelectableByType = function (uiType, exceptUiItem) {
                    var items = this.getByUiType(uiType);
                    items = items.filter(function (u) { return u != exceptUiItem });
                    this.resetSelectable(items);
                }

                this.uiItems.createItems = function (uiType, dataArray) {
                    this.createItemsViaCallback(function (d) { return uiType; }, dataArray);
                }

                this.uiItems.createItemsViaCallback = function (dataCallback, dataArray) {
                    for (var i = 0; i < dataArray.length; i++) {
                        var data = dataArray[i];
                        this.createAndAddItem(dataCallback(data), data);
                    }
                }

                this.uiItems.itemBackgroundConfig = {
                    //key is uiType
                    "townsfolk": { items_per_row: 6, width: 160, height: 250, type_property: "type_arg" },
                    "outsider": { items_per_row: 8, width: 160, height: 250, type_property: "type_arg" },
                };

                this.uiItems.getBackgroundPosition = function (uiType, typeArg) {
                    debugger;
                    var background = { x: 0, y: 0 };
                    background.x = (typeArg % this.itemBackgroundConfig[uiType].items_per_row) * -1 * this.itemBackgroundConfig[uiType]["width"];
                    background.y = Math.floor(typeArg / this.itemBackgroundConfig[uiType].items_per_row) * -1 * this.itemBackgroundConfig[uiType]["height"];
                    return background;
                }

                // BackgroundPosition significa posicao do item no sprite
                this.uiItems.getBackgroundPositionForUiItem = function (uiItem) {
                    var background = { x: 0, y: 0 };
                    if (this.itemBackgroundConfig[uiItem.uiType] != undefined) {
                        var propertyName = this.itemBackgroundConfig[uiItem.uiType]["type_property"];
                        var typeArg = parseInt(uiItem.data[propertyName]);
                        background = this.getBackgroundPosition(uiItem.uiType, typeArg);
                    }
                    else {
                        background = null;
                    }
                    return background;
                }

                this.uiItems.setBackgroundUiItem = function (uiItem) {
                    var background = this.getBackgroundPositionForUiItem(uiItem);
                    var htmlNode = uiItem.htmlNode;
                    if (background != null) {
                        var backgroundPosition = background.x + "px" + " " + background.y + "px";
                        dojo.setStyle(htmlNode, "background-position", backgroundPosition);
                    }
                }

                this.uiItems.weightConfig = {
                    "default": 1000,
                }

                this.uiItems.getWeight = function (uiItem) {
                    var weight = this.weightConfig["default"];
                    if (this.weightConfig[uiItem.uiType]) {
                        weight = this.weightConfig[uiItem.uiType];
                    }
                    return weight;
                }

                this.uiItems.itemConfig = {
                    "outsider": { cssClass: "outsider", "zIndex": 30, tooltip: false},
                    "townsfolk": { cssClass: "townsfolk", "zIndex": 30, tooltip: false},
                }

                this.uiItems.createAndAddItem = function (uiType, params) {
                    this._lastUid++;
                    var htmlNode = null;
                    var clickHandler = null;
                    console.log("cssclass");
                    console.log(this.itemConfig[uiType].cssClass);
                    if (this.itemConfig[uiType].cssClass) {
                        htmlNode = dojo.create("div", { "class": this.itemConfig[uiType].cssClass });
                        dojo.setAttr(htmlNode, "id", "uid-" + this._lastUid);
                    }
                    else {
                        htmlNode = $(dojo.string.substitute(this.itemConfig[uiType].htmlNode, params));
                    }
                    dojo.setAttr(htmlNode, "data-uid", "uid-" + this._lastUid);
                    clickHandler = dojo.connect(htmlNode, "onclick", _self, "onClickUiItem");
                    var item = { "uid": this._lastUid, "uiType": uiType, "data": params, "htmlNode": htmlNode, "clickHandler": clickHandler, isSelected: false, isSelectable: false, uiPosition: 0 };
                    if (this["_extendUiItem_" + uiType] != undefined) { this["_extendUiItem_" + uiType](item); }
                    this.setBackgroundUiItem(item);
                    this.push(item);
                    return item;
                }
            },
            // #endregion
            resetSetup: function () {
                for (var i = 0; i < this.uiItems.length; i++) {
                    if (this.uiItems[i].onClickHandle) {
                        dojo.disconnect(this.uiItems[i].onClickHandle);
                    }
                    if (this.uiItems[i].htmlNode) {
                        dojo.destroy(this.uiItems[i].htmlNode);
                    }
                }

                this.uiItems = [];
            },
 
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

            setup: function( gamedatas )
            {
                console.log( "Starting game setup" );
                this.default_viewport = "width=" + this.interface_min_width;
                this.onScreenWidthChange();
                
                
                // TODO: Set up your game interface here, according to "gamedatas"
                console.log(gamedatas);

                this.resetSetup();
                this.attachFunctionsToUiItems();
                this.uiItems.createItems("outsider", this.getValuesFromObject(gamedatas.outsider_display));

                // Setting up player boards
                for( const player_id in gamedatas.players )
                {
                    const player = gamedatas.players[player_id];
                    // TODO: Setting up players boards if needed
                    dojo.place( this.format_block(
                        'jstpl_player_panel_extension', { player_id: player_id } ),
                        $('player_board_'+ player_id) 
                    );
                    if(player.parchment == "1") {
                        this.updateParchment(player_id);
                    }
                }

                this.tf_display = gamedatas.townsfolk_display;
                this.os_display = gamedatas.outsider_display;

                this.townsfolk_display = gamedatas.townsfolk_display;
                this.outsider_display = gamedatas.outsider_display;

                // Setup game notifications to handle (see "setupNotifications" method below)
                this.setupNotifications();
                this.addTooltipToClass('.panel_parchment', _("Parchment, indicates the first player of each round"), "");
                this.drawUi();
                console.log( "Ending game setup" );
            },
        
            // To be overrided by games
            onScreenWidthChange: function () {
                // Remove broken "zoom" property added by BGA framework
                this.gameinterface_zoomFactor = 1;
                $("page-content").style.removeProperty("zoom");
                $("page-title").style.removeProperty("zoom");
                $("right-side-first-part").style.removeProperty("zoom");
            },

            ///////////////////////////////////////////////////
            //// Game & client states
            
            // onEnteringState: this method is called each time we are entering into a new game state.
            //                  You can use this method to perform some user interface changes at this moment.
            //
            onEnteringState: function( stateName, args )
            {
                console.log( 'Entering state: '+stateName );
                
                switch( stateName )
                {
                /* Example:
                
                case 'myGameState':
                
                    // Show some HTML block at this game state
                    dojo.style( 'my_html_block_id', 'display', 'block' );
                    
                    break;
            */
            
            
                case 'dummmy':
                    break;
                }
            },

            // onLeavingState: this method is called each time we are leaving a game state.
            //                 You can use this method to perform some user interface changes at this moment.
            //
            onLeavingState: function( stateName )
            {
                console.log( 'Leaving state: '+stateName );
                
                switch( stateName )
                {
                
                /* Example:
                
                case 'myGameState':
                
                    // Hide the HTML block we are displaying only during this game state
                    dojo.style( 'my_html_block_id', 'display', 'none' );
                    
                    break;
            */
            
            
                case 'dummmy':
                    break;
                }               
            }, 

            // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
            //                        action status bar (ie: the HTML links in the status bar).
            //        
            onUpdateActionButtons: function( stateName, args )
            {
                console.log( 'onUpdateActionButtons: '+stateName );
                        
                if( this.isCurrentPlayerActive() )
                {            
                    switch( stateName )
                    {
    /*               
                    Example:
    
                    case 'myGameState':
                        
                        // Add 3 action buttons in the action status bar:
                        
                        this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                        this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                        this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                        break;
    */
                        case 'hireInitialTownsfolk':
                            for (const [key, value] of Object.entries(this.townsfolk_display)) {
                                townsfolk_id = value.id; 
                                this.addActionButton(
                                    'btnHire_' + townsfolk_id,
                                    _('Hire '+ townsfolk_id),
                                    dojo.hitch(this, dojo.partial(this.onClickConfirmTownsfolk, townsfolk_id))
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
            
            updateParchment: function (playerId) {
                dojo.query('.panel_parchment').style("display", "none");
                dojo.setStyle($('panel_parchment_' + playerId), "display", "inline");
            },

            
            getContainerTypeByUiType: function (uiType) {
                for (var containerType in this.playerMatContainerUiTypes) {
                    if (this.playerMatContainerUiTypes[containerType].includes(uiType))
                        return containerType;
                }
                return null;
            },

            getParentContainerForUiItem: function (uiItem) {
                var containerName = "mainboard";
                var isPlayerItem = this.uiItems.isPlayerItem(uiItem);
                if (isPlayerItem && this.getContainerTypeByUiType(uiItem.uiType)) {
                    containerName = this.getContainerTypeByUiType(uiItem.uiType) + "-container-" + this.uiItems.getPlayerId(uiItem);
                }
                return containerName;
            },

            // need to understand this better
            getPositionForUiItem: function (uiItem) {
                var position = { top: 100, left: 100 };
                if (uiItem.uiType == "outsider" && uiItem.data.location == "outsider_display") {
                    var mapNode = dojo.marginBox($("board_spot_outsider_0"));
                    position.top = mapNode.t;
                    position.left = mapNode.l + (uiItem.data.location_arg * 85) + 44; //magic numbers
                }
                return position;
            },

            positionUiItem: function (uiItem) {
                var position = this.getPositionForUiItem(uiItem);
                if (position.top != null && position.left != null) {
                    dojo.setStyle(uiItem.htmlNode, "top", position.top + "px");
                    dojo.setStyle(uiItem.htmlNode, "left", position.left + "px");
                }
            },

            changeUiItemZIndex: function (uiItem) {
                var baseZIndex = this.uiItems.itemConfig[uiItem.uiType];
                baseZIndex = baseZIndex.zIndex != undefined ? baseZIndex.zIndex : 10;
                dojo.setStyle(uiItem.htmlNode, "zIndex", baseZIndex);
            },


            moveUiItemToParentContainer: function (uiItem, parentContainer) {
                if (parentContainer != null) {
                    dojo.place(uiItem.htmlNode, parentContainer);
                    this.positionUiItem(uiItem);
                    this.changeUiItemZIndex(uiItem);
                }
            },

            drawUiItem: function (uiItem) {
                var parentContainer = this.getParentContainerForUiItem(uiItem);
                console.log(uiItem);
                console.log(parentContainer);
                this.moveUiItemToParentContainer(uiItem, parentContainer);
            },

            drawUi: function () {
                for (var i = 0; i < this.uiItems.length; i++) {
                    var uiItem = this.uiItems[i];
                    this.drawUiItem(uiItem);
                }
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
                    var uid = dojo.getAttr(evt.currentTarget, "data-uid").replace("uid-", "");
                    var uiItem = this.uiItems.getByUid(uid);
                    if (uiItem.isSelectable && this[this.currentMove] != undefined) {
                        this.uiItems.toggleSelection(uiItem);
                        this[this.currentMove](uiItem);
                    }
                }
            },      
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


            onClickConfirmTownsfolk: function(townsfolk_card_id) {
                this.checkAction('hireInitialTownsfolk');
                this.ajaxcall("/paladinsshipped/paladinsshipped/hireInitialTownsfolk.html", { lock: true, "townsfolk_card_id": townsfolk_card_id }, this,
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
            setupNotifications: function()
            {
                console.log( 'notifications subscriptions setup' );
                dojo.subscribe('moveParchment', this, "notif_moveParchment");
                
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

    });             
    }
);
