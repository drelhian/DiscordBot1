const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unwarn',
    description: 'Quita una advertencia y elimina el último registro de WARN del historial',
    async execute(message, args) {
        // 1. Verificar permisos (Staff)
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ No tienes permiso para quitar advertencias.');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('⚠️ Menciona al usuario. Ejemplo: `D!unwarn @usuario`');

        const warnPath = path.join(__dirname, '../../advertencias.json');
        
        if (!fs.existsSync(warnPath)) return message.reply('📂 No hay registros de advertencias.');

        let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

        // 2. Verificar si el usuario tiene advertencias registradas
        if (db[member.id] && db[member.id].warns > 0) {
            
            // Restamos del contador simple
            db[member.id].warns -= 1;
            db[member.id].razones.pop(); // Elimina la última razón del array simple

            // 3. Lógica para el historial detallado
            // Buscamos el índice del ÚLTIMO 'WARN' para borrarlo específicamente
            const lastWarnIndex = db[member.id].historial.map(h => h.tipo).lastIndexOf('WARN');
            
            if (lastWarnIndex !== -1) {
                db[member.id].historial.splice(lastWarnIndex, 1);
            }

            // 4. Guardar cambios
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            message.reply(`✅ Se ha retirado una advertencia a **${member.user.tag}**.\n**Total actual:** ${db[member.id].warns}/10`);
            
        } else {
            message.reply('❌ El usuario no tiene advertencias activas en su historial.');
        }
    }
};