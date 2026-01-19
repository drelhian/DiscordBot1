const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor y lo registra en el historial',
    async execute(message, args) {
        // 1. Verificación de permisos
        if (!message.member.permissions.has('KickMembers')) {
            return message.reply('❌ No tienes permisos para expulsar miembros.');
        }

        const member = message.mentions.members.first();
        // Definimos la razón (todo el texto después de la mención)
        const razon = args.slice(1).join(' ') || 'No especificada';

        if (!member) return message.reply('⚠️ Debes mencionar a alguien para expulsar.');
        if (!member.kickable) return message.reply('❌ No puedo expulsar a este usuario (rol superior o es admin).');

        try {
            // 2. Registro en la base de datos (advertencias.json)
            const warnPath = path.join(__dirname, '../../advertencias.json');
            
            if (!fs.existsSync(warnPath)) {
                fs.writeFileSync(warnPath, JSON.stringify({}));
            }

            let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

            if (!db[member.id]) {
                db[member.id] = { warns: 0, historial: [] };
            }

            // Agregamos la expulsión al historial
            db[member.id].historial.push({
                tipo: 'KICK',
                razon: razon,
                fecha: new Date().toLocaleDateString(),
                moderador: message.author.tag
            });

            // Guardamos los cambios en el archivo
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            // 3. Ejecutar la expulsión en Discord
            await member.kick(razon);
            
            message.channel.send(`✅ **${member.user.tag}** fue expulsado con éxito.\n**Razón:** ${razon}`);

        } catch (error) {
            console.error(error);
            message.reply('❌ Ocurrió un error al intentar expulsar al usuario.');
        }
    },
};