const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const cooldowns = new Map();

module.exports = {
    name: 'migajear',
    description: 'Recibe pocas migajas de afecto para intentar armar un pan.',
    async execute(message, args) {
        const userId = message.author.id;
        const now = Date.now();
        const cooldownAmount = 10 * 60 * 1000; // 10 minutos

        // 1. SISTEMA DE COOLDOWN
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`⏳ No mendigues tan seguido. Espera **${Math.floor(timeLeft / 60)}m ${Math.floor(timeLeft % 60)}s** para volver a intentarlo.`);
            }
        }

        // 2. CARGAR BASE DE DATOS
        const dbPath = path.join(__dirname, '../../interacciones.json');
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8') || '{}');
        }

        // Inicializar datos del usuario si no existen
        if (!db[userId]) db[userId] = {};
        if (db[userId].migajas === undefined) db[userId].migajas = 0;
        if (db[userId].panes === undefined) db[userId].panes = 0;

        // 3. GENERAR POCAS MIGAJAS (De 1 a 5)
        const nuevasMigajas = Math.floor(Math.random() * 10) + 1;
        db[userId].migajas += nuevasMigajas;

        let avisoPan = "";
        // 4. LÓGICA DE CONVERSIÓN (100 migajas = 1 pan)
        if (db[userId].migajas >= 100) {
            db[userId].panes += 1;
            db[userId].migajas -= 100; // Restamos las 100 del canje
            avisoPan = `\n\n**¡INCREÍBLE!** 🎉 Has juntado suficiente miseria para hornear **1 Pan Completo** 🥖.`;
        }

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // 5. FRASES DE DESAMOR
        const frases = [
           "Te dio 'like' a una historia de hace 3 semanas. No te ilusiones, fue un error de dedo.",
            "Subió una foto con su 'mejor amigo'. Dice que no pasa nada, pero tú sabes que sí.",
            "Te contestó con un 'jajaja' después de que le mandaste un testamento de 50 líneas.",
            "Revisó tu perfil desde una cuenta secundaria. La esquizofrenia está fuerte hoy.",
            "Te mandó un mensaje por error y luego puso 'era para mi mamá'. El dolor es real.",
            "Te dijo 'te quiero' pero como amigo. Felicidades, desbloqueaste el nivel: Esclavo emocional.",
            "Te puso 'Hola' a las 3 AM porque estaba aburrida. Eres el plan Z, mi rey/reina.",
            "Viste que subió un post escuchando la canción que tú le dedicaste... pero con otro.",
            "Eres tan migajero, que las palomas te tiran las migajas a ti."
        ];
        const frase = frases[Math.floor(Math.random() * frases.length)];

        const embed = new EmbedBuilder()
            .setTitle('🍞 El Horno del Desprecio')
            .setColor('#8b4513')
            .setDescription(`> *"${frase}"*${avisoPan}`)
            .addFields(
                { name: '✨ Migajas obtenidas', value: `\`+${nuevasMigajas}\``, inline: true },
                { name: '📊 Progreso para Pan', value: `\`${db[userId].migajas}/100\``, inline: true },
                { name: '🥖 Panes totales', value: `\`${db[userId].panes}\``, inline: true }
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/1047/1047461.png')
            .setFooter({ text: 'Sigue mendigando, algún día serás una panadería.' });

        cooldowns.set(userId, now);
        setTimeout(() => cooldowns.delete(userId), cooldownAmount);

        return message.reply({ embeds: [embed] });
    },
};