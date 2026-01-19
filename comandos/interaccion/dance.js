const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dance',
    description: '¡Saca tus mejores pasos de baile!',
    async execute(message, args) {
        
        // --- BASE DE DATOS DE GIFS DE BAILE ---
        const danceData = [
            { gif: 'https://media.tenor.com/79666Y6_8S0AAAAC/anime-dance.gif', anime: 'Kaguya-sama: Love is War' },
            { gif: 'https://media.tenor.com/MMm9X_Osh_0AAAAC/anime-dance-happy.gif', anime: 'Lucky Star' },
            { gif: 'https://media.tenor.com/it_m9_vU_S8AAAAC/anime-dance-cute.gif', anime: 'Beyond the Boundary' },
            { gif: 'https://media.tenor.com/jM39pW8S2FAAAAAC/dance-anime.gif', anime: 'Nichijou' },
            { gif: 'https://media.tenor.com/f_pYh_S6G_IAAAAC/anime-dance.gif', anime: 'Engaged to the Unidentified' }
        ];

        const randomSelection = danceData[Math.floor(Math.random() * danceData.length)];

        // --- CREACIÓN DEL EMBED ---
        const danceEmbed = new EmbedBuilder()
            .setColor('#ffc8dd') // Rosa pastel alegre
            .setDescription(`🕺 **${message.author.username}** está bailando con mucha energía.`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` })
            .setTimestamp();

        return message.reply({ embeds: [danceEmbed] });
    },
};