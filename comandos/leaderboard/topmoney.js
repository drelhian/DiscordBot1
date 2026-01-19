const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'topmoney',
    aliases: ['leaderboard', 'mtop', 'ricachones'],
    description: 'Muestra a los usuarios más ricos del servidor.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        // 1. Verificar si existe la base de datos
        if (!fs.existsSync(ecoPath)) {
            return message.reply('❌ Aún no hay datos económicos en este servidor.');
        }

        const ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        const serverData = ecoData[message.guild.id];

        if (!serverData || Object.keys(serverData).length === 0) {
            return message.reply('❌ Nadie tiene monedas todavía.');
        }

        // 2. Convertir el objeto en una lista y calcular el total (Mano + Banco)
        const listaTop = Object.entries(serverData).map(([id, data]) => {
            return {
                id: id,
                total: (data.coins || 0) + (data.banco || 0)
            };
        });

        // 3. Ordenar de mayor a menor
        listaTop.sort((a, b) => b.total - a.total);

        // 4. Tomar los 10 mejores
        const top10 = listaTop.slice(0, 10);

        // 5. Construir la descripción del Ranking
        let descripcion = "";
        
        for (let i = 0; i < top10.length; i++) {
            const user = await message.client.users.fetch(top10[i].id).catch(() => null);
            const nombre = user ? user.username : "Usuario Desconocido";
            const total = top10[i].total.toLocaleString(); // Formatea números (ej: 1,000)

            // Medallas para el podio
            let medalla = "";
            if (i === 0) medalla = "🥇";
            else if (i === 1) medalla = "🥈";
            else if (i === 2) medalla = "🥉";
            else medalla = `**#${i + 1}**`;

            descripcion += `${medalla} **${nombre}** — \`${total}\` coins\n`;
        }

        // 6. Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle(`💰 Top más ricos de ${message.guild.name}`)
            .setColor('#f1c40f')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(descripcion || "No hay usuarios en la lista.")
            .setFooter({ text: 'Suma de Cartera + Banco' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};