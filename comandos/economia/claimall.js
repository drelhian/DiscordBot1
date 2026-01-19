const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'claimall',
    aliases: ['reclamar-sueldos', 'claim'],
    description: 'Reclama las monedas generadas por tus roles/trabajos',
    async execute(message, args) {
        const salariesPath = path.join(__dirname, '../../salarios.json');
        const ecoPath = path.join(__dirname, '../../economia.json');

        if (!fs.existsSync(salariesPath)) return message.reply('❌ No hay salarios configurados en este servidor.');

        let salariesData = JSON.parse(fs.readFileSync(salariesPath, 'utf-8'));
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        const guildSalaries = salariesData[message.guild.id];
        if (!guildSalaries) return message.reply('❌ No hay salarios configurados en este servidor.');

        // Inicializar datos del usuario si no existen
        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = { coins: 0, banco: 0, lastClaim: 0 };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        const ahora = Date.now();
        const tiempoEspera = 24 * 60 * 60 * 1000; // 24 Horas

        // 1. Verificar Cooldown
        if (ahora - (userData.lastClaim || 0) < tiempoEspera) {
            const restante = tiempoEspera - (ahora - userData.lastClaim);
            const horas = Math.floor(restante / (1000 * 60 * 60));
            return message.reply(`⏰ Ya reclamaste tus salarios hoy. Vuelve en **${horas}h**.`);
        }

        // 2. Calcular total basado en los roles del usuario
        let totalReclamado = 0;
        let rolesContados = [];

        for (const [rolID, info] of Object.entries(guildSalaries)) {
            if (message.member.roles.cache.has(rolID)) {
                totalReclamado += info.puntos;
                rolesContados.push(info.nombre);
            }
        }

        // 3. Si no tiene roles con sueldo
        if (totalReclamado === 0) {
            return message.reply('❌ No tienes trabajos/roles en tu perfil, compra con `D!shop`.');
        }

        // 4. Entregar dinero y guardar
        userData.coins += totalReclamado;
        userData.lastClaim = ahora;

        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('💼 Nómina de Salarios')
            .setColor('#2ecc71')
            .setDescription(`Has reclamado los beneficios de tus roles:`)
            .addFields(
                { name: 'Roles activos', value: rolesContados.join(', '), inline: false },
                { name: '💰 Total recibido', value: `\`${totalReclamado}\` coins`, inline: true },
                { name: '💵 Cartera', value: `\`${userData.coins}\` coins`, inline: true }
            )
            .setFooter({ text: 'Vuelve mañana para tu siguiente pago' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};