const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');

module.exports = {
    name: 'greroll',
    description: 'Elige un nuevo ganador y activa la fase de reclamo',
    async execute(message, args) {
        // 1. Verificación de permisos (Host o Admin)
        if (!message.member.roles.cache.some(r => r.name === 'Giveaway Host') && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes el rol de **Giveaway Host** para resortear.');
        }

        // 2. Buscar el mensaje del sorteo original
        const messages = await message.channel.messages.fetch({ limit: 50 });
        const giveawayMsg = messages.find(m => 
            m.author.id === message.client.user.id && 
            m.embeds.length > 0 && 
            m.embeds[0].title?.includes("SORTEO")
        );

        // --- CAMBIO SOLICITADO AQUÍ ---
        if (!giveawayMsg) {
            return message.reply('❌ No hay sorteo activo, usar `gstart` para crear uno nuevo.');
        }

        // Extraer el premio del título del embed original
        const premio = giveawayMsg.embeds[0].title.replace("SORTEO: ", "");

        // 3. Obtener participantes
        // Nota: Al ser reroll manual, filtramos miembros reales del servidor (no bots)
        const members = await message.guild.members.fetch();
        const participantes = members.filter(m => !m.user.bot); 
        const nuevoGanador = participantes.random();

        if (!nuevoGanador) return message.reply("❌ No hay participantes válidos para el re-sorteo.");

        // 4. FASE DE RECLAMO (30 SEGUNDOS)
        const claimTimestamp = Math.floor((Date.now() + 30000) / 1000);
        const rowReclamo = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_reroll')
                .setLabel('Reclamado ✅')
                .setStyle(ButtonStyle.Success)
        );

        const msgReroll = await message.channel.send({ 
            content: `🎲 **RE-SORTEO** 🎲\n🎊 ¡Felicidades <@${nuevoGanador.id}>! Eres el nuevo ganador de: **${premio}**.\n⏳ Tienes hasta <t:${claimTimestamp}:R> para reclamar.`,
            components: [rowReclamo]
        });

        // 5. Colector para el botón de reclamo
        const claimCollector = msgReroll.createMessageComponentCollector({ 
            componentType: ComponentType.Button, 
            time: 30000 
        });

        claimCollector.on('collect', async (i) => {
            if (i.customId === 'claim_reroll') {
                // Solo el Host que ejecutó el comando o Admin confirma
                if (i.user.id !== message.author.id && !i.member.permissions.has('Administrator')) {
                    return i.reply({ content: "❌ Solo el Host puede marcar el premio como reclamado.", ephemeral: true });
                }

                claimCollector.stop('reclamado');
                await i.update({ 
                    content: `✅ **Premio Entregado (Reroll):** <@${nuevoGanador.id}> reclamó **${premio}**, ¡enhorabuena!`, 
                    components: [] 
                });
            }
        });

        claimCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
                msgReroll.edit({ 
                    content: `⏰ **Tiempo agotado (Reroll).** El nuevo ganador no reclamó o el Host no confirmó el reclamo.`, 
                    components: [] 
                });
            }
        });
    },
};