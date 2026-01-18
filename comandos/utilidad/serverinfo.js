const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Muestra información detallada sobre el servidor.',
    async execute(message, args) {
        const { guild } = message;

        // 1. Obtener conteos detallados
        const miembrosTotales = guild.memberCount;
        const humanos = guild.members.cache.filter(m => !m.user.bot).size;
        const bots = miembrosTotales - humanos;
        
        const canalesTexto = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const canalesVoz = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categorias = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        const rolesContador = guild.roles.cache.size - 1; // Excluimos @everyone
        const emojisContador = guild.emojis.cache.size;

        // 2. Obtener el dueño (owner)
        const owner = await guild.fetchOwner();

        // 3. Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle(`🏰 Información de ${guild.name}`)
            .setColor('#2b2d31')
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: '👑 Dueño', value: `${owner.user.tag}`, inline: true },
                { name: '🆔 ID del Servidor', value: guild.id, inline: true },
                { name: '📅 Creado el', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                
                { name: '👥 Miembros', value: `**Total:** ${miembrosTotales}\n👤 **Humanos:** ${humanos}\n🤖 **Bots:** ${bots}`, inline: true },
                { name: '💬 Canales', value: `📂 **Categorías:** ${categorias}\n📝 **Texto:** ${canalesTexto}\n🔊 **Voz:** ${canalesVoz}`, inline: true },
                { name: '✨ Otros', value: `🎭 **Roles:** ${rolesContador}\n😀 **Emojis:** ${emojisContador}`, inline: true }
            )
            .setFooter({ text: `Solicitado por ${message.author.username}` })
            .setTimestamp();

        // Si el servidor tiene banner, lo añadimos
        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 1024 }));
        }

        return message.reply({ embeds: [embed] });
    },
};