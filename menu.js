// Note the globals that will be used:
/* global   game,
            Phaser */

var menuState = {
    
    // state.create is called after preload finishes
    create: function() {
        
        // Display the name of the game
        var nameLabel = game.add.text(game.world.centerX, 80, 'Dungeon Escape',
                                      { font: '50px Arial', fill: '#ffffff' });
        nameLabel.anchor.setTo(0.5, 0.5);
        
        // Explain how to start the game
        var startLabel = game.add.text(game.world.centerX, game.world.height-80,
                                       'press the up arrow key to start',
                                       { font: '25px Arial', fill: '#ffffff' });
        startLabel.anchor.setTo(0.5, 0.5);
        
        // Create a new Phaser keyboard variable: the up arrow key
        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        
        // When the 'upKey' is pressed, it will call the 'start' function once
        upKey.onDown.addOnce(this.start, this);
    },
    
    start: function() {
        // Start the actual game
        game.state.start('play');
    },
};