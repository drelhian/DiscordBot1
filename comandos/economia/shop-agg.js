const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'claimall',
    async execute(message, args) {
        const salariesPath = path.join(__dirname, '../../salarios.json');
        const ecoPath = path.join(__dirname, '../../economia.json');

        if (!fs.existsSync(salariesPath)) return message.reply('❌ No hay salarios configurados.');

        let salariesData = JSON.parse(fs.readFileSync(salariesPath, 'utf-8'));
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        const guildSalaries = salariesData[message.guild.id];
        if (!guildSalaries) return message.reply('❌ No hay salarios en este servidor.');

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = { coins: 0, banco: 0, claimsEspeciales: {} };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        if (!userData.claimsEspeciales) userData.claimsEspeciales = {}; // Por si no existía el campo

        const ahora = Date.now();
        let totalReclamado = 0;
        let rolesReclamados = [];
        let rolesEnEspera = [];

        for (const [rolID, info] of Object.entries(guildSalaries)) {
            if (message.member.roles.cache.has(rolID)) {
                const ultimoReclamo = userData.claimsEspeciales[rolID] || 0;
                
                if (ahora - ultimoReclamo >= info.cooldownMS) {
                    totalReclamado += info.puntos;
                    rolesReclamados.push(`${info.nombre} (+$${info.puntos})`);
                    userData.claimsEspeciales[rolID] = ahora; // Actualizar tiempo de este rol
                } else {
                    const restante = info.cooldownMS - (ahora - ultimoReclamo);
                    const horas = Math.floor(restante / (1000 * 60 * 60));
                    const mins = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
                    rolesEnEspera.push(`${info.nombre} (faltan ${horas}h ${mins}m)`);
                }
            }
        }

        if (totalReclamado === 0 && rolesEnEspera.length === 0) {
            return message.reply('❌ No tienes roles que generen dinero. ¡Visita la `D!shop`!');
        }

        if (totalReclamado === 0 && rolesEnEspera.length > 0) {
            return message.reply(`⏳ Tus trabajos aún no están listos:\n${rolesEnEspera.join('\n')}`);
        }

        userData.coins += totalReclamado;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('💰 Cobro de Salarios Individuales')
            .setColor('#2ecc71')
            .addFields(
                { name: '✅ Reclamado:', value: rolesReclamados.join('\n') },
                { name: '💰 Total Recibido:', value: `\`${totalReclamado}\` coins`, inline: true },
                { name: '💵 Cartera:', value: `\`${userData.coins}\` coins`, inline: true }
            );

        if (rolesEnEspera.length > 0) {
            embed.addFields({ name: '⏳ Aún en espera:', value: rolesEnEspera.join('\n') });
        }

        message.channel.send({ embeds: [embed] });
    }
};