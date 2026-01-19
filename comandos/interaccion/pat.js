const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pat',
    description: 'Acaricia a alguien y lleva la cuenta de caricias recibidas',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('✋ ¡Debes mencionar a alguien para darle caricias!');
        if (target.id === message.author.id) return message.reply('Te acaricias a ti mismo... ¡Qué tierno! (o qué solo estás) 😶');

        // --- BASE DE DATOS DE GIFS DE CARICIAS ---
        const patData = [
            { gif: 'https://media.tenor.com/E6f99t_6Y10AAAAC/anime-pat.gif', anime: 'Usubeni no Arashi' },
            { gif: 'https://media.tenor.com/Y76-Sc_p_6AAAAAC/anime-head-pat.gif', anime: 'Non Non Biyori' },
            { gif: 'https://media.tenor.com/G9666Y6_8S0AAAAC/anime-head-pat.gif', anime: 'K-On!' },
            { gif: 'https://media.tenor.com/8DaE4_Yv_4MAAAAC/anime-pat-head-pat.gif', anime: 'Love Live!' },
            { gif: 'https://media.tenor.com/47_pmYshO6kAAAAC/anime-head-pat.gif', anime: 'Gabriel DropOut' }
        ];

        const randomSelection = patData[Math.floor(Math.random() * patData.length)];

        // --- SISTEMA DE CONTEO (Usando el mismo interacciones.json) ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializar contadores si no existen para este comando
        // Usamos una propiedad específica para pat (pats) y así no mezclar con hug
        if (!db[target.id]) db[target.id] = { hugs: 0, pats: 0 };
        if (db[target.id].pats === undefined) db[target.id].pats = 0;
        
        db[target.id].pats += 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const totalPats = db[target.id].pats;

        // --- CREACIÓN DEL EMBED ---
        const patEmbed = new EmbedBuilder()
            .setColor('#bde0fe')
            .setDescription(`**${message.author.username}** acaricia a **${target.username}**.\n*${target.username} ha recibido ${totalPats} caricias.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA DEVOLVER LA CARICIA ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('return_pat')
                .setLabel('Devolver caricia 👋')
                .setStyle(ButtonStyle.Primary)
        );

        const response = await message.channel.send({
            embeds: [patEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== target.id) {
                return i.reply({ content: '¡Solo la persona acariciada puede devolver la caricia!', ephemeral: true });
            }

            // Actualizamos la cuenta para el autor original
            if (!db[message.author.id]) db[message.author.id] = { hugs: 0, pats: 0 };
            if (db[message.author.id].pats === undefined) db[message.author.id].pats = 0;
            
            db[message.author.id].pats += 1;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const newTotal = db[message.author.id].pats;
            const newRandom = patData[Math.floor(Math.random() * patData.length)];

            const returnEmbed = new EmbedBuilder()
                .setColor('#bde0fe')
                .setDescription(`**${target.username}** le devolvió la caricia a **${message.author.username}**.\n*${message.author.username} ha recibido ${newTotal} caricias.*`)
                .setImage(newRandom.gif)
                .setFooter({ text: `Anime: ${newRandom.anime}` });

            await i.update({ components: [] });
            await i.followUp({ embeds: [returnEmbed] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('return_pat')
                    .setLabel('Acariciado ❤️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};