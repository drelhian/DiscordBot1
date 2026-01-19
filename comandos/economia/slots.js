const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'slots',
    aliases: ['tragamonedas', 'apostar'],
    description: 'Prueba tu suerte en la máquina tragaperras',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        // 1. Validar la apuesta
        const apuesta = parseInt(args[0]);
        if (!apuesta || isNaN(apuesta) || apuesta <= 0) {
            return message.reply('⚠️ Debes ingresar una cantidad válida para apostar. Ejemplo: `D!slots 100`');
        }

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        const userData = ecoData[message.guild.id][message.author.id] || { coins: 0, banco: 0 };

        if (userData.coins < apuesta) {
            return message.reply(`❌ No tienes suficientes coins en tu cartera. Tienes: \`${userData.coins}\``);
        }

        // 2. Configuración de la máquina
        const slots = ['🍎', '🍇', '🍒', '🍋', '💎'];
        const res1 = slots[Math.floor(Math.random() * slots.length)];
        const res2 = slots[Math.floor(Math.random() * slots.length)];
        const res3 = slots[Math.floor(Math.random() * slots.length)];

        let multiplicador = 0;
        let resultadoTexto = "";

        // 3. Lógica de premios
        if (res1 === res2 && res2 === res3) {
            // TRES IGUALES
            multiplicador = (res1 === '💎') ? 10 : 5;
            resultadoTexto = `¡BRUTAL! Ganaste con el multiplicador x${multiplicador} 🎉`;
        } else if (res1 === res2 || res1 === res3 || res2 === res3) {
            // DOS IGUALES
            multiplicador = 1.5;
            resultadoTexto = "¡No está mal! Ganaste un poco de dinero ✨";
        } else {
            // NINGUNO IGUAL
            multiplicador = 0;
            resultadoTexto = "Mala suerte, lo perdiste todo 💀";
        }

        // 4. Calcular ganancias y actualizar
        const ganancias = Math.floor(apuesta * multiplicador);
        
        if (multiplicador > 0) {
            userData.coins += (ganancias - apuesta); // Sumamos lo ganado menos lo que ya puso
        } else {
            userData.coins -= apuesta;
        }

        // 5. Guardar y Responder
        ecoData[message.guild.id][message.author.id] = userData;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🎰 Máquina Tragaperras')
            .setColor(multiplicador > 0 ? '#f1c40f' : '#e74c3c')
            .setDescription(`
                **[ ${res1} | ${res2} | ${res3} ]**
                
                ${resultadoTexto}
            `)
            .addFields(
                { name: 'Apuesta', value: `\`${apuesta}\` coins`, inline: true },
                { name: 'Resultado', value: `\`${ganancias}\` coins`, inline: true }
            )
            .setFooter({ text: `Cartera actual: ${userData.coins} coins` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};