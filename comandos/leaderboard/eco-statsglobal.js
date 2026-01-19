const { EmbedBuilder } = require('discord.js');
const fs = require('fs'); // <--- Faltaba esto
const path = require('path'); // <--- Faltaba esto

module.exports = {
    name: 'eco-statsglobal',
    async execute(message, args) {
        // El resto del código que ya tienes...
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        if (!fs.existsSync(ecoPath)) return message.reply("❌ No hay datos globales aún.");

        const allData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        let globalStats = [];

        for (const [guildID, users] of Object.entries(allData)) {
            const guild = message.client.guilds.cache.get(guildID);
            if (!guild) continue;

            const userDataArray = Object.values(users);
            const sum = userDataArray.reduce((a, b) => a + (b.coins || 0) + (b.banco || 0), 0);
            
            globalStats.push({
                nombre: guild.name,
                monedas: sum,
                usuariosActivos: userDataArray.length
            });
        }

        globalStats.sort((a, b) => b.monedas - a.monedas);
        const top5 = globalStats.slice(0, 5);

        let desc = top5.map((g, i) => 
            `**#${i+1} ${g.nombre}**\n🪙 \`${g.monedas.toLocaleString()}\` coins | 👥 \`${g.usuariosActivos}\` users`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle('🌎 Ranking Global de Servidores')
            .setColor('#f1c40f')
            .setDescription(desc || "No hay datos suficientes.")
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};