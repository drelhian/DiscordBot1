const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ms = require('ms');

module.exports = {
    name: 'warn',
    description: 'Advierte a un usuario y aplica sanciones automáticas',
    async execute(message, args) {
        if (!message.member.permissions.has('ManageMessages')) return message.reply('❌ No tienes permiso.');

        const member = message.mentions.members.first();
        if (!member) return message.reply('⚠️ Menciona a alguien.');
        if (member.id === message.author.id) return message.reply('❌ No puedes advertirte a ti mismo.');
        if (member.permissions.has('Administrator')) return message.reply('❌ No puedes advertir administradores.');

        const razon = args.slice(1).join(' ') || 'No especificada';
        const warnPath = path.join(__dirname, '../../advertencias.json');
        const configPath = path.join(__dirname, '../../config.json');

        if (!fs.existsSync(warnPath)) fs.writeFileSync(warnPath, JSON.stringify({}));
        let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

        if (!db[member.id]) db[member.id] = { warns: 0, historial: [] };

        db[member.id].warns += 1;
        const totalWarns = db[member.id].warns;
        db[member.id].historial.push({ tipo: 'WARN', razon, fecha: new Date().toLocaleDateString(), moderador: message.author.tag });

        let castigoMsg = '';

        // LÓGICA DE CASTIGOS
        if (totalWarns === 4) {
            await member.timeout(ms('4m'), '4 warns');
            castigoMsg = '\n➡️ **Castigo:** Timeout 4m.';
        } else if (totalWarns === 5) {
            // ASIGNAR ROL SANCIONADO (BLACKLIST GIVEAWAYS)
            let sancionadoRole = message.guild.roles.cache.find(r => r.name === 'Sancionado');
            if (!sancionadoRole) {
                sancionadoRole = await message.guild.roles.create({
                    name: 'Sancionado',
                    color: '#34495e',
                    reason: 'Blacklist automática de sorteos por 5 warns'
                });
            }
            await member.roles.add(sancionadoRole);
            castigoMsg = '\n➡️ **Castigo:** Rol "Sancionado" asignado (Blacklist de Sorteos).';
        } else if (totalWarns === 8) {
            await member.timeout(ms('10d'), '8 warns');
            castigoMsg = '\n➡️ **Castigo:** Timeout 10 días.';
        } else if (totalWarns >= 10) {
            await member.ban({ reason: '10 warns' });
            castigoMsg = '\n➡️ **Castigo:** Baneo del servidor.';
            delete db[member.id];
        }

        fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

        // LOGS
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            const logChannel = message.guild.channels.cache.get(config[message.guild.id]?.logMod);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Registro de Advertencia')
                    .setColor('#f1c40f')
                    .addFields(
                        { name: 'Usuario', value: `${member.user.tag}`, inline: true },
                        { name: 'Total', value: `${totalWarns}/10`, inline: true },
                        { name: 'Razón', value: razon }
                    );
                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (e) {}

        message.channel.send(`⚠️ **${member.user.tag}** advertido (${totalWarns}/10).${castigoMsg}`);
    },
};