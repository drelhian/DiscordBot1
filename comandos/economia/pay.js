const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'pay',
    aliases: ['pago', 'donar', 'transferir'],
    description: 'Transfiere monedas de tu cartera a otro usuario.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        // 1. Validaciones del objetivo
        const target = message.mentions.users.first();
        if (!target) return message.reply('⚠️ Menciona a quién quieres enviarle monedas.');
        if (target.id === message.author.id) return message.reply('❌ No puedes enviarte monedas a ti mismo.');
        if (target.bot) return message.reply('🤖 Los bots no necesitan dinero.');

        // 2. Validaciones de la cantidad
        const cantidad = parseInt(args[1]); // args[0] es la mención, args[1] es la cifra
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
            return message.reply('⚠️ Indica una cantidad válida de monedas para enviar.');
        }

        // Inicializar datos del servidor
        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        
        const emisor = ecoData[message.guild.id][message.author.id] || { coins: 0, banco: 0 };
        const receptor = ecoData[message.guild.id][target.id] || { coins: 0, banco: 0 };

        // 3. Verificar si el emisor tiene suficiente dinero en cartera
        if (emisor.coins < cantidad) {
            return message.reply(`❌ No tienes suficientes coins en tu cartera. Tienes: \`${emisor.coins}\``);
        }

        // 4. Proceso de transferencia
        emisor.coins -= cantidad;
        receptor.coins += cantidad;

        // Guardar cambios
        ecoData[message.guild.id][message.author.id] = emisor;
        ecoData[message.guild.id][target.id] = receptor;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        // 5. Enviar confirmación
        const embed = new EmbedBuilder()
            .setTitle('💸 Transferencia Exitosa')
            .setColor('#3498db')
            .setDescription(`Has enviado **${cantidad} coins** a <@${target.id}>.`)
            .addFields(
                { name: '👤 Emisor', value: `<@${message.author.id}>`, inline: true },
                { name: '👤 Receptor', value: `<@${target.id}>`, inline: true },
                { name: '💰 Tu nuevo saldo', value: `\`${emisor.coins}\` coins`, inline: false }
            )
            .setFooter({ text: '¡Gracias por ser generoso!' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};