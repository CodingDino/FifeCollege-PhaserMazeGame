// Note the globals that will be used:
/* global   game,
            Phaser */

var bootState = {
    
    // state.preload is called when the state is entered
    preload: function() {
        game.load.image('progressBar', 'assets/progressBar.png')
    },
    
    // state.create is called after preload finishes
    create: function() {
        
        // set BG colour
        game.stage.backgroundColor = '#5474cb';
        
        // start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE); 
        
        // Start the load state
        game.state.start('play');
    },
};