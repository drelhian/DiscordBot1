const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'kill',
    description: 'Elimina dramáticamente a un usuario.',
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('🔪 ¡Debes mencionar a alguien para eliminarlo del mapa!');
        if (target.id === message.author.id) return message.reply('¿Auto-eliminación? No en mi guardia. ✋');

        // --- BASE DE DATOS DE GIFS DE MUERTE (ESTILO ANIME/MEME) ---
        const killData = [
            { gif: 'https://media.tenor.com/E39n1_S_7_6kAAAAC/anime-kill.gif', anime: 'Akame ga Kill!' },
            { gif: 'https://media.tenor.com/XiYuU9_vS70AAAAC/anime-shot.gif', anime: 'Lycoris Recoil' },
            { gif: 'https://media.tenor.com/PeE4_Yv_4MAAAAC/anime-death.gif', anime: 'Sword Art Online' },
            { gif: 'https://media.tenor.com/yJ666Y6_8S0AAAAC/anime-kill-gun.gif', anime: 'Assassination Classroom' }
        ];

        const randomSelection = killData[Math.floor(Math.random() * killData.length)];

        // --- CREACIÓN DEL EMBED ---
        const killEmbed = new EmbedBuilder()
            .setColor('#2b2d31') // Color oscuro/negro
            .setDescription(`💀 **${message.author.username}** ha eliminado a **${target.username}**.\n*Descanse en paz.*`)
            .setImage(randomSelection.gif)
            .setFooter({ text: `Anime: ${randomSelection.anime}` });

        // --- BOTÓN PARA REVIVIR ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('revive_button')
                .setLabel('Usar Tótem de Revivir 🛡️')
                .setStyle(ButtonStyle.Success)
        );

        const response = await message.channel.send({
            embeds: [killEmbed],
            components: [row]
        });

        // --- COLECTOR PARA EL BOTÓN ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 20000 // 20 segundos para revivir
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== target.id) {
                return i.reply({ content: '❌ No puedes usar el tótem de otra persona.', ephemeral: true });
            }

            const reviveEmbed = new EmbedBuilder()
                .setColor('#57f287') // Verde vida
                .setDescription(`✨ **${target.username}** ha usado un tótem y ha revivido.\n¡La venganza es dulce, **${message.author.username}**!`)
                .setImage('https://media.tenor.com/MMm9X_Osh_0AAAAC/anime-revive.gif')
                .setFooter({ text: 'Sistema de Resurrección LXT' });

            await i.update({ components: [] });
            await i.followUp({ embeds: [reviveEmbed] });
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('revive_button')
                        .setLabel('Se quedó tieso ⚰️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
                response.edit({ components: [disabledRow] }).catch(() => {});
            }
        });
    },
};