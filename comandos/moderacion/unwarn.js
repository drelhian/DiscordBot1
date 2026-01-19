const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'unwarn',
    description: 'Quita una advertencia y elimina el rol de Sancionado si baja de 5',
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
            
            // Restamos del contador
            db[member.id].warns -= 1;
            
            // Compatibilidad con tu estructura anterior (si usas array de razones)
            if (db[member.id].razones) {
                db[member.id].razones.pop();
            }

            // 3. Lógica para el historial detallado
            const lastWarnIndex = db[member.id].historial.map(h => h.tipo).lastIndexOf('WARN');
            if (lastWarnIndex !== -1) {
                db[member.id].historial.splice(lastWarnIndex, 1);
            }

            const totalActual = db[member.id].warns;
            let avisoRol = '';

            // --- LÓGICA DE LIMPIEZA DE BLACKLIST ---
            // Si el usuario ahora tiene menos de 5 warns, le quitamos el rol de Sancionado
            if (totalActual < 5) {
                const sancionadoRole = message.guild.roles.cache.find(r => r.name === 'Sancionado');
                if (sancionadoRole && member.roles.cache.has(sancionadoRole.id)) {
                    try {
                        await member.roles.remove(sancionadoRole);
                        avisoRol = '\n✅ **Blacklist removida:** El usuario ya puede volver a participar en sorteos.';
                    } catch (e) {
                        avisoRol = '\n⚠️ No pude quitar el rol de Sancionado automáticamente (revisa mis permisos).';
                    }
                }
            }

            // 4. Guardar cambios
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            message.reply(`✅ Se ha retirado una advertencia a **${member.user.tag}**.\n**Total actual:** ${totalActual}/10${avisoRol}`);
            
        } else {
            message.reply('❌ El usuario no tiene advertencias activas en su historial.');
        }
    }
};