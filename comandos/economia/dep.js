const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'dep',
    aliases: ['deposit', 'depositar'],
    description: 'Guarda tus monedas en el banco para protegerlas de robos.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = { coins: 0, banco: 0 };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        let cantidadADepositar;

        // 1. Verificar si quiere depositar "todo"
        if (args[0] === 'all' || args[0] === 'max') {
            cantidadADepositar = userData.coins;
        } else {
            cantidadADepositar = parseInt(args[0]);
        }

        // 2. Validaciones de la cantidad
        if (userData.coins <= 0) {
            return message.reply('❌ No tienes monedas en tu cartera para depositar.');
        }

        if (!cantidadADepositar || isNaN(cantidadADepositar) || cantidadADepositar <= 0) {
            return message.reply('⚠️ Indica una cantidad válida o usa `D!dep all`.');
        }

        if (cantidadADepositar > userData.coins) {
            return message.reply(`❌ No tienes tantas monedas. Tu saldo actual en cartera es de \`${userData.coins}\` coins.`);
        }

        // 3. Proceso de transferencia
        userData.coins -= cantidadADepositar;
        userData.banco += cantidadADepositar;

        // 4. Guardar y responder
        ecoData[message.guild.id][message.author.id] = userData;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🏦 Depósito Exitoso')
            .setColor('#2ecc71')
            .setDescription(`Has guardado **${cantidadADepositar} coins** en tu cuenta bancaria.`)
            .addFields(
                { name: '💵 Cartera', value: `\`${userData.coins}\` coins`, inline: true },
                { name: '🏦 Banco', value: `\`${userData.banco}\` coins`, inline: true }
            )
            .setFooter({ text: 'Tu dinero ahora está seguro contra robos' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};