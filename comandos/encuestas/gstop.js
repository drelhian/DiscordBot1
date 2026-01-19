

module.exports = {
    name: 'gstop',
    description: 'Finaliza un sorteo activo inmediatamente',
    async execute(message, args) {
        if (!message.member.roles.cache.some(r => r.name === 'Giveaway Host') && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes el rol de **Giveaway Host**.');
        }

        const msgId = args[0];
        if (!msgId) return message.reply('⚠️ Indica la ID del mensaje del sorteo. `D!gstop [ID]`');

        try {
            const targetMsg = await message.channel.messages.fetch(msgId);
            if (!targetMsg) return message.reply('❌ No encontré ese mensaje.');

            // Esto forzará que el colector de gstart termine por tiempo (o manualmente si lo guardamos)
            // Por ahora, lo más sencillo es editar el mensaje para indicar que ha sido forzado a terminar.
            await targetMsg.edit({ content: "🛑 **Sorteo finalizado forzosamente por un administrador.**", components: [] });
            message.reply("✅ Sorteo finalizado.");
        } catch (e) {
            message.reply("❌ Error al intentar finalizar el sorteo. Verifica la ID.");
        }
    }
};