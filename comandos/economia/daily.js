const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'daily',
    description: 'Reclama tu recompensa diaria y aumenta tu racha',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        // 1. Cargar base de datos
        let ecoData = {};
        if (fs.existsSync(ecoPath)) {
            ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        }

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = {
                coins: 0,
                banco: 0,
                lastDaily: 0,
                racha: 0
            };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        const ahora = Date.now();
        const tiempoEspera = 24 * 60 * 60 * 1000; // 24 Horas en ms
        const tiempoLimiteRacha = 48 * 60 * 60 * 1000; // 48 Horas para perder racha

        // 2. Verificar Cooldown
        if (ahora - userData.lastDaily < tiempoEspera) {
            const tiempoRestante = tiempoEspera - (ahora - userData.lastDaily);
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            return message.reply(`⏰ Ya has reclamado tu daily. Vuelve en **${horas}h ${minutos}m**.`);
        }

        let mensajeRacha = "";
        
        // 3. Lógica de Racha
        if (userData.lastDaily !== 0 && (ahora - userData.lastDaily) > tiempoLimiteRacha) {
            // Pasaron más de 48h: Reinicio
            userData.racha = 1;
            mensajeRacha = "⚠️ Tu daily se reinició porque faltaste más de un día, se reinició tu conteo.";
        } else {
            // Dentro del tiempo: Aumenta racha
            userData.racha += 1;
            mensajeRacha = `✅ Has reclamado tu recompensa diaria.`;
        }

        // 4. Calcular Monedas (Base 100 + (Racha * 10))
        // Ejemplo: Día 1 = 110, Día 2 = 120...
        const monedasGanadas = 100 + (userData.racha * 10);
        userData.coins += monedasGanadas;
        userData.lastDaily = ahora;

        // 5. Preparar Diseño de Racha (Fuego a partir de 4 días)
        let visualRacha = `Día ${userData.racha}`;
        if (userData.racha >= 4) {
            visualRacha = `🔥 ${userData.racha} Días`;
        }

        // Guardar datos
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        // 6. Enviar Embed
        const embed = new EmbedBuilder()
            .setTitle(`💰 Recompensa Diaria`)
            .setColor(userData.racha >= 4 ? '#e67e22' : '#f1c40f')
            .setDescription(`${mensajeRacha}`)
            .addFields(
                { name: '💵 Ganaste', value: `\`${monedasGanadas}\` coins`, inline: true },
                { name: '📈 Racha Actual', value: `**${visualRacha}**`, inline: true },
                { name: '💰 Saldo Total', value: `\`${userData.coins}\` coins`, inline: false }
            )
            .setFooter({ text: 'No olvides volver mañana para mantener tu racha' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};