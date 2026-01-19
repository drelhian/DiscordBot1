const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'balance',
    aliases: ['coins', 'bal', 'cartera'],
    description: 'Muestra tu saldo actual de monedas',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        // 1. Leer o crear la base de datos
        let ecoData = {};
        if (fs.existsSync(ecoPath)) {
            ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        }

        // 2. Determinar el objetivo (tú mismo o alguien mencionado)
        const target = message.mentions.users.first() || message.author;

        // 3. Inicializar datos si el usuario o servidor no existen
        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][target.id]) {
            ecoData[message.guild.id][target.id] = {
                coins: 0,
                banco: 0
            };
            fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));
        }

        const data = ecoData[message.guild.id][target.id];

        // 4. Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle(`💰 Cartera de ${target.username}`)
            .setColor('#f1c40f') // Color Dorado Coins
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💵 En mano', value: `\`${data.coins}\` coins`, inline: true },
                { name: '🏦 En banco', value: `\`${data.banco}\` coins`, inline: true },
                { name: '💳 Total', value: `\`${data.coins + data.banco}\` coins`, inline: false }
            )
            .setFooter({ text: 'Usa D!daily para obtener monedas gratis cada día' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};