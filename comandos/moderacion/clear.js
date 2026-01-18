module.exports = {
    name: 'clear',
    description: 'Borra mensajes específicos o todo el canal',
    async execute(message, args) {
        // 1. Verificar permisos
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ No tienes permiso para gestionar mensajes.');
        }

        // Caso: D!clear all
        if (args[0]?.toLowerCase() === 'all') {
            message.channel.send('⏳ Iniciando limpieza total... (Esto puede tardar un poco)').then(msg => {
                setTimeout(() => msg.delete(), 3000);
            });

            let totalBorrados = 0;
            let continuar = true;

            while (continuar) {
                // Buscamos los mensajes y los borramos de 100 en 100
                const borrados = await message.channel.bulkDelete(100, true).catch(err => {
                    continuar = false; 
                    return null;
                });

                if (!borrados || borrados.size === 0) {
                    continuar = false;
                } else {
                    totalBorrados += borrados.size;
                }
            }

            return message.channel.send(`🧹 Limpieza completada. Se borraron **${totalBorrados}** mensajes recientes (menos de 14 días).`)
                .then(m => setTimeout(() => m.delete(), 5000));
        }

        // Caso: D!clear [número]
        const cantidad = parseInt(args[0]);

        if (isNaN(cantidad) || cantidad <= 0 || cantidad > 100) {
            return message.reply('⚠️ Indica un número del 1 al 100 o usa `D!clear all`.');
        }

        try {
            // Borramos la cantidad + el mensaje del comando
            const mensajes = await message.channel.bulkDelete(cantidad + 1, true);
            
            message.channel.send(`✅ Se han borrado **${mensajes.size - 1}** mensajes.`)
                .then(msg => setTimeout(() => msg.delete(), 5000));
        } catch (err) {
            message.reply('❌ Hubo un error. Recuerda que no puedo borrar mensajes de más de 14 días.');
        }
    },
};