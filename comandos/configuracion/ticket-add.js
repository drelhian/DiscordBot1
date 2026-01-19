const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticket-add',
    description: 'Añade a un usuario específico a este ticket.',
    async execute(message, args) {
        // 1. Verificar si el canal es un ticket (por el nombre)
        if (!message.channel.name.startsWith('ticket-')) {
            return message.reply('❌ Este comando solo puede usarse dentro de un canal de ticket.');
        }

        // 2. Verificar permisos del que usa el comando (Staff o Admin)
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ No tienes permisos para añadir personas al ticket.');
        }

        // 3. Obtener el ID del usuario (puede ser mención o ID puro)
        const targetId = args[0]?.replace(/[<@!>]/g, '');
        if (!targetId) {
            return message.reply('⚠️ Debes proporcionar el ID o la mención del usuario. Uso: `D!ticket-add [ID]`');
        }

        try {
            const targetMember = await message.guild.members.fetch(targetId);
            
            // 4. Actualizar permisos del canal para el nuevo usuario
            await message.channel.permissionOverwrites.edit(targetMember.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            const embed = new EmbedBuilder()
                .setTitle('👤 Usuario Añadido')
                .setDescription(`El usuario ${targetMember} ha sido invitado al ticket por ${message.author}.`)
                .setColor('#3498db')
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ No pude encontrar a ese usuario en este servidor o el ID es inválido.');
        }
    }
};