const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const cooldowns = new Map();

module.exports = {
    name: 'carisma',
    description: 'Dale puntos de carisma a un usuario que te caiga bien.',
    async execute(message, args) {
        const giverId = message.author.id;
        const target = message.mentions.users.first();
        const now = Date.now();
        const cooldownAmount = 24 * 60 * 60 * 1000; // 24 horas

        // 1. Validaciones iniciales
        if (!target) return message.reply('✨ Menciona a la persona a la que quieres darle carisma.');
        if (target.id === giverId) return message.reply('😂 No puedes darte carisma a ti mismo, ¡eso es trampa!');
        if (target.bot) return message.reply('🤖 Los bots ya somos perfectos, no necesitamos carisma.');

        // 2. Verificación del Cooldown (el que DA el carisma debe esperar)
        if (cooldowns.has(giverId)) {
            const expirationTime = cooldowns.get(giverId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = expirationTime - now;
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                return message.reply(`⏳ Ya repartiste carisma hoy. Podrás dar más en **${hours}h ${minutes}m**.`);
            }
        }

        // 3. Cargar y Guardar en Base de Datos
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializar datos del receptor
        if (!db[target.id]) db[target.id] = {};
        if (db[target.id].carisma === undefined) db[target.id].carisma = 0;

        // Generar puntos aleatorios para regalar (Ej: de 5 a 15)
        const carismaRegalado = Math.floor(Math.random() * 1) + 1;
        db[target.id].carisma += carismaRegalado;

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // 4. Respuesta
        const embed = new EmbedBuilder()
            .setTitle('✨ Carisma Entregado')
            .setColor('#ffd700') // Dorado
            .setDescription(`**${message.author.username}** ha reconocido el aura de **${target.username}** y le ha otorgado carisma.`)
            .addFields(
                { name: '⭐ Puntos otorgados', value: `\`+${carismaRegalado}\``, inline: true },
                { name: '📈 Carisma total de él/ella', value: `\`${db[target.id].carisma}\``, inline: true }
            )
            .setThumbnail(target.displayAvatarURL())
            .setFooter({ text: 'Solo puedes dar carisma una vez cada 24 horas.' });

        // Registrar cooldown para el autor
        cooldowns.set(giverId, now);
        setTimeout(() => cooldowns.delete(giverId), cooldownAmount);

        return message.reply({ embeds: [embed] });
    },
};