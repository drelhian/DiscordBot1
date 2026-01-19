const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'backuplist',
    description: 'Muestra la lista de tus backups guardados',
    async execute(message, args) {
        // 1. Verificación de Seguridad
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Solo el **Dueño del Servidor** puede ver la lista de copias de seguridad.');
        }

        const ownerId = message.author.id;
        const backupPath = path.join(__dirname, '../../backups', `${ownerId}.json`);

        // 2. Verificar existencia del archivo
        if (!fs.existsSync(backupPath)) {
            return message.reply('📂 No tienes ningún backup guardado todavía.');
        }

        try {
            const data = fs.readFileSync(backupPath, 'utf-8');
            const userBackups = data ? JSON.parse(data) : [];

            if (userBackups.length === 0) {
                return message.reply('📂 Tu lista de backups está vacía.');
            }

            // 3. Crear el Embed
            const embed = new EmbedBuilder()
                .setTitle('🗄️ Tus Backups Guardados')
                .setColor('#5865F2')
                .setDescription(`Tienes **${userBackups.length}/4** espacios ocupados.`)
                .setThumbnail(message.guild.iconURL())
                .setFooter({ text: 'Usa D!backupload [ID] para restaurar una copia.' })
                .setTimestamp();

            // 4. Listar cada backup procesando la nueva estructura
            userBackups.forEach((backup) => {
                // Calculamos el total de canales sumando los de cada categoría + los huérfanos
                const totalCanales = backup.categories.reduce((acc, cat) => acc + cat.channels.length, 0) + (backup.orphans?.length || 0);

                embed.addFields({
                    name: `🆔 ID: ${backup.id} | 🏰 ${backup.serverName}`,
                    value: `📅 **Fecha:** \`${backup.date}\`\n` +
                           `🎭 **Roles:** \`${backup.roles.length}\`\n` +
                           `📺 **Canales Totales:** \`${totalCanales}\`\n` +
                           `📂 **Categorías:** \`${backup.categories.length}\`\n` +
                           `━━━━━━━━━━━━━━━━━━━━`
                });
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en backuplist:', error);
            message.reply('❌ Hubo un error al leer la lista de backups. Asegúrate de que los archivos JSON tengan el formato correcto.');
        }
    },
};