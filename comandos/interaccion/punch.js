const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'punch',
    description: 'Le da un puñetazo a alguien.',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('👊 ¡Menciona a alguien para darle su merecido!');
        if (target.id === message.author.id) return message.reply('No te pegues a ti mismo... busca ayuda. 🤕');

        const punchData = [
            { gif: 'https://media.tenor.com/70b_mS_7_6kAAAAC/anime-punch.gif', anime: 'One Punch Man' },
            { gif: 'https://media.tenor.com/XiYuU9_vS70AAAAC/anime-girl-punch.gif', anime: 'Toradora!' },
            { gif: 'https://media.tenor.com/E39n1_S_7_6kAAAAC/anime-punch-face.gif', anime: 'Naruto' },
            { gif: 'https://media.tenor.com/PeE4_Yv_4MAAAAC/anime-punch-hard.gif', anime: 'Dragon Ball Z' }
        ];

        const random = punchData[Math.floor(Math.random() * punchData.length)];

        const embed = new EmbedBuilder()
            .setColor('#ffb703') // Color naranja impacto
            .setDescription(`👊 **${message.author.username}** le metió un puñetazo a **${target.username}**.`)
            .setImage(random.gif)
            .setFooter({ text: `Anime: ${random.anime}` });

        return message.reply({ embeds: [embed] });
    },
};