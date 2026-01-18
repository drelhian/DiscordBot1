const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unban',
    description: 'Desbanea a un usuario y elimina sus registros de BAN del historial',
    async execute(message, args) {
        // 1. Verificar permisos del autor
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('❌ No tienes permisos para desbanear miembros.');
        }

        const userId = args[0];

        if (!userId) {
            return message.reply('⚠️ Debes proporcionar el ID del usuario. Ejemplo: `D!unban 123456789012345678`');
        }

        try {
            // 2. Verificar si el usuario está realmente baneado
            const bannedUsers = await message.guild.bans.fetch();
            const user = bannedUsers.get(userId);

            if (!user) {
                return message.reply('❌ Ese ID no se encuentra en la lista de baneos de este servidor.');
            }

            // 3. Ejecutar el desbaneo en Discord
            await message.guild.members.unban(userId);

            // 4. Lógica para eliminar registros de BAN en el JSON
            const warnPath = path.join(__dirname, '../../advertencias.json');
            
            if (fs.existsSync(warnPath)) {
                let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

                if (db[userId]) {
                    // Filtramos el historial para eliminar registros tipo 'BAN'
                    const historialPrevio = db[userId].historial.length;
                    db[userId].historial = db[userId].historial.filter(h => h.tipo !== 'BAN');
                    
                    const eliminados = historialPrevio - db[userId].historial.length;

                    // Guardamos los cambios en el archivo
                    fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));
                    
                    console.log(`[Historial] Se eliminaron ${eliminados} registros de baneo para la ID: ${userId}`);
                }
            }

            message.channel.send(`✅ El usuario **${user.user.tag}** ha sido desbaneado y sus registros de ban han sido limpiados.`);

        } catch (error) {
            console.error(error);
            message.reply('❌ Ocurrió un error al intentar desbanear. Asegúrate de que el ID sea correcto.');
        }
    },
};