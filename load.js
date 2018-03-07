// Note the globals that will be used:
/* global   game,
            Phaser */

var loadState = {
    
    // state.preload is called when the state is entered
    preload: function() {
        
        // Add a 'loading...' label on the screen
        var loadingLabel = game.add.text(game.world.centerX, 
                                         150, 'loading...',
                                         { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);
        
        // Display the progress bar
        var progressBar = game.add.sprite(game.world.centerX, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
        
        // Load all our assets
        
        // load graphics
        game.load.image('player', 'assets/player.png');
        //game.load.image('block', 'assets/block.png');
        game.load.image('baddy', 'assets/baddy.png');
        game.load.image('key', 'assets/key.png');
        game.load.image('door', 'assets/door.png');
        
        // load audio
        game.load.audio('pickup', 'assets/pickup.wav');
        game.load.audio('win', 'assets/win.wav');
        
        game.load.image('tileset', 'assets/block.png');
        game.load.tilemap('map', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
    },
    
    // state.create is called after preload finishes
    create: function() {
        // Go to the menu state
        game.state.start('menu');
    },
};