module.exports = {
    name: 'nuke',
    description: 'Elimina el canal actual y crea una copia vacía',
    async execute(message, args) {
        // 1. Verificación de seguridad: Solo el Dueño
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Solo el **Dueño del Servidor** puede ejecutar este comando.');
        }

        // 2. Verificación de permisos del bot
        if (!message.guild.members.me.permissions.has('ManageChannels')) {
            return message.reply('❌ No tengo permiso para **Gestionar Canales**. ¡No puedo purgar nada!');
        }

        try {
            // Guardamos la información necesaria antes de borrar
            const { name, parent, position, topic, nsfw, rateLimitPerUser, permissionOverwrites } = message.channel;

            // Enviamos un mensaje de aviso
            await message.channel.send('💣 **Purga iniciada...** Adiós a los mensajes.');

            // Clonamos el canal con TODA su configuración original (permisos, cámara lenta, etc.)
            const nuevoCanal = await message.guild.channels.create({
                name: name,
                type: message.channel.type,
                parent: parent,
                position: position,
                topic: topic,
                nsfw: nsfw,
                rateLimitPerUser: rateLimitPerUser,
                permissionOverwrites: permissionOverwrites.cache
            });

            // Borramos el canal antiguo
            await message.channel.delete();

            // Enviamos el mensaje de confirmación en el nuevo canal
            await nuevoCanal.send(`✨ **Canal Purgado exitosamente.**\nLimpieza realizada por el Dueño: <@${message.guild.ownerId}>`);

        } catch (error) {
            console.error('Error en Purge:', error);
            // Si el canal ya fue borrado, esto fallará, así que usamos un try-catch silencioso
            message.author.send('❌ Hubo un fallo al intentar purgar el canal. Revisa mi consola.').catch(() => {});
        }
    },
};