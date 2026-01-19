const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'clearwarns',
    description: 'Elimina por completo el expediente y remueve la blacklist de sorteos',
    async execute(message, args) {
        // 1. Verificación de permisos (Staff)
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ No tienes permiso para limpiar el historial de moderación.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('⚠️ Menciona al usuario. Ejemplo: `D!clearwarns @usuario`');
        }

        const warnPath = path.join(__dirname, '../../advertencias.json');
        
        if (!fs.existsSync(warnPath)) {
            return message.reply('📂 No hay registros de moderación creados todavía.');
        }

        let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

        // 2. Verificar si el usuario existe en la base de datos
        if (!db[member.id]) {
            return message.reply(`✅ **${member.user.tag}** no tiene ningún registro en el sistema.`);
        }

        // --- LÓGICA DE LIMPIEZA DE ROL (Blacklist) ---
        // Como eliminamos todo el historial, por lógica ya no debe estar sancionado
        const sancionadoRole = message.guild.roles.cache.find(r => r.name === 'Sancionado');
        if (sancionadoRole && member.roles.cache.has(sancionadoRole.id)) {
            try {
                await member.roles.remove(sancionadoRole);
            } catch (e) {
                console.log("No pude quitar el rol de Sancionado en clearwarns.");
            }
        }

        // 3. Eliminar la entrada completa del ID
        delete db[member.id]; 

        try {
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));
            message.channel.send(`🧹 **Limpieza total completada.** Se han borrado todos los avisos y se ha restaurado el acceso a sorteos para **${member.user.tag}**.`);
        } catch (error) {
            console.error(error);
            message.reply('❌ Hubo un error al intentar actualizar la base de datos.');
        }
    },
};