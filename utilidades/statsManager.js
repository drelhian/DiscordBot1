const { ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function updateServerStats(guild) {
    const configPath = path.join(__dirname, '../config.json');
    if (!fs.existsSync(configPath)) return;
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const statsConfig = config[guild.id]?.stats;
    if (!statsConfig) return;

    const all = guild.memberCount;
    
    // --- LÓGICA DE META DINÁMICA (GOAL) ---
    let metaActual = 10;
    if (all >= 10) metaActual = 20;
    if (all >= 20) metaActual = 50;
    if (all >= 50) metaActual = 100;
    if (all >= 100) metaActual = Math.ceil((all + 1) / 100) * 100; // Sube de 100 en 100 después de los 100
    if (all >= 1000) metaActual = Math.ceil((all + 1) / 1000) * 1000; // Sube de 1000 en 1000 después de los 1000

    // Cálculos de población
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = all - bots;
    
    // Mapeo de valores
    const valores = { 
        all, humans, bots, 
        goal: `${all}/${metaActual}`, // Muestra progreso ej: 8/10
        boosts: guild.premiumSubscriptionCount || 0,
        channels: guild.channels.cache.size,
        roles: guild.roles.cache.size,
        voice: guild.members.cache.filter(m => m.voice.channel).size,
        activevoice: guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice && c.members.size > 0).size,
        lastmember: guild.members.cache.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp).first()?.user.username || "Nadie"
    };

    for (const [tipo, data] of Object.entries(statsConfig)) {
        const canal = guild.channels.cache.get(data.id);
        if (canal) {
            let nuevoNombre = data.format
                .replace('{count}', valores[tipo] || '0')
                .replace('{name}', valores.lastmember);

            if (canal.name !== nuevoNombre) {
                await canal.setName(nuevoNombre).catch(() => {});
            }
        }
    }
}

module.exports = { updateServerStats };