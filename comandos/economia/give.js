const { EmbedBuilder } = require('discord.js');
const fs = require('fs'); // <--- Faltaba esto
const path = require('path'); // <--- Faltaba esto

module.exports = {
    name: 'give',
    async execute(message, args) {
        const target = message.mentions.members.first();
        if (!target) return message.reply("⚠️ Menciona a quién quieres regalarle el rol.");

        // Buscar qué rol de la tienda tiene el autor
        const shopData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../tienda.json'), 'utf-8'));
        const rolTienda = shopData[message.guild.id].find(i => message.member.roles.cache.has(i.rolID));

        if (!rolTienda) return message.reply("❌ No tienes ningún rol de la tienda para regalar.");

        await message.member.roles.remove(rolTienda.rolID);
        await target.roles.add(rolTienda.rolID);

        message.channel.send(`🎁 <@${message.author.id}> le ha regalado el rol <@&${rolTienda.rolID}> a <@${target.id}>!`);
    }
};