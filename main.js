var mainState = {

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
    
    create: function() {
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        
        // start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE); 
        
        // make maze
        this.buildMaze();
    },
    
    update: function() {

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
    
    
};

// the variables we will be using for our game.
var maze;

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');