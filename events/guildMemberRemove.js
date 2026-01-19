const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const configPath = path.join(__dirname, '../config.json');
        if (!fs.existsSync(configPath)) return;
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const conf = config[member.guild.id]?.goodbye;

        if (!conf || !conf.channel) return;

        const channel = member.guild.channels.cache.get(conf.channel);
        if (!channel) return;

        const { updateServerStats } = require('../utilidades/statsManager.js');

// Dentro de execute(member):
await updateServerStats(member.guild);

        // Función para reemplazar variables
        const replaceVars = (str) => {
            return str
                .replace('{username}', `${member.user.username}`)
                .replace('{server}', `${member.guild.name}`)
                .replace('{count}', `${member.guild.memberCount}`);
        };

        const tituloFinal = replaceVars(conf.title);
        const subtituloFinal = replaceVars(conf.subtitle);

        const embed = new EmbedBuilder()
            .setTitle(tituloFinal)
            .setDescription(subtituloFinal)
            .setImage(conf.image)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setColor('#e74c3c')
            .setTimestamp()
            .setFooter({ text: `Ahora somos ${member.guild.memberCount} miembros` });

        channel.send({ embeds: [embed] });
    }
};