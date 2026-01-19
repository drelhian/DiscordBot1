const { Hangman } = require('discord-gamecord');

module.exports = {
    name: 'ahorcado',
    description: 'Juega al ahorcado e intenta adivinar la palabra usando prefijos',
    async execute(message, args) {
        const Game = new Hangman({
            message: message,                // Objeto de mensaje estándar
            isSlashGame: false,              // Desactivado para usar prefijos
            embed: {
                title: 'Juego del Ahorcado',
                color: '#5865F2',
            },
            hangman: {
                hat: '🎩',
                head: '😟',
                mainBody: '👕',
                leftArm: '💪',
                rightArm: '💪',
                leftLeg: '🦶',
                rightLeg: '🦶',
            },
            timeoutTime: 60000,
            theme: 'nature',                 // Temas: nature, sport, color, camp, fruit, etc.
            winMessage: '¡Ganaste! La palabra era **{word}**.',
            loseMessage: 'Perdiste... La palabra era **{word}**.',
            playerOnlyMessage: 'Solo {player} puede usar estos botones.'
        });

        Game.startGame();
    },
};