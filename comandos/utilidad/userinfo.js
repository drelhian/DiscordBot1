const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Muestra información detallada de un usuario.',
    async execute(message, args) {
        // Buscamos al miembro en el servidor (para tener acceso a sus roles y fecha de ingreso)
        const member = message.mentions.members.first() || 
                       message.guild.members.cache.get(args[0]) || 
                       message.member;

        const { user } = member;

        // Formatear los roles (excluyendo @everyone)
        const roles = member.roles.cache
            .filter(r => r.id !== message.guild.id)
            .map(r => r.toString())
            .join(', ') || 'Ninguno';

        const embed = new EmbedBuilder()
            .setTitle(`Información de ${user.username}`)
            .setColor('#2b2d31')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '🏷️ Apodo', value: member.nickname || 'Ninguno', inline: true },
                { name: '🤖 ¿Es Bot?', value: user.bot ? 'Sí' : 'No', inline: true },
                { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Ingreso al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: `🎭 Roles (${member.roles.cache.size - 1})`, value: roles }
            )
            .setFooter({ text: `Consultado por ${message.author.username}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};