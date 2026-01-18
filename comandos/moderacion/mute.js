const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'mute',
    description: 'Aísla a un usuario temporalmente y registra en el historial',
    async execute(message, args) {
        // 1. Verificación de permisos
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('❌ No tienes permiso para aislar miembros.');
        }

        const member = message.mentions.members.first();
        const tiempoMinutos = parseInt(args[1]);
        // Definimos la razón (todo lo que escribas después del tiempo)
        const razon = args.slice(2).join(' ') || 'No especificada';

        if (!member || isNaN(tiempoMinutos)) {
            return message.reply('⚠️ Uso: `D!mute @usuario [minutos] [razón opcional]`');
        }

        try {
            // 2. Aplicar el aislamiento en Discord
            await member.timeout(tiempoMinutos * 60 * 1000, razon);

            // 3. Registro en la base de datos (advertencias.json)
            const warnPath = path.join(__dirname, '../../advertencias.json');
            
            // Si el archivo no existe, creamos un objeto vacío
            if (!fs.existsSync(warnPath)) {
                fs.writeFileSync(warnPath, JSON.stringify({}));
            }

            let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

            // Si el usuario no existe en la DB, lo creamos
            if (!db[member.id]) {
                db[member.id] = { warns: 0, historial: [] };
            }

            // Agregamos el evento al historial
            db[member.id].historial.push({
                tipo: 'MUTE',
                razon: razon,
                tiempo: `${tiempoMinutos}m`,
                fecha: new Date().toLocaleDateString(),
                moderador: message.author.tag
            });

            // Guardamos los cambios
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            message.channel.send(`🤫 **${member.user.tag}** ha sido aislado por **${tiempoMinutos}** minuto(s).\n**Motivo:** ${razon}`);

        } catch (error) {
            console.error(error);
            message.reply('❌ No pude aplicar el aislamiento. Revisa mis permisos o jerarquía de roles.');
        }
    },
};