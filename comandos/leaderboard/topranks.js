const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'topranks',
    description: 'Muestra el Top 10 de usuarios con más nivel en el servidor',
    async execute(message, args) {
        const nivelesPath = path.join(__dirname, '../../niveles.json');
        const configPath = path.join(__dirname, '../../config.json');

        // 1. Verificación de configuración
        if (!fs.existsSync(configPath)) {
            return message.reply("❌ El sistema de niveles no ha sido configurado.");
        }

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (!config[message.guild.id]?.rankChannel) {
            return message.reply("❌ El canal de ranks no está especificado. Usa `D!setupranks`.");
        }

        // 2. Verificación de datos
        if (!fs.existsSync(nivelesPath)) {
            return message.reply("⚠️ No hay datos de niveles todavía.");
        }

        const niveles = JSON.parse(fs.readFileSync(nivelesPath, 'utf-8'));
        const guildData = niveles[message.guild.id];

        if (!guildData || Object.keys(guildData).length === 0) {
            return message.reply("⚠️ Aún no hay usuarios registrados en el ranking.");
        }

        // 3. Ordenar usuarios
        // Convertimos el objeto en un array para poder ordenarlo
        const sorted = Object.entries(guildData)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => {
                if (a.nivel !== b.nivel) {
                    return b.nivel - a.nivel; // Primero por nivel
                }
                return b.xp - a.xp; // Si empatan nivel, por XP
            })
            .slice(0, 10); // Solo los 10 mejores

        // 4. Construir la lista de texto
        let description = "";
        for (let i = 0; i < sorted.length; i++) {
            const user = await message.client.users.fetch(sorted[i].id).catch(() => null);
            const tag = user ? user.username : "Usuario Desconocido";
            
            // Medallas para los 3 primeros
            let medalla = "";
            if (i === 0) medalla = "🥇";
            else if (i === 1) medalla = "🥈";
            else if (i === 2) medalla = "🥉";
            else medalla = `**#${i + 1}**`;

            description += `${medalla} | **${tag}** - Nivel: \`${sorted[i].nivel}\` (Msg: \`${sorted[i].mensajes}\`)\n`;
        }

        // 5. Enviar el Embed
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Ranking de Niveles - ${message.guild.name}`)
            .setColor('#f1c40f') // Color Dorado
            .setDescription(description || "No hay datos suficientes.")
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `Canal exclusivo: #${message.guild.channels.cache.get(config[message.guild.id].rankChannel)?.name}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};