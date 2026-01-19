const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'cry',
    description: 'Expresa tu tristeza con un gif de llanto.',
    async execute(message, args) {
        
        // --- BASE DE DATOS DE GIFS DE LLANTO ---
        const cryData = [
            { gif: 'https://media.tenor.com/y4pXf_mS_7_6kAAAAC/anime-cry.gif', anime: 'K-On!' },
            { gif: 'https://media.tenor.com/it_m9_vU_S8AAAAC/anime-crying.gif', anime: 'Angel Beats!' },
            { gif: 'https://media.tenor.com/MMm9X_Osh_0AAAAC/cry-anime.gif', anime: 'Violet Evergarden' },
            { gif: 'https://media.tenor.com/jM39pW8S2FAAAAAC/anime-cry-sad.gif', anime: 'Plastic Memories' },
            { gif: 'https://media.tenor.com/6X2W9L-n5EwAAAAC/anime-crying-sad.gif', anime: 'Toradora!' }
        ];

        const randomSelection = cryData[Math.floor(Math.random() * cryData.length)];

        // --- CREACIÓN DEL EMBED ---
        const cryEmbed = new EmbedBuilder()
            .setColor('#74c0fc') // Azul claro (lágrimas)
            .setDescription(`**${message.author.username}** se ha puesto a llorar... 😭`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` })
            .setTimestamp();

        return message.reply({ embeds: [cryEmbed] });
    },
};