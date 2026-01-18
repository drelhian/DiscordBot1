const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'kiss',
    description: 'Besa a alguien y lleva la cuenta de besos recibidos',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('💋 ¡Debes mencionar a alguien para darle un beso!');
        if (target.id === message.author.id) return message.reply('¿Besarte a ti mismo en el espejo? ¡Qué narcisista! 😂');

        // --- BASE DE DATOS DE GIFS DE BESOS ---
        const kissData = [
            { gif: 'https://media.tenor.com/F0ujX_3Yf7IAAAAC/anime-kiss.gif', anime: 'Sakura Trick' },
            { gif: 'https://media.tenor.com/f_pYh_S6G_IAAAAC/anime-kissing.gif', anime: 'Toradora!' },
            { gif: 'https://media.tenor.com/d_S8pW8S2FAAAAAC/anime-kiss.gif', anime: 'Chuunibyou demo Koi ga Shitai!' },
            { gif: 'https://media.tenor.com/S8o7m0-vS70AAAAC/anime-kiss.gif', anime: 'Golden Time' },
            { gif: 'https://media.tenor.com/G9666Y6_8S0AAAAC/anime-kiss.gif', anime: 'Sukitte Ii na yo' }
        ];

        const randomSelection = kissData[Math.floor(Math.random() * kissData.length)];

        // --- SISTEMA DE CONTEO ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializamos contadores específicos para kiss
        if (!db[target.id]) db[target.id] = { hugs: 0, pats: 0, kisses: 0 };
        if (db[target.id].kisses === undefined) db[target.id].kisses = 0;
        
        db[target.id].kisses += 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const totalKisses = db[target.id].kisses;

        // --- CREACIÓN DEL EMBED ---
        const kissEmbed = new EmbedBuilder()
            .setColor('#ff4d6d')
            .setDescription(`**${message.author.username}** le da un beso a **${target.username}**.\n*${target.username} ha recibido ${totalKisses} besos.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA DEVOLVER EL BESO ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('return_kiss')
                .setLabel('Devolver beso 💋')
                .setStyle(ButtonStyle.Danger) // Rojo para besos
        );

        const response = await message.channel.send({
            embeds: [kissEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== target.id) {
                return i.reply({ content: '¡Solo la persona besada puede devolver el beso!', ephemeral: true });
            }

            // Actualizamos la cuenta para el autor original
            if (!db[message.author.id]) db[message.author.id] = { hugs: 0, pats: 0, kisses: 0 };
            if (db[message.author.id].kisses === undefined) db[message.author.id].kisses = 0;
            
            db[message.author.id].kisses += 1;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const newTotal = db[message.author.id].kisses;
            const newRandom = kissData[Math.floor(Math.random() * kissData.length)];

            const returnEmbed = new EmbedBuilder()
                .setColor('#ff4d6d')
                .setDescription(`**${target.username}** le devolvió el beso a **${message.author.username}**.\n*${message.author.username} ha recibido ${newTotal} besos.*`)
                .setImage(newRandom.gif)
                .setFooter({ text: `Anime: ${newRandom.anime}` });

            await i.update({ components: [] });
            await i.followUp({ embeds: [returnEmbed] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('return_kiss')
                    .setLabel('Beso enviado ❤️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};