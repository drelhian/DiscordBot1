const { PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set-stats',
    description: 'Configura canales de estadísticas con categoría y metas dinámicas.',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ No tienes permisos.');

        const guild = message.guild;
        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
        const { updateServerStats } = require('../../utilidades/statsManager.js');

        const tipo = args[0]?.toLowerCase();

        // --- BUSCAR O CREAR CATEGORÍA ---
        let categoria = guild.channels.cache.find(c => c.name.toUpperCase() === 'STATS' && c.type === ChannelType.GuildCategory);
        if (!categoria) {
            categoria = await guild.channels.create({
                name: 'STATS',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.Connect] }]
            });
        }

        // --- MODO SETUP (PACK BÁSICO) ---
        if (tipo === 'setup') {
            message.channel.send('⏳ Creando pack básico en la categoría STATS...');
            const pack = [
                { tipo: 'all', formato: '📊 Total: {count}' },
                { tipo: 'humans', formato: '👤 Personas: {count}' },
                { tipo: 'bots', formato: '🤖 Bots: {count}' }
            ];

            if (!config[guild.id]) config[guild.id] = {};
            if (!config[guild.id].stats) config[guild.id].stats = {};

            for (const item of pack) {
                const canal = await guild.channels.create({
                    name: item.formato.replace('{count}', '...'),
                    type: ChannelType.GuildVoice,
                    parent: categoria.id,
                    permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.Connect] }]
                });
                config[guild.id].stats[item.tipo] = { id: canal.id, format: item.formato };
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await updateServerStats(guild);
            return message.reply('✅ Pack básico configurado en la categoría STATS.');
        }

        // --- MODO PERSONALIZADO ---
        const tiposValidos = ['all', 'humans', 'bots', 'boosts', 'online', 'dnd', 'idle', 'offline', 'channels', 'roles', 'bans', 'voice', 'activevoice', 'lastmember', 'lastban', 'goal'];
        const partes = message.content.split(' -- ');
        const formato = partes[1] || null;

        if (!tipo || !tiposValidos.includes(tipo) || !formato) {
            return message.reply('⚠️ **Uso:** `D!set-stats [tipo] -- [Nombre con {count} o {name}]`');
        }

        const canal = await guild.channels.create({
            name: formato.replace('{count}', '...').replace('{name}', '...'),
            type: ChannelType.GuildVoice,
            parent: categoria.id,
            permissionOverwrites: [{ id: guild.id, deny: [PermissionFlagsBits.Connect] }]
        });

        if (!config[guild.id]) config[guild.id] = {};
        if (!config[guild.id].stats) config[guild.id].stats = {};
        config[guild.id].stats[tipo] = { id: canal.id, format: formato };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        message.reply(`✅ Canal de **${tipo}** creado en la categoría **${categoria.name}**.`);
        
        updateServerStats(guild);
    }
};