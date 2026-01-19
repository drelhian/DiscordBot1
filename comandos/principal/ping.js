const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Muestra la latencia del bot y de la API',
    async execute(message, args) {
        // Creamos un mensaje inicial para calcular la latencia de respuesta
        const sent = await message.reply({ content: '🏓 Calculando latencia...', fetchReply: true });

        // Cálculo de latencias
        const botLatency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        // Definimos un color basado en la calidad de la conexión
        let color = '#00ff00'; // Verde (Bien)
        if (botLatency > 200) color = '#ffff00'; // Amarillo (Regular)
        if (botLatency > 500) color = '#ff0000'; // Rojo (Mal)

        const embed = new EmbedBuilder()
            .setTitle('🏓 ¡Pong!')
            .setColor(color)
            .addFields(
                { 
                    name: '📶 Latencia del Bot', 
                    value: `\`${botLatency}ms\``, 
                    inline: true 
                },
                { 
                    name: '🌐 Latencia API', 
                    value: `\`${apiLatency}ms\``, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Solicitado por ${message.author.tag}`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();

        // Editamos el mensaje original con el Embed final
        await sent.edit({ content: null, embeds: [embed] });
    },
};