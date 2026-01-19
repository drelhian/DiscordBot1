const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'dice',
    aliases: ['dados', 'bet'],
    description: 'Apuesta tus monedas lanzando dados contra el bot.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        // 1. Validar la apuesta
        const apuesta = parseInt(args[0]);
        if (!apuesta || isNaN(apuesta) || apuesta <= 0) {
            return message.reply('⚠️ Indica cuánto quieres apostar. Ejemplo: `D!dice 100`');
        }

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        const userData = ecoData[message.guild.id][message.author.id] || { coins: 0, banco: 0 };

        if (userData.coins < apuesta) {
            return message.reply(`❌ No tienes suficientes monedas en mano para esta apuesta.`);
        }

        // 2. Lanzamiento de dados (1 al 6)
        const dadoUsuario = Math.floor(Math.random() * 6) + 1;
        const dadoBot = Math.floor(Math.random() * 6) + 1;

        let resultado;
        let color;
        let gananciaFinal = 0;

        // 3. Lógica de victoria, empate o derrota
        if (dadoUsuario > dadoBot) {
            // Gana el usuario (Doble de la apuesta)
            gananciaFinal = apuesta;
            userData.coins += gananciaFinal;
            resultado = `¡Ganaste! Has duplicado tu apuesta.`;
            color = '#2ecc71'; // Verde
        } else if (dadoUsuario === dadoBot) {
            // Empate (No gana ni pierde)
            gananciaFinal = 0;
            resultado = `¡Es un empate! Recuperas tus monedas.`;
            color = '#f1c40f'; // Amarillo
        } else {
            // Pierde el usuario
            gananciaFinal = -apuesta;
            userData.coins -= apuesta;
            resultado = `Has perdido... El bot sacó un número mayor.`;
            color = '#e74c3c'; // Rojo
        }

        // 4. Guardar y Enviar
        ecoData[message.guild.id][message.author.id] = userData;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🎲 Duelo de Dados')
            .setColor(color)
            .addFields(
                { name: `Tú: ${message.author.username}`, value: `🎲 \`${dadoUsuario}\``, inline: true },
                { name: `Bot: ${message.client.user.username}`, value: `🎲 \`${dadoBot}\``, inline: true },
                { name: 'Resultado', value: `${resultado}\nSaldo: \`${gananciaFinal > 0 ? '+' : ''}${gananciaFinal}\` coins` }
            )
            .setFooter({ text: `Tu cartera: ${userData.coins} coins` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};