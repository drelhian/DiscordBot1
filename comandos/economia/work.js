const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'work',
    aliases: ['trabajar'],
    description: 'Trabaja un rato para ganar algunas monedas',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        
        // 1. Cargar base de datos
        let ecoData = {};
        if (fs.existsSync(ecoPath)) {
            ecoData = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
        }

        // Inicializar servidor y usuario si no existen
        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        if (!ecoData[message.guild.id][message.author.id]) {
            ecoData[message.guild.id][message.author.id] = {
                coins: 0,
                banco: 0,
                lastDaily: 0,
                racha: 0,
                lastWork: 0 
            };
        }

        const userData = ecoData[message.guild.id][message.author.id];
        const ahora = Date.now();
        const tiempoEspera = 60 * 60 * 1000; // 1 Hora

        // 2. Verificar Cooldown (Solo de trabajo)
        if (ahora - (userData.lastWork || 0) < tiempoEspera) {
            const tiempoRestante = tiempoEspera - (ahora - userData.lastWork);
            const minutos = Math.floor(tiempoRestante / (1000 * 60));
            const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
            return message.reply(`⏳ Estás agotado. Podrás volver a trabajar en **${minutos}m ${segundos}s**.`);
        }

        // 3. Lista de trabajos
        const trabajos = [
            "Ayudaste a cargar cajas en el muelle ⚓",
            "Limpiaste los establos del servidor 🐎",
            "Trabajaste como cajero en el supermercado 🛒",
            "Reparaste unos cables sueltos en la oficina 🔧",
            "Recogiste basura en el parque local 🌳",
            "Hiciste de guardia de seguridad nocturno 🔦",
            "Ayudaste a un anciano a cruzar la calle y te dio propina 👵",
            "Lavaste los platos en un restaurante de lujo 🍽️"
        ];

        const fraseElegida = trabajos[Math.floor(Math.random() * trabajos.length)];
        const pago = Math.floor(Math.random() * (200 - 50 + 1)) + 50; // Entre 50 y 200 coins

        // 4. Actualizar solo monedas y tiempo de trabajo
        userData.coins += pago;
        userData.lastWork = ahora;

        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        // 5. Enviar respuesta
        const embed = new EmbedBuilder()
            .setTitle("⚒️ Turno de Trabajo Terminado")
            .setColor("#3498db")
            .setDescription(`${fraseElegida}\n\nGanaste: **${pago} coins**`)
            .addFields({ name: '💰 Cartera actual', value: `\`${userData.coins}\` coins` })
            .setFooter({ text: `Vuelve en 1 hora para trabajar de nuevo` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};