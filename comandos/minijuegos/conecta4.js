const { Connect4 } = require('discord-gamecord');

module.exports = {
    name: 'conecta4',
    description: 'Juega al Conecta 4 contra un amigo o contra el bot usando prefijos',
    async execute(message, args) {
        // Guardamos la mención en una variable
        const mencion = message.mentions.users.first();
        // Si hay mención, el oponente es el usuario; si no, es el bot
        const oponente = mencion || message.client.user;

        // Validación para no jugar contra uno mismo
        if (oponente.id === message.author.id) {
            return message.reply('❌ No puedes jugar contra ti mismo. ¡Menciona a un amigo o desafíame a mí!');
        }

        const Game = new Connect4({
            message: message,
            isSlashGame: false,
            opponent: oponente,
            // Si NO hay mención, opponentBot será true y el juego iniciará directo
            opponentBot: !mencion, 
            embed: {
                title: 'Conecta 4',
                color: '#5865F2',
                statusTitle: 'Estado',
                overTitle: 'Partida Terminada'
            },
            emojis: {
                board: '⚪',
                player1: '🔴',
                player2: '🟡'
            },
            mentionUser: true,
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            winMessage: '¡Victoria! **{player}** ha conectado 4 fichas.',
            tieMessage: '¡Es un empate! El tablero está lleno.',
            timeoutMessage: 'La partida terminó por inactividad.',
            playerOnlyMessage: 'Solo {player} y {opponent} pueden usar estos botones.'
        });

        Game.startGame();
    },
};