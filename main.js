var mainState = {

    // The preload function is run once at the beginning of the state, before anything else.
    preload: function() {
        // load graphics
        game.load.image('player', 'assets/player.png');
        game.load.image('block', 'assets/block.png');
        game.load.image('baddy', 'assets/baddy.png');
        game.load.image('key', 'assets/key.png');
        game.load.image('door', 'assets/door.png');
        
        // load audio
        game.load.audio('pickup', 'assets/pickup.wav');
        game.load.audio('win', 'assets/win.wav');
    },
    
    // The create function is run once at the beginning of the state, after preloading is complete.
    create: function() {
        
        // Reset our variables from last play through
        timeLeft = 30;
        gameOver = false;
        gotKey = false;
        
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        
        // start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE); 
        
        // make maze
        this.buildMaze();
        
        // create player & add physics to them
        player = game.add.sprite(60,405,'player');
        game.physics.arcade.enable(player);
        
        // create baddies
        baddies = game.add.group();
        baddies.enableBody = true; // add physics to the baddies
        baddy1 = game.add.sprite(60,60,'baddy');
        baddy2 = game.add.sprite(310,410,'baddy');
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
    
    // The update function is run every frame that the state is active
    update: function() {
        
        // set up collisions
        game.physics.arcade.collide(player,maze);
        game.physics.arcade.overlap(player,baddies, this.loseGame, null, this);
        game.physics.arcade.collide(maze,baddies);
        game.physics.arcade.collide(baddies,baddies);
        game.physics.arcade.overlap(player,key, this.pickupKey, null, this);
        game.physics.arcade.overlap(player,door, this.winGame, null, this);
        
        this.movePlayer();
    },
    
    // Maze building function - creates maze based on an array.
    // Later we can improve this to pass in the array and include enemy positions and more!
    // We could even set this up to use a tilemap we can edit externally.
    buildMaze: function() {
        
        // make maze a group of objects
        maze = game.add.group();
        maze.enableBody = true; // add physics to the maze
        
        // An array of 0 and 1 -> 1 represents a block, 0 a space.
        var blockArray = [
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
            ];
        
        // Go through our list of block locations and create blocks in the right places.
        for (var r=0;r<blockArray.length;r++) {
            
            for (var c=0; c<blockArray[r].length;c++) {
                console.log("Column",c);
                console.log("Row",r);
                
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
            
            // display message
            var messageLabel = game.add.text(100, 250, 
                                             'YOU ESCAPED!',
                                             { font: '40px Arial', fill: '#ff0000' });
            messageLabel.fixedToCamera = true;
            
            // Kill player and baddy sprites
            player.kill();
            baddy1.kill();
            baddy2.kill();
            
            // Set gameOver variable
            gameOver = true;
        }
        
    },
    
    // If the player touches a baddy, lose the game!
    loseGame: function() {
        // This causes the state (level) to reload from the beginning!
        game.state.start('main');
    },
};

// the variables we will be using for our game.
var maze, player, baddies, baddy1, 
    baddy2, key, door, keyPickup, 
    winGame, timeLeft, timeLabel, 
    cursors, gameOver, gotKey;

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');