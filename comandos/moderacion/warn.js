const fs = require('fs');
const path = require('path');
const ms = require('ms');

module.exports = {
    name: 'warn',
    description: 'Advierte a un usuario con protecciones de jerarquía y administración',
    async execute(message, args) {
        // 1. Verificación de permisos del moderador
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ No tienes permiso para usar este comando.');
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('⚠️ Menciona a alguien para advertir.');
        
        // --- PROTECCIONES DE SEGURIDAD ---

        // A. Evitar auto-advertencias
        if (member.id === message.author.id) return message.reply('❌ No puedes advertirte a ti mismo.');

        // B. Protección de Dueño y Administradores
        // Si el objetivo es el dueño o tiene el permiso de Administrador, no se puede advertir
        if (member.id === message.guild.ownerId || member.permissions.has('Administrator')) {
            return message.reply('❌ No puedes advertir a un Administrador o al Dueño del servidor.');
        }

        // C. Verificación de Jerarquía de Roles
        // message.guild.members.me es el bot. Comprobamos si el rol más alto del bot es menor o igual al del objetivo
        if (message.guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return message.reply('❌ No puedo advertir a este usuario porque su rol es igual o superior al mío.');
        }

        // ----------------------------------

        const razon = args.slice(1).join(' ') || 'No especificada';
        const warnPath = path.join(__dirname, '../../advertencias.json');
        
        try {

            // Dentro del try de warn.js
const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const modLogId = config[message.guild.id]?.logMod;
const modChannel = message.guild.channels.cache.get(modLogId);

if (modChannel) {
    const logEmbed = new EmbedBuilder()
        .setTitle('⚠️ Registro de Advertencia')
        .setColor('#f1c40f')
        .addFields(
            { name: 'Usuario', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
            { name: 'Moderador', value: `${message.author.tag}`, inline: true },
            { name: 'Razón', value: razon },
            { name: 'Total de Warns', value: `${totalWarns}/10` }
        )
        .setTimestamp();
    modChannel.send({ embeds: [logEmbed] });
}

            // 2. Leer o crear base de datos con manejo de errores de JSON
            if (!fs.existsSync(warnPath) || fs.readFileSync(warnPath, 'utf-8').trim() === "") {
                fs.writeFileSync(warnPath, JSON.stringify({}, null, 2));
            }
            
            let db = JSON.parse(fs.readFileSync(warnPath, 'utf-8'));

            if (!db[member.id]) {
                db[member.id] = { warns: 0, razones: [], historial: [] };
            }

            // 3. Actualizar contadores e Historial
            db[member.id].warns += 1;
            db[member.id].razones.push(razon);
            
            db[member.id].historial.push({
                tipo: 'WARN',
                razon: razon,
                fecha: new Date().toLocaleDateString(),
                moderador: message.author.tag
            });

            const totalWarns = db[member.id].warns;
            let castigoMsg = '';

            // 4. Lógica de Castigos Automáticos
            if (totalWarns === 4) {
                await member.timeout(ms('4m'), 'Llegó a 4 advertencias');
                castigoMsg = '\n➡️ **Castigo:** Aislamiento de 4 minutos.';
                db[member.id].historial.push({ tipo: 'MUTE (AUTO)', razon: '4 advertencias', fecha: new Date().toLocaleDateString(), moderador: 'Sistema' });
            } 
            else if (totalWarns === 8) {
                await member.timeout(ms('10d'), 'Llegó a 8 advertencias');
                castigoMsg = '\n➡️ **Castigo:** Aislamiento de 10 días.';
                db[member.id].historial.push({ tipo: 'MUTE (AUTO)', razon: '8 advertencias', fecha: new Date().toLocaleDateString(), moderador: 'Sistema' });
            } 
            else if (totalWarns >= 10) {
                await message.guild.members.ban(member.id, { reason: 'Límite de 10 advertencias' });
                castigoMsg = '\n➡️ **Castigo:** Baneo por 30 días.';
                setTimeout(() => message.guild.members.unban(member.id).catch(() => {}), ms('30d'));
                delete db[member.id]; 
            }

            // 5. Guardar cambios
            fs.writeFileSync(warnPath, JSON.stringify(db, null, 2));

            message.channel.send(`⚠️ **${member.user.tag}** ha sido advertido. \n**Total:** ${totalWarns}/10 \n**Razón:** ${razon} ${castigoMsg}`);

        } catch (error) {
            console.error('Error en comando warn:', error);
            message.reply('❌ Hubo un error al procesar el comando. Verifica que el archivo JSON no esté corrupto.');
        }
    },
};