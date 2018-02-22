var mainState = {

    preload: function() {
        //load graphics
        game.load.image('player', 'assets/player.png');
        game.load.image('block', 'assets/block.png');
        game.load.image('baddy', 'assets/baddy.png');
        game.load.image('key', 'assets/key.png');
        game.load.image('door', 'assets/door.png');
        game.load.audio('pickup', 'assets/pickup.wav');
        game.load.audio('win', 'assets/win.wav');
        
    },
    
    create: function() {
        //game.world.setBounds(0, 0, 1000, 1000);
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        game.physics.startSystem(Phaser.Physics.ARCADE); // start the physics engine
        
        //make maze
        this.buildMaze();
        
        //create player
        player=game.add.sprite(60,405,'player');
        game.physics.arcade.enable(player);
        //game.camera.follow(player);
        
        baddies = game.add.group();
        baddies.enableBody = true; // add physics to the maze
        
        // create baddy
        baddy1=game.add.sprite(60,60,'baddy');
        baddy2=game.add.sprite(310,410,'baddy');
        
        baddies.add(baddy1);
        baddies.add(baddy2);
        //game.physics.arcade.enable(baddy1);
        
        // create key
        key=game.add.sprite(150,50,'key');
        game.physics.arcade.enable(key);
        
        // sound
        keyPickup = game.add.audio('pickup');
        winGame = game.add.audio('win');
        
        //create door
        door=game.add.sprite(400,100,'door');
        game.physics.arcade.enable(door);
        
        timeLabel = game.add.text(300,10, "TIME: "+ timeLeft,{ font: '12px Arial', fill: '#ffffff', align: 'left' });
        //timeLabel.fixedToCamera=true;
            
        // initialise keyboard cursors
        cursors = game.input.keyboard.createCursorKeys();
        
        gameOver=false;
        gotKey=false;
       
    },
    
    update: function() {
        // set up collisions
        game.physics.arcade.collide(player,maze);
        game.physics.arcade.overlap(player,baddies,this.endGame,null,this);
        game.physics.arcade.collide(maze,baddies);
        game.physics.arcade.collide(baddies,baddies);
        game.physics.arcade.overlap(player,key,this.showExit,null,this);
        game.physics.arcade.overlap(player,door,this.winGame,null,this);

        this.movePlayer();
        this.moveBaddy();
        this.countDown();

    },
    
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
    
    movePlayer: function(){
        if (cursors.left.isDown){
             if (player.x>0){
                 player.body.velocity.x=-200;
             }
                       
        }else if (cursors.right.isDown){
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
    
    endGame: function(){
        timeLeft=30;
        game.state.start('main');
    },
    
    showExit: function(){
        keyPickup.play();
        key.kill();
        gotKey=true;

    },
    
    winGame: function(){
        if(gotKey==true){
            winGame.play();
            // display message
            var messageLabel = game.add.text(100, 250, 'YOU ESCAPED!',{ font: '40px Arial', fill: '#ff0000' });
            messageLabel.fixedToCamera=true;
            player.kill();
           baddy1.kill();
            baddy2.kill();
            gameOver=true;
        }
    },
    countDown: function(){
        if(gameOver==false){
            frameCount++;
            if (frameCount%60==0){
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


var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
var player, baddy, key, door,cursors,maze,baddies,gameOver;
var timeLeft=30;
var frameCount=0;

game.state.add('main', mainState);
game.state.start('main');