const { EmbedBuilder } = require('discord.js');
const fs = require('fs'); // <--- Faltaba esto
const path = require('path'); // <--- Faltaba esto

module.exports = {
    name: 'sell',
    async execute(message, args) {
        const shopPath = path.join(__dirname, '../../tienda.json');
        const shopData = JSON.parse(fs.readFileSync(shopPath, 'utf-8'));
        const items = shopData[message.guild.id] || [];

        // Buscar qué rol de la tienda tiene el usuario
        const item = items.find(i => message.member.roles.cache.has(i.rolID));
        if (!item) return message.reply("❌ No tienes ningún rol de la tienda equipado para vender.");

        const pago = Math.floor(item.precio * 0.5); // Devuelve el 50%
        
        await message.member.roles.remove(item.rolID);
        // ... (Sumar 'pago' a ecoData del usuario)
        
        message.reply(`💰 Has vendido tu rol por **${pago} coins** (50% de su valor).`);
    }
};