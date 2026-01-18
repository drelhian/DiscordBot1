const { PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'backupcreate',
    description: 'Crea una copia exacta del servidor (Roles, Categorías y Canales)',
    async execute(message, args) {
        // 1. Verificación de Seguridad: Solo el Dueño del Servidor
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Solo el dueño del servidor puede crear copias de seguridad.');
        }

        const ownerId = message.author.id;
        const backupDir = path.join(__dirname, '../../backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        const backupPath = path.join(backupDir, `${ownerId}.json`);

        // 2. Cargar backups existentes
        let userBackups = [];
        if (fs.existsSync(backupPath)) {
            try {
                userBackups = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
            } catch (e) { userBackups = []; }
        }
        
        if (userBackups.length >= 4) return message.reply('⚠️ Límite de 4 backups alcanzado. Elimina uno para continuar.');

        const msgStatus = await message.reply('⚙️ Procesando servidor... (Esto puede tardar unos segundos)');

        try {
            // 3. OBTENER ROLES (Mapeando permisos y propiedades)
            // Filtramos @everyone para tratarlo aparte y quitamos roles de bots
            const roles = message.guild.roles.cache
                .filter(r => r.name !== '@everyone' && !r.managed)
                .sort((a, b) => b.position - a.position)
                .map(r => ({
                    name: r.name,
                    color: r.color,
                    hoist: r.hoist,
                    permissions: r.permissions.bitfield.toString(),
                    mentionable: r.mentionable,
                    position: r.position
                }));

            // 4. FUNCIÓN PARA MAPEAR PERMISOS DE CANAL
            // Importante: Guardamos el nombre del rol en lugar de la ID para que sea funcional al restaurar
            const getPermissions = (channel) => {
                return channel.permissionOverwrites.cache.map(p => {
                    const role = message.guild.roles.cache.get(p.id);
                    return {
                        roleName: role ? role.name : null, // Si es null, es un permiso de usuario específico (se suele ignorar)
                        allow: p.allow.bitfield.toString(),
                        deny: p.deny.bitfield.toString()
                    };
                }).filter(p => p.roleName !== null);
            };

            // 5. OBTENER ESTRUCTURA COMPLETA (Categorías -> Canales)
            const categories = message.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildCategory)
                .sort((a, b) => a.position - b.position)
                .map(cat => ({
                    name: cat.name,
                    permissions: getPermissions(cat),
                    channels: message.guild.channels.cache
                        .filter(c => c.parentId === cat.id)
                        .sort((a, b) => a.position - b.position)
                        .map(c => ({
                            name: c.name,
                            type: c.type, // Identifica si es Texto (0) o Voz (2)
                            topic: c.topic || null,
                            nsfw: c.nsfw || false,
                            userLimit: c.userLimit || 0, // Para canales de voz
                            bitrate: c.bitrate || 64000, // Para canales de voz
                            permissions: getPermissions(c)
                        }))
                }));

            // 6. CANALES SIN CATEGORÍA (Huérfanos)
            const orphans = message.guild.channels.cache
                .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory)
                .map(c => ({
                    name: c.name,
                    type: c.type,
                    topic: c.topic || null,
                    permissions: getPermissions(c)
                }));

            // 7. OBJETO FINAL DE BACKUP
            const backupData = {
                id: Date.now(), // Usamos timestamp como ID única
                serverName: message.guild.name,
                createdTimestamp: Date.now(),
                date: new Date().toLocaleString(),
                roles: roles,
                categories: categories,
                orphans: orphans,
                afkChannel: message.guild.afkChannel ? message.guild.afkChannel.name : null,
                systemChannel: message.guild.systemChannel ? message.guild.systemChannel.name : null
            };

            userBackups.push(backupData);
            fs.writeFileSync(backupPath, JSON.stringify(userBackups, null, 2));

            msgStatus.edit(`✅ **¡Backup Creado!**\n**ID:** \`${backupData.id}\`\n**Nombre:** ${backupData.serverName}\nSe han guardado ${roles.length} roles y ${categories.length} categorías.`);

        } catch (error) {
            console.error(error);
            msgStatus.edit('❌ Hubo un error crítico al procesar el backup. Revisa la consola.');
        }
    }
};