const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'caraocruz',
    description: 'Lanza una moneda y prueba tu suerte con prefijos',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🪙 Cara o Cruz')
            .setDescription('Elige un bando para lanzar la moneda:')
            .setColor('#f1c40f');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('cara')
                .setLabel('Cara')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👤'),
            new ButtonBuilder()
                .setCustomId('cruz')
                .setLabel('Cruz')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌')
        );

        // Usamos message.reply en lugar de interaction.reply
        const response = await message.reply({
            embeds: [embed],
            components: [row]
        });

        // El filtro ahora usa message.author.id
        const filter = (i) => i.user.id === message.author.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter, time: 30000 });

            const eleccionUsuario = confirmation.customId;
            const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
            const victoria = eleccionUsuario === resultado;

            const resultadoEmbed = new EmbedBuilder()
                .setTitle(victoria ? '🎉 ¡Ganaste!' : '❌ ¡Perdiste!')
                .setDescription(`Lanzaste la moneda y salió: **${resultado.toUpperCase()}**\nTu elección fue: **${eleccionUsuario.toUpperCase()}**`)
                .setThumbnail(resultado === 'cara' 
                    ? 'https://i.imgur.com/v8Fk9Tj.png' 
                    : 'https://i.imgur.com/XFm6f6S.png'
                )
                .setColor(victoria ? '#2ecc71' : '#e74c3c');

            // Actualizamos la interacción del botón
            await confirmation.update({ embeds: [resultadoEmbed], components: [] });

        } catch (e) {
            // Si el tiempo se agota, editamos el mensaje original del bot
            await response.edit({ content: '⌛ Se acabó el tiempo, no elegiste nada.', embeds: [], components: [] });
        }
    },
};