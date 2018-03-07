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
        gotKey = false;
        
        // make maze
        // This will also create the enemies, player, key, and door
        if (this.currentLevel == null)
            this.currentLevel = 1;
        else
            ++this.currentLevel
        this.buildMazeFromFile(this.currentLevel);
        
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
        //this.moveBaddy();
        this.countDown();
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
        
        // Key
        var keys = this.game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'key', 'tileset', 4, true, false, keys);
        // There can only be one key...
        this.key = keys.getFirstExists();
        game.physics.arcade.enable(this.key);
        // Let's make the key pulse using a tween
        var keyTween = game.add.tween(this.key.scale);
        keyTween.to({x: 1.25, y:1.25}, 500); // scale up to 1.25 over 500 ms
        keyTween.to({x: 1, y:1}, 500); // scale back to 1 over 500 ms
        keyTween.easing(Phaser.Easing.Quadratic.InOut); // this controls the effect over time
        keyTween.loop() // loop this tween forever
        keyTween.start() // start the tween now
        
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
                game.state.start('play');
            }
            
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