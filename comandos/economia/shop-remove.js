const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shop-remove',
    description: 'Quita un rol de la tienda (Solo Admins)',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) return message.reply('❌ No tienes permisos.');

        const index = parseInt(args[0]) - 1;
        const shopPath = path.join(__dirname, '../../tienda.json');
        let shopData = fs.existsSync(shopPath) ? JSON.parse(fs.readFileSync(shopPath, 'utf-8')) : {};

        if (!shopData[message.guild.id] || !shopData[message.guild.id][index]) {
            return message.reply('❌ No encontré ese ítem en la tienda.');
        }

        const eliminado = shopData[message.guild.id].splice(index, 1);
        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));

        message.reply(`🗑️ Se ha eliminado el rol de la tienda.`);
    }
};