// Note the globals that will be used:
/* global   game, Phaser, numLevels */

var playState = {

    // state.preload is called when the state is entered
    preload: function() {
    },
    
    // state.create is called after preload finishes
    create: function() {
        
        // Reset our variables from last play through
        timeLeft = 30;
        gameOver = false;
        
        // make maze
        // This will also create the enemies, player, key, and door
        if (this.currentLevel == null)
            this.currentLevel = 1;
        this.buildMazeFromFile(this.currentLevel);
        
        // create sound references for use later
        winGame = game.add.audio('win');
        
        // text label showing time left in the game.
        timeLabel = game.add.text(300, 10, 
                                  "TIME: " + timeLeft,
                                  { font: '12px Arial', fill: '#ffffff', align: 'left' } );
        
        // initialise keyboard cursors
        cursors = game.input.keyboard.createCursorKeys();
        
         // Create the shadow texture
        this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);

        // Create an object that will use the bitmap as a texture
        var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
        lightSprite.fixedToCamera = true;
        
        // Set the blend mode to MULTIPLY. This will darken the colors of
        // everything below this sprite.
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        
        // text label showing time left in the game.
        this.coinLabel = game.add.text(5, 480, 
                                  "COINS: 0",
                                  { font: '12px Arial', fill: '#ffffff', align: 'left' } );
        this.coinLabel.fixedToCamera = true;
    },
    
    // state.update is called every frame
    update: function() {
        
        // set up collisions
        game.physics.arcade.overlap(this.player,this.enemies, this.loseGame, null, this);
        game.physics.arcade.collide(this.enemies,this.enemies);
        game.physics.arcade.overlap(this.player, this.items, this.collectItem, null, this);
        game.physics.arcade.overlap(this.player, this.currency, this.collectCurrency, null, this);
        game.physics.arcade.overlap(this.player,this.door, this.winGame, null, this);
        
        // Changed 'maze' into 'this.layer'
        game.physics.arcade.collide(this.player, this.layer);
        game.physics.arcade.collide(this.enemies, this.layer);
        
        this.movePlayer();
        //this.moveBaddy();
        this.countDown();
        
        // Update the shadow
        // You can change the radius (100) to be larger or smaller
        this.updateShadowTexture ( { x: this.player.x + this.player.width/2 - game.camera.x,
                                     y: this.player.y + this.player.height/2 - game.camera.y}, 
                                   100 );
    },
    
    // Maze building function - creates maze based on file.
    // Later we can improve this to pass in what file we want to use
    buildMazeFromFile: function(_level)
    {
        // Create the tilemap
        this.map = game.add.tilemap('map'+_level);
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Maze');
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions for the first element of our tileset (the blue wall)
        this.map.setCollision(1);
        
        // Create objects on the map
        
        // Items
        this.inventory = [];
        this.items = this.game.add.physicsGroup();
        
        // Key
        this.map.createFromObjects('Objects', 'key', 'tileset', 4, true, false, this.items);
        // There can only be one key...
        this.key = this.items.getByName("key");
        // Item settings
        this.key.collectSound = game.add.audio('pickup');
        this.key.onCollect = function(state) {
            state.emitter.on = false;
        }
        
        // Some items may cost money!
        // For the ones that cost, add their price below them
        this.items.forEach(function(item){
            if (item.cost != 0) { // true if cost is defined and is not 0
                item.costText = game.add.text(item.x + 25, item.y + 50,
                                              item.cost,
                                              { font: '12px Arial', 
                                                fill: '#ffffff', 
                                                align: 'center' } );    
            }
        });
        
        // Let's make the key pulse using a tween
        var keyTween = game.add.tween(this.key.scale);
        keyTween.to({x: 1.25, y:1.25}, 500); // scale up to 1.25 over 500 ms
        keyTween.to({x: 1, y:1}, 500); // scale back to 1 over 500 ms
        keyTween.easing(Phaser.Easing.Quadratic.InOut); // this controls the effect over time
        keyTween.loop() // loop this tween forever
        keyTween.start() // start the tween now
        // Change the key's anchor point so the tween looks better
        this.key.anchor.x = 0.5;
        this.key.anchor.y = 0.5;
        this.key.x += this.key.width/2;
        this.key.y += this.key.height/2;
        
        // let's make the key emit particles
        this.emitter = game.add.emitter(this.key.x, this.key.y, 5);
        // Set the 'pixel' image for the particles
        this.emitter.makeParticles('pixel');
        // Set the y speed of the particles between -150 and 150
        // The speed will be randomly picked between -150 and 150 for each particle
        this.emitter.setYSpeed(-50, 50);
        // Do the same for the x speed
        this.emitter.setXSpeed(-50, 50);
        // Change alpha over time from 1 to 0
        this.emitter.setAlpha(1, 0, 1000);
        // Use no gravity for the particles
        this.emitter.gravity = 0;
        // start our emitter
        this.emitter.flow(1000);
        
        
        // Currency
        this.currencyPouch = {coin: 0}; // Add each type of currency you will have
        this.currency = this.game.add.physicsGroup();
        
        // Coins
        this.map.createFromObjects('Objects', 'coin', 'coin', 0, true, false, this.currency);
        this.currencyCollectSound = game.add.audio('pickup');
        
        
        // Door
        var doors = this.game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'door', 'tileset', 3, true, false, doors);
        // There can only be one door...
        this.door = doors.getFirstExists();
        game.physics.arcade.enable(this.door);
        
        // Player
        var players = this.game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'player', 'tileset', 1, true, false, players);
        // There can only be one player...
        this.player = players.getFirstExists();
        game.physics.arcade.enable(this.player);
        this.player.animations.add('run', [1, 5], 10, true);
        this.player.animations.add('stand', [1], 10, true);
        this.player.animations.play('stand');
        game.camera.follow(this.player);
        
        // Enemies
        this.enemies = this.game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'enemy', 'tileset', 2, true, false, this.enemies);
        game.physics.arcade.enable(this.enemies);
        // Enemies are always moving (creepy) so we can just set their run as always on
        this.enemies.forEach(function(enemy){
            enemy.animations.add('run', [2, 6], 10, true);
            enemy.animations.play('run');
        });
    },
    
    // Handle player movement
    movePlayer: function() {
        // Left/Right Movement
        if (cursors.left.isDown) {
            this.player.body.velocity.x = -200;      
        }
        else if (cursors.right.isDown) {
            this.player.body.velocity.x = 200;
        }
        else {
            this.player.body.velocity.x = 0;
        }
        
        // Up/Down Movement
        if (cursors.up.isDown) {
            this.player.body.velocity.y = -200;
        }
        else if (cursors.down.isDown) {
            this.player.body.velocity.y = 200;
        } 
        else {
            this.player.body.velocity.y = 0;
        }
        
        // animation
        if (this.player.body.velocity.x != 0 || this.player.body.velocity.y != 0)
        {
            this.player.animations.play('run');
        }
        else
        {
            this.player.animations.play('stand');
        }
    },
    
    // Handle the key being picked up
    collectItem: function(player, item) {
        console.log("collectItem");
        
        var canPickUp = false;
        
        // If this item costs, we need to make sure we have enough to spend!
        if (item.cost != 0) {
            // check if we have enough
            if (this.currencyPouch[item.costType] >= item.cost) {
                // we have enough - we can buy it!
                canPickUp = true;
                // reduce our money
                this.currencyPouch[item.costType] -= item.cost;
                // destroy the display for the item's cost
                item.costText.kill();
                // update the display for our curreny funds
                this.updateCurrencyDisplay();
            }
        } else {
            // this item doesn't cost anthing, we can pick it up!
            canPickUp = true;
        }
        
        if (canPickUp == true) {
            this.inventory.push(item.name);
            if (item.collectSound != null)
                item.collectSound.play();
            if (item.onCollect != null)
                item.onCollect(this);
            item.kill();
        }
    },
    
    // Hand coins being picked up
    collectCurrency: function(player, currency) {
        console.log("collectCurrency");
        this.currencyPouch[currency.currencyType] += currency.currencyValue;
        
        this.currencyCollectSound.play();
        currency.kill();
        
        this.updateCurrencyDisplay();
    },
    
    // Update the visual display of the currency
    updateCurrencyDisplay: function() {
        
        // Add more here if you want to display other types of currency
        this.coinLabel.text="COINS: "+ this.currencyPouch.coin;
    },
    
    // Function to check if an item is in our inventory
    hasItem: function(itemName) {
        return this.inventory.indexOf(itemName) > -1;
    },
    
    // If the player touches the door with the key, win the game!
    winGame: function() {
        console.log("winGame");
        
        // Only do winning logic if the player has the key!
        if (this.hasItem("key")) {
            // Play winning sound
            winGame.play();
            
            // if we are at the last level, we have beaten the game!
            if (this.currentLevel == numLevels) {
                // display message
                var messageLabel = game.add.text(100, 250, 
                                                 'YOU ESCAPED!',
                                                 { font: '40px Arial', fill: '#ff0000' });
                messageLabel.fixedToCamera = true;

                // Kill player and baddy sprites
                this.player.kill();

                this.enemies.forEach(function(enemy) {
                    enemy.kill();
                });

                // Set gameOver variable
                gameOver = true; 
            }
            else {
                // make a higher level and restart the play state
                ++this.currentLevel
                game.state.start('play');
            }
            
        }
        
    },
    
    // If the player touches a baddy, lose the game!
    loseGame: function() {
        console.log("loseGame");
        // This causes the state (level) to reload from the beginning!
        game.state.start('play');
    },
    
    // Function to move the baddies and make them chase the player
    moveBaddy: function() {
            
        this.enemies.forEach(function(baddy) {
            if (this.player.x > baddy.x) {
                baddy.body.velocity.x = 80;
            }
            else if (this.player.x < baddy.x) {
                baddy.body.velocity.x = -80;
            }

            if (this.player.y > baddy.y) {
                baddy.body.velocity.y = 80;
            }
            else if (this.player.y < baddy.y) {
                baddy.body.velocity.y = -80;
            }
        }, this);

    },
    
    // Function to update the timer text, and indicate time up.
    countDown: function() {
        if(gameOver == false) {
            frameCount++;
            if (frameCount%60 == 0) {
                if(timeLeft > 0) {
                    timeLeft--;
                    timeLabel.text="TIME: "+ timeLeft;
                    if (timeLeft < 1) {
                        game.add.text(100, 250, 
                                      'TIME UP!',
                                      { font: '40px Arial', fill: '#ffffff' });
                        this.player.kill();
                    }
                }

            }
        }
        

    },
    
    updateShadowTexture: function(position, radius) {
        // This function updates the shadow texture (this.shadowTexture).
        // First, it fills the entire texture with a dark shadow color.
        // Then it draws a white circle centered on the pointer position.
        // Because the texture is drawn to the screen using the MULTIPLY
        // blend mode, the dark areas of the texture make all of the colors
        // underneath it darker, while the white area is unaffected.

        // Draw shadow
        // Decrease the RGB numbers to make the shadow darker
        // 0 will be black
        this.shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
        this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

        // Draw circle of light
        this.shadowTexture.context.beginPath();
        // You could change the fill colour here from white to a darker colour 
        // back and forth over time, along with a changing radius,
        // to simulate "flickering"
        this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
        this.shadowTexture.context.arc(position.x, position.y,
            radius, 0, Math.PI*2);
        this.shadowTexture.context.fill();

        // This just tells the engine it should update the texture cache
        this.shadowTexture.dirty = true;
    }
};

// the variables we will be using for our game.
var winGame, timeLeft, timeLabel, 
    cursors, gameOver, frameCount = 0;