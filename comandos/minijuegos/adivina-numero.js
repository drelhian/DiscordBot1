const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'adivina-numero',
    description: 'Intenta adivinar el número secreto (1-100) con prefijo',
    async execute(message, args) {
        const numeroSecreto = Math.floor(Math.random() * 100) + 1;
        let intentos = 5;

        const embed = new EmbedBuilder()
            .setTitle('🔢 Adivina el Número')
            .setDescription(`He pensado un número entre **1** y **100**.\n¿Puedes adivinarlo? Tienes **${intentos} intentos**.`)
            .setColor('#3498db')
            .setFooter({ text: 'Escribe el número directamente en el chat' });

        await message.reply({ embeds: [embed] });

        // Filtro para que solo responda el que activó el comando
        const filter = m => m.author.id === message.author.id;
        
        const collector = message.channel.createMessageCollector({
            filter,
            time: 60000, // 1 minuto de duración
            max: intentos
        });

        collector.on('collect', async m => {
            // Ignorar si el mensaje es el mismo comando inicial
            if (m.content.toLowerCase().includes('adivina-numero')) return;

            const suposicion = parseInt(m.content);

            if (isNaN(suposicion)) {
                return m.reply('❌ Eso no es un número válido. ¡Intenta de nuevo!');
            }

            intentos--;

            if (suposicion === numeroSecreto) {
                collector.stop('victoria');
                return m.reply(`🎉 ¡BRUTAL! Has adivinado el número **${numeroSecreto}**. ¡Eres un genio!`);
            }

            if (intentos === 0) {
                collector.stop('derrota');
                return;
            }

            const pista = suposicion < numeroSecreto ? 'MÁS ALTO ⬆️' : 'MÁS BAJO ⬇️';
            await m.reply(`Incorrecto. El número es **${pista}**. Te quedan **${intentos}** intentos.`);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'victoria') return;

            if (reason === 'derrota') {
                message.channel.send(`💀 ¡Te has quedado sin intentos! El número era el **${numeroSecreto}**.`);
            } else if (reason === 'time') {
                message.channel.send('⏰ Se acabó el tiempo del juego. ¡Inténtalo de nuevo!');
            }
        });
    },
};