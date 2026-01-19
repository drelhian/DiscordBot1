const { EmbedBuilder } = require('discord.js');
const fs = require('fs'); // <--- Faltaba esto
const path = require('path'); // <--- Faltaba esto

module.exports = {
    name: 'giveprice',
    async execute(message, args) {
        const comprador = message.mentions.members.first();
        const precio = parseInt(args[1]);

        if (!comprador || isNaN(precio)) return message.reply("⚠️ Uso: `D!giveprice @usuario [precio]`");

        const shopData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../tienda.json'), 'utf-8'));
        const item = shopData[message.guild.id].find(i => message.member.roles.cache.has(i.rolID));

        if (!item) return message.reply("❌ No tienes un rol de la tienda para vender.");

        message.channel.send(`🤝 <@${comprador.id}>, <@${message.author.id}> quiere venderte el rol <@&${item.rolID}> por **${precio} coins**. Escribe \`confirmar\` para aceptar.`);

        const filter = m => m.author.id === comprador.id && m.content.toLowerCase() === 'confirmar';
        const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async m => {
            // ... (Aquí validas que el comprador tenga el dinero)
            // ... (Restas dinero al comprador, sumas al vendedor)
            // ... (Cambias los roles de Discord)
            message.channel.send("✅ ¡Trato cerrado! El rol ha sido transferido.");
        });
    }
};