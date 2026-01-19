module.exports = {
    name: 'softban',
    description: 'Banea y desbanea para borrar mensajes de los últimos 7 días',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('❌ No tienes permiso para realizar un softban.');
        }

        const member = message.mentions.members.first();
        const razon = args.slice(1).join(' ') || 'Softban (Limpieza de mensajes)';

        if (!member) return message.reply('⚠️ Menciona a quién quieres aplicar el softban.');
        if (!member.bannable) return message.reply('❌ No puedo banear a este usuario.');

        try {
            // Baneamos borrando mensajes de los últimos 7 días (deleteMessageSeconds: 604800)
            await message.guild.members.ban(member.id, { 
                deleteMessageSeconds: 7 * 24 * 60 * 60, 
                reason: razon 
            });

            // Desbaneamos inmediatamente
            await message.guild.members.unban(member.id, 'Softban completado');

            message.channel.send(`🧼 **${member.user.tag}** ha recibido un softban. Mensajes de los últimos 7 días eliminados.`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Error al ejecutar el softban.');
        }
    },
};