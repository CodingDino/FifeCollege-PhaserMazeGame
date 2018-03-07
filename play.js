// Note the globals that will be used:
/* global   game */

var playState = {

    // state.preload is called when the state is entered
    preload: function() {
    },
    
    // state.create is called after preload finishes
    create: function() {
        
        // Reset our variables from last play through
        timeLeft = 30;
        gameOver = false;
        gotKey = false;
        
        // make maze
        // This will also create the enemies, player, key, and door
        this.buildMazeFromFile();
        
        // create sound references for use later
        keyPickup = game.add.audio('pickup');
        winGame = game.add.audio('win');
        
        // text label showing time left in the game.
        timeLabel = game.add.text(300, 10, 
                                  "TIME: " + timeLeft,
                                  { font: '12px Arial', fill: '#ffffff', align: 'left' } );
        
        // initialise keyboard cursors
        cursors = game.input.keyboard.createCursorKeys();
    },
    
    // state.update is called every frame
    update: function() {
        
        // set up collisions
        game.physics.arcade.overlap(this.player,this.enemies, this.loseGame, null, this);
        game.physics.arcade.collide(this.enemies,this.enemies);
        game.physics.arcade.overlap(this.player,this.key, this.pickupKey, null, this);
        game.physics.arcade.overlap(this.player,this.door, this.winGame, null, this);
        
        // Changed 'maze' into 'this.layer'
        game.physics.arcade.collide(this.player, this.layer);
        game.physics.arcade.collide(this.enemies, this.layer);
        
        this.movePlayer();
        this.moveBaddy();
        this.countDown();
    },
    
    // Maze building function - creates maze based on file.
    // Later we can improve this to pass in what file we want to use
    buildMazeFromFile: function()
    {
        // Create the tilemap
        this.map = game.add.tilemap('map');
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Maze');
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions for the first element of our tileset (the blue wall)
        this.map.setCollision(1);
        
        // Create objects on the map
        
        // Key
        var keys = this.game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'key', 'tileset', 4, true, false, keys);
        // There can only be one key...
        this.key = keys.getFirstExists();
        game.physics.arcade.enable(this.key);
        
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
            if (this.player.x > 0) {
                this.player.body.velocity.x = -200;
            }       
        }
        else if (cursors.right.isDown) {
            if (this.player.x < 460) {
                this.player.body.velocity.x = 200;
            }
        }
        else {
            this.player.body.velocity.x = 0;
        }
        
        // Up/Down Movement
        if (cursors.up.isDown) {
             if (this.player.y > 0) {
                 this.player.body.velocity.y = -200;
             }           
        }
        else if (cursors.down.isDown) {
            if (this.player.y < 460) {
                this.player.body.velocity.y = 200;
            }
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
    pickupKey: function() {
        keyPickup.play();

        this.key.kill();

        gotKey = true;
    },
    
    // If the player touches the door with the key, win the game!
    winGame: function() {
        
        // Only do winning logic if the player has the key!
        if (gotKey == true) {
            // Play winning sound
            winGame.play();
            
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
        
    },
    
    // If the player touches a baddy, lose the game!
    loseGame: function() {
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
};

// the variables we will be using for our game.
var keyPickup, winGame, timeLeft, timeLabel, 
    cursors, gameOver, gotKey, frameCount = 0;