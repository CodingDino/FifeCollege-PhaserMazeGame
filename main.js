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
        
    },
    
    // Create function called after preload finishes
    create: function() {
       
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        game.physics.startSystem(Phaser.Physics.ARCADE); // start the physics engine
        
        //create player
        player = game.add.sprite(60, 405, 'player');
        game.physics.arcade.enable(player);
        
        // initialise keyboard cursors
        cursors = game.input.keyboard.createCursorKeys();
        
        this.buildMazeFromFile(1);
        
        // create key
        key = game.add.sprite(150,50,'key');
        game.physics.arcade.enable(key);
        
        // sound
        keyPickup = game.add.audio('pickup');
        winGame = game.add.audio('win');
        
        //create door
        door = game.add.sprite(400,100,'door');
        game.physics.arcade.enable(door);
        
        baddies = game.add.group();
        baddies.enableBody = true; // add physics to the baddies
        
        // create baddy
        baddy1=game.add.sprite(60,60,'baddy');
        baddy2=game.add.sprite(310,410,'baddy');
        
        baddies.add(baddy1);
        baddies.add(baddy2);
        
        timeLabel = game.add.text(300,10, "TIME: "+ timeLeft,{ font: '12px Arial', fill: '#ffffff', align: 'left' });
    },
    
    // Update called every frame thereafter
    update: function () {
        this.movePlayer();
        this.moveBaddy();
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
             if (player.x>0){
                 player.body.velocity.x=-200;
             }
                       
        } else if (cursors.right.isDown){
            if (player.x<460){
                player.body.velocity.x=200;
            }
            
        }else{
            player.body.velocity.x=0;
        }
        
        
        if (cursors.up.isDown){
             if (player.y>0){
                 player.body.velocity.y=-200;
             }
                       
        }else if (cursors.down.isDown){
            if (player.y<460){
                player.body.velocity.y=200;
            }
            
        }else{
            
            player.body.velocity.y=0;
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
            winGame.play();
            // display message
            var messageLabel = game.add.text(100, 250, 'YOU ESCAPED!',{ font: '40px Arial', fill: '#ff0000' });
            messageLabel.fixedToCamera=true;
            player.kill();
            gameOver=true;
        }
    },
    
    moveBaddy: function(){
        
        if (player.x>baddy1.x){
            baddy1.body.velocity.x=80;
        }else if (player.x<baddy1.x){
            baddy1.body.velocity.x=-80;
        }
        
        if (player.y>baddy1.y){
            baddy1.body.velocity.y=80;
        }else if (player.y<baddy1.y){
            baddy1.body.velocity.y=-80;
        }
        
        if (player.x>baddy2.x){
            baddy2.body.velocity.x=100;
        }else if (player.x<baddy2.x){
            baddy2.body.velocity.x=-100;
        }
        
        if (player.y>baddy2.y){
            baddy2.body.velocity.y=100;
        }else if (player.y<baddy2.y){
            baddy2.body.velocity.y=-100;
        }

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

var player, cursors, maze, gotKey = false, timeLeft = 30, gameOver = false, frameCount = 0;

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');