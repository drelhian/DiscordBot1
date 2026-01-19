const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'removemoney',
    aliases: ['remmoney', 'quitar-dinero'],
    description: 'Quita monedas a un usuario (Solo Admins).',
    async execute(message, args) {
        // 1. Verificar Permisos
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes permisos para usar este comando.');
        }

        const target = message.mentions.users.first();
        const cantidad = parseInt(args[1]);

        if (!target || isNaN(cantidad)) {
            return message.reply('⚠️ Uso correcto: `D!removemoney @usuario [cantidad]`');
        }

        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        if (!ecoData[message.guild.id] || !ecoData[message.guild.id][target.id]) {
            return message.reply('❌ Este usuario no tiene un perfil económico.');
        }

        // 2. Quitar el dinero (asegurando que no baje de 0)
        const saldoActual = ecoData[message.guild.id][target.id].coins;
        ecoData[message.guild.id][target.id].coins = Math.max(0, saldoActual - cantidad);
        
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🛑 Monedas Retiradas')
            .setColor('#e74c3c')
            .setDescription(`Se han retirado **${cantidad} coins** de la cartera de <@${target.id}>.`)
            .setFooter({ text: `Acción realizada por ${message.author.username}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};