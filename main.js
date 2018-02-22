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
    },
    
    update: function() {

    },
    
};

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');