const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'with',
    aliases: ['withdraw', 'retirar'],
    description: 'Saca monedas del banco para usarlas en tu cartera.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        if (!ecoData[message.guild.id] || !ecoData[message.guild.id][message.author.id]) {
            return message.reply('❌ No tienes una cuenta registrada aún. ¡Usa `D!daily` para empezar!');
        }

        const userData = ecoData[message.guild.id][message.author.id];
        let cantidadARetirar;

        // 1. Verificar si quiere retirar "todo"
        if (args[0] === 'all' || args[0] === 'max') {
            cantidadARetirar = userData.banco;
        } else {
            cantidadARetirar = parseInt(args[0]);
        }

        // 2. Validaciones
        if (userData.banco <= 0) {
            return message.reply('❌ No tienes monedas guardadas en el banco.');
        }

        if (!cantidadARetirar || isNaN(cantidadARetirar) || cantidadARetirar <= 0) {
            return message.reply('⚠️ Indica una cantidad válida o usa `D!with all`.');
        }

        if (cantidadARetirar > userData.banco) {
            return message.reply(`❌ No tienes tantas monedas en el banco. Tu saldo bancario es de \`${userData.banco}\` coins.`);
        }

        // 3. Proceso de transferencia
        userData.banco -= cantidadARetirar;
        userData.coins += cantidadARetirar;

        // 4. Guardar y responder
        ecoData[message.guild.id][message.author.id] = userData;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🏦 Retiro Exitoso')
            .setColor('#e67e22') // Color naranja para diferenciar del depósito
            .setDescription(`Has retirado **${cantidadARetirar} coins** de tu banco.`)
            .addFields(
                { name: '🏦 Banco', value: `\`${userData.banco}\` coins`, inline: true },
                { name: '💵 Cartera', value: `\`${userData.coins}\` coins`, inline: true }
            )
            .setFooter({ text: 'Recuerda que ahora pueden robártelas con D!rob' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};