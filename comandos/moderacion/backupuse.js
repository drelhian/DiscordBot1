const { PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'backupuse',
    description: 'Carga un backup exacto y reconstruye el servidor',
    async execute(message, args) {
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Solo el dueño del servidor puede ejecutar restauraciones.');
        }

        const num = parseInt(args[0]);
        if (!num) return message.reply('⚠️ Indica la ID del backup. Ejemplo: `D!backupuse 1`');

        const backupPath = path.join(__dirname, '../../backups', `${message.author.id}.json`);
        if (!fs.existsSync(backupPath)) return message.reply('❌ No tienes backups guardados.');

        const userBackups = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
        const backup = userBackups.find(b => b.id === num);
        if (!backup) return message.reply('❌ Backup no encontrado.');

        const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'confirmar';
        message.reply(`⚠️ **¡CUIDADO!** Vas a cargar **${backup.serverName}**. Esto eliminará TODOS los canales y roles actuales. Escribe \`confirmar\` para proceder (15 seg).`);

        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async () => {
            try {
                // 1. Crear canal temporal para no perder la conexión
                const tempChannel = await message.guild.channels.create({ 
                    name: '🔨-reconstruyendo', 
                    type: ChannelType.GuildText 
                });

                // 2. LIMPIEZA TOTAL
                // Borrar canales
                const allChannels = Array.from(message.guild.channels.cache.values());
                for (const ch of allChannels) {
                    if (ch.id !== tempChannel.id) await ch.delete().catch(() => {});
                }

                // Borrar roles (excepto el del bot y @everyone)
                const allRoles = Array.from(message.guild.roles.cache.values());
                for (const role of allRoles) {
                    await role.delete().catch(() => {});
                }

                // 3. RECREAR ROLES Y GUARDAR MAPEO
                const roleMap = new Map();
                for (const rData of backup.roles) {
                    const newRole = await message.guild.roles.create({
                        name: rData.name,
                        color: rData.color,
                        hoist: rData.hoist,
                        permissions: BigInt(rData.permissions),
                        mentionable: rData.mentionable
                    }).catch(() => {});
                    
                    if (newRole) roleMap.set(rData.name, newRole.id);
                }

                // Función para convertir nombres de roles a IDs nuevas
                const parsePermissions = (perms) => {
                    return perms.map(p => ({
                        id: roleMap.get(p.roleName) || message.guild.id, // Si no se halla el rol, se aplica a @everyone
                        allow: BigInt(p.allow),
                        deny: BigInt(p.deny)
                    }));
                };

                // 4. RECREAR CATEGORÍAS Y CANALES
                for (const catData of backup.categories) {
                    const category = await message.guild.channels.create({
                        name: catData.name,
                        type: ChannelType.GuildCategory,
                        permissionOverwrites: parsePermissions(catData.permissions)
                    });

                    for (const chData of catData.channels) {
                        await message.guild.channels.create({
                            name: chData.name,
                            type: chData.type,
                            parent: category.id,
                            topic: chData.topic,
                            nsfw: chData.nsfw,
                            userLimit: chData.userLimit,
                            bitrate: chData.bitrate,
                            permissionOverwrites: parsePermissions(chData.permissions)
                        }).catch(() => {});
                    }
                }

                // 5. CANALES HUÉRFANOS
                for (const orphan of backup.orphans) {
                    await message.guild.channels.create({
                        name: orphan.name,
                        type: orphan.type,
                        permissionOverwrites: parsePermissions(orphan.permissions)
                    }).catch(() => {});
                }

                await tempChannel.send('✅ **Servidor reconstruido con éxito.** Los permisos han sido vinculados a los nuevos roles.');
                setTimeout(() => tempChannel.delete().catch(() => {}), 10000);

            } catch (error) {
                console.error('Error en backupuse:', error);
                message.author.send('❌ Ocurrió un error grave durante la restauración. Revisa la consola del bot.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') message.reply('⌛ Tiempo agotado. Operación de backup cancelada.');
        });
    }
};