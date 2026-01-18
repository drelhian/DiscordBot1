const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'confess',
    description: 'Envía una confesión anónima al canal de confesiones.',
    async execute(message, args) {
        // 1. Obtener la confesión
        const confesion = args.join(' ');
        if (!confesion) return message.reply('🤫 Shhh... ¡Debes escribir algo para confesar!');

        // Borramos el mensaje del autor para mantener el anonimato total
        await message.delete().catch(() => {});

        // 2. Buscar o crear el canal de confesiones
        let canalConfesiones = message.guild.channels.cache.find(c => c.name === 'confesiones');

        if (!canalConfesiones) {
            try {
                canalConfesiones = await message.guild.channels.create({
                    name: 'confesiones',
                    type: ChannelType.GuildText,
                    topic: 'Canal de confesiones anónimas | LXT Bot',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionFlagsBits.SendMessages], // Los usuarios no pueden escribir manual
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
                        },
                        {
                            id: message.client.user.id,
                            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]
                        }
                    ]
                });
                message.channel.send('✅ Canal `#confesiones` creado automáticamente. Enviando tu mensaje...');
            } catch (error) {
                return message.author.send('❌ No pude crear el canal de confesiones. Asegúrate de que tengo permisos de Administrador.').catch(() => {});
            }
        }

        // 3. Crear el Embed de la confesión
        const embed = new EmbedBuilder()
            .setTitle('🤫 Nueva Confesión Anónima')
            .setColor('#9b59b6') // Morado misterioso
            .setDescription(`"${confesion}"`)
            .setThumbnail('https://w7.pngwing.com/pngs/339/149/png-transparent-incognito-hd-logo-thumbnail.png')
            .setFooter({ text: 'Alguien se ha confesado...' })
            .setTimestamp();

        // 4. Enviar al canal
        await canalConfesiones.send({ embeds: [embed] });

        // Avisar al autor por DM (opcional, para confirmar envío)
        return message.author.send('✅ Tu confesión ha sido enviada de forma anónima.').catch(() => {});
    },
};