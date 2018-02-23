
var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');

// Add all states
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

// Start the "boot" state
game.state.start('play');