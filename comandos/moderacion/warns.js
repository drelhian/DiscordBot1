const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'warns',
    description: 'Muestra las advertencias de un usuario',
    async execute(message, args) {
        const member = message.mentions.members.first() || message.member;
        const warnPath = path.join(__dirname, '../../advertencias.json');
        let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

        if (!db[member.id] || db[member.id].warns === 0) {
            return message.reply(`✅ **${member.user.tag}** no tiene advertencias.`);
        }

        message.reply(`👤 **${member.user.tag}** tiene **${db[member.id].warns}** advertencias.\n**Última razón:** ${db[member.id].razones.slice(-1)}`);
    }
};