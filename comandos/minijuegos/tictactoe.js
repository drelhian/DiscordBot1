const { TicTacToe } = require('discord-gamecord');

module.exports = {
    name: 'tictactoe',
    description: 'Juega al tres en raya con alguien o contra mí usando prefijos',
    async execute(message, args) {
        // Detectamos si hay una mención
        const mencion = message.mentions.users.first();
        // Si hay mención, el oponente es el usuario; si no, es el bot
        const oponente = mencion || message.client.user;

        // Evitar jugar contra uno mismo
        if (oponente.id === message.author.id) {
            return message.reply('❌ ¡No puedes jugar contra ti mismo! Menciona a un amigo o juega contra mí.');
        }

        const Game = new TicTacToe({
            message: message,
            isSlashGame: false,
            opponent: oponente,
            // AQUÍ LA LÓGICA: Si el oponente es el bot, activamos opponentBot para que empiece directo
            opponentBot: !mencion, 
            embed: {
                title: 'Tic Tac Toe (Tres en Raya)',
                color: '#5865F2',
                statusTitle: 'Estado',
                overTitle: 'Partida Terminada'
            },
            emojis: {
                xButton: '❌',
                oButton: '🔵',
                blankButton: '➖'
            },
            mentionUser: true,
            timeoutTime: 60000,
            xButtonStyle: 'DANGER',
            oButtonStyle: 'PRIMARY',
            blankButtonStyle: 'SECONDARY',
            winMessage: '¡Felicidades! **{player}** ha ganado la partida.',
            tieMessage: '¡Es un empate! Nadie ha ganado.',
            timeoutMessage: 'La partida terminó por inactividad.',
            playerOnlyMessage: 'Solo {player} y {opponent} pueden usar estos botones.'
        });

        Game.startGame();
    },
};