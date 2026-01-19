const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'profile',
    description: 'Muestra tu perfil completo, estadísticas, niveles y tops globales.',
    async execute(message, args) {
        const target = message.mentions.users.first() || 
                       message.client.users.cache.get(args[0]) || 
                       message.author;
        
        const member = message.guild.members.cache.get(target.id);

        // --- 1. LEER BASES DE DATOS ---
        const dbPath = path.join(__dirname, '../../interacciones.json');
        const nivelesPath = path.join(__dirname, '../../niveles.json');
        
        // Cargar Interacciones
        let db = {};
        if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        const stats = db[target.id] || {};

        // Cargar Niveles
        let niveles = {};
        if (fs.existsSync(nivelesPath)) niveles = JSON.parse(fs.readFileSync(nivelesPath, 'utf-8') || '{}');
        const guildData = niveles[message.guild.id] || {};
        const userData = guildData[target.id] || { nivel: 0, xp: 0, mensajes: 0 };

        // --- 2. LÓGICA DE RANKINGS ---

        // Posiciones Globales (Interacciones)
        const obtenerPosicionGlobal = (tipo) => {
            const ranking = Object.entries(db)
                .map(([id, data]) => ({ id, valor: data[tipo] || 0 }))
                .sort((a, b) => b.valor - a.valor);
            const index = ranking.findIndex(u => u.id === target.id);
            return index !== -1 ? `#${index + 1}` : 'N/A';
        };

        const posPanes = obtenerPosicionGlobal('panes');
        const posCarisma = obtenerPosicionGlobal('carisma');

        // Posición Local (Niveles del Servidor)
        const rankingServer = Object.entries(guildData)
            .map(([id, data]) => ({ id, nivel: data.nivel, xp: data.xp }))
            .sort((a, b) => {
                if (a.nivel !== b.nivel) return b.nivel - a.nivel;
                return b.xp - a.xp;
            });
        const posServerIndex = rankingServer.findIndex(u => u.id === target.id);
        const posServer = posServerIndex !== -1 ? `#${posServerIndex + 1}` : 'Sin Rango';

        // --- 3. CÁLCULO BARRA DE XP ---
        const xpNecesaria = (userData.nivel * 500) + 500;
        const porcentaje = Math.floor((userData.xp / xpNecesaria) * 10);
        const barraProgreso = "🟦".repeat(porcentaje) + "⬛".repeat(10 - porcentaje);

        // --- 4. CONSTRUIR EL EMBED ---
        const embed = new EmbedBuilder()
            .setTitle(`👤 Perfil Global de ${target.username}`)
            .setColor('#2b2d31')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                // SECCIÓN INFORMACIÓN TÉCNICA (Original)
                { name: '📋 Datos de Usuario', value: 
                    `**ID:** \`${target.id}\`
                    **Cuenta:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>
                    **Ingreso:** ${member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'No está en el server'}`
                },
                // SECCIÓN SISTEMA DE NIVELES (Nuevo Apartado)
                { name: '📈 Sistema de Niveles (Servidor)', value: 
                    `**Nivel:** \`${userData.nivel}\` | **Ranking:** \`${posServer}\`
                    **Mensajes:** \`${userData.mensajes}\`
                    ${barraProgreso} \`${Math.floor((userData.xp / xpNecesaria) * 100)}%\``
                },
                // SECCIÓN ESTADÍSTICAS (Original)
                { name: '📊 Interacciones', value: 
                    `🫂 **Abrazos:** \`${stats.hugs || 0}\`
                    👋 **Caricias:** \`${stats.pats || 0}\`
                    ❤️ **Carisma:** \`${stats.carisma || 0}\``, inline: true
                },
                // SECCIÓN SISTEMA DE PANES (Original)
                { name: '🍞 Inventario', value: 
                    `🥖 **Panes:** \`${stats.panes || 0}\`
                    ✨ **Migajas:** \`${stats.migajas || 0}/100\``, inline: true
                },
                // SECCIÓN TOPS GLOBALES (Original)
                { name: '🏆 Rango en Tops Globales', value: 
                    `🥇 **Top Panes:** \`${posPanes}\`
                    🥇 **Top Carisma:** \`${posCarisma}\``
                }
            )
            .setFooter({ text: `LXT Bot | Sistema de Niveles y Economía`, iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        // Mostrar roles (Original)
        if (member) {
            const roles = member.roles.cache
                .filter(r => r.id !== message.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => r.toString())
                .slice(0, 3);
            if (roles.length > 0) embed.addFields({ name: '🎭 Roles', value: roles.join(', '), inline: true });
        }

        return message.reply({ embeds: [embed] });
    },
};