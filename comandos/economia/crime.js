const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'crime',
    aliases: ['crimen', 'delito'],
    description: 'Intenta cometer un crimen para ganar mucho dinero, pero ten cuidado con la policía.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        let ecoData = {};
        if (fs.existsSync(ecoPath)) {
            ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        }

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = {
                coins: 0,
                banco: 0,
                lastDaily: 0,
                racha: 0,
                lastWork: 0,
                lastCrime: 0 
            };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        const ahora = Date.now();
        const tiempoEspera = 2 * 60 * 60 * 1000; // 2 Horas

        // 1. Verificar Cooldown
        if (ahora - (userData.lastCrime || 0) < tiempoEspera) {
            const tiempoRestante = tiempoEspera - (ahora - userData.lastCrime);
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            return message.reply(`🚨 La policía te está vigilando. Espera **${horas}h ${minutos}m** para volver a intentarlo.`);
        }

        // 2. Determinar éxito o fracaso (50/50)
        const exito = Math.random() < 0.5;

        if (exito) {
            // --- LÓGICA DE ÉXITO ---
            const ganancias = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
            const delitosExitosos = [
                "Hackeaste un cajero automático con éxito 🏧",
                "Robaste una joyería sin dejar rastro 💎",
                "Le quitaste la cartera a un político despistado 💼",
                "Vendiste información secreta en la dark web 🕶️"
            ];

            const frase = delitosExitosos[Math.floor(Math.random() * delitosExitosos.length)];
            userData.coins += ganancias;
            userData.lastCrime = ahora;

            const embedExito = new EmbedBuilder()
                .setTitle("🕶️ Crimen Exitoso")
                .setColor("#2ecc71") // Verde
                .setDescription(`${frase}\n\nGanaste: **${ganancias} coins**`)
                .setFooter({ text: "¡Te saliste con la tuya!" })
                .setTimestamp();

            message.channel.send({ embeds: [embedExito] });

        } else {
            // --- LÓGICA DE FRACASO ---
            const multa = Math.floor(Math.random() * (300 - 150 + 1)) + 150;
            const delitosFallidos = [
                "Te pillaron intentando robar una tienda de dulces 🍭",
                "La policía te detuvo por exceso de velocidad 🚔",
                "Tu plan para hackear el banco falló miserablemente 📉",
                "Intentaste robar un banco pero olvidaste las llaves del coche 🚗"
            ];

            const frase = delitosFallidos[Math.floor(Math.random() * delitosFallidos.length)];
            
            // Restar dinero (asegurándose de que no sea menor a 0)
            userData.coins = Math.max(0, userData.coins - multa);
            userData.lastCrime = ahora;

            const embedFallo = new EmbedBuilder()
                .setTitle("🚨 ¡A la cárcel!")
                .setColor("#e74c3c") // Rojo
                .setDescription(`${frase}\n\nFuiste multado con: **${multa} coins**`)
                .setFooter({ text: "La próxima vez sé más cauteloso." })
                .setTimestamp();

            message.channel.send({ embeds: [embedFallo] });
        }

        // 3. Guardar cambios
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));
    },
};