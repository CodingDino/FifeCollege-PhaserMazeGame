// Note the globals that will be used:
/* global   game,
            Phaser,
            console */

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
        // An array of 0 and 1 -> 1 represents a block, 0 a space.
        levels = [[
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
            ],
        [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,1,0,0,0,1],
            [1,0,1,0,1,0,0,1,0,1],
            [1,0,1,0,1,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ]];
        //this.buildMaze(levels[currentLevel]);
        this.buildMazeFromFile();
        
        // create player & add physics to them
        player = game.add.sprite(60,405,'player');
        game.physics.arcade.enable(player);
        
        // create baddies
        baddies = game.add.group();
        baddies.enableBody = true; // add physics to the baddies
        var baddy1 = game.add.sprite(60,60,'baddy');
        var baddy2 = game.add.sprite(310,410,'baddy');
        baddies.add(baddy1);
        baddies.add(baddy2);
        
        // create key
        key = game.add.sprite(150,50,'key');
        game.physics.arcade.enable(key);
        
        // create door
        door = game.add.sprite(400,100,'door');
        game.physics.arcade.enable(door);
        
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
        //game.physics.arcade.collide(player,maze);
        game.physics.arcade.overlap(player,baddies, this.loseGame, null, this);
        //game.physics.arcade.collide(maze,baddies);
        game.physics.arcade.collide(baddies,baddies);
        game.physics.arcade.overlap(player,key, this.pickupKey, null, this);
        game.physics.arcade.overlap(player,door, this.winGame, null, this);
        
        // Changed 'maze' into 'this.layer'
        game.physics.arcade.collide(player, this.layer);
        game.physics.arcade.collide(baddies, this.layer);
        
        this.movePlayer();
        this.moveBaddy();
        this.countDown();
    },
    
    // Maze building function - creates maze based on an array.
    // Later we can improve this to pass in the array and include enemy positions and more!
    // We could even set this up to use a tilemap we can edit externally.
    buildMaze: function(blockArray) {
        
        // make maze a group of objects
        maze = game.add.group();
        maze.enableBody = true; // add physics to the maze
        
        // Go through our list of block locations and create blocks in the right places.
        for (var r=0;r<blockArray.length;r++) {
            
            for (var c=0; c<blockArray[r].length;c++) {                
                // Only create a block if there is a 1 in the list in this spot.
                if(blockArray[r][c]==1) {
                   var block=game.add.sprite(c*50,r*50,'block');
                    maze.add(block);
                }
            }
            
        }
        
        // Set all objects in the maze to be immovable - they won't get moved by the physics.
        maze.setAll('body.immovable', true);
    },
    
    buildMazeFromFile: function()
    {
        // Create the tilemap
        this.map = game.add.tilemap('map');
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Tile Layer 1');
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions for the first element of our tileset (the blue wall)
        this.map.setCollision(1);
    },
    
    // Handle player movement
    movePlayer: function() {
        // Left/Right Movement
        if (cursors.left.isDown) {
             if (player.x > 0) {
                 player.body.velocity.x = -200;
             }       
        }
        else if (cursors.right.isDown) {
            if (player.x < 460) {
                player.body.velocity.x = 200;
            }
        }
        else {
            player.body.velocity.x = 0;
        }
        
        // Up/Down Movement
        if (cursors.up.isDown) {
             if (player.y > 0) {
                 player.body.velocity.y = -200;
             }           
        }
        else if (cursors.down.isDown) {
            if (player.y < 460) {
                player.body.velocity.y = 200;
            }
        } 
        else {
            player.body.velocity.y = 0;
        }
    },
    
    // Handle the key being picked up
    pickupKey: function() {
        keyPickup.play();
        key.kill();
        gotKey = true;
    },
    
    // If the player touches the door with the key, win the game!
    winGame: function() {
        
        // Only do winning logic if the player has the key!
        if (gotKey == true) {
            // Play winning sound
            winGame.play();
            
            ++currentLevel;
            
            // If we have finished the last level...
            if (currentLevel == levels.length) {
                // display message
                var messageLabel = game.add.text(100, 250, 
                                                 'YOU ESCAPED!',
                                                 { font: '40px Arial', fill: '#ff0000' });
                messageLabel.fixedToCamera = true;

                // Kill player and baddy sprites
                player.kill();

                baddies.forEach(function(baddy) {
                    baddy.kill();
                });

                // Set gameOver variable
                gameOver = true; 
            }
            else {
                // reload our play state - the new level will be loaded!
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
            
        baddies.forEach(function(baddy) {
            if (player.x > baddy.x) {
                baddy.body.velocity.x = 80;
            }
            else if (player.x < baddy.x) {
                baddy.body.velocity.x = -80;
            }

            if (player.y > baddy.y) {
                baddy.body.velocity.y = 80;
            }
            else if (player.y < baddy.y) {
                baddy.body.velocity.y = -80;
            }
        });

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
                        player.kill();
                    }
                }

            }
        }
        

    },
};

// the variables we will be using for our game.
var maze, player, baddies, key, door, keyPickup, 
    winGame, timeLeft, timeLabel, 
    cursors, gameOver, gotKey, frameCount = 0,
    levels, currentLevel = 0;