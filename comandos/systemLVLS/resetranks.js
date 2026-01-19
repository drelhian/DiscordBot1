const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'resetranks',
    description: 'Reinicia el nivel y mensajes de un usuario (Solo Admin)',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes permisos para reiniciar niveles.');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('⚠️ Menciona al usuario que deseas reiniciar.');

        const nivelesPath = path.join(__dirname, '../../niveles.json');
        if (!fs.existsSync(nivelesPath)) return message.reply('📂 No hay datos registrados.');

        let niveles = JSON.parse(fs.readFileSync(nivelesPath, 'utf-8'));

        if (niveles[message.guild.id] && niveles[message.guild.id][target.id]) {
            // Eliminamos sus datos de este servidor
            delete niveles[message.guild.id][target.id];
            fs.writeFileSync(nivelesPath, JSON.stringify(niveles, null, 2));
            
            return message.reply(`🧹 El progreso de **${target.user.tag}** ha sido reiniciado por completo.`);
        } else {
            return message.reply('❌ Este usuario no tiene datos guardados.');
        }
    }
};