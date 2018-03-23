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
        
        
        // Light and shadow
        this.shadowTexture = game.add.bitmapData(game.width, game.height);
        var lightSprite = game.add.image(0,0,this.shadowTexture);
        lightSprite.fixedToCamera = true;
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
    },
    
    // Update called every frame thereafter
    update: function () {
        this.movePlayer();
        //this.moveBaddy();
        this.countDown();
        
        game.physics.arcade.collide(player,this.layer);
        game.physics.arcade.collide(baddies,this.layer);
        game.physics.arcade.overlap(player,this.items, 
                                    this.collectItem, 
                                    null, this);
        game.physics.arcade.overlap(player, door, 
                                    this.winGame, 
                                    null, this);
        game.physics.arcade.overlap(player, baddies, 
                                    this.endGame, 
                                    null, this);
        
        // Update the Shadow
        // You can change the radius (100) to be larger or smaller
        this.updateShadowTexture( { 
                                    x: player.x + player.width/2 - game.camera.x, 
                                    y: player.y + player.height/2 - game.camera.y },
                                100 )
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
        
        // Item System
        // Create an array to hold our current items (held items)
        this.inventory = [];
        // Create a group to hold items in the game world
        this.items = game.add.physicsGroup();
        
        // create key
        this.map.createFromObjects('Objects', 'key', 'tileset', 4, true, false, this.items);
        key = this.items.getByName('key');
        game.physics.arcade.enable(key);
        
        // Grow and Shrink the Key Using Tween
        var keyTween = game.add.tween(key.scale);
        keyTween.to({x: 1.25, y:1.25}, 500); // scale up to 1.25 over 500 ms
        keyTween.to({x: 1, y: 1}, 500); // scale down to 1 over 500 ms
        keyTween.easing(Phaser.Easing.Quadratic.InOut); // this controls the effect over time
        keyTween.loop(); // loop this tween forever
        keyTween.start(); // start the tween now
        // Change the key's anchor point so the tween looks better
        key.anchor.x = 0.5;
        key.anchor.y = 0.5;
        key.x += key.width/2;
        key.y += key.height/2;
        
        
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
        baddies.forEach(function(enemy){
            enemy.animations.add('run', [2, 6], 10, true);
            enemy.animations.play('run');
        });
        
    }, // end buildMazeFromFile() 
    
    
    winGame: function(){
        
        if(this.hasItem('key') == true){
            
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
    
    updateShadowTexture: function(position, radius)
    {
        // Draw the shadow
        // Decrease the RGB numbers to make the shadow darker
        // 0 will be black
        this.shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
        this.shadowTexture.context.fillRect(0, 0, game.width, game.height);
        
        // Draw the circle of light
        this.shadowTexture.context.beginPath();
        // Yyou could change the fill colour here from white to a darker colour
        // back and forth over time, along with radius,
        // to simulate "flickering"
        this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
        this.shadowTexture.context.arc(position.x, position.y, radius, 0, Math.PI*2);
        this.shadowTexture.context.fill();
        
        // Says texture should be updated
        this.shadowTexture.dirty = true;
    },
    
    // Adds an item to inventory and deletes the sprite
    collectItem: function(player, item) {
        this.inventory.push(item.name);
        item.kill();
    },
    
    // Checks if an item of this name is in our inventory
    hasItem: function(itemName) {
        return this.inventory.indexOf(itemName) > -1;
    }
};

var player, cursors, maze, gotKey = false, timeLeft = 30, gameOver = false, frameCount = 0, numLevels;

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');