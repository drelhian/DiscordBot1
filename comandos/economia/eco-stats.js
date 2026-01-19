const { EmbedBuilder } = require('discord.js');
const fs = require('fs'); // <--- Faltaba esto
const path = require('path'); // <--- Faltaba esto

module.exports = {
    name: 'eco-stats',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        const ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'))[message.guild.id] || {};

        const usuarios = Object.values(ecoData);
        const totalMonedas = usuarios.reduce((a, b) => a + (b.coins || 0) + (b.banco || 0), 0);
        const promedio = usuarios.length > 0 ? Math.floor(totalMonedas / usuarios.length) : 0;

        const embed = new EmbedBuilder()
            .setTitle(`📊 Estadísticas: ${message.guild.name}`)
            .setColor('#e67e22')
            .addFields(
                { name: '👥 Usuarios en Sistema', value: `\`${usuarios.length}\``, inline: true },
                { name: '💰 Dinero Total Circulante', value: `\`${totalMonedas.toLocaleString()}\` coins`, inline: true },
                { name: '⚖️ Promedio por Usuario', value: `\`${promedio.toLocaleString()}\` coins`, inline: true }
            );

        message.channel.send({ embeds: [embed] });
    }
};