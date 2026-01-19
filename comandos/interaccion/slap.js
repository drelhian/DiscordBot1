const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'slap',
    description: 'Le da una bofetada a alguien y lleva la cuenta de bofetadas recibidas',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('💢 ¡Debes mencionar a alguien para darle una bofetada!');
        if (target.id === message.author.id) return message.reply('¿Dándote bofetadas a ti mismo? ¡Busca ayuda profesional! 🤡');

        // --- BASE DE DATOS DE GIFS DE BOFETADAS ---
        const slapData = [
            { gif: 'https://media.tenor.com/E39n1_S_7_6kAAAAC/anime-slap.gif', anime: 'Toradora!' },
            { gif: 'https://media.tenor.com/XiYuU9_vS70AAAAC/anime-slap-girl.gif', anime: 'Clannad' },
            { gif: 'https://media.tenor.com/PeE4_Yv_4MAAAAC/anime-slap.gif', anime: 'Aho Girl' },
            { gif: 'https://media.tenor.com/yJ666Y6_8S0AAAAC/anime-slap.gif', anime: 'Plastic Memories' },
            { gif: 'https://media.tenor.com/70b_mS_7_6kAAAAC/anime-slap.gif', anime: 'The Familiar of Zero' }
        ];

        const randomSelection = slapData[Math.floor(Math.random() * slapData.length)];

        // --- SISTEMA DE CONTEO ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializamos contadores específicos para slap
        if (!db[target.id]) db[target.id] = { hugs: 0, pats: 0, kisses: 0, slaps: 0 };
        if (db[target.id].slaps === undefined) db[target.id].slaps = 0;
        
        db[target.id].slaps += 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const totalSlaps = db[target.id].slaps;

        // --- CREACIÓN DEL EMBED ---
        const slapEmbed = new EmbedBuilder()
            .setColor('#e63946') // Rojo fuerte para bofetadas
            .setDescription(`**${message.author.username}** le dio una bofetada a **${target.username}**.\n*${target.username} ha recibido ${totalSlaps} bofetadas.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA DEVOLVER LA BOFETADA ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('return_slap')
                .setLabel('Devolver bofetada 💢')
                .setStyle(ButtonStyle.Danger)
        );

        const response = await message.channel.send({
            embeds: [slapEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== target.id) {
                return i.reply({ content: '¡Solo la persona golpeada puede devolver la bofetada!', ephemeral: true });
            }

            // Actualizamos la cuenta para el autor original
            if (!db[message.author.id]) db[message.author.id] = { hugs: 0, pats: 0, kisses: 0, slaps: 0 };
            if (db[message.author.id].slaps === undefined) db[message.author.id].slaps = 0;
            
            db[message.author.id].slaps += 1;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const newTotal = db[message.author.id].slaps;
            const newRandom = slapData[Math.floor(Math.random() * slapData.length)];

            const returnEmbed = new EmbedBuilder()
                .setColor('#e63946')
                .setDescription(`**${target.username}** le devolvió la bofetada a **${message.author.username}**.\n*${message.author.username} ha recibido ${newTotal} bofetadas.*`)
                .setImage(newRandom.gif)
                .setFooter({ text: `Anime: ${newRandom.anime}` });

            await i.update({ components: [] });
            await i.followUp({ embeds: [returnEmbed] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('return_slap')
                    .setLabel('Bofetada procesada 🥊')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};