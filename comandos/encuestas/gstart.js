const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const ms = require('ms');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'gstart',
    description: 'Sistema avanzado de sorteos con fase de reclamo de 30s',
    async execute(message, args) {
        // 1. VERIFICACIÓN DE ROL DE STAFF
        let staffRole = message.guild.roles.cache.find(r => r.name === 'Giveaway Host');
        if (!staffRole) {
            staffRole = await message.guild.roles.create({
                name: 'Giveaway Host',
                color: '#e91e63',
                reason: 'Rol necesario para crear sorteos'
            });
        }

        if (!message.member.roles.cache.has(staffRole.id)) {
            return message.reply(`❌ Solo los usuarios con el rol ${staffRole} pueden iniciar sorteos.`);
        }

        // 2. PARSEAR ARGUMENTOS
        const fullArgs = args.join(" ");
        const partes = fullArgs.split('--').map(p => p.trim());
        
        const premio = partes[0];
        const tiempoRaw = partes[1];
        const ganadoresCount = parseInt(partes[2]) || 1;
        const requisitoTexto = partes[3] ? partes[3].replace(/"/g, "") : "Ninguno";

        if (!premio || !tiempoRaw) {
            return message.reply("⚠️ **Uso:** `D!gstart [Premio] --[Tiempo] --[Ganadores] --\"[Requisito]\"` ");
        }

        const duracionMs = ms(tiempoRaw);
        if (!duracionMs) return message.reply("❌ Tiempo inválido.");

        let participantes = new Set();
        const endTimestamp = Math.floor((Date.now() + duracionMs) / 1000);

        // 3. EMBED Y BOTONES INICIALES
        const embed = new EmbedBuilder()
            .setTitle(`🎁 SORTEO: ${premio}`)
            .setColor('#5865F2')
            .setDescription(`Haz clic en el botón para participar.\n\n` +
                `**🏆 Ganadores:** ${ganadoresCount}\n` +
                `**📝 Requisito:** ${requisitoTexto}\n` +
                `**👥 Participantes:** 0\n` +
                `**⏳ Finaliza:** <t:${endTimestamp}:R>`)
            .setFooter({ text: `Host: ${message.author.tag}` });

        const rowInicial = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_giveaway').setLabel('Participar 🎉').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stop_giveaway').setLabel('Detener Sorteo 🛑').setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({ content: "🎊 **¡NUEVO SORTEO!** 🎊", embeds: [embed], components: [rowInicial] });

        // 4. COLECTOR PRINCIPAL
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: duracionMs });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'stop_giveaway') {
                if (interaction.user.id !== message.author.id && !interaction.member.permissions.has('Administrator')) {
                    return interaction.reply({ content: "❌ Solo el Host puede detener el sorteo.", ephemeral: true });
                }
                return collector.stop('manual');
            }

            if (interaction.customId === 'join_giveaway') {
                if (participantes.has(interaction.user.id)) return interaction.reply({ content: "✅ Ya estás participando.", ephemeral: true });

                if (interaction.member.roles.cache.some(r => r.name === 'Sancionado')) {
                    return interaction.reply({ content: "❌ No puedes participar: Tienes el rol de **Sancionado**.", ephemeral: true });
                }

                // Validación Niveles/Mensajes
                const nivelesPath = path.join(__dirname, '../../niveles.json');
                if (fs.existsSync(nivelesPath)) {
                    const niveles = JSON.parse(fs.readFileSync(nivelesPath, 'utf-8'));
                    const userData = niveles[interaction.guild.id]?.[interaction.user.id] || { nivel: 0, mensajes: 0 };

                    if (requisitoTexto.toLowerCase().includes("nivel")) {
                        const nivelReq = parseInt(requisitoTexto.match(/\d+/));
                        if (!isNaN(nivelReq) && userData.nivel < nivelReq) return interaction.reply({ content: `❌ Necesitas Nivel ${nivelReq}.`, ephemeral: true });
                    }
                    if (requisitoTexto.toLowerCase().includes("mensaje")) {
                        const msgReq = parseInt(requisitoTexto.match(/\d+/));
                        if (!isNaN(msgReq) && userData.mensajes < msgReq) return interaction.reply({ content: `❌ Necesitas ${msgReq} mensajes.`, ephemeral: true });
                    }
                }

                participantes.add(interaction.user.id);
                const updatedEmbed = EmbedBuilder.from(embed).setDescription(`Haz clic en el botón para participar.\n\n` +
                    `**🏆 Ganadores:** ${ganadoresCount}\n` +
                    `**📝 Requisito:** ${requisitoTexto}\n` +
                    `**👥 Participantes:** ${participantes.size}\n` +
                    `**⏳ Finaliza:** <t:${endTimestamp}:R>`);

                await interaction.update({ embeds: [updatedEmbed] });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'manual') return msg.edit({ content: "🛑 **Sorteo detenido por el Host.**", components: [] });
            if (participantes.size === 0) return msg.edit({ content: "⚠️ **Sorteo finalizado sin participantes.**", components: [] });

            // Selección de ganadores
            const lista = Array.from(participantes);
            const ganadores = [];
            for (let i = 0; i < Math.min(ganadoresCount, lista.length); i++) {
                const win = lista.splice(Math.floor(Math.random() * lista.length), 1)[0];
                ganadores.push(`<@${win}>`);
            }

            // --- FASE DE RECLAMO (30 SEGUNDOS) ---
            const claimTimestamp = Math.floor((Date.now() + 30000) / 1000);
            const rowReclamo = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('claim_reward').setLabel('Reclamado ✅').setStyle(ButtonStyle.Success)
            );

            const msgFinal = await message.channel.send({ 
                content: `🎊 ¡Felicidades ${ganadores.join(", ")}! Has ganado **${premio}**.\n⏳ Tienes hasta <t:${claimTimestamp}:R> (30s) para reclamar.`,
                components: [rowReclamo]
            });

            await msg.edit({ components: [] });

            const claimCollector = msgFinal.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                time: 30000 
            });

            claimCollector.on('collect', async (i) => {
                if (i.customId === 'claim_reward') {
                    // Solo el Host o Admin confirma el reclamo
                    if (i.user.id !== message.author.id && !i.member.permissions.has('Administrator')) {
                        return i.reply({ content: "❌ Solo el Host del sorteo puede marcar esto como reclamado.", ephemeral: true });
                    }

                    claimCollector.stop('reclamado');
                    await i.update({ content: `✅ **Premio Entregado:** ${ganadores.join(", ")} reclamó **${premio}**, ¡enhorabuena!`, components: [] });
                }
            });

            claimCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    msgFinal.edit({ content: `⏰ **Tiempo agotado.** Los ganadores no reclamaron a tiempo o el Host no marcó el premio.`, components: [] });
                }
            });
        });
    },
};