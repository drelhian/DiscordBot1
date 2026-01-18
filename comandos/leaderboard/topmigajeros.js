const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'topmigajeros',
    description: 'Muestra el ranking global de los mayores migajeros y panaderos.',
    async execute(message, args) {
        const dbPath = path.join(__dirname, '../../interacciones.json');

        if (!fs.existsSync(dbPath)) {
            return message.reply('🤷‍♂️ Aún no hay registros de migajeros en este servidor.');
        }

        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

        // 1. Convertir el objeto DB en un Array y filtrar los que tengan progreso
        const leaderboard = Object.entries(db)
            .map(([id, data]) => ({
                id,
                migajas: data.migajas || 0,
                panes: data.panes || 0
            }))
            .filter(user => user.migajas > 0 || user.panes > 0) // Solo gente con algo
            .sort((a, b) => {
                // Ordenar: Primero por Panes, luego por Migajas
                if (b.panes !== a.panes) return b.panes - a.panes;
                return b.migajas - a.migajas;
            })
            .slice(0, 10); // Top 10

        if (leaderboard.length === 0) {
            return message.reply('💔 Nadie ha mendigado suficiente afecto todavía.');
        }

        // 2. Construir la descripción del Ranking
        let description = "";
        
        for (let i = 0; i < leaderboard.length; i++) {
            const user = leaderboard[i];
            let memberName;
            
            try {
                // Intentamos obtener el nombre del usuario por su ID
                const fetchedUser = await message.client.users.fetch(user.id);
                memberName = fetchedUser.username;
            } catch {
                memberName = "Usuario Desconocido";
            }

            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "👤";
            description += `${medal} **${memberName}** — \`${user.panes}\` Panes | \`${user.migajas}\` Migajas\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Ranking Global de Migajeros')
            .setColor('#f4a261')
            .setDescription(description || "No hay datos suficientes.")
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/3342/3342137.png') // Icono de trofeo o pan
            .setFooter({ text: '¿Serás capaz de salir del fango y hornear más que ellos?' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};