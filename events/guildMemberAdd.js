const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const guild = member.guild;
        const configPath = path.join(__dirname, '../config.json');
        if (!fs.existsSync(configPath)) return;
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const serverConf = config[guild.id];

        if (!serverConf) return;

        const { updateServerStats } = require('../utilidades/statsManager.js');

// Dentro de execute(member):
await updateServerStats(member.guild);

        // --- 1. PROCESAR RASTREO DE QUIÉN INVITÓ ---
        const oldInvites = member.client.invites.get(guild.id);
        const newInvites = await guild.invites.fetch();
        const usedInvite = newInvites.find(i => i.uses > (oldInvites?.get(i.code) || 0));
        
        // Actualizar caché
        member.client.invites.set(guild.id, new Map(newInvites.map((inv) => [inv.code, inv.uses])));

        const inviter = usedInvite ? usedInvite.inviter : null;
        const inviteCount = usedInvite ? usedInvite.uses : 0;

        // --- 2. LOG DE INVITACIONES ESTILO NEKOTINA ---
        if (serverConf.inviteLog && serverConf.inviteLog.channel) {
            const invChannel = guild.channels.cache.get(serverConf.inviteLog.channel);
            if (invChannel) {
                const conf = serverConf.inviteLog;
                const embedInv = new EmbedBuilder()
                    .setTitle(conf.title)
                    .setDescription(conf.subtitle
                        .replace('{inviter}', inviter ? `<@${inviter.id}>` : "Desconocido")
                        .replace('{user}', `<@${member.id}>`)
                        .replace('{invites}', `\`${inviteCount}\``)
                    )
                    .setImage(conf.image)
                    .setThumbnail(inviter ? inviter.displayAvatarURL() : null)
                    .setColor('#3498db')
                    .setTimestamp();
                invChannel.send({ embeds: [embedInv] });
            }
        }

        // --- 3. BIENVENIDA ESTILO NEKOTINA (Tu código anterior) ---
        if (serverConf.welcome && serverConf.welcome.channel) {
            const welcomeChannel = guild.channels.cache.get(serverConf.welcome.channel);
            if (welcomeChannel) {
                const conf = serverConf.welcome;
                const embedWel = new EmbedBuilder()
                    .setTitle(conf.title.replace('{server}', guild.name))
                    .setDescription(conf.subtitle
                        .replace('{user}', `${member}`)
                        .replace('{count}', guild.memberCount)
                        .replace('{server}', guild.name))
                    .setImage(conf.image)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setColor('#ff99cc');
                welcomeChannel.send({ content: `¡Bienvenido/a ${member}! ✨`, embeds: [embedWel] });
            }
        }
    }
};