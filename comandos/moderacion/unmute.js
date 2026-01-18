const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unmute',
    description: 'Quita el aislamiento y elimina los registros de MUTE del historial',
    async execute(message, args) {
        // 1. Verificar permisos
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('❌ No tienes permiso para quitar el aislamiento de miembros.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('⚠️ Debes mencionar a un usuario. Ejemplo: `D!unmute @usuario`');
        }

        // 2. Verificar si el usuario está aislado en Discord
        if (!member.communicationDisabledUntilTimestamp) {
            return message.reply(`El usuario **${member.user.tag}** no está aislado actualmente.`);
        }

        try {
            // 3. Quitar el timeout en Discord
            await member.timeout(null);

            // 4. Lógica para eliminar registros del JSON
            const warnPath = path.join(__dirname, '../../advertencias.json');
            
            if (fs.existsSync(warnPath)) {
                let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

                if (db[member.id]) {
                    // Filtramos el historial: mantenemos todo lo que NO sea tipo 'MUTE'
                    const historialOriginal = db[member.id].historial.length;
                    db[member.id].historial = db[member.id].historial.filter(h => h.tipo !== 'MUTE');
                    
                    const registrosBorrados = historialOriginal - db[member.id].historial.length;

                    // Guardamos los cambios
                    fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));
                    
                    console.log(`Se eliminaron ${registrosBorrados} registros de mute para ${member.id}`);
                }
            }
            
            message.channel.send(`🔊 **${member.user.tag}** ya no está aislado y sus registros de silencio han sido eliminados del historial.`);

        } catch (error) {
            console.error(error);
            message.reply('❌ Hubo un error al intentar quitar el aislamiento.');
        }
    },
};