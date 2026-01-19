const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Muestra el avatar de un usuario o el tuyo propio.',
    async execute(message, args) {
        // 1. Obtener el objetivo (el mencionado, el ID o el autor)
        const target = message.mentions.users.first() || 
                       message.client.users.cache.get(args[0]) || 
                       message.author;

        // 2. Obtener las URLs en diferentes formatos
        const pngUrl = target.displayAvatarURL({ extension: 'png', size: 1024 });
        const jpgUrl = target.displayAvatarURL({ extension: 'jpg', size: 1024 });
        const webpUrl = target.displayAvatarURL({ extension: 'webp', size: 1024 });
        const dynamicUrl = target.displayAvatarURL({ dynamic: true, size: 1024 });

        // 3. Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${target.username}`)
            .setColor('#2b2d31')
            .setImage(dynamicUrl)
            .setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        // 4. Crear botones de descarga
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('PNG')
                .setStyle(ButtonStyle.Link)
                .setURL(pngUrl),
            new ButtonBuilder()
                .setLabel('JPG')
                .setStyle(ButtonStyle.Link)
                .setURL(jpgUrl),
            new ButtonBuilder()
                .setLabel('WebP')
                .setStyle(ButtonStyle.Link)
                .setURL(webpUrl)
        );

        return message.reply({ embeds: [embed], components: [row] });
    },
};