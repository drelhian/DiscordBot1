const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'hug',
    description: 'Abraza a alguien y lleva la cuenta de abrazos recibidos',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❤️ ¡Debes mencionar a alguien para abrazar!');
        if (target.id === message.author.id) return message.reply('¿Te vas a abrazar a ti mismo? ¡Ven aquí, yo te abrazo! 🤗');

        // --- BASE DE DATOS DE GIFS ---
        const hugData = [
            { gif: 'https://media.tenor.com/70b_mS_7_6kAAAAC/anime-hug.gif', anime: 'Oniichan wa Oshimai!' },
            { gif: 'https://media.tenor.com/it_m9_vU_S8AAAAC/hug-anime.gif', anime: 'Hori-san to Miyamura-kun' },
            { gif: 'https://media.tenor.com/MMm9X_Osh_0AAAAC/anime-hug.gif', anime: 'Toradora!' },
            { gif: 'https://media.tenor.com/jM39pW8S2FAAAAAC/anime-hug.gif', anime: 'Chuunibyou demo Koi ga Shitai!' }
        ];

        const randomSelection = hugData[Math.floor(Math.random() * hugData.length)];

        // --- SISTEMA DE CONTEO ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Si el usuario no existe en la DB, inicializamos su contador
        if (!db[target.id]) db[target.id] = { hugs: 0 };
        db[target.id].hugs += 1;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        const totalHugs = db[target.id].hugs;

        // --- CREACIÓN DEL EMBED ---
        const hugEmbed = new EmbedBuilder()
            .setColor('#ffafcc')
            .setDescription(`**${message.author.username}** abraza a **${target.username}**.\n*${target.username} ha recibido ${totalHugs} abrazos.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA ABRAZAR DE VUELTA ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('return_hug')
                .setLabel('Abrazar de vuelta 🤗')
                .setStyle(ButtonStyle.Secondary)
        );

        const response = await message.channel.send({
            embeds: [hugEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 // El botón dura 30 segundos
        });

        collector.on('collect', async (i) => {
            // Solo la persona abrazada puede usar el botón
            if (i.user.id !== target.id) {
                return i.reply({ content: '¡Solo la persona abrazada puede devolver el abrazo!', ephemeral: true });
            }

            // Actualizamos la cuenta para quien inició el comando originalmente
            if (!db[message.author.id]) db[message.author.id] = { hugs: 0 };
            db[message.author.id].hugs += 1;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const newTotal = db[message.author.id].hugs;
            const newRandom = hugData[Math.floor(Math.random() * hugData.length)];

            const returnEmbed = new EmbedBuilder()
                .setColor('#ffafcc')
                .setDescription(`**${target.username}** le devolvió el abrazo a **${message.author.username}**.\n*${message.author.username} ha recibido ${newTotal} abrazos.*`)
                .setImage(newRandom.gif)
                .setFooter({ text: `Anime: ${newRandom.anime}` });

            // Respondemos y quitamos el botón para evitar spam
            await i.update({ components: [] });
            await i.followUp({ embeds: [returnEmbed] });
        });

        collector.on('end', () => {
            // Deshabilitar botón al terminar el tiempo
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('return_hug')
                    .setLabel('Tiempo agotado')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};