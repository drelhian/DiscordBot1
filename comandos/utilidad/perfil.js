const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'perfil',
    description: 'Muestra tu perfil completo, estadísticas y posición en los tops globales.',
    async execute(message, args) {
        const target = message.mentions.users.first() || 
                       message.client.users.cache.get(args[0]) || 
                       message.author;
        
        const member = message.guild.members.cache.get(target.id);

        // 1. LEER BASE DE DATOS
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        const stats = db[target.id] || {};
        
        // 2. LÓGICA DE RANKING GLOBAL (Calcular posición del usuario)
        const obtenerPosicion = (tipo) => {
            const ranking = Object.entries(db)
                .map(([id, data]) => ({ id, valor: data[tipo] || 0 }))
                .sort((a, b) => b.valor - a.valor);
            
            const index = ranking.findIndex(u => u.id === target.id);
            return index !== -1 ? `#${index + 1}` : 'N/A';
        };

        const posPanes = obtenerPosicion('panes');
        const posCarisma = obtenerPosicion('Carisma');

        // 3. CONSTRUIR EL EMBED
        const embed = new EmbedBuilder()
            .setTitle(`👤 Perfil Global de ${target.username}`)
            .setColor('#2b2d31')
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                // SECCIÓN INFORMACIÓN TÉCNICA
                { name: '📋 Datos de Usuario', value: 
                    `**ID:** \`${target.id}\`
                    **Cuenta:** <t:${Math.floor(target.createdTimestamp / 1000)}:R>
                    **Ingreso:** ${member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'No está en el server'}`
                },
                // SECCIÓN ESTADÍSTICAS (Lo que ha recibido)
                { name: '📊 Estadísticas de Interacción', value: 
                    `🫂 **Abrazos:** \`${stats.hugs || 0}\`
                    👋 **Caricias:** \`${stats.pats || 0}\`
                    ❤️ **Carisma:** \`${stats.carisma || 0}\``, inline: true
                },
                // SECCIÓN SISTEMA DE PANES
                { name: '🍞 Inventario de Panadería', value: 
                    `🥖 **Panes:** \`${stats.panes || 0}\`
                    ✨ **Migajas:** \`${stats.migajas || 0}/100\``, inline: true
                },
                // SECCIÓN TOPS GLOBALES (LO NUEVO)
                { name: '🏆 Rango en Tops Globales', value: 
                    `🥇 **Top Panes:** \`${posPanes}\`
                    🥇 **Top Carisma:** \`${posCarisma}\``
                }
            )
            .setFooter({ text: `LXT Bot | Próximamente más rankings...`, iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        // Mostrar roles si existen
        if (member) {
            const roles = member.roles.cache
                .filter(r => r.id !== message.guild.id)
                .map(r => r.toString())
                .slice(0, 3);
            if (roles.length > 0) embed.addFields({ name: '🎭 Roles', value: roles.join(', '), inline: true });
        }

        return message.reply({ embeds: [embed] });
    },
};