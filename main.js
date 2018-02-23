var mainState = {

    // Preload function called first when state starts
    preload: function() {
        
    },
    
    // Create function called after preload finishes
    create: function() {
       
    },
    
    // Update called every frame thereafter
    update: function() {

    }
    
};

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');