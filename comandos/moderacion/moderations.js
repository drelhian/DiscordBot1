const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'moderations',
    description: 'Muestra el expediente completo de un usuario',
    async execute(message, args) {
        // 1. Verificación de permisos (Staff)
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ No tienes permiso para auditar historiales.');
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.reply('⚠️ Menciona a un usuario o proporciona su ID.');

        const warnPath = path.join(__dirname, '../../advertencias.json');
        
        if (!fs.existsSync(warnPath)) return message.reply('📂 Aún no hay registros de moderación.');

        const db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));
        const userStats = db[member.id];

        // 2. Verificar si el usuario tiene registros
        if (!userStats || (userStats.warns === 0 && (!userStats.historial || userStats.historial.length === 0))) {
            return message.reply(`✅ **${member.user.tag}** tiene un expediente limpio.`);
        }

        // 3. Crear el Embed con el historial
        const embed = new EmbedBuilder()
            .setTitle(`🛡️ Expediente de Moderación: ${member.user.tag}`)
            .setColor(userStats.warns >= 7 ? '#FF0000' : '#F1C40F') // Rojo si tiene muchos warns, amarillo si pocos
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '📊 Advertencias Activas', value: `**${userStats.warns}/10**`, inline: true },
                { name: '🆔 User ID', value: `\`${member.id}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Consultado por ${message.author.tag}` });

        // Mapear el historial detallado
        if (userStats.historial && userStats.historial.length > 0) {
            const listaSanciones = userStats.historial.map((sancion, index) => {
                const icono = {
                    'WARN': '⚠️',
                    'MUTE': '🤫',
                    'KICK': '👢',
                    'BAN': '🔨',
                    'MUTE (AUTO)': '🤖'
                }[sancion.tipo] || '📝';

                return `**${index + 1}. ${icono} [${sancion.tipo}]**\n📅 *${sancion.fecha}* — Mod: **${sancion.moderador}**\n└ Razón: \`${sancion.razon}\``;
            }).join('\n\n');

            // Discord tiene un límite de 4096 caracteres, cortamos si es necesario
            embed.setDescription(listaSanciones.length > 3500 ? listaSanciones.substring(0, 3500) + '...' : listaSanciones);
        } else {
            embed.setDescription('El usuario tiene advertencias antiguas pero no hay detalles en el nuevo historial.');
        }

        message.reply({ embeds: [embed] });
    },
};