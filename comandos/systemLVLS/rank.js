const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'rank',
    description: 'Muestra tu nivel, mensajes y progreso de XP si el canal está configurado',
    async execute(message, args) {
        const configPath = path.join(__dirname, '../../config.json');
        const nivelesPath = path.join(__dirname, '../../niveles.json');

        // 1. VERIFICAR SI EL CANAL DE RANKS HA SIDO CONFIGURADO
        if (!fs.existsSync(configPath)) {
            return message.reply("❌ El canal aún no se ha especificado para ranks.");
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const rankChannelId = config[message.guild.id]?.rankChannel;

        if (!rankChannelId) {
            return message.reply("❌ El canal aún no se ha especificado para ranks. Usa `D!setchannelrank #canal` primero.");
        }

        // 2. VERIFICAR SI EXISTE EL ARCHIVO DE NIVELES
        if (!fs.existsSync(nivelesPath)) {
            return message.reply("⚠️ Aún no hay datos de niveles registrados en este servidor.");
        }

        const niveles = JSON.parse(fs.readFileSync(nivelesPath, 'utf-8'));
        const guildData = niveles[message.guild.id];

        // 3. BUSCAR AL USUARIO (MENTION O AUTOR)
        const target = message.mentions.users.first() || message.author;
        const userData = guildData ? guildData[target.id] : null;

        // Si el usuario no tiene datos aún (pero el sistema está activo)
        if (!userData) {
            return message.reply(`📊 **${target.username}** aún no tiene actividad registrada en el canal de niveles.`);
        }

        // 4. CÁLCULOS Y BARRA DE PROGRESO
        const xpNecesaria = (userData.nivel * 500) + 500;
        const porcentaje = Math.floor((userData.xp / xpNecesaria) * 10);
        const barraProgreso = "🟦".repeat(porcentaje) + "⬛".repeat(10 - porcentaje);

        // 5. CREAR Y ENVIAR EL EMBED
        const embed = new EmbedBuilder()
            .setTitle(`Estadísticas de ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setColor('#2ecc71')
            .addFields(
                { name: '📈 Nivel', value: `**${userData.nivel}**`, inline: true },
                { name: '✉️ Mensajes', value: `**${userData.mensajes}**`, inline: true },
                { name: '✨ XP Total', value: `**${userData.xp}** / ${xpNecesaria}`, inline: true },
                { name: `Progreso para Nivel ${userData.nivel + 1}`, value: `${barraProgreso} \`${Math.floor((userData.xp / xpNecesaria) * 100)}%\`` }
            )
            .setFooter({ text: 'Solo ganas XP en el canal configurado' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};