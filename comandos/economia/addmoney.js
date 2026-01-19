const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'addmoney',
    aliases: ['addcoins', 'añadir-dinero'],
    description: 'Añade monedas a un usuario (Solo Admins).',
    async execute(message, args) {
        // 1. Verificar Permisos
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        const target = message.mentions.users.first();
        const cantidad = parseInt(args[1]);

        if (!target || isNaN(cantidad)) {
            return message.reply('⚠️ Uso correcto: `D!addmoney @usuario [cantidad]`');
        }

        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][target.id]) {
            ecoData[message.guild.id][target.id] = { coins: 0, banco: 0 };
        }

        // 2. Añadir el dinero
        ecoData[message.guild.id][target.id].coins += cantidad;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('✅ Monedas Añadidas')
            .setColor('#2ecc71')
            .setDescription(`Se han añadido **${cantidad} coins** a la cartera de <@${target.id}>.`)
            .setFooter({ text: `Acción realizada por ${message.author.username}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};