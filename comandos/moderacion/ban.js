const fs = require('fs');
const path = require('path');
const ms = require('ms');

module.exports = {
    name: 'ban',
    description: 'Banea a un usuario y lo registra en el historial',
    async execute(message, args) {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('❌ No tienes permisos para banear.');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('⚠️ Menciona a alguien: `D!ban @user [tiempo] [razón]`');
        if (!member.bannable) return message.reply('❌ No puedo banear a este usuario.');

        const tiempoRaw = args[1]; 
        let tiempoMs = null;
        let razonIdx = 1;

        if (tiempoRaw) {
            const tiempoLimpio = tiempoRaw.replace('mont', 'mo'); 
            tiempoMs = ms(tiempoLimpio);
            if (tiempoMs) razonIdx = 2;
        }

        const razon = args.slice(razonIdx).join(' ') || 'No especificada';

        try {
            // 1. Aplicar el baneo en Discord
            await message.guild.members.ban(member.id, { reason: razon });

            // 2. Registro en el historial (JSON)
            const warnPath = path.join(__dirname, '../../advertencias.json');
            if (!fs.existsSync(warnPath)) fs.writeFileSync(warnPath, JSON.stringify({}));
            
            let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));
            if (!db[member.id]) db[member.id] = { warns: 0, historial: [] };

            db[member.id].historial.push({
                tipo: 'BAN',
                razon: razon,
                duracion: tiempoMs ? tiempoRaw : 'Permanente',
                fecha: new Date().toLocaleDateString(),
                moderador: message.author.tag
            });

            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            // 3. Confirmación y lógica de baneo temporal
            if (tiempoMs) {
                message.channel.send(`⏳ **${member.user.tag}** baneado por **${tiempoRaw}**. \n**Razón:** ${razon}`);
                setTimeout(async () => {
                    try {
                        await message.guild.members.unban(member.id, 'Tiempo de baneo temporal finalizado.');
                        // Opcional: Podrías eliminar el registro aquí también si quieres que sea automático
                    } catch (e) { console.log("El usuario ya no estaba baneado."); }
                }, tiempoMs);
            } else {
                message.channel.send(`🔨 **${member.user.tag}** baneado permanentemente. \n**Razón:** ${razon}`);
            }

        } catch (error) {
            console.error(error);
            message.reply('❌ No pude banear al usuario.');
        }
    },
};