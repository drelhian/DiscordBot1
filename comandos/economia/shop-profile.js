const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shop-profile',
    aliases: ['sp', 'mi-perfil'],
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        const salPath = path.join(__dirname, '../../salarios.json');
        const target = message.mentions.users.first() || message.author;

        const ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};
        const salData = fs.existsSync(salPath) ? JSON.parse(fs.readFileSync(salPath, 'utf-8')) : {};

        const userEco = ecoData[message.guild.id]?.[target.id] || { coins: 0, banco: 0 };
        const guildSals = salData[message.guild.id] || {};

        let trabajos = [];
        let totalPasivo = 0;

        // Verificar qué roles de salario tiene el usuario
        const member = await message.guild.members.fetch(target.id);
        for (const [id, info] of Object.entries(guildSals)) {
            if (member.roles.cache.has(id)) {
                trabajos.push(`💼 **${info.nombre}**: \`${info.puntos}\` coins / ${info.tiempoTexto}`);
                totalPasivo += info.puntos;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`💳 Perfil Económico: ${target.username}`)
            .setThumbnail(target.displayAvatarURL())
            .setColor('#5865F2')
            .addFields(
                { name: '💰 Riqueza', value: `💵 Cartera: \`${userEco.coins}\`\n🏦 Banco: \`${userEco.banco}\`\n📈 Total: \`${userEco.coins + userEco.banco}\``, inline: true },
                { name: '📊 Producción', value: `✨ Total Pasivo: \`${totalPasivo}\` coins\n📅 Racha Daily: \`${userEco.dailyStreak || 0}\` días`, inline: true },
                { name: '🛠️ Trabajos Activos', value: trabajos.length > 0 ? trabajos.join('\n') : "No tienes roles de trabajo activos." }
            )
            .setFooter({ text: 'Usa D!claimall para cobrar tus sueldos' });

        message.channel.send({ embeds: [embed] });
    }
};