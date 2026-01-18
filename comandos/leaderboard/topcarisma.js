const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'topcarisma',
    description: 'Muestra a los usuarios con más carisma del mundo.',
    async execute(message, args) {
        const dbPath = path.join(__dirname, '../../interacciones.json');
        if (!fs.existsSync(dbPath)) return message.reply('Aún no hay datos.');

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        const leaderboard = Object.entries(db)
            .map(([id, data]) => ({ id, carisma: data.carisma || 0 }))
            .filter(user => user.carisma > 0)
            .sort((a, b) => b.carisma - a.carisma)
            .slice(0, 10);

        let description = "";
        for (let i = 0; i < leaderboard.length; i++) {
            const user = leaderboard[i];
            let name;
            try {
                const fUser = await message.client.users.fetch(user.id);
                name = fUser.username;
            } catch { name = "Desconocido"; }
            
            const medal = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "✨";
            description += `${medal} **${name}** — \`${user.carisma}\` puntos\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🌟 Ranking Global de Carisma')
            .setColor('#ffd700')
            .setDescription(description || "Nadie tiene carisma aún.")
            .setFooter({ text: 'El carisma es el aura de los elegidos.' });

        return message.reply({ embeds: [embed] });
    },
};