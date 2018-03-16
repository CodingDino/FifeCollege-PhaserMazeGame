var mainState = {

    // Preload function called first when state starts
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
        
        // load tilemap
        game.load.spritesheet('tileset', 
                              'assets/tileset.png', 
                              50, 
                              50);
        game.load.tilemap('map1', 
                          'assets/level_1.json', 
                          null, 
                          Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map2', 
                          'assets/level_2.json', 
                          null, 
                          Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map3', 
                          'assets/level_3.json', 
                          null, 
                          Phaser.Tilemap.TILED_JSON);
        numLevels = 3; // Update this if we add more levels
        
    },
    
    // Create function called after preload finishes
    create: function() {
       
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        game.physics.startSystem(Phaser.Physics.ARCADE); // start the physics engine
        
        // initialise keyboard cursors
        cursors = game.input.keyboard.createCursorKeys();
        
        if (this.currentLevel == null)
            this.currentLevel = 1;
        this.buildMazeFromFile(this.currentLevel);
        

        
        // sound
        keyPickup = game.add.audio('pickup');
        winGame = game.add.audio('win');
        
        timeLabel = game.add.text(300,10, "TIME: "+ timeLeft,{ font: '12px Arial', fill: '#ffffff', align: 'left' });
    },
    
    // Update called every frame thereafter
    update: function () {
        this.movePlayer();
        //this.moveBaddy();
        this.countDown();
        
        game.physics.arcade.collide(player,this.layer);
        game.physics.arcade.collide(baddies,this.layer);
        game.physics.arcade.overlap(player, key, 
                                    this.showExit, 
                                    null, this);
        game.physics.arcade.overlap(player, door, 
                                    this.winGame, 
                                    null, this);
        game.physics.arcade.overlap(player, baddies, 
                                    this.endGame, 
                                    null, this);
    },
    
    movePlayer: function() {
        if (cursors.left.isDown) {
            player.body.velocity.x=-200;        
        } else if (cursors.right.isDown) {
            player.body.velocity.x=200;
        } else {
            player.body.velocity.x=0;
        }
        
        if (cursors.up.isDown) {
            player.body.velocity.y=-200;     
        } else if (cursors.down.isDown) {
            player.body.velocity.y=200;
        } else {
            player.body.velocity.y=0;
        }
        
        // animation
        if (player.body.velocity.x != 0 || player.body.velocity.y != 0) {
            player.animations.play('run');
        }
        else
        {
            player.animations.play('stand');
        }
    },
    
    // Maze building function - creates a maze based on a file
    // we pass in the number for the file we want to use
    buildMazeFromFile: function(level) {
        // Create the tilemap
        this.map = game.add.tilemap('map'+level);
        // Add the tileset to the map
        this.map.addTilesetImage('tileset');
        // Create the layer, by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('maze');
        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions with the first element of our tileset (the wall)
        this.map.setCollision(1);
        
        
        // create key
        var keys = game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'key', 'tileset', 4, true, false, keys);
        key = keys.getFirstExists();
        game.physics.arcade.enable(key);
        
        //create player
        var players = game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'player', 'tileset', 1, true, false, players);
        player = players.getFirstExists();
        game.physics.arcade.enable(player);
        game.camera.follow(player);
        player.animations.add('run', [1, 5], 10, true);
        player.animations.add('stand', [1], 10, true);
        player.animations.play('stand');
        
        //create door
        var doors = game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'door', 'tileset', 3, true, false, doors);
        door = doors.getFirstExists();
        game.physics.arcade.enable(door);
        
        // create baddies
        baddies = game.add.physicsGroup();
        this.map.createFromObjects('Objects', 'enemy', 'tileset', 2, true, false, baddies);
        
    }, // end buildMazeFromFile() 
    
    
    buildMaze: function(){
        // make maze a group of objects
        maze = game.add.group();
        maze.enableBody = true; // add physics to the maze
        maze.setAll('body.immovable', true); // make the maze objects immovable
        
        
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
        
        for (var r=0;r<blockArray.length;r++){
            
            for (var c=0; c<blockArray[r].length;c++){
                console.log("Column",c);
                console.log("Row",r);
                if(blockArray[r][c]==1){
                   var block=game.add.sprite(c*50,r*50,'block');
                    maze.add(block);
                }
            }
            
        }
        
        maze.setAll('body.immovable', true);
    },
    
    showExit: function() {
        keyPickup.play();
        key.kill();
        gotKey = true;
    },
    
    
    winGame: function(){
        
        if(gotKey==true){
            
            if (this.currentLevel == numLevels) {
                winGame.play();
                // display message
                var messageLabel = game.add.text(100, 250, 'YOU ESCAPED!',{ font: '40px Arial', fill: '#ff0000' });
                messageLabel.fixedToCamera=true;
                player.kill();
                gameOver=true;  
            }
            else {
                ++this.currentLevel;
                game.state.start('main');
            }

        }
        
    },
    
    moveBaddy: function(){
        
        baddies.forEach( function (baddy) {
            if (player.x>baddy.x){
                baddy.body.velocity.x=80;
            }else if (player.x<baddy.x){
                baddy.body.velocity.x=-80;
            }

            if (player.y>baddy.y){
                baddy.body.velocity.y=80;
            }else if (player.y<baddy.y){
                baddy.body.velocity.y=-80;
            }
        } ); // end baddies.forEach
        
    },
    
    endGame: function () {
        timeLeft = 30;
        game.state.start('main');
    },
    
    countDown: function() {
        if(gameOver==false){
            frameCount++;
            if (frameCount%60==0) {
                if(timeLeft>0){
                    timeLeft--;
                    timeLabel.text="TIME: "+ timeLeft;
                    if (timeLeft<1){
                        var messageLabel = game.add.text(100, 250, 'TIME UP!',{ font: '40px Arial', fill: '#ffffff' });
                        //messageLabel.fixedToCamera=true;
                        player.kill();
                    }
                }
            }
        }
    },
};

var player, cursors, maze, gotKey = false, timeLeft = 30, gameOver = false, frameCount = 0, numLevels;

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');