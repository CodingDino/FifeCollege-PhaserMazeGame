var mainState = {

    preload: function() {
        
    },
    
    create: function() {
       
    },
    
    update: function() {

    },
    
};

var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');