const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'bonk',
    description: 'Le da un bonk a alguien y lo manda a la horny jail',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('🔨 ¡Debes mencionar a alguien para darle un bonk!');
        if (target.id === message.author.id) return message.reply('¿Dándote un bonk a ti mismo? Eso es... extraño. 🤨');

        // --- BASE DE DATOS DE GIFS DE BONKS ---
        const bonkData = [
            { gif: 'https://media.tenor.com/79666Y6_8S0AAAAC/anime-bonk.gif', anime: 'Sora no Otoshimono' },
            { gif: 'https://media.tenor.com/MMm9X_Osh_0AAAAC/anime-bonk-head.gif', anime: 'Blend S' },
            { gif: 'https://media.tenor.com/OMm9X_Osh_0AAAAC/anime-hammer-bonk.gif', anime: 'Working!!' },
            { gif: 'https://media.tenor.com/it_m9_vU_S8AAAAC/bonk-anime.gif', anime: 'Love Live!' }
        ];

        const randomSelection = bonkData[Math.floor(Math.random() * bonkData.length)];

        // --- SISTEMA DE CONTEO ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializamos contadores específicos para bonk
        if (!db[target.id]) db[target.id] = { hugs: 0, pats: 0, kisses: 0, slaps: 0, bonks: 0 };
        if (db[target.id].bonks === undefined) db[target.id].bonks = 0;
        
        db[target.id].bonks += 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const totalBonks = db[target.id].bonks;

        // --- CREACIÓN DEL EMBED ---
        const bonkEmbed = new EmbedBuilder()
            .setColor('#f4a261') // Color naranja/tierra para bonks
            .setDescription(`**${message.author.username}** le dio un bonk a **${target.username}**.\n*${target.username} ha recibido ${totalBonks} bonks.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA DEVOLVER EL BONK ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('return_bonk')
                .setLabel('Devolver bonk 🔨')
                .setStyle(ButtonStyle.Warning)
        );

        const response = await message.channel.send({
            embeds: [bonkEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== target.id) {
                return i.reply({ content: '¡Solo la persona que recibió el bonk puede devolverlo!', ephemeral: true });
            }

            // Actualizamos la cuenta para el autor original
            if (!db[message.author.id]) db[message.author.id] = { hugs: 0, pats: 0, kisses: 0, slaps: 0, bonks: 0 };
            if (db[message.author.id].bonks === undefined) db[message.author.id].bonks = 0;
            
            db[message.author.id].bonks += 1;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const newTotal = db[message.author.id].bonks;
            const newRandom = bonkData[Math.floor(Math.random() * bonkData.length)];

            const returnEmbed = new EmbedBuilder()
                .setColor('#f4a261')
                .setDescription(`**${target.username}** le devolvió el bonk a **${message.author.username}**.\n*${message.author.username} ha recibido ${newTotal} bonks.*`)
                .setImage(newRandom.gif)
                .setFooter({ text: `Anime: ${newRandom.anime}` });

            await i.update({ components: [] });
            await i.followUp({ embeds: [returnEmbed] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('return_bonk')
                    .setLabel('Bonk finalizado 🔨')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};