const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'shoot',
    description: 'Le dispara a alguien (ficticiamente, claro).',
    async execute(message, args) {
        const target = message.mentions.users.first();
        
        if (!target) return message.reply('🔫 ¡Debes mencionar a alguien para disparar!');
        if (target.id === message.author.id) return message.reply('No puedes dispararte a ti mismo, ¡la vida es bella! 🌸');

        // --- BASE DE DATOS DE GIFS DE DISPAROS (ANIME) ---
        const shootData = [
            { gif: 'https://media.tenor.com/XiYuU9_vS70AAAAC/anime-shot-gun.gif', anime: 'Lycoris Recoil' },
            { gif: 'https://media.tenor.com/E39n1_S_7_6kAAAAC/anime-shooting.gif', anime: 'Black Lagoon' },
            { gif: 'https://media.tenor.com/PeE4_Yv_4MAAAAC/anime-gun-fire.gif', anime: 'Assassination Classroom' },
            { gif: 'https://media.tenor.com/yJ666Y6_8S0AAAAC/anime-gun-shot.gif', anime: 'Psycho-Pass' },
            { gif: 'https://media.tenor.com/70b_mS_7_6kAAAAC/anime-shoot-sniper.gif', anime: 'Sword Art Online II' }
        ];

        const randomSelection = shootData[Math.floor(Math.random() * shootData.length)];

        // --- CREACIÓN DEL EMBED ---
        const shootEmbed = new EmbedBuilder()
            .setColor('#343a40') // Gris oscuro tipo metal
            .setDescription(`🎯 **${message.author.username}** le disparó a **${target.username}**.\n*¡A cubierto!*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` })
            .setTimestamp();

        return message.reply({ embeds: [shootEmbed] });
    },
};